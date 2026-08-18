"""
security.py — TRÁI TIM BẢO MẬT của app
======================================
File này chứa 3 nhóm việc:

1. HASH MẬT KHẨU (bcrypt)
   - hash_password()  : dùng khi ĐĂNG KÝ / đổi mật khẩu
   - verify_password(): dùng khi ĐĂNG NHẬP

2. TẠO & GIẢI MÃ JWT (PyJWT)
   - create_access_token(): "đóng dấu" 1 token sau khi đăng nhập thành công
   - get_current_user()    : "kiểm tra dấu" mỗi khi có request gửi token lên

3. PHÂN QUYỀN (Authorization)
   - require_admin(): kiểm tra user có phải admin không

🎯 VÍ DỤ THỰC TẾ (hiểu trước khi đọc code):
   - Hash mật khẩu  = máy xay sinh tố: cho trái cây vào (mật khẩu) → ra nước ép
     (chuỗi hash). KHÔNG CÓ CÁCH NÀO xay ngược lại được nước ép → trái cây.
     Kẻ xấu lấy được DB cũng chỉ thấy "nước ép", không biết trái cây gốc.
   - JWT = tờ GIẤY CHỨNG MINH có CON DẤU của server. Header + payload là
     "chữ in trên giấy" (ai cũng đọc được), chữ ký (signature) là "con dấu".
     Sửa chữ trên giấy → con dấu rách → vô hiệu. Chỉ server có "con dấu"
     (SECRET_KEY) nên chỉ server ký được giấy thật.
   - get_current_user = NHÂN VIÊN SOÁT VÉ ở cửa rạp phim: khách đưa vé (token),
     nhân viên kiểm tra con dấu + hạn dùng → hợp lệ mới cho vào rạp.
"""
import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User

# ---------------------------------------------------------------
# CẤU HÌNH
# ---------------------------------------------------------------
# SECRET_KEY = "con dấu" của server. Bắt buộc GIỮ KÍN:
# - Nếu lộ → kẻ xấu tự "đóng dấu" được token giả (giả danh admin!) → thảm hoạ.
# - os.getenv("SECRET_KEY", "mặc định") = ưu tiên đọc từ biến môi trường (.env),
#   chỉ dùng giá trị mặc định khi chạy demo. Ở môi trường thật KHÔNG hardcode.
SECRET_KEY = os.getenv("SECRET_KEY", "doi-key-nay-trong-moi-truong-that")

# Thuật toán ký: HMAC-SHA256 (đối xứng — dùng 1 key để ký và kiểm tra).
# HS256 là thuật toán mặc định phổ biến nhất cho JWT.
ALGORITHM = "HS256"

# Token sống 30 phút rồi hết hạn → phải đăng nhập lại.
# Giống vé xe buýt: có hạn dùng, hết giờ là hết giá trị.
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Hằng số nghiệp vụ thư viện:
# - BORROW_DAYS: mượn sách được giữ tối đa 14 ngày (giống thẻ thư viện thật).
# - MAX_BOOKS_PER_USER: mỗi người chỉ được mượn 3 cuốn cùng lúc (chống "ôm" sách).
BORROW_DAYS = 14
MAX_BOOKS_PER_USER = 3

# "Công cụ" của FastAPI: đọc token từ header: Authorization: Bearer <token>
# ⭐ Dùng HTTPBearer thay cho OAuth2PasswordBearer — LÝ DO:
#   Swagger UI (OAuth2 password flow) chỉ hiểu token response theo CHUẨN
#   OAuth2: {"access_token": "..."} ở tầng cao nhất. App ta bọc token trong
#   format 6 trường (data.access_token) → Swagger "Authorized" nhưng KHÔNG
#   lấy được token → request sau bị 401.
#   HTTPBearer → Swagger hiện ô dán thẳng token (không cần client_id/secret).
# auto_error=False → tự xử lý 401 trong get_current_user (giữ hành vi cũ).
oauth2_scheme = HTTPBearer(auto_error=False)


# ---------------------------------------------------------------
# 1. HASH MẬT KHẨU — bcrypt
# ---------------------------------------------------------------
def hash_password(password: str) -> str:
    """Băm mật khẩu → chuỗi hash để lưu DB. Dùng khi ĐĂNG KÝ.

    Ví dụ thực tế: "123456" → "$2b$12$XyZkQ...9sN" (60 ký tự, không bao giờ
    giống mật khẩu gốc). 2 người cùng mật khẩu vẫn ra 2 hash KHÁC NHAU
    vì bcrypt tự thêm "muối" (salt) ngẫu nhiên mỗi lần gọi.
    """
    # ⚠️ Quy tắc vàng của bcrypt: chỉ nhận BYTES (dạng thô máy tính đọc được),
    # KHÔNG nhận string Python → bắt buộc .encode("utf-8"), quên là TypeError.
    # Ví dụ: "abc".encode("utf-8") → b'abc'
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    # Phân tích từ trong ra ngoài:
    #   1. password.encode("utf-8")  : string → bytes
    #   2. bcrypt.gensalt()          : sinh muối ngẫu nhiên (mỗi lần 1 muối khác)
    #   3. bcrypt.hashpw(pw, salt)   : trộn password + muối → hash dạng bytes
    #   4. .decode("utf-8")          : bytes → string để DB lưu được


def verify_password(plain: str, hashed: str) -> bool:
    """So khớp mật khẩu khi ĐĂNG NHẬP. Trả True = đúng, False = sai.

    Bcrypt TỰ ĐỘNG tách muối từ trong chuỗi hash (muối nằm ngay trong
    "$2b$12$<salt><hash>"), băm lại mật khẩu vừa gõ bằng đúng muối đó,
    rồi so sánh. Nên ta không cần lưu muối riêng — quá tiện.
    """
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


# ---------------------------------------------------------------
# 2. JWT — tạo & giải mã
# ---------------------------------------------------------------
def create_access_token(data: dict) -> str:
    """Tạo JWT. Gọi NGAY SAU khi đăng nhập thành công.

    Ví dụ thực tế: đóng dấu vào tờ giấy chứng minh:
    - data = {"sub": "3", "role": "member"}  ← nội dung in trên giấy
    - exp  = thời điểm hết hạn                ← "có giá trị đến 14:30"
    - chữ ký = hash(header + payload + SECRET_KEY) ← con dấu của server
    """
    # Copy dict gốc trước khi sửa — tránh làm đổi data của người gọi hàm.
    to_encode = data.copy()

    # Tính thời điểm hết hạn = bây giờ + 30 phút.
    # timezone.utc: chuẩn giờ quốc tế, tránh lệch múi giờ.
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    # exp (expiration) là trường BẮT BUỘC của JWT — không có là thư viện từ chối.
    to_encode.update({"exp": expire})

    # jwt.encode: đóng gói payload + ký chữ ký → chuỗi token 3 phần
    # "header.payload.signature" (dấu chấm ngăn cách).
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """LÁ CHẮN (dependency) đặt trước mọi endpoint cần đăng nhập.

    🎯 Ví dụ thực tế — nhân viên soát vé rạp phim:
      1. Khách đưa vé (token)              ← Depends(oauth2_scheme) lấy từ header
      2. Kiểm tra con dấu (chữ ký)         ← jwt.decode kiểm tra chữ ký
      3. Kiểm tra hạn dùng (exp)           ← quá hạn cũng bị bắt
      4. Tra tên khách trong danh sách     ← query DB theo sub
      5. Hợp lệ → cho vào rạp (trả user); sai → đuổi ra ngoài (401)

    Vì sao 401 phải trả thông báo CHUNG CHUNG?
    → Không nói rõ "token hết hạn" hay "user không tồn tại" để kẻ xấu
      không dò được thông tin. Giống bảo vệ không nói "cửa sau đang mở".
    """
    # "Lỗi 401 mẫu" dùng chung cho mọi trường hợp thất bại.
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Không thể xác thực thông tin đăng nhập",
        headers={"WWW-Authenticate": "Bearer"},  # chuẩn HTTP: báo client "gửi Bearer token"
    )
    # HTTPBearer(auto_error=False): không có header → credentials = None
    # → tự raise 401 (giống hành vi OAuth2PasswordBearer cũ).
    token = credentials.credentials if credentials else None
    if not token:
        raise credentials_exception
    try:
        # Giải mã + kiểm tra chữ ký + kiểm tra exp.
        # - Token bị sửa → chữ ký không khớp → PyJWTError
        # - Quá hạn → ExpiredSignatureError (con của PyJWTError)
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # sub = "subject" = chủ thể = user id (chuẩn OAuth2).
        # .get() trả None nếu không có key → coi như token rác.
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    # sub lưu dạng string ("3") vì JWT chuẩn quy định, nên phải int() lại
    # để so với cột id kiểu Integer trong DB.
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        # Token hợp lệ nhưng user bị xoá khỏi DB rồi → vẫn coi là chưa xác thực.
        raise credentials_exception
    return user  # FastAPI truyền user này vào endpoint làm current_user


# ---------------------------------------------------------------
# 3. PHÂN QUYỀN (Authorization)
# ---------------------------------------------------------------
def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Phân quyền: user thường gọi API admin → 403 Forbidden.

    🎯 Ví dụ thực tế — 2 lớp cửa:
      - get_current_user = cửa 1: "Bạn là ai?" (XÁC THỰC - Authentication)
      - require_admin     = cửa 2: "Bạn có thẻ vào phòng VIP không?" (PHÂN QUYỀN)

    ⚠️ THỨ TỰ BẤT BIẾN: xác thực TRƯỚC, phân quyền SAU.
       require_admin gọi Depends(get_current_user) bên trong → FastAPI
       tự chạy xác thực trước, xong mới tới kiểm tra role.

    403 khác 401 thế nào?
    - 401: "mày chưa chứng minh được mày là ai" (chưa login / token sai)
    - 403: "biết mày là ai rồi, nhưng mày không được phép làm việc này"
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền thực hiện thao tác này",
        )
    return current_user
