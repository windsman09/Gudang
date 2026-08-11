@router.post("")
def create_item(
        payload: ItemCreate,
        db: Session = Depends(get_db)
):
    return ItemService.create(db, payload)

@router.delete("/{item_id}")
def delete_item(
        item_id: Int,
        db: Session = Depends(get_db)
):
    ItemService.delete(db, item_id)
    return {"message": " deleted"}

