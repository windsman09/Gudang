from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.item_service import ItemService

router = APIRouter(
    prefix="/items",
    tags=["Items"]
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
