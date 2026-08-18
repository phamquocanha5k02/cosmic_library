"""
borrows.py — NGHIỆP VỤ MƯỢN & TRẢ SÁCH
====================================
Đây là file chứa LOGIC NGHIỆP VỤ chính (hay nhất để hỏi vấn đáp!).

Luồng MƯỢN sách:
    Client gửi {book_id} + token
    → lá chắn get_current_user (401 nếu chưa đăng nhập)
    → kiểm tra: sách có tồn tại? còn available? user chưa mượn 3 cuốn?
                user có đang mượn cuốn này rồi không?
    → available -= 1  → lưu phiếu mượn (due_date = +14 ngày) → 201

Luồng TRẢ sách:
    Client gửi {record_id} + token
    → lá chắn → kiểm tra phiếu tồn tại, đúng chủ (hoặc admin), chưa trả
    → status = "returned", return_date = bây giờ → available += 1 → 200

🎯 VÍ DỤ THỰC TẾ:
   - available = số cuốn đang NẰM TRÊN KỆ. Mượn → rút 1 cuốn khỏi kệ
     (available -= 1). Trả → đặt lại lên kệ (available += 1).
   - Giới hạn 3 cuốn = thư viện thật: "mỗi thẻ chỉ mượn tối đa 3 đầu sách"
     để không ai "ôm" hết sách cho mình.
"""
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Book, BorrowRecord, User
from app.response import build_response
from app.schemas import ApiResponse, BorrowOut, BorrowRequest
from app.security import BORROW_DAYS, MAX_BOOKS_PER_USER, get_current_user

router = APIRouter(prefix="/api/borrows", tags=["borrows"])


@router.post("", response_model=ApiResponse, status_code=201)
def borrow_book(payload: BorrowRequest, request: Request,
                db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Mượn sách: 4 kiểm tra nghiệp vụ, mỗi kiểm tra 1 dòng, dễ đọc dễ sửa.

    Lưu ý: current_user từ Depends(get_current_user) — user đã được xác
    thực, nên KHÔNG cần nhận user_id từ client (client gửi thì cũng bỏ qua).
    """
    # Kiểm tra 1: sách có tồn tại không?
    # db.get(Book, id) = lấy 1 dòng theo primary key, nhanh và gọn.
    book = db.get(Book, payload.book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Không tìm thấy sách")

    # Kiểm tra 2: còn cuốn nào trên kệ không?
    # available <= 0 → hết sách → 400 (lỗi nghiệp vụ, không phải lỗi hệ thống)
    if book.available <= 0:
        raise HTTPException(status_code=400, detail="Sách đã hết, không thể mượn")

    # Kiểm tra 3: user đang mượn bao nhiêu cuốn (status="borrowing" = chưa trả)?
    # .count() = đếm số dòng khớp điều kiện.
    active_count = (db.query(BorrowRecord)
                    .filter(BorrowRecord.user_id == current_user.id,
                            BorrowRecord.status == "borrowing").count())
    if active_count >= MAX_BOOKS_PER_USER:
        raise HTTPException(
            status_code=400,
            detail=f"Mỗi người chỉ được mượn tối đa {MAX_BOOKS_PER_USER} cuốn cùng lúc",
        )

    # Kiểm tra 4: có đang mượn cuốn NÀY rồi không? (chống mượn trùng)
    already = (db.query(BorrowRecord)
               .filter(BorrowRecord.user_id == current_user.id,
                       BorrowRecord.book_id == payload.book_id,
                       BorrowRecord.status == "borrowing").first())
    if already:
        raise HTTPException(status_code=400, detail="Bạn đang mượn cuốn sách này rồi, hãy trả trước")

    # Tạo phiếu mượn:
    #   - due_date = bây giờ + 14 ngày (hạn trả)
    #   - timezone.utc: dùng giờ UTC cho chuẩn (tránh lệch múi giờ)
    record = BorrowRecord(
        user_id=current_user.id,
        book_id=payload.book_id,
        due_date=datetime.now(timezone.utc) + timedelta(days=BORROW_DAYS),
    )
    # ⭐ MẤU CHỐT: 2 thay đổi trong 1 transaction:
    #   book.available -= 1  (sách xuống kệ)
    #   + thêm phiếu mượn    (ghi sổ)
    # db.commit() ghi cả 2 cùng lúc — không có chuyện "trừ sách nhưng quên ghi sổ".
    book.available -= 1
    db.add(record)
    db.commit()
    db.refresh(record)  # lấy id + borrow_date do DB sinh

    data = BorrowOut.model_validate(record)
    return build_response(201, "Mượn sách thành công", data=data, path=request.url.path)


@router.post("/{record_id}/return", response_model=ApiResponse)
def return_book(record_id: int, request: Request,
                db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Trả sách: 3 kiểm tra + cộng lại available.

    🎯 Ví dụ thực tế: mượn sách thì quẹt thẻ, trả sách cũng phải quẹt thẻ —
    chỉ đúng người (hoặc thủ thư = admin) mới được quẹt.
    """
    record = db.get(BorrowRecord, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Không tìm thấy phiếu mượn")

    # Kiểm tra quyền: chỉ CHỦ phiếu mượn (record.user_id == current_user.id)
    # hoặc ADMIN mới trả được. Người khác (dù cùng đăng nhập) → 403.
    # 🎯 Đây là ví dụ thực tế của PHÂN QUYỀN ở mức "từng dòng dữ liệu"
    #    (row-level authorization) — khác với require_admin ở mức API.
    if record.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Bạn không có quyền trả cuốn sách này")

    # Chống trả 2 lần: phiếu đã "returned" thì không trả nữa.
    if record.status == "returned":
        raise HTTPException(status_code=400, detail="Cuốn sách này đã được trả")

    # Cập nhật phiếu: đánh dấu đã trả + ghi ngày trả.
    record.status = "returned"
    record.return_date = datetime.now(timezone.utc)

    # Đặt sách lại lên kệ: available += 1 (bù cho lần mượn đã trừ).
    book = db.get(Book, record.book_id)
    book.available += 1
    db.commit()
    db.refresh(record)
    data = BorrowOut.model_validate(record)
    return build_response(200, "Trả sách thành công", data=data, path=request.url.path)


@router.get("/my", response_model=ApiResponse)
def my_borrows(request: Request, db: Session = Depends(get_db),
               current_user: User = Depends(get_current_user)):
    """Lịch sử mượn/trả của user đang đăng nhập (không thấy được của người khác).

    joinedload = "nạp sẵn" quan hệ để tránh truy vấn DB nhiều lần
    (n+1 problem). Giống đi chợ: mua sẵn cả túi rau về, thay vì chạy
    ra chợ từng lần mỗi khi cần 1 mớ.
    """
    records = (db.query(BorrowRecord)
               .options(joinedload(BorrowRecord.book).joinedload(Book.category))
               .filter(BorrowRecord.user_id == current_user.id)
               .order_by(BorrowRecord.borrow_date.desc())  # mới nhất lên đầu
               .all())
    data = [BorrowOut.model_validate(r) for r in records]
    return build_response(200, "Lịch sử mượn trả", data=data, path=request.url.path)
