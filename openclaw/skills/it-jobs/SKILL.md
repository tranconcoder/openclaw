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

Khi chạy `node /home/node/.openclaw/skills/it-jobs/index.js`, hệ thống sẽ trả về chuỗi Markdown.

**QUAN TRỌNG: Khi trả lời người dùng, bạn PHẢI:**
1. **Giữ nguyên cấu trúc tin:** Trình bày theo từng nền tảng (LinkedIn, TopCV, ITViec, TopDev) như dữ liệu gốc.
2. **Không bịa data:** Nếu một nền tảng báo lỗi bị block (403, 404) hoặc không có việc mới trong 24h, hãy báo thật cho người dùng biết (VD: "ITViec hiện đang khóa truy cập tự động" hoặc "TopCV không có job mới thỏa mãn trong hôm nay").
3. **Format gọn gàng:** Sử dụng bullet points, làm nổi bật Tên công ty, Vị trí và thời gian cập nhật.
4. **Luôn cung cấp link gốc:** Bắt buộc có link để người dùng click vào xem chi tiết bài đăng tuyển dụng.
