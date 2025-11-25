function showTimerTab() {
    console.log('showTimerTab');

    $('#tabTimer').show();
    $('.navItemMobile').removeClass('navItemMobileActive');
    $('#navItemTimerMobile').addClass('navItemMobileActive');


    let intervalId = null;
    let currentSeconds = 0;
    let totalSecondsParam = 0; // Will be set when starting the counter
    let isPaused = false;

    /**
     * Formats a given number of seconds into h:mm:ss format.
     * @param {number} seconds - The total seconds to format.
     * @returns {string} The formatted time string (h:mm:ss).
     */
    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        const pad = (num) => num.toString().padStart(2, '0');

        return `${hours}:${pad(minutes)}:${pad(remainingSeconds)}`;
    }

    /**
     * Starts the counter from currentSeconds up to totalSecondsParam.
     * @param {number} totalSeconds - The total number of seconds the counter should reach.
     */

    function startCounter(totalSeconds) {
            // Si ya hay un intervalo activo, no hacemos nada a menos que esté pausado y queramos reanudar.
            if (intervalId !== null && !isPaused) {
                return; // Si ya está corriendo y no está pausado, salimos.
            }

            totalSecondsParam = totalSeconds;
            isPaused = false;
            //document.getElementById('pauseButton').textContent = 'Pause Counter'; // Aseguramos el texto correcto

            // Si hay un intervalo y está pausado, solo lo "reanuda" al poner isPaused a false.
            // Si no hay intervalo, lo creamos.
            if (intervalId === null) {
                 // Actualizar el display inmediatamente para evitar un retraso de 1s al inicio
                document.getElementById('timerDisplay').textContent = formatTime(currentSeconds);

                intervalId = setInterval(() => {
                    if (!isPaused) {
                        if (currentSeconds < totalSecondsParam) {
                            currentSeconds++;
                            document.getElementById('timerDisplay').textContent = formatTime(currentSeconds);
                        } else {
                            clearInterval(intervalId);
                            intervalId = null;
                            console.log("Counter finished!");
                        }
                    }
                }, 1000);
            }
        }

    function togglePause() {
        // Solo pausamos/reanudamos si hay un contador activo
        if (intervalId !== null) {
            isPaused = !isPaused;
            const pauseButton = document.getElementById('pauseButton');
            if (isPaused) {
                pauseButton.textContent = 'Resume Counter';
            } else {
                pauseButton.textContent = 'Pause Counter';
            }
        }
    }

    document.getElementById('startButton').addEventListener('click', () => {
        // Definimos aquí el total de segundos para el contador al iniciar.
        // Por ejemplo, 300 segundos = 5 minutos.
        const initialTotalSeconds = 300;

        if (intervalId === null) { // Si no hay ningún contador activo, lo iniciamos.
            startCounter(initialTotalSeconds);
        } else if (isPaused) { // Si hay un contador, pero está pausado, lo reanudamos.
            togglePause(); // Esto cambiará isPaused a false y el contador se reanudará.
        }
    });
}