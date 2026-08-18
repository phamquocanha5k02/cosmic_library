"""
database.py — KẾT NỐI DATABASE (SQLite)
======================================
SQLite = 1 file duy nhất (library.db) — không cần cài server DB, dễ chạy
demo/học bài. Muốn đổi MySQL/PostgreSQL chỉ cần sửa DATABASE_URL:
    mysql+pymysql://user:pass@localhost:3306/dbname
    postgresql+psycopg2://user:pass@localhost:5432/dbname

🎯 VÍ DỤ THỰC TẾ:
   engine     = "đường ống nước" nối app ↔ database
   Session    = "1 phiên làm việc": bật vòi, làm việc, tắt vòi
   get_db     = dependency đảm bảo mỗi request mở 1 phiên RIÊNG
                và LUÔN đóng lại dù thành công hay lỗi (finally)
"""
import os
import shutil

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# ─── Chọn DATABASE ───
# Ưu tiên Postgres nếu có biến môi trường DATABASE_URL (set trên Vercel,
# Neon, Supabase...) → dữ liệu BỀN VỮNG, mọi instance dùng chung 1 DB.
# Không có → fallback SQLite (demo/local).
DB_NAME = "library.db"
_SEED_DB = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", DB_NAME))

DATABASE_URL = os.getenv("DATABASE_URL", "")

if DATABASE_URL:
    # Postgres — không cần check_same_thread (chỉ dành riêng cho SQLite)
    connect_args = {}
else:
    # SQLite: Vercel (serverless) filesystem CHỈ ĐỌC, chỉ /tmp ghi được
    # → copy file library.db (seed) sang /tmp để app có thể ghi.
    if os.environ.get("VERCEL"):
        DB_PATH = f"/tmp/{DB_NAME}"
        if not os.path.exists(DB_PATH) and os.path.exists(_SEED_DB):
            shutil.copy(_SEED_DB, DB_PATH)
    else:
        DB_PATH = _SEED_DB
    DATABASE_URL = f"sqlite:///{DB_PATH}"
    # connect_args={"check_same_thread": False}: SQLite chỉ cho phép dùng
    # trong 1 thread; FastAPI chạy đa thread → cần tắt kiểm tra này.
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

# SessionLocal = "nhà máy" sản xuất phiên làm việc (Session).
# autoflush/autocommit=False: kiểm soát thời điểm ghi DB bằng tay (commit).
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

# Base = "khuôn" để mọi model kế thừa → SQLAlchemy biết các bảng
# thuộc cùng 1 hệ thống, dùng chung khuôn tạo bảng.
Base = declarative_base()


def get_db():
    """Dependency của FastAPI: mở phiên DB cho request, xong TỰ ĐÓNG.

    yield = "đưa phiên cho endpoint dùng, rồi quay lại đây để dọn dẹp".
    finally = đóng DB DÙ endpoint thành công HAY ném lỗi (không rò rỉ
    kết nối — giống tắt vòi nước sau khi dùng, kể cả bị nước bắn).
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
