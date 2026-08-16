export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") {
      return new Response("Telegram Bot is active!", { status: 200 });
    }

    const startTime = performance.now();
    const serverReceiveTimeMs = Date.now();

    // خواندن توکن از متغیرهای محیطی یا مقدار پیش‌فرض
    const token = env.BOT_TOKEN || "8661021538:AAE1flLAX3xtMYAPo30hUV67z01c_frIiQc";
    const telegramApi = `https://api.telegram.org/bot${token}`;

    try {
      const update = await request.json();

      if (update.message && update.message.text) {
        const chatId = update.message.chat.id;
        const text = update.message.text.trim();
        const msgDateUnix = update.message.date;

        if (text.startsWith("/start")) {
          // محاسبه زمان تأخیر از سمت سرورهای تلگرام تا کلادفلار
          const delaySeconds = Math.max(0, Math.floor(serverReceiveTimeMs / 1000) - msgDateUnix);

          // محاسبه زمان پردازش ورکر
          const processingTimeMs = (performance.now() - startTime).toFixed(2);

          const replyText = 
            `سلام!\n\n` +
            `⏱ تاخیر ارسال پیام: ${delaySeconds} ثانیه\n` +
            `⚡ زمان پاسخگویی ورکر: ${processingTimeMs} میلی‌ثانیه\n` +
            `🚀 معماری: Cloudflare Serverless + GitHub CI/CD\n` +
            `🛡 وضعیت ریت‌لیمیت: فعال و مجاز`;

          await fetch(`${telegramApi}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: replyText,
            }),
          });
        }
      }
    } catch (err) {
      console.error("Error processing webhook:", err);
    }

    return new Response("OK", { status: 200 });
  },
};
