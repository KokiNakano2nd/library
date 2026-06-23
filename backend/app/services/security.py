from base64 import urlsafe_b64decode, urlsafe_b64encode
from hashlib import scrypt
from hmac import compare_digest
from secrets import token_bytes

SCRYPT_PREFIX = "scrypt"
SCRYPT_N = 2**14
SCRYPT_R = 8
SCRYPT_P = 1
SCRYPT_DKLEN = 64
SALT_BYTES = 16


def hash_password(password: str) -> str:
    salt = token_bytes(SALT_BYTES)
    derived_key = scrypt(
        password.encode("utf-8"),
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
        password.encode("utf-8"),
        salt=salt,
        n=int(n_value),
        r=int(r_value),
        p=int(p_value),
        dklen=len(expected_key),
    )
    return compare_digest(derived_key, expected_key)
