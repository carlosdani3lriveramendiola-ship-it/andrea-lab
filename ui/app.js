/* =========================================================
   ANDREA LAB
   Control principal de la interfaz
   ========================================================= */

"use strict";


/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

const API_STATUS = "/api/status";
const API_BENCHMARK = "/api/benchmark";


/* =========================================================
   UTILIDADES
   ========================================================= */

function $(id) {
    return document.getElementById(id);
}


function nowTime() {
    return new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}


function nowDate() {
    return new Date().toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
}


function log(message, type = "normal") {

    const logBox = $("system-log");

    if (!logBox) return;

    const line = document.createElement("div");

    line.textContent =
        `[${nowTime()}] ${message}`;

    if (type === "success") {
        line.style.color = "#22c55e";
    }

    if (type === "error") {
        line.style.color = "#ff5252";
    }

    if (type === "warning") {
        line.style.color = "#f59e0b";
    }

    logBox.appendChild(line);

    logBox.scrollTop = logBox.scrollHeight;
}


/* =========================================================
   RELOJ
   ========================================================= */

function updateClock() {

    const date = $("current-date");
    const time = $("current-time");

    if (date) {
        date.textContent = nowDate();
    }

    if (time) {

        time.textContent =
            new Date().toLocaleTimeString(
                "es-MX",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

    }
}


setInterval(updateClock, 1000);

updateClock();


/* =========================================================
   ESTADO DEL HARDWARE
   ========================================================= */

function setHardwareStatus(
    selector,
    online,
    onlineText = "CONECTADO",
    offlineText = "DESCONECTADO"
) {

    const element =
        document.querySelector(selector);

    if (!element) return;

    const dot =
        element.querySelector(".status-dot");

    if (online) {

        element.classList.remove("offline");
        element.classList.add("online");

        element.childNodes.forEach(node => {

            if (node.nodeType === Node.TEXT_NODE) {
                node.textContent =
                    ` ${onlineText}`;
            }

        });

        if (dot) {
            dot.style.color = "#22c55e";
        }

    } else {

        element.classList.remove("online");
        element.classList.add("offline");

        element.childNodes.forEach(node => {

            if (node.nodeType === Node.TEXT_NODE) {
                node.textContent =
                    ` ${offlineText}`;
            }

        });

        if (dot) {
            dot.style.color = "#ff5252";
        }
    }
}


/* =========================================================
   CONSULTAR FLASK
   ========================================================= */

async function updateHardwareStatus() {

    try {

        const response =
            await fetch(API_STATUS);

        if (!response.ok) {
            throw new Error("Servidor no respondió correctamente");
        }

        const data =
            await response.json();


        /* Raspberry */

        setHardwareStatus(
            ".hardware-card:nth-child(1) .status",
            data.raspberry,
            "CONECTADA",
            "DESCONECTADA"
        );


        /* ESP32 */

        setHardwareStatus(
            ".hardware-card:nth-child(2) .status",
            data.esp32,
            "CONECTADO",
            "NO DETECTADO"
        );


        /* XVF3800 */

        setHardwareStatus(
            ".hardware-card:nth-child(3) .status",
            data.xvf3800,
            "CONECTADO",
            "NO DETECTADO"
        );


        /* USB */

        setHardwareStatus(
            ".hardware-card:nth-child(4) .status",
            data.xvf3800,
            "CONECTADO",
            "NO DETECTADO"
        );


        log("Estado del sistema actualizado.");

    }

    catch (error) {

        console.error(error);

        log(
            "No se pudo consultar el estado del servidor.",
            "error"
        );

    }
}


/* =========================================================
   RESULTADOS
   ========================================================= */

function setMetric(id, value) {

    const element = $(id);

    if (!element) return;

    if (
        value === null ||
        value === undefined ||
        value === "--"
    ) {
        element.textContent = "--";
        return;
    }

    element.textContent =
        Math.round(value);
}


function updateMetrics(data) {

    setMetric(
        "metric-stt",
        data.stt
    );

    setMetric(
        "metric-llm",
        data.llm
    );

    setMetric(
        "metric-tts",
        data.tts
    );

    setMetric(
        "metric-conversion",
        data.conversion
    );

    setMetric(
        "metric-usb",
        data.usb
    );

    setMetric(
        "metric-first-audio",
        data.first_audio
    );


    if (data.total !== null) {

        $("metric-total").textContent =
            `${Math.round(data.total)} ms`;

    }


    updateChart(data);

}


/* =========================================================
   GRÁFICA
   ========================================================= */

function updateChart(data) {

    const values = [
        data.stt,
        data.llm,
        data.tts,
        data.conversion,
        data.usb,
        data.first_audio
    ];


    const bars =
        document.querySelectorAll(".chart .bar");


    const validValues =
        values.filter(
            value =>
                value !== null &&
                value !== undefined
        );


    if (!validValues.length) {
        return;
    }


    const max =
        Math.max(...validValues);


    bars.forEach((bar, index) => {

        const value =
            values[index];

        if (
            value === null ||
            value === undefined
        ) {

            bar.style.height = "4px";

            const label =
                bar.querySelector("span");

            if (label) {
                label.textContent = "--";
            }

            return;
        }


        const height =
            Math.max(
                8,
                (value / max) * 155
            );


        bar.style.height =
            `${height}px`;


        const label =
            bar.querySelector("span");


        if (label) {
            label.textContent =
                `${Math.round(value)} ms`;
        }

    });

}


/* =========================================================
   SIMULACIÓN DE PRUEBAS
   ========================================================= */

function simulatedBenchmark(testName) {

    const base = {

        stt:
            5973,

        llm:
            2492,

        tts:
            1874,

        conversion:
            706,

        usb:
            302,

        first_audio:
            11579

    };


    /* Variación pequeña para cada prueba */

    const variation =
        () =>
            Math.round(
                0.90 +
                Math.random() * 0.20,
                2
            );


    let result = {

        stt:
            base.stt * variation(),

        llm:
            base.llm * variation(),

        tts:
            base.tts * variation(),

        conversion:
            base.conversion * variation(),

        usb:
            base.usb * variation(),

        first_audio:
            base.first_audio * variation()

    };


    result.total =
        result.stt +
        result.llm +
        result.tts +
        result.conversion +
        result.usb;


    return result;
}


/* =========================================================
   EJECUTAR PRUEBA
   ========================================================= */

async function runTest(testName) {

    log(
        `Iniciando prueba: ${testName.toUpperCase()}...`
    );


    const result =
        simulatedBenchmark(testName);


    await new Promise(
        resolve =>
            setTimeout(resolve, 700)
    );


    updateMetrics(result);


    if ($("last-test")) {

        $("last-test").textContent =
            `Prueba ${testName.toUpperCase()} completada · ${nowTime()}`;

    }


    if ($("progress-bar")) {

        $("progress-bar").style.width =
            "100%";

    }


    log(
        `Prueba ${testName.toUpperCase()} completada.`,
        "success"
    );


    addHistory(
        testName.toUpperCase(),
        result.total
    );

}


/* =========================================================
   PRUEBA COMPLETA
   ========================================================= */

async function runCompleteTest() {

    const button =
        $("btn-complete");


    if (button) {

        button.disabled = true;

        button.textContent =
            "⏳ EJECUTANDO...";

    }


    if ($("progress-bar")) {
        $("progress-bar").style.width =
            "5%";
    }


    if ($("system-log")) {

        log(
            "================================"
        );

        log(
            "INICIANDO PRUEBA COMPLETA",
            "warning"
        );

        log(
            "Analizando pipeline de Andrea..."
        );

    }


    await new Promise(
        resolve =>
            setTimeout(resolve, 1000)
    );


    if ($("progress-bar")) {
        $("progress-bar").style.width =
            "45%";
    }


    const result =
        simulatedBenchmark("completa");


    await new Promise(
        resolve =>
            setTimeout(resolve, 1000)
    );


    updateMetrics(result);


    if ($("progress-bar")) {
        $("progress-bar").style.width =
            "100%";
    }


    if ($("last-test")) {

        $("last-test").textContent =
            `Prueba completa · ${nowTime()}`;

    }


    const completion =
        document.querySelector(
            ".completion-status strong"
        );


    if (completion) {
        completion.textContent =
            "COMPLETADA";
    }


    const completionSmall =
        document.querySelector(
            ".completion-status small"
        );


    if (completionSmall) {
        completionSmall.textContent =
            "Benchmark ejecutado correctamente";
    }


    log(
        "STT: " +
        Math.round(result.stt) +
        " ms"
    );

    log(
        "LLM: " +
        Math.round(result.llm) +
        " ms"
    );

    log(
        "TTS: " +
        Math.round(result.tts) +
        " ms"
    );

    log(
        "Conversión: " +
        Math.round(result.conversion) +
        " ms"
    );

    log(
        "USB: " +
        Math.round(result.usb) +
        " ms"
    );

    log(
        "Tiempo total: " +
        Math.round(result.total) +
        " ms",
        "success"
    );


    addHistory(
        "COMPLETA",
        result.total
    );


    if (button) {

        button.disabled = false;

        button.textContent =
            "▶ PRUEBA COMPLETA";

    }

}


/* =========================================================
   HISTORIAL
   ========================================================= */

function addHistory(type, total) {

    const body =
        $("history-body");

    if (!body) return;


    const empty =
        body.querySelector(".empty-history");


    if (empty) {
        empty.remove();
    }


    const row =
        document.createElement("div");


    row.innerHTML = `

        <span>
            ${nowTime()}
        </span>

        <span>
            ${type}
        </span>

        <span>
            ${Math.round(total)} ms
        </span>

        <span style="color:#22c55e;">
            ✓ OK
        </span>

    `;


    body.prepend(row);


    /* máximo 8 */

    while (body.children.length > 8) {

        body.removeChild(
            body.lastElementChild
        );

    }

}


/* =========================================================
   BOTONES DE PRUEBA
   ========================================================= */

function setupTestButtons() {

    const buttons =
        document.querySelectorAll(
            ".test-button"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const test =
                    button.dataset.test;

                runTest(test);

            }
        );

    });

}


/* =========================================================
   BOTÓN PRUEBA COMPLETA
   ========================================================= */

function setupCompleteButton() {

    const button =
        $("btn-complete");


    if (!button) return;


    button.addEventListener(
        "click",
        runCompleteTest
    );

}


/* =========================================================
   LIMPIAR LOG
   ========================================================= */

function setupClearLog() {

    const button =
        $("clear-log");


    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            const logBox =
                $("system-log");


            if (logBox) {

                logBox.innerHTML = "";

                log(
                    "Registro limpiado."
                );

            }

        }
    );

}


/* =========================================================
   NAVEGACIÓN
   ========================================================= */

function setupNavigation() {

    const buttons =
        document.querySelectorAll(
            ".nav-item"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                buttons.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                button.classList.add(
                    "active"
                );


                const section =
                    button.dataset.section;


                log(
                    `Sección seleccionada: ${section}`
                );

            }
        );

    });

}


/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

function init() {

    console.log(
        "================================"
    );

    console.log(
        "       ANDREA LAB"
    );

    console.log(
        "     Sistema iniciado"
    );

    console.log(
        "================================"
    );


    setupTestButtons();

    setupCompleteButton();

    setupClearLog();

    setupNavigation();


    updateHardwareStatus();


    /* actualizar hardware cada 5 segundos */

    setInterval(
        updateHardwareStatus,
        5000
    );


    log(
        "Andrea Lab iniciado.",
        "success"
    );

    log(
        "Esperando conexión de hardware..."
    );

}


document.addEventListener(
    "DOMContentLoaded",
    init
);
