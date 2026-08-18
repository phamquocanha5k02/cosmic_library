---
description: Deploy project lên Vercel (production mặc định, --preview cho preview)
agent: build
---

Deploy project hiện tại lên Vercel bằng Vercel CLI:

1. Chạy `npx vercel deploy $ARGUMENTS`.
2. Nếu `$ARGUMENTS` trống, mặc định dùng `--prod` để deploy production.
3. Nếu lệnh fail do chưa đăng nhập (`vercel login`), báo người dùng chạy `npx vercel login` trước.
4. Sau khi deploy xong, in ra URL deployment (chỉ cần URL, không giải thích thêm).
