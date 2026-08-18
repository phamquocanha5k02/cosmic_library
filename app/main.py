"""
main.py — ĐIỂM KHỞI ĐẦU CỦA APP (entry point)
=============================================
Uvicorn chạy file này:
    uvicorn app.main:app --reload
    (app.main = module, app = biến FastAPI)

Nhiệm vụ:
    1. Tạo app FastAPI
    2. Gắn các router (auth, categories, books, borrows) vào app
    3. Đăng ký XỬ LÝ LỖI TẬP TRUNG (global exception handlers)

🎯 VÍ DỤ THỰC TẾ:
   Global exception handler = "sổ ghi nhận sự cố" của tòa nhà.
   Dù lỗi xảy ra ở phòng nào (endpoint nào), đều được báo về đây,
   đóng gói thành 1 format chuẩn rồi trả ra — KHÔNG bao giờ để
   lỗi rơi tự do làm server crash hay lộ thông tin hệ thống.
"""
from contextlib import asynccontextmanager
import os

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

# ⚠️ import models dù "không dùng" — mục đích: để Base biết các bảng
# (models.py có class User, Category, Book, BorrowRecord kế thừa Base)
# trước khi gọi create_all. Nếu quên import, create_all sẽ không biết
# phải tạo bảng nào! (noqa: F401 = bỏ qua cảnh báo "import không dùng")
from app import models  # noqa: F401
from app.database import Base, engine
from app.response import build_response
from app.routers import auth, books, borrows, categories


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Chạy 1 lần khi server KHỞI ĐỘNG (trước khi nhận request).

    create_all = tự tạo các bảng chưa tồn tại trong DB.
    (đã tồn tại thì bỏ qua — không xoá dữ liệu cũ, an toàn).
    """
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Library Management API", lifespan=lifespan)

# ---------- CORS — cho phép frontend localhost gọi API ----------
# allow_origins=["*"] = cho phép MỌI nguồn (ok cho dev/hackathon).
# Project thật nên giới hạn lại: ["https://yourdomain.com"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# "Lắp" từng router vào app. Mỗi router là 1 "tủ hồ sơ" riêng:
# auth chứa /api/auth/*, books chứa /api/books/*, ...
app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(books.router)
app.include_router(borrows.router)

# ---------- STATIC FILES — phục vụ frontend ----------
# Mount thư mục frontend/ tại URL /ui
# Truy cập: http://127.0.0.1:8000/ui/index.html
_frontend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
if os.path.isdir(_frontend_dir):
    app.mount("/ui", StaticFiles(directory=_frontend_dir, html=True), name="frontend")


# ---------- XỬ LÝ LỖI TẬP TRUNG ----------
# ⭐ Điểm mấu chốt: MỌI lỗi đều trả về ĐÚNG format 6 trường
#   {statusCode, message, data, error, timestamp, path}
# → client chỉ cần viết 1 đoạn xử lý response duy nhất.


# 1) Lỗi HTTP có chủ đích (400, 401, 403, 404, 409...) do ta raise
#    HTTPException trong endpoint. Bắt StarletteHTTPException (cha của
#    FastAPI HTTPException) để gộp luôn cả "route không tồn tại" (404).
@app.exception_handler(StarletteHTTPException)
async def http_error_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(status_code=exc.status_code, content=build_response(
        exc.status_code, "Yêu cầu không thành công", error=exc.detail,
        path=request.url.path).model_dump())


# 2) Lỗi VALIDATE của Pydantic (gửi sai kiểu, thiếu trường, quá ngắn...)
#    FastAPI mặc định trả 422 — ta chỉ "bọc" lại đúng format 6 trường.
#    exc.errors() chứa chi tiết trường nào sai, vì sao sai.
@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content=build_response(
        422, "Dữ liệu không hợp lệ", error=str(exc.errors()),
        path=request.url.path).model_dump())


# 3) MỌI lỗi còn lại (bug, lỗi DB...) → 500.
#    ⚠️ KHÔNG lộ stack trace ra cho client — kẻ xấu lợi dụng để dò lỗ hổng.
#    (stack trace chỉ nằm trong log server, đây ta trả str(exc) để dễ debug
#    khi học; project thật chỉ trả thông báo chung chung.)
@app.exception_handler(Exception)
async def global_error_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content=build_response(
        500, "Lỗi máy chủ nội bộ", error=str(exc),
        path=request.url.path).model_dump())
