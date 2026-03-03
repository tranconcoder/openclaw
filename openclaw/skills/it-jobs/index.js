/**
 * OpenClaw Skill: it-jobs
 * Description: Fetches and aggregates IT backend jobs (Intern/Fresher) in HCM/Remote.
 * Calls the job-crawler-api microservice which returns ready-to-render Markdown.
 */

const API_URL = process.env.JOB_CRAWLER_API_URL || 'http://job-crawler-api:3000/api/jobs';

async function main() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }

        // API now returns markdown directly as plain text
        const markdown = await response.text();

        // Print the markdown result directly — the LLM will format it for the user
        console.log(markdown);

    } catch (error) {
        console.error('ERROR_FETCHING_JOBS:', error.message);
        console.log(`## ❌ Lỗi kết nối

Xin lỗi, hệ thống tìm kiếm job đang gặp sự cố kỹ thuật.
- **Lỗi:** ${error.message}
- **Gợi ý:** Vui lòng thử lại sau vài phút hoặc kiểm tra kết nối mạng.`);
    }
}

main();
