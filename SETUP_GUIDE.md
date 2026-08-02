# HƯỚNG DẪN CẤU HÌNH .ENV VÀ CHẠY DỰ ÁN ADAPTIVE PERSONAL PLANNER

Bạn có thể sao chép nội dung dưới đây để tạo tệp `.env` riêng trên máy cục bộ của bạn.

---

## 1. Nội dung mẫu tệp `.env` (Copy & dán vào tệp `.env` ở máy tính của bạn)

Tạo tệp mới tên là `.env` (nằm ở thư mục gốc của dự án, cùng cấp với `package.json`) và dán đoạn mã sau vào:

```env
# ======================================================
# CẤU HÌNH BIẾN MÔI TRƯỜNG DỰ ÁN (Adaptive Personal Planner)
# ======================================================

# 1. Gemini API Key chính (Lấy miễn phí tại https://aistudio.google.com/app/apikey)
GEMINI_API_KEY="Điền_API_Key_Gemini_Của_Bạn_Vào_Đây"

# 2. (Tùy chọn) Danh sách nhiều API Key xoay tua tự động nếu muốn tránh lỗi 429 Rate Limit:
# GEMINI_API_KEYS="Key1,Key2,Key3"

# 3. Cổng Server (Mặc định: 3000)
PORT=3000
```

---

## 2. Cách lấy API Key miễn phí từ Google AI Studio

1. Truy cập: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Đăng nhập tài khoản Google của bạn.
3. Bấm **Create API Key** (Tạo API key mới).
4. Sao chép đoạn mã bắt đầu bằng `AIzaSy...` và dán vào vị trí `GEMINI_API_KEY="AIzaSy..."` trong tệp `.env`.

---

## 3. Lưu ý quan trọng về Bảo mật & Git

- Tệp `.env` chứa chìa khóa bí mật (API Key) của bạn.
- Tệp `.env` **đã được thêm sẵn vào `.gitignore`**, nên khi bạn thực hiện `git add .` và `git push`, Git sẽ **tự động bỏ qua** tệp `.env` này và không đẩy chìa khóa của bạn lên GitHub.
- Tệp `.env.example` trên GitHub chỉ chứa mã mẫu placeholder (`your_gemini_api_key_here`) để người khác tải về biết cách cấu hình.

---

## 4. Các lệnh chạy dự án trên máy tính cục bộ

```bash
# 1. Cài đặt các thư viện cần thiết
npm install

# 2. Khởi chạy ứng dụng ở chế độ phát triển (Development)
npm run dev

# 3. Mở trình duyệt và truy cập:
http://localhost:3000
```
