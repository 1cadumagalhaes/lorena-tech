(function () {
    'use-strict'
    var requirejs = typeof window !== 'undefined' && typeof window.define === 'function' && window.define.amd && window.require

    function createScript(src, cb) {
        var s = document.createElement('script');
        s.onload = cb;
        s.src = src;
        document.head.appendChild(s);
    }

    var installScript = requirejs ? window.require : createScript

    installScript(['https://cdnjs.cloudflare.com/ajax/libs/fingerprintjs2/2.0.0/fingerprint2.min.js'], function (fp) {
        requirejs && (window.Fingerprint2 = fp);
        installScript(['https://www.clickcease.com/monitor/cc-snapshot.js'], function (ccWebRecorder) {
            requirejs && (window.ccWebRecorder = ccWebRecorder);
            installScript(['https://www.clickcease.com/monitor/cc-recorder.js'], function (ccWebRecorderInit) {
                requirejs && (window.ccWebRecorderInit = ccWebRecorderInit);
            })
        })
    })
})()