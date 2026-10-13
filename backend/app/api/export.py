
from datetime import datetime
from io import BytesIO

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.item import Item
from app.models.stock_in import StockIn
from app.models.stock_out import StockOut
from app.services.excel_service import create_excel


router = APIRouter(
    prefix="/exports",
    tags=["Export Excel"],
)


def excel_response(
    file: BytesIO,
    filename: str,
) -> StreamingResponse:
    return StreamingResponse(
        file,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            )
        },
    )


@router.get("/items")
def export_items(db: Session = Depends(get_db)):
    items = (
        db.query(Item)
        .order_by(Item.item_code.asc())
        .all()
    )

    rows = [
        (
            item.item_code,
            item.item_name,
            item.category,
            item.unit,
            item.stock,
            item.min_stock,
            item.location,
        )
        for item in items
    ]

    file = create_excel(
        headers=[
            "Kode Barang",
            "Nama Barang",
            "Kategori",
            "Satuan",
            "Stok Saat Ini",
            "Stok Minimum",
            "Lokasi",
        ],
        rows=rows,
        sheet_name="Stok Barang",
    )

    filename = (
        f"laporan_stok_{datetime.now():%Y%m%d_%H%M%S}.xlsx"
    )
    return excel_response(file, filename)


@router.get("/stock-in")
def export_stock_in(db: Session = Depends(get_db)):
    transactions = (
        db.query(StockIn, Item)
        .join(Item, StockIn.item_id == Item.id)
        .order_by(StockIn.id.desc())
        .all()
    )

    rows = [
        (
            transaction.id,
            item.item_code,
            item.item_name,
            transaction.qty,
            transaction.no_pr,
        )
        for transaction, item in transactions
    ]

    file = create_excel(
        headers=[
            "ID Transaksi",
            "Kode Barang",
            "Nama Barang",
            "Jumlah Masuk",
            "Nomor PR",
        ],
        rows=rows,
        sheet_name="Riwayat Barang Masuk",
    )

    filename = (
        f"riwayat_barang_masuk_{datetime.now():%Y%m%d_%H%M%S}.xlsx"
    )
    return excel_response(file, filename)


@router.get("/stock-out")
def export_stock_out(db: Session = Depends(get_db)):
    transactions = (
        db.query(StockOut, Item)
        .join(Item, StockOut.item_id == Item.id)
        .order_by(StockOut.created_at.desc())
        .all()
    )

    rows = [
        (
            transaction.id,
            transaction.created_at,
            item.item_code,
            item.item_name,
            transaction.qty,
            transaction.destination,
            transaction.note,
        )
        for transaction, item in transactions
    ]

    file = create_excel(
        headers=[
            "ID Transaksi",
            "Tanggal",
            "Kode Barang",
            "Nama Barang",
            "Jumlah Keluar",
            "Tujuan",
            "Catatan",
        ],
        rows=rows,
        sheet_name="Riwayat Barang Keluar",
    )

    filename = (
        f"riwayat_barang_keluar_{datetime.now():%Y%m%d_%H%M%S}.xlsx"
    )
    return excel_response(file, filename)

