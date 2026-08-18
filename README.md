# Library Management API — Đồ án ôn tập cuối khóa

Project thư viện tổng hợp toàn bộ kiến thức đã học: **FastAPI + SQLAlchemy + bcrypt (hashing) + JWT + phân quyền RBAC + nghiệp vụ mượn/trả sách**.

## Kiến thức ôn tập được đưa vào project

| Kiến thức | Ứng dụng trong project |
|---|---|
| FastAPI + APIRouter + Depends | Chia router: `auth`, `categories`, `books`, `borrows` |
| SQLAlchemy + quan hệ 1-N | `Category 1-N Book`, `User 1-N BorrowRecord`, `Book 1-N BorrowRecord` |
| bcrypt hashing | `hash_password()` / `verify_password()` — không lưu password plaintext |
| JWT (PyJWT, HS256, exp) | `create_access_token()` → đăng nhập trả token |
| `get_current_user` (lá chắn) | Mọi API cần đăng nhập |
| Authorization / RBAC | `require_admin` — member gọi API admin → 403 |
| Pydantic validate | `Field(min_length, max_length, ge, le)` → lỗi 422 |
| Response chuẩn 6 trường | `statusCode, message, data, error, timestamp, path` |
| Xử lý lỗi tập trung | Global exception handler 422 / 500 / HTTP |

## 1. Cài đặt

```bash
cd library_management
python3 -m venv venv
source venv/bin/activate        # macOS/Linux
pip install -r requirements.txt
```

## 2. Seed dữ liệu (tạo bảng + admin + sách mẫu)

```bash
python -m app.seed
```

Tài khoản admin: `admin` / `admin123`

## 3. Chạy server

```bash
uvicorn app.main:app --reload
```

Mở Swagger UI: **http://127.0.0.1:8000/docs**

## 4. Danh sách API

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Đăng ký (role luôn `member`) |
| POST | `/api/auth/login` | Public | Đăng nhập → trả JWT (30 phút, kèm role) |
| GET | `/api/auth/me` | Đăng nhập | Thông tin user hiện tại |
| GET | `/api/categories` | Public | Danh sách thể loại |
| POST | `/api/categories` | Admin | Tạo thể loại |
| GET | `/api/books` | Public | Danh sách sách (search + lọc thể loại) |
| GET | `/api/books/{id}` | Public | Chi tiết sách |
| POST | `/api/books` | Admin | Thêm sách |
| PUT | `/api/books/{id}` | Admin | Cập nhật sách |
| DELETE | `/api/books/{id}` | Admin | Xoá sách (đã có lịch sử mượn thì không xoá) |
| POST | `/api/borrows` | Đăng nhập | Mượn sách |
| POST | `/api/borrows/{id}/return` | Chủ phiếu / Admin | Trả sách |
| GET | `/api/borrows/my` | Đăng nhập | Lịch sử mượn/trả của mình |

**Gửi token:** header `Authorization: Bearer <access_token>` (bấm nút **Authorize** trong Swagger).

## 5. Test nhanh bằng Swagger UI

1. `POST /api/auth/register` với `{"username":"alice","password":"123456","full_name":"Alice"}` → 201.
2. `POST /api/auth/login` (chọn dạng form, điền `alice` / `123456`) → copy `access_token`.
3. Bấm **Authorize**, dán token → gọi `GET /api/auth/me` → 200.
4. Gọi `GET /api/books` → 200, thấy 3 cuốn mẫu (số lượng như `quantity`).
5. `POST /api/books` với token member `alice` → **403** "Bạn không có quyền".
6. Login bằng `admin` / `admin123` → Authorize bằng token admin.
7. `POST /api/categories` tạo `{"name":"Lập trình","description":"Sách lập trình"}` → 201.
8. `POST /api/books` thêm sách mới với `category_id` vừa tạo → 201.
9. Đăng nhập lại bằng `alice`, gọi `POST /api/borrows` với `{"book_id": 1}` → 201.
10. Mượn lần nữa cuốn sách đang mượn → **400** "đang mượn... hãy trả trước".
11. `POST /api/borrows/{id}/return` → 200, `available` của sách tăng lại.
12. `GET /api/borrows/my` → thấy toàn bộ lịch sử.

## 6. Nghiệp vụ mượn/trả (hỏi vấn đáp hay trúng)

- Mỗi user chỉ mượn tối đa **3 cuốn** cùng lúc.
- Mượn cuốn sách **đang mượn dở** → báo lỗi.
- Sách hết `available` → không mượn được.
- Mượn thành công → `available -= 1`; trả thành công → `available += 1`.
- Thời hạn mượn **14 ngày** (`due_date`), chỉ chủ phiếu hoặc admin mới trả được.

## 7. Lưu ý bảo mật (phần vấn đáp)

- Không lưu password plaintext — luôn bcrypt (nhớ `.encode("utf-8")`, password ≤ 72 bytes).
- SECRET_KEY không hardcode trong môi trường thật — đọc từ biến môi trường `.env`.
- JWT payload chỉ base64 → không đặt bí mật vào payload.
- Luôn set `exp` cho token.
- `require_admin` đặt sau `get_current_user` → xác thực trước, phân quyền sau.
