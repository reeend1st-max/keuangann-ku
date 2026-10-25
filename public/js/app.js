/* ==========================================================================
   Keuangan Ku — Main React Application (Pure JS / UMD / React 18)
   ========================================================================== */

var useState = React.useState;
var useEffect = React.useEffect;
var useCallback = React.useCallback;

// ── Theme Design Tokens (Light & Dark Fintech Palette) ──────────────────────
var LIGHT_THEME = {
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  panel: "#F1F5F9",
  border: "#E2E8F0",
  sidebar: "#FFFFFF",
  sidebarText: "#0F172A",
  sidebarSub: "#64748B",
  teal: "#0284C7",
  tealDim: "rgba(2, 132, 199, 0.08)",
  sage: "#10B981",
  sageDim: "rgba(16, 185, 129, 0.08)",
  coral: "#EF4444",
  coralDim: "rgba(239, 68, 68, 0.08)",
  amber: "#F59E0B",
  amberDim: "rgba(245, 158, 11, 0.08)",
  sky: "#0284C7",
  skyDim: "rgba(2, 132, 199, 0.08)",
  violet: "#8B5CF6",
  violetDim: "rgba(139, 92, 246, 0.08)",
  text: "#0F172A",
  textSub: "#64748B",
  textDim: "#94A3B8",
  inputBg: "#FFFFFF"
};

var DARK_THEME = {
  bg: "#0B0F19",
  surface: "#131C2E",
  card: "#131C2E",
  panel: "#1A2438",
  border: "rgba(255, 255, 255, 0.1)",
  sidebar: "#131C2E",
  sidebarText: "#F8FAFC",
  sidebarSub: "#94A3B8",
  teal: "#38BDF8",
  tealDim: "rgba(56, 189, 248, 0.15)",
  sage: "#34D399",
  sageDim: "rgba(52, 211, 153, 0.15)",
  coral: "#F87171",
  coralDim: "rgba(248, 113, 113, 0.15)",
  amber: "#FBBF24",
  amberDim: "rgba(251, 191, 36, 0.15)",
  sky: "#38BDF8",
  skyDim: "rgba(56, 189, 248, 0.15)",
  violet: "#A78BFA",
  violetDim: "rgba(167, 139, 250, 0.15)",
  text: "#F8FAFC",
  textSub: "#94A3B8",
  textDim: "#64748B",
  inputBg: "#1A2438"
};

var initialDarkMode = false;
try {
  initialDarkMode = localStorage.getItem("keuangan_dark_mode") === "true";
} catch (e) {}
window.darkMode = initialDarkMode;

var T = Object.assign({}, initialDarkMode ? DARK_THEME : LIGHT_THEME);

function applyTheme(isDark) {
  window.darkMode = !!isDark;
  try {
    localStorage.setItem("keuangan_dark_mode", String(isDark));
  } catch (e) {}
  Object.assign(T, isDark ? DARK_THEME : LIGHT_THEME);
  if (typeof document !== "undefined" && document.body) {
    document.body.style.background = T.bg;
    document.body.style.color = T.text;
    if (isDark) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }
}

// ── Categories configuration ──────────────────────────────────────────────────
var CATS = {
  "Makan & Minum": { emoji: "🍔", color: T.amber },
  "Belanja Bulanan": { emoji: "🛒", color: "#3B82F6" },
  "Skincare": { emoji: "✨", color: T.violet },
  "Pakaian & Outfit": { emoji: "👕", color: "#EC4899" },
  "Tagihan": { emoji: "📄", color: T.coral },
  "Transportasi": { emoji: "🚗", color: T.sky },
  "Hiburan": { emoji: "🎬", color: "#6366F1" },
  "Darurat": { emoji: "🚨", color: "#EF4444" },
  "Tabungan": { emoji: "🏦", color: T.teal },
  "Donasi & Zakat": { emoji: "🤲", color: "#10B981" },
  "Lain-lain": { emoji: "📦", color: T.textSub },
};

var customCatsState = {};
try {
  var storedCC = localStorage.getItem("keuangan_custom_categories");
  if (storedCC) customCatsState = JSON.parse(storedCC);
} catch (e) {}
window.customCats = customCatsState || {};

function getCat(name) {
  var key = name;
  if (key === "Fashion") key = "Pakaian & Outfit";
  if (window.customCats && window.customCats[key]) {
    return window.customCats[key];
  }
  return CATS[key] || { emoji: "📌", color: T.textSub };
}

// Privacy Mode Global State & Helpers
var privacyModeState = false;
try {
  privacyModeState = localStorage.getItem("keuangan_privacy_mode") === "true";
} catch (e) {}
window.privacyMode = privacyModeState;

function fmt(num, forceShow) {
  if (window.privacyMode && !forceShow) {
    return "Rp ••••••••";
  }
  return "Rp " + new Intl.NumberFormat("id-ID").format(num || 0);
}

function formatRupiahInput(val) {
  if (val === null || val === undefined || val === "") return "";
  var raw = String(val).replace(/\D/g, "");
  if (!raw) return "";
  return new Intl.NumberFormat("id-ID").format(parseInt(raw, 10));
}

function parseRupiahInput(val) {
  if (!val) return 0;
  var raw = String(val).replace(/\D/g, "");
  return parseInt(raw, 10) || 0;
}

function fmtS(num, forceShow) {
  if (window.privacyMode && !forceShow) {
    return "Rp ••••••••";
  }
  var n = num || 0;
  return "Rp " + new Intl.NumberFormat("id-ID").format(n);
}

function mkKey(year, month) {
  return year + "-" + String(month).padStart(2, "0");
}

function parseD(str) {
  if (!str) return 0;
  var parts = String(str).split("/");
  if (parts.length === 3) {
    return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10)).getTime();
  }
  var d = new Date(str);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

function sortNewestFirst(items) {
  return [].concat(items || []).sort(function (a, b) {
    var da = parseD(a ? a.tanggal : "");
    var db = parseD(b ? b.tanggal : "");
    if (db !== da) return db - da;
    return String((b && b.id) || "").localeCompare(String((a && a.id) || ""));
  });
}

function todayStr() {
  var d = new Date();
  return (
    String(d.getDate()).padStart(2, "0") +
    "/" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "/" +
    d.getFullYear()
  );
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Hitung selisih hari antara tanggal jatuh tempo (DD/MM/YYYY) dan hari ini
function daysUntilDue(tanggalStr) {
  if (!tanggalStr) return null;
  var parts = String(tanggalStr).split("/");
  if (parts.length !== 3) return null;
  var due = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getBills() {
  try {
    var raw = localStorage.getItem("keuangan_upcoming_bills");
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}
function saveBills(bills) {
  try { localStorage.setItem("keuangan_upcoming_bills", JSON.stringify(bills)); } catch(e) {}
}

var MONTH_NAMES = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

// ── Financial Period Helpers (Siklus Gajian Dinamis) ─────────────────────────
function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function getEffectivePayday(year, month, targetDay) {
  var maxDays = getDaysInMonth(year, month);
  return Math.min(Math.max(1, targetDay || 28), maxDays);
}

function parseDateParts(raw, fallbackYear, fallbackMonth) {
  if (!raw) {
    if (fallbackYear && fallbackMonth !== undefined) {
      return { year: parseInt(fallbackYear, 10), month: parseInt(fallbackMonth, 10) + 1, day: 1 };
    }
    var now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  }
  if (raw instanceof Date) {
    return { year: raw.getFullYear(), month: raw.getMonth() + 1, day: raw.getDate() };
  }
  if (typeof raw === "string") {
    if (raw.indexOf("/") !== -1) {
      var p = raw.split("/");
      if (p.length === 3) {
        return { day: parseInt(p[0], 10), month: parseInt(p[1], 10), year: parseInt(p[2], 10) };
      }
    }
    if (raw.indexOf("-") !== -1) {
      var s = raw.split("T")[0].split("-");
      if (s.length === 3) {
        if (s[0].length === 4) {
          return { year: parseInt(s[0], 10), month: parseInt(s[1], 10), day: parseInt(s[2], 10) };
        } else {
          return { day: parseInt(s[0], 10), month: parseInt(s[1], 10), year: parseInt(s[2], 10) };
        }
      }
    }
  }
  var d = new Date(raw);
  if (!isNaN(d.getTime())) {
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  }
  var def = new Date();
  return { year: def.getFullYear(), month: def.getMonth() + 1, day: def.getDate() };
}

function getFinancialPeriod(transactionDate, paydayDate) {
  var payday = typeof paydayDate === "number" ? paydayDate : parseInt(paydayDate, 10) || 28;
  payday = Math.min(31, Math.max(1, payday));

  var parts = parseDateParts(transactionDate);
  var tYear = parts.year;
  var tMonth = parts.month;
  var tDay = parts.day;

  // Kasus 1: paydayDate == 1 (Siklus Kalender Reguler)
  if (payday === 1) {
    var maxD = getDaysInMonth(tYear, tMonth);
    var cKey = tYear + "-" + String(tMonth).padStart(2, "0");
    var mName = MONTH_NAMES[tMonth - 1] || "Bulan " + tMonth;

    return {
      cycleKey: cKey,
      cycleYear: tYear,
      cycleMonth: tMonth,
      cycleName: mName + " " + tYear,
      monthName: mName,
      startDate: new Date(tYear, tMonth - 1, 1),
      endDate: new Date(tYear, tMonth - 1, maxD, 23, 59, 59),
      startDateStr: "01/" + String(tMonth).padStart(2, "0") + "/" + tYear,
      endDateStr: String(maxD).padStart(2, "0") + "/" + String(tMonth).padStart(2, "0") + "/" + tYear,
      label: "Siklus " + mName + " " + tYear + " (1 - " + maxD + " " + mName.slice(0, 3) + ")"
    };
  }

  // Kasus 2: paydayDate > 1 (Siklus Gajian Dinamis)
  var effPaydayThisMonth = getEffectivePayday(tYear, tMonth, payday);

  var cycleYear, cycleMonth;
  var startYear, startMonth, startDay;
  var endYear, endMonth, endDay;

  if (tDay >= effPaydayThisMonth) {
    cycleYear = tYear;
    cycleMonth = tMonth;

    startYear = tYear;
    startMonth = tMonth;
    startDay = effPaydayThisMonth;

    if (tMonth === 12) {
      endYear = tYear + 1;
      endMonth = 1;
    } else {
      endYear = tYear;
      endMonth = tMonth + 1;
    }
    var effPaydayNext = getEffectivePayday(endYear, endMonth, payday);
    endDay = effPaydayNext - 1;
  } else {
    if (tMonth === 1) {
      cycleYear = tYear - 1;
      cycleMonth = 12;
    } else {
      cycleYear = tYear;
      cycleMonth = tMonth - 1;
    }

    startYear = cycleYear;
    startMonth = cycleMonth;
    startDay = getEffectivePayday(startYear, startMonth, payday);

    endYear = tYear;
    endMonth = tMonth;
    endDay = effPaydayThisMonth - 1;
  }

  var cMonthName = MONTH_NAMES[cycleMonth - 1] || "Bulan " + cycleMonth;
  var sMonthName = (MONTH_NAMES[startMonth - 1] || "").slice(0, 3);
  var eMonthName = (MONTH_NAMES[endMonth - 1] || "").slice(0, 3);
  var cycleKey = cycleYear + "-" + String(cycleMonth).padStart(2, "0");

  var startStr = String(startDay).padStart(2, "0") + "/" + String(startMonth).padStart(2, "0") + "/" + startYear;
  var endStr = String(endDay).padStart(2, "0") + "/" + String(endMonth).padStart(2, "0") + "/" + endYear;

  return {
    cycleKey: cycleKey,
    cycleYear: cycleYear,
    cycleMonth: cycleMonth,
    cycleName: cMonthName + " " + cycleYear,
    monthName: cMonthName,
    startDate: new Date(startYear, startMonth - 1, startDay),
    endDate: new Date(endYear, endMonth - 1, endDay, 23, 59, 59),
    startDateStr: startStr,
    endDateStr: endStr,
    label: "Siklus " + cMonthName + " " + cycleYear + " (" + startDay + " " + sMonthName + " - " + endDay + " " + eMonthName + ")"
  };
}

function groupByMonth(items, paydayDate) {
  var groups = {};
  var pDate = paydayDate || 1;
  items.forEach(function (item) {
    var rawDate = item.tanggal || item.date;
    var period = getFinancialPeriod(rawDate, pDate);
    var key = period.cycleKey;
    if (!groups[key]) {
      groups[key] = {
        key: key,
        year: period.cycleYear,
        month: period.cycleMonth - 1,
        cycleName: period.cycleName,
        label: period.label,
        period: period,
        items: []
      };
    }
    groups[key].items.push(item);
  });

  return Object.values(groups).sort(function (a, b) {
    return b.key.localeCompare(a.key);
  });
}

// ── Toast Hook (Auto-dismiss in 2s) ──────────────────────────────────────────
function useToast() {
  var _t = useState(null), toast = _t[0], setToast = _t[1];
  var show = useCallback(function (msg, type) {
    setToast({ msg: msg, type: type || "info", id: uid() });
  }, []);

  useEffect(function () {
    if (!toast) return;
    var timer = setTimeout(function () {
      setToast(null);
    }, 2000);
    return function () {
      clearTimeout(timer);
    };
  }, [toast]);

  return { toast: toast, show: show };
}

function Toast(p) {
  if (!p.toast) return null;
  var bg = p.toast.type === "error" ? T.coral : p.toast.type === "success" ? T.sage : T.sky;
  return React.createElement(
    "div",
    {
      style: {
        position: "fixed", bottom: 24, right: 24, background: bg, color: "#fff",
        padding: "10px 18px", borderRadius: 10, fontWeight: 700, fontSize: 13,
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)", zIndex: 9999, display: "flex", alignItems: "center", gap: 10,
        pointerEvents: "none", userSelect: "none", transition: "opacity 0.2s ease"
      },
    },
    React.createElement("span", null, p.toast.msg)
  );
}

// ── Reusable UI Components ────────────────────────────────────────────────────
function Chip(p) {
  var col = p.color || T.teal;
  var displayLabel = p.label;
  if (displayLabel === "Need") displayLabel = "🎯 Kebutuhan";
  if (displayLabel === "Want") displayLabel = "✨ Keinginan";
  return React.createElement(
    "span",
    { style: { background: col + "20", color: col, border: "1px solid " + col + "40", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 } },
    displayLabel
  );
}

function Btn(p) {
  var bg = p.outline ? "transparent" : p.color || T.teal;
  var color = p.outline ? p.color || T.teal : "#0A0E17";
  var border = p.outline ? "1.5px solid " + (p.color || T.teal) : "none";
  return React.createElement(
    "button",
    {
      onClick: p.onClick, disabled: p.disabled,
      style: {
        background: bg, color: color, border: border, padding: p.small ? "6px 12px" : "9px 18px",
        borderRadius: 9, fontSize: p.small ? 12 : 13, fontWeight: 700,
        cursor: p.disabled ? "not-allowed" : "pointer", opacity: p.disabled ? 0.5 : 1,
        transition: "all .15s ease", display: "inline-flex", alignItems: "center", gap: 6,
      },
    },
    p.children
  );
}

function DInput(p) {
  return React.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 5 } },
    p.label && React.createElement("label", { style: { fontSize: 11, color: T.textSub, fontWeight: 700, textTransform: "uppercase" } }, p.label),
    React.createElement("input", {
      type: p.type || "text", value: p.value, onChange: function (e) { p.onChange(e.target.value); },
      placeholder: p.placeholder, autoFocus: p.autoFocus,
      style: { background: T.panel, border: "1.5px solid " + T.border, borderRadius: 9, padding: "9px 12px", color: T.text, fontSize: 13, outline: "none", fontFamily: "inherit" },
    })
  );
}

// ── Interactive Date Picker with Month & Year Selectors ───────────────────────
function DDatePicker(p) {
  var _open = useState(false), isOpen = _open[0], setIsOpen = _open[1];

  var raw = p.value || todayStr();
  var parts = String(raw).split("/");
  var initD = parseInt(parts[0], 10) || new Date().getDate();
  var initM = parseInt(parts[1], 10) || (new Date().getMonth() + 1);
  var initY = parseInt(parts[2], 10) || new Date().getFullYear();

  var _vm = useState(initM), viewMonth = _vm[0], setViewMonth = _vm[1];
  var _vy = useState(initY), viewYear = _vy[0], setViewYear = _vy[1];

  var monthsList = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  var daysHeader = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  function handleToggleOpen() {
    if (!isOpen) {
      var pParts = String(p.value || todayStr()).split("/");
      var pM = parseInt(pParts[1], 10) || (new Date().getMonth() + 1);
      var pY = parseInt(pParts[2], 10) || new Date().getFullYear();
      setViewMonth(pM);
      setViewYear(pY);
    }
    setIsOpen(!isOpen);
  }

  function handleSelectDay(d) {
    var formatted = String(d).padStart(2, "0") + "/" + String(viewMonth).padStart(2, "0") + "/" + viewYear;
    p.onChange(formatted);
    setIsOpen(false);
  }

  function handleSetToday() {
    var now = new Date();
    var formatted = String(now.getDate()).padStart(2, "0") + "/" + String(now.getMonth() + 1).padStart(2, "0") + "/" + now.getFullYear();
    p.onChange(formatted);
    setIsOpen(false);
  }

  function handleSetYesterday() {
    var now = new Date();
    now.setDate(now.getDate() - 1);
    var formatted = String(now.getDate()).padStart(2, "0") + "/" + String(now.getMonth() + 1).padStart(2, "0") + "/" + now.getFullYear();
    p.onChange(formatted);
    setIsOpen(false);
  }

  function prevMonth() {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  var daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  var firstDayIndex = new Date(viewYear, viewMonth - 1, 1).getDay();

  var displayMonthName = monthsList[initM - 1] || "";
  var displayFormatted = initD + " " + displayMonthName + " " + initY;
  var isToday = (raw === todayStr());

  var yearOptions = [];
  for (var y = 2020; y <= 2035; y++) {
    yearOptions.push(y);
  }

  return React.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 5, position: "relative" } },
    p.label && React.createElement("label", { style: { fontSize: 11, color: T.textSub, fontWeight: 700, textTransform: "uppercase" } }, p.label),
    
    // Trigger Input Button
    React.createElement(
      "div",
      {
        onClick: handleToggleOpen,
        style: {
          background: T.panel,
          border: isOpen ? "1.5px solid " + T.teal : "1.5px solid " + T.border,
          borderRadius: 9,
          padding: "9px 12px",
          color: T.text,
          fontSize: 13,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          userSelect: "none",
          transition: "all 0.15s ease",
          boxShadow: isOpen ? "0 0 0 3px " + T.tealDim : "none"
        }
      },
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        React.createElement("span", { style: { fontSize: 15 } }, "📅"),
        React.createElement("span", { style: { fontWeight: 800 } }, displayFormatted),
        isToday && React.createElement("span", { style: { fontSize: 10, fontWeight: 800, background: T.tealDim, color: T.teal, padding: "2px 6px", borderRadius: 6 } }, "Hari Ini")
      ),
      React.createElement("span", { style: { fontSize: 11, color: T.textSub } }, isOpen ? "▲" : "▼")
    ),

    // Popover Calendar
    isOpen && React.createElement(
      React.Fragment,
      null,
      // Backdrop to close when clicking outside
      React.createElement("div", {
        onClick: function () { setIsOpen(false); },
        style: { position: "fixed", inset: 0, zIndex: 9998 }
      }),
      // Calendar Popover Box
      React.createElement(
        "div",
        {
          style: {
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 9999,
            background: T.card,
            border: "1.5px solid " + T.border,
            borderRadius: 16,
            padding: "14px 16px",
            boxShadow: "0 12px 36px rgba(0,0,0,0.25)",
            width: 310,
            maxWidth: "92vw",
            color: T.text
          }
        },
        // Month & Year Selector Header
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 12 } },
          React.createElement(
            "button",
            {
              type: "button",
              onClick: prevMonth,
              style: { background: T.panel, border: "1px solid " + T.border, color: T.text, width: 28, height: 28, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }
            },
            "◀"
          ),
          React.createElement(
            "div",
            { style: { display: "flex", gap: 6, flex: 1, justifyContent: "center" } },
            // Month Dropdown
            React.createElement(
              "select",
              {
                value: viewMonth,
                onChange: function (e) { setViewMonth(parseInt(e.target.value, 10)); },
                style: { background: T.panel, border: "1px solid " + T.border, color: T.text, padding: "4px 8px", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer", outline: "none" }
              },
              monthsList.map(function (mName, idx) {
                return React.createElement("option", { key: idx + 1, value: idx + 1 }, mName);
              })
            ),
            // Year Dropdown
            React.createElement(
              "select",
              {
                value: viewYear,
                onChange: function (e) { setViewYear(parseInt(e.target.value, 10)); },
                style: { background: T.panel, border: "1px solid " + T.border, color: T.text, padding: "4px 8px", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer", outline: "none" }
              },
              yearOptions.map(function (yr) {
                return React.createElement("option", { key: yr, value: yr }, yr);
              })
            )
          ),
          React.createElement(
            "button",
            {
              type: "button",
              onClick: nextMonth,
              style: { background: T.panel, border: "1px solid " + T.border, color: T.text, width: 28, height: 28, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }
            },
            "▶"
          )
        ),

        // Day of week labels
        React.createElement(
          "div",
          { style: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", fontSize: 10.5, fontWeight: 800, color: T.textSub, marginBottom: 8 } },
          daysHeader.map(function (dh, dIdx) {
            return React.createElement("div", { key: dh, style: { color: dIdx === 0 ? T.coral : T.textSub } }, dh);
          })
        ),

        // Days Grid
        React.createElement(
          "div",
          { style: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 12 } },
          Array.from({ length: firstDayIndex }).map(function (_, eIdx) {
            return React.createElement("div", { key: "emp-" + eIdx, style: { height: 32 } });
          }),
          Array.from({ length: daysInMonth }).map(function (_, dayIdx) {
            var dayNum = dayIdx + 1;
            var isSelected = (dayNum === initD && viewMonth === initM && viewYear === initY);
            var isSunday = (new Date(viewYear, viewMonth - 1, dayNum).getDay() === 0);

            return React.createElement(
              "button",
              {
                key: "day-" + dayNum,
                type: "button",
                onClick: function () { handleSelectDay(dayNum); },
                style: {
                  height: 32,
                  borderRadius: 8,
                  border: isSelected ? "1.5px solid " + T.teal : "1px solid transparent",
                  background: isSelected ? T.teal : "transparent",
                  color: isSelected ? "#FFFFFF" : isSunday ? T.coral : T.text,
                  fontWeight: isSelected ? 900 : 700,
                  fontSize: 12,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.12s ease"
                }
              },
              dayNum
            );
          })
        ),

        // Quick Shortcut Buttons Footer
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, paddingTop: 10, borderTop: "1px solid " + T.border } },
          React.createElement(
            "div",
            { style: { display: "flex", gap: 4 } },
            React.createElement(
              "button",
              {
                type: "button",
                onClick: handleSetToday,
                style: { background: T.panel, border: "1px solid " + T.border, color: T.text, fontSize: 11, fontWeight: 700, padding: "4px 8px", borderRadius: 6, cursor: "pointer" }
              },
              "⚡ Hari Ini"
            ),
            React.createElement(
              "button",
              {
                type: "button",
                onClick: handleSetYesterday,
                style: { background: T.panel, border: "1px solid " + T.border, color: T.text, fontSize: 11, fontWeight: 700, padding: "4px 8px", borderRadius: 6, cursor: "pointer" }
              },
              "⏪ Kemarin"
            )
          ),
          React.createElement(
            "button",
            {
              type: "button",
              onClick: function () { setIsOpen(false); },
              style: { background: "transparent", border: "none", color: T.textSub, fontSize: 11, fontWeight: 700, cursor: "pointer", padding: "4px 6px" }
            },
            "Tutup"
          )
        )
      )
    )
  );
}

function DSelect(p) {
  return React.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 5 } },
    p.label && React.createElement("label", { style: { fontSize: 11, color: T.textSub, fontWeight: 700, textTransform: "uppercase" } }, p.label),
    React.createElement(
      "select",
      {
        value: p.value, onChange: function (e) { p.onChange(e.target.value); },
        style: { background: T.panel, border: "1.5px solid " + T.border, borderRadius: 9, padding: "9px 12px", color: T.text, fontSize: 13, outline: "none", fontFamily: "inherit", cursor: "pointer" },
      },
      p.options.map(function (opt) {
        var val = typeof opt === "string" ? opt : opt.value;
        var lbl = typeof opt === "string" ? opt : opt.label;
        return React.createElement("option", { key: val, value: val }, lbl);
      })
    )
  );
}

function DToggle(p) {
  return React.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 5 } },
    p.label && React.createElement("label", { style: { fontSize: 11, color: T.textSub, fontWeight: 700, textTransform: "uppercase" } }, p.label),
    React.createElement(
      "div",
      { style: { display: "flex", background: T.panel, borderRadius: 9, padding: 3, border: "1.5px solid " + T.border } },
      p.options.map(function (opt, idx) {
        var val = typeof opt === "string" ? opt : opt.value;
        var lbl = typeof opt === "string" ? opt : opt.label;
        var active = p.value === val;
        var activeColor = p.colors ? p.colors[idx] : T.teal;
        return React.createElement(
          "button",
          {
            key: val, type: "button", onClick: function () { p.onChange(val); },
            style: { flex: 1, padding: "7px 10px", borderRadius: 7, border: "none", background: active ? activeColor : "transparent", color: active ? "#0A0E17" : T.textSub, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all .12s ease" },
          },
          lbl
        );
      })
    )
  );
}

function Modal(p) {
  if (!p.open) return null;
  return React.createElement(
    "div",
    { style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9000, padding: 16 } },
    React.createElement(
      "div",
      { style: { background: T.card, border: "1px solid " + T.border, borderRadius: 16, width: p.width || 440, maxWidth: "100%", padding: 24, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" } },
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid " + T.border } },
        React.createElement("h3", { style: { margin: 0, fontSize: 16, fontWeight: 800, color: T.text } }, p.title),
        React.createElement("button", { onClick: p.onClose, style: { background: "none", border: "none", color: T.textSub, fontSize: 18, cursor: "pointer" } }, "✕")
      ),
      p.children
    )
  );
}

function ConfirmModal(p) {
  if (!p.open) return null;
  return React.createElement(
    Modal,
    { open: p.open, onClose: p.onCancel, title: "⚠️ Konfirmasi Hapus", width: 400 },
    React.createElement(
      "div",
      { style: { fontSize: 13, color: T.text, lineHeight: 1.6 } },
      p.label
        ? React.createElement("div", null, "Yakin ingin menghapus ", React.createElement("strong", { style: { color: T.coral } }, p.label), "? Data tidak dapat dikembalikan.")
        : (p.message || "Yakin ingin menghapus transaksi ini?")
    ),
    React.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 } },
      React.createElement(Btn, { outline: true, color: T.textSub, onClick: p.onCancel }, "Batal"),
      React.createElement(Btn, { color: T.coral, onClick: p.onConfirm }, "🗑️ Ya, Hapus")
    )
  );
}

// ── Auth Screen ───────────────────────────────────────────────────────────────
function AuthScreen(p) {
  var _m = useState("login"), mode = _m[0], setMode = _m[1];
  var _e = useState(""), email = _e[0], setEmail = _e[1];
  var _u = useState(""), username = _u[0], setUsername = _u[1];
  var _pw = useState(""), password = _pw[0], setPassword = _pw[1];
  var _err = useState(""), err = _err[0], setErr = _err[1];
  var _ld = useState(false), loading = _ld[0], setLoading = _ld[1];

  function submit(e) {
    if (e) e.preventDefault();
    setErr("");
    setLoading(true);

    if (mode === "signup") {
      window.Api.register(email, username, password)
        .then(function (res) {
          setLoading(false);
          p.onAuth(res.user);
        })
        .catch(function (error) {
          setLoading(false);
          setErr(error.message);
        });
    } else {
      window.Api.login(username, password)
        .then(function (res) {
          setLoading(false);
          p.onAuth(res.user);
        })
        .catch(function (error) {
          setLoading(false);
          setErr(error.message);
        });
    }
  }

  var isUp = mode === "signup";

  return React.createElement(
    "div",
    { style: { background: T.bg, width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" } },
    React.createElement(
      "div",
      { style: { width: 400, maxWidth: "90vw", background: T.card, borderRadius: 20, padding: "36px 32px", border: "1px solid " + T.border, boxShadow: "0 24px 80px rgba(0,0,0,0.5)" } },
      React.createElement(
        "div",
        { style: { textAlign: "center", marginBottom: 24 } },
        React.createElement("div", { style: { fontSize: 44, marginBottom: 8 } }, "💰"),
        React.createElement("h1", { style: { margin: 0, fontSize: 24, fontWeight: 900, color: T.teal } }, "Keuangan Ku"),
        React.createElement("p", { style: { margin: "4px 0 0", fontSize: 13, color: T.textSub } }, "Personal Finance Tracker")
      ),
      React.createElement(
        "div",
        { style: { display: "flex", background: T.panel, borderRadius: 10, padding: 3, marginBottom: 20, border: "1px solid " + T.border } },
        React.createElement("button", { onClick: function () { setMode("login"); setErr(""); }, style: { flex: 1, padding: "8px", borderRadius: 8, border: "none", background: !isUp ? T.tealDim : "transparent", color: !isUp ? T.teal : T.textSub, fontSize: 13, fontWeight: 700, cursor: "pointer" } }, "Masuk"),
        React.createElement("button", { onClick: function () { setMode("signup"); setErr(""); }, style: { flex: 1, padding: "8px", borderRadius: 8, border: "none", background: isUp ? T.tealDim : "transparent", color: isUp ? T.teal : T.textSub, fontSize: 13, fontWeight: 700, cursor: "pointer" } }, "Daftar")
      ),
      React.createElement(
        "form",
        { onSubmit: submit, style: { display: "flex", flexDirection: "column", gap: 14 } },
        isUp && React.createElement(DInput, { label: "Email", value: email, onChange: setEmail, placeholder: "contoh@gmail.com", type: "email", autoFocus: true }),
        React.createElement(DInput, { label: isUp ? "Username" : "Email atau Username", value: username, onChange: setUsername, placeholder: isUp ? "Pilih username kamu" : "Masukkan Email atau Username", autoFocus: !isUp }),
        React.createElement(DInput, { label: "Password", value: password, onChange: setPassword, type: "password", placeholder: "Minimal 6 karakter" }),
        err && React.createElement("div", { style: { background: T.coralDim, border: "1px solid " + T.coral + "30", color: T.coral, padding: "10px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600 } }, "⚠️ ", err),
        React.createElement("button", { type: "submit", disabled: loading, style: { marginTop: 6, background: "linear-gradient(135deg," + T.teal + ",#00b882)", color: "#0A0E17", border: "none", padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: loading ? "wait" : "pointer" } }, loading ? "Memproses..." : isUp ? "Buat Akun →" : "Masuk →"),
        React.createElement(
          "button",
          {
            type: "button",
            onClick: function () {
              setLoading(true);
              window.Api.loginGuest().then(function (res) {
                setLoading(false);
                p.onAuth(res.user);
              });
            },
            style: { background: "transparent", border: "1px solid " + T.border, color: T.textSub, padding: "10px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", marginTop: 4 }
          },
          "🚀 Masuk Tanpa Akun (Mode Tamu / Offline)"
        )
      )
    )
  );
}

// ── Onboarding Name Modal ─────────────────────────────────────────────────────
function NameOnboardingModal(p) {
  var _n = useState(""), name = _n[0], setName = _n[1];
  var _err = useState(""), err = _err[0], setErr = _err[1];
  var _ld = useState(false), loading = _ld[0], setLoading = _ld[1];

  if (!p.open) return null;

  function submit() {
    if (!name.trim()) return setErr("Nama akun wajib diisi.");
    setLoading(true);
    window.Api.updateName(name)
      .then(function (res) {
        setLoading(false);
        p.onSave(res.user);
      })
      .catch(function (e) {
        setLoading(false);
        setErr(e.message);
      });
  }

  return React.createElement(
    Modal,
    { open: p.open, title: "🎉 Selamat Datang di KeuanganKu!", width: 420 },
    React.createElement("p", { style: { fontSize: 13, color: T.textSub, lineHeight: 1.6, marginBottom: 16 } }, "Silakan isi nama akun Anda (misalnya Nama Lengkap Anda) untuk personalisasi dashboard."),
    React.createElement(DInput, { label: "Nama Lengkap / Nama Akun", value: name, onChange: setName, placeholder: "Contoh: Rendi / Rendi Prasetyo", autoFocus: true }),
    err && React.createElement("div", { style: { color: T.coral, fontSize: 12, marginTop: 10, fontWeight: 600 } }, "⚠️ ", err),
    React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", marginTop: 20 } }, React.createElement(Btn, { color: T.teal, onClick: submit, disabled: loading }, loading ? "Menyimpan..." : "Simpan & Lanjutkan →"))
  );
}

// ── Add Category Modal ────────────────────────────────────────────────────────
var EMOJI_CATEGORIES = [
  { id: "populer", label: "🔥 Populer", emojis: ["🐾", "🎮", "🚴", "📚", "✈️", "🎁", "☕", "💊", "🍿", "🚗", "💼", "⭐", "🎨", "🎵", "🎧"] },
  { id: "makanan", label: "🍔 Makanan", emojis: ["🍕", "🍔", "🍟", "🌭", "🍿", "🍩", "🍦", "🍰", "🧋", "☕", "🍺", "🍜", "🍣", "🍎", "🥑"] },
  { id: "hobi", label: "🎮 Hobi", emojis: ["🎮", "🚴", "🏋️", "⚽", "🎸", "🎤", "🎧", "🎨", "📸", "🎬", "📚", "🧘", "🏕️", "🎲", "🎟️"] },
  { id: "belanja", label: "🛍️ Belanja", emojis: ["🛒", "🛍️", "✨", "💄", "👗", "👕", "👠", "💍", "💈", "🧴", "🕶️", "📱", "💻", "🎁", "🐾"] },
  { id: "rumah", label: "🏠 Rumah", emojis: ["🏠", "⚡", "💧", "📶", "📄", "🚗", "⛽", "🛵", "🔧", "🏥", "💊", "🏫", "🏦", "🚨", "📦"] }
];

function AddCategoryModal(p) {
  var _name = useState(""), name = _name[0], setName = _name[1];
  var _emoji = useState("🐾"), emoji = _emoji[0], setEmoji = _emoji[1];
  var _color = useState("#0284C7"), color = _color[0], setColor = _color[1];
  var _tab = useState("populer"), activeTab = _tab[0], setActiveTab = _tab[1];
  var _customEm = useState(""), customEm = _customEm[0], setCustomEm = _customEm[1];
  var _err = useState(""), err = _err[0], setErr = _err[1];

  if (!p.open) return null;

  var colorOptions = ["#0284C7", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6", "#EF4444", "#3B82F6", "#64748B"];
  var curCategory = EMOJI_CATEGORIES.find(function (c) { return c.id === activeTab; }) || EMOJI_CATEGORIES[0];

  function save() {
    if (!name.trim()) return setErr("Nama kategori wajib diisi.");
    var cleanName = name.trim();
    var selectedEmoji = (customEm && customEm.trim()) ? customEm.trim() : emoji;
    var custom = window.customCats || {};
    custom[cleanName] = { emoji: selectedEmoji, color: color };
    window.customCats = custom;
    try {
      localStorage.setItem("keuangan_custom_categories", JSON.stringify(custom));
    } catch (e) {}
    p.onSave(cleanName);
    setName(""); setEmoji("🐾"); setCustomEm(""); setColor("#0284C7"); setErr("");
    p.onClose();
  }

  return React.createElement(
    Modal,
    { open: p.open, onClose: p.onClose, title: "➕ Tambah Kategori Baru", width: 440 },
    React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } },
      React.createElement(DInput, { label: "Nama Kategori", value: name, onChange: setName, placeholder: "Contoh: Peliharaan, Hobi, Liburan...", autoFocus: true }),
      React.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
          React.createElement("label", { style: { fontSize: 11, color: T.textSub, fontWeight: 700, textTransform: "uppercase" } }, "Pilih Emoji Ikon"),
          React.createElement("span", { style: { fontSize: 13, fontWeight: 800, background: T.tealDim, color: T.teal, padding: "2px 8px", borderRadius: 6 } }, customEm.trim() ? customEm.trim() : emoji)
        ),
        
        // Category Tabs
        React.createElement(
          "div",
          { style: { display: "flex", gap: 4, overflowX: "auto", paddingBottom: 4 } },
          EMOJI_CATEGORIES.map(function (c) {
            var active = activeTab === c.id;
            return React.createElement(
              "button",
              {
                key: c.id, type: "button", onClick: function () { setActiveTab(c.id); },
                style: {
                  padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, border: "none",
                  background: active ? T.teal : T.panel, color: active ? "#0A0E17" : T.textSub, cursor: "pointer", whiteSpace: "nowrap"
                }
              },
              c.label
            );
          })
        ),

        // Emoji Grid Box
        React.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 6, background: T.panel, padding: 10, borderRadius: 10, border: "1.5px solid " + T.border, maxHeight: 110, overflowY: "auto" } },
          curCategory.emojis.map(function (em) {
            var active = !customEm.trim() && emoji === em;
            return React.createElement(
              "button",
              {
                key: em, type: "button",
                onClick: function () { setEmoji(em); setCustomEm(""); },
                style: { fontSize: 20, padding: "4px 8px", borderRadius: 8, border: active ? "2px solid " + T.teal : "1px solid transparent", background: active ? T.tealDim : "transparent", cursor: "pointer" }
              },
              em
            );
          })
        ),

        // Custom Emoji Input Box
        React.createElement(
          "div",
          { style: { marginTop: 4 } },
          React.createElement(DInput, {
            label: "Atau Ketik / Tempel Emoji Sendiri",
            value: customEm,
            onChange: function (v) { setCustomEm(v); },
            placeholder: "Tempel emoji dari HP/Komputer kamu di sini (misal: 🦄)..."
          })
        )
      ),

      React.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        React.createElement("label", { style: { fontSize: 11, color: T.textSub, fontWeight: 700, textTransform: "uppercase" } }, "Pilih Warna Badge"),
        React.createElement(
          "div",
          { style: { display: "flex", gap: 10, background: T.panel, padding: 10, borderRadius: 10, border: "1.5px solid " + T.border } },
          colorOptions.map(function (col) {
            var active = color === col;
            return React.createElement(
              "button",
              {
                key: col, type: "button", onClick: function () { setColor(col); },
                style: { width: 28, height: 28, borderRadius: "50%", background: col, border: active ? "3px solid #FFFFFF" : "none", boxShadow: active ? "0 0 0 2px " + col : "none", cursor: "pointer" }
              }
            );
          })
        )
      ),

      err && React.createElement("div", { style: { color: T.coral, fontSize: 12, fontWeight: 600 } }, "⚠️ ", err),
      React.createElement(
        "div",
        { style: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10, paddingTop: 14, borderTop: "1px solid " + T.border } },
        React.createElement(Btn, { outline: true, color: T.textSub, onClick: p.onClose }, "Batal"),
        React.createElement(Btn, { color: T.teal, onClick: save }, "➕ Simpan Kategori")
      )
    )
  );
}

// ── Memo Detail Modal ────────────────────────────────────────────────────────
function MemoDetailModal(p) {
  if (!p.open || !p.item) return null;
  var item = p.item;
  var _memoText = useState(""), memoText = _memoText[0], setMemoText = _memoText[1];
  var _isEditing = useState(false), isEditing = _isEditing[0], setIsEditing = _isEditing[1];

  useEffect(function () {
    if (item) {
      setMemoText(item.memo_detail || item.catatan || "");
    }
  }, [item, p.open]);

  function saveMemo() {
    if (p.onSaveMemo) {
      p.onSaveMemo(item.id, memoText);
    }
    setIsEditing(false);
  }

  var rawText = (memoText || "").trim();
  var lines = rawText ? rawText.split("\n").filter(function (l) { return l.trim().length > 0; }) : [];

  return React.createElement(
    Modal,
    { open: p.open, onClose: p.onClose, title: "📌 Memo Rincian Transaksi", width: 460 },
    React.createElement(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 14 } },
      React.createElement(
        "div",
        { style: { background: T.tealDim, border: "1.5px solid " + T.teal + "40", padding: "14px 16px", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" } },
        React.createElement(
          "div",
          null,
          React.createElement("div", { style: { fontSize: 11, color: T.textSub, fontWeight: 700 } }, item.tanggal + " · " + item.kategori),
          React.createElement("div", { style: { fontSize: 15, fontWeight: 900, color: T.text, marginTop: 2 } }, item.keperluan)
        ),
        React.createElement("div", { style: { fontSize: 16, fontWeight: 900, color: T.coral } }, "-" + fmt(item.nominal))
      ),

      isEditing ? React.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8 } },
        React.createElement("label", { style: { fontSize: 11, color: T.textSub, fontWeight: 700, textTransform: "uppercase" } }, "Edit Memo Rincian Barang (1 barang per baris)"),
        React.createElement("textarea", {
          value: memoText,
          onChange: function (e) { setMemoText(e.target.value); },
          rows: 6,
          placeholder: "Contoh:\n- Sabun Dettol 3pcs (Rp 45.000)\n- Shampoo Pantene (Rp 55.000)\n- Odol & Sikat (Rp 30.000)",
          style: {
            width: "100%", background: T.panel, border: "1.5px solid " + T.border, borderRadius: 10, padding: 12,
            color: T.text, fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box"
          }
        }),
        React.createElement(
          "div",
          { style: { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 } },
          React.createElement(Btn, { outline: true, color: T.textSub, onClick: function () { setIsEditing(false); } }, "Batal"),
          React.createElement(Btn, { color: T.teal, onClick: saveMemo }, "💾 Simpan Memo")
        )
      ) : React.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 10 } },
        React.createElement(
          "div",
          { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
          React.createElement("label", { style: { fontSize: 11, color: T.textSub, fontWeight: 700, textTransform: "uppercase" } }, "📋 Rincian Barang Spesifik"),
          React.createElement("button", { onClick: function () { setIsEditing(true); }, style: { background: "none", border: "none", color: T.teal, fontSize: 12, fontWeight: 800, cursor: "pointer" } }, "✏️ Edit Rincian")
        ),
        lines.length > 0 ? React.createElement(
          "div",
          { style: { background: T.panel, border: "1.5px solid " + T.border, borderRadius: 12, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto" } },
          lines.map(function (line, idx) {
            return React.createElement(
              "div",
              { key: idx, style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.text, padding: "4px 0", borderBottom: idx < lines.length - 1 ? "1px solid " + T.border + "60" : "none" } },
              React.createElement("span", { style: { color: T.teal, fontWeight: 800 } }, "•"),
              React.createElement("span", { style: { flex: 1 } }, line)
            );
          })
        ) : React.createElement(
          "div",
          { style: { background: T.panel, border: "1.5px dashed " + T.border, borderRadius: 12, padding: 24, textAlign: "center", color: T.textSub, fontSize: 13 } },
          "Belum ada rincian barang spesifik.",
          React.createElement("div", { style: { marginTop: 8 } }, React.createElement(Btn, { color: T.teal, onClick: function () { setIsEditing(true); } }, "+ Tambah Rincian Barang"))
        )
      ),

      React.createElement(
        "div",
        { style: { display: "flex", justifyContent: "flex-end", marginTop: 10, paddingTop: 14, borderTop: "1px solid " + T.border } },
        React.createElement(Btn, { outline: true, color: T.textSub, onClick: p.onClose }, "Tutup")
      )
    )
  );
}

// ── Expense Form ──────────────────────────────────────────────────────────────
function ExpenseForm(p) {
  var _t = useState(todayStr()), tanggal = _t[0], setTanggal = _t[1];
  var _k = useState("Makan & Minum"), keperluan = _k[0], setKeperluan = _k[1];
  var _cat = useState("Makan & Minum"), kategori = _cat[0], setKategori = _cat[1];
  var _nom = useState(""), nominal = _nom[0], setNominal = _nom[1];
  var _bay = useState("Transfer"), bayar = _bay[0], setBayar = _bay[1];
  var _nw = useState("Need"), nw = _nw[0], setNw = _nw[1];
  var _c = useState(""), catatan = _c[0], setCatatan = _c[1];
  var _md = useState(""), memoDetail = _md[0], setMemoDetail = _md[1];
  var _err = useState(""), err = _err[0], setErr = _err[1];
  var _sac = useState(false), showAddCat = _sac[0], setShowAddCat = _sac[1];
  var _isRpt = useState(false), isRepeatTmpl = _isRpt[0], setIsRepeatTmpl = _isRpt[1];

  useEffect(function () {
    if (p.initial) {
      setTanggal(p.initial.tanggal || todayStr());
      setKeperluan(p.initial.keperluan || "");
      setKategori(p.initial.kategori || "Makan & Minum");
      setNominal(formatRupiahInput(p.initial.nominal || ""));
      setBayar(p.initial.bayar || "Transfer");
      setNw(p.initial.nw || "Need");
      setCatatan(p.initial.catatan || "");
      setMemoDetail(p.initial.memo_detail || p.initial.memo || "");
      setIsRepeatTmpl(false);
    } else {
      setTanggal(todayStr()); setKeperluan(""); setKategori("Makan & Minum");
      setNominal(""); setBayar("Transfer"); setNw("Need"); setCatatan(""); setMemoDetail("");
      setIsRepeatTmpl(false);
    }
    setErr("");
  }, [p.initial, p.open]);

  if (!p.open) return null;

  var allCatKeys = Object.keys(CATS).concat(Object.keys(window.customCats || {})).filter(function (v, i, a) { return a.indexOf(v) === i; });

  function save() {
    setErr("");
    var nom = parseRupiahInput(nominal);
    if (!keperluan.trim()) return setErr("Keperluan pengeluaran wajib diisi.");
    if (!nom || nom <= 0) return setErr("Nominal pengeluaran harus lebih dari 0.");
    if (!tanggal) return setErr("Tanggal wajib diisi.");

    var parts = tanggal.split("/");
    var d = parseInt(parts[0]) || 1;
    var m = (parseInt(parts[1]) || 1) - 1;
    var y = parseInt(parts[2]) || new Date().getFullYear();

    var item = {
      id: p.initial ? p.initial.id : uid(),
      month_id: mkKey(y, m),
      year: y,
      month: m,
      tanggal: tanggal,
      keperluan: keperluan,
      kategori: kategori,
      nominal: nom,
      bayar: bayar,
      nw: nw,
      catatan: catatan,
      memo_detail: memoDetail,
    };

    if (isRepeatTmpl && window.Api && window.Api.saveRepeatTemplate) {
      window.Api.saveRepeatTemplate({
        id: "rpt_" + Date.now(),
        keperluan: keperluan,
        kategori: kategori,
        nominal: nom,
        bayar: bayar,
        nw: nw,
        memo_detail: memoDetail
      });
      if (p.showToast) p.showToast("Berhasil disimpan sebagai Templat Repeat Order!", "success");
    }

    p.onSave(item);
    p.onClose();
  }

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      Modal,
      { open: p.open, onClose: p.onClose, title: p.initial ? "✏️ Edit Pengeluaran" : "➕ Tambah Pengeluaran", width: 500 },
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 } },
        React.createElement(DDatePicker, { label: "Tanggal Pengeluaran", value: tanggal, onChange: setTanggal }),
        React.createElement(DInput, { label: "Nominal (Rp)", value: nominal, onChange: function (v) { setNominal(formatRupiahInput(v)); }, placeholder: "0" })
      ),
      React.createElement("div", { style: { marginBottom: 14 } }, React.createElement(DInput, { label: "Keperluan / Deskripsi", value: keperluan, onChange: setKeperluan, placeholder: "Contoh: Makan siang, Beli baju...", autoFocus: true })),
      React.createElement(
        "div",
        { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 } },
        React.createElement(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: 5 } },
          React.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
            React.createElement("label", { style: { fontSize: 11, color: T.textSub, fontWeight: 700, textTransform: "uppercase" } }, "Kategori"),
            React.createElement(
              "button",
              {
                type: "button", onClick: function () { setShowAddCat(true); },
                style: { background: "none", border: "none", color: T.teal, fontSize: 11, fontWeight: 800, cursor: "pointer", padding: 0 }
              },
              "+ Kategori Baru"
            )
          ),
          React.createElement(DSelect, {
            value: kategori,
            onChange: function (val) {
              if (val === "➕ Tambah Kategori Baru...") {
                setShowAddCat(true);
              } else {
                setKategori(val);
              }
            },
            options: allCatKeys.concat(["➕ Tambah Kategori Baru..."])
          })
        ),
        React.createElement(DToggle, {
          label: "Kebutuhan / Keinginan",
          value: nw,
          onChange: setNw,
          options: [
            { label: "🎯 Kebutuhan", value: "Need" },
            { label: "✨ Keinginan", value: "Want" }
          ],
          colors: [T.sky, T.violet]
        })
      ),
      React.createElement("div", { style: { marginBottom: 14 } }, React.createElement(DSelect, { label: "Metode Pembayaran", value: bayar, onChange: setBayar, options: ["Transfer", "M-Banking", "E-Wallet", "Cash", "QRIS", "Debit", "Kredit"] })),
      React.createElement("div", { style: { marginBottom: 14 } }, React.createElement(DInput, { label: "Catatan Ringkas (opsional)", value: catatan, onChange: setCatatan, placeholder: "Keterangan singkat..." })),
      
      // Memo Detail Text Area
      React.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 5, marginBottom: 10 } },
        React.createElement("label", { style: { fontSize: 11, color: T.teal, fontWeight: 800, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 } }, "📌 Memo / Rincian Barang Spesifik (opsional)"),
        React.createElement("textarea", {
          value: memoDetail,
          onChange: function (e) { setMemoDetail(e.target.value); },
          rows: 3,
          placeholder: "Tulis rincian barang di sini (misal: Sabun Dettol 45k, Shampoo 55k, Odol 30k...)",
          style: {
            width: "100%", background: T.panel, border: "1.5px solid " + T.border, borderRadius: 10, padding: 10,
            color: T.text, fontSize: 12, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box"
          }
        })
      ),

      React.createElement(
        "label",
        { style: { fontSize: 11, color: T.teal, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginTop: 10 } },
        React.createElement("input", { type: "checkbox", checked: isRepeatTmpl, onChange: function (e) { setIsRepeatTmpl(e.target.checked); } }),
        "🔁 Simpan transaksi ini sebagai Templat Repeat Order (Belanja Berulang)"
      ),

      err && React.createElement("div", { style: { color: T.coral, fontSize: 12, marginTop: 10, fontWeight: 600 } }, "⚠️ ", err),
      React.createElement(
        "div",
        { style: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16, paddingTop: 14, borderTop: "1px solid " + T.border } },
        React.createElement(Btn, { outline: true, color: T.textSub, onClick: p.onClose }, "Batal"),
        React.createElement(Btn, { color: T.coral, onClick: save }, "💾 ", p.initial ? "Simpan Perubahan" : "Tambah Pengeluaran")
      )
    ),
    React.createElement(AddCategoryModal, {
      open: showAddCat,
      onClose: function () { setShowAddCat(false); },
      onSave: function (newCatName) {
        setKategori(newCatName);
        if (p.showToast) p.showToast("Kategori '" + newCatName + "' berhasil ditambahkan!", "success");
      }
    })
  );
}

// ── Income Form ───────────────────────────────────────────────────────────────
function IncomeForm(p) {
  var _t = useState(todayStr()), tanggal = _t[0], setTanggal = _t[1];
  var _s = useState("Gajian"), sumber = _s[0], setSumber = _s[1];
  var _nom = useState(""), nominal = _nom[0], setNominal = _nom[1];
  var _m = useState("Transfer"), metode = _m[0], setMetode = _m[1];
  var _c = useState(""), catatan = _c[0], setCatatan = _c[1];
  var _err = useState(""), err = _err[0], setErr = _err[1];

  useEffect(function () {
    if (p.initial) {
      setTanggal(p.initial.tanggal || todayStr());
      setSumber(p.initial.sumber || "Gajian");
      setNominal(formatRupiahInput(p.initial.nominal || ""));
      setMetode(p.initial.metode || "Transfer");
      setCatatan(p.initial.catatan || "");
    } else {
      setTanggal(todayStr()); setSumber("Gajian"); setNominal(""); setMetode("Transfer"); setCatatan("");
    }
    setErr("");
  }, [p.initial, p.open]);

  if (!p.open) return null;

  function save() {
    setErr("");
    var nom = parseRupiahInput(nominal);
    if (!sumber.trim()) return setErr("Sumber pemasukan wajib diisi.");
    if (!nom || nom <= 0) return setErr("Nominal pemasukan harus lebih dari 0.");
    if (!tanggal) return setErr("Tanggal wajib diisi.");

    var parts = tanggal.split("/");
    var d = parseInt(parts[0]) || 1;
    var m = (parseInt(parts[1]) || 1) - 1;
    var y = parseInt(parts[2]) || new Date().getFullYear();

    var item = {
      id: p.initial ? p.initial.id : uid(),
      month_id: mkKey(y, m),
      year: y,
      month: m,
      tanggal: tanggal,
      sumber: sumber,
      nominal: nom,
      metode: metode,
      catatan: catatan,
    };
    p.onSave(item);
    p.onClose();
  }

  return React.createElement(
    Modal,
    { open: p.open, onClose: p.onClose, title: p.initial ? "✏️ Edit Pemasukan" : "💵 Tambah Pemasukan", width: 480 },
    React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 } },
      React.createElement(DDatePicker, { label: "Tanggal Pemasukan", value: tanggal, onChange: setTanggal }),
      React.createElement(DInput, { label: "Nominal (Rp)", value: nominal, onChange: function (v) { setNominal(formatRupiahInput(v)); }, placeholder: "0" })
    ),
    React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 } },
      React.createElement(DInput, { label: "Sumber Pemasukan", value: sumber, onChange: setSumber, placeholder: "Gajian, Lemburan, Bonus...", autoFocus: true }),
      React.createElement(DSelect, { label: "Metode Penerimaan", value: metode, onChange: setMetode, options: ["Transfer", "M-Banking", "E-Wallet", "Cash", "QRIS", "Debit", "Kredit"] })
    ),
    React.createElement(DInput, { label: "Catatan Tambahan (opsional)", value: catatan, onChange: setCatatan, placeholder: "Keterangan..." }),
    err && React.createElement("div", { style: { color: T.coral, fontSize: 12, marginTop: 10, fontWeight: 600 } }, "⚠️ ", err),
    React.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, paddingTop: 16, borderTop: "1px solid " + T.border } },
      React.createElement(Btn, { outline: true, color: T.textSub, onClick: p.onClose }, "Batal"),
      React.createElement(Btn, { color: T.sage, onClick: save }, "💾 ", p.initial ? "Simpan Perubahan" : "Tambah Pemasukan")
    )
  );
}

// ── Saving Form Modal (Setoran & Penarikan Tabungan) ───────────────────────
function SavingForm(p) {
  if (!p.open) return null;

  var _t = useState(p.initial ? p.initial.tipe : (p.defaultTipe || "setoran")), tipe = _t[0], setTipe = _t[1];
  var _lok = useState(p.initial ? (p.initial.lokasi || "KROM") : "KROM"), lokasi = _lok[0], setLokasi = _lok[1];
  var _n = useState(p.initial ? formatRupiahInput(p.initial.nominal) : ""), nominal = _n[0], setNominal = _n[1];
  var _dt = useState(p.initial ? p.initial.tanggal : todayStr()), tanggal = _dt[0], setTanggal = _dt[1];
  var _c = useState(p.initial ? p.initial.catatan : ""), catatan = _c[0], setCatatan = _c[1];
  var _e = useState(""), err = _e[0], setErr = _e[1];

  useEffect(function () {
    if (p.open) {
      setTipe(p.initial ? p.initial.tipe : (p.defaultTipe || "setoran"));
      setLokasi(p.initial ? (p.initial.lokasi || "KROM") : "KROM");
      setNominal(p.initial ? formatRupiahInput(p.initial.nominal) : "");
      setTanggal(p.initial ? p.initial.tanggal : todayStr());
      setCatatan(p.initial ? p.initial.catatan : "");
      setErr("");
    }
  }, [p.open, p.initial, p.defaultTipe]);

  var save = function () {
    var num = parseRupiahInput(nominal);
    if (!num || num <= 0) return setErr("Masukkan nominal tabungan yang valid!");
    if (!tanggal.trim()) return setErr("Masukkan tanggal!");

    p.onSave({
      id: p.initial ? p.initial.id : String(Date.now()),
      tipe: tipe,
      lokasi: lokasi,
      nominal: num,
      tanggal: tanggal.trim(),
      catatan: catatan.trim(),
    });

    p.showToast(p.initial ? "Mutasi tabungan diperbarui!" : (tipe === "setoran" ? "Setoran tabungan berhasil ditambahkan!" : "Penarikan tabungan berhasil ditambahkan!"), "success");
    p.onClose();
  };

  var isStor = tipe === "setoran";

  return React.createElement(
    Modal,
    { title: p.initial ? "Edit Mutasi Tabungan" : (isStor ? "💚 Setor Tabungan" : "🟡 Tarik Tabungan"), open: p.open, onClose: p.onClose },
    React.createElement(
      "div",
      { style: { display: "flex", gap: 10, marginBottom: 16 } },
      React.createElement(
        "button",
        {
          onClick: function () { setTipe("setoran"); },
          style: {
            flex: 1, padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: "pointer",
            border: isStor ? "2px solid " + T.sage : "1px solid " + T.border,
            background: isStor ? T.sageDim : T.panel, color: isStor ? T.sage : T.textSub,
          },
        },
        "💚 Setoran Tabungan"
      ),
      React.createElement(
        "button",
        {
          onClick: function () { setTipe("penarikan"); },
          style: {
            flex: 1, padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: "pointer",
            border: !isStor ? "2px solid " + T.amber : "1px solid " + T.border,
            background: !isStor ? T.amberDim : T.panel, color: !isStor ? T.amber : T.textSub,
          },
        },
        "🟡 Penarikan Tabungan"
      )
    ),
    React.createElement(
      "div",
      { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 } },
      React.createElement(DSelect, { label: "Lokasi / Platform Tabungan", value: lokasi, onChange: setLokasi, options: ["KROM", "JAGO", "BIBIT", "BCA", "SEABANK", "Lainnya"] }),
      React.createElement(DDatePicker, { label: "Tanggal Tabungan", value: tanggal, onChange: setTanggal })
    ),
    React.createElement(
      "div",
      { style: { marginBottom: 12 } },
      React.createElement(DInput, { label: "Nominal (Rp)", value: nominal, onChange: function (v) { setNominal(formatRupiahInput(v)); }, placeholder: "0", autoFocus: true })
    ),
    React.createElement(DInput, { label: "Catatan / Keterangan", value: catatan, onChange: setCatatan, placeholder: "Contoh: Tabungan Nikah, Dana Darurat..." }),
    err && React.createElement("div", { style: { color: T.coral, fontSize: 12, marginTop: 10, fontWeight: 600 } }, "⚠️ ", err),
    React.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, paddingTop: 16, borderTop: "1px solid " + T.border } },
      React.createElement(Btn, { outline: true, color: T.textSub, onClick: p.onClose }, "Batal"),
      React.createElement(Btn, { color: isStor ? T.sage : T.amber, onClick: save }, "💾 ", p.initial ? "Simpan Perubahan" : (isStor ? "Simpan Setoran" : "Simpan Penarikan"))
    )
  );
}

// ── Tabungan View ─────────────────────────────────────────────────────────────
function TabunganView(p) {
  var setoran = (p.savings || []).filter(function (s) { return s.tipe === "setoran"; });
  var penarikan = (p.savings || []).filter(function (s) { return s.tipe === "penarikan"; });
  var tSetor = setoran.reduce(function (a, s) { return a + (s.nominal || 0); }, 0);
  var tTarik = penarikan.reduce(function (a, s) { return a + (s.nominal || 0); }, 0);
  var saldo = tSetor - tTarik;

  var _fTipe = useState("Semua"), fTipe = _fTipe[0], setFTipe = _fTipe[1];
  var _fLoc = useState("Semua"), fLoc = _fLoc[0], setFLoc = _fLoc[1];
  var _search = useState(""), search = _search[0], setSearch = _search[1];

  var ALL_LOCS = ["KROM", "JAGO", "BIBIT", "BCA", "SEABANK", "Lainnya"];
  var LOC_META = {
    KROM: { color: "#2563EB", bg: "rgba(37, 99, 235, 0.1)", icon: "🏛️" },
    JAGO: { color: "#D97706", bg: "rgba(217, 119, 6, 0.1)", icon: "🦊" },
    BIBIT: { color: "#059669", bg: "rgba(5, 150, 105, 0.1)", icon: "🌱" },
    BCA: { color: "#0284C7", bg: "rgba(2, 132, 199, 0.1)", icon: "🏦" },
    SEABANK: { color: "#7C3AED", bg: "rgba(124, 58, 237, 0.1)", icon: "🌊" },
    Lainnya: { color: "#475569", bg: "rgba(71, 85, 105, 0.1)", icon: "📁" }
  };

  var locAlloc = ALL_LOCS.map(function (loc) {
    var s = (p.savings || []).filter(function (x) { return (x.lokasi || "KROM") === loc && x.tipe === "setoran"; }).reduce(function (a, x) { return a + (x.nominal || 0); }, 0);
    var t = (p.savings || []).filter(function (x) { return (x.lokasi || "KROM") === loc && x.tipe === "penarikan"; }).reduce(function (a, x) { return a + (x.nominal || 0); }, 0);
    return { name: loc, net: s - t };
  });

  var activeAlloc = locAlloc.filter(function (d) { return d.net > 0; });
  var totalAllocNet = activeAlloc.reduce(function (a, d) { return a + d.net; }, 0);

  var filteredSavings = (p.savings || []).filter(function (item) {
    if (fTipe !== "Semua" && item.tipe !== fTipe) return false;
    if (fLoc !== "Semua" && (item.lokasi || "KROM") !== fLoc) return false;
    if (search) {
      var q = search.toLowerCase();
      var matchCatatan = (item.catatan || "").toLowerCase().indexOf(q) >= 0;
      var matchLokasi = (item.lokasi || "KROM").toLowerCase().indexOf(q) >= 0;
      var matchTanggal = (item.tanggal || "").indexOf(q) >= 0;
      if (!matchCatatan && !matchLokasi && !matchTanggal) return false;
    }
    return true;
  });

  var sortedSavings = sortNewestFirst(filteredSavings);

  function pill(label, active, col, fn) {
    return React.createElement(
      "button",
      {
        key: label,
        onClick: fn,
        style: {
          padding: "6px 14px",
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 700,
          border: active ? "1.5px solid " + col : "1px solid " + T.border,
          background: active ? col : "#FFFFFF",
          color: active ? "#FFFFFF" : T.textSub,
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "all 0.15s ease",
          boxShadow: active ? "0 2px 6px " + col + "40" : "none"
        }
      },
      label
    );
  }

  return React.createElement(
    "div",
    { style: { padding: "24px 28px 40px", maxWidth: 1280, margin: "0 auto", width: "100%", boxSizing: "border-box" } },

    // 1. HERO VAULT CARD (Wise / Revolut Dark Theme)
    React.createElement(
      "div",
      {
        style: {
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          borderRadius: 24,
          padding: "26px 30px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          marginBottom: 24,
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.1)",
          color: "#FFFFFF"
        }
      },
      // Header Label & Status Tag
      React.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 } },
        React.createElement(
          "span",
          { style: { fontSize: 11, color: "rgba(255, 255, 255, 0.7)", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.2 } },
          "PORTOFOLIO TABUNGAN & SIMPANAN"
        ),
        React.createElement(
          "span",
          { style: { background: "rgba(16, 185, 129, 0.15)", color: "#34D399", border: "1px solid rgba(16, 185, 129, 0.3)", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 } },
          "💎 Dana Cadangan Aktif"
        )
      ),

      // Balance & Action Buttons Row
      React.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 18 } },
        React.createElement(
          "div",
          null,
          React.createElement("div", { style: { fontSize: 34, fontWeight: 900, letterSpacing: -0.5, color: "#FFFFFF" } }, fmt(saldo)),
          React.createElement(
            "div",
            { style: { fontSize: 12, color: "rgba(255, 255, 255, 0.7)", marginTop: 4 } },
            "Total saldo bersih yang disimpan di " + activeAlloc.length + " platform perbankan / investasi"
          )
        ),
        React.createElement(
          "div",
          { style: { display: "flex", gap: 10, flexWrap: "wrap" } },
          React.createElement(
            "button",
            {
              onClick: function () { p.onAdd("setoran"); },
              style: {
                background: "#059669",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 12,
                padding: "10px 18px",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)",
                transition: "all 0.15s ease"
              }
            },
            "💚 + Setor Tabungan"
          ),
          React.createElement(
            "button",
            {
              onClick: function () { p.onAdd("penarikan"); },
              style: {
                background: "rgba(255, 255, 255, 0.12)",
                color: "#FFFFFF",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: 12,
                padding: "10px 18px",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s ease"
              }
            },
            "🟡 - Tarik Tabungan"
          )
        )
      ),

      // Integrated Stats Strip
      React.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 14,
            marginTop: 22,
            paddingTop: 18,
            borderTop: "1px solid rgba(255, 255, 255, 0.1)"
          }
        },
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 10 } },
          React.createElement("div", { style: { width: 34, height: 34, borderRadius: 10, background: "rgba(16, 185, 129, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 } }, "↗"),
          React.createElement(
            "div",
            null,
            React.createElement("div", { style: { fontSize: 11, color: "rgba(255,255,255,0.65)", fontWeight: 700 } }, "TOTAL DISETOR"),
            React.createElement("div", { style: { fontSize: 15, fontWeight: 800, color: "#34D399", marginTop: 1 } }, "+" + fmt(tSetor))
          )
        ),
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 10 } },
          React.createElement("div", { style: { width: 34, height: 34, borderRadius: 10, background: "rgba(245, 158, 11, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 } }, "↘"),
          React.createElement(
            "div",
            null,
            React.createElement("div", { style: { fontSize: 11, color: "rgba(255,255,255,0.65)", fontWeight: 700 } }, "TOTAL DITARIK"),
            React.createElement("div", { style: { fontSize: 15, fontWeight: 800, color: "#FBBF24", marginTop: 1 } }, "-" + fmt(tTarik))
          )
        ),
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 10 } },
          React.createElement("div", { style: { width: 34, height: 34, borderRadius: 10, background: "rgba(2, 132, 199, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 } }, "🏦"),
          React.createElement(
            "div",
            null,
            React.createElement("div", { style: { fontSize: 11, color: "rgba(255,255,255,0.65)", fontWeight: 700 } }, "JUMLAH TRANSAKSI"),
            React.createElement("div", { style: { fontSize: 15, fontWeight: 800, color: "#38BDF8", marginTop: 1 } }, (p.savings || []).length + " Mutasi")
          )
        )
      )
    ),

    // 2. ASSET ALLOCATION GRID & STACKED BAR
    activeAlloc.length > 0 && React.createElement(
      "div",
      {
        style: {
          background: T.card,
          border: "1px solid " + T.border,
          borderRadius: 20,
          padding: "20px 24px",
          marginBottom: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
        }
      },
      React.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 } },
        React.createElement("span", { style: { fontSize: 13, fontWeight: 800, color: T.text } }, "📊 Distribusi Aset per Platform"),
        React.createElement("span", { style: { fontSize: 11, fontWeight: 800, color: T.teal } }, activeAlloc.length + " Platform Terhubung")
      ),
      // Multi-segment progress bar
      React.createElement(
        "div",
        { style: { height: 10, background: "#F1F5F9", borderRadius: 5, overflow: "hidden", display: "flex", marginBottom: 16 } },
        activeAlloc.map(function (d) {
          var pct = totalAllocNet > 0 ? (d.net / totalAllocNet) * 100 : 0;
          var meta = LOC_META[d.name] || LOC_META.Lainnya;
          return React.createElement("div", {
            key: d.name,
            title: d.name + ": " + Math.round(pct) + "% (" + fmt(d.net) + ")",
            style: { height: "100%", width: pct + "%", background: meta.color, transition: "width .3s ease" }
          });
        })
      ),
      // Platform Cards Grid
      React.createElement(
        "div",
        { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 } },
        activeAlloc.map(function (d) {
          var pct = totalAllocNet > 0 ? ((d.net / totalAllocNet) * 100).toFixed(1) : 0;
          var meta = LOC_META[d.name] || LOC_META.Lainnya;
          return React.createElement(
            "div",
            {
              key: d.name,
              style: {
                background: T.panel,
                border: "1px solid " + T.border,
                borderRadius: 14,
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 4
              }
            },
            React.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
              React.createElement("span", { style: { fontSize: 12, fontWeight: 800, color: T.text, display: "flex", alignItems: "center", gap: 5 } }, meta.icon, " ", d.name),
              React.createElement("span", { style: { fontSize: 11, fontWeight: 800, color: meta.color } }, pct + "%")
            ),
            React.createElement("div", { style: { fontSize: 15, fontWeight: 900, color: T.text, marginTop: 4 } }, fmt(d.net))
          );
        })
      )
    ),

    // 3. ACTION BAR: Search & Platform/Type Filters
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16
        }
      },
      React.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flex: 1, minWidth: 260, flexWrap: "wrap" } },
        React.createElement("input", {
          value: search,
          onChange: function (e) { setSearch(e.target.value); },
          placeholder: "🔍 Cari catatan atau tanggal...",
          style: {
            background: T.panel,
            border: "1px solid " + T.border,
            borderRadius: 10,
            padding: "8px 14px",
            color: T.text,
            fontSize: 12,
            outline: "none",
            width: 220,
            boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
          }
        }),
        React.createElement(
          "div",
          { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
          pill("Semua Mutasi", fTipe === "Semua", T.teal, function () { setFTipe("Semua"); }),
          pill("💚 Setoran", fTipe === "setoran", "#059669", function () { setFTipe("setoran"); }),
          pill("🟡 Penarikan", fTipe === "penarikan", "#D97706", function () { setFTipe("penarikan"); })
        )
      ),
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: T.textSub } }, "Platform:"),
        React.createElement(
          "select",
          {
            value: fLoc,
            onChange: function (e) { setFLoc(e.target.value); },
            style: {
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid " + T.border,
              fontSize: 12,
              fontWeight: 700,
              color: T.text,
              background: T.panel,
              outline: "none",
              cursor: "pointer"
            }
          },
          ["Semua"].concat(ALL_LOCS).map(function (loc) {
            return React.createElement("option", { key: loc, value: loc }, loc === "Semua" ? "Semua Platform" : loc);
          })
        )
      )
    ),

    // 4. TRANSACTION MUTATION LIST
    React.createElement(
      "div",
      {
        style: {
          background: T.card,
          borderRadius: 20,
          border: "1px solid " + T.border,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
        }
      },
      React.createElement(
        "div",
        {
          style: {
            padding: "16px 22px",
            borderBottom: "1px solid " + T.border,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: T.panel
          }
        },
        React.createElement("span", { style: { fontSize: 13, fontWeight: 800, color: T.text } }, "📋 Riwayat Mutasi Tabungan"),
        React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: T.textSub } }, sortedSavings.length + " transaksi")
      ),
      sortedSavings.length === 0
        ? React.createElement(
            "div",
            { style: { padding: "40px 20px", textAlign: "center", color: T.textSub } },
            React.createElement("div", { style: { fontSize: 36, marginBottom: 8 } }, "💎"),
            React.createElement("div", { style: { fontSize: 14, fontWeight: 700, color: T.text } }, "Tidak ada data mutasi tabungan."),
            React.createElement("div", { style: { fontSize: 12, color: T.textSub, marginTop: 4 } }, "Gunakan tombol di atas untuk menambah setoran atau penarikan.")
          )
        : sortedSavings.map(function (item, idx) {
            var isStor = item.tipe === "setoran";
            var loc = item.lokasi || "KROM";
            var meta = LOC_META[loc] || LOC_META.Lainnya;

            return React.createElement(
              "div",
              {
                key: item.id || idx,
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 22px",
                  borderBottom: idx === sortedSavings.length - 1 ? "none" : "1px solid " + T.border,
                  transition: "background 0.15s ease"
                }
              },
              // Left: Icon + Title + Metadata
              React.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 14 } },
                React.createElement(
                  "div",
                  {
                    style: {
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: isStor ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                      border: "1px solid " + (isStor ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)"),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      fontWeight: 900,
                      color: isStor ? "#059669" : "#D97706",
                      flexShrink: 0
                    }
                  },
                  isStor ? "↗" : "↘"
                ),
                React.createElement(
                  "div",
                  null,
                  React.createElement(
                    "div",
                    { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" } },
                    React.createElement(
                      "span",
                      { style: { fontSize: 13, fontWeight: 800, color: T.text } },
                      isStor ? "Setoran Tabungan" : "Penarikan Tabungan"
                    ),
                    React.createElement(
                      "span",
                      {
                        style: {
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 6,
                          background: meta.bg,
                          color: meta.color,
                          border: "1px solid " + meta.color + "30"
                        }
                      },
                      meta.icon + " " + loc
                    )
                  ),
                  React.createElement(
                    "div",
                    { style: { fontSize: 11, color: T.textSub, marginTop: 3, display: "flex", gap: 6, alignItems: "center" } },
                    React.createElement("span", null, item.tanggal),
                    item.catatan && React.createElement("span", null, "· " + item.catatan)
                  )
                )
              ),

              // Right: Amount + Action Buttons
              React.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 14 } },
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 15,
                      fontWeight: 900,
                      color: isStor ? "#059669" : "#D97706",
                      textAlign: "right"
                    }
                  },
                  (isStor ? "+" : "-") + fmt(item.nominal)
                ),
                React.createElement(
                  "div",
                  { style: { display: "flex", gap: 6 } },
                  React.createElement(
                    "button",
                    {
                      onClick: function () { p.onEdit(item); },
                      title: "Edit transaksi",
                      style: {
                        background: T.panel,
                        border: "1px solid " + T.border,
                        color: T.textSub,
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }
                    },
                    "✏"
                  ),
                  React.createElement(
                    "button",
                    {
                      onClick: function () { p.onDelete(item.id); },
                      title: "Hapus transaksi",
                      style: {
                        background: "rgba(239, 68, 68, 0.08)",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        color: "#DC2626",
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }
                    },
                    "✕"
                  )
                )
              )
            );
          })
    )
  );
}

// ── Tagihan Mendatang — Form Modal ────────────────────────────────────────────
function TagihanForm(p) {
  var initial = p.initial || {};
  var _nama = useState(initial.nama || ""), nama = _nama[0], setNama = _nama[1];
  var _nom = useState(initial.nominal ? formatRupiahInput(initial.nominal) : ""), nominal = _nom[0], setNominal = _nom[1];
  var _tgl = useState(initial.tanggal || ""), tanggal = _tgl[0], setTanggal = _tgl[1];
  var _kat = useState(initial.kategori || "Tagihan"), kategori = _kat[0], setKategori = _kat[1];
  var _met = useState(initial.metode || "Transfer"), metode = _met[0], setMetode = _met[1];
  var _rep = useState(initial.repeat || "monthly"), repeat = _rep[0], setRepeat = _rep[1];
  var _cat = useState(initial.catatan || ""), catatan = _cat[0], setCatatan = _cat[1];
  var _err = useState(""), err = _err[0], setErr = _err[1];

  useEffect(function () {
    if (p.open && initial && initial.id) {
      setNama(initial.nama || "");
      setNominal(initial.nominal ? formatRupiahInput(initial.nominal) : "");
      setTanggal(initial.tanggal || "");
      setKategori(initial.kategori || "Tagihan");
      setMetode(initial.metode || "Transfer");
      setRepeat(initial.repeat || "monthly");
      setCatatan(initial.catatan || "");
      setErr("");
    } else if (p.open && !initial.id) {
      setNama(""); setNominal(""); setTanggal(""); setKategori("Tagihan");
      setMetode("Transfer"); setRepeat("monthly"); setCatatan(""); setErr("");
    }
  }, [p.open]);

  function save() {
    if (!nama.trim()) return setErr("Nama tagihan wajib diisi.");
    var nom = parseRupiahInput(nominal);
    if (!nom || nom <= 0) return setErr("Nominal harus diisi dan lebih dari 0.");
    if (!tanggal || !tanggal.match(/^\d{2}\/\d{2}\/\d{4}$/)) return setErr("Tanggal format DD/MM/YYYY wajib diisi.");
    var bill = {
      id: initial.id || uid(),
      nama: nama.trim(),
      nominal: nom,
      tanggal: tanggal,
      kategori: kategori,
      metode: metode,
      repeat: repeat,
      catatan: catatan.trim(),
      status: "pending",
    };
    if (p.onSave) p.onSave(bill);
    if (p.onClose) p.onClose();
  }

  var allCatKeys = Object.keys(CATS).concat(Object.keys(window.customCats || {})).filter(function (v, i, a) { return a.indexOf(v) === i; });

  return React.createElement(
    Modal,
    { open: p.open, onClose: p.onClose, title: p.initial && p.initial.id ? "✏️ Edit Tagihan" : "📅 Tambah Tagihan Mendatang", width: 460 },
    React.createElement(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 14 } },
      React.createElement(DInput, { label: "Nama Tagihan", value: nama, onChange: setNama, placeholder: "Contoh: Tagihan Listrik, Cicilan Motor...", autoFocus: true }),
      React.createElement(
        "div",
        { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 } },
        React.createElement(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: 5 } },
          React.createElement("label", { style: { fontSize: 11, color: T.textSub, fontWeight: 700, textTransform: "uppercase" } }, "Nominal (Rp)"),
          React.createElement("input", {
            value: nominal,
            onChange: function (e) { setNominal(formatRupiahInput(e.target.value)); },
            placeholder: "0",
            style: { background: T.panel, border: "1.5px solid " + T.border, borderRadius: 9, padding: "9px 12px", color: T.coral, fontSize: 15, fontWeight: 800, outline: "none", fontFamily: "inherit" }
          })
        ),
        React.createElement(DDatePicker, { label: "Tanggal Jatuh Tempo", value: tanggal, onChange: setTanggal })
      ),
      React.createElement(
        "div",
        { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 } },
        React.createElement(DSelect, { label: "Kategori", value: kategori, onChange: setKategori, options: allCatKeys }),
        React.createElement(DSelect, { label: "Metode Pembayaran", value: metode, onChange: setMetode, options: ["Transfer", "M-Banking", "E-Wallet", "Cash", "QRIS", "Debit", "Kredit"] })
      ),
      React.createElement(DSelect, {
        label: "Pengulangan",
        value: repeat,
        onChange: setRepeat,
        options: [
          { value: "none", label: "❌ Tidak Berulang (Sekali Saja)" },
          { value: "monthly", label: "🔄 Berulang Setiap Bulan" },
          { value: "yearly", label: "📅 Berulang Setiap Tahun" }
        ]
      }),
      React.createElement(DInput, { label: "Catatan (opsional)", value: catatan, onChange: setCatatan, placeholder: "Keterangan tambahan..." }),
      err && React.createElement("div", { style: { color: T.coral, fontSize: 12, fontWeight: 600 } }, "⚠️ ", err),
      React.createElement(
        "div",
        { style: { display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 16, borderTop: "1px solid " + T.border } },
        React.createElement(Btn, { outline: true, color: T.textSub, onClick: p.onClose }, "Batal"),
        React.createElement(Btn, { color: T.amber, onClick: save }, "💾 ", p.initial && p.initial.id ? "Simpan Perubahan" : "Tambah Tagihan")
      )
    )
  );
}

// ── Tagihan Mendatang — Dialog Konfirmasi Bayar ───────────────────────────────
function BayarTagihanModal(p) {
  var bill = p.bill || {};
  var _nom = useState(bill.nominal ? formatRupiahInput(bill.nominal) : ""), nominal = _nom[0], setNominal = _nom[1];
  var _met = useState(bill.metode || "Transfer"), metode = _met[0], setMetode = _met[1];
  var _tgl = useState(todayStr()), tanggal = _tgl[0], setTanggal = _tgl[1];

  useEffect(function () {
    if (p.open && bill.id) {
      setNominal(bill.nominal ? formatRupiahInput(bill.nominal) : "");
      setMetode(bill.metode || "Transfer");
      setTanggal(todayStr());
    }
  }, [p.open, bill.id]);

  function confirm() {
    var nom = parseRupiahInput(nominal);
    if (!nom || nom <= 0) return;
    if (p.onConfirm) p.onConfirm(nom, metode, tanggal);
  }

  var catInfo = getCat(bill.kategori || "Tagihan");

  return React.createElement(
    Modal,
    { open: p.open, onClose: p.onClose, title: "💳 Konfirmasi Pembayaran", width: 440 },
    React.createElement(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 14 } },
      React.createElement(
        "div",
        { style: { background: T.amberDim, border: "1.5px solid " + T.amber + "60", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 } },
        React.createElement("span", { style: { fontSize: 28 } }, catInfo.emoji),
        React.createElement(
          "div",
          null,
          React.createElement("div", { style: { fontSize: 16, fontWeight: 900, color: T.text } }, bill.nama),
          React.createElement("div", { style: { fontSize: 11, color: T.textSub, marginTop: 2 } }, (bill.kategori || "Tagihan") + " · Jatuh Tempo " + (bill.tanggal || "-"))
        )
      ),
      React.createElement(
        "div",
        { style: { background: T.surface, border: "1.5px solid " + T.border, padding: 14, borderRadius: 12, display: "flex", flexDirection: "column", gap: 6 } },
        React.createElement("label", { style: { fontSize: 11, color: T.teal, fontWeight: 800, textTransform: "uppercase" } }, "💰 Nominal Pembayaran (Bisa Diubah):"),
        React.createElement("input", {
          value: nominal,
          onChange: function (e) { setNominal(formatRupiahInput(e.target.value)); },
          style: { width: "100%", background: T.panel, border: "1.5px solid " + T.border, borderRadius: 8, padding: "8px 12px", fontSize: 20, fontWeight: 800, color: T.coral, outline: "none", boxSizing: "border-box" }
        }),
        React.createElement("div", { style: { fontSize: 10, color: T.textSub, fontStyle: "italic" } }, "💡 Ubah nominal jika ada perbedaan harga dari biasanya.")
      ),
      React.createElement(
        "div",
        { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 } },
        React.createElement(DSelect, { label: "Metode Pembayaran", value: metode, onChange: setMetode, options: ["Transfer", "M-Banking", "E-Wallet", "Cash", "QRIS", "Debit", "Kredit"] }),
        React.createElement(DDatePicker, { label: "Tanggal Pembayaran", value: tanggal, onChange: setTanggal })
      ),
      React.createElement(
        "div",
        { style: { display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 16, borderTop: "1px solid " + T.border } },
        React.createElement(Btn, { outline: true, color: T.textSub, onClick: p.onClose }, "Batal"),
        React.createElement(Btn, { color: T.sage, onClick: confirm }, "✅ Bayar & Catat Pengeluaran")
      )
    )
  );
}

// ── Tagihan Mendatang — Widget untuk Dashboard ────────────────────────────────
function TagihanMendatangWidget(p) {
  var _bills = useState(function () { return getBills(); }), bills = _bills[0], setBills = _bills[1];
  var _showForm = useState(false), showForm = _showForm[0], setShowForm = _showForm[1];
  var _editBill = useState(null), editBill = _editBill[0], setEditBill = _editBill[1];
  var _bayarBill = useState(null), bayarBill = _bayarBill[0], setBayarBill = _bayarBill[1];
  var _delBill = useState(null), delBill = _delBill[0], setDelBill = _delBill[1];

  function reload() {
    setBills(getBills());
  }

  function handleSaveBill(bill) {
    var existing = getBills();
    var idx = existing.findIndex(function (b) { return b.id === bill.id; });
    var updated;
    if (idx >= 0) {
      updated = existing.map(function (b) { return b.id === bill.id ? bill : b; });
    } else {
      updated = existing.concat([bill]);
    }
    saveBills(updated);
    reload();
    if (p.showToast) p.showToast("Tagihan " + bill.nama + " disimpan!", "success");
  }

  function handleDeleteBill(id) {
    var existing = getBills();
    saveBills(existing.filter(function (b) { return b.id !== id; }));
    reload();
    setDelBill(null);
    if (p.showToast) p.showToast("Tagihan dihapus.", "info");
  }

  function handleBayar(nom, metode, tanggal) {
    var bill = bayarBill;
    if (!bill) return;

    // Buat pengeluaran dari tagihan ini
    var parts = tanggal.split("/");
    var d = parseInt(parts[0]) || 1;
    var m = (parseInt(parts[1]) || 1) - 1;
    var y = parseInt(parts[2]) || new Date().getFullYear();
    var expItem = {
      id: uid(),
      month_id: mkKey(y, m + 1),
      year: y,
      month: m,
      tanggal: tanggal,
      keperluan: bill.nama,
      kategori: bill.kategori || "Tagihan",
      nominal: nom,
      bayar: metode,
      nw: "Need",
      catatan: bill.catatan || "",
      memo_detail: "",
    };
    if (p.onSaveExpense) p.onSaveExpense(expItem);

    // Setelah bayar: jika berulang, buat tagihan berikutnya; jika tidak, hapus
    var existingBills = getBills();
    var updatedBills;
    if (bill.repeat === "monthly" || bill.repeat === "yearly") {
      // Hitung tanggal jatuh tempo berikutnya
      var tParts = bill.tanggal.split("/");
      var tD = parseInt(tParts[0], 10);
      var tM = parseInt(tParts[1], 10);
      var tY = parseInt(tParts[2], 10);
      if (bill.repeat === "monthly") {
        tM += 1;
        if (tM > 12) { tM = 1; tY += 1; }
      } else {
        tY += 1;
      }
      var newTgl = String(tD).padStart(2, "0") + "/" + String(tM).padStart(2, "0") + "/" + tY;
      var newBill = Object.assign({}, bill, { id: uid(), tanggal: newTgl, status: "pending" });
      updatedBills = existingBills.filter(function (b) { return b.id !== bill.id; }).concat([newBill]);
      if (p.showToast) p.showToast("✅ Tagihan " + bill.nama + " lunas! Tagihan berikutnya: " + newTgl, "success");
    } else {
      updatedBills = existingBills.filter(function (b) { return b.id !== bill.id; });
      if (p.showToast) p.showToast("✅ Tagihan " + bill.nama + " lunas & dicatat ke pengeluaran!", "success");
    }
    saveBills(updatedBills);
    reload();
    setBayarBill(null);
  }

  // Sort & kategorikan
  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  var pendingBills = bills.filter(function (b) { return b.status !== "paid"; }).map(function (b) {
    return Object.assign({}, b, { _days: daysUntilDue(b.tanggal) });
  }).sort(function (a, b) { return (a._days === null ? 9999 : a._days) - (b._days === null ? 9999 : b._days); });

  var overdue = pendingBills.filter(function (b) { return b._days !== null && b._days < 0; });
  var dueSoon = pendingBills.filter(function (b) { return b._days !== null && b._days >= 0 && b._days <= 3; });
  var upcoming = pendingBills.filter(function (b) { return b._days !== null && b._days > 3; });

  var totalPending = pendingBills.reduce(function (s, b) { return s + (b.nominal || 0); }, 0);
  var overdueCount = overdue.length + dueSoon.length;

  function BillRow(rp) {
    var b = rp.bill;
    var days = b._days;
    var isOverdue = days !== null && days < 0;
    var isToday = days === 0;
    var isSoon = days !== null && days > 0 && days <= 3;
    var statusColor = isOverdue ? "#DC2626" : (isToday || isSoon) ? "#D97706" : "#475569";
    var statusBg = isOverdue ? "rgba(239, 68, 68, 0.12)" : (isToday || isSoon) ? "rgba(245, 158, 11, 0.12)" : "rgba(100, 116, 139, 0.1)";
    var statusBorder = isOverdue ? "1px solid rgba(239, 68, 68, 0.25)" : (isToday || isSoon) ? "1px solid rgba(245, 158, 11, 0.25)" : "1px solid rgba(100, 116, 139, 0.2)";
    var statusLabel = isOverdue
      ? ("Telat " + Math.abs(days) + " hari")
      : isToday ? "Hari Ini!"
      : isSoon ? (days + " hari lagi")
      : (days + " hari lagi");
    var catInfo = getCat(b.kategori || "Tagihan");
    var repLabel = b.repeat === "monthly" ? "🔄 Bulanan" : b.repeat === "yearly" ? "📅 Tahunan" : "❌ Sekali";

    var tileBg = isOverdue ? "rgba(239, 68, 68, 0.1)" : (isToday || isSoon) ? "rgba(245, 158, 11, 0.1)" : "rgba(2, 132, 199, 0.1)";
    var tileBorder = isOverdue ? "1px solid rgba(239, 68, 68, 0.2)" : (isToday || isSoon) ? "1px solid rgba(245, 158, 11, 0.2)" : "1px solid rgba(2, 132, 199, 0.2)";

    return React.createElement(
      "div",
      {
        key: b.id,
        style: {
          background: T.card,
          border: "1px solid " + (isOverdue ? "rgba(239, 68, 68, 0.4)" : isToday || isSoon ? "rgba(245, 158, 11, 0.4)" : T.border),
          borderRadius: 12,
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
        }
      },
      React.createElement(
        "div",
        {
          style: {
            width: 40,
            height: 40,
            borderRadius: 10,
            background: tileBg,
            border: tileBorder,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0
          }
        },
        catInfo.emoji
      ),
      React.createElement(
        "div",
        { style: { flex: 1, minWidth: 0 } },
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" } },
          React.createElement("span", { style: { fontSize: 13, fontWeight: 800, color: T.text } }, b.nama),
          React.createElement("span", { style: { fontSize: 10, fontWeight: 700, background: statusBg, color: statusColor, border: statusBorder, padding: "2px 7px", borderRadius: 6 } }, statusLabel)
        ),
        React.createElement(
          "div",
          { style: { display: "flex", gap: 8, marginTop: 3, flexWrap: "wrap", alignItems: "center" } },
          React.createElement("span", { style: { fontSize: 14, fontWeight: 900, color: isOverdue ? T.coral : T.text } }, fmt(b.nominal)),
          React.createElement("span", { style: { fontSize: 10, color: T.textSub } }, "· " + (b.tanggal || "-")),
          React.createElement("span", { style: { fontSize: 10, color: T.textSub } }, "· " + repLabel),
          b.metode && React.createElement("span", { style: { fontSize: 10, color: T.teal, fontWeight: 700 } }, "· " + b.metode)
        )
      ),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 5, flexShrink: 0 } },
        React.createElement(
          "button",
          {
            onClick: function () { setBayarBill(b); },
            title: "Bayar tagihan ini",
            style: { background: "#10B981", border: "none", color: "#FFFFFF", padding: "6px 12px", borderRadius: 7, fontSize: 11, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 2px 4px rgba(16, 185, 129, 0.25)" }
          },
          "💳 Bayar"
        ),
        React.createElement(
          "button",
          {
            onClick: function () { setEditBill(b); setShowForm(true); },
            title: "Edit tagihan",
            style: { background: T.panel, border: "1px solid " + T.border, color: T.textSub, width: 28, height: 28, borderRadius: 6, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }
          },
          "✏"
        ),
        React.createElement(
          "button",
          {
            onClick: function () { setDelBill(b); },
            title: "Hapus tagihan",
            style: { background: T.coralDim, border: "1px solid " + T.coral + "30", color: T.coral, width: 28, height: 28, borderRadius: 6, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }
          },
          "✕"
        )
      )
    );
  }

  function Section(sp) {
    if (sp.items.length === 0) return null;
    return React.createElement(
      "div",
      { style: { marginBottom: 12 } },
      React.createElement(
        "div",
        { style: { fontSize: 11, fontWeight: 800, color: sp.color, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, display: "flex", alignItems: "center", gap: 5 } },
        sp.icon, " ", sp.label, " (", sp.items.length, ")"
      ),
      React.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8 } },
        sp.items.map(function (b) { return React.createElement(BillRow, { key: b.id, bill: b }); })
      )
    );
  }

  return React.createElement(
    "div",
    { style: { background: T.card, borderRadius: 16, border: "1px solid " + T.border, overflow: "hidden", marginTop: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" } },
    // Header
    React.createElement(
      "div",
      { style: { padding: "14px 18px", borderBottom: "1px solid " + T.border, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(248, 250, 252, 0.7)" } },
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        React.createElement("div", { style: { width: 30, height: 30, borderRadius: 8, background: "rgba(245, 158, 11, 0.15)", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 } }, "📅"),
        React.createElement("span", { style: { fontSize: 14, fontWeight: 800, color: T.text } }, "Tagihan Mendatang"),
        overdueCount > 0 && React.createElement(
          "span",
          { style: { background: "#EF4444", color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 10, marginLeft: 4 } },
          overdueCount + " harus bayar!"
        ),
        pendingBills.length > 0 && React.createElement(
          "span",
          { style: { fontSize: 11, color: T.textSub, marginLeft: 6 } },
          "Total: ", React.createElement("strong", { style: { color: T.coral } }, fmt(totalPending))
        )
      ),
      React.createElement(
        Btn,
        { color: T.amber, small: true, onClick: function () { setEditBill(null); setShowForm(true); } },
        "+ Tambah Tagihan"
      )
    ),
    // Body
    React.createElement(
      "div",
      { style: { padding: "14px 18px" } },
      pendingBills.length === 0
        ? React.createElement(
            "div",
            { style: { textAlign: "center", padding: "20px 0", color: T.textDim, fontSize: 13 } },
            React.createElement("div", { style: { fontSize: 32, marginBottom: 8 } }, "🎉"),
            "Tidak ada tagihan mendatang. Tambahkan tagihan untuk pengingat!"
          )
        : React.createElement(
            React.Fragment,
            null,
            React.createElement(Section, { items: overdue, icon: "🔴", label: "Jatuh Tempo / Terlambat", color: T.coral }),
            React.createElement(Section, { items: dueSoon, icon: "🟡", label: "Hari Ini / 3 Hari Ke Depan", color: T.amber }),
            React.createElement(Section, { items: upcoming, icon: "🟢", label: "Mendatang", color: T.sage })
          )
    ),
    // Modals
    React.createElement(TagihanForm, {
      open: showForm,
      initial: editBill || {},
      onClose: function () { setShowForm(false); setEditBill(null); },
      onSave: handleSaveBill
    }),
    React.createElement(BayarTagihanModal, {
      open: !!bayarBill,
      bill: bayarBill || {},
      onClose: function () { setBayarBill(null); },
      onConfirm: handleBayar
    }),
    React.createElement(ConfirmModal, {
      open: !!delBill,
      label: delBill ? delBill.nama : "",
      onConfirm: function () { handleDeleteBill(delBill.id); },
      onCancel: function () { setDelBill(null); }
    })
  );
}

// ── Dashboard View (Ringkasan) ────────────────────────────────────────────────
// ── Dashboard View (Ringkasan — Fintech Wise/Revolut Layout) ─────────────────
function DashboardView(p) {
  var paydayDate = p.paydayDate || 28;
  var curPeriod = getFinancialPeriod(new Date(), paydayDate);
  var _fmode = useState("cycle");
  var filterMode = _fmode[0], setFilterMode = _fmode[1];

  var isCycle = filterMode === "cycle";
  var activeIncome = isCycle
    ? p.income.filter(function (i) { return getFinancialPeriod(i.tanggal || i.date, paydayDate).cycleKey === curPeriod.cycleKey; })
    : p.income;

  var activeExpenses = isCycle
    ? p.expenses.filter(function (e) { return getFinancialPeriod(e.tanggal || e.date, paydayDate).cycleKey === curPeriod.cycleKey; })
    : p.expenses;

  var tInc = activeIncome.reduce(function (s, i) { return s + i.nominal; }, 0);
  var tExp = activeExpenses.reduce(function (s, e) { return s + e.nominal; }, 0);
  var saldo = tInc - tExp;
  var pct = tInc > 0 ? Math.min(100, Math.round((tExp / tInc) * 100)) : tExp > 0 ? 100 : 0;

  var totalSetoran = p.savings.filter(function (s) { return s.tipe === "setoran"; }).reduce(function (a, s) { return a + s.nominal; }, 0);
  var totalPenarikan = p.savings.filter(function (s) { return s.tipe === "penarikan"; }).reduce(function (a, s) { return a + s.nominal; }, 0);
  var saldoTab = totalSetoran - totalPenarikan;

  // Need vs Want calculations
  var totalNeed = activeExpenses.filter(function (e) { return (e.nw || "Need") === "Need"; }).reduce(function (s, e) { return s + e.nominal; }, 0);
  var totalWant = activeExpenses.filter(function (e) { return (e.nw || "Need") === "Want"; }).reduce(function (s, e) { return s + e.nominal; }, 0);
  var needPct = tExp > 0 ? Math.round((totalNeed / tExp) * 100) : 0;
  var wantPct = tExp > 0 ? (100 - needPct) : 0;

  // Recent transactions feed (combined income & expense)
  var allRecent = sortNewestFirst([].concat(
    activeIncome.map(function (i) { return Object.assign({}, i, { _type: "income" }); }),
    activeExpenses.map(function (e) { return Object.assign({}, e, { _type: "expense" }); })
  )).slice(0, 5);

  var diffDays = null;
  if (curPeriod && curPeriod.endDateStr) {
    try {
      var endParts = curPeriod.endDateStr.split("/");
      if (endParts.length === 3) {
        var endD = new Date(parseInt(endParts[2], 10), parseInt(endParts[1], 10) - 1, parseInt(endParts[0], 10));
        var nD = new Date();
        var tD = new Date(nD.getFullYear(), nD.getMonth(), nD.getDate());
        diffDays = Math.max(0, Math.ceil((endD.getTime() - tD.getTime()) / (1000 * 60 * 60 * 24)));
      }
    } catch(e) {}
  }

  return React.createElement(
    "div",
    { style: { padding: "24px 28px 40px", maxWidth: 1280, margin: "0 auto", width: "100%" } },

    // 1. HERO FINANCIAL COMMAND CENTER (Wise / Revolut Hero Card)
    React.createElement(
      "div",
      {
        style: {
          background: T.card,
          border: "1px solid " + T.border,
          borderRadius: 24,
          padding: "26px 30px",
          marginBottom: 24,
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
        }
      },
      // Top Row: Cycle Status Pill & Cycle Switcher
      React.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 } },
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" } },
          React.createElement(
            "span",
            { style: { background: "rgba(2, 132, 199, 0.08)", color: T.teal, border: "1px solid rgba(2, 132, 199, 0.2)", fontSize: 12, fontWeight: 800, padding: "4px 12px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 6 } },
            React.createElement("span", { style: { width: 7, height: 7, borderRadius: "50%", background: T.teal } }),
            isCycle ? ("Siklus " + curPeriod.monthName + " (Gajian Tgl " + paydayDate + ")") : "Seluruh Waktu"
          ),
          isCycle && React.createElement(
            "span",
            { style: { background: "rgba(16, 185, 129, 0.08)", color: "#059669", border: "1px solid rgba(16, 185, 129, 0.2)", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 20 } },
            "⏳ " + (diffDays !== null ? (diffDays + " Hari Tersisa") : "Aktif")
          )
        ),
        // Switcher button
        React.createElement(
          "div",
          { style: { display: "inline-flex", background: T.panel, padding: 3, borderRadius: 10, border: "1px solid " + T.border } },
          React.createElement(
            "button",
            {
              onClick: function () { setFilterMode("cycle"); },
              style: {
                padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 800, border: "none", cursor: "pointer",
                background: isCycle ? "#0F172A" : "transparent",
                color: isCycle ? "#FFFFFF" : T.textSub
              }
            },
            "⚡ Siklus Ini"
          ),
          React.createElement(
            "button",
            {
              onClick: function () { setFilterMode("all"); },
              style: {
                padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 800, border: "none", cursor: "pointer",
                background: !isCycle ? "#0F172A" : "transparent",
                color: !isCycle ? "#FFFFFF" : T.textSub
              }
            },
            "🌐 Semua"
          )
        )
      ),

      // Balance & Revolut Action Buttons Row
      React.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20, marginBottom: 22 } },
        React.createElement(
          "div",
          null,
          React.createElement("div", { style: { fontSize: 11, color: T.textSub, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.8 } }, "Total Saldo Bersih"),
          React.createElement(
            "div",
            { style: { fontSize: 44, fontWeight: 900, letterSpacing: -1.2, color: T.text, marginTop: 4, display: "flex", alignItems: "baseline", gap: 8 } },
            (saldo < 0 ? "-" : "") + fmt(Math.abs(saldo)),
            React.createElement("span", { style: { fontSize: 13, fontWeight: 700, color: T.textSub, background: T.panel, padding: "3px 8px", borderRadius: 6 } }, "IDR")
          ),
          React.createElement("div", { style: { fontSize: 12, color: T.textSub, marginTop: 4 } }, "Pemasukan dikurangi seluruh pengeluaran siklus berjalan.")
        ),

        // 4 Revolut Quick Action Buttons
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" } },
          React.createElement(
            "button",
            {
              onClick: p.onAddIncome,
              title: "Catat Pemasukan",
              style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer" }
            },
            React.createElement(
              "div",
              { style: { width: 44, height: 44, borderRadius: 14, background: "#0F172A", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, boxShadow: "0 2px 6px rgba(15,23,42,0.18)", transition: "transform .15s ease" } },
              "↓"
            ),
            React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: T.text } }, "Masuk")
          ),
          React.createElement(
            "button",
            {
              onClick: p.onAddExpense,
              title: "Catat Pengeluaran",
              style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer" }
            },
            React.createElement(
              "div",
              { style: { width: 44, height: 44, borderRadius: 14, background: "#0F172A", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, boxShadow: "0 2px 6px rgba(15,23,42,0.18)", transition: "transform .15s ease" } },
              "↑"
            ),
            React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: T.text } }, "Keluar")
          ),
          React.createElement(
            "button",
            {
              onClick: function () { if (p.onAddSaving) p.onAddSaving("setoran"); },
              title: "Catat Tabungan",
              style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer" }
            },
            React.createElement(
              "div",
              { style: { width: 44, height: 44, borderRadius: 14, background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.25)", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900 } },
              "🏛️"
            ),
            React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: T.text } }, "Nabung")
          ),
          React.createElement(
            "button",
            {
              onClick: function () {
                var el = document.getElementById("tagihan-widget-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              },
              title: "Lihat Tagihan",
              style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer" }
            },
            React.createElement(
              "div",
              { style: { width: 44, height: 44, borderRadius: 14, background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.25)", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900 } },
              "⚡"
            ),
            React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: T.text } }, "Tagihan")
          )
        )
      ),

      // Integrated 3-Metric Breakdown Strip
      React.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12,
            paddingTop: 18,
            borderTop: "1px solid " + T.border
          }
        },
        React.createElement(
          "div",
          { style: { padding: "10px 14px", background: "rgba(248, 250, 252, 0.8)", border: "1px solid " + T.border, borderRadius: 14 } },
          React.createElement("div", { style: { fontSize: 10, color: T.textSub, fontWeight: 800, textTransform: "uppercase" } }, "Pemasukan Siklus"),
          React.createElement("div", { style: { fontSize: 18, fontWeight: 900, color: "#059669", marginTop: 2 } }, "+ " + fmt(tInc))
        ),
        React.createElement(
          "div",
          { style: { padding: "10px 14px", background: "rgba(248, 250, 252, 0.8)", border: "1px solid " + T.border, borderRadius: 14 } },
          React.createElement("div", { style: { fontSize: 10, color: T.textSub, fontWeight: 800, textTransform: "uppercase" } }, "Pengeluaran Siklus (" + pct + "%)"),
          React.createElement("div", { style: { fontSize: 18, fontWeight: 900, color: "#DC2626", marginTop: 2 } }, "- " + fmt(tExp))
        ),
        React.createElement(
          "div",
          { style: { padding: "10px 14px", background: "rgba(248, 250, 252, 0.8)", border: "1px solid " + T.border, borderRadius: 14 } },
          React.createElement("div", { style: { fontSize: 10, color: T.textSub, fontWeight: 800, textTransform: "uppercase" } }, "Total Tabungan (KROM)"),
          React.createElement("div", { style: { fontSize: 18, fontWeight: 900, color: T.teal, marginTop: 2 } }, fmt(saldoTab))
        )
      ),

      // Minimal Budget Progress Bar
      React.createElement(
        "div",
        { style: { marginTop: 14 } },
        React.createElement(
          "div",
          { style: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: T.textSub, fontWeight: 700, marginBottom: 6 } },
          React.createElement("span", null, "Bujet Siklus Terpakai: ", React.createElement("strong", { style: { color: T.text } }, pct + "%")),
          React.createElement("span", null, "Sisa Kas: ", React.createElement("strong", { style: { color: saldo >= 0 ? "#059669" : "#DC2626" } }, fmt(Math.max(0, saldo))))
        ),
        React.createElement(
          "div",
          { style: { height: 6, background: T.panel, borderRadius: 3, overflow: "hidden" } },
          React.createElement("div", {
            style: {
              height: "100%",
              width: pct + "%",
              borderRadius: 3,
              background: pct > 85 ? "#EF4444" : pct > 60 ? "#F59E0B" : "linear-gradient(90deg, #10B981, #0284C7)",
              transition: "width .4s ease"
            }
          })
        )
      )
    ),

    // 2. MAIN 2-COLUMN GRID (STRIPE STYLE)
    React.createElement(
      "div",
      { className: "fintech-2col-grid", style: { display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, alignItems: "start" } },

      // LEFT COLUMN: TAGIHAN MENDATANG & TRANSAKSI TERKINI
      React.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 24 } },

        // WIDGET TAGIHAN MENDATANG
        React.createElement(
          "div",
          { id: "tagihan-widget-section" },
          React.createElement(TagihanMendatangWidget, { onSaveExpense: p.onSaveExpense, showToast: p.showToast })
        ),

        // TRANSAKSI TERKINI STREAM
        React.createElement(
          "div",
          {
            style: {
              background: T.card,
              borderRadius: 20,
              border: "1px solid " + T.border,
              padding: "20px 22px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
            }
          },
          React.createElement(
            "div",
            { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid " + T.border } },
            React.createElement(
              "div",
              null,
              React.createElement("div", { style: { fontSize: 14, fontWeight: 900, color: T.text } }, "Aktivitas Transaksi Terkini"),
              React.createElement("div", { style: { fontSize: 11, color: T.textSub, marginTop: 2 } }, "Aliran transaksi pemasukan & pengeluaran terbaru.")
            ),
            React.createElement(
              "span",
              { style: { fontSize: 11, fontWeight: 700, color: T.textSub } },
              allRecent.length + " transaksi"
            )
          ),
          allRecent.length === 0
            ? React.createElement("div", { style: { padding: "24px 0", textAlign: "center", color: T.textSub, fontSize: 13 } }, "Belum ada transaksi di siklus ini.")
            : React.createElement(
                "div",
                { style: { display: "flex", flexDirection: "column", gap: 10 } },
                allRecent.map(function (tx) {
                  var isInc = tx._type === "income";
                  var catInfo = isInc ? { emoji: "💼" } : getCat(tx.kategori || "Lain-lain");
                  return React.createElement(
                    "div",
                    {
                      key: tx.id,
                      style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 12px",
                        borderRadius: 12,
                        background: T.panel,
                        border: "1px solid " + T.border
                      }
                    },
                    React.createElement(
                      "div",
                      { style: { display: "flex", alignItems: "center", gap: 10 } },
                      React.createElement(
                        "div",
                        {
                          style: {
                            width: 34,
                            height: 34,
                            borderRadius: 10,
                            background: isInc ? "rgba(16, 185, 129, 0.12)" : "rgba(2, 132, 199, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 15,
                            flexShrink: 0
                          }
                        },
                        catInfo.emoji
                      ),
                      React.createElement(
                        "div",
                        null,
                        React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: T.text } }, tx.keperluan || tx.sumber || tx.kategori),
                        React.createElement(
                          "div",
                          { style: { fontSize: 11, color: T.textSub, marginTop: 2, display: "flex", gap: 6, alignItems: "center" } },
                          React.createElement("span", null, tx.tanggal),
                          React.createElement("span", null, "•"),
                          React.createElement("span", { style: { fontWeight: 600 } }, tx.kategori || "Pemasukan"),
                          (tx.bayar || tx.metode) && React.createElement("span", { style: { color: T.teal, fontWeight: 700 } }, "• " + (tx.bayar || tx.metode))
                        )
                      )
                    ),
                    React.createElement(
                      "div",
                      { style: { fontSize: 14, fontWeight: 900, color: isInc ? "#059669" : "#DC2626" } },
                      (isInc ? "+ " : "- ") + fmt(tx.nominal)
                    )
                  );
                })
              )
        )
      ),

      // RIGHT COLUMN: SMART INSIGHTS & SAVINGS BREAKDOWN
      React.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 24 } },

        // 1. SMART FINANCIAL RATIO (NEED VS WANT)
        React.createElement(
          "div",
          {
            style: {
              background: T.card,
              borderRadius: 20,
              border: "1px solid " + T.border,
              padding: "20px 22px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
            }
          },
          React.createElement("div", { style: { fontSize: 11, color: T.textSub, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.8 } }, "Smart Insight"),
          React.createElement("div", { style: { fontSize: 14, fontWeight: 900, color: T.text, marginTop: 2, marginBottom: 14 } }, "Rasio Kebutuhan (Need) vs Keinginan (Want)"),

          React.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 12 } },
            // Need bar
            React.createElement(
              "div",
              null,
              React.createElement(
                "div",
                { style: { display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 5 } },
                React.createElement("span", { style: { color: T.text } }, "🎯 Kebutuhan (Need)"),
                React.createElement("span", { style: { fontWeight: 800, color: T.teal } }, needPct + "% (" + fmt(totalNeed) + ")")
              ),
              React.createElement(
                "div",
                { style: { height: 6, background: T.panel, borderRadius: 3, overflow: "hidden" } },
                React.createElement("div", { style: { height: "100%", width: needPct + "%", background: T.teal, borderRadius: 3 } })
              )
            ),
            // Want bar
            React.createElement(
              "div",
              null,
              React.createElement(
                "div",
                { style: { display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 5 } },
                React.createElement("span", { style: { color: T.text } }, "✨ Keinginan (Want)"),
                React.createElement("span", { style: { fontWeight: 800, color: "#8B5CF6" } }, wantPct + "% (" + fmt(totalWant) + ")")
              ),
              React.createElement(
                "div",
                { style: { height: 6, background: T.panel, borderRadius: 3, overflow: "hidden" } },
                React.createElement("div", { style: { height: "100%", width: wantPct + "%", background: "#8B5CF6", borderRadius: 3 } })
              )
            )
          ),
          React.createElement(
            "p",
            { style: { fontSize: 11, color: T.textSub, fontStyle: "italic", marginTop: 14, lineHeight: 1.5 } },
            "💡 Proporsi pengeluaran ideal adalah 70–80% untuk kebutuhan dan maksimal 20–30% untuk keinginan."
          )
        ),

        // 2. SAVINGS ALLOCATION CARD (KROM)
        React.createElement(
          "div",
          {
            style: {
              background: T.card,
              borderRadius: 20,
              border: "1px solid " + T.border,
              padding: "20px 22px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
            }
          },
          React.createElement(
            "div",
            { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 } },
            React.createElement("span", { style: { fontSize: 14, fontWeight: 900, color: T.text } }, "Ringkasan Tabungan"),
            React.createElement("span", { style: { fontSize: 11, fontWeight: 800, background: "rgba(2, 132, 199, 0.1)", color: T.teal, padding: "2px 8px", borderRadius: 6 } }, "KROM")
          ),
          React.createElement("div", { style: { fontSize: 26, fontWeight: 900, color: T.text, marginTop: 4 } }, fmt(saldoTab)),
          React.createElement("div", { style: { fontSize: 11, color: T.textSub, marginTop: 2 } }, "Total akumulasi tabungan & dana darurat aktif."),

          React.createElement(
            "div",
            { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 } },
            React.createElement(
              "div",
              { style: { padding: "10px 12px", background: T.panel, borderRadius: 10, border: "1px solid " + T.border } },
              React.createElement("div", { style: { fontSize: 10, color: "#059669", fontWeight: 800, textTransform: "uppercase" } }, "Total Setor"),
              React.createElement("div", { style: { fontSize: 14, fontWeight: 900, color: T.text, marginTop: 2 } }, fmt(totalSetoran))
            ),
            React.createElement(
              "div",
              { style: { padding: "10px 12px", background: T.panel, borderRadius: 10, border: "1px solid " + T.border } },
              React.createElement("div", { style: { fontSize: 10, color: "#D97706", fontWeight: 800, textTransform: "uppercase" } }, "Total Tarik"),
              React.createElement("div", { style: { fontSize: 14, fontWeight: 900, color: T.text, marginTop: 2 } }, fmt(totalPenarikan))
            )
          )
        )

      )
    )
  );
}

// ── Pemasukan View ────────────────────────────────────────────────────────────
function PemasukanView(p) {
  var paydayDate = p.paydayDate || 28;
  var curPeriod = getFinancialPeriod(new Date(), paydayDate);
  var _search = useState(""), search = _search[0], setSearch = _search[1];
  var _fMet = useState("Semua"), fMet = _fMet[0], setFMet = _fMet[1];
  var _fCycle = useState("all"), fCycle = _fCycle[0], setFCycle = _fCycle[1];

  var allIncome = p.income || [];
  var totalAll = allIncome.reduce(function (s, i) { return s + (i.nominal || 0); }, 0);

  var cycleIncome = allIncome.filter(function (i) {
    return getFinancialPeriod(i.tanggal || i.date, paydayDate).cycleKey === curPeriod.cycleKey;
  });
  var totalCycle = cycleIncome.reduce(function (s, i) { return s + (i.nominal || 0); }, 0);

  var mc = {
    Transfer: { color: "#0284C7", bg: "rgba(2, 132, 199, 0.1)" },
    "M-Banking": { color: "#0EA5E9", bg: "rgba(14, 165, 233, 0.1)" },
    "E-Wallet": { color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.1)" },
    Cash: { color: "#D97706", bg: "rgba(217, 119, 6, 0.1)" },
    QRIS: { color: "#06B6D4", bg: "rgba(6, 182, 212, 0.1)" },
    Debit: { color: "#059669", bg: "rgba(5, 150, 105, 0.1)" },
    Kredit: { color: "#E11D48", bg: "rgba(225, 29, 72, 0.1)" }
  };

  var filtered = allIncome.filter(function (item) {
    if (fCycle === "cycle") {
      if (getFinancialPeriod(item.tanggal || item.date, paydayDate).cycleKey !== curPeriod.cycleKey) return false;
    }
    if (fMet !== "Semua" && item.metode !== fMet) return false;
    if (search) {
      var q = search.toLowerCase();
      var matchSumber = (item.sumber || "").toLowerCase().indexOf(q) >= 0;
      var matchCatatan = (item.catatan || "").toLowerCase().indexOf(q) >= 0;
      var matchTanggal = (item.tanggal || "").indexOf(q) >= 0;
      if (!matchSumber && !matchCatatan && !matchTanggal) return false;
    }
    return true;
  });

  var rows = sortNewestFirst(filtered);
  var grouped = groupByMonth(rows, paydayDate);

  function pill(label, active, col, fn) {
    return React.createElement(
      "button",
      {
        key: label,
        onClick: fn,
        style: {
          padding: "6px 14px",
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 700,
          border: active ? "1.5px solid " + col : "1px solid " + T.border,
          background: active ? col : "#FFFFFF",
          color: active ? "#FFFFFF" : T.textSub,
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "all 0.15s ease",
          boxShadow: active ? "0 2px 6px " + col + "40" : "none"
        }
      },
      label
    );
  }

  return React.createElement(
    "div",
    { style: { padding: "24px 28px 40px", maxWidth: 1280, margin: "0 auto", width: "100%", boxSizing: "border-box" } },

    // 1. TOP STAT CARDS + PRIMARY ACTION
    React.createElement(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
          marginBottom: 24
        }
      },
      // Card 1: Siklus Berjalan
      React.createElement(
        "div",
        {
          style: {
            background: T.card,
            borderRadius: 20,
            border: "1px solid " + T.border,
            padding: "20px 24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }
        },
        React.createElement(
          "div",
          null,
          React.createElement("div", { style: { fontSize: 11, color: "#059669", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.8 } }, "SIKLUS INI (" + curPeriod.monthName.toUpperCase() + ")"),
          React.createElement("div", { style: { fontSize: 26, fontWeight: 900, color: "#059669", marginTop: 4 } }, "+" + fmt(totalCycle)),
          React.createElement("div", { style: { fontSize: 11, color: T.textSub, marginTop: 2 } }, cycleIncome.length + " transaksi pada siklus saat ini")
        ),
        React.createElement(
          "div",
          { style: { width: 44, height: 44, borderRadius: 14, background: "rgba(5, 150, 105, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 } },
          "⚡"
        )
      ),

      // Card 2: Total Akumulatif
      React.createElement(
        "div",
        {
          style: {
            background: T.card,
            borderRadius: 20,
            border: "1px solid " + T.border,
            padding: "20px 24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }
        },
        React.createElement(
          "div",
          null,
          React.createElement("div", { style: { fontSize: 11, color: T.teal, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.8 } }, "TOTAL PEMASUKAN KESELURUHAN"),
          React.createElement("div", { style: { fontSize: 26, fontWeight: 900, color: T.text, marginTop: 4 } }, "+" + fmt(totalAll)),
          React.createElement("div", { style: { fontSize: 11, color: T.textSub, marginTop: 2 } }, allIncome.length + " total transaksi tercatat")
        ),
        React.createElement(
          "div",
          { style: { width: 44, height: 44, borderRadius: 14, background: "rgba(2, 132, 199, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 } },
          "💰"
        )
      ),

      // Card 3: Action Panel
      React.createElement(
        "div",
        {
          style: {
            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
            borderRadius: 20,
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#FFFFFF"
          }
        },
        React.createElement(
          "div",
          null,
          React.createElement("div", { style: { fontSize: 13, fontWeight: 800 } }, "Catat Arus Kas"),
          React.createElement("div", { style: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 } }, "Gaji, bonus, profit usaha & lainnya")
        ),
        React.createElement(
          "button",
          {
            onClick: p.onAdd,
            style: {
              background: "#059669",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 12,
              padding: "10px 18px",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(5, 150, 105, 0.4)",
              whiteSpace: "nowrap"
            }
          },
          "💵 + Tambah"
        )
      )
    ),

    // 2. TOOLBAR: Search & Filters
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16
        }
      },
      React.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flex: 1, minWidth: 260, flexWrap: "wrap" } },
        React.createElement("input", {
          value: search,
          onChange: function (e) { setSearch(e.target.value); },
          placeholder: "🔍 Cari sumber atau catatan pemasukan...",
          style: {
            background: T.panel,
            border: "1px solid " + T.border,
            borderRadius: 10,
            padding: "8px 14px",
            color: T.text,
            fontSize: 12,
            outline: "none",
            width: 240,
            boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
          }
        }),
        React.createElement(
          "div",
          { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
          pill("Semua Waktu", fCycle === "all", T.teal, function () { setFCycle("all"); }),
          pill("⚡ Siklus Ini Saja", fCycle === "cycle", "#059669", function () { setFCycle("cycle"); })
        )
      ),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 5, overflowX: "auto", paddingBottom: 2 } },
        ["Semua", "Transfer", "M-Banking", "E-Wallet", "Cash", "QRIS", "Debit"].map(function (met) {
          var cfg = mc[met] || { color: T.teal };
          return pill(met, fMet === met, cfg.color, function () { setFMet(met); });
        })
      )
    ),

    // 3. TRANSACTION LIST
    React.createElement(
      "div",
      {
        style: {
          background: T.card,
          borderRadius: 20,
          border: "1px solid " + T.border,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
        }
      },
      React.createElement(
        "div",
        {
          style: {
            padding: "16px 22px",
            borderBottom: "1px solid " + T.border,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: T.panel
          }
        },
        React.createElement("span", { style: { fontSize: 13, fontWeight: 800, color: T.text } }, "📋 Daftar Riwayat Pemasukan"),
        React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: T.textSub } }, rows.length + " transaksi")
      ),

      rows.length === 0
        ? React.createElement(
            "div",
            { style: { padding: "40px 20px", textAlign: "center", color: T.textSub } },
            React.createElement("div", { style: { fontSize: 36, marginBottom: 8 } }, "💵"),
            React.createElement("div", { style: { fontSize: 14, fontWeight: 700, color: T.text } }, "Tidak ada data pemasukan."),
            React.createElement("div", { style: { fontSize: 12, color: T.textSub, marginTop: 4 } }, "Gunakan tombol Tambah Pemasukan untuk mencatat pemasukan baru.")
          )
        : grouped.map(function (g) {
            var mTotal = g.items.reduce(function (s, i) { return s + (i.nominal || 0); }, 0);
            var mLabel = g.label || (MONTH_NAMES[g.month] + " " + g.year);

            return React.createElement(
              "div",
              { key: g.key },
              // Header Siklus / Bulan
              React.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 22px",
                    background: T.panel,
                    borderTop: "1px solid " + T.border,
                    borderBottom: "1px solid " + T.border
                  }
                },
                React.createElement(
                  "div",
                  { style: { display: "flex", alignItems: "center", gap: 8 } },
                  React.createElement("span", { style: { fontSize: 14 } }, "📅"),
                  React.createElement("span", { style: { fontSize: 12, fontWeight: 800, color: T.text } }, mLabel),
                  React.createElement(
                    "span",
                    { style: { fontSize: 10, fontWeight: 700, background: "#E2E8F0", color: "#475569", padding: "1px 7px", borderRadius: 10 } },
                    g.items.length + " transaksi"
                  )
                ),
                React.createElement(
                  "div",
                  { style: { fontSize: 12, fontWeight: 800, color: "#059669" } },
                  "Subtotal: +" + fmt(mTotal)
                )
              ),

              // Items
              g.items.map(function (item, i) {
                var mMeta = mc[item.metode] || { color: T.teal, bg: "rgba(2, 132, 199, 0.1)" };

                return React.createElement(
                  "div",
                  {
                    key: item.id || i,
                    style: {
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 22px",
                      borderBottom: "1px solid " + T.border,
                      transition: "background 0.15s ease"
                    }
                  },
                  // Left: Icon + Sumber + Date/Notes
                  React.createElement(
                    "div",
                    { style: { display: "flex", alignItems: "center", gap: 14 } },
                    React.createElement(
                      "div",
                      {
                        style: {
                          width: 42,
                          height: 42,
                          borderRadius: 12,
                          background: "rgba(5, 150, 105, 0.1)",
                          border: "1px solid rgba(5, 150, 105, 0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                          flexShrink: 0
                        }
                      },
                      "💵"
                    ),
                    React.createElement(
                      "div",
                      null,
                      React.createElement(
                        "div",
                        { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" } },
                        React.createElement("span", { style: { fontSize: 13, fontWeight: 800, color: T.text } }, item.sumber),
                        React.createElement(
                          "span",
                          {
                            style: {
                              fontSize: 11,
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: 6,
                              background: mMeta.bg,
                              color: mMeta.color,
                              border: "1px solid " + mMeta.color + "30"
                            }
                          },
                          item.metode
                        )
                      ),
                      React.createElement(
                        "div",
                        { style: { fontSize: 11, color: T.textSub, marginTop: 3, display: "flex", gap: 6, alignItems: "center" } },
                        React.createElement("span", null, item.tanggal),
                        item.catatan && React.createElement("span", null, "· " + item.catatan)
                      )
                    )
                  ),

                  // Right: Nominal + Action Buttons
                  React.createElement(
                    "div",
                    { style: { display: "flex", alignItems: "center", gap: 14 } },
                    React.createElement(
                      "div",
                      { style: { fontSize: 15, fontWeight: 900, color: "#059669", textAlign: "right" } },
                      "+" + fmt(item.nominal)
                    ),
                    React.createElement(
                      "div",
                      { style: { display: "flex", gap: 6 } },
                      React.createElement(
                        "button",
                        {
                          onClick: function () { p.onEdit(item); },
                          title: "Edit transaksi",
                          style: {
                            background: T.panel,
                            border: "1px solid " + T.border,
                            color: T.textSub,
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }
                        },
                        "✏"
                      ),
                      React.createElement(
                        "button",
                        {
                          onClick: function () { p.onDelete(item.id); },
                          title: "Hapus transaksi",
                          style: {
                            background: "rgba(239, 68, 68, 0.08)",
                            border: "1px solid rgba(239, 68, 68, 0.2)",
                            color: "#DC2626",
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }
                        },
                        "✕"
                      )
                    )
                  )
                );
              })
            );
          })
    )
  );
}

// ── Pengeluaran View ──────────────────────────────────────────────────────────
function PengeluaranView(p) {
  var paydayDate = p.paydayDate || 28;
  var curPeriod = getFinancialPeriod(new Date(), paydayDate);

  var _fc = useState("Semua"), fCat = _fc[0], sFCat = _fc[1];
  var _fn = useState("Semua"), fNW = _fn[0], sFNW = _fn[1];
  var _fs = useState(""), search = _fs[0], sSearch = _fs[1];
  var _fCycle = useState("all"), fCycle = _fCycle[0], setFCycle = _fCycle[1];
  var _mmi = useState(null), memoModalItem = _mmi[0], setMemoModalItem = _mmi[1];

  var all = p.expenses || [];
  var total = all.reduce(function (s, e) { return s + (e.nominal || 0); }, 0);

  var thisCycleExpList = all.filter(function (e) {
    return getFinancialPeriod(e.tanggal || e.date, paydayDate).cycleKey === curPeriod.cycleKey;
  });
  var thisCycleExp = thisCycleExpList.reduce(function (s, e) { return s + (e.nominal || 0); }, 0);

  var usedCats = [].concat([], all.map(function (e) { return e.kategori; })).filter(function (v, i, a) { return a.indexOf(v) === i; });

  var filtered = [].concat(all).filter(function (e) {
    if (fCycle === "cycle") {
      if (getFinancialPeriod(e.tanggal || e.date, paydayDate).cycleKey !== curPeriod.cycleKey) return false;
    }
    if (fCat !== "Semua" && e.kategori !== fCat) return false;
    if (fNW !== "Semua" && e.nw !== fNW) return false;
    if (search) {
      var q = search.toLowerCase();
      var matchKeperluan = (e.keperluan || "").toLowerCase().indexOf(q) >= 0;
      var matchCatatan = (e.catatan || "").toLowerCase().indexOf(q) >= 0;
      var matchTanggal = (e.tanggal || "").indexOf(q) >= 0;
      if (!matchKeperluan && !matchCatatan && !matchTanggal) return false;
    }
    return true;
  });

  var rows = sortNewestFirst(filtered);
  var grouped = groupByMonth(rows, paydayDate);

  var totalNeed = filtered.filter(function (e) { return (e.nw || "Need") === "Need"; }).reduce(function (s, e) { return s + (e.nominal || 0); }, 0);
  var totalWant = filtered.filter(function (e) { return (e.nw || "Need") === "Want"; }).reduce(function (s, e) { return s + (e.nominal || 0); }, 0);
  var filteredTotal = totalNeed + totalWant;
  var needPct = filteredTotal > 0 ? Math.round((totalNeed / filteredTotal) * 100) : 0;
  var wantPct = filteredTotal > 0 ? (100 - needPct) : 0;

  function pill(label, active, col, fn) {
    return React.createElement(
      "button",
      {
        key: label,
        onClick: fn,
        style: {
          padding: "6px 14px",
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 700,
          border: active ? "1.5px solid " + col : "1px solid " + T.border,
          background: active ? col : "#FFFFFF",
          color: active ? "#FFFFFF" : T.textSub,
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "all 0.15s ease",
          boxShadow: active ? "0 2px 6px " + col + "40" : "none"
        }
      },
      label
    );
  }

  return React.createElement(
    "div",
    { style: { padding: "24px 28px 40px", maxWidth: 1280, margin: "0 auto", width: "100%", boxSizing: "border-box" } },

    // 1. TOP 3 STAT CARDS
    React.createElement(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
          marginBottom: 24
        }
      },
      // Card 1: Siklus Ini
      React.createElement(
        "div",
        {
          style: {
            background: T.card,
            borderRadius: 20,
            border: "1px solid " + T.border,
            padding: "20px 24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }
        },
        React.createElement(
          "div",
          null,
          React.createElement("div", { style: { fontSize: 11, color: "#E11D48", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.8 } }, "SIKLUS INI (" + curPeriod.monthName.toUpperCase() + ")"),
          React.createElement("div", { style: { fontSize: 26, fontWeight: 900, color: "#E11D48", marginTop: 4 } }, "-" + fmt(thisCycleExp)),
          React.createElement("div", { style: { fontSize: 11, color: T.textSub, marginTop: 2 } }, thisCycleExpList.length + " transaksi siklus berjalan")
        ),
        React.createElement(
          "div",
          { style: { width: 44, height: 44, borderRadius: 14, background: "rgba(225, 29, 72, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 } },
          "⚡"
        )
      ),

      // Card 2: Total Akumulatif
      React.createElement(
        "div",
        {
          style: {
            background: T.card,
            borderRadius: 20,
            border: "1px solid " + T.border,
            padding: "20px 24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }
        },
        React.createElement(
          "div",
          null,
          React.createElement("div", { style: { fontSize: 11, color: T.teal, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.8 } }, "TOTAL PENGELUARAN"),
          React.createElement("div", { style: { fontSize: 26, fontWeight: 900, color: T.text, marginTop: 4 } }, "-" + fmt(total)),
          React.createElement("div", { style: { fontSize: 11, color: T.textSub, marginTop: 2 } }, all.length + " total transaksi tercatat")
        ),
        React.createElement(
          "div",
          { style: { width: 44, height: 44, borderRadius: 14, background: "rgba(2, 132, 199, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 } },
          "💸"
        )
      ),

      // Card 3: Rasio Kebutuhan (Need vs Want)
      React.createElement(
        "div",
        {
          style: {
            background: T.card,
            borderRadius: 20,
            border: "1px solid " + T.border,
            padding: "20px 24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }
        },
        React.createElement(
          "div",
          { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } },
          React.createElement("div", { style: { fontSize: 11, color: T.violet, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.8 } }, "RASIO KEBUTUHAN (NEED/WANT)"),
          React.createElement("span", { style: { fontSize: 11, fontWeight: 800, color: T.textSub } }, needPct + "% / " + wantPct + "%")
        ),
        // Mini Segmented Bar
        React.createElement(
          "div",
          { style: { height: 8, background: "#F1F5F9", borderRadius: 4, overflow: "hidden", display: "flex", marginBottom: 10 } },
          React.createElement("div", { style: { width: needPct + "%", background: "#0284C7", transition: "width .3s ease" } }),
          React.createElement("div", { style: { width: wantPct + "%", background: "#8B5CF6", transition: "width .3s ease" } })
        ),
        React.createElement(
          "div",
          { style: { display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700 } },
          React.createElement("span", { style: { color: "#0284C7" } }, "🎯 Need: " + fmt(totalNeed)),
          React.createElement("span", { style: { color: "#8B5CF6" } }, "✨ Want: " + fmt(totalWant))
        )
      )
    ),

    // 2. TOOLBAR: Search, Scope & Actions
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 12
        }
      },
      React.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flex: 1, minWidth: 260, flexWrap: "wrap" } },
        React.createElement("input", {
          value: search,
          onChange: function (e) { sSearch(e.target.value); },
          placeholder: "🔍 Cari keperluan atau catatan...",
          style: {
            background: T.panel,
            border: "1px solid " + T.border,
            borderRadius: 10,
            padding: "8px 14px",
            color: T.text,
            fontSize: 12,
            outline: "none",
            width: 240,
            boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
          }
        }),
        React.createElement(
          "div",
          { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
          pill("Semua Waktu", fCycle === "all", T.teal, function () { setFCycle("all"); }),
          pill("⚡ Siklus Ini Saja", fCycle === "cycle", "#0284C7", function () { setFCycle("cycle"); })
        )
      ),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        p.onOpenRepeat && React.createElement(
          "button",
          {
            onClick: p.onOpenRepeat,
            style: {
              background: T.panel,
              border: "1px solid " + T.border,
              color: T.text,
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6
            }
          },
          "🔁 Repeat"
        ),
        React.createElement(
          "button",
          {
            onClick: p.onAdd,
            style: {
              background: "#E11D48",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 12,
              padding: "10px 18px",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 4px 12px rgba(225, 29, 72, 0.35)",
              whiteSpace: "nowrap"
            }
          },
          "➕ Tambah Pengeluaran"
        )
      )
    ),

    // Filter Bar Row 2: Categories & Need/Want
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: 10,
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          marginBottom: 16
        }
      },
      React.createElement(
        "div",
        { style: { display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2, flex: 1 } },
        ["Semua"].concat(usedCats).map(function (c) {
          var cfg = getCat(c);
          return pill(c === "Semua" ? "Semua Kategori" : cfg.emoji + " " + c, fCat === c, cfg.color || T.teal, function () { sFCat(c); });
        })
      ),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 6 } },
        ["Semua", "Need", "Want"].map(function (n) {
          return pill(n === "Need" ? "🎯 Kebutuhan" : n === "Want" ? "✨ Keinginan" : "Semua K/K", fNW === n, n === "Need" ? "#0284C7" : n === "Want" ? "#8B5CF6" : T.textSub, function () { sFNW(n); });
        })
      )
    ),

    // 3. TRANSACTION LIST
    React.createElement(
      "div",
      {
        style: {
          background: T.card,
          borderRadius: 20,
          border: "1px solid " + T.border,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
        }
      },
      React.createElement(
        "div",
        {
          style: {
            padding: "16px 22px",
            borderBottom: "1px solid " + T.border,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: T.panel
          }
        },
        React.createElement("span", { style: { fontSize: 13, fontWeight: 800, color: T.text } }, "📋 Daftar Catatan Pengeluaran"),
        React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: T.textSub } }, rows.length + " transaksi")
      ),

      rows.length === 0
        ? React.createElement(
            "div",
            { style: { padding: "40px 20px", textAlign: "center", color: T.textSub } },
            React.createElement("div", { style: { fontSize: 36, marginBottom: 8 } }, "💸"),
            React.createElement("div", { style: { fontSize: 14, fontWeight: 700, color: T.text } }, "Tidak ada data pengeluaran yang sesuai filter."),
            React.createElement("div", { style: { fontSize: 12, color: T.textSub, marginTop: 4 } }, "Coba ubah kata kunci pencarian atau tambah pengeluaran baru.")
          )
        : grouped.map(function (g) {
            var mTotal = g.items.reduce(function (s, e) { return s + (e.nominal || 0); }, 0);
            var mLabel = g.label || (MONTH_NAMES[g.month] + " " + g.year);

            return React.createElement(
              "div",
              { key: g.key },
              // Header Siklus / Bulan
              React.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 22px",
                    background: T.panel,
                    borderTop: "1px solid " + T.border,
                    borderBottom: "1px solid " + T.border
                  }
                },
                React.createElement(
                  "div",
                  { style: { display: "flex", alignItems: "center", gap: 8 } },
                  React.createElement("span", { style: { fontSize: 14 } }, "📅"),
                  React.createElement("span", { style: { fontSize: 12, fontWeight: 800, color: T.text } }, mLabel),
                  React.createElement(
                    "span",
                    { style: { fontSize: 10, fontWeight: 700, background: "#E2E8F0", color: "#475569", padding: "1px 7px", borderRadius: 10 } },
                    g.items.length + " transaksi"
                  )
                ),
                React.createElement(
                  "div",
                  { style: { fontSize: 12, fontWeight: 800, color: "#E11D48" } },
                  "Subtotal: -" + fmt(mTotal)
                )
              ),

              // Items
              g.items.map(function (item, i) {
                var cfg = getCat(item.kategori);
                var hasMemo = !!(item.memo_detail || item.catatan);

                return React.createElement(
                  "div",
                  {
                    key: item.id || i,
                    style: {
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 22px",
                      borderBottom: "1px solid " + T.border,
                      transition: "background 0.15s ease"
                    }
                  },
                  // Left: Emoji Tile + Keperluan + Badges
                  React.createElement(
                    "div",
                    { style: { display: "flex", alignItems: "center", gap: 14 } },
                    React.createElement(
                      "div",
                      {
                        style: {
                          width: 42,
                          height: 42,
                          borderRadius: 12,
                          background: "#F1F5F9",
                          border: "1px solid " + T.border,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 20,
                          flexShrink: 0
                        }
                      },
                      cfg.emoji
                    ),
                    React.createElement(
                      "div",
                      null,
                      React.createElement(
                        "div",
                        { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" } },
                        React.createElement("span", { style: { fontSize: 13, fontWeight: 800, color: T.text } }, item.keperluan),
                        hasMemo && React.createElement(
                          "button",
                          {
                            onClick: function (ev) { ev.stopPropagation(); setMemoModalItem(item); },
                            style: {
                              background: "rgba(2, 132, 199, 0.08)",
                              border: "1px solid rgba(2, 132, 199, 0.25)",
                              color: "#0284C7",
                              padding: "2px 8px",
                              borderRadius: 6,
                              fontSize: 10,
                              fontWeight: 800,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 3
                            }
                          },
                          "📌 Memo Rincian"
                        )
                      ),
                      React.createElement(
                        "div",
                        { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" } },
                        React.createElement("span", { style: { fontSize: 11, color: T.textSub } }, item.tanggal),
                        React.createElement(
                          "span",
                          {
                            style: {
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "1px 6px",
                              borderRadius: 5,
                              background: item.nw === "Need" ? "rgba(2, 132, 199, 0.08)" : "rgba(139, 92, 246, 0.08)",
                              color: item.nw === "Need" ? "#0284C7" : "#8B5CF6",
                              border: "1px solid " + (item.nw === "Need" ? "rgba(2, 132, 199, 0.2)" : "rgba(139, 92, 246, 0.2)")
                            }
                          },
                          item.nw === "Need" ? "🎯 Need" : "✨ Want"
                        ),
                        React.createElement(
                          "span",
                          {
                            style: {
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "1px 6px",
                              borderRadius: 5,
                              background: "#F1F5F9",
                              color: "#475569",
                              border: "1px solid " + T.border
                            }
                          },
                          item.bayar || "Cash"
                        ),
                        item.catatan && React.createElement("span", { style: { fontSize: 11, color: T.textDim } }, "· " + item.catatan)
                      )
                    )
                  ),

                  // Right: Nominal + Action Buttons
                  React.createElement(
                    "div",
                    { style: { display: "flex", alignItems: "center", gap: 14 } },
                    React.createElement(
                      "div",
                      { style: { fontSize: 15, fontWeight: 900, color: "#E11D48", textAlign: "right" } },
                      "-" + fmt(item.nominal)
                    ),
                    React.createElement(
                      "div",
                      { style: { display: "flex", gap: 6 } },
                      React.createElement(
                        "button",
                        {
                          onClick: function () { p.onEdit(item); },
                          title: "Edit transaksi",
                          style: {
                            background: T.panel,
                            border: "1px solid " + T.border,
                            color: T.textSub,
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }
                        },
                        "✏"
                      ),
                      React.createElement(
                        "button",
                        {
                          onClick: function () { p.onDelete(item.id, item); },
                          title: "Hapus transaksi",
                          style: {
                            background: "rgba(239, 68, 68, 0.08)",
                            border: "1px solid rgba(239, 68, 68, 0.2)",
                            color: "#DC2626",
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }
                        },
                        "✕"
                      )
                    )
                  )
                );
              })
            );
          })
    ),

    React.createElement(MemoDetailModal, {
      open: !!memoModalItem,
      item: memoModalItem,
      onClose: function () { setMemoModalItem(null); },
      onSaveMemo: function (id, text) {
        if (memoModalItem) {
          var updated = Object.assign({}, memoModalItem, { memo_detail: text });
          if (p.onSave) p.onSave(updated);
          else if (p.onEdit) p.onEdit(updated);
        }
        setMemoModalItem(null);
      }
    })
  );
}

// ── Analisis Bulanan View ─────────────────────────────────────────────────────
function AnalisisBulananView(p) {
  var paydayDate = p.paydayDate || 28;
  var curP = getFinancialPeriod(new Date(), paydayDate);

  var cycleMap = {};
  cycleMap[curP.cycleKey] = curP;

  (p.income || []).concat(p.expenses || []).forEach(function (tx) {
    var rawDate = tx.tanggal || tx.date;
    var pr = getFinancialPeriod(rawDate, paydayDate);
    cycleMap[pr.cycleKey] = pr;
  });

  var sortedKeys = Object.keys(cycleMap).sort(function (a, b) {
    return b.localeCompare(a);
  });

  // Calculate overall metrics
  var curInc = (p.income || []).filter(function (i) {
    return getFinancialPeriod(i.tanggal || i.date, paydayDate).cycleKey === curP.cycleKey;
  }).reduce(function (s, i) { return s + (i.nominal || 0); }, 0);

  var curExp = (p.expenses || []).filter(function (e) {
    return getFinancialPeriod(e.tanggal || e.date, paydayDate).cycleKey === curP.cycleKey;
  }).reduce(function (s, e) { return s + (e.nominal || 0); }, 0);

  var curNet = curInc - curExp;

  var totalAllInc = 0;
  var totalAllExp = 0;
  var cycleRates = [];

  sortedKeys.forEach(function (k) {
    var inc = (p.income || []).filter(function (i) { return getFinancialPeriod(i.tanggal || i.date, paydayDate).cycleKey === k; }).reduce(function (s, i) { return s + (i.nominal || 0); }, 0);
    var exp = (p.expenses || []).filter(function (e) { return getFinancialPeriod(e.tanggal || e.date, paydayDate).cycleKey === k; }).reduce(function (s, e) { return s + (e.nominal || 0); }, 0);
    totalAllInc += inc;
    totalAllExp += exp;
    if (inc > 0) {
      cycleRates.push(Math.max(0, Math.round(((inc - exp) / inc) * 100)));
    }
  });

  var avgSavingsRate = cycleRates.length > 0 ? Math.round(cycleRates.reduce(function (a, b) { return a + b; }, 0) / cycleRates.length) : 0;
  var overallSurplus = totalAllInc - totalAllExp;

  return React.createElement(
    "div",
    { style: { padding: "24px 28px 40px", maxWidth: 1280, margin: "0 auto", width: "100%", boxSizing: "border-box" } },

    // 1. TOP HEADER & PAYDAY PICKER
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 16
        }
      },
      React.createElement(
        "div",
        null,
        React.createElement("h2", { style: { margin: "0 0 4px", fontSize: 22, fontWeight: 900, color: T.text, letterSpacing: -0.5 } }, "📈 Analisis Siklus Keuangan & Cashflow"),
        React.createElement("div", { style: { fontSize: 13, color: T.textSub } }, "Evaluasi cashflow per siklus gajian, tingkat tabungan, dan alokasi pos pengeluaran")
      ),
      p.onUpdatePayday && React.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: T.card,
            padding: "8px 16px",
            borderRadius: 14,
            border: "1px solid " + T.border,
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
          }
        },
        React.createElement("span", { style: { fontSize: 12, fontWeight: 800, color: T.text } }, "🗓️ Tanggal Gajian:"),
        React.createElement(
          "select",
          {
            value: paydayDate,
            onChange: function (e) { p.onUpdatePayday(parseInt(e.target.value, 10)); },
            style: {
              padding: "4px 10px",
              borderRadius: 8,
              border: "1px solid " + T.border,
              fontSize: 12,
              fontWeight: 800,
              color: T.teal,
              background: T.panel,
              cursor: "pointer",
              outline: "none"
            }
          },
          Array.from({ length: 31 }, function (_, i) { return i + 1; }).map(function (d) {
            return React.createElement("option", { key: d, value: d }, d === 1 ? "Tgl 1 (Kalender)" : "Tgl " + d);
          })
        )
      )
    ),

    // 2. EXECUTIVE 3-METRIC SUMMARY CARDS
    React.createElement(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
          marginBottom: 24
        }
      },
      // Metric 1: Status Siklus Saat Ini
      React.createElement(
        "div",
        {
          style: {
            background: T.card,
            borderRadius: 20,
            border: "1px solid " + T.border,
            padding: "20px 24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }
        },
        React.createElement(
          "div",
          null,
          React.createElement("div", { style: { fontSize: 11, color: curNet >= 0 ? "#059669" : "#E11D48", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.8 } }, "SIKLUS SAAT INI (" + (curNet >= 0 ? "SURPLUS" : "DEFISIT") + ")"),
          React.createElement("div", { style: { fontSize: 26, fontWeight: 900, color: curNet >= 0 ? "#059669" : "#E11D48", marginTop: 4 } }, (curNet >= 0 ? "+" : "") + fmt(curNet)),
          React.createElement("div", { style: { fontSize: 11, color: T.textSub, marginTop: 2 } }, "Siklus " + curP.monthName + " (Gajian Tgl " + paydayDate + ")")
        ),
        React.createElement(
          "div",
          { style: { width: 44, height: 44, borderRadius: 14, background: curNet >= 0 ? "rgba(5, 150, 105, 0.1)" : "rgba(225, 29, 72, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 } },
          curNet >= 0 ? "⚡" : "⚠️"
        )
      ),

      // Metric 2: Rata-rata Tingkat Tabungan
      React.createElement(
        "div",
        {
          style: {
            background: T.card,
            borderRadius: 20,
            border: "1px solid " + T.border,
            padding: "20px 24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }
        },
        React.createElement(
          "div",
          null,
          React.createElement("div", { style: { fontSize: 11, color: T.teal, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.8 } }, "RATA-RATA TINGKAT TABUNGAN"),
          React.createElement("div", { style: { fontSize: 26, fontWeight: 900, color: T.text, marginTop: 4 } }, avgSavingsRate + "%"),
          React.createElement("div", { style: { fontSize: 11, color: T.textSub, marginTop: 2 } }, "Rasio surplus kas terhadap pemasukan")
        ),
        React.createElement(
          "div",
          { style: { width: 44, height: 44, borderRadius: 14, background: "rgba(2, 132, 199, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 } },
          "🌱"
        )
      ),

      // Metric 3: Total Akumulasi Surplus
      React.createElement(
        "div",
        {
          style: {
            background: T.card,
            borderRadius: 20,
            border: "1px solid " + T.border,
            padding: "20px 24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }
        },
        React.createElement(
          "div",
          null,
          React.createElement("div", { style: { fontSize: 11, color: T.violet, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.8 } }, "TOTAL AKUMULASI CASHFLOW"),
          React.createElement("div", { style: { fontSize: 26, fontWeight: 900, color: overallSurplus >= 0 ? T.text : "#E11D48", marginTop: 4 } }, (overallSurplus >= 0 ? "+" : "") + fmt(overallSurplus)),
          React.createElement("div", { style: { fontSize: 11, color: T.textSub, marginTop: 2 } }, sortedKeys.length + " siklus keuangan terdata")
        ),
        React.createElement(
          "div",
          { style: { width: 44, height: 44, borderRadius: 14, background: "rgba(139, 92, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 } },
          "📊"
        )
      )
    ),

    // 3. CYCLE INTELLIGENCE CARDS
    React.createElement(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 18 } },
      sortedKeys.map(function (mKey) {
        var periodInfo = cycleMap[mKey];
        var isCurrent = mKey === curP.cycleKey;

        var mInc = (p.income || []).filter(function (i) {
          return getFinancialPeriod(i.tanggal || i.date, paydayDate).cycleKey === mKey;
        });
        var mExp = (p.expenses || []).filter(function (e) {
          return getFinancialPeriod(e.tanggal || e.date, paydayDate).cycleKey === mKey;
        });

        var tInc = mInc.reduce(function (s, i) { return s + (i.nominal || 0); }, 0);
        var tExp = mExp.reduce(function (s, e) { return s + (e.nominal || 0); }, 0);
        var net = tInc - tExp;
        var pctSpent = tInc > 0 ? Math.min(100, Math.round((tExp / tInc) * 100)) : tExp > 0 ? 100 : 0;
        var sRate = tInc > 0 ? Math.max(0, Math.round((net / tInc) * 100)) : 0;

        // Top categories calculation
        var catTotals = {};
        mExp.forEach(function (e) {
          var c = e.kategori || "Lainnya";
          catTotals[c] = (catTotals[c] || 0) + (e.nominal || 0);
        });
        var topCats = Object.keys(catTotals).map(function (c) {
          return { name: c, total: catTotals[c], pct: tExp > 0 ? Math.round((catTotals[c] / tExp) * 100) : 0 };
        }).sort(function (a, b) { return b.total - a.total; }).slice(0, 4);

        return React.createElement(
          "div",
          {
            key: mKey,
            style: {
              background: T.card,
              borderRadius: 22,
              border: isCurrent ? "2px solid " + T.teal : "1px solid " + T.border,
              padding: "24px 28px",
              boxShadow: isCurrent ? "0 8px 24px -4px rgba(2, 132, 199, 0.12)" : "0 1px 3px rgba(0,0,0,0.02)",
              transition: "all 0.2s ease"
            }
          },
          // Card Header: Period & Cashflow Status
          React.createElement(
            "div",
            { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 } },
            React.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } },
              React.createElement("div", { style: { fontSize: 17, fontWeight: 900, color: isCurrent ? T.teal : T.text } }, "📅 " + periodInfo.label),
              isCurrent && React.createElement(
                "span",
                { style: { background: "rgba(2, 132, 199, 0.1)", color: T.teal, border: "1px solid rgba(2, 132, 199, 0.25)", fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20 } },
                "⚡ Siklus Sedang Berjalan"
              )
            ),
            React.createElement(
              "div",
              {
                style: {
                  background: net >= 0 ? "rgba(5, 150, 105, 0.08)" : "rgba(225, 29, 72, 0.08)",
                  border: "1px solid " + (net >= 0 ? "rgba(5, 150, 105, 0.2)" : "rgba(225, 29, 72, 0.2)"),
                  borderRadius: 12,
                  padding: "6px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }
              },
              React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: net >= 0 ? "#059669" : "#E11D48" } }, net >= 0 ? "Surplus Kas:" : "Defisit Kas:"),
              React.createElement("span", { style: { fontSize: 14, fontWeight: 900, color: net >= 0 ? "#059669" : "#E11D48" } }, (net >= 0 ? "+" : "") + fmt(net)),
              tInc > 0 && React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: net >= 0 ? "#059669" : "#E11D48", opacity: 0.8 } }, "(" + sRate + "%)")
            )
          ),

          // Cashflow Bar (Spending vs Income)
          tInc > 0 && React.createElement(
            "div",
            { style: { marginBottom: 18 } },
            React.createElement(
              "div",
              { style: { display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: T.textSub, marginBottom: 6 } },
              React.createElement("span", null, "Persentase Pengeluaran terhadap Pemasukan"),
              React.createElement("span", { style: { color: pctSpent > 90 ? "#E11D48" : pctSpent > 70 ? "#D97706" : "#059669" } }, pctSpent + "%")
            ),
            React.createElement(
              "div",
              { style: { height: 8, background: "#F1F5F9", borderRadius: 4, overflow: "hidden" } },
              React.createElement("div", {
                style: {
                  height: "100%",
                  width: pctSpent + "%",
                  background: pctSpent > 90 ? "#E11D48" : pctSpent > 70 ? "#D97706" : "#059669",
                  borderRadius: 4,
                  transition: "width .4s ease"
                }
              })
            )
          ),

          // 3-Column Metrics Strip
          React.createElement(
            "div",
            { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: topCats.length > 0 ? 18 : 0 } },
            React.createElement(
              "div",
              { style: { background: T.panel, padding: "14px 18px", borderRadius: 14, border: "1px solid " + T.border } },
              React.createElement("div", { style: { fontSize: 11, color: "#059669", fontWeight: 800, textTransform: "uppercase" } }, "Pemasukan (" + mInc.length + " tx)"),
              React.createElement("div", { style: { fontSize: 18, fontWeight: 900, color: T.text, marginTop: 4 } }, "+" + fmt(tInc))
            ),
            React.createElement(
              "div",
              { style: { background: T.panel, padding: "14px 18px", borderRadius: 14, border: "1px solid " + T.border } },
              React.createElement("div", { style: { fontSize: 11, color: "#E11D48", fontWeight: 800, textTransform: "uppercase" } }, "Pengeluaran (" + mExp.length + " tx)"),
              React.createElement("div", { style: { fontSize: 18, fontWeight: 900, color: T.text, marginTop: 4 } }, "-" + fmt(tExp))
            ),
            React.createElement(
              "div",
              { style: { background: T.panel, padding: "14px 18px", borderRadius: 14, border: "1px solid " + T.border } },
              React.createElement("div", { style: { fontSize: 11, color: T.teal, fontWeight: 800, textTransform: "uppercase" } }, "Sisa Saldo Kas"),
              React.createElement("div", { style: { fontSize: 18, fontWeight: 900, color: net >= 0 ? "#059669" : "#E11D48", marginTop: 4 } }, (net >= 0 ? "+" : "") + fmt(net))
            )
          ),

          // Top Spending Categories Breakdown for this cycle
          topCats.length > 0 && React.createElement(
            "div",
            { style: { paddingTop: 14, borderTop: "1px solid " + T.border } },
            React.createElement(
              "div",
              { style: { fontSize: 11, fontWeight: 800, color: T.textSub, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 } },
              "POS PENGELUARAN TERBESAR PADA SIKLUS INI"
            ),
            React.createElement(
              "div",
              { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 } },
              topCats.map(function (c) {
                var cfg = getCat(c.name);
                return React.createElement(
                  "div",
                  {
                    key: c.name,
                    style: {
                      background: T.panel,
                      borderRadius: 12,
                      padding: "10px 14px",
                      border: "1px solid " + T.border,
                      display: "flex",
                      flexDirection: "column",
                      gap: 4
                    }
                  },
                  React.createElement(
                    "div",
                    { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
                    React.createElement("span", { style: { fontSize: 12, fontWeight: 800, color: T.text, display: "flex", alignItems: "center", gap: 5 } }, cfg.emoji, " ", c.name === "Fashion" ? "Pakaian" : c.name),
                    React.createElement("span", { style: { fontSize: 11, fontWeight: 800, color: T.teal } }, c.pct + "%")
                  ),
                  React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: "#E11D48" } }, "-" + fmt(c.total))
                );
              })
            )
          )
        );
      })
    )
  );
}

// ── Analisis Tahunan View ─────────────────────────────────────────────────────
function AnalisisTahunanView(p) {
  var paydayDate = p.paydayDate || 28;
  var curP = getFinancialPeriod(new Date(), paydayDate);
  var _sy = useState(curP.cycleYear);
  var selYear = _sy[0], setSelYear = _sy[1];

  // Kumpulkan tahun-tahun siklus yang ada
  var yearSet = {};
  yearSet[curP.cycleYear] = true;
  (p.income || []).concat(p.expenses || []).forEach(function (tx) {
    var pr = getFinancialPeriod(tx.tanggal || tx.date, paydayDate);
    yearSet[pr.cycleYear] = true;
  });
  var availYears = Object.keys(yearSet).map(Number).sort(function (a, b) { return b - a; });

  // Filter transaksi tahun siklus yang dipilih
  var yInc = (p.income || []).filter(function (i) {
    return getFinancialPeriod(i.tanggal || i.date, paydayDate).cycleYear === selYear;
  });
  var yExp = (p.expenses || []).filter(function (e) {
    return getFinancialPeriod(e.tanggal || e.date, paydayDate).cycleYear === selYear;
  });

  var tInc = yInc.reduce(function (s, i) { return s + i.nominal; }, 0);
  var tExp = yExp.reduce(function (s, e) { return s + e.nominal; }, 0);
  var net = tInc - tExp;

  // Breakdown 12 siklus dalam tahun selYear
  var MONTH_NAMES = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  var cycleBreakdown = [];
  for (var m = 1; m <= 12; m++) {
    var cKey = selYear + "-" + String(m).padStart(2, "0");
    var mInc = yInc.filter(function (i) { return getFinancialPeriod(i.tanggal || i.date, paydayDate).cycleKey === cKey; });
    var mExp = yExp.filter(function (e) { return getFinancialPeriod(e.tanggal || e.date, paydayDate).cycleKey === cKey; });
    var totI = mInc.reduce(function (s, i) { return s + i.nominal; }, 0);
    var totE = mExp.reduce(function (s, e) { return s + e.nominal; }, 0);
    var diff = totI - totE;
    cycleBreakdown.push({
      month: m,
      monthName: MONTH_NAMES[m - 1],
      key: cKey,
      inc: totI,
      exp: totE,
      net: diff,
      txCount: mInc.length + mExp.length
    });
  }

  return React.createElement(
    "div",
    { style: { padding: "24px 32px", overflowY: "auto", height: "100%" } },
    React.createElement(
      "div",
      { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 } },
      React.createElement("h2", { style: { margin: 0, fontSize: 20, fontWeight: 900, color: T.text } }, "📊 Analisis Keuangan Tahunan (Siklus Gajian)"),
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: T.textSub } }, "Pilih Tahun Siklus:"),
        React.createElement(
          "select",
          {
            value: selYear,
            onChange: function (e) { setSelYear(parseInt(e.target.value, 10)); },
            style: { padding: "6px 12px", borderRadius: 8, border: "1px solid " + T.border, fontSize: 13, fontWeight: 800, color: T.teal, background: T.card, cursor: "pointer" }
          },
          availYears.map(function (y) {
            return React.createElement("option", { key: y, value: y }, "Tahun " + y);
          })
        )
      )
    ),
    // Ringkasan Banner
    React.createElement(
      "div",
      { style: { background: T.card, borderRadius: 16, border: "1px solid " + T.border, padding: 24, marginBottom: 20 } },
      React.createElement("div", { style: { fontSize: 12, color: T.textSub, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 } }, "Sisa Cashflow Siklus Tahun " + selYear + (paydayDate > 1 ? " (Gajian tgl " + paydayDate + ")" : "")),
      React.createElement("div", { style: { fontSize: 32, fontWeight: 900, color: net >= 0 ? T.teal : T.coral, marginTop: 6 } }, fmt(net)),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 24, marginTop: 16, paddingTop: 16, borderTop: "1px solid " + T.border } },
        React.createElement("div", null, React.createElement("div", { style: { fontSize: 11, color: T.textSub, fontWeight: 700 } }, "Total Pemasukan (" + yInc.length + " tx)"), React.createElement("div", { style: { fontSize: 18, fontWeight: 800, color: T.sage, marginTop: 2 } }, fmt(tInc))),
        React.createElement("div", null, React.createElement("div", { style: { fontSize: 11, color: T.textSub, fontWeight: 700 } }, "Total Pengeluaran (" + yExp.length + " tx)"), React.createElement("div", { style: { fontSize: 18, fontWeight: 800, color: T.coral, marginTop: 2 } }, fmt(tExp)))
      )
    ),
    // Tabel / Grid 12 Siklus
    React.createElement("div", { style: { fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 12 } }, "🗓️ Rincian 12 Siklus Bulanan Tahun " + selYear),
    React.createElement(
      "div",
      { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 } },
      cycleBreakdown.map(function (c) {
        var isCurrent = c.key === curP.cycleKey;
        return React.createElement(
          "div",
          {
            key: c.month,
            style: {
              background: T.card,
              borderRadius: 14,
              border: isCurrent ? "2px solid " + T.teal : "1px solid " + T.border,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 8
            }
          },
          React.createElement(
            "div",
            { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
            React.createElement("span", { style: { fontSize: 14, fontWeight: 800, color: isCurrent ? T.teal : T.text } }, "Siklus " + c.monthName),
            isCurrent && React.createElement("span", { style: { fontSize: 10, background: T.tealDim, color: T.teal, fontWeight: 800, padding: "2px 6px", borderRadius: 4 } }, "Aktif")
          ),
          React.createElement(
            "div",
            { style: { display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 4 } },
            React.createElement("span", { style: { color: T.textSub } }, "Pemasukan:"),
            React.createElement("span", { style: { fontWeight: 700, color: T.sage } }, fmt(c.inc))
          ),
          React.createElement(
            "div",
            { style: { display: "flex", justifyContent: "space-between", fontSize: 12 } },
            React.createElement("span", { style: { color: T.textSub } }, "Pengeluaran:"),
            React.createElement("span", { style: { fontWeight: 700, color: T.coral } }, fmt(c.exp))
          ),
          React.createElement(
            "div",
            { style: { display: "flex", justifyContent: "space-between", fontSize: 12, paddingTop: 6, borderTop: "1px dashed " + T.border } },
            React.createElement("span", { style: { fontWeight: 700, color: T.text } }, "Cashflow:"),
            React.createElement("span", { style: { fontWeight: 800, color: c.net >= 0 ? T.sage : T.coral } }, fmt(c.net))
          )
        );
      })
    )
  );
}

// ── Kalender Pengeluaran View ──────────────────────────────────────────────────
function KalenderPengeluaranView(p) {
  var now = new Date();
  var _sy = useState(now.getFullYear()), selYear = _sy[0], setSelYear = _sy[1];
  var _sm = useState(now.getMonth() + 1), selMonth = _sm[0], setSelMonth = _sm[1];
  var _sd = useState(null), selDateStr = _sd[0], setSelDateStr = _sd[1];

  var monthsList = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  function toKey(y, m, d) {
    return y + "-" + String(m).padStart(2, "0") + "-" + String(d).padStart(2, "0");
  }

  var dailyMap = {};
  var monthTotalExpense = 0;
  var monthTxCount = 0;

  (p.expenses || []).forEach(function (e) {
    var rawDate = e.tanggal || e.date;
    if (!rawDate) return;
    var d, m, y;
    if (typeof rawDate === "string") {
      if (rawDate.indexOf("/") !== -1) {
        var parts = rawDate.split("/");
        if (parts.length === 3) {
          d = parseInt(parts[0], 10);
          m = parseInt(parts[1], 10);
          y = parseInt(parts[2], 10);
        }
      } else if (rawDate.indexOf("-") !== -1) {
        var parts = rawDate.split("-");
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            y = parseInt(parts[0], 10);
            m = parseInt(parts[1], 10);
            d = parseInt(parts[2], 10);
          } else {
            d = parseInt(parts[0], 10);
            m = parseInt(parts[1], 10);
            y = parseInt(parts[2], 10);
          }
        }
      }
    } else if (rawDate instanceof Date) {
      d = rawDate.getDate();
      m = rawDate.getMonth() + 1;
      y = rawDate.getFullYear();
    }

    if (y === selYear && m === selMonth && d && m && y) {
      var k = toKey(y, m, d);
      if (!dailyMap[k]) dailyMap[k] = { total: 0, items: [] };
      dailyMap[k].total += (e.nominal || 0);
      dailyMap[k].items.push(e);
      monthTotalExpense += (e.nominal || 0);
      monthTxCount++;
    }
  });

  var totalDaysInMonth = new Date(selYear, selMonth, 0).getDate();
  var daysHeader = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  var firstDayIndex = new Date(selYear, selMonth - 1, 1).getDay();

  var prevMonth = function () {
    if (selMonth === 1) { setSelMonth(12); setSelYear(selYear - 1); }
    else { setSelMonth(selMonth - 1); }
    setSelDateStr(null);
  };
  var nextMonth = function () {
    if (selMonth === 12) { setSelMonth(1); setSelYear(selYear + 1); }
    else { setSelMonth(selMonth + 1); }
    setSelDateStr(null);
  };
  var goToday = function () {
    var t = new Date();
    setSelYear(t.getFullYear());
    setSelMonth(t.getMonth() + 1);
    setSelDateStr(toKey(t.getFullYear(), t.getMonth() + 1, t.getDate()));
  };

  var selectedDayData = selDateStr ? dailyMap[selDateStr] : null;
  var todayKey = toKey(now.getFullYear(), now.getMonth() + 1, now.getDate());

  return React.createElement(
    "div",
    { style: { padding: "24px 28px 40px", maxWidth: 1280, margin: "0 auto", width: "100%", boxSizing: "border-box" } },

    // 1. TOP STAT & NAVIGATION BAR
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 16
        }
      },
      React.createElement(
        "div",
        null,
        React.createElement("h2", { style: { margin: "0 0 4px", fontSize: 22, fontWeight: 900, color: T.text, letterSpacing: -0.5 } }, "📅 Kalender Pengeluaran Harian"),
        React.createElement("div", { style: { fontSize: 13, color: T.textSub } }, "Lacak intensitas dan persebaran belanja setiap hari dalam kalender")
      ),
      // Month Total Pill
      React.createElement(
        "div",
        {
          style: {
            background: T.card,
            border: "1px solid " + T.border,
            borderRadius: 14,
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
          }
        },
        React.createElement(
          "div",
          null,
          React.createElement("div", { style: { fontSize: 10, color: "#E11D48", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 } }, "TOTAL BULAN " + monthsList[selMonth - 1].toUpperCase()),
          React.createElement("div", { style: { fontSize: 16, fontWeight: 900, color: "#E11D48", marginTop: 2 } }, "-" + fmt(monthTotalExpense))
        ),
        React.createElement("span", { style: { fontSize: 11, fontWeight: 700, background: "#F1F5F9", color: T.textSub, padding: "3px 8px", borderRadius: 8 } }, monthTxCount + " transaksi")
      )
    ),

    // 2. MONTH CONTROLLER CARD
    React.createElement(
      "div",
      {
        style: {
          background: T.card,
          borderRadius: 18,
          border: "1px solid " + T.border,
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          flexWrap: "wrap",
          gap: 10
        }
      },
      React.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        React.createElement(
          "button",
          {
            onClick: prevMonth,
            style: {
              background: T.panel,
              border: "1px solid " + T.border,
              borderRadius: 10,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              color: T.text,
              display: "inline-flex",
              alignItems: "center",
              gap: 4
            }
          },
          "← Bulan Lalu"
        ),
        React.createElement(
          "button",
          {
            onClick: goToday,
            style: {
              background: "rgba(2, 132, 199, 0.08)",
              border: "1px solid rgba(2, 132, 199, 0.25)",
              borderRadius: 10,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              color: T.teal
            }
          },
          "Hari Ini"
        )
      ),
      React.createElement(
        "div",
        { style: { fontSize: 16, fontWeight: 900, color: T.text, letterSpacing: -0.3, display: "flex", alignItems: "center", gap: 8 } },
        React.createElement("span", null, "🗓️"),
        React.createElement("span", null, monthsList[selMonth - 1] + " " + selYear)
      ),
      React.createElement(
        "button",
        {
          onClick: nextMonth,
          style: {
            background: T.panel,
            border: "1px solid " + T.border,
            borderRadius: 10,
            padding: "6px 14px",
            fontSize: 12,
            fontWeight: 800,
            cursor: "pointer",
            color: T.text,
            display: "inline-flex",
            alignItems: "center",
            gap: 4
          }
        },
        "Bulan Depan →"
      )
    ),

    // 3. MAIN 2-COLUMN VIEW (GRID + TRANSACTION DRAWER)
    React.createElement(
      "div",
      { style: { display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" } },

      // Left Column: Modern Calendar Grid
      React.createElement(
        "div",
        {
          style: {
            flex: "1 1 540px",
            background: T.card,
            borderRadius: 22,
            border: "1px solid " + T.border,
            padding: "20px 22px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
          }
        },
        // Days of week header
        React.createElement(
          "div",
          {
            style: {
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              textAlign: "center",
              fontWeight: 800,
              fontSize: 12,
              color: T.textSub,
              marginBottom: 10,
              paddingBottom: 10,
              borderBottom: "1px solid " + T.border
            }
          },
          daysHeader.map(function (d, idx) {
            return React.createElement(
              "div",
              { key: "dh-" + idx, style: { color: idx === 0 ? "#E11D48" : T.textSub } },
              d
            );
          })
        ),

        // Date Grid
        React.createElement(
          "div",
          { style: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 } },
          Array.from({ length: firstDayIndex }).map(function (_, i) {
            return React.createElement("div", { key: "empty-" + i, style: { background: "transparent", minHeight: 74 } });
          }),
          Array.from({ length: totalDaysInMonth }).map(function (_, i) {
            var dayNum = i + 1;
            var dateKey = toKey(selYear, selMonth, dayNum);
            var isSelected = selDateStr === dateKey;
            var isToday = todayKey === dateKey;
            var dayData = dailyMap[dateKey];
            var dayTotal = dayData ? dayData.total : 0;
            var isSunday = (new Date(selYear, selMonth - 1, dayNum).getDay() === 0);

            var badgeBg = "transparent";
            var badgeColor = T.textDim;
            var labelText = "";

            var dayMemoSummary = "";
            if (dayData && dayData.items && dayData.items.length > 0) {
              var summaries = dayData.items.map(function (it) {
                var memoStr = (it.memo_detail || it.catatan || "").trim();
                if (memoStr) {
                  var firstLine = memoStr.split("\n")[0];
                  return firstLine.length > 14 ? firstLine.substring(0, 14) + "…" : firstLine;
                }
                var reqStr = (it.keperluan || it.deskripsi || it.kategori || "").trim();
                return reqStr.length > 14 ? reqStr.substring(0, 14) + "…" : reqStr;
              });
              dayMemoSummary = summaries.join(", ");
            }

            if (dayTotal > 0) {
              if (dayTotal <= 50000) { badgeBg = "rgba(16, 185, 129, 0.12)"; badgeColor = "#059669"; }
              else if (dayTotal <= 150000) { badgeBg = "rgba(2, 132, 199, 0.12)"; badgeColor = "#0284C7"; }
              else { badgeBg = "rgba(225, 29, 72, 0.12)"; badgeColor = "#E11D48"; }

              if (window.privacyMode) labelText = "Rp •••";
              else if (dayTotal >= 1000000) labelText = "Rp " + (dayTotal / 1000000).toFixed(1) + "jt";
              else if (dayTotal >= 1000) labelText = "Rp " + Math.round(dayTotal / 1000) + "rb";
              else labelText = "Rp " + dayTotal;
            }

            return React.createElement(
              "div",
              {
                key: "day-" + dayNum,
                onClick: function () { setSelDateStr(dateKey); },
                style: {
                  background: isSelected ? "rgba(2, 132, 199, 0.08)" : isToday ? "#F8FAFC" : "#FFFFFF",
                  border: isSelected ? "2px solid #0284C7" : isToday ? "1.5px solid #0284C7" : "1px solid " + T.border,
                  borderRadius: 14,
                  padding: "8px 6px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: 74,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: isSelected ? "0 4px 12px rgba(2, 132, 199, 0.15)" : "none"
                }
              },
              React.createElement(
                "div",
                { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
                React.createElement(
                  "span",
                  {
                    style: {
                      fontSize: 12,
                      fontWeight: 900,
                      color: isSunday ? "#E11D48" : isToday ? "#0284C7" : T.text
                    }
                  },
                  dayNum
                ),
                isToday && React.createElement(
                  "span",
                  { style: { width: 5, height: 5, borderRadius: "50%", background: "#0284C7" }, title: "Hari Ini" }
                )
              ),
              dayMemoSummary ? React.createElement(
                "div",
                {
                  style: {
                    fontSize: 9,
                    color: T.textSub,
                    marginTop: 3,
                    marginBottom: 3,
                    textAlign: "center",
                    lineHeight: 1.2,
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical"
                  }
                },
                "📌 " + dayMemoSummary
              ) : null,
              labelText ? React.createElement(
                "div",
                {
                  style: {
                    background: badgeBg,
                    color: badgeColor,
                    fontSize: 9.5,
                    fontWeight: 800,
                    padding: "2px 5px",
                    borderRadius: 6,
                    marginTop: 2,
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }
                },
                labelText
              ) : React.createElement("div", { style: { fontSize: 8.5, color: "#CBD5E1", marginTop: 4, textAlign: "center" } }, "-")
            );
          })
        )
      ),

      // Right Column: Modern Side Drawer Rincian Transaksi
      React.createElement(
        "div",
        {
          style: {
            flex: "1 1 340px",
            background: T.card,
            borderRadius: 22,
            border: "1px solid " + T.border,
            padding: "22px 24px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
          }
        },
        React.createElement(
          "div",
          {
            style: {
              fontSize: 14,
              fontWeight: 800,
              color: T.text,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: 12,
              borderBottom: "1px solid " + T.border
            }
          },
          React.createElement("span", null, "📌 Rincian Transaksi Harian"),
          selDateStr && React.createElement(
            "button",
            {
              onClick: function () { setSelDateStr(null); },
              style: { background: "none", border: "none", color: T.textSub, fontSize: 12, cursor: "pointer", fontWeight: 700 }
            },
            "✕ Tutup"
          )
        ),

        selDateStr ? (function () {
          var parts = selDateStr.split("-");
          var displayD = parts[2] + " " + monthsList[parseInt(parts[1], 10) - 1] + " " + parts[0];

          return React.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 14 } },
            // Date Banner Card
            React.createElement(
              "div",
              {
                style: {
                  background: T.panel,
                  padding: "14px 18px",
                  borderRadius: 16,
                  border: "1px solid " + T.border
                }
              },
              React.createElement("div", { style: { fontSize: 11, color: T.textSub, fontWeight: 700 } }, "Tanggal " + displayD),
              React.createElement(
                "div",
                { style: { fontSize: 22, fontWeight: 900, color: "#E11D48", marginTop: 4 } },
                "-" + fmt(selectedDayData ? selectedDayData.total : 0)
              ),
              React.createElement(
                "div",
                { style: { fontSize: 11, color: T.textSub, marginTop: 2 } },
                (selectedDayData && selectedDayData.items ? selectedDayData.items.length : 0) + " transaksi tercatat pada tanggal ini"
              )
            ),

            // Item List
            selectedDayData && selectedDayData.items && selectedDayData.items.length > 0 ? React.createElement(
              "div",
              { style: { display: "flex", flexDirection: "column", gap: 10, maxHeight: 420, overflowY: "auto", paddingRight: 2 } },
              selectedDayData.items.map(function (item, idx) {
                var catInfo = getCat(item.kategori);
                var catDisplay = item.kategori === "Fashion" ? "Pakaian & Outfit" : item.kategori;
                var rawMemo = (item.memo_detail || item.catatan || "").trim();
                var memoLines = rawMemo ? rawMemo.split("\n").filter(function (l) { return l.trim().length > 0; }) : [];

                return React.createElement(
                  "div",
                  {
                    key: "item-" + idx,
                    onClick: function () { if (p.onEdit) p.onEdit(item); },
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      padding: "12px 14px",
                      background: T.surface,
                      borderRadius: 14,
                      border: "1px solid " + T.border,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                    }
                  },
                  // Item Title, Category & Nominal
                  React.createElement(
                    "div",
                    { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
                    React.createElement(
                      "div",
                      { style: { display: "flex", alignItems: "center", gap: 10 } },
                      React.createElement(
                        "div",
                        {
                          style: {
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: "#F1F5F9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 18,
                            flexShrink: 0
                          }
                        },
                        catInfo.emoji
                      ),
                      React.createElement(
                        "div",
                        null,
                        React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: T.text } }, item.keperluan || item.deskripsi || item.kategori),
                        React.createElement(
                          "div",
                          { style: { fontSize: 10, color: T.textSub, marginTop: 1, display: "flex", gap: 6 } },
                          React.createElement("span", null, catDisplay),
                          item.bayar && React.createElement("span", null, "· " + item.bayar)
                        )
                      )
                    ),
                    React.createElement("div", { style: { fontSize: 14, fontWeight: 900, color: "#E11D48" } }, "-" + fmt(item.nominal))
                  ),

                  // Memo Details Box
                  memoLines.length > 0 && React.createElement(
                    "div",
                    { style: { background: T.panel, border: "1px solid " + T.border, borderRadius: 8, padding: "8px 10px", display: "flex", flexDirection: "column", gap: 3, marginTop: 2 } },
                    React.createElement("div", { style: { fontSize: 10, fontWeight: 800, color: T.teal, display: "flex", alignItems: "center", gap: 4 } }, "📌 Memo Rincian:"),
                    memoLines.map(function (line, li) {
                      return React.createElement("div", { key: li, style: { fontSize: 11, color: T.text, lineHeight: 1.4 } }, "• " + line);
                    })
                  )
                );
              })
            ) : React.createElement(
              "div",
              { style: { padding: "24px 0", textAlign: "center", color: T.textSub, fontSize: 13 } },
              "Tidak ada pengeluaran di tanggal ini 🎉"
            )
          );
        })() : React.createElement(
          "div",
          {
            style: {
              padding: "40px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              color: T.textSub,
              gap: 12,
              textAlign: "center"
            }
          },
          React.createElement("div", { style: { fontSize: 36 } }, "👆"),
          React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: T.text } }, "Pilih Tanggal pada Kalender"),
          React.createElement("div", { style: { fontSize: 11, color: T.textSub, maxWidth: 240 } }, "Klik salah satu kotak tanggal di kalender sebelah kiri untuk melihat rincian belanja dan memonya.")
        )
      )
    )
  );
}

// ── Top Navigation Bar (Wise / Revolut Horizontal Fintech Header) ────────────
function TopNavbar(p) {
  var navItems = [
    { id: "dashboard", icon: "🏠", label: "Ringkasan" },
    { id: "pemasukan", icon: "💵", label: "Masuk" },
    { id: "pengeluaran", icon: "💸", label: "Keluar" },
    { id: "kalender-harian", icon: "📅", label: "Kalender" },
    { id: "tabungan", icon: "💎", label: "Tabungan" },
    { id: "analisis-bulanan", icon: "📈", label: "Bulanan" },
    { id: "analisis-tahunan", icon: "📊", label: "Tahunan" },
    { id: "zakat", icon: "🤲", label: "Zakat" },
  ];

  var initial = (p.user && p.user.name && p.user.name.trim()) ? p.user.name.trim().charAt(0).toUpperCase() : "U";

  return React.createElement(
    "header",
    {
      style: {
        background: T.surface,
        borderBottom: "1px solid " + T.border,
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        userSelect: "none"
      }
    },
    React.createElement(
      "div",
      {
        style: {
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 16px",
          display: "flex",
          flexDirection: "column"
        }
      },
      // Row 1: Brand + Action Pills + Profile
      React.createElement(
        "div",
        {
          style: {
            height: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12
          }
        },
        // Brand
        React.createElement(
          "div",
          {
            onClick: function () { p.onView("dashboard"); },
            style: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer", flexShrink: 0 }
          },
          React.createElement(
            "div",
            { style: { width: 30, height: 30, borderRadius: 8, background: "#0F172A", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, boxShadow: "0 2px 6px rgba(15,23,42,0.15)" } },
            "💰"
          ),
          React.createElement(
            "div",
            null,
            React.createElement("div", { style: { fontSize: 14, fontWeight: 900, color: T.text, letterSpacing: -0.4, lineHeight: 1.1 } }, "KeuanganKu"),
            React.createElement("div", { style: { fontSize: 8, color: T.textSub, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" } }, "FINTECH EDITION")
          )
        ),

        // Right: Action Pills & User Profile
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, flexShrink: 0 } },
          // Theme Switcher (Mode Siang / Mode Malam)
          React.createElement(
            "button",
            {
              onClick: p.onToggleTheme,
              title: p.isDark ? "Ganti ke Mode Terang (Siang)" : "Ganti ke Mode Gelap (Malam)",
              style: {
                padding: "5px 9px",
                borderRadius: 7,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                background: p.isDark ? "rgba(251, 191, 36, 0.15)" : T.panel,
                border: "1px solid " + (p.isDark ? "rgba(251, 191, 36, 0.35)" : T.border),
                color: p.isDark ? "#FBBF24" : T.textSub,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                transition: "all 0.15s ease"
              }
            },
            p.isDark ? "🌙 Gelap" : "☀️ Terang"
          ),
          React.createElement(
            "button",
            {
              onClick: p.onTogglePrivacy,
              title: p.privacyMode ? "Nonaktifkan Mode Privasi" : "Aktifkan Mode Privasi",
              style: {
                padding: "5px 9px",
                borderRadius: 7,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                background: p.privacyMode ? "rgba(2, 132, 199, 0.1)" : T.panel,
                border: "1px solid " + (p.privacyMode ? "rgba(2, 132, 199, 0.3)" : T.border),
                color: p.privacyMode ? T.teal : T.textSub,
                display: "inline-flex",
                alignItems: "center",
                gap: 3
              }
            },
            p.privacyMode ? "🙈 On" : "👁️ Off"
          ),
          React.createElement(
            "button",
            {
              onClick: p.onPromptPayday,
              title: "Ubah Tanggal Gajian",
              style: {
                padding: "5px 9px",
                borderRadius: 7,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                background: T.panel,
                border: "1px solid " + T.border,
                color: T.teal,
                display: "inline-flex",
                alignItems: "center",
                gap: 3
              }
            },
            "🗓️ " + p.paydayDate
          ),
          React.createElement(
            "button",
            {
              onClick: p.onOpenRepeat,
              title: "Repeat Order",
              style: {
                padding: "5px 9px",
                borderRadius: 7,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                background: T.panel,
                border: "1px solid " + T.border,
                color: T.textSub,
                display: "inline-flex",
                alignItems: "center",
                gap: 3
              }
            },
            "🔁"
          ),
          React.createElement("div", { style: { width: 1, height: 20, background: T.border, margin: "0 2px" } }),
          React.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", gap: 6 } },
            React.createElement(
              "div",
              {
                style: {
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #0F172A, #334155)",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }
              },
              initial
            ),
            React.createElement(
              "button",
              {
                onClick: p.onLogout,
                title: "Logout",
                style: {
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  color: T.coral,
                  padding: "4px 8px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 10,
                  fontWeight: 800
                }
              },
              "Keluar"
            )
          )
        )
      ),

      // Row 2: Navigation Tabs (full width, no scroll)
      React.createElement(
        "nav",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 0,
            paddingBottom: 0,
            width: "100%"
          }
        },
        navItems.map(function (item) {
          var active = p.view === item.id;
          return React.createElement(
            "button",
            {
              key: item.id,
              onClick: function () { p.onView(item.id); },
              style: {
                flex: 1,
                padding: "10px 0",
                border: "none",
                borderBottom: active ? ("2.5px solid " + T.teal) : "2.5px solid transparent",
                background: "transparent",
                color: active ? T.teal : T.textSub,
                fontSize: 12,
                fontWeight: active ? 800 : 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                transition: "all .15s ease",
                whiteSpace: "nowrap"
              }
            },
            React.createElement("span", { style: { fontSize: 14 } }, item.icon),
            item.label
          );
        })
      )
    )
  );
}

// ── Quick Execute Repeat Modal (Adjust price & instant save) ──────────────────
function QuickExecuteRepeatModal(p) {
  if (!p.open || !p.template) return null;
  var tmpl = p.template;

  var _t = useState(todayStr()), tanggal = _t[0], setTanggal = _t[1];
  var _nom = useState(""), nominal = _nom[0], setNominal = _nom[1];
  var _md = useState(""), memoDetail = _md[0], setMemoDetail = _md[1];

  useEffect(function () {
    if (tmpl) {
      setTanggal(todayStr());
      setNominal(formatRupiahInput(tmpl.nominal || 0));
      setMemoDetail(tmpl.memo_detail || "");
    }
  }, [tmpl, p.open]);

  function handleSave() {
    var nom = parseRupiahInput(nominal);
    if (!nom || nom <= 0) return;
    var parts = tanggal.split("/");
    var d = parseInt(parts[0]) || 1;
    var m = (parseInt(parts[1]) || 1) - 1;
    var y = parseInt(parts[2]) || new Date().getFullYear();

    var item = {
      id: uid(),
      month_id: mkKey(y, m),
      year: y,
      month: m,
      tanggal: tanggal,
      keperluan: tmpl.keperluan,
      kategori: tmpl.kategori,
      nominal: nom,
      bayar: tmpl.bayar || "Transfer",
      nw: tmpl.nw || "Need",
      catatan: memoDetail || "",
      memo_detail: memoDetail || "",
    };

    if (p.onSave) p.onSave(item);
    if (p.onClose) p.onClose();
  }

  var catInfo = getCat(tmpl.kategori);

  return React.createElement(
    Modal,
    { open: p.open, onClose: p.onClose, title: "⚡ Catat Repeat Order Instan", width: 440 },
    React.createElement(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 14 } },

      React.createElement(
        "div",
        { style: { background: T.tealDim, border: "1.5px solid " + T.teal + "40", padding: "14px 16px", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 } },
        React.createElement("span", { style: { fontSize: 26 } }, catInfo.emoji),
        React.createElement(
          "div",
          null,
          React.createElement("div", { style: { fontSize: 16, fontWeight: 900, color: T.text } }, tmpl.keperluan),
          React.createElement("div", { style: { fontSize: 11, color: T.textSub, marginTop: 2 } }, tmpl.kategori + " · " + (tmpl.bayar || "Transfer"))
        )
      ),

      React.createElement(
        "div",
        { style: { background: T.surface, border: "1.5px solid " + T.border, padding: 14, borderRadius: 12, display: "flex", flexDirection: "column", gap: 6 } },
        React.createElement("label", { style: { fontSize: 11, color: T.teal, fontWeight: 800, textTransform: "uppercase" } }, "💰 Nominal Harga (Dapat Diubah Jika Ada Perubahan Harga):"),
        React.createElement("input", {
          value: nominal,
          onChange: function (e) { setNominal(formatRupiahInput(e.target.value)); },
          style: { width: "100%", background: T.panel, border: "1.5px solid " + T.border, borderRadius: 8, padding: "8px 12px", fontSize: 18, fontWeight: 800, color: T.coral, outline: "none", boxSizing: "border-box" }
        }),
        React.createElement("div", { style: { fontSize: 10, color: T.textSub, fontStyle: "italic" } }, "💡 Ubah angka di atas jika terjadi kenaikan atau penurunan harga.")
      ),

      React.createElement(DDatePicker, { label: "Tanggal Pengeluaran", value: tanggal, onChange: setTanggal }),

      React.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 5 } },
        React.createElement("label", { style: { fontSize: 11, color: T.textSub, fontWeight: 700, textTransform: "uppercase" } }, "📌 Memo / Rincian Barang Spesifik"),
        React.createElement("textarea", {
          value: memoDetail,
          onChange: function (e) { setMemoDetail(e.target.value); },
          rows: 3,
          style: { width: "100%", background: T.panel, border: "1.5px solid " + T.border, borderRadius: 8, padding: 8, color: T.text, fontSize: 12, outline: "none", boxSizing: "border-box" }
        })
      ),

      React.createElement(
        "div",
        { style: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10, paddingTop: 14, borderTop: "1px solid " + T.border } },
        React.createElement(Btn, { outline: true, color: T.textSub, onClick: p.onClose }, "Batal"),
        React.createElement(Btn, { color: T.teal, onClick: handleSave }, "⚡ Catat Pengeluaran Sekarang")
      )
    )
  );
}

// ── Edit Repeat Template Modal ───────────────────────────────────────────────
function EditRepeatTemplateModal(p) {
  if (!p.open || !p.template) return null;
  var tmpl = p.template;

  var _k = useState(""), keperluan = _k[0], setKeperluan = _k[1];
  var _nom = useState(""), nominal = _nom[0], setNominal = _nom[1];
  var _cat = useState("Makan & Minum"), kategori = _cat[0], setKategori = _cat[1];
  var _md = useState(""), memoDetail = _md[0], setMemoDetail = _md[1];

  useEffect(function () {
    if (tmpl) {
      setKeperluan(tmpl.keperluan || "");
      setNominal(formatRupiahInput(tmpl.nominal || 0));
      setKategori(tmpl.kategori || "Makan & Minum");
      setMemoDetail(tmpl.memo_detail || "");
    }
  }, [tmpl, p.open]);

  function handleSave() {
    var nom = parseRupiahInput(nominal);
    if (!keperluan.trim() || !nom || nom <= 0) return;

    var updated = {
      id: tmpl.id,
      keperluan: keperluan,
      kategori: kategori,
      nominal: nom,
      bayar: tmpl.bayar || "Transfer",
      nw: tmpl.nw || "Need",
      memo_detail: memoDetail,
    };

    if (window.Api && window.Api.saveRepeatTemplate) {
      window.Api.saveRepeatTemplate(updated);
    }
    if (p.onSaved) p.onSaved();
    if (p.onClose) p.onClose();
  }

  var allCatKeys = Object.keys(CATS).concat(Object.keys(window.customCats || {})).filter(function (v, i, a) { return a.indexOf(v) === i; });

  return React.createElement(
    Modal,
    { open: p.open, onClose: p.onClose, title: "✏️ Edit Templat Repeat Order", width: 440 },
    React.createElement(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 14 } },
      React.createElement(DInput, { label: "Nama Templat / Keperluan", value: keperluan, onChange: setKeperluan }),
      React.createElement(
        "div",
        { style: { background: T.surface, border: "1.5px solid " + T.teal + "50", padding: 14, borderRadius: 12, display: "flex", flexDirection: "column", gap: 6 } },
        React.createElement("label", { style: { fontSize: 11, color: T.teal, fontWeight: 800, textTransform: "uppercase" } }, "✏️ Default Nominal Harga (Dapat Diubah Jika Harga Naik/Turun):"),
        React.createElement("input", {
          value: nominal,
          onChange: function (e) { setNominal(formatRupiahInput(e.target.value)); },
          style: { width: "100%", background: T.panel, border: "1.5px solid " + T.border, borderRadius: 8, padding: "8px 12px", fontSize: 18, fontWeight: 800, color: T.coral, outline: "none", boxSizing: "border-box" }
        }),
        React.createElement("div", { style: { fontSize: 10, color: T.textSub, fontStyle: "italic" } }, "💡 Jika terjadi kenaikan atau penurunan harga permanen, perbarui nominal di atas.")
      ),
      React.createElement(DSelect, { label: "Kategori", value: kategori, onChange: setKategori, options: allCatKeys }),
      React.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 5 } },
        React.createElement("label", { style: { fontSize: 11, color: T.textSub, fontWeight: 700, textTransform: "uppercase" } }, "📌 Memo / Rincian Barang Spesifik"),
        React.createElement("textarea", {
          value: memoDetail,
          onChange: function (e) { setMemoDetail(e.target.value); },
          rows: 3,
          style: { width: "100%", background: T.panel, border: "1.5px solid " + T.border, borderRadius: 8, padding: 8, color: T.text, fontSize: 12, outline: "none", boxSizing: "border-box" }
        })
      ),
      React.createElement(
        "div",
        { style: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10, paddingTop: 14, borderTop: "1px solid " + T.border } },
        React.createElement(Btn, { outline: true, color: T.textSub, onClick: p.onClose }, "Batal"),
        React.createElement(Btn, { color: T.teal, onClick: handleSave }, "💾 Simpan Perubahan Templat")
      )
    )
  );
}

// ── Repeat Order Modal (Template List) ────────────────────────────────────────
function RepeatOrderModal(p) {
  if (!p.open) return null;
  var _tmpls = useState([]), templates = _tmpls[0], setTemplates = _tmpls[1];
  var _execTmpl = useState(null), execTmpl = _execTmpl[0], setExecTmpl = _execTmpl[1];
  var _editTmpl = useState(null), editTmpl = _editTmpl[0], setEditTmpl = _editTmpl[1];

  function loadTemplates() {
    if (window.Api && window.Api.getRepeatTemplates) {
      setTemplates(window.Api.getRepeatTemplates());
    }
  }

  useEffect(function () {
    if (p.open) loadTemplates();
  }, [p.open]);

  function handleDelete(id) {
    if (window.Api && window.Api.deleteRepeatTemplate) {
      window.Api.deleteRepeatTemplate(id);
      loadTemplates();
    }
  }

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      Modal,
      { open: p.open, onClose: p.onClose, title: "🔁 Repeat Order (Belanja Berulang Cepat)", width: 540 },
      React.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 16 } },
        React.createElement(
          "div",
          { style: { fontSize: 12, color: T.textSub, lineHeight: 1.4 } },
          "Pilih belanjaan rutin Anda di bawah ini untuk mencatat transaksi secara instan. Klik ikon pensil ✏️ jika ingin memperbarui harga templat jika terjadi kenaikan/penurunan harga."
        ),
        React.createElement(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: 10, maxHeight: 340, overflowY: "auto", paddingRight: 4 } },
          templates.map(function (tmpl) {
            var catInfo = getCat(tmpl.kategori);
            return React.createElement(
              "div",
              {
                key: tmpl.id,
                style: {
                  background: T.surface, border: "1.5px solid " + T.border, borderRadius: 12, padding: "12px 16px",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12
                }
              },
              React.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 } },
                React.createElement("span", { style: { fontSize: 24 } }, catInfo.emoji),
                React.createElement(
                  "div",
                  { style: { flex: 1, minWidth: 0 } },
                  React.createElement("div", { style: { fontSize: 14, fontWeight: 800, color: T.text } }, tmpl.keperluan),
                  React.createElement("div", { style: { fontSize: 11, color: T.textSub, marginTop: 2 } }, tmpl.kategori + " · " + fmt(tmpl.nominal)),
                  tmpl.memo_detail ? React.createElement("div", { style: { fontSize: 10, color: T.teal, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, "📌 " + tmpl.memo_detail.replace(/\n/g, ", ")) : null
                )
              ),
              React.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 6 } },
                React.createElement(
                  Btn,
                  {
                    color: T.teal,
                    onClick: function () { setExecTmpl(tmpl); },
                    style: { padding: "6px 12px", fontSize: 12 }
                  },
                  "⚡ Pesan Ulang"
                ),
                React.createElement(
                  "button",
                  {
                    onClick: function () { setEditTmpl(tmpl); },
                    title: "Edit Templat (Harga / Nama)",
                    style: { background: T.card, border: "1px solid " + T.border, color: T.textSub, width: 28, height: 28, borderRadius: 6, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }
                  },
                  "✏️"
                ),
                React.createElement(
                  "button",
                  {
                    onClick: function () { handleDelete(tmpl.id); },
                    title: "Hapus Templat",
                    style: { background: T.coralDim, border: "1px solid " + T.coral + "30", color: T.coral, width: 28, height: 28, borderRadius: 6, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }
                  },
                  "✕"
                )
              )
            );
          })
        ),
        React.createElement(
          "div",
          { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 14, borderTop: "1px solid " + T.border } },
          React.createElement(
            Btn,
            {
              outline: true, color: T.teal,
              onClick: function () { if (p.onOpenAddExpense) p.onOpenAddExpense(); p.onClose(); }
            },
            "+ Buat Templat Baru Dari Form"
          ),
          React.createElement(Btn, { outline: true, color: T.textSub, onClick: p.onClose }, "Tutup")
        )
      )
    ),

    React.createElement(QuickExecuteRepeatModal, {
      open: !!execTmpl,
      template: execTmpl,
      onClose: function () { setExecTmpl(null); },
      onSave: function (item) {
        if (p.onSaveExpense) p.onSaveExpense(item);
        setExecTmpl(null);
        p.onClose();
      }
    }),

    React.createElement(EditRepeatTemplateModal, {
      open: !!editTmpl,
      template: editTmpl,
      onClose: function () { setEditTmpl(null); },
      onSaved: function () {
        loadTemplates();
      }
    })
  );
}

// ── Zakat & Donasi Full Page View ─────────────────────────────────────────────
function ZakatView(p) {
  var paydayDate = p.paydayDate || 28;
  var curPeriod = getFinancialPeriod(new Date(), paydayDate);

  var cycleIncomeList = (p.income || []).filter(function (i) {
    return getFinancialPeriod(i.tanggal || i.date, paydayDate).cycleKey === curPeriod.cycleKey;
  });
  var cycleIncomeTotal = cycleIncomeList.reduce(function (s, i) { return s + (i.nominal || 0); }, 0);

  var totalAllIncome = (p.income || []).reduce(function (s, i) { return s + (i.nominal || 0); }, 0);
  var totalAllExpense = (p.expenses || []).reduce(function (s, e) { return s + (e.nominal || 0); }, 0);
  var netCash = Math.max(0, totalAllIncome - totalAllExpense);
  var totalSavings = (p.savings || []).filter(function (s) { return s.tipe === "setoran"; }).reduce(function (a, s) { return a + s.nominal; }, 0) -
                     (p.savings || []).filter(function (s) { return s.tipe === "penarikan"; }).reduce(function (a, s) { return a + s.nominal; }, 0);
  var totalWealth = netCash + Math.max(0, totalSavings);

  var zakatHistory = (p.expenses || []).filter(function (e) {
    var kat = (e.kategori || "").toLowerCase();
    var kep = (e.keperluan || "").toLowerCase();
    return kat.indexOf("zakat") >= 0 || kat.indexOf("donasi") >= 0 ||
           kep.indexOf("zakat") >= 0 || kep.indexOf("donasi") >= 0 || kep.indexOf("sedekah") >= 0;
  }).sort(function (a, b) { return (b.tanggal || "").localeCompare(a.tanggal || ""); });
  var totalZakatPaid = zakatHistory.reduce(function (s, e) { return s + (e.nominal || 0); }, 0);

  var _tab = useState("profesi"), tab = _tab[0], setTab = _tab[1];
  var _useAutoInc = useState(true), useAutoInc = _useAutoInc[0], setUseAutoInc = _useAutoInc[1];
  var _manualInc = useState(formatRupiahInput(cycleIncomeTotal || 8000000)), manualInc = _manualInc[0], setManualInc = _manualInc[1];
  var _payMethod = useState("Transfer"), payMethod = _payMethod[0], setPayMethod = _payMethod[1];
  var _useAutoMaal = useState(true), useAutoMaal = _useAutoMaal[0], setUseAutoMaal = _useAutoMaal[1];
  var _manualMaal = useState(formatRupiahInput(totalWealth || 25000000)), manualMaal = _manualMaal[0], setManualMaal = _manualMaal[1];
  var _goldPrice = useState("1400000"), goldPrice = _goldPrice[0], setGoldPrice = _goldPrice[1];
  var _donasiPct = useState(2.5), donasiPct = _donasiPct[0], setDonasiPct = _donasiPct[1];
  var _isCustomNom = useState(false), isCustomNom = _isCustomNom[0], setIsCustomNom = _isCustomNom[1];
  var _customNominal = useState(""), customNominal = _customNominal[0], setCustomNominal = _customNominal[1];

  var effectiveIncome = useAutoInc ? cycleIncomeTotal : parseRupiahInput(manualInc);
  var nisabProfesiMonthly = 6859394;
  var meetsNisabProfesi = effectiveIncome >= nisabProfesiMonthly;
  var zakatProfesiNominal = Math.round(effectiveIncome * 0.025);

  var effectiveMaal = useAutoMaal ? totalWealth : parseRupiahInput(manualMaal);
  var parsedGold = parseRupiahInput(goldPrice) || 1400000;
  var nisabMaalAnnual = 85 * parsedGold;
  var meetsNisabMaal = effectiveMaal >= nisabMaalAnnual;
  var zakatMaalAnnualNominal = Math.round(effectiveMaal * 0.025);
  var zakatMaalMonthlyNominal = Math.round(zakatMaalAnnualNominal / 12);

  var baseDonasi = effectiveIncome > 0 ? effectiveIncome : totalWealth;
  var donasiNominal = isCustomNom ? parseRupiahInput(customNominal) : Math.round(baseDonasi * (donasiPct / 100));

  function recordExpense(title, nominal, memo) {
    if (!nominal || nominal <= 0) return;
    var now = new Date();
    var parts = todayStr().split("/");
    var y = parseInt(parts[2], 10) || now.getFullYear();
    var m = (parseInt(parts[1], 10) || (now.getMonth() + 1)) - 1;
    var item = {
      id: uid(), month_id: mkKey(y, m), year: y, month: m,
      tanggal: todayStr(), keperluan: title, kategori: "Donasi & Zakat",
      nominal: nominal, bayar: payMethod || "Transfer", nw: "Need", memo_detail: memo
    };
    if (p.onSaveExpense) p.onSaveExpense(item);
    if (p.showToast) p.showToast("✨ Berhasil mencatat " + title + " (" + fmt(nominal) + ") ke Pengeluaran!", "success");
  }

  function mkZToggle(isActive, label, onClick) {
    return React.createElement("button", { type: "button", onClick: onClick, style: {
      flex: 1, padding: "10px 12px", borderRadius: 10,
      border: "1.5px solid " + (isActive ? "#10B981" : T.border),
      background: isActive ? "rgba(16,185,129,0.12)" : T.panel,
      color: isActive ? "#10B981" : T.textSub,
      fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all .15s ease"
    } }, label);
  }

  function mkZInput(val, onChange, ph) {
    return React.createElement("input", { value: val, onChange: onChange, placeholder: ph, style: {
      background: T.panel, border: "1.5px solid " + T.border, borderRadius: 9,
      padding: "10px 14px", color: T.text, fontSize: 15, fontWeight: 800, outline: "none",
      width: "100%", boxSizing: "border-box"
    } });
  }

  // --- Tab: Profesi ---
  function profesiContent() {
    return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 16 } },
      React.createElement("div", { style: { display: "flex", gap: 10 } },
        mkZToggle(useAutoInc, "⚡ Pemasukan Siklus (" + fmt(cycleIncomeTotal) + ")", function () { setUseAutoInc(true); }),
        mkZToggle(!useAutoInc, "✏️ Masukkan Gaji Manual", function () { setUseAutoInc(false); })
      ),
      !useAutoInc && React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } },
        React.createElement("label", { style: { fontSize: 12, color: T.textSub, fontWeight: 700, textTransform: "uppercase" } }, "Nominal Penghasilan / Gaji Bulanan:"),
        mkZInput(manualInc, function (e) { setManualInc(formatRupiahInput(e.target.value)); }, "Contoh: 8.000.000")
      ),
      React.createElement("div", { style: {
        padding: "14px 16px", borderRadius: 12,
        background: meetsNisabProfesi ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)",
        border: "1.5px solid " + (meetsNisabProfesi ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)")
      } },
        React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: meetsNisabProfesi ? "#10B981" : "#D97706" } },
          meetsNisabProfesi ? "🟢 Memenuhi Ketentuan Nisab Zakat" : "🟡 Belum Wajib Zakat (Dianjurkan Sedekah)"),
        React.createElement("div", { style: { fontSize: 11.5, color: T.textSub, marginTop: 4 } },
          "Standar Nisab BAZNAS: " + fmt(nisabProfesiMonthly) + " / bulan (setara 85 gr emas/tahun).")
      ),
      React.createElement("div", { style: {
        background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.05))",
        border: "2px solid rgba(16,185,129,0.35)", borderRadius: 16, padding: "24px", textAlign: "center"
      } },
        React.createElement("div", { style: { fontSize: 12, color: "#10B981", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 } }, "Porsi Zakat / Sedekah (2.5%)"),
        React.createElement("div", { style: { fontSize: 36, fontWeight: 900, color: "#10B981", margin: "8px 0 4px" } }, fmt(zakatProfesiNominal)),
        React.createElement("div", { style: { fontSize: 12, color: T.textSub } }, "2.5% × " + fmt(effectiveIncome))
      ),
      React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
        React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: T.textSub } }, "Metode Pembayaran:"),
        React.createElement("select", {
          value: payMethod, onChange: function (e) { setPayMethod(e.target.value); },
          style: { background: T.panel, border: "1px solid " + T.border, color: T.text, padding: "8px 12px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", outline: "none" }
        }, ["Transfer", "M-Banking", "E-Wallet", "Cash", "QRIS"].map(function (m) { return React.createElement("option", { key: m, value: m }, m); }))
      ),
      React.createElement(Btn, { color: "#10B981", disabled: zakatProfesiNominal <= 0, onClick: function () {
        var title = (meetsNisabProfesi ? "Zakat Penghasilan" : "Sedekah Penghasilan") + " (" + curPeriod.monthName + ")";
        recordExpense(title, zakatProfesiNominal, "Perhitungan otomatis 2.5% dari pemasukan " + fmt(effectiveIncome));
      } }, "➕ Salurkan & Catat ke Pengeluaran (" + fmt(zakatProfesiNominal) + ")")
    );
  }

  // --- Tab: Maal ---
  function maalContent() {
    return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 16 } },
      React.createElement("div", { style: { display: "flex", gap: 10 } },
        mkZToggle(useAutoMaal, "⚡ Saldo & Tabungan (" + fmt(totalWealth) + ")", function () { setUseAutoMaal(true); }),
        mkZToggle(!useAutoMaal, "✏️ Masukkan Total Harta", function () { setUseAutoMaal(false); })
      ),
      !useAutoMaal && React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } },
        React.createElement("label", { style: { fontSize: 12, color: T.textSub, fontWeight: 700, textTransform: "uppercase" } }, "Total Harta Simpanan / Tabungan 1 Tahun:"),
        mkZInput(manualMaal, function (e) { setManualMaal(formatRupiahInput(e.target.value)); }, "Contoh: 120.000.000")
      ),
      React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", background: T.panel, padding: "10px 14px", borderRadius: 10, border: "1px solid " + T.border } },
        React.createElement("span", { style: { fontSize: 12, color: T.textSub, fontWeight: 600 } }, "Harga Emas per Gram:"),
        React.createElement("input", { value: goldPrice, onChange: function (e) { setGoldPrice(e.target.value.replace(/[^0-9]/g, "")); }, style: { width: 130, background: T.card, border: "1px solid " + T.border, borderRadius: 8, padding: "6px 10px", color: T.text, fontSize: 13, fontWeight: 800, textAlign: "right" } })
      ),
      React.createElement("div", { style: {
        padding: "14px 16px", borderRadius: 12,
        background: meetsNisabMaal ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)",
        border: "1.5px solid " + (meetsNisabMaal ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)")
      } },
        React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: meetsNisabMaal ? "#10B981" : "#D97706" } },
          meetsNisabMaal ? "🟢 Mencapai Nisab Maal (Wajib Zakat)" : "🟡 Belum Mencapai Nisab Maal"),
        React.createElement("div", { style: { fontSize: 11.5, color: T.textSub, marginTop: 4 } },
          "Nisab 85 gr Emas: " + fmt(nisabMaalAnnual) + " (wajib jika mengendap 1 tahun / haul).")
      ),
      React.createElement("div", { style: {
        background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.05))",
        border: "2px solid rgba(16,185,129,0.35)", borderRadius: 16, padding: "24px",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      } },
        React.createElement("div", null,
          React.createElement("div", { style: { fontSize: 12, color: "#10B981", fontWeight: 800, textTransform: "uppercase" } }, "Zakat Maal Tahunan (2.5%)"),
          React.createElement("div", { style: { fontSize: 32, fontWeight: 900, color: "#10B981", marginTop: 4 } }, fmt(zakatMaalAnnualNominal)),
          React.createElement("div", { style: { fontSize: 12, color: T.textSub, marginTop: 4 } }, "Atau dicicil: " + fmt(zakatMaalMonthlyNominal) + " / bulan")
        ),
        React.createElement("div", { style: { fontSize: 40 } }, "💎")
      ),
      React.createElement(Btn, { color: "#10B981", disabled: zakatMaalAnnualNominal <= 0, onClick: function () {
        recordExpense("Zakat Maal Tabungan", zakatMaalAnnualNominal, "Perhitungan zakat maal 2.5% dari harta simpanan " + fmt(effectiveMaal));
      } }, "➕ Catat Pengeluaran Zakat Maal (" + fmt(zakatMaalAnnualNominal) + ")")
    );
  }

  // --- Tab: Donasi ---
  function donasiContent() {
    return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 16 } },
      React.createElement("div", { style: { fontSize: 12, color: T.textSub } },
        "Pilih persentase donasi kebaikan dari pemasukan siklus ini (" + fmt(baseDonasi) + "):"),
      React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
        [{ val: 2.5, label: "2.5% (Standar)" }, { val: 5.0, label: "5% (Dermawan)" }, { val: 10.0, label: "10% (Besar)" }].map(function (opt) {
          var active = (!isCustomNom && donasiPct === opt.val);
          return React.createElement("button", { key: opt.val, type: "button",
            onClick: function () { setDonasiPct(opt.val); setIsCustomNom(false); },
            style: { flex: 1, padding: "10px 12px", borderRadius: 10, minWidth: 100,
              border: "1.5px solid " + (active ? "#10B981" : T.border),
              background: active ? "rgba(16,185,129,0.15)" : T.panel,
              color: active ? "#10B981" : T.text, fontSize: 12, fontWeight: 800, cursor: "pointer" }
          }, opt.label);
        }),
        React.createElement("button", { type: "button", onClick: function () { setIsCustomNom(true); }, style: {
          padding: "10px 14px", borderRadius: 10,
          border: "1.5px solid " + (isCustomNom ? "#10B981" : T.border),
          background: isCustomNom ? "rgba(16,185,129,0.15)" : T.panel,
          color: isCustomNom ? "#10B981" : T.text, fontSize: 12, fontWeight: 800, cursor: "pointer"
        } }, "Kustom")
      ),
      isCustomNom && React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } },
        React.createElement("label", { style: { fontSize: 12, color: T.textSub, fontWeight: 700, textTransform: "uppercase" } }, "Masukkan Nominal Sedekah Bebas:"),
        mkZInput(customNominal, function (e) { setCustomNominal(formatRupiahInput(e.target.value)); }, "Contoh: 100.000")
      ),
      React.createElement("div", { style: {
        background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.05))",
        border: "2px solid rgba(16,185,129,0.35)", borderRadius: 16, padding: "24px",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      } },
        React.createElement("div", null,
          React.createElement("div", { style: { fontSize: 12, color: "#10B981", fontWeight: 800, textTransform: "uppercase" } },
            isCustomNom ? "Nominal Sedekah Kustom" : ("Sedekah " + donasiPct + "%")),
          React.createElement("div", { style: { fontSize: 32, fontWeight: 900, color: "#10B981", marginTop: 4 } }, fmt(donasiNominal)),
          React.createElement("div", { style: { fontSize: 12, color: T.textSub, marginTop: 4 } }, "🌟 Membawa keberkahan dan melapangkan rezeki.")
        ),
        React.createElement("div", { style: { fontSize: 40 } }, "🤲")
      ),
      React.createElement(Btn, { color: "#10B981", disabled: donasiNominal <= 0, onClick: function () {
        recordExpense("Sedekah / Infaq Sukarela", donasiNominal, "Penyaluran sedekah kebaikan dari porsi penghasilan");
      } }, "➕ Salurkan & Catat (" + fmt(donasiNominal) + ")")
    );
  }

  return React.createElement("div", { style: { padding: "24px 16px", maxWidth: 960, margin: "0 auto", width: "100%" } },
    // Page Header
    React.createElement("div", { style: { marginBottom: 24 } },
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 8 } },
        React.createElement("div", { style: { width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #10B981, #059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#fff" } }, "🕌"),
        React.createElement("div", null,
          React.createElement("h1", { style: { fontSize: 22, fontWeight: 900, color: T.text, margin: 0 } }, "Zakat & Donasi"),
          React.createElement("p", { style: { fontSize: 13, color: T.textSub, margin: "2px 0 0" } }, "Hitung kewajiban zakat 2.5% dan porsi sedekah otomatis")
        )
      )
    ),
    // Summary Cards
    React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 } },
      React.createElement("div", { style: { background: T.card, borderRadius: 16, border: "1px solid " + T.border, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" } },
        React.createElement("div", { style: { fontSize: 11, color: T.textSub, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 } }, "💵 Pemasukan Siklus"),
        React.createElement("div", { style: { fontSize: 20, fontWeight: 900, color: T.teal } }, fmt(cycleIncomeTotal)),
        React.createElement("div", { style: { fontSize: 11, color: T.textSub, marginTop: 4 } }, curPeriod.monthName)
      ),
      React.createElement("div", { style: { background: T.card, borderRadius: 16, border: "1px solid " + T.border, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" } },
        React.createElement("div", { style: { fontSize: 11, color: T.textSub, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 } }, "💎 Total Harta & Tabungan"),
        React.createElement("div", { style: { fontSize: 20, fontWeight: 900, color: "#8B5CF6" } }, fmt(totalWealth))
      ),
      React.createElement("div", { style: { background: T.card, borderRadius: 16, border: "1px solid " + T.border, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" } },
        React.createElement("div", { style: { fontSize: 11, color: T.textSub, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 } }, "✅ Sudah Disalurkan"),
        React.createElement("div", { style: { fontSize: 20, fontWeight: 900, color: "#10B981" } }, fmt(totalZakatPaid)),
        React.createElement("div", { style: { fontSize: 11, color: T.textSub, marginTop: 4 } }, zakatHistory.length + " transaksi")
      )
    ),
    // Two Column Layout
    React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 } },
      // Left: Calculator
      React.createElement("div", { style: { background: T.card, borderRadius: 20, border: "1px solid " + T.border, padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" } },
        React.createElement("h2", { style: { fontSize: 16, fontWeight: 900, color: T.text, margin: "0 0 16px" } }, "🧮 Kalkulator"),
        React.createElement("div", { style: { display: "flex", background: T.panel, borderRadius: 12, padding: 4, border: "1px solid " + T.border, marginBottom: 20 } },
          [{ id: "profesi", label: "💼 Zakat Profesi" }, { id: "maal", label: "💎 Zakat Maal" }, { id: "donasi", label: "🤲 Sedekah Bebas" }].map(function (t) {
            var active = tab === t.id;
            return React.createElement("button", { key: t.id, type: "button", onClick: function () { setTab(t.id); }, style: {
              flex: 1, padding: "10px 8px", borderRadius: 9, border: "none",
              background: active ? "#10B981" : "transparent", color: active ? "#FFFFFF" : T.textSub,
              fontSize: 12, fontWeight: active ? 800 : 600, cursor: "pointer", transition: "all .15s ease", whiteSpace: "nowrap"
            } }, t.label);
          })
        ),
        tab === "profesi" && profesiContent(),
        tab === "maal" && maalContent(),
        tab === "donasi" && donasiContent()
      ),
      // Right: History
      React.createElement("div", { style: { background: T.card, borderRadius: 20, border: "1px solid " + T.border, padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column" } },
        React.createElement("h2", { style: { fontSize: 16, fontWeight: 900, color: T.text, margin: "0 0 16px" } }, "📋 Riwayat Penyaluran"),
        zakatHistory.length === 0
          ? React.createElement("div", { style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "40px 0", color: T.textSub } },
              React.createElement("div", { style: { fontSize: 48, opacity: 0.3 } }, "🤲"),
              React.createElement("div", { style: { fontSize: 13, fontWeight: 600, textAlign: "center" } }, "Belum ada riwayat penyaluran."),
              React.createElement("div", { style: { fontSize: 12, textAlign: "center" } }, "Gunakan kalkulator di sebelah kiri untuk mulai.")
            )
          : React.createElement("div", { style: { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, maxHeight: 500 } },
              zakatHistory.slice(0, 20).map(function (item, idx) {
                return React.createElement("div", { key: item.id || idx, style: {
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12,
                  background: T.panel, border: "1px solid " + T.border
                } },
                  React.createElement("div", { style: { width: 38, height: 38, borderRadius: 10, background: "rgba(16,185,129,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 } }, "🤲"),
                  React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                    React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, item.keperluan || "Zakat/Donasi"),
                    React.createElement("div", { style: { fontSize: 11, color: T.textSub, marginTop: 2 } }, (item.tanggal || "-") + " • " + (item.bayar || "Transfer"))
                  ),
                  React.createElement("div", { style: { fontSize: 14, fontWeight: 900, color: "#10B981", whiteSpace: "nowrap" } }, fmt(item.nominal || 0))
                );
              })
            )
      )
    )
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
function App() {
  var _u = useState(null), user = _u[0], setUser = _u[1];
  var _cs = useState(true), checkingSession = _cs[0], setCheckingSession = _cs[1];
  var _ld = useState(true), loading = _ld[0], setLoading = _ld[1];
  var _ex = useState([]), expenses = _ex[0], setExpenses = _ex[1];
  var _inc = useState([]), income = _inc[0], setIncome = _inc[1];
  var _sa = useState([]), savings = _sa[0], setSavings = _sa[1];
  var _vw = useState("dashboard"), view = _vw[0], setView = _vw[1];
  var _sef = useState(false), showExpForm = _sef[0], setSEF = _sef[1];
  var _sif = useState(false), showIncForm = _sif[0], setSIF = _sif[1];
  var _ssf = useState(false), showSavForm = _ssf[0], setSSF = _ssf[1];
  var _eex = useState(null), editingExp = _eex[0], setEditExp = _eex[1];
  var _ein = useState(null), editingInc = _ein[0], setEditInc = _ein[1];
  var _esv = useState(null), editingSav = _esv[0], setEditSav = _esv[1];
  var _dst = useState("setoran"), defaultSavTipe = _dst[0], setDST = _dst[1];
  var _dt = useState(null), deleteTarget = _dt[0], setDT = _dt[1];
  var _pm = useState(window.privacyMode || false), privacyMode = _pm[0], setPrivacyMode = _pm[1];
  var _thm = useState(function () { return !!window.darkMode; }), isDark = _thm[0], setIsDark = _thm[1];
  var _sro = useState(false), showRepeatModal = _sro[0], setShowRepeatModal = _sro[1];
  var _pdd = useState(function () {
    try {
      var saved = localStorage.getItem("keuangan_payday_date");
      return saved ? parseInt(saved, 10) : 28;
    } catch (e) {
      return 28;
    }
  });
  var paydayDate = _pdd[0], setPaydayDate = _pdd[1];
  var tk = useToast();

  var updatePaydayDate = useCallback(function (newDate) {
    var val = Math.min(31, Math.max(1, parseInt(newDate, 10) || 28));
    setPaydayDate(val);
    try {
      localStorage.setItem("keuangan_payday_date", String(val));
    } catch (e) {}
    tk.show("Tanggal gajian diatur ke tanggal " + val, "success");
  }, [tk]);

  var togglePrivacyMode = function () {
    var next = !privacyMode;
    window.privacyMode = next;
    setPrivacyMode(next);
    try {
      localStorage.setItem("keuangan_privacy_mode", next ? "true" : "false");
    } catch (e) {}
    tk.show(next ? "Mode Privasi Aktif (Nominal Disamarkan)" : "Mode Privasi Nonaktif", "info");
  };

  var toggleTheme = useCallback(function () {
    var next = !isDark;
    setIsDark(next);
    applyTheme(next);
    tk.show(next ? "🌙 Mode Malam aktif" : "☀️ Mode Terang aktif", "info");
  }, [isDark, tk]);

  useEffect(function () {
    applyTheme(isDark);
  }, []);

  useEffect(function () {
    window.Api.getSession().then(function (u) {
      if (u) setUser(u);
      setCheckingSession(false);
    }).catch(function () {
      setCheckingSession(false);
    });
  }, []);

  // Force document body background to match theme tokens directly in DOM
  useEffect(function () {
    if (typeof document !== "undefined" && document.body) {
      document.body.style.background = T.bg;
      document.body.style.color = T.text;
    }
  }, []);

  useEffect(function () {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    window.Api.fetchAll().then(function (data) {
      setExpenses(data.expenses || []);
      setIncome(data.income || []);
      setSavings(data.savings || []);
      setLoading(false);
    }).catch(function (e) {
      tk.show(e.message || "Gagal memuat data.", "error");
      setLoading(false);
    });
  }, [user]);

  var handleAuth = useCallback(function (u) { setUser(u); }, []);
  var handleLogout = useCallback(function () {
    window.Api.logout().finally(function () {
      setUser(null); setExpenses([]); setIncome([]); setSavings([]); setView("dashboard");
    });
  }, []);

  var saveExpense = useCallback(function (item) {
    window.Api.saveExpense(item).then(function (saved) {
      setExpenses(function (p) { return p.some(function (e) { return e.id === saved.id; }) ? p.map(function (e) { return e.id === saved.id ? saved : e; }) : [].concat(p, [saved]); });

      var catLower = (saved.kategori || "").toLowerCase();
      var reqLower = (saved.keperluan || "").toLowerCase();
      if (catLower.indexOf("tabungan") >= 0 || catLower.indexOf("investasi") >= 0 || reqLower.indexOf("tabungan") >= 0) {
        var autoSav = {
          id: "sav_auto_" + saved.id,
          tipe: "setoran",
          lokasi: "KROM",
          tanggal: saved.tanggal,
          nominal: saved.nominal,
          catatan: "Otomatis dari Pengeluaran: " + saved.keperluan + (saved.memo_detail ? (" (" + saved.memo_detail.replace(/\n/g, ", ") + ")") : "")
        };
        window.Api.saveSaving(autoSav).then(function (savedSav) {
          setSavings(function (p) {
            return p.some(function (s) { return s.id === savedSav.id; }) ? p.map(function (s) { return s.id === savedSav.id ? savedSav : s; }) : [savedSav].concat(p);
          });
          tk.show("✨ Pengeluaran Tabungan otomatis dicatat ke Tabel Tabungan (KROM)!", "success");
        }).catch(function () {});
      }
    }).catch(function (e) { tk.show(e.message || "Gagal menyimpan pengeluaran.", "error"); });
    setEditExp(null);
  }, []);

  var saveIncome = useCallback(function (item) {
    window.Api.saveIncome(item).then(function (saved) {
      setIncome(function (p) { return p.some(function (i) { return i.id === saved.id; }) ? p.map(function (i) { return i.id === saved.id ? saved : i; }) : [].concat(p, [saved]); });
    }).catch(function (e) { tk.show(e.message || "Gagal menyimpan pemasukan.", "error"); });
    setEditInc(null);
  }, []);

  var saveSaving = useCallback(function (item) {
    window.Api.saveSaving(item).then(function (saved) {
      setSavings(function (p) { return p.some(function (s) { return s.id === saved.id; }) ? p.map(function (s) { return s.id === saved.id ? saved : s; }) : [].concat(p, [saved]); });
    }).catch(function (e) { tk.show(e.message || "Gagal menyimpan tabungan.", "error"); });
    setEditSav(null);
  }, []);

  var confirmDelete = function () {
    if (!deleteTarget) return;
    var id = deleteTarget.id, type = deleteTarget.type;
    setDT(null);
    if (type === "expense") {
      window.Api.deleteExpense(id).then(function () {
        setExpenses(function (p) { return p.filter(function (e) { return e.id !== id; }); });
        var autoSavId = "sav_auto_" + id;
        window.Api.deleteSaving(autoSavId).then(function () {
          setSavings(function (p) { return p.filter(function (s) { return s.id !== autoSavId; }); });
        }).catch(function () {});
        tk.show("Transaksi pengeluaran dihapus", "info");
      }).catch(function (e) { tk.show(e.message || "Gagal menghapus.", "error"); });
    } else if (type === "income") {
      window.Api.deleteIncome(id).then(function () {
        setIncome(function (p) { return p.filter(function (i) { return i.id !== id; }); });
        tk.show("Transaksi pemasukan dihapus", "info");
      }).catch(function (e) { tk.show(e.message || "Gagal menghapus.", "error"); });
    } else if (type === "saving") {
      window.Api.deleteSaving(id).then(function () {
        setSavings(function (p) { return p.filter(function (s) { return s.id !== id; }); });
        tk.show("Mutasi tabungan dihapus", "info");
      }).catch(function (e) { tk.show(e.message || "Gagal menghapus.", "error"); });
    }
  };

  if (checkingSession) return React.createElement("div", { style: { background: T.bg, width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" } }, React.createElement("div", { style: { fontSize: 44 } }, "💰"), React.createElement("div", { style: { fontSize: 16, color: T.textSub, fontWeight: 600 } }, "Memeriksa sesi..."));
  if (!user) return React.createElement(AuthScreen, { onAuth: handleAuth });
  if (loading) return React.createElement("div", { style: { background: T.bg, width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" } }, React.createElement("div", { style: { fontSize: 44 } }, "💰"), React.createElement("div", { style: { fontSize: 16, color: T.textSub, fontWeight: 600 } }, "Memuat data..."));

  return React.createElement(
    "div",
    { style: { background: T.bg, width: "100vw", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: T.text } },
    React.createElement(TopNavbar, {
      view: view,
      onView: setView,
      user: user,
      onLogout: handleLogout,
      privacyMode: privacyMode,
      onTogglePrivacy: togglePrivacyMode,
      isDark: isDark,
      onToggleTheme: toggleTheme,
      paydayDate: paydayDate,
      onPromptPayday: function () {
        var res = prompt("Masukkan Tanggal Siklus Gajian (1 - 31):", String(paydayDate));
        if (res !== null && res.trim()) {
          updatePaydayDate(res);
        }
      },
      onOpenRepeat: function () { setShowRepeatModal(true); }
    }),
    React.createElement(
      "div",
      { style: { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" } },
      (function () {
        if (view === "dashboard") return React.createElement(DashboardView, {
          key: "view-dash",
          expenses: expenses,
          income: income,
          savings: savings,
          paydayDate: paydayDate,
          onUpdatePayday: updatePaydayDate,
          onOpenRepeat: function () { setShowRepeatModal(true); },
          onSaveExpense: saveExpense,
          showToast: tk.show,
          onAddIncome: function () { setEditInc(null); setSIF(true); },
          onAddExpense: function () { setEditExp(null); setSEF(true); },
          onAddSaving: function (t) { setDST(t || "setoran"); setEditSav(null); setSSF(true); }
        });
        if (view === "pemasukan") return React.createElement(PemasukanView, { key: "view-inc", income: income, paydayDate: paydayDate, onAdd: function () { setEditInc(null); setSIF(true); }, onEdit: function (item) { setEditInc(item); setSIF(true); }, onDelete: function (id) { setDT({ type: "income", id: id }); } });
        if (view === "pengeluaran") return React.createElement(PengeluaranView, { key: "view-exp", expenses: expenses, paydayDate: paydayDate, onAdd: function () { setEditExp(null); setSEF(true); }, onEdit: function (item) { setEditExp(item); setSEF(true); }, onDelete: function (id, item) { var lbl = item ? (item.keperluan + " (" + fmt(item.nominal) + ")") : ""; setDT({ type: "expense", id: id, label: lbl }); }, onOpenRepeat: function () { setShowRepeatModal(true); } });
        if (view === "kalender-harian") return React.createElement(KalenderPengeluaranView, { key: "view-kph", expenses: expenses, income: income, savings: savings, paydayDate: paydayDate, onEdit: function (item) { setEditExp(item); setSEF(true); }, onSave: saveExpense });
        if (view === "tabungan") return React.createElement(TabunganView, { key: "view-sav", savings: savings, paydayDate: paydayDate, onAdd: function (tipe) { setDST(tipe || "setoran"); setEditSav(null); setSSF(true); }, onEdit: function (item) { setEditSav(item); setSSF(true); }, onDelete: function (id) { setDT({ type: "saving", id: id }); } });
        if (view === "analisis-bulanan") return React.createElement(AnalisisBulananView, { key: "view-amb", expenses: expenses, income: income, paydayDate: paydayDate, onUpdatePayday: updatePaydayDate });
        if (view === "analisis-tahunan") return React.createElement(AnalisisTahunanView, { key: "view-amt", expenses: expenses, income: income, paydayDate: paydayDate });
        if (view === "zakat") return React.createElement(ZakatView, { key: "view-zkt", expenses: expenses, income: income, savings: savings, paydayDate: paydayDate, onSaveExpense: saveExpense, showToast: tk.show });
        return null;
      })()
    ),
    React.createElement(ExpenseForm, { key: "modal-exp", open: showExpForm, onClose: function () { setSEF(false); setEditExp(null); }, onSave: saveExpense, initial: editingExp, showToast: tk.show }),
    React.createElement(IncomeForm, { key: "modal-inc", open: showIncForm, onClose: function () { setSIF(false); setEditInc(null); }, onSave: saveIncome, initial: editingInc, showToast: tk.show }),
    React.createElement(SavingForm, { key: "modal-sav", open: showSavForm, onClose: function () { setSSF(false); setEditSav(null); }, onSave: saveSaving, initial: editingSav, defaultTipe: defaultSavTipe, showToast: tk.show }),
    React.createElement(RepeatOrderModal, { key: "modal-rpt", open: showRepeatModal, onClose: function () { setShowRepeatModal(false); }, onSaveExpense: saveExpense, onOpenAddExpense: function () { setEditExp(null); setSEF(true); } }),
    React.createElement(ConfirmModal, { key: "modal-del", open: !!deleteTarget, label: deleteTarget ? deleteTarget.label : "", message: "Yakin ingin menghapus transaksi ini? Data tidak bisa dikembalikan.", onConfirm: confirmDelete, onCancel: function () { setDT(null); } }),
    React.createElement(NameOnboardingModal, { key: "modal-name", open: user && (!user.name || !user.name.trim()), onSave: function (u) { setUser(u); tk.show("Nama akun berhasil disimpan!"); } }),
    React.createElement(Toast, { key: "toast-msg", toast: tk.toast })
  );
}

// Expose App to global scope so index.html mountApp() can render it
window.App = App;
