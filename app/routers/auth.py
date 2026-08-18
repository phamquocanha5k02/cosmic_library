"""
auth.py — ĐĂNG KÝ / ĐĂNG NHẬP / XEM THÔNG TIN BẢN THÂN
=====================================================
Luồng nghiệp vụ (học thuộc để vấn đáp):

    ĐĂNG KÝ  : Client gửi {username, password, full_name}
               → server HASH password (bcrypt) → lưu DB → KHÔNG lưu plaintext
    ĐĂNG NHẬP: Client gửi username + password (dạng FORM)
               → server so hash (verify_password) → đúng → TẠO JWT → trả token
    GỌI /me  : Client gửi header Authorization: Bearer <token>
               → get_current_user (lá chắn) kiểm tra → trả thông tin user

🎯 VÍ DỤ THỰC TẾ:
   - Đăng ký = làm thẻ thư viện: lễ tân ghi tên bạn vào sổ, mật khẩu được
     "xay nhuyễn" (hash) trước khi lưu → lộ sổ cũng không biết mật khẩu.
   - Đăng nhập = trình thẻ ra cổng: bảo vệ đối chiếu thẻ (so hash),
     đúng thì phát vé (token) cho vào thư viện.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.response import build_response
from app.schemas import ApiResponse, UserCreate, UserOut
from app.security import create_access_token, get_current_user, hash_password, verify_password

# prefix = tiền tố URL tự động cộng vào mọi route trong router này.
# Ví dụ: @router.post("/register") → URL đầy đủ: /api/auth/register
# tags = nhóm hiển thị trong Swagger UI cho dễ tìm.
router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=ApiResponse, status_code=201)
def register(payload: UserCreate, request: Request, db: Session = Depends(get_db)):
    """Đăng ký: kiểm tra trùng username → hash password → lưu DB.

    - status_code=201: Created — chuẩn REST cho "tạo mới thành công".
    - payload: UserCreate (Pydantic) — FastAPI tự validate trước khi vào hàm:
      username 3-50 ký tự, password 6-72 ký tự (72 = giới hạn của bcrypt!)
    - request: để lấy request.url.path ghi vào response chuẩn 6 trường.
    - db = Depends(get_db): FastAPI tự mở kết nối DB, xong tự đóng.
    """
    # Kiểm tra username đã tồn tại chưa (bảng users có cột unique username,
    # nhưng tự kiểm tra để trả thông báo rõ ràng thay vì lỗi DB khó hiểu).
    if db.query(User).filter(User.username == payload.username).first():
        # 409 = Conflict: "thứ bạn muốn tạo đã tồn tại rồi".
        raise HTTPException(status_code=409, detail="Username đã tồn tại")

    # ⭐ ĐIỂM MẤU CHỐT: hashed_password = hash_password(...) — KHÔNG BAO GIỜ
    # gán password thô vào DB. Nếu DB bị lộ, kẻ xấu chỉ thấy chuỗi hash.
    user = User(
        username=payload.username,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        # role cố định "member" — KHÔNG cho người đăng ký tự chọn role,
        # chống "leo thang đặc quyền" (tự đăng ký làm admin).
        role="member",
    )
    db.add(user)       # thêm vào "vùng nhớ tạm" (session)
    db.commit()        # ghi HẲN xuống database (lúc này mới có hiệu lực)
    db.refresh(user)   # đọc lại từ DB để lấy id + created_at (DB tự sinh)

    # Chuyển object SQLAlchemy → Pydantic UserOut để:
    # 1. Ẩn hashed_password (UserOut không có trường đó) — không lộ ra client
    # 2. Đảm bảo JSON trả về đúng định dạng
    data = UserOut.model_validate(user)
    return build_response(201, "Đăng ký thành công", data=data, path=request.url.path)


@router.post("/login", response_model=ApiResponse)
def login(request: Request, db: Session = Depends(get_db),
          form_data: OAuth2PasswordRequestForm = Depends()):
    """Đăng nhập: so khớp hash → tạo JWT (kèm role) → trả token.

    - OAuth2PasswordRequestForm: FastAPI TỰ đọc username + password từ
      BODY DẠNG FORM (không phải JSON!) — theo chuẩn OAuth2, Swagger UI
      sẽ hiện đúng ô username/password cho mình.
    - Lý do dùng form: chuẩn OAuth2 bắt buộc, đồng bộ với nút Authorize.
    """
    # Tìm user theo username trong DB. Không tìm thấy → user = None.
    user = db.query(User).filter(User.username == form_data.username).first()

    # ⭐ So hash: verify_password(mật khẩu vừa gõ, hash đã lưu trong DB).
    # Dùng toán tử or — CHỈ CẦN 1 CÁI SAI là lỗi:
    #   - not user                    : username không tồn tại
    #   - not verify_password(...)    : mật khẩu không khớp
    # Trả CÙNG MỘT thông báo cho cả 2 trường hợp → kẻ xấu không biết
    # mình sai ở username hay password để tiếp tục dò (chống dò username).
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Sai username hoặc mật khẩu")

    # Đăng nhập thành công → "đóng dấu" 1 token:
    #   - sub  = user id (chuẩn OAuth2 gọi "chủ thể")
    #   - role = ghi thẳng vào token để phân quyền nhanh, không cần query DB
    token = create_access_token({"sub": str(user.id), "role": user.role})
    data = {"access_token": token, "token_type": "bearer"}
    # Client giữ token này và gửi kèm mọi request sau (header Bearer).
    return build_response(200, "Đăng nhập thành công", data=data, path=request.url.path)


@router.get("/me", response_model=ApiResponse)
def read_me(request: Request, current_user: User = Depends(get_current_user)):
    """Endpoint BẢO VỆ — ví dụ điển hình của "lá chắn".

    ⭐ current_user = Depends(get_current_user):
       FastAPI chạy get_current_user TRƯỚC. Token sai/hết hạn → 401 ngay,
       code dưới KHÔNG BAO GIỜ chạy. Token hợp lệ → current_user = user
       trong DB, truyền vào đây.

    🎯 Giống soát vé rạp phim: bạn phải qua cửa (lá chắn) trước khi được
       vào ghế ngồi (chạy endpoint).
    """
    data = UserOut.model_validate(current_user)  # ẩn hashed_password
    return build_response(200, "Thông tin người dùng", data=data, path=request.url.path)
