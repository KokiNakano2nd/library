from base64 import urlsafe_b64decode, urlsafe_b64encode
from hashlib import scrypt, sha256
from hmac import compare_digest, new
from json import dumps, loads
from os import getenv
from secrets import token_bytes
from time import time

PASSWORD_ENCODING = "utf-8"
TOKEN_ALGORITHM = "HS256"
TOKEN_TYPE = "JWT"
TOKEN_EXPIRATION_SECONDS = 60 * 30
DEFAULT_AUTH_SECRET = "step25-local-development-secret"

SCRYPT_PREFIX = "scrypt"
SCRYPT_N = 2**14
SCRYPT_R = 8
SCRYPT_P = 1
SCRYPT_DKLEN = 64
SALT_BYTES = 16


def hash_password(password: str) -> str:
    salt = token_bytes(SALT_BYTES)
    derived_key = scrypt(
        password.encode(PASSWORD_ENCODING),
        salt=salt,
        n=SCRYPT_N,
        r=SCRYPT_R,
        p=SCRYPT_P,
        dklen=SCRYPT_DKLEN,
    )
    encoded_salt = urlsafe_b64encode(salt).decode("ascii")
    encoded_key = urlsafe_b64encode(derived_key).decode("ascii")
    return (
        f"{SCRYPT_PREFIX}${SCRYPT_N}${SCRYPT_R}${SCRYPT_P}${encoded_salt}${encoded_key}"
    )


def verify_password(password: str, password_hash: str) -> bool:
    algorithm, n_value, r_value, p_value, encoded_salt, encoded_key = (
        password_hash.split("$")
    )

    if algorithm != SCRYPT_PREFIX:
        raise ValueError("Unsupported password hash algorithm")

    salt = urlsafe_b64decode(encoded_salt.encode("ascii"))
    expected_key = urlsafe_b64decode(encoded_key.encode("ascii"))
    derived_key = scrypt(
        password.encode(PASSWORD_ENCODING),
        salt=salt,
        n=int(n_value),
        r=int(r_value),
        p=int(p_value),
        dklen=len(expected_key),
    )
    return compare_digest(derived_key, expected_key)


def create_access_token(user_id: int, email: str, role: str) -> tuple[str, int]:
    issued_at = int(time())
    expires_at = issued_at + TOKEN_EXPIRATION_SECONDS
    header = {
        "alg": TOKEN_ALGORITHM,
        "typ": TOKEN_TYPE,
    }
    payload = {
        "sub": str(user_id),
        "email": email,
        "role": role,
        "iat": issued_at,
        "exp": expires_at,
    }
    encoded_header = _encode_token_part(header)
    encoded_payload = _encode_token_part(payload)
    signing_input = f"{encoded_header}.{encoded_payload}"
    signature = _sign_token(signing_input)
    token = f"{signing_input}.{signature}"
    return token, expires_at


def decode_access_token(token: str) -> dict[str, object]:
    try:
        encoded_header, encoded_payload, encoded_signature = token.split(".")
    except ValueError as error:
        raise ValueError("Token format is invalid") from error

    signing_input = f"{encoded_header}.{encoded_payload}"
    expected_signature = _sign_token(signing_input)

    if not compare_digest(encoded_signature, expected_signature):
        raise ValueError("Token signature is invalid")

    header = _decode_token_part(encoded_header)
    if header.get("alg") != TOKEN_ALGORITHM or header.get("typ") != TOKEN_TYPE:
        raise ValueError("Token header is invalid")

    payload = _decode_token_part(encoded_payload)
    expires_at = payload.get("exp")
    if not isinstance(expires_at, int):
        raise ValueError("Token expiration is invalid")

    if expires_at <= int(time()):
        raise ValueError("Token expired")

    return payload


def _encode_token_part(payload: dict[str, object]) -> str:
    encoded = dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    return urlsafe_b64encode(encoded).decode("ascii").rstrip("=")


def _decode_token_part(encoded_part: str) -> dict[str, object]:
    padding = "=" * (-len(encoded_part) % 4)
    decoded_bytes = urlsafe_b64decode(f"{encoded_part}{padding}".encode("ascii"))
    decoded_payload = loads(decoded_bytes.decode("utf-8"))
    if not isinstance(decoded_payload, dict):
        raise ValueError("Token payload is invalid")
    return decoded_payload


def _sign_token(signing_input: str) -> str:
    signature = new(
        get_auth_secret().encode(PASSWORD_ENCODING),
        signing_input.encode(PASSWORD_ENCODING),
        sha256,
    ).digest()
    return urlsafe_b64encode(signature).decode("ascii").rstrip("=")


def get_auth_secret() -> str:
    return getenv("AUTH_SECRET_KEY", DEFAULT_AUTH_SECRET)
