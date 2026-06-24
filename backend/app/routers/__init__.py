from app.routers.admin import router as admin_router
from app.routers.audit_logs import router as audit_logs_router
from app.routers.auth import router as auth_router
from app.routers.books import router as books_router

__all__ = ["admin_router", "audit_logs_router", "auth_router", "books_router"]
