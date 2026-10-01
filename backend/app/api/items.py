from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.item_service import ItemService

router = APIRouter(
    prefix="/items",
    tags=["Items"]
)


@router.get("")
def get_items(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return ItemService.get_all(db)


@router.post("")
def create_item(
    payload: ItemCreate, 
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
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


@router.delete("/{item_id}")
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user["role"] != "superadmin":
        raise HTTPException(
            status_code=403,
            detail="Hanya Super Admin yang dapat menghapus barang"
        )

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
