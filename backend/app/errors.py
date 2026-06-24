from fastapi import status


class AppError(Exception):
    def __init__(
        self,
        *,
        status_code: int,
        detail: str,
        error_code: str,
    ) -> None:
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail
        self.error_code = error_code


class AuthenticationRequiredError(AppError):
    def __init__(
        self,
        detail: str = "認証が必要です",
        error_code: str = "authentication_required",
    ) -> None:
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            error_code=error_code,
        )


class AuthorizationError(AppError):
    def __init__(
        self,
        detail: str = "この操作は管理者だけが実行できます",
        error_code: str = "admin_role_required",
    ) -> None:
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            error_code=error_code,
        )


class ResourceNotFoundError(AppError):
    def __init__(self, detail: str, error_code: str) -> None:
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
            error_code=error_code,
        )


class ConflictError(AppError):
    def __init__(self, detail: str, error_code: str) -> None:
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
            error_code=error_code,
        )
