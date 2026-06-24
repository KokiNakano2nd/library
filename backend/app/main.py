import logging
from contextlib import asynccontextmanager
from time import perf_counter

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.errors import AppError
from app.observability import (
    REQUEST_ID_HEADER,
    assign_request_id,
    attach_request_id_header,
    configure_logging,
    get_request_id,
    log_event,
    log_request_completed,
)
from app.routers import admin_router, audit_logs_router, auth_router, books_router
from app.schemas.error import ErrorResponse


@asynccontextmanager
async def lifespan(_: FastAPI):
    configure_logging()
    yield


app = FastAPI(title="Library API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3011",
        "http://127.0.0.1:3011",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(books_router)
app.include_router(admin_router)
app.include_router(audit_logs_router)
app.include_router(auth_router)


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    request_id = assign_request_id(request)
    started_at = perf_counter()
    response = await call_next(request)
    attach_request_id_header(response, request_id)
    log_request_completed(request, response, started_at)
    return response


def create_error_response(
    *,
    request: Request,
    status_code: int,
    detail: str,
    error_code: str,
    errors: list[dict[str, object]] | None = None,
) -> JSONResponse:
    request_id = get_request_id(request)
    payload = ErrorResponse(
        detail=detail,
        error_code=error_code,
        request_id=request_id,
        errors=errors,
    )
    return JSONResponse(
        status_code=status_code,
        content=payload.model_dump(exclude_none=True),
        headers={REQUEST_ID_HEADER: request_id},
    )


def map_http_error_code(status_code: int) -> str:
    if status_code == 401:
        return "authentication_required"
    if status_code == 403:
        return "forbidden"
    if status_code == 404:
        return "not_found"
    if status_code == 405:
        return "method_not_allowed"
    return f"http_{status_code}"


@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    log_event(
        logging.WARNING,
        "request.handled_error",
        request_id=get_request_id(request),
        method=request.method,
        path=request.url.path,
        status_code=exc.status_code,
        error_code=exc.error_code,
        detail=exc.detail,
    )
    return create_error_response(
        request=request,
        status_code=exc.status_code,
        detail=exc.detail,
        error_code=exc.error_code,
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(
    request: Request,
    exc: StarletteHTTPException,
) -> JSONResponse:
    detail = (
        exc.detail if isinstance(exc.detail, str) else "リクエストの処理に失敗しました"
    )
    error_code = map_http_error_code(exc.status_code)
    log_event(
        logging.WARNING,
        "request.http_exception",
        request_id=get_request_id(request),
        method=request.method,
        path=request.url.path,
        status_code=exc.status_code,
        error_code=error_code,
        detail=detail,
    )
    return create_error_response(
        request=request,
        status_code=exc.status_code,
        detail=detail,
        error_code=error_code,
    )


@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    validation_errors = jsonable_encoder(exc.errors())
    log_event(
        logging.WARNING,
        "request.validation_failed",
        request_id=get_request_id(request),
        method=request.method,
        path=request.url.path,
        status_code=422,
        error_code="validation_error",
        errors=validation_errors,
    )
    return create_error_response(
        request=request,
        status_code=422,
        detail="入力内容を確認してください",
        error_code="validation_error",
        errors=validation_errors,
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(
    request: Request,
    exc: Exception,
) -> JSONResponse:
    log_event(
        logging.ERROR,
        "request.unhandled_exception",
        request_id=get_request_id(request),
        method=request.method,
        path=request.url.path,
        status_code=500,
        error_code="internal_server_error",
        exception_type=type(exc).__name__,
        message=str(exc),
    )
    return create_error_response(
        request=request,
        status_code=500,
        detail="サーバー内部でエラーが発生しました",
        error_code="internal_server_error",
    )


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
