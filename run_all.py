import os
import sys
import subprocess
import time
import webbrowser
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"

def check_and_install_backend():
    print("=" * 60)
    print("🔧 Checking & Installing Backend Dependencies...")
    print("=" * 60)
    req_file = BACKEND_DIR / "requirements.txt"
    if req_file.exists():
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", str(req_file)], check=True)
    print("✅ Backend dependencies ready.")

def check_and_install_frontend():
    print("=" * 60)
    print("🔧 Checking & Installing Frontend Dependencies...")
    print("=" * 60)
    if not (FRONTEND_DIR / "node_modules").exists():
        subprocess.run(["npm", "install"], cwd=str(FRONTEND_DIR), shell=True, check=True)
    print("✅ Frontend dependencies ready.")

def main():
    print("""
    ===============================================================
    🚀 NORTHEAST INDIA LOGISTICS RESILIENCE PLATFORM (NER-LRP) 🚀
    ===============================================================
    AI & GIS-Driven Regional Logistics Control Tower
    ---------------------------------------------------------------
    • Real Meteorological Ingestion: Open-Meteo & IMD Live APIs
    • Real Terrain Elevation & Slope: SRTM DEM Geodata
    • Real Highway Topology: OpenStreetMap (OSM) Graph
    • Geospatial Hazard Risk ML: XGBoost / Gradient Boosting Model
    • Cargo Prioritization: Life-saving Medicines vs General Freight
    • Offline-First Field PWA: Geo-Photo Incident Syncing
    • Multilingual Alert Center: Assamese, Mizo, Manipuri, Bengali, Hindi, English
    ===============================================================
    """)

    check_and_install_backend()
    check_and_install_frontend()

    print("\n🚀 Starting FastAPI Backend Server on http://localhost:8000 ...")
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
        cwd=str(BACKEND_DIR)
    )

    print("🚀 Starting Vite React Frontend on http://localhost:5173 ...")
    frontend_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=str(FRONTEND_DIR),
        shell=True
    )

    time.sleep(3)
    print("\n🌐 Opening NER Logistics Control Tower in Browser: http://localhost:5173 ...")
    try:
        webbrowser.open("http://localhost:5173")
    except Exception:
        pass

    print("\n🟢 Both Backend and Frontend are running live.")
    print("Press Ctrl+C to stop all servers.\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Done. Goodbye!")

if __name__ == "__main__":
    main()
