from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from admin.service.service import get_current_admin
from database.database import get_db
from logs.model.model import SystemLogs
from logs.schema.scheam import UserActionLogResponse

router = APIRouter(prefix="/logs", tags=["logs"])

@router.get("/admin")
def list_admin_logs(
    start_date: Optional[date] = Query(None, description="Inclusive start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Inclusive end date (YYYY-MM-DD)"),
    action: Optional[str] = Query(None, min_length=1, max_length=100),
    entity: Optional[str] = Query(None, min_length=1, max_length=100),
    search: Optional[str] = Query(None, min_length=1, max_length=200),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    admin_id: str = Depends(get_current_admin),
):
    """Return paginated audit records to authenticated admins only."""
    if start_date and end_date and start_date > end_date:
        raise HTTPException(status_code=422, detail="start_date must be on or before end_date")

    query = db.query(SystemLogs)
    if start_date:
        query = query.filter(func.date(SystemLogs.created_at) >= start_date)
    if end_date:
        query = query.filter(func.date(SystemLogs.created_at) <= end_date)
    if action:
        query = query.filter(SystemLogs.action.ilike('%' + action.strip() + '%'))
    if entity:
        query = query.filter(SystemLogs.entity.ilike('%' + entity.strip() + '%'))
    if search:
        term = '%' + search.strip() + '%'
        query = query.filter(or_(
            SystemLogs.description.ilike(term),
            SystemLogs.action.ilike(term),
            SystemLogs.entity.ilike(term),
            SystemLogs.entity_id.ilike(term),
        ))

    total = query.with_entities(func.count(SystemLogs.id)).scalar() or 0
    records = query.order_by(SystemLogs.created_at.desc(), SystemLogs.id.desc()).offset((page - 1) * limit).limit(limit).all()
    return {
        "items": [UserActionLogResponse.model_validate(record).model_dump(mode="json") for record in records],
        "page": page, "limit": limit, "total": total, "pages": (total + limit - 1) // limit,
    }