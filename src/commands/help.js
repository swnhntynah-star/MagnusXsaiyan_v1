/**
 * SAIYAN — /help — Command Center
 * Copyright © 2026 Magnus
 * ✦ واجهة أوامر بتصميم عصري ومميز
 */
"use strict";

const CATEGORIES = [
  {
    icon: "⚔️",
    title: "التحكم والإدارة",
    cmds: [
      { name: "nm",        icon: "🧱", desc: "تثبيت اسم الغروب وحمايته" },
      { name: "nick",      icon: "🖊️", desc: "حماية كنيات الأعضاء" },
      { name: "groupimg",  icon: "🌄", desc: "تعديل وحماية صورة الغروب" },
      { name: "groupname", icon: "🏷️", desc: "تعديل اسم الغروب" },
      { name: "setavatar", icon: "🪪", desc: "تحديث صورة حساب البوت" },
      { name: "addlock",   icon: "⛓️", desc: "تثبيت عدد أعضاء الغروب" },
      { name: "thread",    icon: "🛠️", desc: "إدارة إعدادات الغروب" },
      { name: "out",       icon: "↪️", desc: "إخراج البوت من الغروب" },
    ],
  },

  {
    icon: "👤",
    title: "الأعضاء والصلاحيات",
    cmds: [
      { name: "all",      icon: "📣", desc: "مناداة جميع الأعضاء" },
      { name: "tag",      icon: "🔖", desc: "إدارة مجموعات التاق" },
      { name: "kick",     icon: "🥾", desc: "إزالة عضو من الغروب" },
      { name: "adduser",  icon: "🫱", desc: "إضافة عضو جديد" },
      { name: "addadmin", icon: "🎖️", desc: "إدارة مشرفي البوت" },
      { name: "ban",      icon: "🛑", desc: "منع مستخدم من استخدام البوت" },
      { name: "warn",     icon: "🚨", desc: "إدارة تحذيرات الأعضاء" },
      { name: "badwords", icon: "🔇", desc: "فلترة الكلمات المحددة" },
    ],
  },

  {
    icon: "📨",
    title: "الأنظمة التلقائية",
    cmds: [
      { name: "angel", icon: "🪽", desc: "إرسال رسائل بشكل دوري" },
      { name: "divel", icon: "♾️", desc: "إرسال رسائل بفواصل عشوائية" },
      { name: "greet", icon: "🤝", desc: "رسالة تعريف وترحيب" },
    ],
  },

  {
    icon: "🎬",
    title: "الوسائط والترفيه",
    cmds: [
      { name: "song",    icon: "🎧", desc: "البحث عن الأغاني وتحميلها" },
      { name: "video",   icon: "📹", desc: "البحث عن فيديوهات YouTube" },
      { name: "tiktok",  icon: "📲", desc: "تحميل محتوى TikTok" },
      { name: "sticker", icon: "🖼️", desc: "إنشاء ملصق من صورة" },
      { name: "sexvid",  icon: "🔞", desc: "محتوى للبالغين للمشرفين" },
      { name: "webvideo",icon: "🌐", desc: "البحث والتحميل من مواقع الفيديو" },
      { name: "pair",    icon: "🧲", desc: "اختيار عضوين عشوائياً" },
    ],
  },

  {
    icon: "🧠",
    title: "الذكاء والأدوات الذكية",
    cmds: [
      { name: "ai",        icon: "💡", desc: "التحدث مع الذكاء الاصطناعي" },
      { name: "imagegen",  icon: "🖌️", desc: "إنشاء صور بالذكاء الاصطناعي" },
      { name: "pinterest", icon: "🔎", desc: "العثور على صور Pinterest" },
      { name: "webss",     icon: "🗺️", desc: "التقاط صورة لموقع إلكتروني" },
    ],
  },

  {
    icon: "🧰",
    title: "الخدمات والمعلومات",
    cmds: [
      { name: "translate", icon: "🗣️", desc: "تحويل النصوص بين اللغات" },
      { name: "weather",   icon: "☁️", desc: "عرض حالة الطقس" },
      { name: "uid",       icon: "🔢", desc: "إظهار معرف فيسبوك" },
      { name: "info",      icon: "📋", desc: "عرض معلومات الغروب أو العضو" },
      { name: "ping",      icon: "📶", desc: "اختبار سرعة الاستجابة" },
      { name: "rank",      icon: "🥇", desc: "عرض المستوى ونقاط الخبرة" },
      { name: "unsend",    icon: "🧹", desc: "إزالة رسالة البوت" },
    ],
  },

  {
    icon: "💎",
    title: "النظام الاقتصادي",
    cmds: [
      {
        name: "economy",
        icon: "💰",
        desc: "الرصيد واليومي والمراهنات والتحويل"
      },
    ],
  },

  {
    icon: "🖥️",
    title: "النظام والإعدادات",
    cmds: [
      { name: "prefix",  icon: "🔧", desc: "تعديل بادئة الأوامر" },
      { name: "autoseen",icon: "👀", desc: "التحكم في مشاهدة الرسائل" },
      { name: "uptime",  icon: "⌛", desc: "معلومات التشغيل والأداء" },
      { name: "chats",   icon: "🗂️", desc: "إدارة المحادثات والغروبات" },
      { name: "getstate",icon: "🗝️", desc: "استخراج AppState للمالك" },
      { name: "help",    icon: "📖", desc: "فتح مركز الأوامر" },
    ],
  },
];

const CMD_DETAILS = {
  nm:        { usage: "/nm [اسم] / off / time [min] [max] / status", role: "🔰 Admin", cat: "الإدارة" },
  nick:      { usage: "/nick [اسم] / off / status / حدف", role: "🔰 Admin", cat: "الإدارة" },
  groupimg:  { usage: "/groupimg [رابط أو صورة] / off / status", role: "🔰 Admin", cat: "الإدارة" },
  groupname: { usage: "/groupname [الاسم الجديد]", role: "🔰 Admin", cat: "الإدارة" },
  setavatar: { usage: "/setavatar [رابط] — أو رد على صورة", role: "👑 Owner", cat: "الإدارة" },
  addlock:   { usage: "/addlock on|off|status|list|clear / [id] [روابط...]", role: "👑 Owner", cat: "الإدارة" },
  thread:    { usage: "/thread welcome [رسالة] / leave [رسالة] / status", role: "🔰 Admin", cat: "الإدارة" },
  out:       { usage: "/out — خروج البوت من الغروب الحالي", role: "👑 Owner", cat: "الإدارة" },

  all:       { usage: "/all [رسالة اختيارية] — تاق الكل", role: "🔰 Admin", cat: "الأعضاء" },
  tag:       { usage: "/tag add [اسم] @tag / [اسم] / list / remove / info", role: "🔰 Admin", cat: "الأعضاء" },
  kick:      { usage: "/kick @شخص — أو رد على رسالته", role: "🔰 Admin", cat: "الأعضاء" },
  adduser:   { usage: "/adduser [ID أو رابط] / [ID1] [ID2]", role: "🔰 Admin", cat: "الأعضاء" },
  addadmin:  { usage: "/addadmin [1-3] @tag / list / remove [ID]", role: "👑 Owner", cat: "الأعضاء" },
  ban:       { usage: "/ban @شخص / list / remove [ID]", role: "🔰 Admin", cat: "الأعضاء" },
  warn:      { usage: "/warn @شخص / clear @شخص / list", role: "🔰 Admin", cat: "الأعضاء" },
  badwords:  { usage: "/badwords on|off / add [كلمات] / remove / list / unwarn", role: "🔰 Admin", cat: "الأعضاء" },

  angel:     { usage: "/angel [رسالة] [min-max ثانية] / off / status", role: "🔰 Admin", cat: "التلقائي" },
  divel:     { usage: "/divel [رسالة] [min-max] / off / status", role: "🔰 Admin", cat: "التلقائي" },
  greet:     { usage: "/greet — رسالة ترحيبية", role: "👤 User", cat: "التلقائي" },

  song:      { usage: "/song [اسم الأغنية أو كلمات]", role: "👤 User", cat: "الوسائط" },
  video:     { usage: "/video [بحث أو رابط يوتيوب]", role: "👤 User", cat: "الوسائط" },
  tiktok:    { usage: "/tiktok [بحث أو رابط]", role: "👤 User", cat: "الوسائط" },
  tik:       { usage: "/tiktok [بحث أو رابط]", role: "👤 User", cat: "الوسائط" },
  sticker:   { usage: "/sticker — رد على صورة بالأمر", role: "👤 User", cat: "الوسائط" },
  sexvid:    { usage: "/sexvid — فيديو عشوائي 18+", role: "🔰 Admin", cat: "الوسائط" },
  webvideo:  { usage: "/webvideo [موقع] [بحث?]", role: "🔰 Admin", cat: "الوسائط" },
  pair:      { usage: "/pair — اختيار عشوائي / @شخص تحديد", role: "👤 User", cat: "الوسائط" },

  ai:        { usage: "/ai [سؤالك] / /gpt [سؤالك]", role: "👤 User", cat: "الذكاء" },
  imagegen:  { usage: "/imagegen [وصف الصورة] / /wgen [prompt]", role: "👤 User", cat: "الذكاء" },
  pinterest: { usage: "/pinterest [كلمة البحث] / /pin [كلمة]", role: "👤 User", cat: "الذكاء" },
  webss:     { usage: "/webss [رابط الموقع]", role: "👤 User", cat: "الذكاء" },

  translate: { usage: "/translate [نص] -> [كود]\n/trans مرحبا -> en", role: "👤 User", cat: "الأدوات" },
  weather:   { usage: "/weather [المدينة]", role: "👤 User", cat: "الأدوات" },
  uid:       { usage: "/uid — معرفك / رد على رسالة / @tag", role: "👤 User", cat: "الأدوات" },
  info:      { usage: "/info — معلومات الغروب / @tag معلومات شخص", role: "👤 User", cat: "الأدوات" },
  ping:      { usage: "/ping — قياس زمن الاستجابة", role: "👤 User", cat: "الأدوات" },
  rank:      { usage: "/rank — مستواك / /rank @tag — مستوى شخص", role: "👤 User", cat: "الأدوات" },
  unsend:    { usage: "/unsend — حذف آخر رسالة للبوت / رد على رسالته", role: "👤 User", cat: "الأدوات" },

  economy:   { usage: "/balance / /daily / /bet [مبلغ] / /slot [مبلغ] / /pay @شخص [مبلغ]", role: "👤 User", cat: "الاقتصاد" },

  prefix:    { usage: "/prefix [البادئة الجديدة]", role: "👑 Owner", cat: "النظام" },
  autoseen:  { usage: "/autoseen on|off|status", role: "🔰 Admin", cat: "النظام" },
  uptime:    { usage: "/uptime", role: "👤 User", cat: "النظام" },
  chats:     { usage: "/chats — اختيار غروب وتفعيل/تعطيل Angel وNM وNick\n/chats count\n/chats dm on|off", role: "🔰 Admin", cat: "النظام" },
  getstate:  { usage: "/getstate / /getstate cookie / /getstate string", role: "👑 Owner", cat: "النظام" },
  help:      { usage: "/help — /help [اسم الأمر]", role: "👤 User", cat: "النظام" },
};

const LINE = "════════════════════════════════════";

function buildHelpAll(prefix) {
  const allCmds = global.GoatBot?.commands;

  let totalCmds = 0;

  if (allCmds?.size) {
    const seen = new Set();

    for (const [, cmd] of allCmds) {
      if (cmd.config?.name) {
        seen.add(cmd.config.name);
      }
    }

    totalCmds = seen.size;
  } else {
    for (const cat of CATEGORIES) {
      totalCmds += cat.cmds.length;
    }
  }

  const lines = [];

  lines.push(LINE);
  lines.push("        ✧ S A I Y A N ✧");
  lines.push("        COMMAND CENTER");
  lines.push("");
  lines.push("   مرحباً بك في مركز أنظمة Saiyan");
  lines.push(`   المطور: Magnus   |   Prefix: ${prefix}`);
  lines.push(LINE);
  lines.push("");

  for (const cat of CATEGORIES) {

    lines.push(
      `┏━━ ${cat.icon} ${cat.title} ━━━━━━━━━━━`
    );

    for (const cmd of cat.cmds) {
      lines.push(
        `┃ ${cmd.icon} ${prefix}${cmd.name}  — ${cmd.desc}`
      );
    }

    lines.push(
      "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    );

    lines.push("");
  }

  lines.push(LINE);
  lines.push(`📚 إجمالي الأوامر المتاحة: ${totalCmds}`);
  lines.push(`🧬 محرك Saiyan يعمل باستقرار`);
  lines.push(`🔍 للتفاصيل: ${prefix}help [اسم الأمر]`);
  lines.push(LINE);

  return lines.join("\n");
}

function buildHelpOne(rawName, prefix) {

  const name =
    rawName
      .toLowerCase()
      .replace(/^\//, "");

  const allCmds =
    global.GoatBot?.commands;

  let cmd =
    allCmds?.get(name);

  if (!cmd && allCmds) {

    for (const [, c] of allCmds) {

      if (
        (c.config?.aliases || [])
          .map(a => String(a).toLowerCase())
          .includes(name)
      ) {
        cmd = c;
        break;
      }

    }
  }

  const info =
    CMD_DETAILS[name] ||
    CMD_DETAILS[cmd?.config?.name] ||
    {};

  const config =
    cmd?.config || {};

  const cmdName =
    config.name || name;

  const desc =
    config.description ||
    config.longDescription ||
    "لا توجد معلومات وصفية لهذا الأمر.";

  const usage =
    (
      config.guide?.en
        ?.replace(/\{p[n]?\}/g, prefix)
    ) ||
    info.usage ||
    `${prefix}${cmdName}`;

  const role =
    info.role ||
    (
      config.role === 3
        ? "👑 Owner"
        : config.role === 2
          ? "🔰 Admin"
          : "👤 User"
    );

  const cat =
    info.cat ||
    config.category ||
    "عام";

  const aliases =
    (config.aliases || [])
      .filter(Boolean);

  let icon = "✦";

  outer:
  for (const category of CATEGORIES) {

    for (const item of category.cmds) {

      if (
        item.name === cmdName ||
        item.name === name
      ) {
        icon = item.icon;
        break outer;
      }

    }
  }

  const lines = [];

  lines.push(LINE);
  lines.push(`        ${icon} SAIYAN`);
  lines.push(`        ${prefix}${cmdName.toUpperCase()}`);
  lines.push(LINE);
  lines.push("");

  lines.push(`📖 نبذة الأمر`);
  lines.push(`└─ ${desc}`);
  lines.push("");

  lines.push(`🧾 طريقة الاستخدام`);

  for (const line of usage.split("\n")) {
    lines.push(`└─ ${line}`);
  }

  lines.push("");

  lines.push(`🗃️ التصنيف : ${cat}`);
  lines.push(`🛡️ المستوى : ${role}`);

  if (aliases.length) {
    lines.push(
      `🔗 الاختصارات : ${aliases.join(" ، ")}`
    );
  }

  lines.push("");
  lines.push(`⚙️ Powered by SAIYAN`);
  lines.push(`✦ Developer: Magnus`);
  lines.push("");
  lines.push(LINE);

  return lines.join("\n");
}

module.exports = {

  config: {
    name: "help",

    aliases: [
      "h",
      "مساعدة",
      "أوامر",
      "commands"
    ],

    version: "6.0",
    author: "Magnus",

    countDown: 3,
    role: 0,

    category: "info",

    description:
      "مركز أوامر Saiyan الكامل",

    guide: {
      en:
        "{pn} — فتح مركز الأوامر\n" +
        "{pn} [اسم الأمر] — معلومات الأمر"
    }
  },

  onStart: async function ({
    args,
    message,
    prefix
  }) {

    if (args[0]) {

      return message.reply(
        buildHelpOne(
          args[0],
          prefix
        )
      );

    }

    return message.reply(
      buildHelpAll(prefix)
    );
  }
};  groupimg:     { usage: "/groupimg [رابط أو صورة] / off / status",             role: "🔑 Admin",  cat: "الإدارة" },
  groupname:    { usage: "/groupname [الاسم الجديد]",                            role: "🔑 Admin",  cat: "الإدارة" },
  setavatar:    { usage: "/setavatar [رابط] — أو رد على صورة",                  role: "👑 Owner",  cat: "الإدارة" },
  addlock:      { usage: "/addlock on|off|status|list|clear / [id] [روابط...]",  role: "👑 Owner",  cat: "الإدارة" },
  thread:       { usage: "/thread welcome [رسالة] / leave [رسالة] / status",    role: "🔑 Admin",  cat: "الإدارة" },
  out:          { usage: "/out — خروج البوت من الغروب الحالي",                  role: "👑 Owner",  cat: "الإدارة" },
  all:          { usage: "/all [رسالة اختيارية] — تاق الكل",                   role: "🔑 Admin",  cat: "الأعضاء" },
  tag:          { usage: "/tag add [اسم] @tag / [اسم] / list / remove / info",  role: "🔑 Admin",  cat: "الأعضاء" },
  kick:         { usage: "/kick @شخص — أو رد على رسالته",                       role: "🔑 Admin",  cat: "الأعضاء" },
  adduser:      { usage: "/adduser [ID أو رابط] / [ID1] [ID2]",                 role: "🔑 Admin",  cat: "الأعضاء" },
  addadmin:     { usage: "/addadmin [1-3] @tag / list / remove [ID]",            role: "👑 Owner",  cat: "الأعضاء" },
  ban:          { usage: "/ban @شخص / list / remove [ID]",                       role: "🔑 Admin",  cat: "الأعضاء" },
  warn:         { usage: "/warn @شخص / clear @شخص / list",                      role: "🔑 Admin",  cat: "الأعضاء" },
  badwords:     { usage: "/badwords on|off / add [كلمات] / remove / list / unwarn", role: "🔑 Admin", cat: "الأعضاء" },
  angel:        { usage: "/angel [رسالة] [min-max ثانية] / off / status",       role: "🔑 Admin",  cat: "الرسائل" },
  divel:        { usage: "/divel [رسالة] [min-max] / off / status",              role: "🔑 Admin",  cat: "الرسائل" },
  greet:        { usage: "/greet — رسالة ترحيبية",                              role: "👤 User",   cat: "الرسائل" },
  song:         { usage: "/song [اسم الأغنية أو كلمات]",                        role: "👤 User",   cat: "الترفيه" },
  video:        { usage: "/video [بحث أو رابط يوتيوب]",                          role: "👤 User",   cat: "الترفيه" },
  tiktok:       { usage: "/tiktok [بحث أو رابط]",                               role: "👤 User",   cat: "الترفيه" },
  tik:          { usage: "/tiktok [بحث أو رابط]",                               role: "👤 User",   cat: "الترفيه" },
  sticker:      { usage: "/sticker — رد على صورة بالأمر",                       role: "👤 User",   cat: "الترفيه" },
  sexvid:       { usage: "/sexvid — فيديو عشوائي 18+",                          role: "🔑 Admin",  cat: "الترفيه" },
  webvideo:     { usage: "/webvideo [موقع] [بحث?]\nمواقع: xnxx|xvideos|pornhub|xhamster|redtube|youporn\nردّ بالرقم لتحميل الفيديو", role: "🔑 Admin", cat: "الترفيه" },
  pair:         { usage: "/pair — اختيار عشوائي / @شخص تحديد",                 role: "👤 User",   cat: "الترفيه" },
  ai:           { usage: "/ai [سؤالك] / /gpt [سؤالك]",                         role: "👤 User",   cat: "الذكاء" },
  imagegen:     { usage: "/imagegen [وصف الصورة] / /wgen [prompt]",             role: "👤 User",   cat: "الذكاء" },
  pinterest:    { usage: "/pinterest [كلمة البحث] / /pin [كلمة]",              role: "👤 User",   cat: "الذكاء" },
  webss:        { usage: "/webss [رابط الموقع]",                                role: "👤 User",   cat: "الذكاء" },
  translate:    { usage: "/translate [نص] -> [كود]\n/trans مرحبا -> en",        role: "👤 User",   cat: "الأدوات" },
  weather:      { usage: "/weather [المدينة]\nمثال: /weather الجزائر",          role: "👤 User",   cat: "الأدوات" },
  uid:          { usage: "/uid — معرفك / رد على رسالة / @tag",                  role: "👤 User",   cat: "الأدوات" },
  info:         { usage: "/info — معلومات الغروب / @tag معلومات شخص",           role: "👤 User",   cat: "الأدوات" },
  ping:         { usage: "/ping — قياس زمن الاستجابة",                          role: "👤 User",   cat: "الأدوات" },
  rank:         { usage: "/rank — مستواك / /rank @tag — مستوى شخص",            role: "👤 User",   cat: "الأدوات" },
  unsend:       { usage: "/unsend — حذف آخر رسالة للبوت / رد على رسالته",      role: "👤 User",   cat: "الأدوات" },
  economy:      { usage: "/balance / /daily / /bet [مبلغ] / /slot [مبلغ] / /pay @شخص [مبلغ]", role: "👤 User", cat: "الاقتصاد" },
  prefix:       { usage: "/prefix [البادئة الجديدة] — مثال: /prefix !",         role: "👑 Owner",  cat: "النظام" },
  autoseen:     { usage: "/autoseen on|off|status",                              role: "🔑 Admin",  cat: "النظام" },
  uptime:       { usage: "/uptime",                                               role: "👤 User",   cat: "النظام" },
  chats:        { usage: "/chats — اختيار غروب وتفعيل/تعطيل Angel وNM وNick\n/chats count\n/chats dm on|off", role: "🔑 Admin",  cat: "النظام" },
  getstate:     { usage: "/getstate / /getstate cookie / /getstate string",      role: "👑 Owner",  cat: "النظام" },
  help:         { usage: "/help — /help [اسم الأمر]",                            role: "👤 User",   cat: "النظام" },
};

const LINE = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

function buildHelpAll(prefix) {
  const allCmds = global.GoatBot?.commands;
  let totalCmds = 0;
  if (allCmds?.size) {
    const seen = new Set();
    for (const [, cmd] of allCmds) { if (cmd.config?.name) seen.add(cmd.config.name); }
    totalCmds = seen.size;
  } else {
    for (const cat of CATEGORIES) totalCmds += cat.cmds.length;
  }

  const lines = [];
  lines.push(LINE);
  lines.push("  ✦  D A V I D  V 1  ✦  H Y B R I D");
  lines.push("  🤖 مساعدك الذكي على ماسنجر");
  lines.push(`  ⚡ by DJAMEL  •  Prefix: ${prefix}`);
  lines.push(LINE);
  lines.push("");

  for (const cat of CATEGORIES) {
    const padLen = Math.max(1, 22 - cat.title.length);
    lines.push(` ╔═ ${cat.icon} ${cat.title} ${"═".repeat(padLen)}╗`);
    for (const cmd of cat.cmds) {
      lines.push(` ║  ${cmd.icon}  ${prefix}${cmd.name.padEnd(13)}${cmd.desc}`);
    }
    lines.push(` ╚${"═".repeat(35)}╝`);
    lines.push("");
  }

  lines.push(LINE);
  lines.push(`  📦 الأوامر: ${totalCmds}  •  🛡 الحماية: 20 طبقة`);
  lines.push(`  ❓ ${prefix}help [اسم الأمر] ← للتفاصيل الكاملة`);
  lines.push(LINE);
  return lines.join("\n");
}

function buildHelpOne(rawName, prefix) {
  const name    = rawName.toLowerCase().replace(/^\//, "");
  const allCmds = global.GoatBot?.commands;

  let cmd = allCmds?.get(name);
  if (!cmd && allCmds) {
    for (const [, c] of allCmds) {
      if ((c.config?.aliases || []).map(a => String(a).toLowerCase()).includes(name)) {
        cmd = c; break;
      }
    }
  }

  const info    = CMD_DETAILS[name] || CMD_DETAILS[cmd?.config?.name] || {};
  const config  = cmd?.config || {};
  const cmdName = config.name || name;
  const desc    = config.description || config.longDescription || "لا يوجد وصف";
  const usage   = (config.guide?.en?.replace(/\{p[n]?\}/g, prefix)) || info.usage || `${prefix}${cmdName}`;
  const role    = info.role || (config.role === 3 ? "👑 Owner" : config.role === 2 ? "🔑 Admin" : "👤 User");
  const cat     = info.cat  || config.category || "عام";
  const aliases = (config.aliases || []).filter(Boolean);

  let icon = "•";
  outer: for (const c of CATEGORIES)
    for (const cm of c.cmds)
      if (cm.name === cmdName || cm.name === name) { icon = cm.icon; break outer; }

  const lines = [];
  lines.push(LINE);
  lines.push(`  ${icon}  ${prefix}${cmdName.toUpperCase()}`);
  lines.push(LINE);
  lines.push("");
  lines.push(`  📝 الوصف:`);
  lines.push(`     ${desc}`);
  lines.push("");
  lines.push(`  📌 الاستخدام:`);
  for (const l of usage.split("\n")) lines.push(`     ${l}`);
  lines.push("");
  lines.push(`  🏷  الفئة    : ${cat}`);
  lines.push(`  🔑 الصلاحية : ${role}`);
  if (aliases.length) lines.push(`  🔀 اختصارات : ${aliases.join("، ")}`);
  lines.push("");
  lines.push(LINE);
  return lines.join("\n");
}

module.exports = {
  config: {
    name: "help",
    aliases: ["h", "مساعدة", "أوامر", "commands"],
    version: "5.0",
    author: "DJAMEL",
    countDown: 3,
    role: 0,
    category: "info",
    description: "عرض قائمة الأوامر الكاملة — DAVID V1 Hybrid Edition",
    guide: {
      en: "{pn} — عرض كل الأوامر\n{pn} [اسم الأمر] — تفاصيل أمر محدد",
    },
  },

  onStart: async function ({ args, message, prefix }) {
    if (args[0]) {
      message.reply(buildHelpOne(args[0], prefix));
    } else {
      message.reply(buildHelpAll(prefix));
    }
  },
};
