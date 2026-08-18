"""
seed.py — TẠO BẢNG + DỮ LIỆU MẪU (chạy 1 lần)
============================================
    python -m app.seed

Làm 3 việc:
    1. Tạo các bảng chưa có trong DB (create_all)
    2. Tạo tài khoản ADMIN đầu tiên (admin / admin123)
    3. Thêm dữ liệu mẫu: 2 thể loại + 3 cuốn sách

🎯 VÍ DỤ THỰC TẾ:
   Giống ngày khai trương thư viện: dựng kệ (tạo bảng), lập 1 thẻ
   quản lý (admin), bày vài cuốn sách lên kệ (dữ liệu mẫu) để khách
   vào là có thứ mà thử ngay.
"""
from app import models  # noqa: F401  (để Base biết các bảng trước khi create_all)
from app.database import Base, SessionLocal, engine
from app.models import Book, Category, User
from app.security import hash_password


def seed_if_empty():
    """Tạo bảng + dữ liệu mẫu NẾU DB trống (an toàn gọi nhiều lần).

    - Tạo bảng: chỉ tạo bảng CHƯA tồn tại (create_all).
    - Admin: chỉ tạo nếu CHƯA có.
    - Sách/thể loại mẫu: chỉ thêm khi bảng categories còn trống.
    """
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    # Tạo admin — chỉ tạo nếu CHƯA có (tránh trùng khi chạy lại seed).
    # ⭐ Mật khẩu admin cũng phải HASH như user thường — không có ngoại lệ!
    if db.query(User).filter(User.username == "admin").first() is None:
        db.add(User(
            username="admin",
            hashed_password=hash_password("admin123"),
            full_name="Quản trị viên",
            role="admin",  # role admin chỉ tạo qua seed, KHÔNG qua /register
        ))
        print("Đã tạo tài khoản admin (admin / admin123)")

    # Dữ liệu mẫu — chỉ thêm khi bảng categories còn trống.
    # available = quantity: sách vừa nhập → chưa ai mượn → trên kệ = tổng.
    if db.query(Category).count() == 0:
        khoahoc = Category(name="Khoa học", description="Sách khoa học - công nghệ")
        vanhoc = Category(name="Văn học", description="Tiểu thuyết, truyện ngắn")
        db.add_all([khoahoc, vanhoc])
        db.commit()  # commit để lấy được id của thể loại (DB tự sinh)
        db.add_all([
            Book(title="Trí tuệ nhân tạo", author="Nguyễn Văn An", year=2022,
                 quantity=5, available=5, category_id=khoahoc.id),
            Book(title="Cấu trúc dữ liệu và giải thuật", author="Trần Minh", year=2021,
                 quantity=3, available=3, category_id=khoahoc.id),
            Book(title="Tôi thấy hoa vàng trên cỏ xanh", author="Nguyễn Nhật Ánh", year=2010,
                 quantity=2, available=2, category_id=vanhoc.id),
        ])
        db.commit()
        print("Đã thêm dữ liệu mẫu: 2 thể loại, 3 cuốn sách")

    db.commit()
    db.close()


# Chạy trực tiếp: `python -m app.seed`
if __name__ == "__main__":
    seed_if_empty()
    print("Seed xong!")
