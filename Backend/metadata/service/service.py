"""Database-backed metadata summaries for the admin dashboard.

Aggregate related counts in SQL rather than issuing one query per metric.
The response keys and meanings are kept compatible with the existing API.
"""

from datetime import datetime, timedelta

from sqlalchemy import case, func
from sqlalchemy.orm import Session

from authentication.model.model import User
from event.model.model import Event


def get_event_metadata(db: Session) -> dict:
    """Return event counts and activity timestamps using a small number of queries."""
    now = datetime.utcnow()
    today = now.date()
    week_start = now - timedelta(days=7)
    month_start = now.replace(day=1)

    stats = db.query(
        func.count(Event.id).label("total_events"),
        func.count(case((Event.status == "published", 1))).label("published_events"),
        func.count(case((Event.status == "draft", 1))).label("draft_events"),
        func.count(case((Event.status == "archived", 1))).label("archived_events"),
        func.count(case((Event.state == "Upcoming", 1))).label("upcoming_events"),
        func.count(case((Event.state == "Completed", 1))).label("completed_events"),
        func.count(case((Event.state == "In Progress", 1))).label("in_progress_events"),
        func.count(case((Event.state == "Sold Out", 1))).label("sold_out_events"),
        func.count(case((Event.event_type == "trek", 1))).label("trek_events"),
        func.count(case((Event.event_type == "trip", 1))).label("trip_events"),
        func.count(case((Event.event_type == "adventure", 1))).label("adventure_events"),
        func.count(case((Event.event_type == "peak", 1))).label("peak_events"),
        func.count(case((Event.event_type == "special_event", 1))).label("special_events"),
        func.count(case((func.date(Event.created_at) == today, 1))).label("created_today"),
        func.count(case((Event.created_at >= week_start, 1))).label("created_this_week"),
        func.count(case((Event.created_at >= month_start, 1))).label("created_this_month"),
        func.max(Event.updated_at).label("last_updated"),
    ).one()

    labels = dict(
        db.query(Event.label, func.count(Event.id))
        .group_by(Event.label)
        .all()
    )

    return {
        "total_events": stats.total_events,
        "published_events": stats.published_events,
        "draft_events": stats.draft_events,
        "archived_events": stats.archived_events,
        "upcoming_events": stats.upcoming_events,
        "completed_events": stats.completed_events,
        "in_progress_events": stats.in_progress_events,
        "sold_out_events": stats.sold_out_events,
        "trek_events": stats.trek_events,
        "trip_events": stats.trip_events,
        "adventure_events": stats.adventure_events,
        "peak_events": stats.peak_events,
        "special_events": stats.special_events,
        "labels": labels,
        "created_today": stats.created_today,
        "created_this_week": stats.created_this_week,
        "created_this_month": stats.created_this_month,
        "last_updated": stats.last_updated,
    }


def get_user_metadata(db: Session) -> dict:
    """Return user counts with one aggregate query."""
    now = datetime.utcnow()
    today = now.date()
    week_start = now - timedelta(days=7)
    month_start = now.replace(day=1)

    stats = db.query(
        func.count(User.user_id).label("total_users"),
        func.count(case((User.is_active.is_(True), 1))).label("active_users"),
        func.count(case((User.is_active.is_(False), 1))).label("inactive_users"),
        func.count(case((User.is_verified.is_(True), 1))).label("verified_users"),
        func.count(case((User.is_verified.is_(False), 1))).label("unverified_users"),
        func.count(case((User.email.isnot(None), 1))).label("users_with_email"),
        func.count(case((User.email.is_(None), 1))).label("users_without_email"),
        func.count(case((func.date(User.created_at) == today, 1))).label("new_users_today"),
        func.count(case((User.created_at >= week_start, 1))).label("new_users_this_week"),
        func.count(case((User.created_at >= month_start, 1))).label("new_users_this_month"),
    ).one()

    return {
        "total_users": stats.total_users,
        "active_users": stats.active_users,
        "inactive_users": stats.inactive_users,
        "verified_users": stats.verified_users,
        "unverified_users": stats.unverified_users,
        "users_with_email": stats.users_with_email,
        "users_without_email": stats.users_without_email,
        "new_users_today": stats.new_users_today,
        "new_users_this_week": stats.new_users_this_week,
        "new_users_this_month": stats.new_users_this_month,
    }
