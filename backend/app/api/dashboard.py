from fastapi import APIRouter

router = APIRouter()


@router.get("/dashboard")
def dashboard():
    return {
        "total_barang": 1250,
        "barang_masuk": 150,
        "barang_keluar": 95,
    }