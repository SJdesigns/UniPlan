/* Timer / Pomodoro implementation
   - Builds UI inside #timerTabLeft and #timerTabRight
   - SVG circular progress, start/pause/reset, mode switch (study/break)
   - Duration inputs on right, settings persisted in localStorage
*/

var UniTimer = (function() {
    var intervalId = null;
    var settingsKey = 'uniplan-timer-settings';

    // default settings (minutes)
    var defaults = { studyMin: 25, breakMin: 5, autoStartNext: true };

    var state = {
        mode: 'study', // 'study' or 'break'
        running: false,
        totalSeconds: 0,
        remainingSeconds: 0,
        endTimestamp: null // ms absolute timestamp when the current period should finish
    };


    // Wake Lock sentinel
    var _wakeLock = null;

    // Solicitar wake lock (screen). No falla si no está soportado.
    async function requestWakeLock() {
        try {
            if ('wakeLock' in navigator) {
                _wakeLock = await navigator.wakeLock.request('screen');
                _wakeLock.addEventListener('release', function() { log('WakeLock released'); _wakeLock = null; });
                log('WakeLock acquired');
            } else {
                log('WakeLock API not supported in this browser');
            }
        } catch (err) {
            log('Failed to acquire WakeLock:', err);
            _wakeLock = null;
        }
    }

    // Liberar wake lock si existe
    async function releaseWakeLock() {
        try {
            if (_wakeLock) {
                await _wakeLock.release();
                _wakeLock = null;
                log('WakeLock manually released');
            }
        } catch (err) {
            log('Error releasing WakeLock:', err);
        }
    }

    function log() { if (window.userData && settings.debug) console.log.apply(console, arguments); }

    function loadSettings() {
        var raw = localStorage.getItem(settingsKey);
        if (!raw) return Object.assign({}, defaults);
        try { var obj = JSON.parse(raw); return Object.assign({}, defaults, obj); } catch(e) { return Object.assign({}, defaults); }
    }

    function saveSettings(s) {
        localStorage.setItem(settingsKey, JSON.stringify(s));
    }

    function fmtTime(sec) {
        sec = Math.max(0, Math.floor(sec));
        var mm = Math.floor(sec/60); var ss = sec%60;
        return String(mm).padStart(2,'0') + ':' + String(ss).padStart(2,'0');
    }

    function injectStyles() {
        if ($('#uniplan-timer-styles').length) return;
        var css = '\n'
            + '#timerTabLeft, #timerTabRight { display:flex; align-items:center; }\n'
            + '#timerTabLeft .timerContainer, #timerTabRight .timerContainer{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:18px;}\n'
            + '.timerModeLabel{font-weight:600;margin-bottom:18px;font-size:26px;}\n'
            + '.timerSvgWrap{position:relative;width:360px;height:360px;}\n'
            + '.timerSvgWrap svg{transform:rotate(-90deg);display:block;}\n'
            + '.timerCenter{position:absolute;left:0;right:0;top:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:3;}\n'
            + '.timerTime{font-size:34px;font-weight:700;position:relative;z-index:4;}\n'
            + '.timerControls{display:flex;gap:12px;margin-top:18px;}\n'
            + '.timerBtn{padding:10px 16px;border-radius:8px;border:none;cursor:pointer;background:#eee;font-size:16px;}\n'
            + '.timerBtnBig{padding: 14px 22px; font-size: 18pt; border-radius: 14px}\n'
            + '.timerBtnPrimary{background:#1976d2;color:#fff;}\n'
            + '.timerSwitch{display:flex;align-items:center;gap:8px;margin-left:8px;}\n'
            + '#timerTabRight{padding:12px; align-items: start;}\n'
            + '.timerSettingRow{margin-bottom:10px;}\n'
            + '.timerSettingsInput{width:50%;}\n'
            + '.timerInput{padding:6px 12px;outline:0;}\n'
            + '.timerSmall{font-size:13px;color:#666;}\n'
            + '@media only screen and (max-width: 850px) { #timerTabRight {align-items: center; width:auto; background-color: #fafafa; border-radius: 15px;} .timerSettingsInput {display: flex;align-items: center;flex-direction: column;} .timerSettingRow {margin-bottom: 15px;} #timerTabLeft .timerContainer { padding: 0px; } }\n'
        $('<style id="uniplan-timer-styles">'+css+'</style>').appendTo('head');
    }

    function buildUI() {
        injectStyles();

        // Left (main timer)
        var left = $('#timerTabLeft');
        if (!left.length) {
            log('Element #timerTabLeft not found');
            return;
        }
        var htmlLeft = '';
        htmlLeft += '<div class="timerContainer">';
        htmlLeft += '<div class="timerModeLabel" id="timerModeLabel">Modo: Estudio</div>';
        htmlLeft += '<div class="timerSvgWrap">';
            htmlLeft += '<svg width="360" height="360" viewBox="0 0 360 360" xmlns="http://www.w3.org/2000/svg">';
            htmlLeft += '<circle class="timerTrack" cx="180" cy="180" r="160" stroke="#eee" stroke-width="17" fill="none" />';
            htmlLeft += '<circle id="timerProgress" cx="180" cy="180" r="160" stroke="#1976d2" stroke-width="17" stroke-linecap="round" fill="none" stroke-dasharray="1005.31" stroke-dashoffset="0" />';
        htmlLeft += '</svg>';
        htmlLeft += '<div class="timerCenter">';
        htmlLeft += '<div class="timerTime" id="timerDisplay">25:00</div>';
        htmlLeft += '<div class="timerSmall" id="timerSubtitle">Listo</div>';
        htmlLeft += '</div>'; // center
        htmlLeft += '</div>'; // svgWrap

        htmlLeft += '<div class="timerControls">';
        htmlLeft += '<button id="timerStartPause" class="timerBtn timerBtnBig timerBtnPrimary">Iniciar</button>';
        htmlLeft += '<button id="timerReset" class="timerBtn timerBtnBig">Reset</button>';
        htmlLeft += '</div>';

        htmlLeft += '</div>';
        left.html(htmlLeft);

        // Right (settings)
        var right = $('#timerTabRight');
        if (!right.length) {
            log('Element #timerTabRight not found');
            return;
        }
        var settings = loadSettings();
        var htmlRight = '<p>Configuracion:</p><br />';
        htmlRight += '<div id="timerTabSettings">';
        htmlRight += '<div class="timerSettingRow timerSettingsInput">';
        htmlRight += '<label class="timerSmall">Duración Estudio (min)</label><br/>';
        htmlRight += '<input class="timerInput" id="timerStudyMin" type="number" min="1" max="180" value="'+settings.studyMin+'" />';
        htmlRight += '</div>';
        htmlRight += '<div class="timerSettingRow timerSettingsInput">';
        htmlRight += '<label class="timerSmall">Duración Descanso (min)</label><br/>';
        htmlRight += '<input class="timerInput" id="timerBreakMin" type="number" min="1" max="60" value="'+settings.breakMin+'" />';
        htmlRight += '</div>';
        htmlRight += '<div class="timerSettingRow timerSettingsInput">';
        htmlRight += '<label class="timerSmall">Color Estudio</label><br/>';
        htmlRight += '<input id="timerColorStudy" type="color" value="#1976d2" />';
        htmlRight += '</div>';
        htmlRight += '<div class="timerSettingRow timerSettingsInput">';
        htmlRight += '<label class="timerSmall">Color Descanso</label><br/>';
        htmlRight += '<input id="timerColorBreak" type="color" value="#ff4081" />';
        htmlRight += '</div>';
        htmlRight += '</div>';
        htmlRight += '<div class="timerSettingRow">';
        htmlRight += '<button id="timerSaveSettings" class="timerBtn">Guardar ajustes</button> ';
        htmlRight += '<button id="timerLoadDefaults" class="timerBtn">Por defecto</button>';
        htmlRight += '</div>';
        htmlRight += '<div class="timerSettingRow timerSettingsInput">';
        htmlRight += '<label class="timerSmall"><input type="checkbox" id="timerModeSwitch" ' + (settings.modeSwitchChecked? 'checked' : '') + ' /> Modo Descanso</label><br/>';
        htmlRight += '<label class="timerSmall"><input type="checkbox" id="timerAutoStart" ' + (settings.autoStartNext? 'checked' : '') + ' /> Auto-start siguiente</label>';
        htmlRight += '</div>';
        right.html(htmlRight);
    }

    function updateUI() {
        $('#timerModeLabel').text('Modo: ' + (state.mode === 'study' ? 'Estudio' : 'Descanso'));
        $('#timerDisplay').text(fmtTime(state.remainingSeconds));
        $('#timerModeSwitch').prop('checked', state.mode === 'break');
        $('#timerAutoStart').prop('checked', loadSettings().autoStartNext);
        // color progress
        var studyColor = $('#timerColorStudy').val() || '#1976d2';
        var breakColor = $('#timerColorBreak').val() || '#ff4081';
        var clr = (state.mode === 'study') ? studyColor : breakColor;
        $('#timerProgress').attr('stroke', clr);
        $('#timerSubtitle').text(state.running ? (state.mode==='study'?'Estudiando':'Descansando') : 'Listo');
        $('#timerStartPause').text(state.running ? 'Pausar' : 'Iniciar');
    }

    function setDurationsFromInputs() {
        var s = Number($('#timerStudyMin').val()) || defaults.studyMin;
        var b = Number($('#timerBreakMin').val()) || defaults.breakMin;
        var cfg = loadSettings();
        cfg.studyMin = s; cfg.breakMin = b;
        saveSettings(cfg);
        // If timer not running, update remaining to current mode's duration
        if (!state.running) {
            state.totalSeconds = (state.mode==='study'? s : b) * 60;
            state.remainingSeconds = state.totalSeconds;
            updateProgress(); updateUI();
        }
    }

    function updateProgress() {
        var circle = document.getElementById('timerProgress');
        if (!circle) return;
        var r = Number(circle.getAttribute('r')) || 90;
        var c = 2 * Math.PI * r;
        circle.setAttribute('stroke-dasharray', c);
        var progress = 0;
        if (state.totalSeconds > 0) progress = (state.totalSeconds - state.remainingSeconds) / state.totalSeconds;
        progress = Math.max(0, Math.min(1, progress));
        var offset = c * (1 - progress);
        circle.setAttribute('stroke-dashoffset', offset);
    }

    // Reproduce sonido: primero intenta el archivo .wav, luego fallback a tono sintético
    function playBeep(type) {
        // Primero intentar reproducir archivo de sonido
        try {
            var audio = new Audio();
            if (type=='study') { // se reproduce cuando se acaba el estudio
                audio.src = 'sounds/mixkit-alert-bells-echo-765.wav';
            } else { // se reproduce cuando se acaba el descanso
                audio.src = 'sounds/mixkit-slot-machine-win-alert-1931.wav';
            }
            audio.volume = 0.5;
            audio.play().catch(function(err) {
                console.warn('Error reproduciendo archivo .wav, usando tono sintético:', err);
                playBeepSynthetic(type);
            });
            return;
        } catch(err) {
            console.warn('Exception cargando .wav:', err);
        }

        // Si falla el archivo, usar tono sintético
        playBeepSynthetic(type);
    }

    // Tono sintético con WebAudio (fallback)
    function playBeepSynthetic(type) {
        try {
            var AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) throw new Error('No AudioContext');
            if (!playBeepSynthetic.ctx) playBeepSynthetic.ctx = new AudioContext();
            var ctx = playBeepSynthetic.ctx;
            if (ctx.state === 'suspended' && typeof ctx.resume === 'function') ctx.resume();
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = (type === 'study') ? 880 : 600;
            gain.gain.value = 0.0001;
            osc.connect(gain);
            gain.connect(ctx.destination);
            var now = ctx.currentTime;
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
            osc.start(now);
            osc.stop(now + 0.2);
            osc.onended = function(){ try{ osc.disconnect(); gain.disconnect(); } catch(e){} };
        } catch (e) {
            console.error('Error con tono sintético:', e);
        }
    }

    // tick/update loop: compute remaining from absolute timestamp to avoid throttling issues
    function tick() {
        if (!state.running) return;
        if (state.endTimestamp) {
            var now = Date.now();
            var remMs = Math.max(0, state.endTimestamp - now);
            state.remainingSeconds = Math.ceil(remMs / 1000);
        }

        updateUI();
        updateProgress();

        if (state.remainingSeconds <= 0) {
            stopInterval();
            var finishedMode = state.mode;
            playBeep(finishedMode);

            // liberar wake lock si no se va a auto-start al siguiente
            var cfg = loadSettings();

            if (!cfg.autoStartNext) {
                releaseWakeLock();
            }

            if (cfg.autoStartNext) {
                toggleMode();
                startTimer();
            } else {
                $('#timerSubtitle').text('Finalizado');
                state.running = false;
                updateUI();
            }
        }
    }

    function startTimer() {
        if (state.running) return;
        var cfg = loadSettings();
        //if (!state.remainingSeconds || state.remainingSeconds <= 0) {
        if (state.remainingSeconds <= 0) {
            state.remainingSeconds = (state.mode==='study'? cfg.studyMin : cfg.breakMin) * 60;
        }

        // Guardar el tiempo total ANTES de crear el endTimestamp (para cálculo de progreso correcto)
        if (state.totalSeconds === 0) {
            state.totalSeconds = state.remainingSeconds;
        }

        // set absolute end timestamp so timing stays accurate even if ticks are throttled
        state.endTimestamp = Date.now() + state.remainingSeconds * 1000;
        state.running = true;
        // solicitar wake lock al arrancar (ejecutado dentro del handler de click => gesto de usuario)
        requestWakeLock();

        updateUI(); updateProgress();
        // use a shorter interval for smoother updates but not too frequent
        intervalId = setInterval(tick, 250);
        // run one immediate tick to update UI
        tick();
    }

    function stopInterval() {
        if (intervalId) { clearInterval(intervalId); intervalId = null; }
    }

    function pauseTimer() {
        if (!state.running) return;
        // recompute remainingSeconds from endTimestamp to keep accuracy
        if (state.endTimestamp) {
            state.remainingSeconds = Math.max(0, Math.ceil((state.endTimestamp - Date.now())/1000));
        }
        state.endTimestamp = null;
        state.running = false; stopInterval(); updateUI();
        // liberar wake lock al pausar
        releaseWakeLock();
    }

    function resetTimer() {
        state.running = false; stopInterval(); state.endTimestamp = null;
        var cfg = loadSettings();
        state.mode = 'study';
        state.totalSeconds = cfg.studyMin * 60;
        state.remainingSeconds = state.totalSeconds;
        updateUI(); updateProgress();
        // liberar wake lock al resetear
        releaseWakeLock();
    }

    function toggleMode() {
        state.mode = (state.mode==='study') ? 'break' : 'study';
        var cfg = loadSettings();
        state.totalSeconds = (state.mode==='study' ? cfg.studyMin : cfg.breakMin) * 60;
        state.remainingSeconds = state.totalSeconds;
        // if timer was running, restart endTimestamp for the new duration
        if (state.running) {
            state.endTimestamp = Date.now() + state.remainingSeconds * 1000;
        } else {
            state.endTimestamp = null;
        }
        stopInterval(); state.running = false; updateUI(); updateProgress();
    }

    // when visibility changes, recompute remaining and refresh UI to avoid visible lag
    document.addEventListener('visibilitychange', function() {
        if (state.running && state.endTimestamp) {
            state.remainingSeconds = Math.max(0, Math.ceil((state.endTimestamp - Date.now())/1000));
        }
        updateUI(); updateProgress();

        // si la pagina vuelve a visible y el timer sigue corriendo, intentar re-adquirir wake lock
        if (document.visibilityState === 'visible') {
            if (state.running && !_wakeLock) requestWakeLock();
        } else {
            // opcional: liberar wake lock cuando la página se oculta
            // releaseWakeLock();
        }
    });

    function attachEvents() {
        // Start/Pause
        $(document).off('click', '#timerStartPause').on('click', '#timerStartPause', function(){
            if (state.running) pauseTimer(); else startTimer();
        });
        // Reset
        $(document).off('click', '#timerReset').on('click', '#timerReset', function(){ resetTimer(); });
        // Switch mode checkbox
        $(document).off('change', '#timerModeSwitch').on('change', '#timerModeSwitch', function(){
            toggleMode();
        });
        // Auto-start toggle
        $(document).off('change', '#timerAutoStart').on('change', '#timerAutoStart', function(){
            var cfg = loadSettings(); cfg.autoStartNext = $(this).is(':checked'); saveSettings(cfg);
        });
        // Save settings
        $(document).off('click', '#timerSaveSettings').on('click', '#timerSaveSettings', function(){
            var cfg = loadSettings();
            cfg.studyMin = Number($('#timerStudyMin').val()) || cfg.studyMin;
            cfg.breakMin = Number($('#timerBreakMin').val()) || cfg.breakMin;
            saveSettings(cfg); setDurationsFromInputs();
        });
        // Load defaults
        $(document).off('click', '#timerLoadDefaults').on('click', '#timerLoadDefaults', function(){
            saveSettings(defaults); $('#timerStudyMin').val(defaults.studyMin); $('#timerBreakMin').val(defaults.breakMin); setDurationsFromInputs();
        });
        // Inputs change
        $(document).off('change', '#timerStudyMin, #timerBreakMin').on('change', '#timerStudyMin, #timerBreakMin', function(){ setDurationsFromInputs(); });
        // color inputs change -> update immediately
        $(document).off('change', '#timerColorStudy, #timerColorBreak').on('change', '#timerColorStudy, #timerColorBreak', function(){ updateUI(); });
    }

    function init() {
        buildUI();
        attachEvents();
        // load settings and initialize state
        var cfg = loadSettings();
        $('#timerStudyMin').val(cfg.studyMin); $('#timerBreakMin').val(cfg.breakMin);
        $('#timerAutoStart').prop('checked', cfg.autoStartNext);
        // initial mode and times
        state.mode = 'study'; state.running = false;
        state.totalSeconds = cfg.studyMin * 60; state.remainingSeconds = state.totalSeconds;
        updateUI(); updateProgress();
    }

    // Expose control methods
    return {
        init: init,
        start: startTimer,
        pause: pauseTimer,
        reset: resetTimer,
        toggleMode: toggleMode
    };

})();

function showTimerTab() {
    (settings.debug)?console.log('showTimerTab'):'';

    $('#tabTimer').show();
    $('.navItemMobile').removeClass('navItemMobileActive');
    $('#navItemTimerMobile').addClass('navItemMobileActive');
    // initialize UI once
    if (typeof UniTimer !== 'undefined') {
        UniTimer.init();
    }

    if (window.innerWidth < 850) {
        $('#timerTabLeft').css('min-height',(window.innerHeight-80)-60);
    }
}

// auto-init when DOM ready in case the tab is shown later
$(function(){ if ($('#timerTabLeft').length) UniTimer.init(); });

function setupKeyboardControls() {
    (settings.debug)?console.log('setupKeyboardControls'):'';
    $(document).off('keydown.uniplayer');
    $(document).on('keydown.uniplayer', function(e) {
        if ($(e.target).is('input, textarea, select')) return;
        switch (e.key) {
            case ' ': // Play/Pause
                e.preventDefault();
                $('#timerStartPause').click();
                break;
        }
    });
}