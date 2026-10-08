from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password
from app.models.user import User
from app.core.dependencies import get_current_user
from app.core.permissions import require_superuser


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# =========================================================
# Role yang tersedia
# =========================================================
VALID_ROLES = [
    "superuser",
    "admin",
    "user"
]


# =========================================================
# Cek apakah user yang sedang login adalah Super User
# =========================================================
def require_superuser(
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "superuser":
        raise HTTPException(
            status_code=HTTP_403_FORBIDDEN,
            detail="Hanya Super User yang dapat melakukan aksi ini"
        )  # 3. Removed the trailing extra parenthesis here

    return current_user
# =========================================================
# Tambah User
# User baru selalu dibuat sebagai "user"
# Role dapat diubah kemudian oleh Super User
# =========================================================
@router.post("/")
def create_user(
    username: str,
    password: str,
    full_name: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_superuser)
):
    existing_user = db.query(User).filter(
        User.username == username
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username sudah digunakan"
        )

    hashed_password = hash_password(password)

    user = User(
        username=username,
        full_name=full_name,
        hashed_password=hashed_password,
        role="user"
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "User berhasil dibuat",
        "id": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "role": user.role
    }


# =========================================================
# Profil User yang sedang login
# =========================================================
@router.get("/me")
def get_my_profile(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Token tidak memiliki user ID"
        )

    user = db.query(User).filter(
        User.id == int(user_id)
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User tidak ditemukan"
        )

    return {
        "id": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "role": user.role
    }


# =========================================================
# Daftar Semua User
# =========================================================
@router.get("/")
def get_users(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_superuser)
):
    users = db.query(User).order_by(
        User.id.asc()
    ).all()

    return [
        {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role
        }
        for user in users
    ]


# =========================================================
# Ubah Role User
# Hanya Super User
# =========================================================
@router.put("/{user_id}/role")
def update_user_role(
    user_id: int,
    role: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_superuser)
):
    # Cek role
    if role not in VALID_ROLES:
        raise HTTPException(
            status_code=400,
            detail="Role harus superuser, admin, atau user"
        )

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User tidak ditemukan"
        )

    # ID user yang sedang login
    current_user_id = int(
        current_user.get("sub")
    )

    # Tidak boleh mengubah role sendiri
    if user.id == current_user_id:
        raise HTTPException(
            status_code=400,
            detail="Anda tidak dapat mengubah role akun sendiri"
        )

    user.role = role

    db.commit()
    db.refresh(user)

    return {
        "message": "Role berhasil diubah",
        "id": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "role": user.role
    }


# =========================================================
# Hapus User
# =========================================================
@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_superuser)
):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User tidak ditemukan"
        )

    # ID user yang sedang login
    current_user_id = int(
        current_user.get("sub")
    )

    # Tidak boleh menghapus akun sendiri
    if user.id == current_user_id:
        raise HTTPException(
            status_code=400,
            detail="Anda tidak dapat menghapus akun sendiri"
        )

    db.delete(user)
    db.commit()

    return {
        "message": "User berhasil dihapus"
    }

