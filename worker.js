const TELEGRAM_API = "https://api.telegram.org/bot8661021538:AAE1flLAX3xtMYAPo30hUV67z01c_frIiQc";

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
        const userKey = "user_" + chatId;

        // خواندن وضعیت کاربر از دیتابیس دائمی KV
        let sessionText = await env.BOT_KV.get(userKey);
        let session = sessionText ? JSON.parse(sessionText) : null;

        if (text === "/start" || text === "/reset") {
          session = { step: "AWAITING_NAME", data: {} };
          await env.BOT_KV.put(userKey, JSON.stringify(session));

          await fetch(TELEGRAM_API + "/sendMessage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              chat_id: chatId, 
              text: "سلام! 👋\nاطلاعات شما به صورت دائمی ذخیره خواهد شد.\n\nلطفاً نام و نام‌خانوادگی خود را وارد کنید:" 
            })
          });
          return new Response("OK");
        }

        if (!session) {
          await fetch(TELEGRAM_API + "/sendMessage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: "برای ثبت مشخصات، لطفاً دستور /start را ارسال کنید." })
          });
          return new Response("OK");
        }

        switch (session.step) {
          case "AWAITING_NAME":
            session.data.name = text;
            session.step = "AWAITING_FIELD";
            await env.BOT_KV.put(userKey, JSON.stringify(session));

            await fetch(TELEGRAM_API + "/sendMessage", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: chatId, text: "عالیه! ✨\nحالا لطفاً رشته تحصیلی یا تخصص خود را ارسال کنید:" })
            });
            break;

          case "AWAITING_FIELD":
            session.data.field = text;
            session.data.registeredAt = new Date().toISOString();
            session.step = "COMPLETED";
            await env.BOT_KV.put(userKey, JSON.stringify(session));

            const summary = "✅ اطلاعات برای همیشه ذخیره شد!\n\n" +
              "👤 نام: " + session.data.name + "\n" +
              "📚 رشته: " + session.data.field + "\n" +
              "💾 شناسه کاربری: " + chatId + "\n\n" +
              "برای ویرایش مجدد، دستور /reset را ارسال کنید.";

            await fetch(TELEGRAM_API + "/sendMessage", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: chatId, text: summary })
            });
            break;
            
          case "COMPLETED":
            await fetch(TELEGRAM_API + "/sendMessage", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                chat_id: chatId, 
                text: "اطلاعات شما قبلاً ذخیره شده است:\n👤 نام: " + session.data.name + "\n📚 رشته: " + session.data.field + "\n\nجهت تغییر اطلاعات، /reset را بزنید." 
              })
            });
            break;
        }
      }
    } catch (err) {
      console.error("KV Bot Error:", err);
    }

    return new Response("OK");
  }
};
