/**
 * SAIYAN — /غروبات — إدارة الغروبات والمحادثات
 * Copyright © 2026 Magnus
 *
 * الميزات:
 *  - عرض جميع الغروبات
 *  - عرض طلبات المراسلة PENDING
 *  - عرض محادثات OTHER
 *  - عرض معلومات الغروب
 *  - قبول طلب مراسلة
 *  - قبول مباشر بواسطة Thread ID
 *  - إحصائيات المحادثات
 *  - نظام Reply للتنقل
 */

"use strict";

const fs = require("fs-extra");
const path = require("path");

// ======================================================
// الإعدادات
// ======================================================

const MAX_ITEMS = 30;
const MAX_PAGES = 10;
const PAGE_SIZE = 50;

// ======================================================
// التحقق من الأدمن
// ======================================================

function isAdmin(id) {
  const admins =
    global.GoatBot?.config?.adminBot || [];

  return admins
    .map(String)
    .includes(String(id));
}

// ======================================================
// أدوات عامة
// ======================================================

function clean(value) {
  return String(value ?? "").trim();
}

function getName(thread) {
  return (
    thread?.name ||
    thread?.threadName ||
    thread?.senderName ||
    thread?.title ||
    `محادثة ${thread?.threadID || "غير معروف"}`
  );
}

function getThreadID(thread) {
  return clean(
    thread?.threadID ||
    thread?.id
  );
}

function getSnippet(thread) {
  return clean(
    thread?.snippet ||
    thread?.lastMessage?.body ||
    ""
  );
}

// ======================================================
// API Wrapper
// ======================================================

function getThreadList(
  api,
  limit = PAGE_SIZE,
  cursor = null,
  tags = ["INBOX"]
) {
  return new Promise(resolve => {
    let finished = false;

    function done(error, data) {
      if (finished) return;

      finished = true;

      if (error) {
        return resolve([]);
      }

      if (Array.isArray(data)) {
        return resolve(data);
      }

      if (Array.isArray(data?.data)) {
        return resolve(data.data);
      }

      resolve([]);
    }

    try {
      if (
        !api ||
        typeof api.getThreadList !== "function"
      ) {
        return done(
          new Error(
            "api.getThreadList غير متوفر"
          )
        );
      }

      const result =
        api.getThreadList(
          limit,
          cursor,
          tags,
          done
        );

      if (
        result &&
        typeof result.then === "function"
      ) {
        result
          .then(data =>
            done(null, data)
          )
          .catch(error =>
            done(error)
          );
      }
    } catch (error) {
      done(error);
    }
  });
}

// ======================================================
// جلب قائمة كاملة حسب التصنيف
// ======================================================

async function getThreads(
  api,
  tags
) {
  const result = [];
  const seen = new Set();

  let cursor = null;

  for (
    let page = 0;
    page < MAX_PAGES;
    page++
  ) {
    const batch =
      await getThreadList(
        api,
        PAGE_SIZE,
        cursor,
        tags
      );

    if (!batch.length) {
      break;
    }

    for (const thread of batch) {
      const id =
        getThreadID(thread);

      if (!id) continue;

      if (seen.has(id)) {
        continue;
      }

      seen.add(id);
      result.push(thread);
    }

    if (
      batch.length < PAGE_SIZE
    ) {
      break;
    }

    const last =
      batch[batch.length - 1];

    cursor =
      last?.timestamp ||
      last?.lastMessageTimestamp ||
      null;

    if (!cursor) {
      break;
    }
  }

  return result;
}

// ======================================================
// الغروبات
// ======================================================

async function getGroups(api) {
  const threads =
    await getThreads(
      api,
      ["INBOX"]
    );

  return threads.filter(
    thread =>
      thread?.isGroup === true ||
      thread?.isGroup === 1 ||
      Boolean(thread?.participantIDs?.length)
        && Boolean(thread?.threadID)
        && Boolean(thread?.name)
  );
}

// ======================================================
// طلبات المراسلة
// ======================================================

async function getRequests(api) {
  return getThreads(
    api,
    ["PENDING"]
  );
}

// ======================================================
// Other
// ======================================================

async function getOther(api) {
  return getThreads(
    api,
    ["OTHER"]
  );
}

// ======================================================
// قبول المحادثة
// ======================================================

async function acceptConversation(
  api,
  threadID
) {
  const tid =
    clean(threadID);

  if (!tid) {
    return {
      accepted: false,
      hello: false,
      error:
        new Error(
          "Thread ID غير موجود"
        )
    };
  }

  let accepted = false;
  let acceptError = null;

  // ----------------------------------------------------
  // قبول الطلب
  // ----------------------------------------------------

  if (
    typeof api?.handleMessageRequest ===
    "function"
  ) {
    try {
      await new Promise(resolve => {
        let finished = false;

        const done = error => {
          if (finished) return;

          finished = true;

          if (error) {
            acceptError = error;
          } else {
            accepted = true;
          }

          resolve();
        };

        try {
          const result =
            api.handleMessageRequest(
              tid,
              true,
              done
            );

          if (
            result &&
            typeof result.then ===
              "function"
          ) {
            result
              .then(() =>
                done(null)
              )
              .catch(error =>
                done(error)
              );
          }
        } catch (error) {
          done(error);
        }
      });
    } catch (error) {
      acceptError = error;
    }
  }

  // ----------------------------------------------------
  // إرسال الترحيب
  // ----------------------------------------------------

  let hello = false;
  let helloError = null;

  try {
    await new Promise(resolve => {
      let finished = false;

      const done = error => {
        if (finished) return;

        finished = true;

        if (error) {
          helloError = error;
        } else {
          hello = true;
        }

        resolve();
      };

      try {
        const result =
          api.sendMessage(
            "اهلاً",
            tid,
            done
          );

        if (
          result &&
          typeof result.then ===
            "function"
        ) {
          result
            .then(() =>
              done(null)
            )
            .catch(error =>
              done(error)
            );
        }
      } catch (error) {
        done(error);
      }
    });
  } catch (error) {
    helloError = error;
  }

  return {
    accepted,
    hello,
    acceptError,
    helloError
  };
}

// ======================================================
// القوائم
// ======================================================

function mainMenu(
  groups,
  requests,
  other
) {
  return [
    "━━━━━━━━━━━━━━━━━━━━━━━━",
    "🗂️  S A I Y A N  •  غروبات",
    "━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `👥 الغروبات          : ${groups.length}`,
    `📩 طلبات المراسلة    : ${requests.length}`,
    `📥 Other             : ${other.length}`,
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━",
    "1️⃣ 👥 الغروبات",
    "2️⃣ 📩 طلبات المراسلة",
    "3️⃣ 📥 Other / غير مهم",
    "4️⃣ 📊 الإحصائيات",
    "",
    "↩️ أرسل رقم الخيار",
    "━━━━━━━━━━━━━━━━━━━━━━━━"
  ].join("\n");
}

function groupList(groups) {
  const shown =
    groups.slice(
      0,
      MAX_ITEMS
    );

  const lines = [
    "━━━━━━━━━━━━━━━━━━━━━━━━",
    `👥 غروبات سايان (${groups.length})`,
    "━━━━━━━━━━━━━━━━━━━━━━━━"
  ];

  if (!shown.length) {
    lines.push(
      "📭 لا توجد غروبات."
    );
  }

  shown.forEach(
    (group, index) => {
      lines.push(
        "",
        `${index + 1}️⃣ ${getName(group)}`,
        `   🆔 ${getThreadID(group)}`
      );
    }
  );

  lines.push(
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━",
    "📌 أرسل رقم الغروب لإدارته.",
    "0️⃣ ↩️ العودة"
  );

  return lines.join("\n");
}

function requestList(
  requests
) {
  const shown =
    requests.slice(
      0,
      MAX_ITEMS
    );

  const lines = [
    "━━━━━━━━━━━━━━━━━━━━━━━━",
    `📩 طلبات المراسلة (${requests.length})`,
    "━━━━━━━━━━━━━━━━━━━━━━━━"
  ];

  if (!shown.length) {
    lines.push(
      "",
      "📭 لا توجد طلبات مراسلة."
    );
  }

  shown.forEach(
    (request, index) => {
      const snippet =
        getSnippet(request);

      lines.push(
        "",
        `${index + 1}️⃣ ${getName(request)}`,
        `   🆔 ${getThreadID(request)}`
      );

      if (snippet) {
        lines.push(
          `   💬 ${snippet.slice(0, 100)}`
        );
      }
    }
  );

  lines.push(
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━",
    "📌 أرسل رقم الطلب.",
    "0️⃣ ↩️ العودة"
  );

  return lines.join("\n");
}

function otherList(
  messages
) {
  const shown =
    messages.slice(
      0,
      MAX_ITEMS
    );

  const lines = [
    "━━━━━━━━━━━━━━━━━━━━━━━━",
    `📥 Other / غير مهم (${messages.length})`,
    "━━━━━━━━━━━━━━━━━━━━━━━━"
  ];

  if (!shown.length) {
    lines.push(
      "",
      "📭 لا توجد محادثات في Other."
    );
  }

  shown.forEach(
    (thread, index) => {
      const snippet =
        getSnippet(thread);

      lines.push(
        "",
        `${index + 1}️⃣ ${getName(thread)}`,
        `   🆔 ${getThreadID(thread)}`
      );

      if (snippet) {
        lines.push(
          `   💬 ${snippet.slice(0, 100)}`
        );
      }
    }
  );

  lines.push(
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━",
    "📌 أرسل رقم المحادثة.",
    "0️⃣ ↩️ العودة"
  );

  return lines.join("\n");
}

// ======================================================
// تفاصيل الغروب
// ======================================================

function groupDetails(
  group
) {
  return [
    "━━━━━━━━━━━━━━━━━━━━━━━━",
    `👥 ${getName(group)}`,
    "━━━━━━━━━━━━━━━━━━━━━━━━",
    `🆔 Thread ID: ${getThreadID(group)}`,
    "",
    `👤 النوع: ${
      group?.isGroup
        ? "غروب"
        : "محادثة"
    }`,
    "",
    "🛠️ خيارات الإدارة:",
    "",
    "1️⃣ 📋 معلومات الغروب",
    "2️⃣ 🪶 أوامر الغروب",
    "3️⃣ 📨 إرسال رسالة",
    "0️⃣ ↩️ العودة",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━"
  ].join("\n");
}

// ======================================================
// تفاصيل الطلب
// ======================================================

function requestDetails(
  request
) {
  const snippet =
    getSnippet(request);

  return [
    "━━━━━━━━━━━━━━━━━━━━━━━━",
    "📩 طلب مراسلة",
    "━━━━━━━━━━━━━━━━━━━━━━━━",
    `👤 الاسم: ${getName(request)}`,
    `🆔 Thread ID: ${getThreadID(request)}`,
    snippet
      ? `💬 الرسالة: ${snippet}`
      : "",
    "",
    "1️⃣ ✅ قبول وإرسال «اهلاً»",
    "0️⃣ ↩️ العودة",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━"
  ]
    .filter(Boolean)
    .join("\n");
}

// ======================================================
// تفاصيل Other
// ======================================================

function otherDetails(
  thread
) {
  const snippet =
    getSnippet(thread);

  return [
    "━━━━━━━━━━━━━━━━━━━━━━━━",
    "📥 Other / محادثة",
    "━━━━━━━━━━━━━━━━━━━━━━━━",
    `👤 الاسم: ${getName(thread)}`,
    `🆔 Thread ID: ${getThreadID(thread)}`,
    snippet
      ? `💬 الرسالة: ${snippet}`
      : "",
    "",
    "1️⃣ ✅ قبول وإرسال «اهلاً»",
    "0️⃣ ↩️ العودة",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━"
  ]
    .filter(Boolean)
    .join("\n");
}

// ======================================================
// الإحصائيات
// ======================================================

function statistics(
  groups,
  requests,
  other
) {
  return [
    "━━━━━━━━━━━━━━━━━━━━━━━━",
    "📊 إحصائيات المحادثات",
    "━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `👥 الغروبات       : ${groups.length}`,
    `💬 المحادثات      : ${groups.length ? "متاحة" : "0"}`,
    `📩 طلبات المراسلة : ${requests.length}`,
    `📥 Other          : ${other.length}`,
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━",
    "0️⃣ ↩️ العودة"
  ].join("\n");
}

// ======================================================
// Reply Manager
// ======================================================

function registerReply(
  event,
  state,
  callback
) {
  if (
    !global.GoatBot?.onReply ||
    !state?.messageID
  ) {
    return;
  }

  const key =
    `ghorob_${state.messageID}`;

  global.GoatBot.onReply.set(
    key,
    {
      messageID:
        state.messageID,

      author:
        String(event.senderID),

      name:
        "غروبات",

      ts:
        Date.now(),

      callback:
        async ({
          api,
          event,
          message
        }) => {
          if (
            String(
              event.senderID
            ) !==
            String(
              state.author
            )
          ) {
            return;
          }

          const input =
            clean(
              event.body
            );

          return callback({
            api,
            event,
            message,
            input,
            state
          });
        }
    }
  );
}

// ======================================================
// إرسال قائمة + تسجيل Reply
// ======================================================

async function sendMenu(
  api,
  event,
  body,
  callback,
  state = {}
) {
  try {
    const info =
      await new Promise(
        resolve => {
          let finished = false;

          const done = (
            error,
            data
          ) => {
            if (finished) return;

            finished = true;

            resolve(
              data || {}
            );
          };

          try {
            const result =
              api.sendMessage(
                body,
                event.threadID,
                done
              );

            if (
              result &&
              typeof result.then ===
                "function"
            ) {
              result
                .then(data =>
                  done(
                    null,
                    data
                  )
                )
                .catch(() =>
                  done(
                    null,
                    {}
                  )
                );
            }
          } catch (_) {
            done(
              null,
              {}
            );
          }
        }
      );

    if (
      info?.messageID
    ) {
      registerReply(
        event,
        {
          ...state,
          messageID:
            info.messageID,
          author:
            String(
              event.senderID
            )
        },
        callback
      );
    }

    return info;
  } catch (error) {
    return null;
  }
}

// ======================================================
// إظهار القائمة الرئيسية
// ======================================================

async function showMain(
  api,
  event,
  message
) {
  let groups = [];
  let requests = [];
  let other = [];

  try {
    [
      groups,
      requests,
      other
    ] = await Promise.all([
      getGroups(api),
      getRequests(api),
      getOther(api)
    ]);
  } catch (_) {}

  return sendMenu(
    api,
    event,
    mainMenu(
      groups,
      requests,
      other
    ),
    async ({
      api,
      event,
      message,
      input,
      state
    }) => {
      if (input === "1") {
        return showGroups(
          api,
          event,
          message
        );
      }

      if (input === "2") {
        return showRequests(
          api,
          event,
          message
        );
      }

      if (input === "3") {
        return showOther(
          api,
          event,
          message
        );
      }

      if (input === "4") {
        return showStats(
          api,
          event,
          message
        );
      }

      return message.reply(
        "❌ اختر رقمًا من 1 إلى 4."
      );
    },
    {
      page: "main"
    }
  );
}

// ======================================================
// الغروبات
// ======================================================

async function showGroups(
  api,
  event,
  message
) {
  const groups =
    await getGroups(api);

  return sendMenu(
    api,
    event,
    groupList(groups),
    async ({
      api,
      event,
      message,
      input
    }) => {
      if (input === "0") {
        return showMain(
          api,
          event,
          message
        );
      }

      const index =
        Number.parseInt(
          input,
          10
        ) - 1;

      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >=
          Math.min(
            groups.length,
            MAX_ITEMS
          )
      ) {
        return message.reply(
          `❌ اختر رقمًا من 1 إلى ${Math.min(
            groups.length,
            MAX_ITEMS
          )}.`
        );
      }

      return showGroup(
        api,
        event,
        message,
        groups[index]
      );
    },
    {
      page: "groups",
      groups
    }
  );
}

// ======================================================
// تفاصيل الغروب
// ======================================================

async function showGroup(
  api,
  event,
  message,
  group
) {
  return sendMenu(
    api,
    event,
    groupDetails(group),
    async ({
      api,
      event,
      message,
      input
    }) => {
      if (input === "0") {
        return showGroups(
          api,
          event,
          message
        );
      }

      if (input === "1") {
        const members =
          group?.participantIDs ||
          group?.participants ||
          [];

        return message.reply(
          [
            "📋 معلومات الغروب",
            "━━━━━━━━━━━━━━━━━━━━━━━━",
            `👥 الاسم: ${getName(group)}`,
            `🆔 Thread ID: ${getThreadID(group)}`,
            `👤 الأعضاء: ${
              Array.isArray(members)
                ? members.length
                : "غير متاح"
            }`,
            `📌 النوع: غروب`,
            "━━━━━━━━━━━━━━━━━━━━━━━━",
            "0️⃣ العودة"
          ].join("\n")
        );
      }

      if (input === "2") {
        return message.reply(
          [
            "🛠️ أوامر الغروب",
            "━━━━━━━━━━━━━━━━━━━━━━━━",
            `🆔 ${getThreadID(group)}`,
            "",
            "يمكنك هنا ربط أوامر Saiyan بالغروب.",
            "",
            "الأوامر الموجودة في النظام:",
            "🪽 /angel",
            "🧿 /nm",
            "🪶 /nick",
            "🌌 /groupimg",
            "🏷️ /groupname",
            "━━━━━━━━━━━━━━━━━━━━━━━━"
          ].join("\n")
        );
      }

      if (input === "3") {
        return message.reply(
          [
            "📨 إرسال رسالة",
            "━━━━━━━━━━━━━━━━━━━━━━━━",
            "أرسل:",
            `send ${getThreadID(group)} رسالتك`,
            "",
            "مثال:",
            `send ${getThreadID(group)} مرحباً`,
            "━━━━━━━━━━━━━━━━━━━━━━━━"
          ].join("\n")
        );
      }

      return message.reply(
        "❌ اختيار غير صحيح."
      );
    },
    {
      page: "group",
      group
    }
  );
}

// ======================================================
// طلبات المراسلة
// ======================================================

async function showRequests(
  api,
  event,
  message
) {
  const requests =
    await getRequests(api);

  return sendMenu(
    api,
    event,
    requestList(requests),
    async ({
      api,
      event,
      message,
      input
    }) => {
      if (input === "0") {
        return showMain(
          api,
          event,
          message
        );
      }

      const index =
        Number.parseInt(
          input,
          10
        ) - 1;

      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >=
          Math.min(
            requests.length,
            MAX_ITEMS
          )
      ) {
        return message.reply(
          `❌ اختر رقمًا من 1 إلى ${Math.min(
            requests.length,
            MAX_ITEMS
          )}.`
        );
      }

      return showRequest(
        api,
        event,
        message,
        requests[index]
      );
    },
    {
      page: "requests",
      requests
    }
  );
}

// ======================================================
// تفاصيل طلب المراسلة
// ======================================================

async function showRequest(
  api,
  event,
  message,
  request
) {
  return sendMenu(
    api,
    event,
    requestDetails(request),
    async ({
      api,
      event,
      message,
      input
    }) => {
      if (input === "0") {
        return showRequests(
          api,
          event,
          message
        );
      }

      if (
        input === "1" ||
        input.toLowerCase() ===
          "قبول" ||
        input.toLowerCase() ===
          "accept"
      ) {
        const result =
          await acceptConversation(
            api,
            getThreadID(request)
          );

        if (result.hello) {
          return message.reply(
            [
              "✅ تم قبول المحادثة بنجاح.",
              `👤 ${getName(request)}`,
              `🆔 ${getThreadID(request)}`,
              "👋 تم إرسال: اهلاً"
            ].join("\n")
          );
        }

        return message.reply(
          [
            "⚠️ تمت محاولة قبول المحادثة.",
            "",
            result.acceptError?.message ||
              "لم يتم تأكيد القبول.",
            "",
            result.helloError?.message ||
              "تعذر إرسال «اهلاً»."
          ].join("\n")
        );
      }

      return message.reply(
        "❌ اختر 1 للقبول أو 0 للعودة."
      );
    },
    {
      page: "request",
      request
    }
  );
}

// ======================================================
// Other
// ======================================================

async function showOther(
  api,
  event,
  message
) {
  const messages =
    await getOther(api);

  return sendMenu(
    api,
    event,
    otherList(messages),
    async ({
      api,
      event,
      message,
      input
    }) => {
      if (input === "0") {
        return showMain(
          api,
          event,
          message
        );
      }

      const index =
        Number.parseInt(
          input,
          10
        ) - 1;

      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >=
          Math.min(
            messages.length,
            MAX_ITEMS
          )
      ) {
        return message.reply(
          `❌ اختر رقمًا من 1 إلى ${Math.min(
            messages.length,
            MAX_ITEMS
          )}.`
        );
      }

      return showOtherDetails(
        api,
        event,
        message,
        messages[index]
      );
    },
    {
      page: "other",
      messages
    }
  );
}

// ======================================================
// تفاصيل Other
// ======================================================

async function showOtherDetails(
  api,
  event,
  message,
  thread
) {
  return sendMenu(
    api,
    event,
    otherDetails(thread),
    async ({
      api,
      event,
      message,
      input
    }) => {
      if (input === "0") {
        return showOther(
          api,
          event,
          message
        );
      }

      if (
        input === "1" ||
        input.toLowerCase() ===
          "قبول" ||
        input.toLowerCase() ===
          "accept"
      ) {
        const result =
          await acceptConversation(
            api,
            getThreadID(thread)
          );

        if (result.hello) {
          return message.reply(
            [
              "✅ تمت محاولة قبول المحادثة.",
              `👤 ${getName(thread)}`,
              `🆔 ${getThreadID(thread)}`,
              "👋 تم إرسال: اهلاً"
            ].join("\n")
          );
        }

        return message.reply(
          [
            "⚠️ تعذر إكمال العملية.",
            result.acceptError?.message ||
              result.helloError?.message ||
              "خطأ غير معروف."
          ].join("\n")
        );
      }

      return message.reply(
        "❌ اختر 1 للقبول أو 0 للعودة."
      );
    },
    {
      page: "otherDetails",
      thread
    }
  );
}

// ======================================================
// الإحصائيات
// ======================================================

async function showStats(
  api,
  event,
  message
) {
  const [
    groups,
    requests,
    other
  ] = await Promise.all([
    getGroups(api),
    getRequests(api),
    getOther(api)
  ]);

  return sendMenu(
    api,
    event,
    statistics(
      groups,
      requests,
      other
    ),
    async ({
      api,
      event,
      message,
      input
    }) => {
      if (input === "0") {
        return showMain(
          api,
          event,
          message
        );
      }

      return message.reply(
        "❌ اختر 0 للعودة."
      );
    },
    {
      page: "stats"
    }
  );
}

// ======================================================
// قبول مباشر
// ======================================================

async function acceptByID(
  api,
  message,
  threadID
) {
  const tid =
    clean(threadID);

  if (!tid) {
    return message.reply(
      [
        "❌ يجب وضع Thread ID.",
        "",
        "مثال:",
        "/غروبات accept 123456789"
      ].join("\n")
    );
  }

  const result =
    await acceptConversation(
      api,
      tid
    );

  if (result.hello) {
    return message.reply(
      [
        "✅ تم قبول المحادثة.",
        `🆔 ${tid}`,
        "👋 تم إرسال: اهلاً"
      ].join("\n")
    );
  }

  return message.reply(
    [
      "⚠️ لم تكتمل العملية.",
      "",
      result.acceptError?.message ||
        "تعذر قبول الطلب.",
      result.helloError?.message ||
        "تعذر إرسال رسالة الترحيب."
    ].join("\n")
  );
}

// ======================================================
// MODULE
// ======================================================

module.exports = {
  config: {
    name: "غروبات",

    aliases: [
      "chats",
      "chat",
      "groups",
      "محادثات"
    ],

    version: "1.0",

    author: "Magnus",

    countDown: 3,

    role: 2,

    category: "management",

    description:
      "إدارة الغروبات وطلبات المراسلة ومحادثات Other",

    guide: {
      en:
        "{pn} — فتح قائمة الغروبات والمحادثات\n" +
        "{pn} accept [Thread ID] — قبول محادثة\n" +
        "{pn} count — إحصائيات المحادثات"
    }
  },

  onStart: async function ({
    api,
    event,
    args,
    message
  }) {

    // ==================================================
    // حماية الأدمن
    // ==================================================

    if (
      !isAdmin(
        event.senderID
      )
    ) {
      return message.reply(
        "⛔ هذا الأمر مخصص للأدمن فقط."
      );
    }

    // ==================================================
    // مهم: api يأتي من onStart
    // ==================================================

    if (!api) {
      return message.reply(
        "❌ API غير متوفر في هذا السياق."
      );
    }

    const sub =
      clean(
        args?.[0]
      ).toLowerCase();

    // ==================================================
    // قبول مباشر
    // ==================================================

    if (
      sub === "accept" ||
      sub === "قبول"
    ) {
      return acceptByID(
        api,
        message,
        args?.[1]
      );
    }

    // ==================================================
    // الإحصائيات
    // ==================================================

    if (
      sub === "count" ||
      sub === "احصائيات" ||
      sub === "إحصائيات"
    ) {
      return showStats(
        api,
        event,
        message
      );
    }

    // ==================================================
    // القائمة الرئيسية
    // ==================================================

    return showMain(
      api,
      event,
      message
    );
  },

  // ====================================================
  // Compatibility
  // ====================================================

  onReply: async function () {}
};
