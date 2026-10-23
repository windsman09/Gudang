from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.item import Item
from app.models.stock_out import StockOut

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/monthly-trend")
def get_monthly_usage_trend(db: Session = Depends(get_db)):
    """
    Mengambil tren total kuantitas pemakaian barang per bulan
    selama 6 bulan terakhir.
    """
    try:
        # Filter 6 bulan terakhir berdasarkan StockOut.created_at
        six_months_ago = datetime.utcnow() - timedelta(days=180)

        # Format SQLite untuk mengelompokkan tahun-bulan (YYYY-MM)
        month_format = func.strftime("%Y-%m", StockOut.created_at)

        results = (
            db.query(
                month_format.label("month"),
                func.coalesce(func.sum(StockOut.qty), 0).label("total_used"),
            )
            .filter(StockOut.created_at >= six_months_ago)
            .group_by(month_format)
            .order_by(month_format.asc())
            .all()
        )

        return [
            {"month": r.month, "total_used": int(r.total_used)}
            for r in results
        ]

    except Exception as e:
        print(f"Error query monthly trend: {e}")
        return []
