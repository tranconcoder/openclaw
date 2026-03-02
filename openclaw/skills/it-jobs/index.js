/**
 * OpenClaw Skill: it-jobs
 * Description: Fetches and aggregates IT backend jobs (Intern/Fresher) in HCM/Remote.
 * This script now calls the standalone job-crawler-api microservice.
 */

const API_URL = process.env.JOB_CRAWLER_API_URL || 'http://job-crawler-api:3000/api/jobs';

async function main() {
    try {
        console.log(`# 🚀 JOBS IT BACKEND (INTERN/FRESHER) TẠI HCM/REMOTE HÔM NAY\n`);
        console.log(`*Note: Dữ liệu được tổng hợp từ nhiều nguồn thông qua Job Crawler API.*\n`);
        console.log(`***\n`);

        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }

        const result = await response.json();
        const sources = result.data || {};

        let hasJobs = false;

        for (const [sourceName, jobs] of Object.entries(sources)) {
            if (jobs && jobs.length > 0) {
                hasJobs = true;
                console.log(`## 🔥 IT Jobs Trên ${sourceName.toUpperCase()} (Backend, Intern/Fresher, HCM/Remote, Hôm nay)\n`);
                jobs.forEach((job, index) => {
                    const badge = job.isNew ? ' 🆕' : '';
                    console.log(`*   **${index + 1}. [${job.title}](${job.link})${badge}**`);
                    console.log(`    * 🏢 **Công ty:** ${job.company}`);
                    console.log(`    * 📍 **Địa điểm:** ${job.location} | ⏳ **Cập nhật:** ${job.time}`);
                });
                console.log(`\n***\n`);
            }
        }

        if (!hasJobs) {
            console.log(`Hôm nay chưa có tin tuyển dụng Backend Intern/Fresher mới nào. Hãy quay lại sau nhé!`);
        }

    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu từ Job Crawler API:', error.message);
        console.log(`Xin lỗi, hệ thống tìm kiếm job đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.`);
    }
}

main();
