from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.db.session import get_db
from app.db.models.provider import CareProvider
from app.schemas.provider import ProviderSearchResponse, ProviderItem
from app.agents.provider_agent import ProviderAgent

router = APIRouter(prefix="/providers", tags=["Provider Finder"])

@router.get(
    "/search",
    response_model=ProviderSearchResponse,
    summary="Search synthetic Care Provider Finder dataset"
)
async def search_providers(
    specialty: Optional[str] = Query(None, description="Clinical specialty (e.g., Cardiology, Physical Therapy)"),
    location: Optional[str] = Query(None, description="Location filter (e.g., Metro City, Chennai)"),
    radius_km: float = Query(10.0, description="Search radius in kilometers"),
    db: AsyncSession = Depends(get_db)
):
    query = select(CareProvider)
    res = await db.execute(query)
    all_providers = res.scalars().all()

    pool = [
        {
            "id": p.id,
            "name": p.name,
            "specialty": p.specialty,
            "facility_type": p.facility_type,
            "address": p.address,
            "location": p.location,
            "distance_km": p.distance_km,
            "rating": p.rating,
            "contact_synthetic": p.contact_synthetic
        }
        for p in all_providers
    ]

    matched = ProviderAgent.match_providers(
        providers_pool=pool,
        specialty=specialty,
        location=location,
        radius_km=radius_km
    )

    items = [
        ProviderItem(
            id=m["id"],
            name=m["name"],
            specialty=m["specialty"],
            facility_type=m["facility_type"],
            address=m["address"],
            distance_km=m["distance_km"],
            rating=m["rating"],
            contact_synthetic=m["contact_synthetic"]
        )
        for m in matched
    ]

    return ProviderSearchResponse(
        disclaimer=(
            "Synthetic data match. Availability, appointment slots, and "
            "network participation are not guaranteed."
        ),
        providers=items
    )
