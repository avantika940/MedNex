"""
MedNex Backend - AI-Powered Medical Symptom Checker API

This is the main FastAPI application that provides endpoints for:
- Symptom extraction using BioBERT NER
- Disease prediction based on symptoms
- Knowledge graph generation
- Conversational AI using Groq LLaMA
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging first
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import routers
try:
    from routers.symptoms import router as symptoms_router
    from routers.prediction import router as prediction_router
    from routers.graph import router as graph_router
    from routers.explanation import router as explanation_router
    from routers.chat import router as chat_router
    from routers.auth import router as auth_router
    from routers.admin import router as admin_router
    from routers.customer import router as customer_router
    logger.info("All routers imported successfully")
except ImportError as e:
    logger.error(f"Failed to import routers: {e}")
    # Create minimal routers for basic functionality
    from fastapi import APIRouter
    symptoms_router = APIRouter()
    prediction_router = APIRouter()
    graph_router = APIRouter()
    explanation_router = APIRouter()
    chat_router = APIRouter()
    auth_router = APIRouter()
    admin_router = APIRouter()
    customer_router = APIRouter()
    logger.warning("Using fallback routers")

# Initialize FastAPI app
app = FastAPI(
    title="MedNex API",
    description="AI-Powered Medical Symptom Checker API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["authentication"])
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])
app.include_router(customer_router, prefix="/api/customer", tags=["customer"])
app.include_router(symptoms_router, prefix="/api", tags=["symptoms"])
app.include_router(prediction_router, prefix="/api", tags=["prediction"])
app.include_router(graph_router, prefix="/api", tags=["graph"])
app.include_router(explanation_router, prefix="/api", tags=["explanation"])
app.include_router(chat_router, prefix="/api", tags=["chat"])

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "MedNex API - AI-Powered Medical Symptom Checker",
        "version": "1.0.0",
        "status": "active",
        "disclaimer": "This is an educational tool, not a medical diagnostic system. Always consult healthcare professionals for medical advice."
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "API is running"}

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred. Please try again.",
            "disclaimer": "This is an educational tool. Consult healthcare professionals for medical advice."
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )
