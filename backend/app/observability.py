import json
import logging
from datetime import UTC, datetime
from time import perf_counter
from uuid import uuid4

from fastapi import Request, Response

LOGGER_NAME = "library.api"
REQUEST_ID_HEADER = "X-Request-ID"


def configure_logging() -> None:
    root_logger = logging.getLogger()
    if not root_logger.handlers:
        logging.basicConfig(level=logging.INFO, format="%(message)s")
    else:
        root_logger.setLevel(logging.INFO)


def assign_request_id(request: Request) -> str:
    request_id = request.headers.get(REQUEST_ID_HEADER)
    if request_id is None or request_id.strip() == "":
        request_id = uuid4().hex
    request.state.request_id = request_id
    return request_id


def get_request_id(request: Request) -> str:
    request_id = getattr(request.state, "request_id", None)
    if isinstance(request_id, str) and request_id.strip() != "":
        return request_id
    return "unknown"


def attach_request_id_header(response: Response, request_id: str) -> None:
    response.headers[REQUEST_ID_HEADER] = request_id


def log_request_completed(
    request: Request,
    response: Response,
    started_at: float,
) -> None:
    duration_ms = round((perf_counter() - started_at) * 1000, 2)
    log_event(
        logging.INFO,
        "request.completed",
        request_id=get_request_id(request),
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
        duration_ms=duration_ms,
        client_ip=request.client.host if request.client is not None else None,
    )


def log_event(level: int, event: str, **fields: object) -> None:
    payload = {
        "timestamp": datetime.now(UTC).isoformat(),
        "level": logging.getLevelName(level),
        "event": event,
        **fields,
    }
    logging.getLogger(LOGGER_NAME).log(
        level,
        json.dumps(payload, ensure_ascii=False, default=str),
    )
