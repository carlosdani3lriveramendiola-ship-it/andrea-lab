from flask import Flask, jsonify, send_from_directory
from pathlib import Path
import time

BASE_DIR = Path(__file__).resolve().parent
UI_DIR = BASE_DIR / "ui"

app = Flask(__name__)

@app.route("/")
def index():
    return send_from_directory(UI_DIR, "index.html")

@app.route("/estilo.css")
def css():
    return send_from_directory(UI_DIR, "estilo.css")

@app.route("/app.js")
def javascript():
    return send_from_directory(UI_DIR, "app.js")

@app.route("/api/status")
def status():
    return jsonify({
        "raspberry": False,
        "esp32": False,
        "xvf3800": False,
        "timestamp": time.time()
    })

@app.route("/api/benchmark")
def benchmark():
    return jsonify({
        "stt": None,
        "llm": None,
        "tts": None,
        "conversion": None,
        "usb": None,
        "first_audio": None,
        "total": None
    })

if __name__ == "__main__":
    print()
    print("======================================")
    print("        ANDREA LABORATORIO")
    print("======================================")
    print()
    print("Interfaz: http://127.0.0.1:8765")
    print()

    app.run(
        host="127.0.0.1",
        port=8765,
        debug=True
    )
