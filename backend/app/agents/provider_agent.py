from typing import List, Dict, Any, Optional
import difflib

class ProviderAgent:
    """
    Fuzzy-matches referral needs against synthetic Care Provider Finder dataset.
    Ranks providers by specialty alignment, proximity, and rating.
    """

    @classmethod
    def match_providers(
        cls,
        providers_pool: List[Dict[str, Any]],
        specialty: Optional[str] = None,
        location: Optional[str] = None,
        radius_km: float = 10.0
    ) -> List[Dict[str, Any]]:
        results = []
        spec_query = (specialty or "").lower().strip()
        loc_query = (location or "").lower().strip()

        for prov in providers_pool:
            score = 1.0
            prov_spec = prov.get("specialty", "").lower()
            prov_loc = prov.get("location", "").lower()
            prov_dist = float(prov.get("distance_km", 5.0))

            # Filter or match by specialty
            if spec_query:
                if spec_query in prov_spec:
                    score += 2.0
                else:
                    similarity = difflib.SequenceMatcher(None, spec_query, prov_spec).ratio()
                    if similarity > 0.4:
                        score += similarity
                    else:
                        continue # Skip non-matching specialties if explicitly searched

            # Proximity filter
            if prov_dist > radius_km:
                continue

            # Location match boost
            if loc_query and loc_query in prov_loc:
                score += 1.0

            results.append({
                **prov,
                "_match_score": score
            })

        # Sort by match score and rating descending
        results.sort(key=lambda p: (p["_match_score"], p.get("rating", 0.0)), reverse=True)

        # Remove internal score
        clean_results = []
        for r in results:
            item = dict(r)
            item.pop("_match_score", None)
            clean_results.append(item)

        return clean_results
