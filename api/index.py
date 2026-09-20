import sys
import os

# Add root directory to sys.path so 'backend' imports resolve on Vercel
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.main import app

# Export FastAPI app for Vercel @vercel/python builder
handler = app
