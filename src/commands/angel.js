/**
 * SAIYAN V6 — /سايان — رسائل تلقائية مع نظام مراقبة ذكي
 * Copyright © 2026 Magnus
 *
 * ✦ يتوقف بعد 3 رسائل متتالية دون تفاعل بشري
 * ✦ يستأنف تلقائياً عند وصول رسالة جديدة
 * ✦ يبدأ مراقبة الصمت بعد التوقف
 * ✦ يغادر بعد 16 دقيقة من الصمت
 */

"use strict";

const fs = require("fs-extra");
const path = require("path");

const DATA = path.join(
  process.cwd(),
  "database/data/saiyanData.json"
);

const SILENCE_MS = 16 * 60 * 1000;

function load() {
  try {
    if (fs.existsSync(DATA)) {
      return JSON.parse(
        fs.readFileSync(DATA, "utf8")
      );
    }
  } catch (_) {}

  return {};
}

function save(data) {
  fs.ensureDirSync(
    path.dirname(DATA)
  );

  fs.writeFileSync(
    DATA,
    JSON.stringify(data, null, 2)
  );
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL STATE
// ─────────────────────────────────────────────────────────────────────────────

if (!global.GoatBot)
  global.GoatBot = {};

if (!global.GoatBot.saiyanIntervals)
  global.GoatBot.saiyanIntervals = {};

if (!global.GoatBot.saiyanSilenceTimers)
  global.GoatBot.saiyanSilenceTimers = {};

if (!global._saiyanState)
  global._saiyanState = {};

// ─────────────────────────────────────────────────────────────────────────────
// HUMAN MESSAGE LISTENER
// ─────────────────────────────────────────────────────────────────────────────

if (!global._msgListeners)
  global._msgListeners = [];

if (!global._saiyanListenerRegistered) {

  global._saiyanListenerRegistered = true;

  global._msgListeners.push(
    ({ threadID, messageID }) => {

      const tid = String(threadID);

      const state =
        global._saiyanState[tid];

      if (!state)
        return;

      state.consecutive = 0;
      state.lastHumanTs = Date.now();

      if (messageID) {
        state.lastHumanMessageID =
          String(messageID);
      }

      // ─────────────────────────────────
      // استئناف النظام
      // ─────────────────────────────────

      if (state.paused) {

        state.paused = false;
        state.pausedAt = null;

        clearSilenceWatchdog(tid);

        const data = load();
        const td = data[tid];

        if (
          td?.active &&
          global.GoatBot?.fcaApi
        ) {

          scheduleNext(
            global.GoatBot.fcaApi,
            tid,
            td
          );
        }
      }

      const data = load();
      const td = data[tid];

      if (
        td?.active &&
        global.GoatBot?.fcaApi
      ) {

        scheduleSilenceWatchdog(
          global.GoatBot.fcaApi,
          tid
        );
      }
    }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SILENCE WATCHDOG
// ─────────────────────────────────────────────────────────────────────────────

function clearSilenceWatchdog(tid) {

  const timer =
    global.GoatBot.saiyanSilenceTimers?.[tid];

  if (timer)
    clearTimeout(timer);

  if (global.GoatBot.saiyanSilenceTimers)
    delete global.GoatBot.saiyanSilenceTimers[tid];
}

// ─────────────────────────────────────────────────────────────────────────────
// SEND MESSAGE + LEAVE
// ─────────────────────────────────────────────────────────────────────────────

function sendSaiyanLeave(api, tid, state) {

  if (state.leaving)
    return Promise.resolve();

  state.leaving = true;

  clearTimeout(
    global.GoatBot.saiyanIntervals[tid]
  );

  delete global.GoatBot.saiyanIntervals[tid];

  clearSilenceWatchdog(tid);

  return (async () => {

    // ─────────────────────────────────────
    // الرسالة الختامية
    // ─────────────────────────────────────

    try {

      await new Promise(
        (resolve, reject) => {

          api.sendMessage(
            "ﭑﭑلَـڨَـ📜⍣⃟ـﹻ۪۫٘ہـ𝑯ـٰٰٰٰٖٖٖٖٖﹻ۪┇ـےـ❄️ـ┇بَِـ⥢🪽⥤ـےـٰٰٰٰٖٖٖٖٖ𝐁ـޢـٰٰٰٰٖٖٖٖٖޢـة ني. ك اMك در. ويش",
            tid,
            err =>
              err
                ? reject(err)
                : resolve()
          );

        }
      );

    } catch (_) {}

    // انتظار قبل الخروج
    await new Promise(
      resolve =>
        setTimeout(resolve, 1500)
    );

    // ─────────────────────────────────────
    // خروج البوت
    // ─────────────────────────────────────

    try {

      const botID = String(
        api.getCurrentUserID?.() ||
        global.GoatBot?.botID ||
        ""
      );

      await new Promise(
        (resolve, reject) => {

          api.removeUserFromGroup(
            botID,
            String(tid),
            err =>
              err
                ? reject(err)
                : resolve()
          );

        }
      );

    } catch (error) {

      global.log?.warn?.(
        "SAIYAN",
        `تعذر مغادرة المجموعة ${tid}: ${error.message}`
      );

    } finally {

      const data = load();

      if (data[tid]) {

        data[tid].active = false;

        save(data);
      }

      delete global._saiyanState[tid];
    }

  })();
}

// ─────────────────────────────────────────────────────────────────────────────
// SILENCE MONITOR
// ─────────────────────────────────────────────────────────────────────────────

function scheduleSilenceWatchdog(api, tid) {

  const key = String(tid);

  clearSilenceWatchdog(key);

  const state =
    global._saiyanState[key];

  if (
    !state ||
    state.leaving ||
    !state.paused
  ) {
    return;
  }

  const elapsed =
    Date.now() -
    (state.pausedAt || Date.now());

  const remaining =
    Math.max(
      0,
      SILENCE_MS - elapsed
    );

  global.GoatBot.saiyanSilenceTimers[key] =
    setTimeout(
      async () => {

        delete
          global.GoatBot
            .saiyanSilenceTimers[key];

        const fresh =
          load()[key];

        const current =
          global._saiyanState[key];

        if (
          !fresh?.active ||
          !current ||
          current.leaving ||
          !current.paused
        ) {
          return;
        }

        if (
          Date.now() -
          (current.pausedAt || Date.now()) <
          SILENCE_MS
        ) {

          scheduleSilenceWatchdog(
            api,
            key
          );

          return;
        }

        await sendSaiyanLeave(
          api,
          key,
          current
        );

      },
      remaining
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SCHEDULER
// ─────────────────────────────────────────────────────────────────────────────

function scheduleNext(api, tid, td) {

  clearTimeout(
    global.GoatBot.saiyanIntervals[tid]
  );

  delete global.GoatBot.saiyanIntervals[tid];

  if (
    !td?.active ||
    !td?.message
  ) {
    return;
  }

  if (!global._saiyanState[tid]) {

    global._saiyanState[tid] = {

      consecutive: 0,

      paused: false,

      pausedAt: null,

      lastHumanTs: Date.now(),

      lastHumanMessageID: null,

      leaving: false

    };
  }

  if (
    global._saiyanState[tid].paused
  ) {
    return;
  }

  const ms =
    Math.round(
      rand(
        td.minSeconds ?? 60,
        td.maxSeconds ??
          td.minSeconds ??
          60
      ) * 1000
    );

  global.GoatBot.saiyanIntervals[tid] =
    setTimeout(
      async () => {

        delete
          global.GoatBot
            .saiyanIntervals[tid];

        const fresh =
          load()[tid];

        if (!fresh?.active)
          return;

        const state =
          global._saiyanState[tid] || {};

        // ─────────────────────────────
        // بعد 3 رسائل بدون تفاعل
        // ─────────────────────────────

        if (
          (state.consecutive || 0) >= 3
        ) {

          state.paused = true;

          state.pausedAt =
            Date.now();

          global._saiyanState[tid] =
            state;

          scheduleSilenceWatchdog(
            api,
            tid
          );

          return;
        }

        // ─────────────────────────────
        // إرسال الرسالة
        // ─────────────────────────────

        try {

          const delay =
            global.utils
              ?.calcHumanTypingDelay
              ?.(
                fresh.message
              ) || 1500;

          await global.utils
            ?.simulateTyping
            ?.(
              api,
              tid,
              delay
            );

          await api.sendMessage(
            fresh.message,
            tid
          );

          state.consecutive =
            (state.consecutive || 0) + 1;

          global._saiyanState[tid] =
            state;

        } catch (_) {}

        const next =
          load()[tid];

        if (!next?.active)
          return;

        // ─────────────────────────────
        // التوقف بعد الرسالة الثالثة
        // ─────────────────────────────

        if (
          (state.consecutive || 0) >= 3
        ) {

          state.paused = true;

          state.pausedAt =
            Date.now();

          global._saiyanState[tid] =
            state;

          scheduleSilenceWatchdog(
            api,
            tid
          );

          return;
        }

        scheduleNext(
          api,
          tid,
          next
        );

      },
      ms
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// RESTORE
// ─────────────────────────────────────────────────────────────────────────────

function restoreAll(api) {

  if (global.GoatBot._saiyanRestored)
    return;

  global.GoatBot._saiyanRestored = true;

  const data = load();

  for (
    const [tid, td]
    of Object.entries(data)
  ) {

    if (
      td.active &&
      td.message
    ) {

      if (
        !global._saiyanState[tid]
      ) {

        global._saiyanState[tid] = {

          consecutive: 0,

          paused: false,

          pausedAt: null,

          lastHumanTs: Date.now(),

          lastHumanMessageID: null,

          leaving: false

        };
      }

      scheduleNext(
        api,
        tid,
        td
      );

      if (
        global._saiyanState[tid].paused
      ) {

        scheduleSilenceWatchdog(
          api,
          tid
        );
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {

  config: {

    name: "سايان",

    aliases: [
      "saiyan",
      "سايان",
      "sy"
    ],

    version: "6.0",

    author: "Magnus",

    countDown: 3,

    role: 2,

    category: "management",

    description:
      "نظام سايان للإرسال التلقائي والمراقبة الذكية",

    guide: {

      en:
        "{pn} [رسالة] [min] [max] — تشغيل النظام\n" +
        "{pn} off — إيقاف النظام\n" +
        "{pn} status — عرض الحالة"

    }

  },

  onStart: async function({
    api,
    event,
    args,
    message
  }) {

    const tid =
      String(event.threadID);

    restoreAll(api);

    const data = load();

    const sub =
      (args[0] || "")
        .toLowerCase();

    // ─────────────────────────────
    // STATUS
    // ─────────────────────────────

    if (
      !sub ||
      sub === "status" ||
      sub === "حالة"
    ) {

      const td =
        data[tid];

      if (!td?.active) {

        return message.reply(
          "🌑 نظام سايان غير نشط في هذه المجموعة حالياً."
        );
      }

      const state =
        global._saiyanState[tid] || {};

      const mode =
        state.paused
          ? "⏸️ متوقف مؤقتاً — بانتظار تفاعل"
          : "⚔️ يعمل بصورة طبيعية";

      return message.reply(

        `╔══════ ⚡ SAIYAN SYSTEM ══════╗\n` +
        `║\n` +
        `║ 🛰️ الحالة: ${mode}\n` +
        `║ 💭 المحتوى: ${td.message}\n` +
        `║ ⌛ الفاصل: ${td.minSeconds}–${td.maxSeconds} ثانية\n` +
        `║ 🔁 المتتالية: ${state.consecutive || 0}/3\n` +
        `║\n` +
        `╚══════════════════════════════╝`

      );
    }

    // ─────────────────────────────
    // OFF
    // ─────────────────────────────

    if (
      sub === "off" ||
      sub === "stop" ||
      sub === "إيقاف"
    ) {

      clearTimeout(
        global.GoatBot.saiyanIntervals[tid]
      );

      delete
        global.GoatBot
          .saiyanIntervals[tid];

      clearSilenceWatchdog(tid);

      delete
        global._saiyanState[tid];

      if (data[tid]) {

        data[tid].active = false;

        save(data);
      }

      return message.reply(
        "🧊 تم إيقاف نظام سايان وإلغاء الإرسال التلقائي."
      );
    }

    // ─────────────────────────────
    // ACTIVATE
    // ─────────────────────────────

    const nums =
      args.filter(
        a => /^\d+$/.test(a)
      );

    const textParts =
      args.filter(
        a =>
          !/^\d+$/.test(a) &&
          a.toLowerCase() !== "on" &&
          a.toLowerCase() !== "تشغيل"
      );

    const msg =
      textParts
        .join(" ")
        .trim() ||
      data[tid]?.message ||
      "⚡ سايان حاضر...";

    const minS =
      parseInt(nums[0]) || 60;

    const maxS =
      Math.max(
        parseInt(nums[1]) || minS,
        minS
      );

    data[tid] = {

      active: true,

      message: msg,

      minSeconds: minS,

      maxSeconds: maxS

    };

    save(data);

    global._saiyanState[tid] = {

      consecutive: 0,

      paused: false,

      pausedAt: null,

      lastHumanTs: Date.now(),

      lastHumanMessageID: null,

      leaving: false

    };

    scheduleNext(
      api,
      tid,
      data[tid]
    );

    scheduleSilenceWatchdog(
      api,
      tid
    );

    return message.reply(

      `╔══════ ⚡ SAIYAN V6 ══════╗\n` +
      `║\n` +
      `║ 🚀 تم تشغيل نظام سايان بنجاح\n` +
      `║\n` +
      `║ 💬 الرسالة: "${msg}"\n` +
      `║ ⏳ التوقيت: ${minS}–${maxS} ثانية\n` +
      `║ 🧠 المراقبة: يتوقف بعد 3 رسائل دون تفاعل\n` +
      `║ 🔄 الاستئناف: عند أول رسالة بشرية\n` +
      `║ 🌘 الصمت: 16 دقيقة قبل المغادرة\n` +
      `║\n` +
      `║ 🧿 المطور: Magnus\n` +
      `╚══════════════════════════╝`

    );

  },

  _test: {

    sendSaiyanLeave,

    scheduleNext,

    scheduleSilenceWatchdog,

    clearSilenceWatchdog,

    SILENCE_MS

  }

};
