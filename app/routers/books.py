"""
books.py — QUẢN LÝ SÁCH (CRUD)
=============================
- GET    : ai cũng xem được (public)
- POST/PUT/DELETE : CHỈ ADMIN (require_admin → member bị 403)

🎯 VÍ DỤ THỰC TẾ:
   - quantity = tổng số cuốn thư viện NHẬP về (vd 5 cuốn "Trí tuệ nhân tạo")
   - available = số cuốn đang TRÊN KỆ cho mượn (vd 5 - 2 đang mượn = 3)
   - Khi nhập sách: quantity = available. Khi mượn: available giảm.
   - Lý do cần 2 cột: cần biết TỔNG để biết "nhập thêm bao nhiêu",
     cần biết CÒN để biết "có cho mượn được không".
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Book, BorrowRecord, Category, User
from app.response import build_response
from app.schemas import ApiResponse, BookCreate, BookOut
from app.security import require_admin

router = APIRouter(prefix="/api/books", tags=["books"])


@router.get("", response_model=ApiResponse)
def list_books(request: Request, db: Session = Depends(get_db),
               search: str | None = None, category_id: int | None = None):
    """Danh sách sách — có tìm kiếm và lọc.

    - search, category_id là QUERY PARAM (FastAPI đọc từ ?search=...&category_id=...).
      Có default None → bỏ qua nếu client không gửi.
    - .contains() = LIKE '%...%' trong SQL: tìm chuỗi con ở giữa.
      🎯 Giống Ctrl+F trong Word: tìm "Python" sẽ thấy "Học Python cơ bản".
    - | là toán tử OR của SQLAlchemy: khớp tên HOẶC khớp tác giả.
    """
    query = db.query(Book).options(joinedload(Book.category))
    if search:
        query = query.filter(
            (Book.title.contains(search)) | (Book.author.contains(search))
        )
    if category_id:
        query = query.filter(Book.category_id == category_id)
    books = query.all()
    data = [BookOut.model_validate(b) for b in books]
    return build_response(200, "Danh sách sách", data=data, path=request.url.path)


@router.get("/{book_id}", response_model=ApiResponse)
def get_book(book_id: int, request: Request, db: Session = Depends(get_db)):
    """Chi tiết 1 cuốn sách. {book_id} = PATH PARAM (nằm trong URL).

    FastAPI tự validate book_id là int — gửi chữ vào sẽ bị 422.
    """
    book = db.query(Book).options(joinedload(Book.category)).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Không tìm thấy sách")
    data = BookOut.model_validate(book)
    return build_response(200, "Chi tiết sách", data=data, path=request.url.path)


@router.post("", response_model=ApiResponse, status_code=201)
def create_book(payload: BookCreate, request: Request,
                db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """Thêm sách — CHỈ ADMIN.

    ⭐ Dấu `_` trong `_: User = Depends(require_admin)`:
       - Depends(require_admin) vẫn CHẠY (kiểm tra admin) như bình thường,
       - nhưng kết quả trả về ta KHÔNG cần dùng → đặt tên `_` cho gọn.
       "Lá chắn không cần cầm, chỉ cần nó đứng chắn."
    """
    # Kiểm tra thể loại tồn tại (FK trỏ tới categories.id phải hợp lệ).
    if not db.get(Category, payload.category_id):
        raise HTTPException(status_code=404, detail="Thể loại không tồn tại")

    # **payload.model_dump() = "giải nén" dict thành tham số.
    #   vd model_dump() = {"title": "...", "author": "...", "quantity": 5, ...}
    #   → Book(title=..., author=..., quantity=5, ...)
    # available = payload.quantity: sách vừa nhập về → chưa ai mượn →
    # số trên kệ = tổng số. (BẮT BUỘC set, không để default=1 sai lệch!)
    book = Book(**payload.model_dump(), available=payload.quantity)
    db.add(book)
    db.commit()
    db.refresh(book)
    data = BookOut.model_validate(book)
    return build_response(201, "Thêm sách thành công", data=data, path=request.url.path)


@router.put("/{book_id}", response_model=ApiResponse)
def update_book(book_id: int, payload: BookCreate, request: Request,
                db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """Cập nhật sách — CHỈ ADMIN. Phần khó nhất: giữ available nhất quán.

    🎯 VÍ DỤ THỰC TẾ — thư viện có 5 cuốn, 2 cuốn đang được mượn (available=3).
       Muốn sửa thành 10 cuốn? → nhập thêm 5 → available = 10 - 2 = 8 ✔
       Muốn sửa thành 1 cuốn?  → số mới NHỎ HƠN số đang mượn (2) → VÔ LÝ,
       vì 2 người đang mượn thì không thể chỉ còn 1 cuốn tổng. → 400.
    """
    book = db.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Không tìm thấy sách")
    if not db.get(Category, payload.category_id):
        raise HTTPException(status_code=404, detail="Thể loại không tồn tại")

    # quantity - available = số cuốn đang được mượn (đang ở ngoài kệ).
    borrowed = book.quantity - book.available
    if payload.quantity < borrowed:
        raise HTTPException(
            status_code=400,
            detail="Số lượng mới không thể nhỏ hơn số cuốn đang được mượn",
        )

    # Ghi đè từng trường: giống điền lại form (title mới, author mới...)
    for field, value in payload.model_dump().items():
        setattr(book, field, value)
    # Tính lại available: tổng mới - số đang mượn (số mượn không đổi).
    book.available = payload.quantity - borrowed
    db.commit()
    db.refresh(book)
    data = BookOut.model_validate(book)
    return build_response(200, "Cập nhật sách thành công", data=data, path=request.url.path)


@router.delete("/{book_id}", response_model=ApiResponse)
def delete_book(book_id: int, request: Request,
                db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """Xoá sách — CHỈ ADMIN.

    ⚠️ Vì sao chặn xoá sách có lịch sử mượn?
       borrow_records.book_id là KHÓA NGOẠI (FK) trỏ tới books.id, NOT NULL.
       Xoá sách mà phiếu mượn vẫn giữ book_id → FK không còn hợp lệ →
       SQLAlchemy sẽ báo IntegrityError (chính lỗi "NOT NULL constraint failed"
       gặp lúc làm bài!). Giải pháp đơn giản: sách từng có người mượn thì
       giữ lại làm "lịch sử", chỉ xoá sách chưa từng ai mượn.
    """
    book = db.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Không tìm thấy sách")

    # Đếm TOÀN BỘ phiếu mượn (kể cả đã trả) của cuốn sách này.
    history_count = (db.query(BorrowRecord)
                     .filter(BorrowRecord.book_id == book_id).count())
    if history_count > 0:
        raise HTTPException(status_code=400, detail="Không thể xoá sách đã có lịch sử mượn")

    db.delete(book)
    db.commit()
    return build_response(200, "Xoá sách thành công", data=None, path=request.url.path)
