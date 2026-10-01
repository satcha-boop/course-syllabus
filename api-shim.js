// แทนที่ google.script.run ด้วย fetch ไปยัง Apps Script
// ทำให้โค้ดเดิมใน index.html / dashboard.html ใช้ต่อได้โดยไม่ต้องแก้
(function () {
  // วาง Web app URL แบบทั่วไป (ไม่มี /a/macros/โดเมน) ที่ลงท้ายด้วย /exec
  const API_URL = 'https://script.google.com/macros/s/AKfycbwLO5mbkOxHHr6E_7H3g9mpPAR2Zesjjn9W980fWqqBy2H1oqyKTw0xrYpVv_FabPWZoA/exec';

  function runner(ok, fail) {
    return new Proxy({}, {
      get: function (_, name) {
        if (name === 'withSuccessHandler') return function (f) { return runner(f, fail); };
        if (name === 'withFailureHandler') return function (f) { return runner(ok, f); };
        return function () {
          const args = Array.prototype.slice.call(arguments);
          fetch(API_URL, {
            method: 'POST',
            // text/plain ทำให้ไม่เกิด CORS preflight ซึ่ง Apps Script ไม่รองรับ
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ fn: name, args: args })
          })
            .then(function (r) { return r.json(); })
            .then(
              function (data) { if (ok) ok(data); },
              function (err) { if (fail) fail(err); }
            );
        };
      }
    });
  }

  window.google = { script: { run: runner() } };
})();
