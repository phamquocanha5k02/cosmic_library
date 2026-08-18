"""
categories.py — QUẢN LÝ THỂ LOẠI SÁCH (đơn giản nhất, làm mẫu)
=============================================================
- GET  : ai cũng xem được (public)
- POST : CHỈ ADMIN

🎯 VÍ DỤ THỰC TẾ:
   Thể loại = "ngăn kệ" trong thư viện: "Khoa học", "Văn học"...
   Mỗi sách (Book) thuộc ĐÚNG MỘT ngăn (category_id) = quan hệ 1-N.
   Bảng categories là bảng "cha", books là bảng "con" (giữ FK).
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Category, User
from app.response import build_response
from app.schemas import ApiResponse, CategoryCreate, CategoryOut
from app.security import require_admin

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=ApiResponse)
def list_categories(request: Request, db: Session = Depends(get_db)):
    """Danh sách thể loại — không cần đăng nhập (ai vào thư viện cũng
    xem được bảng "các ngăn kệ" mà)."""
    categories = db.query(Category).all()
    data = [CategoryOut.model_validate(c) for c in categories]
    return build_response(200, "Danh sách thể loại", data=data, path=request.url.path)


@router.post("", response_model=ApiResponse, status_code=201)
def create_category(payload: CategoryCreate, request: Request,
                    db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """Tạo thể loại — CHỈ ADMIN.

    `_: User = Depends(require_admin)` = lá chắn admin. `_` nghĩa là
    "tôi không cần dùng giá trị trả về, chỉ cần nó chạy để chặn member".
    """
    # Tên thể loại unique → kiểm tra trùng trước (trả 409 thay vì lỗi DB).
    if db.query(Category).filter(Category.name == payload.name).first():
        raise HTTPException(status_code=409, detail="Tên thể loại đã tồn tại")

    # **payload.model_dump() = giải nén dict {name, description} thành tham số.
    category = Category(**payload.model_dump())
    db.add(category)      # thêm vào session (vùng nhớ tạm)
    db.commit()           # ghi hẳn xuống DB
    db.refresh(category)  # đọc lại để lấy id do DB tự sinh
    data = CategoryOut.model_validate(category)
    return build_response(201, "Tạo thể loại thành công", data=data, path=request.url.path)
