---
name: it-jobs
description: "Tìm kiếm và tổng hợp các công việc IT Backend (Intern/Fresher) mới nhất tập trung tại khu vực TP.HCM hoặc Remote trong vòng 24h qua từ LinkedIn, TopCV, ITViec và TopDev."
homepage: "local"
metadata: { "openclaw": { "emoji": "💼", "requires": { "bins": ["node"] } } }
---

# IT Jobs Skill

Tìm kiếm và tổng hợp các công việc IT Backend (Node.js, PHP, Java...) dành cho mức độ Thực tập sinh (Intern) hoặc Fresher. Tập trung vào các công việc mới đăng trong ngày hôm nay ở khu vực Hồ Chí Minh hoặc Remote.

## Khi nào nên dùng

✅ **SỬ DỤNG skill này khi người dùng hỏi:**
- "Tìm giúp mình job backend fresher ở HCM hôm nay."
- "Có job IT intern nào mới đăng trên topcv hay linkedin không?"
- "Tổng hợp việc làm backend remote hoặc ở Sài Gòn."
- "Tìm việc Nodejs/PHP/Java fresher."

## Khi nào KHÔNG dùng

❌ **KHÔNG dùng skill này khi:**
- Tìm việc ở các lĩnh vực không liên quan đến IT (Kế toán, Marketing...).
- Tìm việc ở cấp độ cao (Senior, Lead, Manager) trừ khi người dùng không chỉ định rõ cấp độ.

## Lệnh khởi chạy

```bash
node /home/node/.openclaw/skills/it-jobs/index.js
```

## Hướng dẫn phản hồi cho LLM

Khi chạy `node /home/node/.openclaw/skills/it-jobs/index.js`, hệ thống sẽ trả về chuỗi Markdown đã được định dạng sẵn.

**QUAN TRỌNG: Khi trả lời người dùng, bạn PHẢI:**

1. **In nguyên kết quả Markdown** được trả về từ script mà không cắt gọn hay chỉnh sửa. Đây là dữ liệu thực tế đã được lọc và định dạng sẵn.

2. **Thêm phần dẫn nhập ngắn** (2-3 câu trước kết quả), ví dụ:
   > "Dưới đây là danh sách các job IT Backend Intern/Fresher mới nhất vừa được cập nhật từ các nền tảng tuyển dụng. Những job có badge 🆕 MỚI là những job lần đầu xuất hiện và chưa từng được ghi nhận trước đó."

3. **Thêm phần phân tích ngắn sau kết quả** (nếu có job), bao gồm:
   - 🏅 **Job ngon nhất** (hoặc đáng ứng tuyển nhất): Dựa trên tên công ty, mô tả, hoặc vị trí. Giải thích lý do ngắn gọn (uy tín công ty, rõ ràng về công nghệ, mô tả hấp dẫn...).
   - 💡 **Lưu ý nhỏ** nếu cần (ví dụ: một số nền tảng trả về ít job hơn 5 do bộ lọc nghiêm ngặt).

4. **Không bịa data:** Nếu một nền tảng báo lỗi bị block (403, 404) hoặc không tìm thấy job mới, hãy thông báo thật cho người dùng biết.

5. **Luôn cung cấp link gốc:** Đảm bảo người dùng có thể click vào từng link để xem chi tiết bài đăng.
