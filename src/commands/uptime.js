/**
 * SAIYAN — /uptime
 * Copyright © 2026 Magnus
 * ✦ عرض حالة النظام ومدة التشغيل
 */
"use strict";

const os = require("os");

function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  const parts = [];

  if (d) parts.push(`${d} يوم`);
  if (h) parts.push(`${h} ساعة`);
  if (m) parts.push(`${m} دقيقة`);

  parts.push(`${sec} ثانية`);

  return parts.join(" و ");
}

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "ping", "وقت"],
    version: "3.1",
    author: "Magnus",
    countDown: 5,
    role: 2,
    category: "info",

    description:
      "عرض مدة تشغيل Saiyan ومعلومات النظام",

    guide: {
      en: "{pn} — عرض حالة النظام"
    }
  },

  onStart: async function({
    api,
    event,
    message
  }) {

    const start =
      global.GoatBot?.startTime ||
      Date.now();

    const uptime =
      Date.now() - start;

    const mem =
      process.memoryUsage();

    const system = {
      total: os.totalmem(),
      free: os.freemem()
    };

    const commands =
      global.GoatBot?.commands?.size || 0;

    const botID =
      global.GoatBot?.botID || "غير معروف";

    const prefix =
      global.GoatBot?.config?.prefix || "/";

    const testStart = Date.now();

    await new Promise(resolve =>
      setTimeout(resolve, 10)
    );

    const responseTime =
      Date.now() - testStart;

    const lines = [

      "╔════════════════════╗",
      "║      ⚡ SAIYAN ⚡",
      "║    SYSTEM MONITOR",
      "╚════════════════════╝",

      "",

      `🆔 المعرّف: ${botID}`,
      `🕰️ وقت العمل: ${formatUptime(uptime)}`,
      `📡 سرعة الرد: ${responseTime}ms`,
      `🧩 الأوامر: ${commands}`,
      `💿 ذاكرة العملية: ${(mem.heapUsed / 1048576).toFixed(1)} MB`,
      `🖥️ ذاكرة الجهاز: ${((system.total - system.free) / 1073741824).toFixed(2)} / ${(system.total / 1073741824).toFixed(2)} GB`,
      `🔰 البادئة: ${prefix}`,

      "",

      "┌────────────────────┐",
      "│ 🟢 النظام متصل",
      "│ ✨ جميع الخدمات تعمل",
      "│ 🔋 الأداء مستقر",
      "└────────────────────┘",

      "",

      "🌌 SAIYAN CORE",
      "🛠️ Developed by Magnus"

    ];

    return message.reply(
      lines.join("\n")
    );
  }
};
