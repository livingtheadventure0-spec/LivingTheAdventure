import os

import razorpay
from fastapi import HTTPException


def get_razorpay_client():
    """
    Build a Razorpay client only when an endpoint needs it.

    Missing deployment environment variables should return a clear API error,
    not prevent the entire FastAPI application from starting.
    """
    key_id = os.getenv("RAZORPAY_KEY_ID")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET")

    if not key_id or not key_secret:
        raise HTTPException(
            status_code=503,
            detail="Razorpay is not configured on the server. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
        )

    return razorpay.Client(auth=(key_id, key_secret))


def get_razorpay_key_id() -> str:
    key_id = os.getenv("RAZORPAY_KEY_ID")
    if not key_id:
        raise HTTPException(
            status_code=503,
            detail="Razorpay is not configured on the server. Set RAZORPAY_KEY_ID.",
        )
    return key_id
