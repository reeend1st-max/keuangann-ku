
const { useState, useEffect, useCallback, useRef } = React;

const T = {
  bg:"#0A0E17",sidebar:"#0F1420",surface:"#131929",card:"#19223A",cardHov:"#1E2A45",panel:"#111827",
  border:"#1E2D45",borderLt:"#253650",
  teal:"#00C896",tealDim:"#00C89614",tealGlow:"#00C89650",
  coral:"#FF5E5E",coralDim:"#FF5E5E14",
  sage:"#4ADE80",sageDim:"#4ADE8014",
  amber:"#FFC53D",amberDim:"#FFC53D14",
  violet:"#A78BFA",violetDim:"#A78BFA14",
  sky:"#60CDFF",skyDim:"#60CDFF14",
  text:"#E8F0FE",textSub:"#7A90B0",textDim:"#374A65",
};

const MONTHS_ID=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const CATEGORIES={
  "Tagihan":{emoji:"📋",color:"#94A3B8"},"Makan & Minum":{emoji:"🍽️",color:"#FB923C"},
  "Fashion":{emoji:"👟",color:"#C084FC"},"Tabungan":{emoji:"🏦",color:"#60A5FA"},
  "Skincare":{emoji:"✨",color:"#F472B6"},"Transportasi":{emoji:"🚌",color:"#22D3EE"},
  "Hiburan":{emoji:"🎮",color:"#F97316"},"Darurat":{emoji:"🚨",color:"#EF4444"},
  "Kesehatan":{emoji:"💊",color:"#86EFAC"},"Pendidikan":{emoji:"📚",color:"#FDE047"},
  "Lain-lain":{emoji:"📦",color:"#94A3B8"},
};
const INCOME_SOURCES=["Gajian","Lemburan","Bonus","Freelance","Tabungan","Pegangan","Sisa Gaji","Lainnya"];
const PAY_METHODS=["Transfer","E-Wallet","Cash","QRIS","Debit","Kredit"];

// Storage/auth is now handled entirely by api.js (window.Api), which wraps
// the Supabase client. No local helper functions needed here anymore.

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt=n=>"Rp "+new Intl.NumberFormat("id-ID").format(n||0);
const fmtS=n=>{if(n>=1e6)return"Rp "+(n/1e6).toFixed(1)+"jt";if(n>=1e3)return"Rp "+(n/1e3).toFixed(0)+"rb";return fmt(n);};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const todayStr=()=>{var d=new Date();return String(d.getDate()).padStart(2,"0")+"/"+String(d.getMonth()+1).padStart(2,"0")+"/"+d.getFullYear();};
const mkKey=(y,m)=>y+"-"+String(m).padStart(2,"0");
const getCat=cat=>CATEGORIES[cat]||{emoji:"📌",color:T.textSub};
const parseD=str=>{if(!str)return new Date(0);var p=str.split("/");return new Date(p[2]+"-"+p[1]+"-"+p[0]);};
function mlabel(y,m){return MONTHS_ID[m]+" "+y;}

// ── Toast ─────────────────────────────────────────────────────────────────────
function useToast(){
  var _s=useState(null),t=_s[0],sT=_s[1];
  var show=useCallback(function(msg,type){
    if(!type)type="success";
    sT({msg:msg,type:type,id:Date.now()});
    setTimeout(function(){sT(null);},2800);
  },[]);
  return{toast:t,show:show};
}
function Toast(p){
  if(!p.toast)return null;
  var bg=p.toast.type==="error"?T.coral:p.toast.type==="info"?T.amber:T.teal;
  return React.createElement("div",{style:{position:"fixed",top:24,right:24,zIndex:9999,background:bg,color:"#000",padding:"12px 20px",borderRadius:12,fontSize:13,fontWeight:700,boxShadow:"0 8px 32px "+bg+"60",display:"flex",alignItems:"center",gap:8}},
    p.toast.type==="error"?"✕":p.toast.type==="info"?"!":"✓"," ",p.toast.msg);
}

// ── Micro UI ──────────────────────────────────────────────────────────────────
function Chip(p){
  var color=p.color||T.teal;
  return React.createElement("span",{style:{background:color+"22",color:color,border:"1px solid "+color+"40",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}},p.label);
}
function Btn(p){
  var _h=useState(false),hov=_h[0],sH=_h[1];
  var color=p.color||T.teal;
  var bg=p.disabled?T.border:p.outline?(hov?color+"18":"transparent"):(hov?color+"dd":color);
  var tc=p.disabled?T.textDim:p.outline?color:"#000";
  return React.createElement("button",{onClick:p.onClick,disabled:p.disabled,onMouseEnter:function(){sH(true);},onMouseLeave:function(){sH(false);},
    style:Object.assign({padding:"9px 20px",borderRadius:9,fontWeight:700,fontSize:13,border:p.outline?"1.5px solid "+color+"55":"none",background:bg,color:tc,cursor:p.disabled?"not-allowed":"pointer",transition:"all .12s",display:"flex",alignItems:"center",gap:6},p.style||{})},
    p.children);
}
function StatCard(p){
  return React.createElement("div",{style:{background:T.card,borderRadius:16,padding:"20px 24px",border:"1px solid "+T.border,flex:1,minWidth:0}},
    React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}},
      React.createElement("div",null,
        React.createElement("div",{style:{fontSize:12,color:T.textSub,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}},p.label),
        React.createElement("div",{style:{fontSize:26,fontWeight:900,color:p.color,letterSpacing:-0.5}},p.value),
        p.sub&&React.createElement("div",{style:{fontSize:12,color:T.textSub,marginTop:6}},p.sub)
      ),
      React.createElement("div",{style:{fontSize:28,opacity:0.6}},p.icon)
    )
  );
}
function DInput(p){
  var _f=useState(false),f=_f[0],sF=_f[1];
  var ref=useRef();
  useEffect(function(){if(p.autoFocus&&ref.current)setTimeout(function(){ref.current&&ref.current.focus();},80);},[p.autoFocus]);
  return React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:5}},
    p.label&&React.createElement("label",{style:{fontSize:11,fontWeight:700,color:T.textSub,textTransform:"uppercase",letterSpacing:0.7}},p.label),
    React.createElement("input",{ref:ref,type:p.type||"text",value:p.value,onChange:function(e){p.onChange(e.target.value);},placeholder:p.placeholder,
      onFocus:function(){sF(true);},onBlur:function(){sF(false);},onKeyDown:p.onKeyDown,
      style:{background:T.panel,border:"1.5px solid "+(f?T.teal:T.border),borderRadius:8,padding:"9px 12px",color:T.text,fontSize:14,outline:"none",fontFamily:"inherit",transition:"border-color .15s",boxSizing:"border-box",width:"100%"}})
  );
}
function DSelect(p){
  var _f=useState(false),f=_f[0],sF=_f[1];
  return React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:5}},
    p.label&&React.createElement("label",{style:{fontSize:11,fontWeight:700,color:T.textSub,textTransform:"uppercase",letterSpacing:0.7}},p.label),
    React.createElement("select",{value:p.value,onChange:function(e){p.onChange(e.target.value);},onFocus:function(){sF(true);},onBlur:function(){sF(false);},
      style:{background:T.panel,border:"1.5px solid "+(f?T.teal:T.border),borderRadius:8,padding:"9px 36px 9px 12px",color:T.text,fontSize:14,outline:"none",fontFamily:"inherit",cursor:"pointer",appearance:"none",backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237A90B0' strokeWidth='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",backgroundRepeat:"no-repeat",backgroundPosition:"right 12px center",boxSizing:"border-box",width:"100%"}},
      p.options.map(function(o){var v=typeof o==="object"?o.value:o;var l=typeof o==="object"?o.label:o;return React.createElement("option",{key:v,value:v},l);}))
  );
}
function DToggle(p){
  return React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:5}},
    p.label&&React.createElement("label",{style:{fontSize:11,fontWeight:700,color:T.textSub,textTransform:"uppercase",letterSpacing:0.7}},p.label),
    React.createElement("div",{style:{display:"flex",gap:6,background:T.panel,borderRadius:8,border:"1.5px solid "+T.border,padding:4}},
      p.options.map(function(opt,i){
        var active=p.value===opt;var col=(p.colors&&p.colors[i])||T.teal;
        return React.createElement("button",{key:opt,onClick:function(){p.onChange(opt);},style:{flex:1,padding:"7px 0",borderRadius:6,fontWeight:700,fontSize:13,border:"none",background:active?col+"28":"transparent",color:active?col:T.textSub,cursor:"pointer",transition:"all .12s"}},opt);
      })
    )
  );
}
function Modal(p){
  useEffect(function(){
    function h(e){if(e.key==="Escape")p.onClose();}
    if(p.open)window.addEventListener("keydown",h);
    return function(){window.removeEventListener("keydown",h);};
  },[p.open,p.onClose]);
  if(!p.open)return null;
  return React.createElement("div",{onClick:p.onClose,style:{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.72)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)"}},
    React.createElement("div",{onClick:function(e){e.stopPropagation();},style:{width:p.width||520,maxWidth:"90vw",maxHeight:"90vh",overflowY:"auto",background:T.surface,borderRadius:18,boxShadow:"0 24px 80px rgba(0,0,0,0.7)",border:"1px solid "+T.borderLt}},
      React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px 16px",borderBottom:"1px solid "+T.border}},
        React.createElement("div",{style:{fontSize:17,fontWeight:800,color:T.text}},p.title),
        React.createElement("button",{onClick:p.onClose,style:{background:T.card,border:"1px solid "+T.border,color:T.textSub,width:30,height:30,borderRadius:8,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}},"✕")
      ),
      React.createElement("div",{style:{padding:"20px 24px 24px"}},p.children)
    )
  );
}
function ConfirmModal(p){
  if(!p.open)return null;
  return React.createElement(Modal,{open:p.open,onClose:p.onCancel,title:"⚠️ Konfirmasi",width:400},
    React.createElement("p",{style:{color:T.textSub,fontSize:14,lineHeight:1.7,marginBottom:20}},p.message),
    React.createElement("div",{style:{display:"flex",gap:10,justifyContent:"flex-end"}},
      React.createElement(Btn,{outline:true,color:T.textSub,onClick:p.onCancel},"Batal"),
      React.createElement(Btn,{color:T.coral,onClick:p.onConfirm},"Hapus")
    )
  );
}

// ── Auth Screen ───────────────────────────────────────────────────────────────
function AuthScreen(p){
  var _m=useState("login"),mode=_m[0],setMode=_m[1];
  var _e=useState(""),email=_e[0],setEmail=_e[1];
  var _pw=useState(""),pw=_pw[0],setPw=_pw[1];
  var _n=useState(""),name=_n[0],setName=_n[1];
  var _l=useState(false),loading=_l[0],setLoading=_l[1];
  var _er=useState(""),err=_er[0],setErr=_er[1];

  async function submit(){
    setErr("");
    if(!email.trim()||!pw){setErr("Email dan password wajib diisi.");return;}
    if(mode==="register"&&!name.trim()){setErr("Nama wajib diisi.");return;}
    if(pw.length<6){setErr("Password minimal 6 karakter.");return;}
    setLoading(true);
    var clean=email.trim().toLowerCase();
    try{
      var result = mode==="register"
        ? await window.Api.register(clean, pw, name.trim())
        : await window.Api.login(clean, pw);
      p.onAuth(result.user);
    }catch(e){
      setErr(e.message || "Terjadi kesalahan. Coba lagi.");
    }
    setLoading(false);
  }

  var inp={width:"100%",background:T.panel,border:"1.5px solid "+T.border,borderRadius:10,padding:"11px 14px",color:T.text,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"};
  return React.createElement("div",{style:{background:T.bg,width:"100vw",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}},
    React.createElement("div",{style:{width:400,maxWidth:"90vw",background:T.surface,borderRadius:20,padding:"36px 32px",border:"1px solid "+T.borderLt,boxShadow:"0 24px 80px rgba(0,0,0,0.5)"}},
      React.createElement("div",{style:{textAlign:"center",marginBottom:28}},
        React.createElement("div",{style:{fontSize:44,marginBottom:8}},"💰"),
        React.createElement("div",{style:{fontSize:22,fontWeight:900,color:T.teal,letterSpacing:-0.5}},"Keuangan Ku"),
        React.createElement("div",{style:{fontSize:13,color:T.textSub,marginTop:4}},"Personal Finance Tracker")
      ),
      React.createElement("div",{style:{display:"flex",background:T.panel,borderRadius:10,padding:4,marginBottom:24,border:"1.5px solid "+T.border}},
        ["login","register"].map(function(m){return React.createElement("button",{key:m,onClick:function(){setMode(m);setErr("");},style:{flex:1,padding:"9px 0",borderRadius:7,border:"none",background:mode===m?T.tealDim:"transparent",color:mode===m?T.teal:T.textSub,fontWeight:700,fontSize:13,cursor:"pointer"}},m==="login"?"Masuk":"Daftar");})
      ),
      mode==="register"&&React.createElement("div",{style:{marginBottom:14}},
        React.createElement("label",{style:{display:"block",fontSize:11,color:T.textSub,fontWeight:700,textTransform:"uppercase",letterSpacing:0.7,marginBottom:6}},"Nama"),
        React.createElement("input",{value:name,onChange:function(e){setName(e.target.value);},placeholder:"Nama lengkap",style:inp})
      ),
      React.createElement("div",{style:{marginBottom:14}},
        React.createElement("label",{style:{display:"block",fontSize:11,color:T.textSub,fontWeight:700,textTransform:"uppercase",letterSpacing:0.7,marginBottom:6}},"Email"),
        React.createElement("input",{type:"email",value:email,onChange:function(e){setEmail(e.target.value);},placeholder:"kamu@email.com",style:inp,onKeyDown:function(e){if(e.key==="Enter")submit();}})
      ),
      React.createElement("div",{style:{marginBottom:20}},
        React.createElement("label",{style:{display:"block",fontSize:11,color:T.textSub,fontWeight:700,textTransform:"uppercase",letterSpacing:0.7,marginBottom:6}},"Password"),
        React.createElement("input",{type:"password",value:pw,onChange:function(e){setPw(e.target.value);},placeholder:mode==="register"?"Minimal 6 karakter":"Password kamu",style:inp,onKeyDown:function(e){if(e.key==="Enter")submit();}})
      ),
      err&&React.createElement("div",{style:{background:T.coralDim,border:"1px solid "+T.coral+"33",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:13,color:T.coral,fontWeight:600}},"⚠️ ",err),
      React.createElement("button",{onClick:submit,disabled:loading,style:{width:"100%",padding:14,borderRadius:12,border:"none",background:loading?T.border:"linear-gradient(135deg,"+T.teal+",#007AFF)",color:loading?T.textDim:"#000",fontSize:15,fontWeight:800,cursor:loading?"not-allowed":"pointer"}},loading?"Memproses...":mode==="login"?"Masuk →":"Buat Akun →"),
      React.createElement("div",{style:{textAlign:"center",marginTop:18,fontSize:12,color:T.textDim}},
        mode==="login"?"Belum punya akun? ":"Sudah punya akun? ",
        React.createElement("button",{onClick:function(){setMode(mode==="login"?"register":"login");setErr("");},style:{background:"none",border:"none",color:T.teal,fontWeight:700,cursor:"pointer",fontSize:12}},mode==="login"?"Daftar di sini":"Masuk di sini")
      )
    )
  );
}

// ── Transaction Rows ──────────────────────────────────────────────────────────
function ExpenseRow(p){
  var cfg=getCat(p.item.kategori);
  return React.createElement("div",{style:{background:T.card,borderRadius:14,padding:"12px 14px",marginBottom:8,border:"1px solid "+T.border,display:"flex",alignItems:"center",gap:12}},
    React.createElement("div",{style:{width:42,height:42,borderRadius:12,background:cfg.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}},cfg.emoji),
    React.createElement("div",{style:{flex:1,minWidth:0}},
      React.createElement("div",{style:{fontSize:14,fontWeight:600,color:T.text,marginBottom:3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}},p.item.keperluan),
      React.createElement("div",{style:{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap",rowGap:3}},
        React.createElement("span",{style:{fontSize:11,color:T.textSub}},p.item.tanggal),
        React.createElement(Chip,{label:p.item.kategori,color:cfg.color}),
        React.createElement(Chip,{label:p.item.nw,color:p.item.nw==="Need"?T.sky:T.violet}),
        React.createElement(Chip,{label:p.item.bayar,color:T.textSub})
      )
    ),
    React.createElement("div",{style:{fontSize:15,fontWeight:800,color:T.coral,flexShrink:0}},"-",fmt(p.item.nominal)),
    React.createElement("div",{style:{display:"flex",gap:4,flexShrink:0}},
      React.createElement("button",{onClick:function(){p.onEdit(p.item);},style:{background:T.card,border:"1px solid "+T.border,color:T.textSub,width:28,height:28,borderRadius:6,cursor:"pointer",fontSize:12}},"✏"),
      React.createElement("button",{onClick:function(){p.onDelete(p.item.id);},style:{background:T.coralDim,border:"1px solid "+T.coral+"30",color:T.coral,width:28,height:28,borderRadius:6,cursor:"pointer",fontSize:12}},"✕")
    )
  );
}
function IncomeRow(p){
  var mc={Transfer:T.teal,"E-Wallet":T.violet,Cash:T.amber,QRIS:T.sky,Debit:T.sage,Kredit:T.coral};
  return React.createElement("div",{style:{background:T.card,borderRadius:14,padding:"12px 14px",marginBottom:8,border:"1px solid "+T.border,display:"flex",alignItems:"center",gap:12}},
    React.createElement("div",{style:{width:42,height:42,borderRadius:12,background:T.sageDim,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}},"💵"),
    React.createElement("div",{style:{flex:1,minWidth:0}},
      React.createElement("div",{style:{fontSize:14,fontWeight:600,color:T.text,marginBottom:3}},p.item.sumber),
      React.createElement("div",{style:{display:"flex",gap:5,alignItems:"center"}},
        React.createElement("span",{style:{fontSize:11,color:T.textSub}},p.item.tanggal),
        React.createElement(Chip,{label:p.item.metode,color:mc[p.item.metode]||T.textSub})
      )
    ),
    React.createElement("div",{style:{fontSize:15,fontWeight:800,color:T.sage,flexShrink:0}},"+",fmt(p.item.nominal)),
    React.createElement("div",{style:{display:"flex",gap:4,flexShrink:0}},
      React.createElement("button",{onClick:function(){p.onEdit(p.item);},style:{background:T.card,border:"1px solid "+T.border,color:T.textSub,width:28,height:28,borderRadius:6,cursor:"pointer",fontSize:12}},"✏"),
      React.createElement("button",{onClick:function(){p.onDelete(p.item.id);},style:{background:T.coralDim,border:"1px solid "+T.coral+"30",color:T.coral,width:28,height:28,borderRadius:6,cursor:"pointer",fontSize:12}},"✕")
    )
  );
}

// ── Forms ─────────────────────────────────────────────────────────────────────
function ExpenseForm(p){
  var aY=p.activeYear,aMI=p.activeMonth;
  function initDate(){var d=new Date(aY,aMI,new Date().getDate());return String(d.getDate()).padStart(2,"0")+"/"+String(d.getMonth()+1).padStart(2,"0")+"/"+d.getFullYear();}
  var _f=useState({tanggal:"",keperluan:"",kategori:"Lain-lain",nominal:"",bayar:"Transfer",nw:"Need",catatan:""}),f=_f[0],sF=_f[1];
  var _e=useState(""),err=_e[0],sE=_e[1];
  useEffect(function(){
    if(!p.open)return;
    if(p.initial)sF({tanggal:p.initial.tanggal,keperluan:p.initial.keperluan,kategori:p.initial.kategori,nominal:String(p.initial.nominal),bayar:p.initial.bayar,nw:p.initial.nw,catatan:p.initial.catatan||""});
    else sF({tanggal:initDate(),keperluan:"",kategori:"Lain-lain",nominal:"",bayar:"Transfer",nw:"Need",catatan:""});
    sE("");
  },[p.open,p.initial]);
  function set(k,v){sF(function(prev){var n=Object.assign({},prev);n[k]=v;return n;});}
  function save(){
    if(!f.keperluan.trim())return sE("Keperluan wajib diisi.");
    var nom=parseInt(f.nominal.replace(/\D/g,""));
    if(!nom||nom<=0)return sE("Nominal harus lebih dari 0.");
    p.onSave({id:p.initial?p.initial.id:uid(),year:aY,month:aMI,tanggal:f.tanggal,keperluan:f.keperluan.trim(),kategori:f.kategori,nominal:nom,bayar:f.bayar,nw:f.nw,catatan:f.catatan});
    p.showToast(p.initial?"Transaksi diperbarui":"Pengeluaran ditambahkan");
    p.onClose();
  }
  return React.createElement(Modal,{open:p.open,onClose:p.onClose,title:p.initial?"✏️ Edit Pengeluaran":"➕ Tambah Pengeluaran",width:560},
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}},
      React.createElement(DInput,{label:"Tanggal",value:f.tanggal,onChange:function(v){set("tanggal",v);},placeholder:"DD/MM/YYYY",autoFocus:true}),
      React.createElement(DSelect,{label:"Kategori",value:f.kategori,onChange:function(v){set("kategori",v);},options:Object.keys(CATEGORIES).map(function(k){return{value:k,label:CATEGORIES[k].emoji+" "+k};})}),
      React.createElement("div",{style:{gridColumn:"1/-1"}},React.createElement(DInput,{label:"Keperluan",value:f.keperluan,onChange:function(v){set("keperluan",v);},placeholder:"Misal: Transfer Mamah, Makan Siang..."})),
      React.createElement(DInput,{label:"Nominal (Rp)",value:f.nominal,onChange:function(v){set("nominal",v.replace(/\D/g,""));},type:"number",placeholder:"0"}),
      React.createElement(DSelect,{label:"Bayar Pakai",value:f.bayar,onChange:function(v){set("bayar",v);},options:PAY_METHODS}),
      React.createElement("div",{style:{gridColumn:"1/-1"}},React.createElement(DToggle,{label:"Need / Want",value:f.nw,onChange:function(v){set("nw",v);},options:["Need","Want"],colors:[T.sky,T.violet]})),
      React.createElement("div",{style:{gridColumn:"1/-1"}},React.createElement(DInput,{label:"Catatan (opsional)",value:f.catatan,onChange:function(v){set("catatan",v);},placeholder:"Keterangan tambahan..."}))
    ),
    err&&React.createElement("div",{style:{color:T.coral,fontSize:12,marginTop:12,fontWeight:600}},"⚠️ ",err),
    React.createElement("div",{style:{display:"flex",justifyContent:"flex-end",gap:10,marginTop:20,paddingTop:16,borderTop:"1px solid "+T.border}},
      React.createElement(Btn,{outline:true,color:T.textSub,onClick:p.onClose},"Batal"),
      React.createElement(Btn,{color:T.teal,onClick:save},"💾 ",p.initial?"Simpan Perubahan":"Tambah Pengeluaran")
    )
  );
}
function IncomeForm(p){
  var aY=p.activeYear,aMI=p.activeMonth;
  function initDate(){var d=new Date(aY,aMI,new Date().getDate());return String(d.getDate()).padStart(2,"0")+"/"+String(d.getMonth()+1).padStart(2,"0")+"/"+d.getFullYear();}
  var _f=useState({tanggal:"",sumber:"Gajian",nominal:"",metode:"Transfer",catatan:""}),f=_f[0],sF=_f[1];
  var _e=useState(""),err=_e[0],sE=_e[1];
  useEffect(function(){
    if(!p.open)return;
    if(p.initial)sF({tanggal:p.initial.tanggal,sumber:p.initial.sumber,nominal:String(p.initial.nominal),metode:p.initial.metode,catatan:p.initial.catatan||""});
    else sF({tanggal:initDate(),sumber:"Gajian",nominal:"",metode:"Transfer",catatan:""});
    sE("");
  },[p.open,p.initial]);
  function set(k,v){sF(function(prev){var n=Object.assign({},prev);n[k]=v;return n;});}
  function save(){
    var nom=parseInt(f.nominal.replace(/\D/g,""));
    if(!nom||nom<=0)return sE("Nominal harus lebih dari 0.");
    p.onSave({id:p.initial?p.initial.id:uid(),year:aY,month:aMI,tanggal:f.tanggal,sumber:f.sumber,nominal:nom,metode:f.metode,catatan:f.catatan});
    p.showToast(p.initial?"Pemasukan diperbarui":"Pemasukan ditambahkan");
    p.onClose();
  }
  return React.createElement(Modal,{open:p.open,onClose:p.onClose,title:p.initial?"✏️ Edit Pemasukan":"💵 Tambah Pemasukan",width:520},
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}},
      React.createElement(DInput,{label:"Tanggal",value:f.tanggal,onChange:function(v){set("tanggal",v);},placeholder:"DD/MM/YYYY",autoFocus:true}),
      React.createElement(DSelect,{label:"Sumber",value:f.sumber,onChange:function(v){set("sumber",v);},options:INCOME_SOURCES}),
      React.createElement(DInput,{label:"Nominal (Rp)",value:f.nominal,onChange:function(v){set("nominal",v.replace(/\D/g,""));},type:"number",placeholder:"0"}),
      React.createElement(DSelect,{label:"Metode",value:f.metode,onChange:function(v){set("metode",v);},options:PAY_METHODS}),
      React.createElement("div",{style:{gridColumn:"1/-1"}},React.createElement(DInput,{label:"Catatan (opsional)",value:f.catatan,onChange:function(v){set("catatan",v);},placeholder:"Keterangan tambahan..."}))
    ),
    err&&React.createElement("div",{style:{color:T.coral,fontSize:12,marginTop:12,fontWeight:600}},"⚠️ ",err),
    React.createElement("div",{style:{display:"flex",justifyContent:"flex-end",gap:10,marginTop:20,paddingTop:16,borderTop:"1px solid "+T.border}},
      React.createElement(Btn,{outline:true,color:T.textSub,onClick:p.onClose},"Batal"),
      React.createElement(Btn,{color:T.sage,onClick:save},"💾 ",p.initial?"Simpan Perubahan":"Tambah Pemasukan")
    )
  );
}
function AddMonthModal(p){
  var now=new Date();
  var _y=useState(now.getFullYear()),year=_y[0],sY=_y[1];
  var _m=useState(now.getMonth()),month=_m[0],sM=_m[1];
  var _e=useState(""),err=_e[0],sE=_e[1];
  useEffect(function(){if(p.open)sE("");},[p.open]);
  var key=mkKey(year,month);
  var exists=p.existingKeys.indexOf(key)>=0;
  var years=[];for(var y=now.getFullYear()-2;y<=now.getFullYear()+5;y++)years.push(y);
  function add(){
    if(exists)return sE("Bulan ini sudah ada!");
    p.onAdd({year:year,month:month,key:key,label:mlabel(year,month)});
    p.showToast("Periode "+mlabel(year,month)+" dibuat");
    p.onClose();
  }
  return React.createElement(Modal,{open:p.open,onClose:p.onClose,title:"📅 Buat Periode Baru",width:420},
    React.createElement("p",{style:{color:T.textSub,fontSize:13,lineHeight:1.7,marginBottom:20}},"Buat periode bulan baru untuk mulai mencatat keuangan."),
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}},
      React.createElement(DSelect,{label:"Tahun",value:year,onChange:function(v){sY(Number(v));},options:years.map(function(y){return{value:y,label:String(y)};})}),
      React.createElement(DSelect,{label:"Bulan",value:month,onChange:function(v){sM(Number(v));},options:MONTHS_ID.map(function(m,i){return{value:i,label:m};})})
    ),
    React.createElement("div",{style:{background:T.tealDim,border:"1px solid "+T.teal+"30",borderRadius:10,padding:"12px 16px",marginBottom:16,fontSize:14,color:T.teal,fontWeight:600}},"📌 Akan membuat: ",React.createElement("strong",null,mlabel(year,month))),
    (err||exists)&&React.createElement("div",{style:{color:T.coral,fontSize:12,marginBottom:12,fontWeight:600}},"⚠️ ",err||(mlabel(year,month)+" sudah ada!")),
    React.createElement("div",{style:{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:16,borderTop:"1px solid "+T.border}},
      React.createElement(Btn,{outline:true,color:T.textSub,onClick:p.onClose},"Batal"),
      React.createElement(Btn,{color:T.teal,onClick:add,disabled:exists},"+ Buat Periode")
    )
  );
}

// ── Savings Form ──────────────────────────────────────────────────────────────
function SavingForm(p){
  var _t=useState("setoran"),tipe=_t[0],setTipe=_t[1];
  var _tg=useState(todayStr()),tanggal=_tg[0],setTanggal=_tg[1];
  var _n=useState(""),nominal=_n[0],setNominal=_n[1];
  var _c=useState(""),catatan=_c[0],setCatatan=_c[1];
  var _e=useState(""),err=_e[0],setErr=_e[1];
  useEffect(function(){
    if(!p.open)return;
    if(p.initial){setTipe(p.initial.tipe);setTanggal(p.initial.tanggal);setNominal(String(p.initial.nominal));setCatatan(p.initial.catatan||"");}
    else{setTipe("setoran");setTanggal(todayStr());setNominal("");setCatatan("");}
    setErr("");
  },[p.open,p.initial]);
  function save(){
    var nom=parseInt(nominal.replace(/\D/g,""));
    if(!nom||nom<=0)return setErr("Nominal harus lebih dari 0.");
    if(!tanggal)return setErr("Tanggal wajib diisi.");
    var item={id:p.initial?p.initial.id:uid(),tipe:tipe,tanggal:tanggal,nominal:nom,catatan:catatan};
    p.onSave(item);
    p.onClose();
  }
  var isStor=tipe==="setoran";
  return React.createElement(Modal,{open:p.open,onClose:p.onClose,title:p.initial?"✏️ Edit Transaksi Tabungan":"🏦 Transaksi Tabungan Baru",width:480},
    React.createElement("p",{style:{fontSize:13,color:T.textSub,lineHeight:1.6,marginBottom:14}},
      isStor?"Setoran: uang keluar dari saldo utama dan menambah saldo tabungan.":"Penarikan: hanya mengurangi saldo tabungan, tidak masuk pemasukan utama."
    ),
    React.createElement("div",{style:{marginBottom:14}},
      React.createElement(DToggle,{label:"Jenis Transaksi",value:tipe,onChange:setTipe,options:["setoran","penarikan"],colors:[T.sage,T.amber]})
    ),
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}},
      React.createElement(DInput,{label:"Tanggal (DD/MM/YYYY)",value:tanggal,onChange:setTanggal,placeholder:"01/07/2026",autoFocus:true}),
      React.createElement(DInput,{label:"Nominal (Rp)",value:nominal,onChange:function(v){setNominal(v.replace(/\D/g,""));},type:"number",placeholder:"0"})
    ),
    React.createElement(DInput,{label:"Catatan (opsional)",value:catatan,onChange:setCatatan,placeholder:"Misal: Dana darurat, Tabungan liburan..."}),
    err&&React.createElement("div",{style:{color:T.coral,fontSize:12,marginTop:10,fontWeight:600}},"⚠️ ",err),
    React.createElement("div",{style:{display:"flex",justifyContent:"flex-end",gap:10,marginTop:20,paddingTop:16,borderTop:"1px solid "+T.border}},
      React.createElement(Btn,{outline:true,color:T.textSub,onClick:p.onClose},"Batal"),
      React.createElement(Btn,{color:isStor?T.teal:T.amber,onClick:save},"💾 ",p.initial?"Simpan Perubahan":isStor?"Catat Setoran":"Catat Penarikan")
    )
  );
}

// ── Empty states ──────────────────────────────────────────────────────────────
function EmptyMonthMsg(){
  return React.createElement("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",color:T.textSub,gap:12}},
    React.createElement("div",{style:{fontSize:56}},"📅"),
    React.createElement("div",{style:{fontSize:18,fontWeight:700,color:T.text}},"Belum ada periode aktif"),
    React.createElement("div",{style:{fontSize:14,maxWidth:320,textAlign:"center",lineHeight:1.7}},"Klik ",React.createElement("strong",{style:{color:T.teal}},"+ Periode Baru")," di sidebar untuk mulai mencatat.")
  );
}

// ── Carry-over saldo helper ───────────────────────────────────────────────────
// Returns array of {key, label, inc, exp, saldoAwal, saldoAkhir} sorted oldest→newest
function computeCarryOver(allMonths, expenses, income){
  var sorted=[].concat(allMonths).sort(function(a,b){return a.key.localeCompare(b.key);});
  var carry=0;
  return sorted.map(function(m){
    var inc=income.filter(function(i){return mkKey(i.year,i.month)===m.key;}).reduce(function(s,i){return s+i.nominal;},0);
    var exp=expenses.filter(function(e){return mkKey(e.year,e.month)===m.key;}).reduce(function(s,e){return s+e.nominal;},0);
    var saldoAwal=carry;
    var saldoAkhir=saldoAwal+inc-exp;
    carry=saldoAkhir;
    return Object.assign({},m,{inc:inc,exp:exp,saldoAwal:saldoAwal,saldoAkhir:saldoAkhir,sal:inc-exp});
  });
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function DashboardView(p){
  var m=p.allMonths.find(function(x){return x.key===p.activeKey;});
  if(!m)return React.createElement(EmptyMonthMsg,null);
  var mExp=p.expenses.filter(function(e){return mkKey(e.year,e.month)===p.activeKey;});
  var mInc=p.income.filter(function(i){return mkKey(i.year,i.month)===p.activeKey;});
  var tInc=mInc.reduce(function(s,i){return s+i.nominal;},0);
  var tExp=mExp.reduce(function(s,e){return s+e.nominal;},0);
  var carryData=computeCarryOver(p.allMonths,p.expenses,p.income);
  var activeCarry=carryData.find(function(x){return x.key===p.activeKey;})||{saldoAwal:0,saldoAkhir:tInc-tExp};
  var saldo=activeCarry.saldoAkhir;
  var saldoAwal=activeCarry.saldoAwal;
  var pct=(saldoAwal+tInc)>0?Math.min(100,(tExp/(saldoAwal+tInc))*100):tExp>0?100:0;
  var totalSetoran=p.savings.filter(function(s){return s.tipe==="setoran";}).reduce(function(a,s){return a+s.nominal;},0);
  var totalPenarikan=p.savings.filter(function(s){return s.tipe==="penarikan";}).reduce(function(a,s){return a+s.nominal;},0);
  var saldoTab=totalSetoran-totalPenarikan;
  var pctTab=totalSetoran>0?Math.min(100,(totalPenarikan/totalSetoran)*100):0;
  var catMap=mExp.reduce(function(a,e){a[e.kategori]=(a[e.kategori]||0)+e.nominal;return a;},{});
  var catArr=Object.entries(catMap).sort(function(a,b){return b[1]-a[1];});
  var need=mExp.filter(function(e){return e.nw==="Need";}).reduce(function(s,e){return s+e.nominal;},0);
  var want=mExp.filter(function(e){return e.nw==="Want";}).reduce(function(s,e){return s+e.nominal;},0);
  var recent=[].concat(mExp).sort(function(a,b){return parseD(b.tanggal)-parseD(a.tanggal);}).slice(0,6);
  function Card(cp){
    return React.createElement("div",{style:{background:T.card,borderRadius:16,border:"1px solid "+T.border,overflow:"hidden",display:"flex",flexDirection:"column"}},
      React.createElement("div",{style:{padding:"14px 18px",borderBottom:"1px solid "+T.border,display:"flex",alignItems:"center",gap:8}},
        React.createElement("span",{style:{fontSize:18}},cp.icon),
        React.createElement("span",{style:{fontSize:14,fontWeight:700,color:T.text}},cp.title),
        cp.badge&&React.createElement("span",{style:{marginLeft:"auto",fontSize:11,fontWeight:700,color:cp.badgeColor||T.textSub}},cp.badge)
      ),
      React.createElement("div",{style:{padding:"16px 18px",flex:1}},cp.children)
    );
  }
  return React.createElement("div",{style:{padding:"22px 26px",overflowY:"auto",height:"100%"}},
    React.createElement("div",{style:{background:"linear-gradient(135deg,#0B1F3A,#061020)",borderRadius:18,padding:"20px 26px",border:"1px solid #1a3a6a",marginBottom:18,position:"relative",overflow:"hidden"}},
      React.createElement("div",{style:{position:"absolute",top:-20,right:-20,width:130,height:130,borderRadius:"50%",background:T.teal+"0a"}}),
      React.createElement("div",{style:{fontSize:10,color:T.textSub,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:5}},"Saldo Keuangan — ",m.label),
      React.createElement("div",{style:{fontSize:36,fontWeight:900,letterSpacing:-1.5,color:saldo>=0?T.teal:T.coral,marginBottom:4}},saldo<0?"-":"","Rp ",new Intl.NumberFormat("id-ID").format(Math.abs(saldo))),
      React.createElement("div",{style:{fontSize:12,color:pct>90?T.coral:pct>70?T.amber:T.sage,fontWeight:700,marginBottom:12}},pct.toFixed(0),"% pemasukan sudah terpakai"),saldoAwal>0&&React.createElement("div",{style:{fontSize:11,color:T.textSub,marginBottom:4}},"Saldo awal (dari periode sebelumnya): ",React.createElement("span",{style:{color:T.teal,fontWeight:700}},fmt(saldoAwal))),
      React.createElement("div",{style:{height:5,background:"#1a3a6a",borderRadius:3,overflow:"hidden"}},React.createElement("div",{style:{height:"100%",width:pct+"%",borderRadius:3,background:pct>90?T.coral:pct>70?T.amber:T.teal}}))
    ),
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:18}},
      React.createElement(Card,{icon:"💚",title:"Pemasukan",badge:mInc.length+" transaksi",badgeColor:T.sage},
        React.createElement("div",{style:{fontSize:26,fontWeight:900,color:T.sage,marginBottom:12}},fmt(tInc)),
        React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:5}},
          mInc.length===0?React.createElement("div",{style:{fontSize:12,color:T.textDim,fontStyle:"italic"}},"Belum ada pemasukan"):
          [].concat(mInc).sort(function(a,b){return parseD(b.tanggal)-parseD(a.tanggal);}).slice(0,5).map(function(item){
            var mc={Transfer:T.teal,"E-Wallet":T.violet,Cash:T.amber,QRIS:T.sky,Debit:T.sage,Kredit:T.coral};
            return React.createElement("div",{key:item.id,style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 10px",borderRadius:8,background:T.panel,gap:6}},
              React.createElement("div",{style:{minWidth:0,flex:1}},React.createElement("div",{style:{fontSize:12,fontWeight:600,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}},item.sumber),React.createElement("div",{style:{fontSize:10,color:T.textSub}},item.tanggal)),
              React.createElement("div",{style:{fontSize:12,fontWeight:800,color:T.sage,whiteSpace:"nowrap"}},"+",fmtS(item.nominal))
            );
          })
        ),
        mInc.length>5&&React.createElement("div",{style:{fontSize:10,color:T.textSub,marginTop:6,textAlign:"right"}},"+",mInc.length-5," lainnya")
      ),
      React.createElement(Card,{icon:"🔴",title:"Pengeluaran",badge:mExp.length+" transaksi",badgeColor:T.coral},
        React.createElement("div",{style:{fontSize:26,fontWeight:900,color:T.coral,marginBottom:12}},fmt(tExp)),
        catArr.length===0?React.createElement("div",{style:{fontSize:12,color:T.textDim,fontStyle:"italic"}},"Belum ada pengeluaran"):
        React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:7}},
          catArr.slice(0,5).map(function(kv){var cat=kv[0],amt=kv[1];var cfg=getCat(cat);var p2=tExp>0?(amt/tExp)*100:0;
            return React.createElement("div",{key:cat,style:{display:"flex",alignItems:"center",gap:8}},
              React.createElement("span",{style:{fontSize:14}},cfg.emoji),
              React.createElement("div",{style:{flex:1,minWidth:0}},
                React.createElement("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:3}},React.createElement("span",{style:{fontSize:11,color:T.text,fontWeight:600}},cat),React.createElement("span",{style:{fontSize:11,color:T.coral,fontWeight:700}},fmtS(amt))),
                React.createElement("div",{style:{height:4,background:T.border,borderRadius:2}},React.createElement("div",{style:{height:"100%",width:p2+"%",background:cfg.color,borderRadius:2}}))
              )
            );
          }),
          React.createElement("div",{style:{paddingTop:8,borderTop:"1px solid "+T.border,display:"flex",gap:6,marginTop:2}},
            React.createElement("div",{style:{flex:1,background:T.skyDim,borderRadius:8,padding:"7px 10px",border:"1px solid "+T.sky+"30"}},React.createElement("div",{style:{fontSize:9,color:T.sky,fontWeight:700,textTransform:"uppercase",marginBottom:2}},"🔵 Need"),React.createElement("div",{style:{fontSize:13,fontWeight:800,color:T.text}},fmtS(need))),
            React.createElement("div",{style:{flex:1,background:T.violetDim,borderRadius:8,padding:"7px 10px",border:"1px solid "+T.violet+"30"}},React.createElement("div",{style:{fontSize:9,color:T.violet,fontWeight:700,textTransform:"uppercase",marginBottom:2}},"💜 Want"),React.createElement("div",{style:{fontSize:13,fontWeight:800,color:T.text}},fmtS(want)))
          )
        )
      ),
      React.createElement(Card,{icon:"🏦",title:"Tabungan",badge:"Saldo "+fmt(saldoTab),badgeColor:saldoTab>=0?T.teal:T.coral},
        React.createElement("div",{style:{fontSize:26,fontWeight:900,color:saldoTab>=0?T.teal:T.coral,marginBottom:12}},fmt(saldoTab)),
        React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:8}},
          React.createElement("div",{style:{display:"flex",gap:6}},
            React.createElement("div",{style:{flex:1,background:T.sageDim,borderRadius:8,padding:"8px 10px",border:"1px solid "+T.sage+"30"}},React.createElement("div",{style:{fontSize:9,color:T.sage,fontWeight:700,textTransform:"uppercase",marginBottom:3}},"💚 Ditabung"),React.createElement("div",{style:{fontSize:13,fontWeight:800,color:T.text}},fmtS(totalSetoran)),React.createElement("div",{style:{fontSize:9,color:T.textSub}},p.savings.filter(function(s){return s.tipe==="setoran";}).length," setoran")),
            React.createElement("div",{style:{flex:1,background:T.amberDim,borderRadius:8,padding:"8px 10px",border:"1px solid "+T.amber+"30"}},React.createElement("div",{style:{fontSize:9,color:T.amber,fontWeight:700,textTransform:"uppercase",marginBottom:3}},"🟡 Digunakan"),React.createElement("div",{style:{fontSize:13,fontWeight:800,color:T.text}},fmtS(totalPenarikan)),React.createElement("div",{style:{fontSize:9,color:T.textSub}},p.savings.filter(function(s){return s.tipe==="penarikan";}).length," penarikan"))
          ),
          React.createElement("div",null,
            React.createElement("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:4}},React.createElement("span",{style:{fontSize:10,color:T.textSub}},"Pemakaian tabungan"),React.createElement("span",{style:{fontSize:10,fontWeight:700,color:pctTab>80?T.coral:pctTab>50?T.amber:T.teal}},pctTab.toFixed(0),"%")),
            React.createElement("div",{style:{height:6,background:T.border,borderRadius:3,overflow:"hidden"}},React.createElement("div",{style:{height:"100%",width:pctTab+"%",background:pctTab>80?T.coral:pctTab>50?T.amber:T.teal,borderRadius:3}}))
          ),
          p.savings.length===0?React.createElement("div",{style:{fontSize:10,color:T.textDim,fontStyle:"italic"}},"Belum ada transaksi tabungan"):
          [].concat(p.savings).sort(function(a,b){return parseD(b.tanggal)-parseD(a.tanggal);}).slice(0,3).map(function(item){
            return React.createElement("div",{key:item.id,style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 10px",borderRadius:8,background:T.panel,gap:6}},
              React.createElement("div",{style:{minWidth:0,flex:1}},React.createElement("div",{style:{fontSize:11,fontWeight:600,color:T.text}},item.tipe==="setoran"?"💚 Setoran":"🟡 Penarikan"),React.createElement("div",{style:{fontSize:9,color:T.textSub}},item.tanggal,item.catatan?" · "+item.catatan.slice(0,20):"")),
              React.createElement("div",{style:{fontSize:12,fontWeight:800,color:item.tipe==="setoran"?T.sage:T.amber,whiteSpace:"nowrap"}},(item.tipe==="setoran"?"+":"-"),fmtS(item.nominal))
            );
          })
        )
      )
    ),
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}},
      React.createElement("div",{style:{background:T.card,borderRadius:16,border:"1px solid "+T.border,overflow:"hidden"}},
        React.createElement("div",{style:{padding:"14px 18px",borderBottom:"1px solid "+T.border}},React.createElement("div",{style:{fontSize:14,fontWeight:700,color:T.text}},"📋 Pengeluaran Terakhir")),
        React.createElement("div",{style:{overflowY:"auto",maxHeight:240}},
          recent.length===0?React.createElement("div",{style:{textAlign:"center",padding:28,color:T.textSub,fontSize:13}},"Belum ada"):
          recent.map(function(e){var cfg=getCat(e.kategori);return React.createElement("div",{key:e.id,style:{display:"flex",alignItems:"center",gap:10,padding:"8px 18px",borderBottom:"1px solid "+T.border}},React.createElement("span",{style:{fontSize:15}},cfg.emoji),React.createElement("div",{style:{flex:1,minWidth:0}},React.createElement("div",{style:{fontSize:12,fontWeight:600,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}},e.keperluan),React.createElement("div",{style:{fontSize:10,color:T.textSub}},e.tanggal," · ",e.kategori)),React.createElement(Chip,{label:e.nw,color:e.nw==="Need"?T.sky:T.violet}),React.createElement("span",{style:{fontSize:12,fontWeight:700,color:T.coral,whiteSpace:"nowrap"}},"-",fmtS(e.nominal)));})
        )
      ),
      p.allMonths.length>1
        ?React.createElement("div",{style:{background:T.card,borderRadius:16,border:"1px solid "+T.border,overflow:"hidden"}},
            React.createElement("div",{style:{padding:"14px 18px",borderBottom:"1px solid "+T.border}},React.createElement("div",{style:{fontSize:14,fontWeight:700,color:T.text}},"📊 Cashflow Semua Periode")),
            React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",padding:"8px 16px",background:T.surface}},
              ["Periode","Saldo Awal","Masuk","Keluar","Saldo Akhir"].map(function(h){return React.createElement("div",{key:h,style:{fontSize:10,fontWeight:700,color:T.textSub,textTransform:"uppercase",letterSpacing:0.4}},h);})
            ),
            [].concat(p.allMonths).reverse().map(function(mo,i){
              var cRow=carryData.find(function(x){return x.key===mo.key;})||{inc:0,exp:0,saldoAwal:0,saldoAkhir:0};
              var isA=mo.key===p.activeKey;
              return React.createElement("div",{key:mo.key,style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",padding:"9px 16px",alignItems:"center",borderTop:i===0?"none":"1px solid "+T.border,background:isA?T.tealDim:"transparent"}},
                React.createElement("div",{style:{fontSize:12,fontWeight:700,color:isA?T.teal:T.text}},mo.label),
                React.createElement("div",{style:{fontSize:11,color:T.textSub}},fmtS(cRow.saldoAwal)),
                React.createElement("div",{style:{fontSize:11,color:T.sage}},fmtS(cRow.inc)),
                React.createElement("div",{style:{fontSize:11,color:T.coral}},fmtS(cRow.exp)),
                React.createElement("div",{style:{fontSize:11,fontWeight:800,color:cRow.saldoAkhir>=0?T.sage:T.coral}},fmtS(cRow.saldoAkhir))
              );
            })
          )
        :React.createElement("div",{style:{background:T.card,borderRadius:16,border:"1px solid "+T.border,display:"flex",alignItems:"center",justifyContent:"center",color:T.textSub,fontSize:13,flexDirection:"column",gap:8}},React.createElement("div",{style:{fontSize:36}},"📅"),React.createElement("div",null,"Tambah periode kedua untuk melihat cashflow"))
    )
  );
}

// ── Pemasukan View ────────────────────────────────────────────────────────────
function PemasukanView(p){
  var m=p.allMonths.find(function(x){return x.key===p.activeKey;});
  if(!m)return React.createElement(EmptyMonthMsg,null);
  var rows=[].concat(p.income.filter(function(i){return mkKey(i.year,i.month)===p.activeKey;})).sort(function(a,b){return parseD(b.tanggal)-parseD(a.tanggal);});
  var total=rows.reduce(function(s,i){return s+i.nominal;},0);
  var mc={Transfer:T.teal,"E-Wallet":T.violet,Cash:T.amber,QRIS:T.sky,Debit:T.sage,Kredit:T.coral};
  return React.createElement("div",{style:{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}},
    React.createElement("div",{style:{padding:"24px 32px 20px",borderBottom:"1px solid "+T.border,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}},
      React.createElement("div",null,React.createElement("div",{style:{fontSize:11,color:T.textSub,fontWeight:700,textTransform:"uppercase",letterSpacing:1}},"Pemasukan"),React.createElement("div",{style:{fontSize:28,fontWeight:900,color:T.sage,marginTop:4}},fmt(total)),React.createElement("div",{style:{fontSize:13,color:T.textSub,marginTop:4}},rows.length," transaksi · ",m.label)),
      React.createElement(Btn,{color:T.sage,onClick:p.onAdd},"💵 + Tambah Pemasukan")
    ),
    rows.length===0?React.createElement("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flex:1,color:T.textSub,gap:10}},React.createElement("div",{style:{fontSize:48}},"💵"),React.createElement("div",{style:{fontSize:15,fontWeight:700,color:T.text}},"Belum ada pemasukan")):
    React.createElement("div",{style:{flex:1,overflowY:"auto"}},
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"130px 1fr 140px 180px 60px",padding:"10px 32px",background:T.surface,borderBottom:"1px solid "+T.border,position:"sticky",top:0,zIndex:10}},
        ["Tanggal","Sumber","Metode","Nominal",""].map(function(h){return React.createElement("div",{key:h,style:{fontSize:11,fontWeight:700,color:T.textSub,textTransform:"uppercase",letterSpacing:0.5}},h);})
      ),
      rows.map(function(item,i){return React.createElement("div",{key:item.id,style:{display:"grid",gridTemplateColumns:"130px 1fr 140px 180px 60px",padding:"13px 32px",alignItems:"center",borderBottom:"1px solid "+T.border,background:i%2===0?"transparent":T.panel}},
        React.createElement("div",{style:{fontSize:12,color:T.textSub,fontFamily:"monospace"}},item.tanggal),
        React.createElement("div",null,React.createElement("div",{style:{fontSize:13,fontWeight:600,color:T.text}},item.sumber),item.catatan&&React.createElement("div",{style:{fontSize:11,color:T.textDim}},item.catatan)),
        React.createElement(Chip,{label:item.metode,color:mc[item.metode]||T.textSub}),
        React.createElement("div",{style:{fontSize:14,fontWeight:800,color:T.sage}},"+",fmt(item.nominal)),
        React.createElement("div",{style:{display:"flex",gap:4}},React.createElement("button",{onClick:function(){p.onEdit(item);},style:{background:T.card,border:"1px solid "+T.border,color:T.textSub,width:28,height:28,borderRadius:6,cursor:"pointer",fontSize:12}},"✏"),React.createElement("button",{onClick:function(){p.onDelete(item.id);},style:{background:T.coralDim,border:"1px solid "+T.coral+"30",color:T.coral,width:28,height:28,borderRadius:6,cursor:"pointer",fontSize:12}},"✕"))
      );})
    )
  );
}

// ── Pengeluaran View ──────────────────────────────────────────────────────────
function PengeluaranView(p){
  var m=p.allMonths.find(function(x){return x.key===p.activeKey;});
  if(!m)return React.createElement(EmptyMonthMsg,null);
  var _fc=useState("Semua"),fCat=_fc[0],sFCat=_fc[1];
  var _fn=useState("Semua"),fNW=_fn[0],sFNW=_fn[1];
  var _fs=useState(""),search=_fs[0],sSearch=_fs[1];
  var all=p.expenses.filter(function(e){return mkKey(e.year,e.month)===p.activeKey;});
  var total=all.reduce(function(s,e){return s+e.nominal;},0);
  var usedCats=[].concat([],all.map(function(e){return e.kategori;})).filter(function(v,i,a){return a.indexOf(v)===i;});
  var rows=[].concat(all).filter(function(e){
    if(fCat!=="Semua"&&e.kategori!==fCat)return false;
    if(fNW!=="Semua"&&e.nw!==fNW)return false;
    if(search&&e.keperluan.toLowerCase().indexOf(search.toLowerCase())<0)return false;
    return true;
  }).sort(function(a,b){return parseD(b.tanggal)-parseD(a.tanggal);});
  function pill(label,active,col,fn){return React.createElement("button",{key:label,onClick:fn,style:{padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:700,border:"1.5px solid "+(active?col:T.border),background:active?col+"22":"transparent",color:active?col:T.textSub,cursor:"pointer",transition:"all .12s",whiteSpace:"nowrap"}},label);}
  return React.createElement("div",{style:{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}},
    React.createElement("div",{style:{padding:"24px 32px 16px",borderBottom:"1px solid "+T.border,flexShrink:0}},
      React.createElement("div",{style:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:16}},
        React.createElement("div",null,React.createElement("div",{style:{fontSize:11,color:T.textSub,fontWeight:700,textTransform:"uppercase",letterSpacing:1}},"Pengeluaran"),React.createElement("div",{style:{fontSize:28,fontWeight:900,color:T.coral,marginTop:4}},fmt(total)),React.createElement("div",{style:{fontSize:13,color:T.textSub,marginTop:4}},all.length," transaksi · ",m.label)),
        React.createElement(Btn,{color:T.coral,onClick:p.onAdd},"➕ Tambah Pengeluaran")
      ),
      React.createElement("div",{style:{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}},
        React.createElement("input",{value:search,onChange:function(e){sSearch(e.target.value);},placeholder:"🔍 Cari...",style:{background:T.panel,border:"1.5px solid "+T.border,borderRadius:8,padding:"8px 12px",color:T.text,fontSize:13,outline:"none",fontFamily:"inherit",width:200}}),
        React.createElement("div",{style:{display:"flex",gap:6,flexWrap:"wrap"}},
          ["Semua"].concat(usedCats).map(function(c){var cfg=getCat(c);return pill(c==="Semua"?"Semua":cfg.emoji+" "+c,fCat===c,cfg.color||T.teal,function(){sFCat(c);});})
        ),
        React.createElement("div",{style:{display:"flex",gap:6}},
          ["Semua","Need","Want"].map(function(n){return pill(n==="Need"?"🔵 Need":n==="Want"?"💜 Want":"Semua",fNW===n,n==="Need"?T.sky:n==="Want"?T.violet:T.textSub,function(){sFNW(n);});})
        )
      )
    ),
    all.length===0?React.createElement("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flex:1,color:T.textSub,gap:10}},React.createElement("div",{style:{fontSize:48}},"💸"),React.createElement("div",{style:{fontSize:15,fontWeight:700,color:T.text}},"Belum ada pengeluaran")):
    rows.length===0?React.createElement("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flex:1,color:T.textSub,gap:10}},React.createElement("div",{style:{fontSize:48}},"🔍"),React.createElement("div",{style:{fontSize:15,fontWeight:700,color:T.text}},"Tidak ada yang cocok")):
    React.createElement("div",{style:{flex:1,overflowY:"auto"}},
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"120px 1fr 150px 100px 160px 80px 60px",padding:"10px 32px",background:T.surface,borderBottom:"1px solid "+T.border,position:"sticky",top:0,zIndex:10}},
        ["Tanggal","Keperluan","Kategori","NW","Nominal","Bayar",""].map(function(h){return React.createElement("div",{key:h,style:{fontSize:11,fontWeight:700,color:T.textSub,textTransform:"uppercase",letterSpacing:0.5}},h);})
      ),
      rows.map(function(item,i){var cfg=getCat(item.kategori);return React.createElement("div",{key:item.id,style:{display:"grid",gridTemplateColumns:"120px 1fr 150px 100px 160px 80px 60px",padding:"12px 32px",alignItems:"center",borderBottom:"1px solid "+T.border,background:i%2===0?"transparent":T.panel}},
        React.createElement("div",{style:{fontSize:12,color:T.textSub,fontFamily:"monospace"}},item.tanggal),
        React.createElement("div",null,React.createElement("div",{style:{fontSize:13,fontWeight:600,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:260}},item.keperluan),item.catatan&&React.createElement("div",{style:{fontSize:11,color:T.textDim}},item.catatan)),
        React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6}},React.createElement("span",null,cfg.emoji),React.createElement("span",{style:{fontSize:12,color:T.text}},item.kategori)),
        React.createElement(Chip,{label:item.nw,color:item.nw==="Need"?T.sky:T.violet}),
        React.createElement("div",{style:{fontSize:14,fontWeight:800,color:T.coral}},"-",fmt(item.nominal)),
        React.createElement(Chip,{label:item.bayar,color:T.textSub}),
        React.createElement("div",{style:{display:"flex",gap:4}},React.createElement("button",{onClick:function(){p.onEdit(item);},style:{background:T.card,border:"1px solid "+T.border,color:T.textSub,width:28,height:28,borderRadius:6,cursor:"pointer",fontSize:12}},"✏"),React.createElement("button",{onClick:function(){p.onDelete(item.id);},style:{background:T.coralDim,border:"1px solid "+T.coral+"30",color:T.coral,width:28,height:28,borderRadius:6,cursor:"pointer",fontSize:12}},"✕"))
      );})
    )
  );
}

// ── Tabungan View ─────────────────────────────────────────────────────────────
function TabunganView(p){
  var _ft=useState("Semua"),fTipe=_ft[0],setFTipe=_ft[1];
  var _ei=useState(null),editItem=_ei[0],setEditItem=_ei[1];
  var _sf=useState(false),showForm=_sf[0],setShowForm=_sf[1];
  var _dt=useState(null),delTarget=_dt[0],setDelTarget=_dt[1];
  var tk=useToast();
  var totalSetoran=p.savings.filter(function(s){return s.tipe==="setoran";}).reduce(function(a,s){return a+s.nominal;},0);
  var totalPenarikan=p.savings.filter(function(s){return s.tipe==="penarikan";}).reduce(function(a,s){return a+s.nominal;},0);
  var saldo=totalSetoran-totalPenarikan;
  var pct=totalSetoran>0?Math.min(100,(totalPenarikan/totalSetoran)*100):0;
  var rows=[].concat(p.savings).filter(function(s){return fTipe==="Semua"||s.tipe===fTipe;}).sort(function(a,b){return parseD(b.tanggal)-parseD(a.tanggal);});
  function pill(lbl,active,col,fn){return React.createElement("button",{key:lbl,onClick:fn,style:{padding:"6px 16px",borderRadius:20,fontSize:12,fontWeight:700,border:"1.5px solid "+(active?col:T.border),background:active?col+"22":"transparent",color:active?col:T.textSub,cursor:"pointer"}},lbl);}
  return React.createElement("div",{style:{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}},
    React.createElement("div",{style:{padding:"24px 32px 20px",borderBottom:"1px solid "+T.border,flexShrink:0}},
      React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}},
        React.createElement("div",null,
          React.createElement("div",{style:{fontSize:11,color:T.textSub,fontWeight:700,textTransform:"uppercase",letterSpacing:1}},"Ringkasan Tabungan"),
          React.createElement("div",{style:{fontSize:34,fontWeight:900,color:saldo>=0?T.teal:T.coral,marginTop:4}},fmt(saldo)),
          React.createElement("div",{style:{fontSize:13,color:T.textSub,marginTop:4}},"Saldo tabungan saat ini")
        ),
        React.createElement(Btn,{color:T.teal,onClick:function(){setEditItem(null);setShowForm(true);}},"🏦 + Transaksi Tabungan")
      ),
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:16}},
        React.createElement("div",{style:{background:T.sageDim,borderRadius:14,padding:"16px 18px",border:"1px solid "+T.sage+"30"}},
          React.createElement("div",{style:{fontSize:11,color:T.sage,fontWeight:700,textTransform:"uppercase",letterSpacing:0.7,marginBottom:6}},"💚 Total Ditabung"),
          React.createElement("div",{style:{fontSize:20,fontWeight:900,color:T.text}},fmt(totalSetoran)),
          React.createElement("div",{style:{fontSize:11,color:T.textSub,marginTop:4}},p.savings.filter(function(s){return s.tipe==="setoran";}).length," setoran")
        ),
        React.createElement("div",{style:{background:T.amberDim,borderRadius:14,padding:"16px 18px",border:"1px solid "+T.amber+"30"}},
          React.createElement("div",{style:{fontSize:11,color:T.amber,fontWeight:700,textTransform:"uppercase",letterSpacing:0.7,marginBottom:6}},"🟡 Total Digunakan"),
          React.createElement("div",{style:{fontSize:20,fontWeight:900,color:T.text}},fmt(totalPenarikan)),
          React.createElement("div",{style:{fontSize:11,color:T.textSub,marginTop:4}},p.savings.filter(function(s){return s.tipe==="penarikan";}).length," penarikan")
        ),
        React.createElement("div",{style:{background:T.tealDim,borderRadius:14,padding:"16px 18px",border:"1px solid "+T.teal+"30"}},
          React.createElement("div",{style:{fontSize:11,color:T.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:0.7,marginBottom:6}},"💰 Saldo Saat Ini"),
          React.createElement("div",{style:{fontSize:20,fontWeight:900,color:saldo>=0?T.teal:T.coral}},fmt(saldo)),
          React.createElement("div",{style:{fontSize:11,color:T.textSub,marginTop:4}},pct.toFixed(0),"% sudah digunakan")
        )
      ),
      React.createElement("div",null,
        React.createElement("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:5}},
          React.createElement("span",{style:{fontSize:12,color:T.textSub}},"Pemakaian tabungan"),
          React.createElement("span",{style:{fontSize:12,fontWeight:700,color:pct>80?T.coral:pct>50?T.amber:T.teal}},pct.toFixed(0),"%")
        ),
        React.createElement("div",{style:{height:8,background:T.border,borderRadius:4,overflow:"hidden"}},
          React.createElement("div",{style:{height:"100%",width:pct+"%",background:pct>80?T.coral:pct>50?T.amber:T.teal,borderRadius:4}})
        )
      ),
      React.createElement("div",{style:{display:"flex",gap:8,marginTop:14}},
        pill("Semua",fTipe==="Semua",T.teal,function(){setFTipe("Semua");}),
        pill("💚 Setoran",fTipe==="setoran",T.sage,function(){setFTipe("setoran");}),
        pill("🟡 Penarikan",fTipe==="penarikan",T.amber,function(){setFTipe("penarikan");})
      )
    ),
    p.savings.length===0?
      React.createElement("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flex:1,color:T.textSub,gap:10}},
        React.createElement("div",{style:{fontSize:52}},"🏦"),
        React.createElement("div",{style:{fontSize:16,fontWeight:700,color:T.text}},"Belum ada transaksi tabungan"),
        React.createElement("div",{style:{fontSize:13}},"Klik tombol + Transaksi Tabungan untuk mulai mencatat")
      ):
      React.createElement("div",{style:{flex:1,overflowY:"auto"}},
        React.createElement("div",{style:{display:"grid",gridTemplateColumns:"130px 150px 1fr 190px 60px",padding:"10px 32px",background:T.surface,borderBottom:"1px solid "+T.border,position:"sticky",top:0,zIndex:10}},
          ["Tanggal","Jenis","Catatan","Nominal",""].map(function(h){return React.createElement("div",{key:h,style:{fontSize:11,fontWeight:700,color:T.textSub,textTransform:"uppercase",letterSpacing:0.5}},h);})
        ),
        rows.length===0?React.createElement("div",{style:{textAlign:"center",padding:40,color:T.textSub}},"Tidak ada yang cocok dengan filter"):
        rows.map(function(item,i){return React.createElement("div",{key:item.id,style:{display:"grid",gridTemplateColumns:"130px 150px 1fr 190px 60px",padding:"13px 32px",alignItems:"center",borderBottom:"1px solid "+T.border,background:i%2===0?"transparent":T.panel}},
          React.createElement("div",{style:{fontSize:12,color:T.textSub,fontFamily:"monospace"}},item.tanggal),
          React.createElement(Chip,{label:item.tipe==="setoran"?"💚 Setoran":"🟡 Penarikan",color:item.tipe==="setoran"?T.sage:T.amber}),
          React.createElement("div",{style:{fontSize:13,color:item.catatan?T.text:T.textDim,fontStyle:item.catatan?"normal":"italic"}},item.catatan||"—"),
          React.createElement("div",{style:{fontSize:14,fontWeight:800,color:item.tipe==="setoran"?T.sage:T.amber}},(item.tipe==="setoran"?"+":"-"),fmt(item.nominal)),
          React.createElement("div",{style:{display:"flex",gap:4}},
            React.createElement("button",{onClick:function(){setEditItem(item);setShowForm(true);},style:{background:T.card,border:"1px solid "+T.border,color:T.textSub,width:28,height:28,borderRadius:6,cursor:"pointer",fontSize:12}},"✏"),
            React.createElement("button",{onClick:function(){setDelTarget(item.id);},style:{background:T.coralDim,border:"1px solid "+T.coral+"30",color:T.coral,width:28,height:28,borderRadius:6,cursor:"pointer",fontSize:12}},"✕")
          )
        );})
      ),
    React.createElement(SavingForm,{
      open:showForm,
      onClose:function(){setShowForm(false);setEditItem(null);},
      initial:editItem,
      onSave:function(item){
        p.onSave(item);
        tk.show(editItem?"Transaksi diperbarui":item.tipe==="setoran"?"Setoran dicatat":"Penarikan dicatat");
        setShowForm(false);setEditItem(null);
      }
    }),
    React.createElement(ConfirmModal,{
      open:!!delTarget,
      message:"Yakin ingin menghapus transaksi tabungan ini?",
      onConfirm:function(){p.onDelete(delTarget);tk.show("Transaksi dihapus","info");setDelTarget(null);},
      onCancel:function(){setDelTarget(null);}
    }),
    React.createElement(Toast,{toast:tk.toast})
  );
}

// ── Analisis Bulanan ──────────────────────────────────────────────────────────
function AnalisisBulananView(p){
  if(p.allMonths.length===0)return React.createElement(EmptyMonthMsg,null);
  var trend=computeCarryOver(p.allMonths,p.expenses,p.income);
  var catTotal=p.expenses.reduce(function(a,e){a[e.kategori]=(a[e.kategori]||0)+e.nominal;return a;},{});
  var catArr=Object.entries(catTotal).sort(function(a,b){return b[1]-a[1];});
  var totalAllExp=Object.values(catTotal).reduce(function(s,v){return s+v;},0);
  var totalAllInc=p.income.reduce(function(s,i){return s+i.nominal;},0);
  var allNeed=p.expenses.filter(function(e){return e.nw==="Need";}).reduce(function(s,e){return s+e.nominal;},0);
  var allWant=p.expenses.filter(function(e){return e.nw==="Want";}).reduce(function(s,e){return s+e.nominal;},0);
  var sorted=[].concat(trend).sort(function(a,b){return b.saldoAkhir-a.saldoAkhir;});
  var best=sorted[0],worst=sorted[sorted.length-1];
  var maxVal=Math.max.apply(null,trend.map(function(x){return Math.max(x.inc,x.exp);}).concat([1]));
  return React.createElement("div",{style:{padding:"28px 32px",overflowY:"auto",height:"100%"}},
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:28}},
      React.createElement(StatCard,{label:"Total Pemasukan",value:fmtS(totalAllInc),color:T.sage,icon:"💚",sub:p.income.length+" transaksi"}),
      React.createElement(StatCard,{label:"Total Pengeluaran",value:fmtS(totalAllExp),color:T.coral,icon:"🔴",sub:p.expenses.length+" transaksi"}),
      React.createElement(StatCard,{label:"Net Semua Waktu",value:(totalAllInc-totalAllExp>=0?"+":"")+fmtS(Math.abs(totalAllInc-totalAllExp)),color:totalAllInc-totalAllExp>=0?T.sage:T.coral,icon:"📊",sub:p.allMonths.length+" periode"}),
      React.createElement(StatCard,{label:"Rata-rata/Bulan",value:fmtS(p.allMonths.length?totalAllExp/p.allMonths.length:0),color:T.amber,icon:"📅"})
    ),
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:20,marginBottom:20}},
      React.createElement("div",{style:{background:T.card,borderRadius:16,border:"1px solid "+T.border,overflow:"hidden"}},
        React.createElement("div",{style:{padding:"16px 20px",borderBottom:"1px solid "+T.border}},React.createElement("div",{style:{fontSize:14,fontWeight:700,color:T.text}},"📈 Tren Bulanan")),
        React.createElement("div",{style:{padding:"16px 20px"}},
          trend.map(function(m,i){return React.createElement("div",{key:m.key,style:{marginBottom:i===trend.length-1?0:16}},
            React.createElement("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:6}},React.createElement("span",{style:{fontSize:13,fontWeight:700,color:T.text}},m.label),React.createElement("div",{style:{textAlign:"right"}},React.createElement("div",{style:{fontSize:13,fontWeight:800,color:m.saldoAkhir>=0?T.sage:T.coral}},fmt(m.saldoAkhir)),React.createElement("div",{style:{fontSize:10,color:T.textSub}},"Saldo akhir"))),
            [["Masuk",m.inc,T.sage],["Keluar",m.exp,T.coral]].map(function(row){return React.createElement("div",{key:row[0],style:{display:"flex",alignItems:"center",gap:8,marginBottom:4}},React.createElement("span",{style:{fontSize:10,color:row[2],width:38,fontWeight:700}},row[0]),React.createElement("div",{style:{flex:1,height:10,background:T.border,borderRadius:5,overflow:"hidden"}},React.createElement("div",{style:{height:"100%",width:((row[1]/maxVal)*100)+"%",background:row[2],borderRadius:5}})),React.createElement("span",{style:{fontSize:11,color:row[2],width:70,textAlign:"right",fontWeight:600}},fmtS(row[1])));})
          );})
        ),
        trend.length>1&&React.createElement("div",{style:{display:"flex",gap:10,padding:"12px 20px",borderTop:"1px solid "+T.border}},
          React.createElement("div",{style:{flex:1,background:T.sageDim,borderRadius:10,padding:"10px 14px",border:"1px solid "+T.sage+"30"}},React.createElement("div",{style:{fontSize:10,color:T.sage,fontWeight:700,textTransform:"uppercase"}},"🏆 Terbaik"),React.createElement("div",{style:{fontSize:13,fontWeight:700,color:T.text,marginTop:4}},best.label)),
          React.createElement("div",{style:{flex:1,background:T.coralDim,borderRadius:10,padding:"10px 14px",border:"1px solid "+T.coral+"30"}},React.createElement("div",{style:{fontSize:10,color:T.coral,fontWeight:700,textTransform:"uppercase"}},"⚠️ Terparah"),React.createElement("div",{style:{fontSize:13,fontWeight:700,color:T.text,marginTop:4}},worst.label))
        )
      ),
      React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:14}},
        React.createElement("div",{style:{background:T.card,borderRadius:16,border:"1px solid "+T.border,overflow:"hidden"}},
          React.createElement("div",{style:{padding:"14px 18px",borderBottom:"1px solid "+T.border}},React.createElement("div",{style:{fontSize:13,fontWeight:700,color:T.text}},"🏷️ Top Kategori")),
          React.createElement("div",{style:{padding:"12px 18px"}},
            catArr.slice(0,5).map(function(kv){var cat=kv[0],amt=kv[1];var cfg=getCat(cat);var pct2=totalAllExp>0?(amt/totalAllExp)*100:0;
              return React.createElement("div",{key:cat,style:{display:"flex",alignItems:"center",gap:10,marginBottom:10}},React.createElement("span",null,cfg.emoji),React.createElement("div",{style:{flex:1,minWidth:0}},React.createElement("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:3}},React.createElement("span",{style:{fontSize:12,color:T.text}},cat),React.createElement("span",{style:{fontSize:12,color:T.coral,fontWeight:700}},pct2.toFixed(0),"%")),React.createElement("div",{style:{height:4,background:T.border,borderRadius:2}},React.createElement("div",{style:{height:"100%",width:pct2+"%",background:cfg.color,borderRadius:2}}))));})
          )
        ),
        React.createElement("div",{style:{background:T.card,borderRadius:16,border:"1px solid "+T.border,padding:"14px 18px"}},
          React.createElement("div",{style:{fontSize:13,fontWeight:700,color:T.text,marginBottom:12}},"💡 Need vs Want"),
          React.createElement("div",{style:{display:"flex",gap:10}},
            [["🔵 Need",allNeed,T.sky],["💜 Want",allWant,T.violet]].map(function(row){return React.createElement("div",{key:row[0],style:{flex:1,background:row[2]+"15",borderRadius:10,padding:"10px 12px",border:"1px solid "+row[2]+"30"}},React.createElement("div",{style:{fontSize:10,color:row[2],fontWeight:700,marginBottom:4}},row[0]),React.createElement("div",{style:{fontSize:14,fontWeight:800,color:T.text}},fmtS(row[1])),React.createElement("div",{style:{fontSize:10,color:T.textSub}},totalAllExp>0?((row[1]/totalAllExp)*100).toFixed(0):0,"%"));})
          )
        )
      )
    )
  );
}

// ── Analisis Tahunan ──────────────────────────────────────────────────────────
function AnalisisTahunanView(p){
  var years=[].concat(p.allMonths.map(function(m){return m.year;})).filter(function(v,i,a){return a.indexOf(v)===i;}).sort(function(a,b){return b-a;});
  var _ex=useState(function(){return years.length>0?new Set([years[0]]):new Set();}),expanded=_ex[0],setExpanded=_ex[1];
  if(p.allMonths.length===0)return React.createElement(EmptyMonthMsg,null);
  var grandInc=p.income.reduce(function(s,i){return s+i.nominal;},0);
  var grandExp=p.expenses.reduce(function(s,e){return s+e.nominal;},0);
  var grandNet=grandInc-grandExp;
  function toggle(year){setExpanded(function(prev){var n=new Set(prev);if(n.has(year))n.delete(year);else n.add(year);return n;});}
  var yearData=years.map(function(year){
    var yM=p.allMonths.filter(function(m){return m.year===year;}).sort(function(a,b){return a.month-b.month;});
    var yE=p.expenses.filter(function(e){return e.year===year;});
    var yI=p.income.filter(function(i){return i.year===year;});
    var tInc=yI.reduce(function(s,i){return s+i.nominal;},0);
    var tExp=yE.reduce(function(s,e){return s+e.nominal;},0);
    var allCarry=computeCarryOver(p.allMonths,p.expenses,p.income);
    var monthly=yM.map(function(m){
      var crow=allCarry.find(function(x){return x.key===m.key;})||{inc:0,exp:0,saldoAwal:0,saldoAkhir:0,sal:0};
      return Object.assign({},m,{inc:crow.inc,exp:crow.exp,sal:crow.sal,saldoAwal:crow.saldoAwal,saldoAkhir:crow.saldoAkhir});
    });
    var catMap=yE.reduce(function(a,e){a[e.kategori]=(a[e.kategori]||0)+e.nominal;return a;},{});
    var catArr=Object.entries(catMap).sort(function(a,b){return b[1]-a[1];});
    var need=yE.filter(function(e){return e.nw==="Need";}).reduce(function(s,e){return s+e.nominal;},0);
    var want=yE.filter(function(e){return e.nw==="Want";}).reduce(function(s,e){return s+e.nominal;},0);
    var sm=[].concat(monthly).sort(function(a,b){return b.saldoAkhir-a.saldoAkhir;});
    return{year:year,tInc:tInc,tExp:tExp,net:tInc-tExp,monthly:monthly,catArr:catArr,need:need,want:want,best:sm[0],worst:sm[sm.length-1],mCount:yM.length,txCount:yE.length+yI.length};
  });
  return React.createElement("div",{style:{padding:"28px 32px",overflowY:"auto",height:"100%"}},
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:28}},
      React.createElement(StatCard,{label:"Net Sepanjang Waktu",value:(grandNet>=0?"+":"")+fmtS(Math.abs(grandNet)),color:grandNet>=0?T.sage:T.coral,icon:"🏆",sub:years.length+" tahun"}),
      React.createElement(StatCard,{label:"Total Pemasukan",value:fmtS(grandInc),color:T.sage,icon:"💚"}),
      React.createElement(StatCard,{label:"Total Pengeluaran",value:fmtS(grandExp),color:T.coral,icon:"🔴"}),
      React.createElement(StatCard,{label:"Total Transaksi",value:String(p.expenses.length+p.income.length),color:T.text,icon:"📝"})
    ),
    React.createElement("div",{style:{fontSize:16,fontWeight:800,color:T.text,marginBottom:14}},"📅 Analisis per Tahun"),
    yearData.map(function(yd){
      var exp=expanded.has(yd.year);
      return React.createElement("div",{key:yd.year,style:{marginBottom:16,background:T.card,borderRadius:18,border:"1px solid "+T.border,overflow:"hidden"}},
        React.createElement("button",{onClick:function(){toggle(yd.year);},style:{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 22px",background:exp?T.tealDim:"transparent",border:"none",cursor:"pointer",textAlign:"left"}},
          React.createElement("div",{style:{display:"flex",alignItems:"center",gap:14}},
            React.createElement("span",{style:{fontSize:18,color:T.teal,transform:exp?"rotate(90deg)":"none",transition:"transform .15s",display:"inline-block"}},"▶"),
            React.createElement("div",null,React.createElement("div",{style:{fontSize:20,fontWeight:900,color:T.text}},yd.year),React.createElement("div",{style:{fontSize:12,color:T.textSub,marginTop:2}},yd.mCount," bulan · ",yd.txCount," transaksi"))
          ),
          React.createElement("div",{style:{display:"flex",gap:24,alignItems:"center"}},
            React.createElement("div",{style:{textAlign:"right"}},React.createElement("div",{style:{fontSize:11,color:T.textSub,fontWeight:700,textTransform:"uppercase"}},"Masuk"),React.createElement("div",{style:{fontSize:15,fontWeight:800,color:T.sage}},fmtS(yd.tInc))),
            React.createElement("div",{style:{textAlign:"right"}},React.createElement("div",{style:{fontSize:11,color:T.textSub,fontWeight:700,textTransform:"uppercase"}},"Keluar"),React.createElement("div",{style:{fontSize:15,fontWeight:800,color:T.coral}},fmtS(yd.tExp))),
            React.createElement("div",{style:{textAlign:"right",minWidth:120}},React.createElement("div",{style:{fontSize:11,color:T.textSub,fontWeight:700,textTransform:"uppercase"}},"Net ",yd.year),React.createElement("div",{style:{fontSize:18,fontWeight:900,color:yd.net>=0?T.sage:T.coral}},(yd.net>=0?"+":"-"),fmtS(Math.abs(yd.net))))
          )
        ),
        exp&&React.createElement("div",{style:{padding:"0 22px 22px",borderTop:"1px solid "+T.border}},
          React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1.3fr 1fr",gap:20,marginTop:18}},
            React.createElement("div",null,
              React.createElement("div",{style:{fontSize:13,fontWeight:700,color:T.text,marginBottom:10}},"📋 Rincian per Bulan — ",yd.year),
              React.createElement("div",{style:{background:T.panel,borderRadius:12,overflow:"hidden",border:"1px solid "+T.border}},
                React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",padding:"8px 16px",background:T.surface}},
                  ["Bulan","Masuk","Keluar","Saldo Akhir"].map(function(h){return React.createElement("div",{key:h,style:{fontSize:10,fontWeight:700,color:T.textSub,textTransform:"uppercase"}},h);})
                ),
                yd.monthly.map(function(m,i){return React.createElement("div",{key:m.key,style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",padding:"10px 16px",borderTop:i===0?"none":"1px solid "+T.border}},
                  React.createElement("div",{style:{fontSize:12,fontWeight:700,color:T.text}},m.label.split(" ")[0]),
                  React.createElement("div",{style:{fontSize:11,color:T.sage}},fmtS(m.inc)),
                  React.createElement("div",{style:{fontSize:11,color:T.coral}},fmtS(m.exp)),
                  React.createElement("div",{style:{fontSize:11,fontWeight:700,color:m.saldoAkhir>=0?T.sage:T.coral}},fmtS(m.saldoAkhir))
                );})
              ),
              yd.monthly.length>1&&React.createElement("div",{style:{display:"flex",gap:10,marginTop:12}},
                React.createElement("div",{style:{flex:1,background:T.sageDim,borderRadius:10,padding:"10px 14px",border:"1px solid "+T.sage+"30"}},React.createElement("div",{style:{fontSize:10,color:T.sage,fontWeight:700,textTransform:"uppercase"}},"🏆 Terbaik di ",yd.year),React.createElement("div",{style:{fontSize:13,fontWeight:700,color:T.text,marginTop:4}},yd.best.label)),
                React.createElement("div",{style:{flex:1,background:T.coralDim,borderRadius:10,padding:"10px 14px",border:"1px solid "+T.coral+"30"}},React.createElement("div",{style:{fontSize:10,color:T.coral,fontWeight:700,textTransform:"uppercase"}},"⚠️ Terparah di ",yd.year),React.createElement("div",{style:{fontSize:13,fontWeight:700,color:T.text,marginTop:4}},yd.worst.label))
              )
            ),
            React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:14}},
              React.createElement("div",null,
                React.createElement("div",{style:{fontSize:13,fontWeight:700,color:T.text,marginBottom:10}},"Top Kategori ",yd.year),
                yd.catArr.length===0?React.createElement("div",{style:{fontSize:12,color:T.textDim}},"Belum ada pengeluaran"):
                yd.catArr.slice(0,5).map(function(kv){var cat=kv[0],amt=kv[1];var cfg=getCat(cat);var pct2=yd.tExp>0?(amt/yd.tExp)*100:0;
                  return React.createElement("div",{key:cat,style:{display:"flex",alignItems:"center",gap:10,marginBottom:9}},React.createElement("span",null,cfg.emoji),React.createElement("div",{style:{flex:1,minWidth:0}},React.createElement("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:3}},React.createElement("span",{style:{fontSize:12,color:T.text}},cat),React.createElement("span",{style:{fontSize:11,color:T.coral,fontWeight:700}},pct2.toFixed(0),"%")),React.createElement("div",{style:{height:4,background:T.border,borderRadius:2}},React.createElement("div",{style:{height:"100%",width:pct2+"%",background:cfg.color,borderRadius:2}}))));})
              ),
              React.createElement("div",{style:{background:T.panel,borderRadius:10,padding:"12px 14px",border:"1px solid "+T.border}},
                React.createElement("div",{style:{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}},"Need vs Want ",yd.year),
                React.createElement("div",{style:{display:"flex",gap:8}},
                  [["🔵 Need",yd.need,T.sky],["💜 Want",yd.want,T.violet]].map(function(row){return React.createElement("div",{key:row[0],style:{flex:1,background:row[2]+"15",borderRadius:8,padding:"8px 10px",border:"1px solid "+row[2]+"30"}},React.createElement("div",{style:{fontSize:10,color:row[2],fontWeight:700}},row[0]),React.createElement("div",{style:{fontSize:13,fontWeight:800,color:T.text}},fmtS(row[1])));})
                )
              )
            )
          )
        )
      );
    })
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar(p){
  var nav=[
    {id:"dashboard",icon:"📊",label:"Ringkasan"},
    {id:"pemasukan",icon:"📥",label:"Pemasukan"},
    {id:"pengeluaran",icon:"📤",label:"Pengeluaran"},
    {id:"tabungan",icon:"🏦",label:"Tabungan"},
    {id:"analisis-bulanan",icon:"📈",label:"Analisis Bulanan"},
    {id:"analisis-tahunan",icon:"🗓️",label:"Analisis Tahunan"},
  ];
  return React.createElement("div",{style:{width:224,background:T.sidebar,borderRight:"1px solid "+T.border,display:"flex",flexDirection:"column",flexShrink:0,userSelect:"none"}},
    React.createElement("div",{style:{padding:"20px 18px 16px",borderBottom:"1px solid "+T.border}},
      React.createElement("div",{style:{fontSize:20,fontWeight:900,color:T.teal,letterSpacing:-0.5}},"💰 Keuangan"),
      React.createElement("div",{style:{fontSize:10,color:T.textSub,marginTop:3,fontWeight:600,letterSpacing:0.5,textTransform:"uppercase"}},"Personal Finance")
    ),
    React.createElement("div",{style:{padding:"10px 8px 6px"}},
      React.createElement("div",{style:{fontSize:10,color:T.textDim,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",padding:"0 8px",marginBottom:6}},"Menu"),
      nav.map(function(item){var active=p.view===item.id;return React.createElement("button",{key:item.id,onClick:function(){p.onView(item.id);},style:{width:"100%",padding:"9px 12px",borderRadius:10,marginBottom:2,border:"none",background:active?T.tealDim:"transparent",color:active?T.teal:T.textSub,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:10,textAlign:"left",borderLeft:active?"3px solid "+T.teal:"3px solid transparent"}},React.createElement("span",{style:{fontSize:15}},item.icon),item.label);})
    ),
    React.createElement("div",{style:{height:1,background:T.border,margin:"4px 14px"}}),
    React.createElement("div",{style:{flex:1,overflowY:"auto",padding:"6px 8px"}},
      React.createElement("div",{style:{fontSize:10,color:T.textDim,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",padding:"0 8px",marginBottom:6}},"Periode"),
      p.months.length===0&&React.createElement("div",{style:{fontSize:12,color:T.textDim,padding:"6px 12px",lineHeight:1.6}},"Belum ada periode."),
      [].concat(p.months).reverse().map(function(m){var active=p.activeKey===m.key;return React.createElement("button",{key:m.key,onClick:function(){p.onSelect(m.key);},style:{width:"100%",padding:"8px 12px",borderRadius:10,marginBottom:2,border:"none",background:active?T.tealDim:"transparent",color:active?T.teal:T.textSub,fontSize:12,fontWeight:600,cursor:"pointer",textAlign:"left",borderLeft:active?"3px solid "+T.teal:"3px solid transparent",display:"flex",alignItems:"center",gap:8}},React.createElement("span",{style:{fontSize:13}},"📅"),m.label);})
    ),
    React.createElement("div",{style:{padding:"10px 8px",borderTop:"1px solid "+T.border}},
      React.createElement("button",{onClick:p.onAddMonth,style:{width:"100%",padding:"9px 12px",borderRadius:10,border:"1.5px dashed "+T.teal+"55",background:T.tealDim,color:T.teal,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:8}},"＋ Periode Baru")
    ),
    React.createElement("div",{style:{padding:"10px 14px",borderTop:"1px solid "+T.border,display:"flex",alignItems:"center",justifyContent:"space-between"}},
      React.createElement("div",null,React.createElement("div",{style:{fontSize:12,fontWeight:700,color:T.text}},p.user.name),React.createElement("div",{style:{fontSize:10,color:T.textDim}},p.user.email)),
      React.createElement("button",{onClick:p.onLogout,title:"Logout",style:{background:T.coralDim,border:"1px solid "+T.coral+"30",color:T.coral,width:28,height:28,borderRadius:7,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}},"⏏")
    )
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
function App(){
  var _u=useState(null),user=_u[0],setUser=_u[1];
  var _cs=useState(true),checkingSession=_cs[0],setCheckingSession=_cs[1];
  var _ld=useState(true),loading=_ld[0],setLoading=_ld[1];
  var _ex=useState([]),expenses=_ex[0],setExpenses=_ex[1];
  var _inc=useState([]),income=_inc[0],setIncome=_inc[1];
  var _mo=useState([]),months=_mo[0],setMonths=_mo[1];
  var _sa=useState([]),savings=_sa[0],setSavings=_sa[1];
  var _ak=useState(null),activeKey=_ak[0],setActiveKey=_ak[1];
  var _vw=useState("dashboard"),view=_vw[0],setView=_vw[1];
  var _sef=useState(false),showExpForm=_sef[0],setSEF=_sef[1];
  var _sif=useState(false),showIncForm=_sif[0],setSIF=_sif[1];
  var _sam=useState(false),showAddMonth=_sam[0],setSAM=_sam[1];
  var _eex=useState(null),editingExp=_eex[0],setEditExp=_eex[1];
  var _ein=useState(null),editingInc=_ein[0],setEditInc=_ein[1];
  var _dt=useState(null),deleteTarget=_dt[0],setDT=_dt[1];
  var tk=useToast();

  // On first mount, ask Supabase if there's already a valid session
  // (e.g. user closed the tab and came back — Supabase persists the
  // session token in localStorage automatically and keeps it refreshed).
  useEffect(function(){
    window.Api.getSession().then(function(u){
      if(u) setUser(u);
      setCheckingSession(false);
    }).catch(function(){
      setCheckingSession(false);
    });
  },[]);

  useEffect(function(){
    if(!user){setLoading(false);return;}
    setLoading(true);
    window.Api.fetchAll().then(function(data){
      setExpenses(data.expenses||[]);
      setIncome(data.income||[]);
      setMonths(data.months||[]);
      setSavings(data.savings||[]);
      var mo=data.months||[];
      if(mo.length>0)setActiveKey(mo[mo.length-1].key);
      setLoading(false);
    }).catch(function(e){
      tk.show(e.message||"Gagal memuat data.","error");
      setLoading(false);
    });
  },[user]);

  // Data is written straight to Supabase on every mutation (see saveExpense,
  // saveIncome, saveSaving, addMonth, confirmDelete below) — no need for a
  // "sync whole array on change" effect like the old localStorage version.

  var handleAuth=useCallback(function(u){setUser(u);},[]);
  var handleLogout=useCallback(function(){
    window.Api.logout().finally(function(){
      setUser(null);setExpenses([]);setIncome([]);setMonths([]);setSavings([]);setActiveKey(null);setView("dashboard");
    });
  },[]);

  var saveExpense=useCallback(function(item){
    window.Api.saveExpense(item).then(function(saved){
      setExpenses(function(p){return p.some(function(e){return e.id===saved.id;})?p.map(function(e){return e.id===saved.id?saved:e;}):[].concat(p,[saved]);});
    }).catch(function(e){tk.show(e.message||"Gagal menyimpan pengeluaran.","error");});
    setEditExp(null);
  },[]);
  var saveIncome=useCallback(function(item){
    window.Api.saveIncome(item).then(function(saved){
      setIncome(function(p){return p.some(function(i){return i.id===saved.id;})?p.map(function(i){return i.id===saved.id?saved:i;}):[].concat(p,[saved]);});
    }).catch(function(e){tk.show(e.message||"Gagal menyimpan pemasukan.","error");});
    setEditInc(null);
  },[]);
  var saveSaving=useCallback(function(item){
    window.Api.saveSaving(item).then(function(saved){
      setSavings(function(p){return p.some(function(s){return s.id===saved.id;})?p.map(function(s){return s.id===saved.id?saved:s;}):[].concat(p,[saved]);});
    }).catch(function(e){tk.show(e.message||"Gagal menyimpan tabungan.","error");});
  },[]);
  var deleteSaving=useCallback(function(id){
    window.Api.deleteSaving(id).then(function(){
      setSavings(function(p){return p.filter(function(s){return s.id!==id;});});
    }).catch(function(e){tk.show(e.message||"Gagal menghapus.","error");});
  },[]);

  var confirmDelete=function(){
    if(!deleteTarget)return;
    var id=deleteTarget.id, type=deleteTarget.type;
    setDT(null);
    if(type==="expense"){
      window.Api.deleteExpense(id).then(function(){
        setExpenses(function(p){return p.filter(function(e){return e.id!==id;});});
        tk.show("Transaksi dihapus","info");
      }).catch(function(e){tk.show(e.message||"Gagal menghapus.","error");});
    }else{
      window.Api.deleteIncome(id).then(function(){
        setIncome(function(p){return p.filter(function(i){return i.id!==id;});});
        tk.show("Transaksi dihapus","info");
      }).catch(function(e){tk.show(e.message||"Gagal menghapus.","error");});
    }
  };
  var addMonth=function(obj){
    window.Api.createMonth(obj.year,obj.month,obj.label).then(function(saved){
      setMonths(function(p){return [].concat(p,[saved]).sort(function(a,b){return a.key.localeCompare(b.key);});});
      setActiveKey(saved.key);
      setView("pemasukan");
    }).catch(function(e){tk.show(e.message||"Gagal membuat periode.","error");});
  };

  if(checkingSession)return React.createElement("div",{style:{background:T.bg,width:"100vw",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}},React.createElement("div",{style:{fontSize:44}},"💰"),React.createElement("div",{style:{fontSize:16,color:T.textSub,fontWeight:600}},"Memeriksa sesi..."));
  if(!user)return React.createElement(AuthScreen,{onAuth:handleAuth});
  if(loading)return React.createElement("div",{style:{background:T.bg,width:"100vw",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}},React.createElement("div",{style:{fontSize:44}},"💰"),React.createElement("div",{style:{fontSize:16,color:T.textSub,fontWeight:600}},"Memuat data..."));

  var aM=months.find(function(m){return m.key===activeKey;});
  var aY=aM?aM.year:new Date().getFullYear();
  var aMI=aM?aM.month:new Date().getMonth();

  var toolbarLabel=
    view==="dashboard"?"📊 Ringkasan bulan ini":
    view==="pemasukan"?"📥 Catat semua sumber pemasukan":
    view==="pengeluaran"?"📤 Catat semua pengeluaran":
    view==="tabungan"?"🏦 Ringkasan Tabungan — setoran & penarikan":
    view==="analisis-bulanan"?"📈 Analisis tren per bulan":
    "🗓️ Analisis pengeluaran & pemasukan per tahun";

  return React.createElement("div",{style:{background:T.bg,width:"100vw",height:"100vh",display:"flex",flexDirection:"column",overflow:"hidden",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",color:T.text}},
    React.createElement("div",{style:{height:40,background:T.sidebar,borderBottom:"1px solid "+T.border,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",flexShrink:0}},
      React.createElement("div",{style:{fontSize:12,color:T.textSub,fontWeight:600}},"💰 Keuangan Ku — Personal Finance Tracker"),
      React.createElement("div",{style:{display:"flex",gap:12,alignItems:"center"}},
        aM&&React.createElement("span",{style:{fontSize:12,color:T.teal,fontWeight:700}},"Periode: ",aM.label),
        React.createElement("div",{style:{fontSize:11,color:T.textDim}},new Date().toLocaleDateString("id-ID",{weekday:"long",year:"numeric",month:"long",day:"numeric"}))
      )
    ),
    React.createElement("div",{style:{flex:1,display:"flex",overflow:"hidden"}},
      React.createElement(Sidebar,{months:months,activeKey:activeKey,onSelect:function(k){setActiveKey(k);},onAddMonth:function(){setSAM(true);},view:view,onView:setView,user:user,onLogout:handleLogout}),
      React.createElement("div",{style:{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}},
        React.createElement("div",{style:{padding:"10px 24px",borderBottom:"1px solid "+T.border,display:"flex",alignItems:"center",justifyContent:"space-between",background:T.surface,flexShrink:0}},
          React.createElement("div",{style:{fontSize:13,color:T.textSub}},toolbarLabel),
          React.createElement("div",{style:{display:"flex",gap:8}},
            view==="pengeluaran"&&React.createElement(Btn,{color:T.coral,onClick:function(){setEditExp(null);setSEF(true);}},"➕ Tambah Pengeluaran"),
            view==="pemasukan"&&React.createElement(Btn,{color:T.sage,onClick:function(){setEditInc(null);setSIF(true);}},"💵 Tambah Pemasukan"),
            
            view==="dashboard"&&React.createElement(React.Fragment,null,
              React.createElement(Btn,{color:T.sage,outline:true,onClick:function(){setEditInc(null);setSIF(true);}},"💵 + Pemasukan"),
              React.createElement(Btn,{color:T.coral,onClick:function(){setEditExp(null);setSEF(true);}},"➕ + Pengeluaran")
            )
          )
        ),
        React.createElement("div",{style:{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}},
          view==="dashboard"&&React.createElement(DashboardView,{activeKey:activeKey,expenses:expenses,income:income,allMonths:months,savings:savings}),
          view==="pemasukan"&&React.createElement(PemasukanView,{activeKey:activeKey,income:income,allMonths:months,onAdd:function(){setEditInc(null);setSIF(true);},onEdit:function(item){setEditInc(item);setSIF(true);},onDelete:function(id){setDT({type:"income",id:id});}}),
          view==="pengeluaran"&&React.createElement(PengeluaranView,{activeKey:activeKey,expenses:expenses,allMonths:months,onAdd:function(){setEditExp(null);setSEF(true);},onEdit:function(item){setEditExp(item);setSEF(true);},onDelete:function(id){setDT({type:"expense",id:id});}}),
          view==="tabungan"&&React.createElement(TabunganView,{savings:savings,onSave:saveSaving,onDelete:deleteSaving}),
          view==="analisis-bulanan"&&React.createElement(AnalisisBulananView,{expenses:expenses,income:income,allMonths:months}),
          view==="analisis-tahunan"&&React.createElement(AnalisisTahunanView,{expenses:expenses,income:income,allMonths:months})
        )
      )
    ),
    React.createElement(ExpenseForm,{open:showExpForm,onClose:function(){setSEF(false);setEditExp(null);},onSave:saveExpense,activeYear:aY,activeMonth:aMI,initial:editingExp,showToast:tk.show}),
    React.createElement(IncomeForm,{open:showIncForm,onClose:function(){setSIF(false);setEditInc(null);},onSave:saveIncome,activeYear:aY,activeMonth:aMI,initial:editingInc,showToast:tk.show}),
    React.createElement(AddMonthModal,{open:showAddMonth,onClose:function(){setSAM(false);},onAdd:addMonth,existingKeys:months.map(function(m){return m.key;}),showToast:tk.show}),
    React.createElement(ConfirmModal,{open:!!deleteTarget,message:"Yakin ingin menghapus transaksi ini? Data tidak bisa dikembalikan.",onConfirm:confirmDelete,onCancel:function(){setDT(null);}}),
    React.createElement(Toast,{toast:tk.toast})
  );
}

