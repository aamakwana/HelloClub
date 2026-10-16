from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.controllers.activity_controller import router as activity_router
from app.controllers.activity_request_controller import router as activity_request_router
from app.controllers.health_controller import router as health_router
from app.controllers.message_controller import router as message_router
from app.controllers.profile_controller import router as profile_router
from app.controllers.task_controller import router as task_router
from app.core.config import settings

app = FastAPI(title='Launchpad API')
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins,
    allow_methods=['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allow_headers=['Authorization', 'Content-Type'],
)
app.include_router(health_router)
app.include_router(task_router)
app.include_router(activity_router)
app.include_router(activity_request_router)
app.include_router(message_router)
app.include_router(profile_router)
