// api.js — Supabase-backed data layer for Keuangan Ku.
// Exposes a single global `Api` object that the app (app.js) calls into.
// All authentication and per-user data isolation is handled by Supabase
// (Auth + Row Level Security) — this file is just a thin, well-typed wrapper
// around the Supabase JS client so app.js doesn't need to know anything
// about Supabase's specific API shapes.

(function () {
  function getConfig() {
    return window.__SUPABASE_CONFIG__ || {};
  }

  var cfg = getConfig();

  if (!cfg.url || !cfg.anonKey) {
    console.error(
      "[Keuangan Ku] Supabase belum dikonfigurasi. " +
      "Pastikan environment variables SUPABASE_URL dan SUPABASE_ANON_KEY " +
      "sudah diisi di Vercel, lalu deploy ulang."
    );
  }

  var sb = window.supabase.createClient(cfg.url || "", cfg.anonKey || "", {
    auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
  });

  function mkKey(y, m) {
    return y + "-" + String(m).padStart(2, "0");
  }

  // Translate raw Supabase/Postgres error messages into friendly Indonesian text.
  function mapError(error) {
    if (!error) return "Terjadi kesalahan.";
    var msg = error.message || String(error);
    if (/already registered|already exists/i.test(msg)) return "Email sudah terdaftar. Silakan masuk.";
    if (/invalid login credentials/i.test(msg)) return "Email atau password salah.";
    if (/password should be at least/i.test(msg)) return "Password minimal 6 karakter.";
    if (/rate limit/i.test(msg)) return "Terlalu banyak percobaan. Coba lagi sebentar lagi.";
    if (/duplicate key/i.test(msg)) return "Data ini sudah ada.";
    if (/network|fetch/i.test(msg)) return "Tidak bisa terhubung ke server. Periksa koneksi internet.";
    return msg;
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
    // ── Auth ──────────────────────────────────────────────────────────────
    register: async function (email, password, name) {
      var res = await sb.auth.signUp({
        email: email,
        password: password,
        options: { data: { name: name } },
      });
      if (res.error) throw new Error(mapError(res.error));
      if (!res.data.user) throw new Error("Registrasi gagal. Coba lagi.");
      // If email confirmation is required, there is no session yet.
      if (!res.data.session) {
        throw new Error(
          "Akun dibuat! Cek email kamu untuk konfirmasi, lalu masuk kembali."
        );
      }
      return {
        user: { id: res.data.user.id, email: res.data.user.email, name: name },
      };
    },

    login: async function (email, password) {
      var res = await sb.auth.signInWithPassword({ email: email, password: password });
      if (res.error) throw new Error(mapError(res.error));
      var user = res.data.user;
      var name = (user.user_metadata && user.user_metadata.name) || user.email;
      return { user: { id: user.id, email: user.email, name: name } };
    },

    logout: async function () {
      await sb.auth.signOut();
    },

    // Returns the current logged-in user (from a persisted Supabase session)
    // or null if nobody is logged in. Used on page load to skip the login
    // screen if the browser already has a valid session.
    getSession: async function () {
      var res = await sb.auth.getSession();
      if (!res.data.session) return null;
      var user = res.data.session.user;
      var name = (user.user_metadata && user.user_metadata.name) || user.email;
      return { id: user.id, email: user.email, name: name };
    },

    // ── Bootstrap: load everything for the logged-in user in one go ────────
    fetchAll: async function () {
      var uid = await currentUserId();
      if (!uid) return { months: [], expenses: [], income: [], savings: [] };

      var results = await Promise.all([
        sb.from("months").select("*").order("id", { ascending: true }),
        sb.from("expenses").select("*").order("tanggal", { ascending: false }),
        sb.from("income").select("*").order("tanggal", { ascending: false }),
        sb.from("savings").select("*").order("tanggal", { ascending: false }),
      ]);

      var mRes = results[0], eRes = results[1], iRes = results[2], sRes = results[3];
      if (mRes.error) throw new Error(mapError(mRes.error));
      if (eRes.error) throw new Error(mapError(eRes.error));
      if (iRes.error) throw new Error(mapError(iRes.error));
      if (sRes.error) throw new Error(mapError(sRes.error));

      return {
        months: (mRes.data || []).map(function (x) {
          return { key: x.id, year: x.year, month: x.month, label: x.label };
        }),
        expenses: coerceNominal(eRes.data),
        income: coerceNominal(iRes.data),
        savings: coerceNominal(sRes.data),
      };
    },

    // ── Months ───────────────────────────────────────────────────────────
    createMonth: async function (year, month, label) {
      var uid = await currentUserId();
      var id = mkKey(year, month);
      var res = await sb
        .from("months")
        .insert({ id: id, user_id: uid, year: year, month: month, label: label })
        .select()
        .single();
      if (res.error) {
        if (/duplicate key/i.test(res.error.message || "")) {
          throw new Error("Periode ini sudah ada.");
        }
        throw new Error(mapError(res.error));
      }
      return { key: res.data.id, year: res.data.year, month: res.data.month, label: res.data.label };
    },

    deleteMonth: async function (id) {
      var res = await sb.from("months").delete().eq("id", id);
      if (res.error) throw new Error(mapError(res.error));
    },

    // ── Expenses ─────────────────────────────────────────────────────────
    saveExpense: async function (item) {
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
        catatan: item.catatan || "",
      };
      var res = await sb.from("expenses").upsert(row).select().single();
      if (res.error) throw new Error(mapError(res.error));
      res.data.nominal = Number(res.data.nominal);
      return res.data;
    },

    deleteExpense: async function (id) {
      var res = await sb.from("expenses").delete().eq("id", id);
      if (res.error) throw new Error(mapError(res.error));
    },

    // ── Income ───────────────────────────────────────────────────────────
    saveIncome: async function (item) {
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
    },

    deleteIncome: async function (id) {
      var res = await sb.from("income").delete().eq("id", id);
      if (res.error) throw new Error(mapError(res.error));
    },

    // ── Savings (Tabungan) ───────────────────────────────────────────────
    saveSaving: async function (item) {
      var uid = await currentUserId();
      var row = {
        id: item.id,
        user_id: uid,
        tipe: item.tipe,
        tanggal: item.tanggal,
        nominal: item.nominal,
        catatan: item.catatan || "",
      };
      var res = await sb.from("savings").upsert(row).select().single();
      if (res.error) throw new Error(mapError(res.error));
      res.data.nominal = Number(res.data.nominal);
      return res.data;
    },

    deleteSaving: async function (id) {
      var res = await sb.from("savings").delete().eq("id", id);
      if (res.error) throw new Error(mapError(res.error));
    },
  };

  window.Api = Api;
})();
