from pydantic import BaseModel, Field
from typing import List, Optional

class ProviderItem(BaseModel):
    id: str
    name: str
    specialty: str
    facility_type: str # Clinic | Hospital | Diagnostic Lab
    address: str
    distance_km: float
    rating: float
    contact_synthetic: str

class ProviderSearchResponse(BaseModel):
    disclaimer: str = (
        "Synthetic data match. Availability, appointment slots, and network "
        "participation are not guaranteed."
    )
    providers: List[ProviderItem]
