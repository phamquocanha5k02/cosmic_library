"""
models.py — ĐỊNH NGHĨA BẢNG DATABASE (SQLAlchemy ORM)
====================================================
Mỗi class = 1 BẢNG, mỗi Column = 1 CỘT.
SQLAlchemy tự dịch Python → SQL: tạo bảng, thêm/sửa/xoá dòng...

🎯 VÍ DỤ THỰC TẾ — nhìn theo "sổ thư viện":
   users          = sổ đăng ký thẻ thành viên
   categories     = bảng "các ngăn kệ" (Khoa học, Văn học...)
   books          = sổ nhập kho sách (tên, tác giả, số lượng)
   borrow_records = sổ mượn/trả (ai mượn gì, khi nào, đã trả chưa)

QUAN HỆ 1-N (đọc lại note "Mini Project - Quan hệ Database"):
   Category 1 ─── N Book        : 1 ngăn kệ chứa nhiều sách
   User     1 ─── N BorrowRecord : 1 người có nhiều phiếu mượn
   Book     1 ─── N BorrowRecord : 1 cuốn sách có nhiều phiếu mượn (lịch sử)
   Bên "N" (nhiều) giữ KHÓA NGOẠI (ForeignKey) trỏ về bên "1".
"""
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    """Bảng users — tài khoản đăng nhập.

    - unique=True : không cho 2 user trùng username (DB tự chặn, code cũng
      kiểm tra trước để trả thông báo đẹp hơn).
    - nullable=False : bắt buộc phải có giá trị.
    - index=True : đánh chỉ mục → tìm theo cột này nhanh hơn (như mục lục sách).
    - hashed_password: lưu CHUỖI HASH (không bao giờ lưu mật khẩu thô).
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    hashed_password = Column(String(100), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(20), default="member")  # admin / member
    created_at = Column(DateTime, default=datetime.utcnow)

    # relationship = "cầu nối" Python giúp truy cập quan hệ dễ dàng:
    # user.borrow_records → danh sách phiếu mượn của user đó.
    # (back_populates phải trỏ ngược lại tên bên kia để 2 đầu khớp nhau)
    borrow_records = relationship("BorrowRecord", back_populates="user")


class Category(Base):
    """Bảng categories — thể loại sách (bảng "cha" của books)."""
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(String(255), default="")

    books = relationship("Book", back_populates="category")


class Book(Base):
    """Bảng books — sách (bảng "con" của categories, giữ FK).

    ⭐ 2 cột số lượng — hiểu kỹ để trả lời vấn đáp:
       quantity  = TỔNG số cuốn thư viện nhập về (vd 5)
       available = số cuốn ĐANG TRÊN KỆ cho mượn (vd 5 - 2 đang mượn = 3)
       → số đang được mượn = quantity - available
    """
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    author = Column(String(100), nullable=False)
    year = Column(Integer, default=2024)
    quantity = Column(Integer, default=1)   # tổng số cuốn
    available = Column(Integer, default=1)  # số cuốn còn có thể mượn
    # KHÓA NGOẠI: mỗi sách thuộc đúng 1 thể loại (categories.id).
    # nullable=False → sách BẮT BUỘC phải có thể loại.
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)

    category = relationship("Category", back_populates="books")
    borrow_records = relationship("BorrowRecord", back_populates="book")


class BorrowRecord(Base):
    """Bảng borrow_records — phiếu mượn/trả sách.

    - 2 khóa ngoại: user_id (ai mượn) + book_id (mượn cuốn nào).
    - status: "borrowing" (đang mượn) / "returned" (đã trả).
    - return_date nullable (None) = chưa trả; có giá trị = đã trả lúc đó.
    """
    __tablename__ = "borrow_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    borrow_date = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime, nullable=False)      # hạn trả (14 ngày)
    return_date = Column(DateTime, nullable=True)    # ngày đã trả
    status = Column(String(20), default="borrowing")  # borrowing / returned

    user = relationship("User", back_populates="borrow_records")
    book = relationship("Book", back_populates="borrow_records")
