from fastapi import APIRouter
from models import StatusResponse, TaskResponse
from celery.result import AsyncResult
from celery_app import celery_app
from typing import List




router = APIRouter()

@router.post("/status", response_model=StatusResponse)
def get_file_status(task_ids: List[str]):
    status_list = []

    for task_id in task_ids:
        res = AsyncResult(task_id, app=celery_app)

        task_response = TaskResponse(
            task_id=task_id,
            status=res.status,
            message=f"Task {res.status.lower()}"
        )

        status_list.append(task_response)

    return StatusResponse(tasks=status_list)
