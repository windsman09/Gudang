from fastapi import Depends, HTTPException, status
from app.core.dependencies import get_current_user

# 1. Khusus Superuser (Full Access)
def require_superuser(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "superuser":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hanya Super User yang dapat melakukan aksi ini"
        )
    return current_user

# 2. Admin & Superuser (Stock Out & IoT)
def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["superuser", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hanya Admin dan Super User yang dapat melakukan aksi ini"
        )
    return current_user

# 3. Operator, Admin & Superuser (Kontrol IoT)
def require_operator(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["superuser", "admin", "operator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hanya Operator, Admin, dan Super User yang dapat melakukan aksi ini"
        )
    return current_user
