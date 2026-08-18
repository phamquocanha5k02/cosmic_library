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
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# connect_args={"check_same_thread": False}: SQLite chỉ cho phép dùng trong
# 1 thread; FastAPI chạy đa thread → cần tắt kiểm tra này (chỉ riêng SQLite).
DATABASE_URL = "sqlite:///./library.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

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
