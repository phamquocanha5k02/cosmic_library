"""
response.py — "PHONG BÌ CHUẨN" cho mọi response
===============================================
Hàm build_response() bọc mọi kết quả (thành công hay lỗi) vào
ĐÚNG 6 trường:

    {
      "statusCode": 200,
      "message": "Danh sách sách",
      "data": [...],          <- nội dung chính (object/list/null)
      "error": null,          <- thông báo lỗi (chỉ khi có lỗi)
      "timestamp": "...Z",    <- thời điểm trả response (giờ UTC)
      "path": "/api/books"    <- endpoint nào trả response này (dễ debug)
    }

🎯 VÍ DỤ THỰC TẾ:
   Giống "phong bì công văn chuẩn" của một công ty: dù là thư báo
   thành công hay thư báo lỗi, bên ngoài phong bì luôn ghi đủ
   người gửi/ngày giờ — người nhận (client) chỉ cần học 1 cách đọc.
"""
from datetime import datetime, timezone

from app.schemas import ApiResponse


def build_response(status_code: int, message: str, data=None,
                   error=None, path: str = "") -> ApiResponse:
    """Tạo response chuẩn 6 trường.

    - timestamp dùng giờ UTC (timezone.utc) + định dạng ISO:
      "2026-08-18T05:45:00Z" — chuẩn quốc tế, không phụ thuộc máy nào.
    - data/error mặc định None → JSON trả null (không báo "thiếu trường").
    """
    return ApiResponse(
        statusCode=status_code,
        message=message,
        data=data,
        error=error,
        timestamp=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        path=path,
    )
