const BOT_TOKEN = "8661021538:AAE1flLAX3xtMYAPo30hUV67z01c_frIiQc";
const TELEGRAM_API = https://api.telegram.org/bot${BOT_TOKEN};

export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") {
      return new Response("Bot is running", { status: 200 });
    }

    try {
      const update = await request.json();

      if (update.message && update.message.text) {
        const chatId = update.message.chat.id;
        const text = update.message.text.trim();
        const userKey = user_${chatId};

        let session = await env.BOT_KV.get(userKey, { type: "json" });

        if (text === "/start" || text === "/reset") {
          session = { step: "AWAITING_NAME", data: {} };
          await env.BOT_KV.put(userKey, JSON.stringify(session));

          await sendMessage(
            chatId,
            "سلام! خوش آمدید. 👋\nاطلاعات شما به صورت دائمی ذخیره می‌شود.\n\nلطفاً نام و نام‌خانوادگی خود را بفرستید:"
          );
          return new Response("OK");
        }

        if (!session) {
          await sendMessage(chatId, "لطفاً ابتدا دستور /start را بفرستید.");
          return new Response("OK");
        }

        switch (session.step) {
          case "AWAITING_NAME":
            session.data.name = text;
            session.step = "AWAITING_FIELD";
            await env.BOT_KV.put(userKey, JSON.stringify(session));

            await sendMessage(chatId, نام شما ثبت شد ✨\nحالا **رشته یا تخصص** خود را ارسال کنید:);
            break;

          case "AWAITING_FIELD":
            session.data.field = text;
            session.data.savedAt = new Date().toISOString();
            session.step = "COMPLETED";
            await env.BOT_KV.put(userKey, JSON.stringify(session));

            const summary =
              ✅ **اطلاعات در دیتابیس دائمی ذخیره شد!**\n\n +
              👤 نام: ${session.data.name}\n +
              📚 رشته: ${session.data.field}\n +
              🆔 شناسه: \${chatId}\\n\n +
              برای ویرایش مجدد /reset را بزنید.;

            await sendMessage(chatId, summary);
            break;

          case "COMPLETED":
            await sendMessage(
              chatId,
              اطلاعات شما از قبل در دیتابیس ثبت شده است:\n +
              👤 نام: ${session.data.name}\n +
              📚 رشته: ${session.data.field}\n\n +
              برای تغییر اطلاعات، دستور /reset را ارسال کنید.
            );
            break;
        }
      }
    } catch (err) {
      console.error("Worker Error:", err);
    }

    return new Response("OK");
  },
};

async function sendMessage(chatId, text) {
  await fetch(${TELEGRAM_API}/sendMessage, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "Markdown",
    }),
  });
}
