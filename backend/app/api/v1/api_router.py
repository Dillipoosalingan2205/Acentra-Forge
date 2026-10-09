from fastapi import APIRouter
from app.api.v1.endpoints import discharge, patients, tasks, reviews, providers

api_router = APIRouter()

api_router.include_router(discharge.router)
api_router.include_router(patients.router)
api_router.include_router(tasks.router)
api_router.include_router(reviews.router)
api_router.include_router(providers.router)
