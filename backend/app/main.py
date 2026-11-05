import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.routers import auth, resumes, jobs, applications, analytics, refresh

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("devlaunch")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect DB and seed default jobs/user if needed
    try:
        init_db()
        logger.info("DevLaunch MongoDB initialized and verified.")
    except Exception as e:
        logger.error(f"Startup database initialization error: {e}")
    yield
    # Shutdown logic if any


app = FastAPI(
    title="DevLaunch API",
    description="Python Backend API for DevLaunch — AI Job Discovery for Developers",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
origins = (
    [o.strip() for o in settings.CORS_ORIGIN.split(",") if o.strip()]
    if settings.CORS_ORIGIN != "*"
    else ["*"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5000", "http://localhost:80", "http://localhost", "*"] if "*" in origins else origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "message": "An internal server error occurred",
                "details": str(exc) if settings.DEBUG else None,
            },
        },
    )


# Health check
@app.get("/health")
@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "service": "DevLaunch Python API",
        "version": "1.0.0",
    }


@app.get("/")
async def root():
    return {
        "service": "DevLaunch Backend API",
        "platform": "Python / FastAPI",
        "status": "online",
        "docs": "/docs",
    }


# Mount all API routers
app.include_router(auth.router, prefix="/api")
app.include_router(resumes.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(applications.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(refresh.router, prefix="/api")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
