from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.permissions import require_admin, require_superuser
from app.services.item_service import ItemService
from app.schemas.item import ItemCreate


router = APIRouter(
    prefix="/items",
    tags=["Items"]
)


# =========================
# GET SEMUA BARANG
# =========================
@router.get("")
def get_items(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return ItemService.get_all(db)


# =========================
# TAMBAH BARANG
# Admin + Superuser
# =========================
@router.post("")
def create_item(
    payload: ItemCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    try:
        item = ItemService.create(
            db,
            payload
        )

        return {
            "message": "Barang berhasil ditambahkan",
            "item": item
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# =========================
# EDIT BARANG
# Admin + Superuser
# =========================
@router.put("/{item_id}")
def update_item(
    item_id: int,
    payload: ItemCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    try:
        item = ItemService.update(
            db,
            item_id,
            payload
        )

        if not item:
            raise HTTPException(
                status_code=404,
                detail="Barang tidak ditemukan"
            )

        return {
            "message": "Barang berhasil diperbarui",
            "item": item
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# =========================
# HAPUS BARANG
# Superuser saja
# =========================
@router.delete("/{item_id}")
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_superuser)
):
    success = ItemService.delete(
        db,
        item_id
    )

    if not success:
        raise HTTPException(
            status_code=404,
            detail="Barang tidak ditemukan"
        )

    return {
        "message": "Barang berhasil dihapus"
    }
