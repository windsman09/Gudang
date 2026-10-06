from fastapi import Depends, HTTPException

from app.core.dependencies import get_current_user


# =========================================================
# SUPERUSER
# =========================================================
def require_superuser(
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "superuser":
        raise HTTPException(
            status_code=403,
            detail="Hanya Super User yang dapat melakukan aksi ini"
        )

    return current_user


# =========================================================
# ADMIN + SUPERUSER
# =========================================================
def require_admin(
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") not in [
        "superuser",
        "admin"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Akses khusus Admin"
        )

    return current_user


# =========================================================
# USER + ADMIN + SUPERUSER
# =========================================================
def require_stock_access(
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") not in [
        "superuser",
        "admin",
        "user"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Anda tidak memiliki akses"
        )

    return current_user
