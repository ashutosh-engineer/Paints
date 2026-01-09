# Backend (FastAPI)

## Setup

1. Create a virtual environment (recommended)
2. Install dependencies
3. Run the server

### Windows PowerShell
```
# In repo root
cd "backend"

# Create venv
python -m venv .venv
. .venv\Scripts\Activate.ps1

# Install deps
pip install -r requirements.txt

# Run
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Endpoints:
- GET / -> service info
- GET /health -> health check
- POST /echo {"message": "hello"}
