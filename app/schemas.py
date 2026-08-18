"""
schemas.py — "HỢP ĐỒNG DỮ LIỆU" (Pydantic)
==========================================
Pydantic = bộ "kiểm tra + đóng gói" dữ liệu. Chia 2 nhóm:

  *Create (Input) : validate dữ liệu CLIENT GỬI LÊN  → sai là 422
  *Out (Output)   : định dạng dữ liệu TRẢ VỀ cho client

🎯 VÍ DỤ THỰC TẾ:
   *Create = phiếu điền thông tin khi làm thẻ thư viện:
             "họ tên phải ≥ 2 ký tự, tuổi trong khoảng hợp lệ" → sai trả về
   *Out    = tấm thẻ được in sẵn: chỉ in những gì KHÁCH được xem
             (KHÔNG in mật khẩu!) — UserOut không có hashed_password

Vì sao cần tách Create/Out?
→ Tránh "dư thừa" và "lộ thông tin": client gửi lên cần password,
  nhưng response trả về phải ẨN password. 2 schema khác nhau, 2 mục đích.

from_attributes=True: cho phép tạo schema từ object SQLAlchemy
(model_validate(user)) — đọc thẳng thuộc tính thay vì phải tự tay dict.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ---------- Auth ----------
class UserCreate(BaseModel):
    """Dữ liệu client gửi khi ĐĂNG KÝ.

    Field(min_length=3, max_length=50): ràng buộc độ dài.
    ⭐ password max 72 = GIỚI HẠN CỦA BCRYPT (72 bytes) — gửi dài hơn
       sẽ lỗi khi hash, nên chặn sớm ngay tại Pydantic (câu hay hỏi vấn đáp!).
    """
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6, max_length=72)
    full_name: str = Field(min_length=2, max_length=100)


class UserOut(BaseModel):
    """Thông tin user trả về — KHÔNG có hashed_password (bảo mật!).

    ⭐ response_model=UserOut trong endpoint = "tấm thẻ chỉ in phần được xem".
    """
    id: int
    username: str
    full_name: str
    role: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    """Kết quả đăng nhập: token + loại token (chuẩn OAuth2)."""
    access_token: str
    token_type: str = "bearer"


# ---------- Category ----------
class CategoryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    description: str = Field(default="", max_length=255)  # optional, mặc định rỗng


class CategoryOut(BaseModel):
    id: int
    name: str
    description: str
    model_config = ConfigDict(from_attributes=True)


# ---------- Book ----------
class BookCreate(BaseModel):
    """ge=1900 / le=năm nay: năm xuất bản trong khoảng hợp lý.
    quantity ge=1: không cho nhập 0 cuốn (vô lý)."""
    title: str = Field(min_length=2, max_length=200)
    author: str = Field(min_length=2, max_length=100)
    year: int = Field(ge=1900, le=datetime.now().year)
    quantity: int = Field(ge=1, le=100)
    category_id: int = Field(ge=1)


class BookOut(BaseModel):
    """⭐ Schema LỒNG NHAU: book kèm cả category (quan hệ 1-N).
    Optional[CategoryOut] = None: nếu chưa nạp quan hệ thì trả null,
    không bị lỗi thiếu dữ liệu."""
    id: int
    title: str
    author: str
    year: int
    quantity: int
    available: int
    category: Optional[CategoryOut] = None
    model_config = ConfigDict(from_attributes=True)


# ---------- Borrow ----------
class BorrowRequest(BaseModel):
    """Client chỉ cần gửi book_id — user_id lấy từ TOKEN (không tin client)."""
    book_id: int = Field(ge=1)


class BorrowOut(BaseModel):
    """Phiếu mượn trả về kèm thông tin cuốn sách (lồng BookOut)."""
    id: int
    borrow_date: datetime
    due_date: datetime
    return_date: Optional[datetime] = None  # None = chưa trả
    status: str
    book: Optional[BookOut] = None
    model_config = ConfigDict(from_attributes=True)


# ---------- Response chuẩn 6 trường ----------
class ApiResponse(BaseModel):
    """MỌI response đều đóng gói vào 6 trường này → client chỉ cần
    xử lý 1 format duy nhất (giống "phong bì chuẩn" cho mọi thư)."""
    statusCode: int
    message: str
    data: Optional[object] = None
    error: Optional[str] = None
    timestamp: str
    path: str
