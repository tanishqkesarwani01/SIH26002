@echo off
echo ========================================================
echo  Starting FastAPI Backend for NER Logistics Platform
echo ========================================================
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
