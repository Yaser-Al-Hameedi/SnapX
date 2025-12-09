from fastapi import APIRouter
from models import StatusResponse, TaskResponse
from celery.result import AsyncResult
from celery_app import celery_app
from typing import List




router = APIRouter()

@router.post("/status", response_model=StatusResponse) # Returning status response = List of TaskResponse
def get_file_status(task_ids: List[str]): # Take in a list of task_ids
    status_list = []

    for task_id in task_ids:
        res = AsyncResult(task_id, app=celery_app) # Accessing Redis Databse 

        task_response = TaskResponse( # Grabbing specific tasks info and building the TaskResponse
            task_id=task_id,
            status=res.status,
            message=f"Task {res.status.lower()}"
        )

        status_list.append(task_response)

    return StatusResponse(tasks=status_list)
