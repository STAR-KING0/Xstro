const q = function () {
     const P = {
       AcOvW: "(((.+)+)+)+$",
       uWDMx: "Error:",
       PNPXc: function (e, F) {
         return e !== F;
       },
       qiIHo: "pMNnT",
       DmIiS: "LPoJg",
       tzLFd: "chnQC"
     };
     const I = P;
     let k = true;
     return function (e, F) {
       const n = {
         kJhBO: I.AcOvW,
         nWrcH: I.uWDMx,
         LspdR: function (t, O) {
           return I.PNPXc(t, O);
         },
         nDPyU: I.qiIHo,
         sCtTZ: I.DmIiS
       };
       if (I.PNPXc(I.tzLFd, I.tzLFd)) {
         return I.toString().search(n.kJhBO).toString().constructor(k).search(n.kJhBO);
       } else {
         const O = k ? function () {
           const Y = {
             SUaLt: n.nWrcH
           };
           const r = Y;
           if (n.LspdR(n.nDPyU, n.nDPyU)) {
             I.log(r.SUaLt, k);
           } else if (F) {
             if (n.LspdR(n.sCtTZ, n.sCtTZ)) {
               return false;
             } else {
               const W = F.apply(e, arguments);
               F = null;
               return W;
             }
           }
         } : function () {};
         k = false;
         return O;
       }
     };
   }();
   const x = q(this, function () {
     return x.toString().search("(((.+)+)+)+$").toString().constructor(x).search("(((.+)+)+)+$");
   });
   x();
   const h = function () {
     let P = true;
     return function (I, k) {
       const e = {
         CxUjG: function (F) {
           return F();
         },
         KZcxN: function (F, n) {
           return F == n;
         },
         GREGf: "true"
       };
       const n = P ? function () {
         if (k) {
           const O = k.apply(I, arguments);
           k = null;
           return O;
         }
       } : function () {};
       P = false;
       return n;
     };
   }();
   (function () {
     h(this, function () {
       const P = {
         Vjvnn: function (I, k) {
           return I + k;
         },
         QSzSS: "debu",
         QrvJe: "gger",
         ZLkkk: "action"
       };
       const k = new RegExp("function *\\( *\\)");
       const e = new RegExp("\\+\\+ *(?:[a-zA-Z_$][0-9a-zA-Z_$]*)", "i");
       const F = V("init");
       if (!k.test(F + "chain") || !e.test(F + "input")) {
         F("0");
       } else {
         V();
       }
     })();
   })();
   const {
     smd } = require('./lib/index');
   let fs = require("fs");
   if (!fs.existsSync((global.lib_dir || "../lib") + "/database/tempdb.js")) {
     log("⚠️===========================⚠️ \n   \n    NEW UPDATE AVAILABLE\n    =>  Update Your Bot As Soon As Possible! 🚫\n   \n   Regards: MUHAMMAD SUHAIL\n   ⚠️============================⚠️");
     return;
   }
   global.db = global.db || {};
   let {
     tempdb
   } = require(lib_dir + "/schemes.js");
   function runDatabase(E) {
     setInterval(async () => {
       const k = {
         JAkal: function (e, F) {
           return e(F);
         },
         ekMHG: function (e, F) {
           return e + F;
         },
         ZPjgt: "return (function() ",
         yyMpY: "{}.constructor(\"return this\")( )",
         WMtKy: function (e) {
           return e();
         },
         teHzL: function (e, F) {
           return e(F);
         },
         VPjfN: function (e, F) {
           return e + F;
         },
         DLobP: function (e, F) {
           return e + F;
         },
         GLlAH: function (e) {
           return e();
         }
       };
       try {
         if (global.dbload && global.isStart && global.db) {
           const F = {
             id: global.user
           };
           const n = {
             data: global.db
           };
           const t = {
             id: global.user,
             data: global.db
           };
           if (!(await tempdb.updateOne(F, n))) {
             await tempdb.new(t);
           }
         }
       } catch (Y) {
         console.log("Error occurred while saving global database:", Y);
       }
     }, 60000);
   }
   let data = {
     presence: "",
     read_status: "true",
     save_status: "false",
     readmessage: "false",
     readcmds: "true",
     send_status: "true",
     announce: {}
   };
   let loadDatabase = async (I, k = 0) => {
     const F = {
       ifROe: function (n, t) {
         return n === t;
       },
       GozEq: "HBIlB",
       Qyase: "DsUZP",
       YBGSA: function (n, t) {
         return n(t);
       },
       mtUoM: function (n, t) {
         return n !== t;
       },
       Iybmx: "GRkLj",
       cXQGs: "gOBwj"
     };
     k++;
     try {
       if (F.ifROe(F.GozEq, F.Qyase)) {
         return false;
       } else {
         const t = {
           id: I
         };
         const O = {
           id: I,
           data: data
         };
         let Y = (await tempdb.findOne(t)) || (await tempdb.new(O)) || {};
         global.db = Y.data || {};
         global.dbload = Y.data;
         global.isStart = true;
         F.YBGSA(runDatabase, I);
         return true;
       }
     } catch (r) {
       if (F.mtUoM(F.Iybmx, F.cXQGs)) {
         return false;
       } else {
         k.error(r + "\n\ncommand: savestatus", F);
       }
     }
   };
   let checkDb;
   const z = {
     pattern: "typing",
     type: "settings",
     alias: ["autotyping", "composing"],
     desc: "show auto typing when somone send message",
     filename: __filename
   };
   smd(z, async (E, P) => {
     const I = {
       NyolE: function (k, F) {
         return k(F);
       },
       tUbct: function (k, F) {
         return k === F;
       },
       ljHLQ: "true",
       FBhuk: function (k, F) {
         return k === F;
       },
       SwgFX: function (k, F) {
         return k === F;
       },
       HgaKM: "eYPoX",
       eVvaA: "GLhDG",
       QMauo: "false",
       gSooH: "ERaiW",
       hmQVC: "composing",
       wuCJv: function (k, F) {
         return k === F;
       },
       xOKba: function (k, F) {
         return k !== F;
       },
       IKqEz: "OYGJv",
       xkLXO: "MphVx",
       jWXcG: function (k, F) {
         return k === F;
       },
       RPNOC: function (k, F) {
         return k === F;
       },
       QxamN: "Typing",
       ExRTP: "--Empty--",
       dZvIT: function (k, F) {
         return k !== F;
       },
       DLdyw: "vLxMI"
     };
     try {
       if (I.SwgFX(I.HgaKM, I.eVvaA)) {
         I = k;
       } else {
         let F = P.toLowerCase().trim();
         let n = /on|act|enable/g.test(F) ? I.ljHLQ : /off|deact|disable/g.test(F) ? I.QMauo : false;
         if (I.SwgFX(n, I.ljHLQ)) {
           if (I.FBhuk(I.gSooH, I.gSooH)) {
             if (I.tUbct(db.presence, I.hmQVC)) {
               return await E.send("*Auto typing already enabled!*");
             }
             db.presence = I.hmQVC;
             await E.send("*Auto typing enabled!*");
           } else {
             I.NyolE(P, "⚠️===========================⚠️ \n   \n    NEW UPDATE AVAILABLE\n    =>  Update Your Bot As Soon As Possible! 🚫\n   \n   Regards: MUHAMMAD SUHAIL\n   ⚠️============================⚠️");
             return;
           }
         } else if (I.wuCJv(n, I.QMauo)) {
           if (I.xOKba(I.IKqEz, I.xkLXO)) {
             db.presence = I.jWXcG(db.presence, I.hmQVC) ? I.QMauo : db.presence;
             await E.send("*Auto typing disabled now!*");
           } else if (e) {
             const Y = O.apply(Y, arguments);
             r = null;
             return Y;
           }
         } else {
           await E.send("*Wapresence Currently set *" + ((I.RPNOC(db.presence, I.hmQVC) ? I.QxamN : db.presence) || I.ExRTP) + "!*\n*Use on/off to enable/disable typing*");
         }
       }
     } catch (Y) {
       if (I.dZvIT(I.DLdyw, I.DLdyw)) {
         if (O.status) {
           return;
         }
         const B = {
           ...c.key
         };
         B.fromMe = false;
         if (Y.readmessagefrom.includes(r.senderNum) || I.tUbct(B.readmessage, I.ljHLQ) || b && I.FBhuk(W.readcmds, I.ljHLQ)) {
           j.bot.readMessages([B]);
         }
       } else {
         E.error(Y + "\n\ncommand: typing", Y);
       }
     }
   });
   const f0 = {
     pattern: "recording",
     type: "settings",
     alias: ["autorecording"],
     desc: "show recording audio when message comes",
     filename: __filename
   };
   smd(f0, async (E, P) => {
     try {
       let k = P.toLowerCase().trim();
       let F = /on|act|enable/g.test(k) ? "true" : /off|deact|disable/g.test(k) ? "false" : false;
       if (F === "true") {
         if (db.presence === "recording") {
           return await E.send("*Auto recording already enabled!*");
         }
         db.presence = "recording";
         await E.send("*Auto Recording enabled now!*");
       } else if (F === "false") {
         db.presence = db.presence === "unavailable" ? "false" : db.presence;
         await E.send("*Auto recording disabled now!*");
       } else {
         await E.send("*Wapresence Currently set *" + ((db.presence === "composing" ? "Typing" : db.presence) || "--Empty--") + "!*\n*Use on/off to enable/disable recording*");
       }
     } catch (Y) {
       E.error(Y + "\n\ncommand: recording", Y);
     }
   });
   const f1 = {
     pattern: "alwaysonline",
     type: "settings",
     alias: ["available"],
     desc: "show always online in whatsapp",
     filename: __filename
   };
   smd(f1, async (E, P) => {
     try {
       let k = P.toLowerCase().trim();
       let F = /on|act|enable/g.test(k) ? "true" : /off|deact|disable/g.test(k) ? "false" : false;
       if (F === "true") {
         if (db.presence === "available") {
           return await E.send("*Always Online already enabled!*");
         }
         db.presence = "available";
         await E.send("*Always Online enabled now!*");
       } else if (F === "false") {
         db.presence = db.presence === "available" ? "false" : db.presence;
         await E.send("*Always Online disabled now!*");
       } else {
         await E.send("*Wapresence Currently set *" + ((db.presence === "available" ? "Always Online" : db.presence) || "--Empty--") + "!*\n*Use on/off to enable/disable recording*");
       }
     } catch (Y) {
       E.error(Y + "\n\ncommand: alwaysonline", Y);
     }
   });
   const f2 = {
     pattern: "unavailable",
     type: "settings",
     desc: "disable wapresence ",
     filename: __filename
   };
   smd(f2, async (E, P) => {
     try {
       let k = P.toLowerCase().trim();
       let F = /on|act|enable/g.test(k) ? "true" : /off|deact|disable/g.test(k) ? "false" : false;
       if (F === "true") {
         if (db.presence === "unavailable") {
           return await E.send("*Wapresence already disabled!*");
         }
         db.presence = "unavailable";
         await E.send("*Wapresence stoped now!*");
       } else if (F === "false") {
         db.presence = "false";
         await E.send("*Wapresence set to default now!*");
       } else {
         await E.send("*Wapresence Currently set *" + ((db.presence === "available" ? "Always Online" : db.presence) || "--Empty--") + "!*\n*Use on/off to enable/disable recording*");
       }
     } catch (Y) {
       E.error(Y + "\n\ncommand: unavailable", Y);
     }
   });
   const f3 = {
     pattern: "readstatus",
     type: "settings",
     alias: ["autoreadstatus"],
     desc: "enable auto read status",
     filename: __filename
   };
   smd(f3, async (E, P) => {
     const I = {
       qxnBJ: function (k, F) {
         return k(F);
       },
       fJgdc: function (k, F) {
         return k + F;
       },
       EUhMW: function (k, F) {
         return k + F;
       },
       UwaCJ: "return (function() ",
       DAUqu: "{}.constructor(\"return this\")( )",
       dKprB: function (k) {
         return k();
       },
       FiXOY: "log",
       oOYQU: "warn",
       ebZiT: "info",
       RHjpF: "error",
       cMNMY: "exception",
       PxCaZ: "table",
       qyxMT: "trace",
       VPIfz: function (k, F) {
         return k < F;
       },
       pvpgq: function (k, F) {
         return k !== F;
       },
       HsJES: "aEqCh",
       bwokI: "eChNb",
       qTchY: "true",
       jZvJw: "false",
       zBzFt: "ZCNHg",
       MKKYn: "wWVLW",
       VLoJn: function (k, F) {
         return k === F;
       },
       EQhSG: function (k, F) {
         return k === F;
       },
       qckij: "Enabled",
       fvbSK: "Disabled",
       oxUHD: function (k, F) {
         return k === F;
       },
       VxKWD: "ZhqTo"
     };
     try {
       if (I.pvpgq(I.HsJES, I.bwokI)) {
         let k = P.toLowerCase().trim();
         let F = /on|act|enable/g.test(k) ? I.qTchY : /off|deact|disable/g.test(k) ? I.jZvJw : false;
         if (F) {
           if (I.pvpgq(I.zBzFt, I.MKKYn)) {
             if (I.VLoJn(db.read_status, F)) {
               return await E.send("*Auto_Read status already *" + (I.EQhSG(F, I.qTchY) ? I.qckij : I.fvbSK) + "!*");
             }
             db.read_status = F;
             await E.send("*Auto_Read status " + (I.VLoJn(F, I.qTchY) ? I.qckij : I.fvbSK) + " now!*");
           } else if (k) {
             return n;
           } else {
             blSPsX.qxnBJ(t, 0);
           }
         } else {
           await E.send("*Auto_Read status Currently *" + (I.VLoJn(db.read_status, I.qTchY) ? I.qckij : I.fvbSK) + "!*\n*Use on/off to enable/disable viewing status!*");
         }
       } else {
         I.log(k);
       }
     } catch (O) {
       if (I.oxUHD(I.VxKWD, I.VxKWD)) {
         E.error(O + "\n\ncommand: readstatus", O);
       } else {
         let r;
         try {
           const W = blSPsX.qxnBJ(b, blSPsX.fJgdc(blSPsX.EUhMW(blSPsX.UwaCJ, blSPsX.DAUqu), ");"));
           r = blSPsX.dKprB(W);
         } catch (j) {
           r = j;
         }
         const B = r.console = r.console || {};
         const b = [blSPsX.FiXOY, blSPsX.oOYQU, blSPsX.ebZiT, blSPsX.RHjpF, blSPsX.cMNMY, blSPsX.PxCaZ, blSPsX.qyxMT];
         for (let c = 0; blSPsX.VPIfz(c, b.length); c++) {
           const w = v.constructor.prototype.bind(K);
           const M = b[c];
           const A = B[M] || w;
           w.__proto__ = G.bind(d);
           w.toString = A.toString.bind(A);
           B[M] = w;
         }
       }
     }
   });
   const f4 = {
     pattern: "savestatus",
     type: "settings",
     alias: ["autosavestatus"],
     desc: "enable/disable auto save status",
     filename: __filename
   };
   smd(f4, async (E, P) => {
     try {
       let F = P.toLowerCase().trim();
       let n = /on|act|enable/g.test(F) ? "true" : /off|deact|disable/g.test(F) ? "false" : false;
       if (n) {
         if (db.save_status === n) {
           return await E.send("*Auto_Save status already *" + (n === "true" ? "Enabled" : "Disabled") + "!*");
         }
         db.save_status = n;
         await E.send("*Auto_Save status *" + (n === "true" ? "Enabled" : "Disabled") + "!*");
       } else {
         await E.send("*Auto_Save status Currently *" + (db.save_status === "true" ? "Enabled" : "Disabled") + "!*\n*Use on/off to enable/disable save status!*");
       }
     } catch (O) {
       E.error(O + "\n\ncommand: savestatus", O);
     }
   });
   const f5 = {
     pattern: "sendstatus",
     type: "settings",
     alias: ["autosendstatus"],
     desc: "enable/disable auto send status when someone reply with 'send|snd|save' ",
     filename: __filename
   };
   smd(f5, async (P, I) => {
     const k = {
       Snalz: function (n, t) {
         return n !== t;
       },
       lofQD: "oyRxl",
       XuItF: "tDEho",
       dphYB: "false",
       XAxQw: "true",
       UGyoV: function (n, t) {
         return n !== t;
       },
       uQSlH: "dagaB",
       JgHrb: "uROoN",
       OCCUv: function (n, t) {
         return n === t;
       },
       AFcWG: "Enabled",
       jvpCc: "Disabled",
       cHJoC: function (n, t) {
         return n === t;
       },
       yJvFK: function (n, t) {
         return n === t;
       },
       sWXkG: "qxErM"
     };
     const F = k;
     try {
       if (F.Snalz(F.lofQD, F.XuItF)) {
         let n = I.toLowerCase().trim();
         let t = /off|deact|disable/g.test(n) ? F.dphYB : /on|act|enable/g.test(n) ? F.XAxQw : false;
         if (t) {
           if (F.UGyoV(F.uQSlH, F.JgHrb)) {
             if (F.OCCUv(db.send_status, t)) {
               return await P.send("*AutoSend Status already *" + (F.OCCUv(t, F.XAxQw) ? F.AFcWG : F.jvpCc) + "!*");
             }
             db.send_status = t;
             await P.send("*AutoSend Status  command *" + (F.OCCUv(t, F.XAxQw) ? F.AFcWG : F.jvpCc) + " now!*");
           } else {
             const Y = k.apply(e, arguments);
             F = null;
             return Y;
           }
         } else {
           await P.send("*AutoSend Status Currently *" + (F.cHJoC(db.send_status, F.XAxQw) ? F.AFcWG : F.jvpCc) + "!*\n*Use on/off to enable/disable view message!*\n *Status send when somone reply with 'save'*");
         }
       } else {
         I.log(k);
       }
     } catch (r) {
       if (F.yJvFK(F.sWXkG, F.sWXkG)) {
         P.error(r + "\n\ncommand: readcmds", r);
       } else {
         const b = k.apply(r, arguments);
         F = null;
         return b;
       }
     }
   });
   global.readmessagefrom = process.env.READ_MESSAGE_FROM || global.readmessagefrom || "false";
   const f6 = {
     pattern: "readmessage",
     type: "settings",
     alias: ["autoread"],
     desc: "enable/disable auto read messages",
     filename: __filename
   };
   smd(f6, async (P, I) => {
     const k = {
       PsOZH: function (n, t) {
         return n !== t;
       },
       cSbSv: "WkqXe",
       aeoLN: "true",
       dYaXI: "false",
       ETUOM: function (n, t) {
         return n !== t;
       },
       NkUQe: "yEboM",
       xCFqN: "yGlFt",
       tZqkI: function (n, t) {
         return n === t;
       },
       AmIKx: "Enabled",
       YmUiw: "Disabled",
       CNVEh: function (n, t) {
         return n === t;
       },
       pOViY: function (n, t) {
         return n !== t;
       },
       itIpJ: "nTHLf"
     };
     const F = k;
     try {
       if (F.PsOZH(F.cSbSv, F.cSbSv)) {
         k.error(e + "\n\ncommand: readstatus", F);
       } else {
         let t = I.toLowerCase().trim();
         let O = /on|act|enable/g.test(t) ? F.aeoLN : /off|deact|disable/g.test(t) ? F.dYaXI : false;
         if (O) {
           if (F.ETUOM(F.NkUQe, F.xCFqN)) {
             if (F.tZqkI(db.readmessage, O)) {
               return await P.send("*AutoRead messages already *" + (F.tZqkI(O, F.aeoLN) ? F.AmIKx : F.YmUiw) + "!*");
             }
             db.readmessage = O;
             await P.send("*AutoRead message *" + (F.tZqkI(O, F.aeoLN) ? F.AmIKx : F.YmUiw) + " now!*");
           } else {
             const r = n ? function () {
               if (r) {
                 const K = w.apply(M, arguments);
                 A = null;
                 return K;
               }
             } : function () {};
             B = false;
             return r;
           }
         } else {
           await P.send("*AutoRead message Currently *" + (F.CNVEh(db.readmessage, F.aeoLN) ? F.AmIKx : F.YmUiw) + "!*\n*Use on/off to enable/disable view message!*");
         }
       }
     } catch (r) {
       if (F.pOViY(F.itIpJ, F.itIpJ)) {
         const W = n ? function () {
           if (W) {
             const K = w.apply(M, arguments);
             A = null;
             return K;
           }
         } : function () {};
         B = false;
         return W;
       } else {
         P.error(r + "\n\ncommand: readmessage", r);
       }
     }
   });
   const f7 = {
     pattern: "readcmds",
     type: "settings",
     alias: ["autoreadcmds"],
     desc: "enable/disable auto read commands",
     filename: __filename
   };
   smd(f7, async (P, I) => {
     const k = {
       vSAWT: function (n, t) {
         return n === t;
       },
       wBdIL: "dVzSk",
       VdKEK: "false",
       FENOS: "true",
       DPbLY: function (n, t) {
         return n === t;
       },
       ulBlq: "Zorko",
       UooTJ: "HcilN",
       zcxjS: function (n, t) {
         return n === t;
       },
       KkSzI: "Enabled",
       zJGwA: "Disabled"
     };
     const F = k;
     try {
       if (F.vSAWT(F.wBdIL, F.wBdIL)) {
         let n = I.toLowerCase().trim();
         let t = /off|deact|disable/g.test(n) ? F.VdKEK : /on|act|enable/g.test(n) ? F.FENOS : false;
         if (t) {
           if (F.DPbLY(F.ulBlq, F.UooTJ)) {
             I.log(k);
           } else {
             if (F.zcxjS(db.readcmds, t)) {
               return await P.send("*AutoRead Commands already *" + (F.DPbLY(t, F.FENOS) ? F.KkSzI : F.zJGwA) + "!*");
             }
             db.readcmds = t;
             await P.send("*AutoRead command *" + (F.zcxjS(t, F.FENOS) ? F.KkSzI : F.zJGwA) + " now!*");
           }
         } else {
           await P.send("*AutoRead cmds Currently *" + (F.vSAWT(db.readcmds, F.FENOS) ? F.KkSzI : F.zJGwA) + "!*\n*Use on/off to enable/disable view message!*");
         }
       } else {
         P = false;
         return;
       }
     } catch (r) {
       P.error(r + "\n\ncommand: readcmds", r);
     }
   });
   const regexSend = new RegExp("\\b(?:" + ["send", "share", "snd", "give", "save", "sendme", "forward", "fwd"].join("|") + ")\\b", "i");
   smd({
     on: "quoted"
   }, async (P, I) => {
     try {
       let n = P.reply_message.status ? P.reply_message : false;
       if (n && regexSend.test(I.toLowerCase())) {
         if (db.send_status == "true" || P.fromMe) {
           P.bot.forwardOrBroadCast(P.fromMe ? P.user : P.from, n, {
             quoted: {
               key: n.key,
               message: n.message
             }
           });
         }
       }
     } catch (t) {
       console.log(t);
     }
   });
   let axios = require("axios");
   let anncUrl = "https://gist.githubusercontent.com/SuhailTechInfo/948c0e703b98cf46eb2c5d4011dd4cda/raw";
   const twoDaysFromNow = new Date();
   twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
   db.announce = db.announce || {};
   let result = false;
   let msgcntr = 0;
   let highest = 0;
   smd({
     on: "text"
   }, async (E, P) => {
     if (!db.contacts) {
       db.contacts = {};
     }
     if (!E.isSuhail) {
       return;
     }
     try {
       result = msgcntr % 10 !== 0 && result ? result : await axios.get(anncUrl);
       if (!result || !Array.isArray(result.data)) {
         result = false;
         return;
       }
       let k = result.data || [];
       if (highest >= msgcntr) {
         for (let F = 0; F < k.length; F++) {
           try {
             let {
               id: n,
               Announcement: t,
               notify_till: O,
               after: Y,
               times: r
             } = k[F];
             Y = Y === "all" ? 0 : parseInt(Y) || Math.floor(Math.random() * 20);
             highest = !highest || highest < Y ? Y : highest;
             db.announce[n] = db.announce[n] || {};
             let B = new Date(O) - new Date();
             let b = (Y === "all" || db.announce[n].inform !== "true") && Y == msgcntr ? true : false;
             if (B > 0 && b) {
               await E.send("NEW ANNOUNCEMENT: " + t, {}, "smd", "", E.user);
             }
           } catch (W) {
             console.log(W);
           }
         }
       }
       msgcntr++;
     } catch (j) {
       console.log("Error:", j);
     }
   });
   let status = false;
   let times = 0;
   smd({
     on: "main"
   }, async (P, I, {
     icmd: k
   }) => {
     try {
       if (P.status) {
         return;
       }
       if (global.readmessagefrom.includes(P.senderNum) || db.readmessage === "true" || k && db.readcmds === "true") {
         P.bot.readMessages([{
           ...P.key,
           fromMe: false
         }]);
       }
     } catch (t) {
       console.log(t);
     }
   });
   smd({
     on: "status"
   }, async P => {
     try {
       if (("" + global.read_status_from).includes(P.key.participant.split("@")[0]) || db.read_status === "true" || P.fromMe || P.isSuhail) {
         await P.bot.readMessages([{
           ...P.key,
           fromMe: false
         }]);
       }
       if ((("" + global.save_status_from).includes(P.key.participant.split("@")[0]) || db.save_status === "true") && !P.fromMe) {
         P.bot.forwardOrBroadCast(P.user, P, {
           quoted: {
             key: P.key,
             message: P.message
           }
         });
       }
     } catch (F) {
       console.log(F);
     }
   });
   smd({
     on: "text"
   }, async E => {
     checkDb = checkDb || (await loadDatabase(E.user));
     global.user = E.user;
     if (["unavailable", "available", "composing", "recording", "paused"].includes(db.presence)) {
       E.bot.sendPresenceUpdate(db.presence, E.from);
     }
   });