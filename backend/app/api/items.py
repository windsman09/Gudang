@router.delete("/{item_id}")
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):
    if current_user["role"] != "superadmin":
        raise HTTPException(
            status_code=403,
            detail="Hanya Super Admin"
        )

    success = ItemService.delete(
        db,
        item_id
    )

    return {
        "message": "Barang berhasil dihapus"
    }
