var Be = Object.defineProperty;
var qe = (F, T, k) => T in F ? Be(F, T, { enumerable: !0, configurable: !0, writable: !0, value: k }) : F[T] = k;
var be = (F, T, k) => qe(F, typeof T != "symbol" ? T + "" : T, k);
import { app as ke, BrowserWindow as Fe, ipcMain as De } from "electron";
import { createRequire as Ge } from "node:module";
import { fileURLToPath as Ve } from "node:url";
import de from "node:path";
import $e from "node:fs/promises";
import Ke from "stream";
import Ae from "path";
import Le from "fs";
import Ne from "pdfkit";
var Ye = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Xe(F) {
  return F && F.__esModule && Object.prototype.hasOwnProperty.call(F, "default") ? F.default : F;
}
var je = { exports: {} };
/* @license
Papa Parse
v5.5.2
https://github.com/mholt/PapaParse
License: MIT
*/
(function(F, T) {
  (function(k, h) {
    F.exports = h();
  })(Ye, function k() {
    var h = /* @__PURE__ */ function() {
      return typeof self < "u" ? self : typeof window < "u" ? window : typeof h < "u" ? h : {};
    }();
    function K() {
      var e = h.URL || h.webkitURL || null, t = k.toString();
      return i.BLOB_URL || (i.BLOB_URL = e.createObjectURL(new Blob(["var global = (function() { if (typeof self !== 'undefined') { return self; } if (typeof window !== 'undefined') { return window; } if (typeof global !== 'undefined') { return global; } return {}; })(); global.IS_PAPA_WORKER=true; ", "(", t, ")();"], { type: "text/javascript" })));
    }
    var u = !h.document && !!h.postMessage, n = h.IS_PAPA_WORKER || !1, x = {}, te = 0, i = {};
    if (i.parse = g, i.unparse = b, i.RECORD_SEP = "", i.UNIT_SEP = "", i.BYTE_ORDER_MARK = "\uFEFF", i.BAD_DELIMITERS = ["\r", `
`, '"', i.BYTE_ORDER_MARK], i.WORKERS_SUPPORTED = !u && !!h.Worker, i.NODE_STREAM_INPUT = 1, i.LocalChunkSize = 1024 * 1024 * 10, i.RemoteChunkSize = 1024 * 1024 * 5, i.DefaultDelimiter = ",", i.Parser = ee, i.ParserHandle = Y, i.NetworkStreamer = L, i.FileStreamer = O, i.StringStreamer = c, i.ReadableStreamStreamer = B, typeof PAPA_BROWSER_CONTEXT > "u" && (i.DuplexStreamStreamer = P), h.jQuery) {
      var U = h.jQuery;
      U.fn.parse = function(e) {
        var t = e.config || {}, r = [];
        return this.each(function(d) {
          var a = U(this).prop("tagName").toUpperCase() === "INPUT" && U(this).attr("type").toLowerCase() === "file" && h.FileReader;
          if (!a || !this.files || this.files.length === 0)
            return !0;
          for (var S = 0; S < this.files.length; S++)
            r.push({
              file: this.files[S],
              inputElem: this,
              instanceConfig: U.extend({}, t)
            });
        }), s(), this;
        function s() {
          if (r.length === 0) {
            l(e.complete) && e.complete();
            return;
          }
          var d = r[0];
          if (l(e.before)) {
            var a = e.before(d.file, d.inputElem);
            if (typeof a == "object")
              if (a.action === "abort") {
                o("AbortError", d.file, d.inputElem, a.reason);
                return;
              } else if (a.action === "skip") {
                v();
                return;
              } else typeof a.config == "object" && (d.instanceConfig = U.extend(d.instanceConfig, a.config));
            else if (a === "skip") {
              v();
              return;
            }
          }
          var S = d.instanceConfig.complete;
          d.instanceConfig.complete = function(j) {
            l(S) && S(j, d.file, d.inputElem), v();
          }, i.parse(d.file, d.instanceConfig);
        }
        function o(d, a, S, j) {
          l(e.error) && e.error({ name: d }, a, S, j);
        }
        function v() {
          r.splice(0, 1), s();
        }
      };
    }
    n && (h.onmessage = _e);
    function g(e, t) {
      t = t || {};
      var r = t.dynamicTyping || !1;
      if (l(r) && (t.dynamicTypingFunction = r, r = {}), t.dynamicTyping = r, t.transform = l(t.transform) ? t.transform : !1, t.worker && i.WORKERS_SUPPORTED) {
        var s = G();
        s.userStep = t.step, s.userChunk = t.chunk, s.userComplete = t.complete, s.userError = t.error, t.step = l(t.step), t.chunk = l(t.chunk), t.complete = l(t.complete), t.error = l(t.error), delete t.worker, s.postMessage({
          input: e,
          config: t,
          workerId: s.id
        });
        return;
      }
      var o = null;
      if (e === i.NODE_STREAM_INPUT && typeof PAPA_BROWSER_CONTEXT > "u")
        return o = new P(t), o.getStream();
      return typeof e == "string" ? (e = v(e), t.download ? o = new L(t) : o = new c(t)) : e.readable === !0 && l(e.read) && l(e.on) ? o = new B(t) : (h.File && e instanceof File || e instanceof Object) && (o = new O(t)), o.stream(e);
      function v(d) {
        return d.charCodeAt(0) === 65279 ? d.slice(1) : d;
      }
    }
    function b(e, t) {
      var r = !1, s = !0, o = ",", v = `\r
`, d = '"', a = d + d, S = !1, j = null, q = !1;
      ne();
      var y = new RegExp(E(d), "g");
      if (typeof e == "string" && (e = JSON.parse(e)), Array.isArray(e)) {
        if (!e.length || Array.isArray(e[0]))
          return p(null, e, S);
        if (typeof e[0] == "object")
          return p(j || Object.keys(e[0]), e, S);
      } else if (typeof e == "object")
        return typeof e.data == "string" && (e.data = JSON.parse(e.data)), Array.isArray(e.data) && (e.fields || (e.fields = e.meta && e.meta.fields || j), e.fields || (e.fields = Array.isArray(e.data[0]) ? e.fields : typeof e.data[0] == "object" ? Object.keys(e.data[0]) : []), !Array.isArray(e.data[0]) && typeof e.data[0] != "object" && (e.data = [e.data])), p(e.fields || [], e.data || [], S);
      throw new Error("Unable to serialize unrecognized input");
      function ne() {
        if (typeof t == "object") {
          if (typeof t.delimiter == "string" && !i.BAD_DELIMITERS.filter(function(R) {
            return t.delimiter.indexOf(R) !== -1;
          }).length && (o = t.delimiter), (typeof t.quotes == "boolean" || typeof t.quotes == "function" || Array.isArray(t.quotes)) && (r = t.quotes), (typeof t.skipEmptyLines == "boolean" || typeof t.skipEmptyLines == "string") && (S = t.skipEmptyLines), typeof t.newline == "string" && (v = t.newline), typeof t.quoteChar == "string" && (d = t.quoteChar), typeof t.header == "boolean" && (s = t.header), Array.isArray(t.columns)) {
            if (t.columns.length === 0) throw new Error("Option columns is empty");
            j = t.columns;
          }
          t.escapeChar !== void 0 && (a = t.escapeChar + d), t.escapeFormulae instanceof RegExp ? q = t.escapeFormulae : typeof t.escapeFormulae == "boolean" && t.escapeFormulae && (q = /^[=+\-@\t\r].*$/);
        }
      }
      function p(R, I, H) {
        var W = "";
        typeof R == "string" && (R = JSON.parse(R)), typeof I == "string" && (I = JSON.parse(I));
        var ae = Array.isArray(R) && R.length > 0, X = !Array.isArray(I[0]);
        if (ae && s) {
          for (var oe = 0; oe < R.length; oe++)
            oe > 0 && (W += o), W += w(R[oe], oe);
          I.length > 0 && (W += v);
        }
        for (var A = 0; A < I.length; A++) {
          var pe = ae ? R.length : I[A].length, he = !1, _ = ae ? Object.keys(I[A]).length === 0 : I[A].length === 0;
          if (H && !ae && (he = H === "greedy" ? I[A].join("").trim() === "" : I[A].length === 1 && I[A][0].length === 0), H === "greedy" && ae) {
            for (var m = [], C = 0; C < pe; C++) {
              var M = X ? R[C] : C;
              m.push(I[A][M]);
            }
            he = m.join("").trim() === "";
          }
          if (!he) {
            for (var f = 0; f < pe; f++) {
              f > 0 && !_ && (W += o);
              var $ = ae && X ? R[f] : f;
              W += w(I[A][$], f);
            }
            A < I.length - 1 && (!H || pe > 0 && !_) && (W += v);
          }
        }
        return W;
      }
      function w(R, I) {
        if (typeof R > "u" || R === null)
          return "";
        if (R.constructor === Date)
          return JSON.stringify(R).slice(1, 25);
        var H = !1;
        q && typeof R == "string" && q.test(R) && (R = "'" + R, H = !0);
        var W = R.toString().replace(y, a);
        return H = H || r === !0 || typeof r == "function" && r(R, I) || Array.isArray(r) && r[I] || we(W, i.BAD_DELIMITERS) || W.indexOf(o) > -1 || W.charAt(0) === " " || W.charAt(W.length - 1) === " ", H ? d + W + d : W;
      }
      function we(R, I) {
        for (var H = 0; H < I.length; H++)
          if (R.indexOf(I[H]) > -1)
            return !0;
        return !1;
      }
    }
    function D(e) {
      this._handle = null, this._finished = !1, this._completed = !1, this._halted = !1, this._input = null, this._baseIndex = 0, this._partialLine = "", this._rowCount = 0, this._start = 0, this._nextChunk = null, this.isFirstChunk = !0, this._completeResults = {
        data: [],
        errors: [],
        meta: {}
      }, t.call(this, e), this.parseChunk = function(r, s) {
        const o = parseInt(this._config.skipFirstNLines) || 0;
        if (this.isFirstChunk && o > 0) {
          let q = this._config.newline;
          if (!q) {
            const ne = this._config.quoteChar || '"';
            q = this._handle.guessLineEndings(r, ne);
          }
          r = [...r.split(q).slice(o)].join(q);
        }
        if (this.isFirstChunk && l(this._config.beforeFirstChunk)) {
          var v = this._config.beforeFirstChunk(r);
          v !== void 0 && (r = v);
        }
        this.isFirstChunk = !1, this._halted = !1;
        var d = this._partialLine + r;
        this._partialLine = "";
        var a = this._handle.parse(d, this._baseIndex, !this._finished);
        if (this._handle.paused() || this._handle.aborted()) {
          this._halted = !0;
          return;
        }
        var S = a.meta.cursor;
        this._finished || (this._partialLine = d.substring(S - this._baseIndex), this._baseIndex = S), a && a.data && (this._rowCount += a.data.length);
        var j = this._finished || this._config.preview && this._rowCount >= this._config.preview;
        if (n)
          h.postMessage({
            results: a,
            workerId: i.WORKER_ID,
            finished: j
          });
        else if (l(this._config.chunk) && !s) {
          if (this._config.chunk(a, this._handle), this._handle.paused() || this._handle.aborted()) {
            this._halted = !0;
            return;
          }
          a = void 0, this._completeResults = void 0;
        }
        return !this._config.step && !this._config.chunk && (this._completeResults.data = this._completeResults.data.concat(a.data), this._completeResults.errors = this._completeResults.errors.concat(a.errors), this._completeResults.meta = a.meta), !this._completed && j && l(this._config.complete) && (!a || !a.meta.aborted) && (this._config.complete(this._completeResults, this._input), this._completed = !0), !j && (!a || !a.meta.paused) && this._nextChunk(), a;
      }, this._sendError = function(r) {
        l(this._config.error) ? this._config.error(r) : n && this._config.error && h.postMessage({
          workerId: i.WORKER_ID,
          error: r,
          finished: !1
        });
      };
      function t(r) {
        var s = ie(r);
        s.chunkSize = parseInt(s.chunkSize), !r.step && !r.chunk && (s.chunkSize = null), this._handle = new Y(s), this._handle.streamer = this, this._config = s;
      }
    }
    function L(e) {
      e = e || {}, e.chunkSize || (e.chunkSize = i.RemoteChunkSize), D.call(this, e);
      var t;
      u ? this._nextChunk = function() {
        this._readChunk(), this._chunkLoaded();
      } : this._nextChunk = function() {
        this._readChunk();
      }, this.stream = function(s) {
        this._input = s, this._nextChunk();
      }, this._readChunk = function() {
        if (this._finished) {
          this._chunkLoaded();
          return;
        }
        if (t = new XMLHttpRequest(), this._config.withCredentials && (t.withCredentials = this._config.withCredentials), u || (t.onload = N(this._chunkLoaded, this), t.onerror = N(this._chunkError, this)), t.open(this._config.downloadRequestBody ? "POST" : "GET", this._input, !u), this._config.downloadRequestHeaders) {
          var s = this._config.downloadRequestHeaders;
          for (var o in s)
            t.setRequestHeader(o, s[o]);
        }
        if (this._config.chunkSize) {
          var v = this._start + this._config.chunkSize - 1;
          t.setRequestHeader("Range", "bytes=" + this._start + "-" + v);
        }
        try {
          t.send(this._config.downloadRequestBody);
        } catch (d) {
          this._chunkError(d.message);
        }
        u && t.status === 0 && this._chunkError();
      }, this._chunkLoaded = function() {
        if (t.readyState === 4) {
          if (t.status < 200 || t.status >= 400) {
            this._chunkError();
            return;
          }
          this._start += this._config.chunkSize ? this._config.chunkSize : t.responseText.length, this._finished = !this._config.chunkSize || this._start >= r(t), this.parseChunk(t.responseText);
        }
      }, this._chunkError = function(s) {
        var o = t.statusText || s;
        this._sendError(new Error(o));
      };
      function r(s) {
        var o = s.getResponseHeader("Content-Range");
        return o === null ? -1 : parseInt(o.substring(o.lastIndexOf("/") + 1));
      }
    }
    L.prototype = Object.create(D.prototype), L.prototype.constructor = L;
    function O(e) {
      e = e || {}, e.chunkSize || (e.chunkSize = i.LocalChunkSize), D.call(this, e);
      var t, r, s = typeof FileReader < "u";
      this.stream = function(o) {
        this._input = o, r = o.slice || o.webkitSlice || o.mozSlice, s ? (t = new FileReader(), t.onload = N(this._chunkLoaded, this), t.onerror = N(this._chunkError, this)) : t = new FileReaderSync(), this._nextChunk();
      }, this._nextChunk = function() {
        !this._finished && (!this._config.preview || this._rowCount < this._config.preview) && this._readChunk();
      }, this._readChunk = function() {
        var o = this._input;
        if (this._config.chunkSize) {
          var v = Math.min(this._start + this._config.chunkSize, this._input.size);
          o = r.call(o, this._start, v);
        }
        var d = t.readAsText(o, this._config.encoding);
        s || this._chunkLoaded({ target: { result: d } });
      }, this._chunkLoaded = function(o) {
        this._start += this._config.chunkSize, this._finished = !this._config.chunkSize || this._start >= this._input.size, this.parseChunk(o.target.result);
      }, this._chunkError = function() {
        this._sendError(t.error);
      };
    }
    O.prototype = Object.create(D.prototype), O.prototype.constructor = O;
    function c(e) {
      e = e || {}, D.call(this, e);
      var t;
      this.stream = function(r) {
        return t = r, this._nextChunk();
      }, this._nextChunk = function() {
        if (!this._finished) {
          var r = this._config.chunkSize, s;
          return r ? (s = t.substring(0, r), t = t.substring(r)) : (s = t, t = ""), this._finished = !t, this.parseChunk(s);
        }
      };
    }
    c.prototype = Object.create(c.prototype), c.prototype.constructor = c;
    function B(e) {
      e = e || {}, D.call(this, e);
      var t = [], r = !0, s = !1;
      this.pause = function() {
        D.prototype.pause.apply(this, arguments), this._input.pause();
      }, this.resume = function() {
        D.prototype.resume.apply(this, arguments), this._input.resume();
      }, this.stream = function(o) {
        this._input = o, this._input.on("data", this._streamData), this._input.on("end", this._streamEnd), this._input.on("error", this._streamError);
      }, this._checkIsFinished = function() {
        s && t.length === 1 && (this._finished = !0);
      }, this._nextChunk = function() {
        this._checkIsFinished(), t.length ? this.parseChunk(t.shift()) : r = !0;
      }, this._streamData = N(function(o) {
        try {
          t.push(typeof o == "string" ? o : o.toString(this._config.encoding)), r && (r = !1, this._checkIsFinished(), this.parseChunk(t.shift()));
        } catch (v) {
          this._streamError(v);
        }
      }, this), this._streamError = N(function(o) {
        this._streamCleanUp(), this._sendError(o);
      }, this), this._streamEnd = N(function() {
        this._streamCleanUp(), s = !0, this._streamData("");
      }, this), this._streamCleanUp = N(function() {
        this._input.removeListener("data", this._streamData), this._input.removeListener("end", this._streamEnd), this._input.removeListener("error", this._streamError);
      }, this);
    }
    B.prototype = Object.create(D.prototype), B.prototype.constructor = B;
    function P(e) {
      var t = Ke.Duplex, r = ie(e), s = !0, o = !1, v = [], d = null;
      this._onCsvData = function(a) {
        var S = a.data;
        !d.push(S) && !this._handle.paused() && this._handle.pause();
      }, this._onCsvComplete = function() {
        d.push(null);
      }, r.step = N(this._onCsvData, this), r.complete = N(this._onCsvComplete, this), D.call(this, r), this._nextChunk = function() {
        o && v.length === 1 && (this._finished = !0), v.length ? v.shift()() : s = !0;
      }, this._addToParseQueue = function(a, S) {
        v.push(N(function() {
          if (this.parseChunk(typeof a == "string" ? a : a.toString(r.encoding)), l(S))
            return S();
        }, this)), s && (s = !1, this._nextChunk());
      }, this._onRead = function() {
        this._handle.paused() && this._handle.resume();
      }, this._onWrite = function(a, S, j) {
        this._addToParseQueue(a, j);
      }, this._onWriteComplete = function() {
        o = !0, this._addToParseQueue("");
      }, this.getStream = function() {
        return d;
      }, d = new t({
        readableObjectMode: !0,
        decodeStrings: !1,
        read: N(this._onRead, this),
        write: N(this._onWrite, this)
      }), d.once("finish", N(this._onWriteComplete, this));
    }
    typeof PAPA_BROWSER_CONTEXT > "u" && (P.prototype = Object.create(D.prototype), P.prototype.constructor = P);
    function Y(e) {
      var t = Math.pow(2, 53), r = -t, s = /^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/, o = /^((\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)))$/, v = this, d = 0, a = 0, S, j, q = !1, y = !1, ne, p = [], w = {
        // The last results returned from the parser
        data: [],
        errors: [],
        meta: {}
      };
      if (l(e.step)) {
        var we = e.step;
        e.step = function(_) {
          if (w = _, W())
            H();
          else {
            if (H(), w.data.length === 0)
              return;
            d += _.data.length, e.preview && d > e.preview ? j.abort() : (w.data = w.data[0], we(w, v));
          }
        };
      }
      this.parse = function(_, m, C) {
        var M = e.quoteChar || '"';
        if (e.newline || (e.newline = this.guessLineEndings(_, M)), ne = !1, e.delimiter)
          l(e.delimiter) && (e.delimiter = e.delimiter(_), w.meta.delimiter = e.delimiter);
        else {
          var f = pe(_, e.newline, e.skipEmptyLines, e.comments, e.delimitersToGuess);
          f.successful ? e.delimiter = f.bestDelimiter : (ne = !0, e.delimiter = i.DefaultDelimiter), w.meta.delimiter = e.delimiter;
        }
        var $ = ie(e);
        return e.preview && e.header && $.preview++, S = _, j = new ee($), w = j.parse(S, m, C), H(), q ? { meta: { paused: !0 } } : w || { meta: { paused: !1 } };
      }, this.paused = function() {
        return q;
      }, this.pause = function() {
        q = !0, j.abort(), S = l(e.chunk) ? "" : S.substring(j.getCharIndex());
      }, this.resume = function() {
        v.streamer._halted ? (q = !1, v.streamer.parseChunk(S, !0)) : setTimeout(v.resume, 3);
      }, this.aborted = function() {
        return y;
      }, this.abort = function() {
        y = !0, j.abort(), w.meta.aborted = !0, l(e.complete) && e.complete(w), S = "";
      }, this.guessLineEndings = function(_, m) {
        _ = _.substring(0, 1024 * 1024);
        var C = new RegExp(E(m) + "([^]*?)" + E(m), "gm");
        _ = _.replace(C, "");
        var M = _.split("\r"), f = _.split(`
`), $ = f.length > 1 && f[0].length < M[0].length;
        if (M.length === 1 || $)
          return `
`;
        for (var Q = 0, V = 0; V < M.length; V++)
          M[V][0] === `
` && Q++;
        return Q >= M.length / 2 ? `\r
` : "\r";
      };
      function R(_) {
        return e.skipEmptyLines === "greedy" ? _.join("").trim() === "" : _.length === 1 && _[0].length === 0;
      }
      function I(_) {
        if (s.test(_)) {
          var m = parseFloat(_);
          if (m > r && m < t)
            return !0;
        }
        return !1;
      }
      function H() {
        return w && ne && (he("Delimiter", "UndetectableDelimiter", "Unable to auto-detect delimiting character; defaulted to '" + i.DefaultDelimiter + "'"), ne = !1), e.skipEmptyLines && (w.data = w.data.filter(function(_) {
          return !R(_);
        })), W() && ae(), A();
      }
      function W() {
        return e.header && p.length === 0;
      }
      function ae() {
        if (!w)
          return;
        function _(C, M) {
          l(e.transformHeader) && (C = e.transformHeader(C, M)), p.push(C);
        }
        if (Array.isArray(w.data[0])) {
          for (var m = 0; W() && m < w.data.length; m++)
            w.data[m].forEach(_);
          w.data.splice(0, 1);
        } else
          w.data.forEach(_);
      }
      function X(_) {
        return e.dynamicTypingFunction && e.dynamicTyping[_] === void 0 && (e.dynamicTyping[_] = e.dynamicTypingFunction(_)), (e.dynamicTyping[_] || e.dynamicTyping) === !0;
      }
      function oe(_, m) {
        return X(_) ? m === "true" || m === "TRUE" ? !0 : m === "false" || m === "FALSE" ? !1 : I(m) ? parseFloat(m) : o.test(m) ? new Date(m) : m === "" ? null : m : m;
      }
      function A() {
        if (!w || !e.header && !e.dynamicTyping && !e.transform)
          return w;
        function _(C, M) {
          var f = e.header ? {} : [], $;
          for ($ = 0; $ < C.length; $++) {
            var Q = $, V = C[$];
            e.header && (Q = $ >= p.length ? "__parsed_extra" : p[$]), e.transform && (V = e.transform(V, Q)), V = oe(Q, V), Q === "__parsed_extra" ? (f[Q] = f[Q] || [], f[Q].push(V)) : f[Q] = V;
          }
          return e.header && ($ > p.length ? he("FieldMismatch", "TooManyFields", "Too many fields: expected " + p.length + " fields but parsed " + $, a + M) : $ < p.length && he("FieldMismatch", "TooFewFields", "Too few fields: expected " + p.length + " fields but parsed " + $, a + M)), f;
        }
        var m = 1;
        return !w.data.length || Array.isArray(w.data[0]) ? (w.data = w.data.map(_), m = w.data.length) : w.data = _(w.data, 0), e.header && w.meta && (w.meta.fields = p), a += m, w;
      }
      function pe(_, m, C, M, f) {
        var $, Q, V, Se;
        f = f || [",", "	", "|", ";", i.RECORD_SEP, i.UNIT_SEP];
        for (var me = 0; me < f.length; me++) {
          var Re = f[me], Ce = 0, ge = 0, Z = 0;
          V = void 0;
          for (var ue = new ee({
            comments: M,
            delimiter: Re,
            newline: m,
            preview: 10
          }).parse(_), J = 0; J < ue.data.length; J++) {
            if (C && R(ue.data[J])) {
              Z++;
              continue;
            }
            var se = ue.data[J].length;
            if (ge += se, typeof V > "u") {
              V = se;
              continue;
            } else se > 0 && (Ce += Math.abs(se - V), V = se);
          }
          ue.data.length > 0 && (ge /= ue.data.length - Z), (typeof Q > "u" || Ce <= Q) && (typeof Se > "u" || ge > Se) && ge > 1.99 && (Q = Ce, $ = Re, Se = ge);
        }
        return e.delimiter = $, {
          successful: !!$,
          bestDelimiter: $
        };
      }
      function he(_, m, C, M) {
        var f = {
          type: _,
          code: m,
          message: C
        };
        M !== void 0 && (f.row = M), w.errors.push(f);
      }
    }
    function E(e) {
      return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    function ee(e) {
      e = e || {};
      var t = e.delimiter, r = e.newline, s = e.comments, o = e.step, v = e.preview, d = e.fastMode, a, S = null, j = !1;
      e.quoteChar === void 0 || e.quoteChar === null ? a = '"' : a = e.quoteChar;
      var q = a;
      if (e.escapeChar !== void 0 && (q = e.escapeChar), (typeof t != "string" || i.BAD_DELIMITERS.indexOf(t) > -1) && (t = ","), s === t)
        throw new Error("Comment character same as delimiter");
      s === !0 ? s = "#" : (typeof s != "string" || i.BAD_DELIMITERS.indexOf(s) > -1) && (s = !1), r !== `
` && r !== "\r" && r !== `\r
` && (r = `
`);
      var y = 0, ne = !1;
      this.parse = function(p, w, we) {
        if (typeof p != "string")
          throw new Error("Input must be a string");
        var R = p.length, I = t.length, H = r.length, W = s.length, ae = l(o);
        y = 0;
        var X = [], oe = [], A = [], pe = 0;
        if (!p)
          return Z();
        if (d || d !== !1 && p.indexOf(a) === -1) {
          for (var he = p.split(r), _ = 0; _ < he.length; _++) {
            if (A = he[_], y += A.length, _ !== he.length - 1)
              y += r.length;
            else if (we)
              return Z();
            if (!(s && A.substring(0, W) === s)) {
              if (ae) {
                if (X = [], me(A.split(t)), ue(), ne)
                  return Z();
              } else
                me(A.split(t));
              if (v && _ >= v)
                return X = X.slice(0, v), Z(!0);
            }
          }
          return Z();
        }
        for (var m = p.indexOf(t, y), C = p.indexOf(r, y), M = new RegExp(E(q) + E(a), "g"), f = p.indexOf(a, y); ; ) {
          if (p[y] === a) {
            for (f = y, y++; ; ) {
              if (f = p.indexOf(a, f + 1), f === -1)
                return we || oe.push({
                  type: "Quotes",
                  code: "MissingQuotes",
                  message: "Quoted field unterminated",
                  row: X.length,
                  // row has yet to be inserted
                  index: y
                }), Ce();
              if (f === R - 1) {
                var $ = p.substring(y, f).replace(M, a);
                return Ce($);
              }
              if (a === q && p[f + 1] === q) {
                f++;
                continue;
              }
              if (!(a !== q && f !== 0 && p[f - 1] === q)) {
                m !== -1 && m < f + 1 && (m = p.indexOf(t, f + 1)), C !== -1 && C < f + 1 && (C = p.indexOf(r, f + 1));
                var Q = C === -1 ? m : Math.min(m, C), V = Re(Q);
                if (p.substr(f + 1 + V, I) === t) {
                  A.push(p.substring(y, f).replace(M, a)), y = f + 1 + V + I, p[f + 1 + V + I] !== a && (f = p.indexOf(a, y)), m = p.indexOf(t, y), C = p.indexOf(r, y);
                  break;
                }
                var Se = Re(C);
                if (p.substring(f + 1 + Se, f + 1 + Se + H) === r) {
                  if (A.push(p.substring(y, f).replace(M, a)), ge(f + 1 + Se + H), m = p.indexOf(t, y), f = p.indexOf(a, y), ae && (ue(), ne))
                    return Z();
                  if (v && X.length >= v)
                    return Z(!0);
                  break;
                }
                oe.push({
                  type: "Quotes",
                  code: "InvalidQuotes",
                  message: "Trailing quote on quoted field is malformed",
                  row: X.length,
                  // row has yet to be inserted
                  index: y
                }), f++;
              }
            }
            continue;
          }
          if (s && A.length === 0 && p.substring(y, y + W) === s) {
            if (C === -1)
              return Z();
            y = C + H, C = p.indexOf(r, y), m = p.indexOf(t, y);
            continue;
          }
          if (m !== -1 && (m < C || C === -1)) {
            A.push(p.substring(y, m)), y = m + I, m = p.indexOf(t, y);
            continue;
          }
          if (C !== -1) {
            if (A.push(p.substring(y, C)), ge(C + H), ae && (ue(), ne))
              return Z();
            if (v && X.length >= v)
              return Z(!0);
            continue;
          }
          break;
        }
        return Ce();
        function me(J) {
          X.push(J), pe = y;
        }
        function Re(J) {
          var se = 0;
          if (J !== -1) {
            var ve = p.substring(f + 1, J);
            ve && ve.trim() === "" && (se = ve.length);
          }
          return se;
        }
        function Ce(J) {
          return we || (typeof J > "u" && (J = p.substring(y)), A.push(J), y = R, me(A), ae && ue()), Z();
        }
        function ge(J) {
          y = J, me(A), A = [], C = p.indexOf(r, y);
        }
        function Z(J) {
          if (e.header && !w && X.length && !j) {
            const se = X[0], ve = {}, Oe = new Set(se);
            let Pe = !1;
            for (let Ee = 0; Ee < se.length; Ee++) {
              let fe = se[Ee];
              if (l(e.transformHeader) && (fe = e.transformHeader(fe, Ee)), !ve[fe])
                ve[fe] = 1, se[Ee] = fe;
              else {
                let xe, Ie = ve[fe];
                do
                  xe = `${fe}_${Ie}`, Ie++;
                while (Oe.has(xe));
                Oe.add(xe), se[Ee] = xe, ve[fe]++, Pe = !0, S === null && (S = {}), S[xe] = fe;
              }
              Oe.add(fe);
            }
            Pe && console.warn("Duplicate headers found and renamed."), j = !0;
          }
          return {
            data: X,
            errors: oe,
            meta: {
              delimiter: t,
              linebreak: r,
              aborted: ne,
              truncated: !!J,
              cursor: pe + (w || 0),
              renamedHeaders: S
            }
          };
        }
        function ue() {
          o(Z()), X = [], oe = [];
        }
      }, this.abort = function() {
        ne = !0;
      }, this.getCharIndex = function() {
        return y;
      };
    }
    function G() {
      if (!i.WORKERS_SUPPORTED)
        return !1;
      var e = K(), t = new h.Worker(e);
      return t.onmessage = z, t.id = te++, x[t.id] = t, t;
    }
    function z(e) {
      var t = e.data, r = x[t.workerId], s = !1;
      if (t.error)
        r.userError(t.error, t.file);
      else if (t.results && t.results.data) {
        var o = function() {
          s = !0, re(t.workerId, { data: [], errors: [], meta: { aborted: !0 } });
        }, v = {
          abort: o,
          pause: ce,
          resume: ce
        };
        if (l(r.userStep)) {
          for (var d = 0; d < t.results.data.length && (r.userStep({
            data: t.results.data[d],
            errors: t.results.errors,
            meta: t.results.meta
          }, v), !s); d++)
            ;
          delete t.results;
        } else l(r.userChunk) && (r.userChunk(t.results, v, t.file), delete t.results);
      }
      t.finished && !s && re(t.workerId, t.results);
    }
    function re(e, t) {
      var r = x[e];
      l(r.userComplete) && r.userComplete(t), r.terminate(), delete x[e];
    }
    function ce() {
      throw new Error("Not implemented.");
    }
    function _e(e) {
      var t = e.data;
      if (typeof i.WORKER_ID > "u" && t && (i.WORKER_ID = t.workerId), typeof t.input == "string")
        h.postMessage({
          workerId: i.WORKER_ID,
          results: i.parse(t.input, t.config),
          finished: !0
        });
      else if (h.File && t.input instanceof File || t.input instanceof Object) {
        var r = i.parse(t.input, t.config);
        r && h.postMessage({
          workerId: i.WORKER_ID,
          results: r,
          finished: !0
        });
      }
    }
    function ie(e) {
      if (typeof e != "object" || e === null)
        return e;
      var t = Array.isArray(e) ? [] : {};
      for (var r in e)
        t[r] = ie(e[r]);
      return t;
    }
    function N(e, t) {
      return function() {
        e.apply(t, arguments);
      };
    }
    function l(e) {
      return typeof e == "function";
    }
    return i;
  });
})(je);
var Qe = je.exports;
const Me = /* @__PURE__ */ Xe(Qe);
class ze {
  // Changed to store student IDs (string)
  constructor(T, k, h, K = "DE-MORGAN BLOCK FIRST FLOOR") {
    be(this, "name");
    be(this, "rows");
    be(this, "cols");
    be(this, "capacity");
    be(this, "buildingLocation");
    be(this, "seatingGrid");
    this.name = T, this.rows = k, this.cols = h, this.capacity = k * h, this.buildingLocation = K, this.seatingGrid = Array(k).fill(null).map(() => Array(h).fill(null));
  }
}
const le = {
  black: "#000000",
  white: "#FFFFFF"
};
function Je(F, T) {
  const k = /* @__PURE__ */ new Map();
  F.forEach((n, x) => {
    k.set(x, [...n.studentList]);
  });
  const h = Array.from(k.keys());
  if (h.length === 0)
    return T;
  let K = F.reduce((n, x) => n + x.studentList.length, 0), u = 0;
  for (const n of T) {
    for (let x = 0; x < n.cols; x++) {
      const te = h[x % h.length], i = k.get(te);
      for (let U = 0; U < n.rows; U++) {
        if (i && i.length > 0) {
          const g = i.shift();
          n.seatingGrid[U][x] = g, u++;
        } else
          n.seatingGrid[U][x] = null;
        if (u >= K) {
          x = n.cols;
          break;
        }
      }
      if (u >= K)
        break;
    }
    if (u >= K)
      break;
  }
  return T;
}
function Ze(F) {
  const { studentGroups: T, rooms: k, examConfig: h } = F, K = k.map((g) => new ze(g.name, g.rows, g.cols, g.buildingLocation)), u = Je(T, K), n = new Ne({ size: "A4", layout: "landscape", margin: 20 }), x = Le.createWriteStream(F.outputFile);
  n.pipe(x);
  const te = n.page.width;
  let i = 1;
  const U = () => {
    n.fontSize(8).text(`Page No.: ${i}`, te - 100, 20, { align: "right" }), i++;
    try {
      n.image(Ae.join(process.env.VITE_PUBLIC, "./image.png"), 20, 20, { width: 40, height: 30 });
    } catch {
      console.log(`Warning: image image not found at ${Ae.join(process.env.VITE_PUBLIC, "./image.png")}`);
    }
    const g = te / 2;
    let b = 40;
    n.font("Helvetica-Bold").fontSize(11).fillColor(le.black);
    const D = `SEATING PLAN FOR ${h.examName}, DATED: ${h.examDate}, TIMINGS: ${h.examTime}`;
    n.text(D, g - n.widthOfString(D) / 2, b), b += 15;
    const L = `CLOAK ROOM VENUE - ${h.cloakRoom}`;
    n.text(L, g - n.widthOfString(L) / 2, b), b += 25, n.fontSize(10);
    const O = "Mandatory Instructions to be announced by the Invigilator(s) to candidates before distribution of the question papers.";
    n.text(O, g - n.widthOfString(O) / 2, b), n.fontSize(8), b += 15;
    for (const c of h.instructions)
      n.text(c, 40, b), b += 12;
    return b + 20;
  };
  for (let g = 0; g < u.length; g++) {
    g > 0 && n.addPage();
    const b = u[g], D = U();
    n.font("Helvetica-Bold").fontSize(9).fillColor(le.black);
    const L = `${b.name} - ${b.buildingLocation}`, O = n.widthOfString(L);
    n.text(L, (te - O) / 2, D);
    const c = Math.min(b.cols, 10), B = te - 80, P = B / (c + 1);
    let Y = D + 30;
    const E = 15;
    n.rect(40, Y, B, E).fill(le.white), n.fillColor(le.black), n.text("S.No.", 45, Y + 7, { width: P - 10, align: "center" });
    for (let l = 0; l < c; l++)
      n.text(
        `Col ${l + 1}`,
        40 + P + l * P + 5,
        Y + 7,
        { width: P - 10, align: "center" }
      );
    for (let l = 0; l < b.rows; l++) {
      const e = Y + (l + 1) * E, t = le.white;
      n.rect(40, e, B, E).fillColor(t).fill(), n.fillColor(le.black).text(`${l + 1}`, 45, e + 7, { width: P - 10, align: "center" });
      for (let r = 0; r < c; r++) {
        const s = r < b.cols ? b.seatingGrid[l][r] : null, o = s || "---";
        n.text(
          o,
          40 + P + r * P + 5,
          e + 7,
          { width: P - 10, align: "center" }
        );
      }
      n.strokeColor(le.black);
      for (let r = 0; r <= c; r++) {
        const s = 40 + r * P;
        n.moveTo(s, Y).lineTo(s, e + E).stroke();
      }
      n.moveTo(40, e).lineTo(40 + B, e).stroke();
    }
    const ee = Y + (b.rows + 1) * E;
    n.moveTo(40, ee).lineTo(40 + B, ee).stroke(), n.rect(40, Y, B, (b.rows + 1) * E).lineWidth(1).stroke();
    const G = ee + 30, z = [120, 60, 60], re = z.reduce((l, e) => l + e, 0), ce = b.seatingGrid.flat().filter((l) => l !== null).length, _e = b.capacity - ce;
    n.rect(40, G, re, E).fillColor(le.white).fill(), n.fillColor(le.black).fontSize(9), n.text("Branch", 45, G + 7, { width: z[0] - 10, align: "center" }), n.text(
      "Appearing",
      40 + z[0] + 5,
      G + 7,
      { width: z[1] - 10, align: "center" }
    ), n.text(
      "Subject",
      40 + z[0] + z[1] + 5,
      G + 7,
      { width: z[2] - 10, align: "center" }
    ), n.rect(40, G + E, re, E * 2).fillColor(le.white).fill(), n.fillColor(le.black), n.text(
      "ENROLLED",
      45,
      G + E + 7,
      { width: z[0] - 10, align: "center" }
    ), n.text(
      `${b.capacity}`,
      40 + z[0] + 5,
      G + E + 7,
      { width: z[1] - 10, align: "center" }
    ), n.text(
      `${_e}`,
      40 + z[0] + z[1] + 5,
      G + E + 7,
      { width: z[2] - 10, align: "center" }
    ), n.text(
      "APPEARED",
      45,
      G + E * 2 + 7,
      { width: z[0] - 10, align: "center" }
    ), n.text(
      `${ce}`,
      40 + z[0] + 5,
      G + E * 2 + 7,
      { width: z[1] - 10, align: "center" }
    ), n.strokeColor(le.black);
    let ie = 40;
    n.moveTo(ie, G).lineTo(ie, G + E * 3).stroke();
    for (const l of z)
      ie += l, n.moveTo(ie, G).lineTo(ie, G + E * 3).stroke();
    for (let l = 0; l <= 3; l++) {
      const e = G + l * E;
      n.moveTo(40, e).lineTo(40 + re, e).stroke();
    }
    let N = G + E * 3 + 30;
    n.fontSize(9), n.text(
      "UMC Roll Number (if any): _____________________________ Absent Roll Number : _____________________________ Remarks: _____________________________",
      40,
      N
    ), N += 20, n.text(
      "Name of the Invigilator - 1: _____________________________ Employee Code: _____________________________ Signature: _____________________________",
      40,
      N
    ), N += 15, n.text(
      "Name of the Invigilator - 2: _____________________________ Employee Code: _____________________________ Signature: _____________________________",
      40,
      N
    );
  }
  return n.end(), new Promise((g) => {
    x.on("finish", () => {
      g(F.outputFile);
    });
  });
}
function et(F) {
  return console.log("[AttendanceGen] Starting generation with options:", F), new Promise((T, k) => {
    const { data: h, outputFile: K } = F, u = new Ne({ size: "A4", layout: "portrait", margin: 30 }), n = Le.createWriteStream(K);
    u.pipe(n);
    const x = u.page.width, te = u.page.height, i = 30, U = 25, g = Math.ceil(h.students.length / U) || 1;
    console.log(`[AttendanceGen] Calculated total pages: ${g}`);
    const b = ["S. No", "Batch", "Sem.", "Student Name", "University Roll No", "Answer Sheet Serial No.", "Machine No.", "Signature", "Time Out"], D = [35, 40, 35, 120, 80, 70, 60, 70, 50], L = 20;
    for (let O = 1; O <= g; O++) {
      console.log(`[AttendanceGen] Processing page: ${O}`);
      let c = i;
      if (h.logoPath)
        try {
          u.image(h.logoPath, i, c, { width: 50 });
        } catch {
          console.warn(`Warning: Logo image not found at ${h.logoPath}`);
        }
      u.fontSize(10).font("Helvetica").text(`${O}/${g}`, x - i - 50, c, { width: 50, align: "right" }), c += 5, u.fontSize(14).font("Helvetica-Bold").text(h.universityName, i, c, { align: "center" }), c += 16, u.fontSize(11).font("Helvetica").text(h.examTitle, i, c, { align: "center" }), c += 20, u.fontSize(9).font("Helvetica-Bold").text("Note:", i, c), c += 12, u.font("Helvetica"), h.noteLines.forEach((e) => {
        u.text(e, i + 10, c, { continued: !1, indent: 5 }), c += 11;
      }), c += 30;
      const B = c;
      u.fontSize(10).font("Helvetica-Bold"), u.text(`Date & Session: ${h.dateAndSession}`, i, c), c += 14, u.text(`Subject: ${h.subject}`, i, c), c += 14, u.text(`Mode of Examination: ${h.modeOfExamination}`, i, c), c = B;
      const P = x / 2 + 20;
      u.text(`Branch/Sem/Batch: ${h.branchSemBatch}`, P, c, { align: "right" }), c += 14, u.text(`Subject Code: ${h.subjectCode}`, P, c, { align: "right" }), c += 14, u.text(`Session-${h.session}`, P, c, { align: "right" }), c += 25;
      const Y = c;
      let E = [...b], ee = [...D];
      if (h.modeOfExamination.toUpperCase() === "OFFLINE") {
        const e = E.indexOf("Machine No.");
        e > -1 && (E.splice(e, 1), ee.splice(e, 1));
        const t = E.indexOf("Time Out");
        t > -1 && (E.splice(t, 1), ee.splice(t, 1));
      }
      const G = ee.reduce((e, t) => e + t, 0), z = (x - G) / 2;
      u.font("Helvetica-Bold").fontSize(8);
      let re = z;
      const ce = L * (E.some((e) => e.includes(`
`)) ? 1.5 : 1);
      E.forEach((e, t) => {
        const r = e.includes(`
`) ? 1.5 : 1, s = e.includes("Answer Sheet") ? 1.5 : 7;
        u.rect(re, Y, ee[t], L * r).stroke(), u.text(e.replace(`
`, `
`), re + 2, Y + s, { width: ee[t] - 4, align: "center" }), re += ee[t];
      }), u.font("Helvetica").fontSize(8);
      const _e = (O - 1) * U, ie = Math.min(_e + U, h.students.length);
      console.log(`[AttendanceGen] Page ${O} - Student index range: ${_e} to ${ie - 1}`);
      let N = Y + ce;
      for (let e = _e; e < ie; e++) {
        const t = h.students[e], r = e - _e, s = Y + ce + r * L;
        if (console.log(`[AttendanceGen] Page ${O} - Drawing row for student index ${e} at Y: ${s}`), re = z, s + L > te - 100) break;
        ee.forEach((o, v) => {
          u.rect(re, s, o, L).stroke();
          let d = "";
          const a = E[v];
          if (t)
            switch (a) {
              case "S. No":
                d = (e + 1).toString();
                break;
              case "Batch":
                d = t.batch.toString();
                break;
              case "Sem.":
                d = t.sem.toString();
                break;
              case "Student Name":
                d = t.studentName;
                break;
              case "University Roll No":
                d = t.universityRollNo;
                break;
              default:
                d = "";
            }
          let S = "left";
          ["S. No", "Batch", "Sem.", "University Roll No"].includes(a) && (S = "center"), u.text(d, re + 2, s + 5, {
            width: o - 4,
            align: S
          }), re += o;
        }), N = s + L;
      }
      let l = N + 20;
      console.log(`[AttendanceGen] Page ${O} - Calculated footer Y position: ${l}`), u.fontSize(9).font("Helvetica"), u.text("Total No. of Presentees: __________", i, l), u.text("Total No. of Absentees: __________", i + 220, l), u.text("Total No. of Detainees: __________", i + 420, l), l += 20, u.text("Unfair Means Case(s) Roll No. (if any): ____________________", i, l), l += 30, u.text("Name of the Invigilators", i, l), u.text("Signature of the Invigilators", x - i - 150, l, { align: "right" }), l += 10, O < g && u.addPage();
    }
    u.end(), n.on("finish", () => {
      console.log(`[AttendanceGen] PDF generation finished for: ${K}`), T(K);
    }), n.on("error", (O) => {
      console.error(`[AttendanceGen] Error generating PDF: ${K}`, O), k(O);
    });
  });
}
Ge(import.meta.url);
const He = de.dirname(Ve(import.meta.url));
process.env.APP_ROOT = de.join(He, "..");
const Te = process.env.VITE_DEV_SERVER_URL, ut = de.join(process.env.APP_ROOT, "dist-electron"), We = de.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = Te ? de.join(process.env.APP_ROOT, "public") : We;
let ye;
function Ue() {
  ye = new Fe({
    icon: de.join(process.env.VITE_PUBLIC, "logo.png"),
    autoHideMenuBar: !0,
    webPreferences: {
      preload: de.join(He, "preload.mjs")
    }
  }), ye.webContents.on("did-finish-load", () => {
    ye == null || ye.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), Te ? ye.loadURL(Te) : ye.loadFile(de.join(We, "index.html"));
}
ke.on("window-all-closed", () => {
  process.platform !== "darwin" && (ke.quit(), ye = null);
});
ke.on("activate", () => {
  Fe.getAllWindows().length === 0 && Ue();
});
De.handle("generate-seating-plan", async (F, T) => {
  try {
    console.log("Received data in main process:", T);
    const { examConfig: k, studentGroups: h, rooms: K } = T, u = [];
    for (const g of h) {
      if (!g.csvFilePath || typeof g.csvFilePath != "string") {
        console.warn(`Skipping group ${g.branchCode}-${g.subjectCode} due to missing or invalid csvFilePath.`);
        continue;
      }
      try {
        const b = await $e.readFile(g.csvFilePath, "utf8"), D = Me.parse(b.trim(), {
          header: !1,
          // Assuming CSV has no header, just one column of IDs
          skipEmptyLines: !0
        });
        if (D.errors.length > 0)
          throw console.error(`Error parsing CSV for ${g.branchCode}-${g.subjectCode}:`, D.errors), new Error(`Failed to parse CSV: ${D.errors[0].message}`);
        const L = D.data.map((O) => O[0]).filter((O) => O);
        L.length === 0 && console.warn(`CSV for ${g.branchCode}-${g.subjectCode} is empty or contains no valid IDs.`), u.push({
          branchCode: g.branchCode,
          subjectCode: g.subjectCode,
          studentList: L
        });
      } catch (b) {
        throw console.error(`Error reading or parsing CSV file ${g.csvFilePath}:`, b), new Error(`Failed to process student file ${g.csvFilePath}: ${b.message}`);
      }
    }
    if (u.length === 0)
      throw new Error("No valid student data could be processed from the provided files.");
    const n = K.map((g) => new ze(g.name, g.rows, g.cols, g.buildingLocation || "Default Location")), x = (/* @__PURE__ */ new Date()).toISOString().replace(/[T:.-]/g, "").slice(0, 14), te = ke.getPath("downloads"), i = de.join(te, `SeatingPlan_${x}.pdf`), U = await Ze({
      outputFile: i,
      examConfig: k,
      studentGroups: u,
      rooms: n
    });
    return console.log(`Seating plan generated successfully: ${U}`), { success: !0, path: U };
  } catch (k) {
    return console.error("IPC Handler Error:", k), { success: !1, error: k.message || "Unknown error" };
  }
});
De.handle("generate-attendance-sheet", async (F, T) => {
  console.log("[IPC] Received generate-attendance-sheet request with args:", T);
  try {
    const { branchCode: k, subjectCode: h, semester: K, batchYear: u, csvFilePath: n } = T;
    if (!n || typeof n != "string")
      throw new Error("CSV file path is missing or invalid.");
    let x = [];
    try {
      const c = await $e.readFile(n, "utf8"), B = Me.parse(c.trim(), {
        header: !1,
        // No header row
        skipEmptyLines: !0
      });
      if (B.errors.length > 0)
        throw console.error(`Error parsing CSV ${n}:`, B.errors), new Error(`Failed to parse CSV: ${B.errors[0].message}`);
      if (x = B.data.map((P, Y) => P.length < 2 || !P[0] || !P[1] ? (console.warn(`Skipping invalid row ${Y + 1} in ${n}:`, P), null) : { rollNo: P[0].trim(), name: P[1].trim() }).filter((P) => P !== null), x.length === 0)
        throw new Error(`CSV file ${n} is empty or contains no valid student data (expected rollnumber, name).`);
      console.log(`[IPC] Parsed ${x.length} students from ${n}`);
    } catch (c) {
      throw console.error(`Error reading or parsing CSV file ${n}:`, c), new Error(`Failed to process student file ${n}: ${c.message}`);
    }
    const te = x.map((c, B) => ({
      sNo: B + 1,
      batch: u,
      // Use batchYear from args
      sem: K,
      // Use semester from args
      studentName: c.name,
      universityRollNo: c.rollNo
    })), i = {
      universityName: "Chitkara University, Punjab",
      // Placeholder
      examTitle: `Attendance (${T.examType == "regular" ? "Regular" : "Reappear"}) for End Term Examinations, December 2024`,
      // Placeholder
      noteLines: [
        `1. Centre Superintendents are requested to send this slip to the Assistant Registrar (Examinations) securely put inside the packet along with the answer-books
2. Please ensure that the memo is not sent separately in any case.`
      ],
      dateAndSession: `${T.date} (Session-${T.session})`,
      // Placeholder
      subject: `${h} - ${k}`,
      // Use provided codes
      modeOfExamination: T.mode,
      // Assuming offline, maybe make configurable?
      branchSemBatch: `${k}/${K}/${u}`,
      subjectCode: h,
      session: "1",
      // Placeholder
      students: te,
      logoPath: de.join(process.env.VITE_PUBLIC || "public", "image.png")
      // Example logo path
    }, U = (/* @__PURE__ */ new Date()).toISOString().replace(/[T:.-]/g, "").slice(0, 14), g = ke.getPath("downloads"), b = k.replace(/[^a-z0-9]/gi, "_"), D = h.replace(/[^a-z0-9]/gi, "_"), L = de.join(g, `Attendance_${b}_${D}_${U}.pdf`);
    console.log(`[IPC] Generating attendance sheet at: ${L}`);
    const O = await et({
      outputFile: L,
      data: i
    });
    return console.log(`[IPC] Attendance sheet generated successfully: ${O}`), { success: !0, path: O };
  } catch (k) {
    return console.error("[IPC] Error handling generate-attendance-sheet:", k), { success: !1, error: k.message || "Unknown error generating attendance sheet." };
  }
});
ke.whenReady().then(Ue);
export {
  ut as MAIN_DIST,
  We as RENDERER_DIST,
  Te as VITE_DEV_SERVER_URL
};
