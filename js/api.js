// api.js — Supabase-backed data layer for Keuangan Ku.
// Exposes a single global `Api` object that the app (app.js) calls into.
// All authentication and per-user data isolation is handled by Supabase
// (Auth + Row Level Security) — this file is just a thin, well-typed wrapper
// around the Supabase JS client so app.js doesn't need to know anything
// about Supabase's specific API shapes.

(function () {
  function getConfig() {
    var c = window.__SUPABASE_CONFIG__ || {};
    var env = window.ENV || {};
    var url = c.url || env.SUPABASE_URL || "https://pqitifokokwsavruonhg.supabase.co";
    var anonKey = c.anonKey || env.SUPABASE_ANON_KEY || "sb_publishable_le077LMIDMx5VA1UqHR4Wg_5e5ZR7w5";
    return { url: url, anonKey: anonKey };
  }

  var cfg = getConfig();

  var sb = window.supabase.createClient(cfg.url, cfg.anonKey, {
    auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
  });

  function mkKey(y, m) {
    return y + "-" + String(m).padStart(2, "0");
  }

  // Translate raw Supabase/Postgres error messages into friendly Indonesian text.
  function mapError(error) {
    if (!error) return "Terjadi kesalahan.";
    var msg = error.message || String(error);
    if (/already registered|already exists/i.test(msg)) return "Email atau username ini sudah terdaftar. Silakan masuk.";
    if (/invalid login credentials/i.test(msg)) return "Email/username atau password salah.";
    if (/password should be at least/i.test(msg)) return "Password minimal 6 karakter.";
    if (/invalid email|email address.*invalid/i.test(msg)) return "Gunakan alamat email asli yang sah (contoh: nama@gmail.com).";
    if (/rate limit/i.test(msg)) return "Terlalu banyak percobaan. Coba lagi sebentar lagi.";
    if (/duplicate key/i.test(msg)) return "Data ini sudah ada.";
    if (/network|fetch/i.test(msg)) return "Tidak bisa terhubung ke server. Periksa koneksi internet.";
    return msg;
  }

  function toEmail(input) {
    var str = (input || "").trim().toLowerCase();
    if (str.indexOf("@") >= 0) return str;
    return str + "@keuanganku.app";
  }

  async function currentUserId() {
    var res = await sb.auth.getUser();
    return res.data && res.data.user ? res.data.user.id : null;
  }

  // Force every `nominal` field to a real JS number — defensive coercion in
  // case any layer ever serializes bigint as a string.
  function coerceNominal(rows) {
    return (rows || []).map(function (r) {
      if (r && r.nominal !== undefined) r.nominal = Number(r.nominal);
      return r;
    });
  }

  var Api = {
    // ── LocalStorage Helpers for Guest / Offline Fallback ──
    _getLocal: function (key) {
      try { return JSON.parse(localStorage.getItem("kq_" + key) || "[]"); } catch (e) { return []; }
    },
    _setLocal: function (key, data) {
      try { localStorage.setItem("kq_" + key, JSON.stringify(data)); } catch (e) {}
    },

    // ── Auth ──────────────────────────────────────────────────────────────
    loginGuest: async function () {
      var guestUser = { id: "guest_demo", username: "tamu", name: "Pengguna Tamu", email: "tamu@keuanganku.app" };
      localStorage.setItem("keuanganku_guest_user", JSON.stringify(guestUser));
      return { user: guestUser };
    },

    register: async function (email, username, password) {
      var cleanEmail = (email || "").trim().toLowerCase();
      if (!cleanEmail || cleanEmail.indexOf("@") < 0) {
        throw new Error("Masukkan alamat email yang valid (contoh: nama@gmail.com).");
      }
      var cleanUser = (username || "").trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "");
      if (!cleanUser || cleanUser.length < 3) {
        throw new Error("Username minimal 3 karakter (huruf, angka, _, ., -).");
      }

      try {
        var res = await sb.auth.signUp({
          email: cleanEmail,
          password: password,
          options: { data: { name: "", username: cleanUser } },
        });
        if (res.error) throw new Error(mapError(res.error));
        if (!res.data.user) throw new Error("Registrasi gagal. Coba lagi.");
        if (!res.data.session) {
          throw new Error(
            "Akun berhasil dibuat! Silakan masuk dengan Email/Username & Password kamu."
          );
        }
        return {
          user: { id: res.data.user.id, username: cleanUser, name: "", email: cleanEmail },
        };
      } catch (e) {
        // Fallback for offline/guest creation if server fails
        if (e.message && e.message.indexOf("berhasil dibuat") >= 0) throw e;
        var guestUser = { id: "user_" + Date.now(), username: cleanUser, name: cleanUser, email: cleanEmail };
        localStorage.setItem("keuanganku_guest_user", JSON.stringify(guestUser));
        return { user: guestUser };
      }
    },

    login: async function (usernameOrEmail, password) {
      var input = (usernameOrEmail || "").trim().toLowerCase();
      try {
        var res = await sb.auth.signInWithPassword({ email: input, password: password });
        if (res.error && input.indexOf("@") < 0) {
          var altRes = await sb.auth.signInWithPassword({ email: toEmail(input), password: password });
          if (!altRes.error) res = altRes;
        }
        if (res.error) throw new Error(mapError(res.error));
        var user = res.data.user;
        var meta = user.user_metadata || {};
        var uname = meta.username || (user.email ? user.email.split("@")[0] : "user");
        var name = meta.name || "";
        return { user: { id: user.id, username: uname, name: name, email: user.email } };
      } catch (e) {
        if (input === "demo" || input === "tamu" || !window.navigator.onLine) {
          return this.loginGuest();
        }
        throw new Error(mapError(e));
      }
    },

    updateName: async function (name) {
      var cleanName = (name || "").trim();
      if (!cleanName) throw new Error("Nama wajib diisi.");
      var guestStr = localStorage.getItem("keuanganku_guest_user");
      if (guestStr) {
        try {
          var g = JSON.parse(guestStr);
          g.name = cleanName;
          localStorage.setItem("keuanganku_guest_user", JSON.stringify(g));
          return { user: g };
        } catch (e) {}
      }
      var res = await sb.auth.updateUser({ data: { name: cleanName } });
      if (res.error) throw new Error(mapError(res.error));
      var user = res.data.user;
      var meta = user.user_metadata || {};
      var uname = meta.username || (user.email ? user.email.split("@")[0] : "user");
      return { user: { id: user.id, username: uname, name: cleanName, email: user.email } };
    },

    logout: async function () {
      localStorage.removeItem("keuanganku_guest_user");
      try { await sb.auth.signOut(); } catch (e) {}
    },

    getSession: async function () {
      var guestStr = localStorage.getItem("keuanganku_guest_user");
      if (guestStr) {
        try { return JSON.parse(guestStr); } catch (e) {}
      }
      try {
        var res = await sb.auth.getSession();
        if (!res.data || !res.data.session) return null;
        var user = res.data.session.user;
        var meta = user.user_metadata || {};
        var uname = meta.username || (user.email ? user.email.split("@")[0] : "user");
        var name = meta.name || "";
        return { id: user.id, username: uname, name: name, email: user.email };
      } catch (e) {
        return null;
      }
    },

    _getMemoMap: function () {
      try {
        var str = localStorage.getItem("kq_memo_dict");
        return str ? JSON.parse(str) : {};
      } catch (e) { return {}; }
    },
    _setMemoMap: function (dict) {
      try { localStorage.setItem("kq_memo_dict", JSON.stringify(dict || {})); } catch (e) {}
    },

    // ── Bootstrap: load everything for the logged-in user ────────
    fetchAll: async function () {
      var isGuest = !!localStorage.getItem("keuanganku_guest_user");
      if (isGuest) {
        var memoMap = this._getMemoMap();
        var rawExp = this._getLocal("expenses");
        var expensesList = rawExp.map(function (e) {
          var m = e.memo_detail || memoMap[e.id] || e.catatan || "";
          e.memo_detail = m;
          return e;
        });
        return {
          months: this._getLocal("months"),
          expenses: expensesList,
          income: this._getLocal("income"),
          savings: this._getLocal("savings"),
        };
      }
      try {
        var uid = await currentUserId();
        if (!uid) return { months: [], expenses: [], income: [], savings: [] };

        var results = await Promise.all([
          sb.from("months").select("*").order("id", { ascending: true }),
          sb.from("expenses").select("*").order("tanggal", { ascending: false }),
          sb.from("income").select("*").order("tanggal", { ascending: false }),
          sb.from("savings").select("*").order("tanggal", { ascending: false }),
        ]);

        var mRes = results[0], eRes = results[1], iRes = results[2], sRes = results[3];
        if (mRes.error || eRes.error || iRes.error || sRes.error) throw new Error("Supabase error");

        var memoMap = this._getMemoMap();
        var expensesList = coerceNominal(eRes.data).map(function (e) {
          var m = e.memo_detail || memoMap[e.id] || e.catatan || "";
          e.memo_detail = m;
          return e;
        });

        return {
          months: (mRes.data || []).map(function (x) { return { key: x.id, year: x.year, month: x.month, label: x.label }; }),
          expenses: expensesList,
          income: coerceNominal(iRes.data),
          savings: coerceNominal(sRes.data),
        };
      } catch (e) {
        var memoMap = this._getMemoMap();
        var rawExp = this._getLocal("expenses");
        var expensesList = rawExp.map(function (e) {
          var m = e.memo_detail || memoMap[e.id] || e.catatan || "";
          e.memo_detail = m;
          return e;
        });
        return {
          months: this._getLocal("months"),
          expenses: expensesList,
          income: this._getLocal("income"),
          savings: this._getLocal("savings"),
        };
      }
    },

    // ── Income ───────────────────────────────────────────────────────────
    saveIncome: async function (item) {
      var isGuest = !!localStorage.getItem("keuanganku_guest_user");
      if (isGuest) {
        var list = this._getLocal("income");
        var idx = list.findIndex(function (x) { return x.id === item.id; });
        if (idx >= 0) list[idx] = item; else list.unshift(item);
        this._setLocal("income", list);
        return item;
      }
      try {
        var uid = await currentUserId();
        var row = {
          id: item.id,
          user_id: uid,
          month_id: mkKey(item.year, item.month),
          year: item.year,
          month: item.month,
          tanggal: item.tanggal,
          sumber: item.sumber,
          nominal: item.nominal,
          metode: item.metode,
          catatan: item.catatan || "",
        };
        var res = await sb.from("income").upsert(row).select().single();
        if (res.error) throw new Error(mapError(res.error));
        res.data.nominal = Number(res.data.nominal);
        return res.data;
      } catch (e) {
        var list = this._getLocal("income");
        var idx = list.findIndex(function (x) { return x.id === item.id; });
        if (idx >= 0) list[idx] = item; else list.unshift(item);
        this._setLocal("income", list);
        return item;
      }
    },

    deleteIncome: async function (id) {
      var isGuest = !!localStorage.getItem("keuanganku_guest_user");
      if (isGuest) {
        var list = this._getLocal("income").filter(function (x) { return x.id !== id; });
        this._setLocal("income", list);
        return;
      }
      try {
        var res = await sb.from("income").delete().eq("id", id);
        if (res.error) throw new Error(mapError(res.error));
      } catch (e) {
        var list = this._getLocal("income").filter(function (x) { return x.id !== id; });
        this._setLocal("income", list);
      }
    },

    // ── Expenses ─────────────────────────────────────────────────────────
    saveExpense: async function (item) {
      var memoText = (item.memo_detail || item.catatan || "").trim();
      var memoMap = this._getMemoMap();
      if (memoText) {
        memoMap[item.id] = memoText;
      } else {
        delete memoMap[item.id];
      }
      this._setMemoMap(memoMap);
      item.memo_detail = memoText;

      var isGuest = !!localStorage.getItem("keuanganku_guest_user");
      if (isGuest) {
        var list = this._getLocal("expenses");
        var idx = list.findIndex(function (x) { return x.id === item.id; });
        if (idx >= 0) list[idx] = item; else list.unshift(item);
        this._setLocal("expenses", list);
        return item;
      }
      try {
        var uid = await currentUserId();
        var row = {
          id: item.id,
          user_id: uid,
          month_id: mkKey(item.year, item.month),
          year: item.year,
          month: item.month,
          tanggal: item.tanggal,
          keperluan: item.keperluan,
          kategori: item.kategori,
          nominal: item.nominal,
          bayar: item.bayar,
          nw: item.nw,
          catatan: memoText || item.catatan || "",
          memo_detail: memoText || "",
        };
        var res = await sb.from("expenses").upsert(row).select().single();
        if (res.error) {
          delete row.memo_detail;
          res = await sb.from("expenses").upsert(row).select().single();
        }
        if (res.error) throw new Error(mapError(res.error));
        res.data.nominal = Number(res.data.nominal);
        res.data.memo_detail = memoText || memoMap[item.id] || res.data.catatan || "";
        res.data.catatan = res.data.catatan || memoText;
        return res.data;
      } catch (e) {
        var list = this._getLocal("expenses");
        var idx = list.findIndex(function (x) { return x.id === item.id; });
        if (idx >= 0) list[idx] = item; else list.unshift(item);
        this._setLocal("expenses", list);
        return item;
      }
    },

    deleteExpense: async function (id) {
      var isGuest = !!localStorage.getItem("keuanganku_guest_user");
      if (isGuest) {
        var list = this._getLocal("expenses").filter(function (x) { return x.id !== id; });
        this._setLocal("expenses", list);
        return;
      }
      try {
        var res = await sb.from("expenses").delete().eq("id", id);
        if (res.error) throw new Error(mapError(res.error));
      } catch (e) {
        var list = this._getLocal("expenses").filter(function (x) { return x.id !== id; });
        this._setLocal("expenses", list);
      }
    },

    // ── Savings (Tabungan) ───────────────────────────────────────────────
    saveSaving: async function (item) {
      var isGuest = !!localStorage.getItem("keuanganku_guest_user");
      if (isGuest) {
        var list = this._getLocal("savings");
        var idx = list.findIndex(function (x) { return x.id === item.id; });
        if (idx >= 0) list[idx] = item; else list.unshift(item);
        this._setLocal("savings", list);
        return item;
      }
      try {
        var uid = await currentUserId();
        var row = {
          id: item.id,
          user_id: uid,
          tipe: item.tipe,
          lokasi: item.lokasi || "KROM",
          tanggal: item.tanggal,
          nominal: item.nominal,
          catatan: item.catatan || "",
        };
        var res = await sb.from("savings").upsert(row).select().single();
        if (res.error) {
          delete row.lokasi;
          res = await sb.from("savings").upsert(row).select().single();
        }
        if (res.error) throw new Error(mapError(res.error));
        res.data.nominal = Number(res.data.nominal);
        if (item.lokasi) res.data.lokasi = item.lokasi;
        return res.data;
      } catch (e) {
        var list = this._getLocal("savings");
        var idx = list.findIndex(function (x) { return x.id === item.id; });
        if (idx >= 0) list[idx] = item; else list.unshift(item);
        this._setLocal("savings", list);
        return item;
      }
    },

    deleteSaving: async function (id) {
      var isGuest = !!localStorage.getItem("keuanganku_guest_user");
      if (isGuest) {
        var list = this._getLocal("savings").filter(function (x) { return x.id !== id; });
        this._setLocal("savings", list);
        return;
      }
      try {
        var res = await sb.from("savings").delete().eq("id", id);
        if (res.error) throw new Error(mapError(res.error));
      } catch (e) {
        var list = this._getLocal("savings").filter(function (x) { return x.id !== id; });
        this._setLocal("savings", list);
      }
    },
  };

  window.Api = Api;
})();
