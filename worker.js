const TELEGRAM_API = "https://api.telegram.org/bot";

export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") {
      return new Response("Bot is running", { status: 200 });
    }

    try {
      const update = await request.json();

      if (!update.message || !update.message.text) {
        return new Response("OK");
      }

      const chatId = update.message.chat.id;
      const text = update.message.text.trim();

      // پیام /start
      if (text === "/start") {
        const message =
          "سلام و خوش اومدی به <b>ربات فارنهایت کنکور</b> 🌡️\n\n" +
          "به‌زودی ربات فارنهایت کنکور با امکانات زیر فعال می‌شود:\n\n" +
          "📊 تخمین تراز و رتبه\n" +
          "📚 معرفی رشته‌ها\n" +
          "🎯 انتخاب رشته کاملاً اتوماتیک\n\n" +
          "<b>برای اولین بار در ایران</b> 🚀\n\n" +
          "تا زمان فعال شدن ربات، ما را در کانال <b>@Fahrenheit_Konkur</b> دنبال کنید.";

        await sendMessage(env.BOT_TOKEN, chatId, message, {
          inline_keyboard: [
            [
              {
                text: "فارنهایت کنکور",
                url: "https://t.me/Fahrenheit_Konkur"
              }
            ]
          ]
        });

        return new Response("OK");
      }

      // اگر کاربر قبلاً /start زده ولی پیام دیگری فرستاد
      await sendMessage(
        env.BOT_TOKEN,
        chatId,
        "ربات فارنهایت کنکور به‌زودی فعال می‌شود 🚀\n\nبرای اطلاع از آخرین اخبار، کانال ما را دنبال کنید.",
        {
          inline_keyboard: [
            [
              {
                text: "فارنهایت کنکور",
                url: "https://t.me/Fahrenheit_Konkur"
              }
            ]
          ]
        }
      );

      return new Response("OK");

    } catch (err) {
      console.error("Bot Error:", err);
      return new Response("OK");
    }
  }
};


async function sendMessage(token, chatId, text, replyMarkup = null) {
  const body = {
    chat_id: chatId,
    text: text,
    parse_mode: "HTML"
  };

  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }

  await fetch(
    `${TELEGRAM_API}${token}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  );
}
