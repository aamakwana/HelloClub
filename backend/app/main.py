from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.controllers.health_controller import router as health_router
from app.controllers.task_controller import router as task_router
from app.core.config import settings

app = FastAPI(title='Launchpad API')
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins,
    allow_methods=['GET', 'POST', 'PATCH', 'DELETE'],
    allow_headers=['Authorization', 'Content-Type'],
)
app.include_router(health_router)
app.include_router(task_router)
