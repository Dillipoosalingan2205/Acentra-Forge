import asyncio
import os
import sys
from httpx import AsyncClient, ASGITransport

# Ensure current directory is in sys.path
sys.path.insert(0, os.path.abspath("."))

from app.main import app
from app.db.session import init_db, AsyncSessionLocal
from app.services.synthetic_seed import seed_synthetic_data

async def run_tests():
    print("=" * 60)
    print("RUNNING COMPLETE API SPECIFICATION & GUARDRAIL TEST SUITE")
    print("=" * 60)

    # Initialize DB & Seed Data
    await init_db()
    async with AsyncSessionLocal() as session:
        await seed_synthetic_data(session)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health Check
        h_res = await client.get("/health")
        assert h_res.status_code == 200, f"Health check failed: {h_res.text}"
        print("[PASS] 1. GET /health - Status:", h_res.json()["status"])

        # 2. Get Pre-seeded Patient Plan (Margaret Higgins - pat-syn-003)
        plan_res = await client.get("/api/patients/pat-syn-003/plan?lang=en")
        assert plan_res.status_code == 200, f"Get plan failed: {plan_res.text}"
        plan = plan_res.json()
        print("Actual patient_name in plan:", repr(plan["patient_name"]))
        assert "Margaret" in plan["patient_name"]
        assert "warning_signs" in plan
        assert len(plan["care_instructions"]) > 0
        print(f"[PASS] 2. GET /api/patients/{{id}}/plan (en) - Patient: {plan['patient_name']}, Total Actions: {plan['metrics']['total_actions']}")

        # 3. Multilingual Plan Check (Hindi and Tamil)
        hi_res = await client.get("/api/patients/pat-syn-003/plan?lang=hi")
        assert hi_res.status_code == 200
        ta_res = await client.get("/api/patients/pat-syn-003/plan?lang=ta")
        assert ta_res.status_code == 200
        print("[PASS] 3. Multilingual Translation: Hindi & Tamil generated successfully")

        # 4. Get Tasks
        tasks_res = await client.get("/api/patients/pat-syn-003/tasks?status=All")
        assert tasks_res.status_code == 200
        tasks = tasks_res.json()["tasks"]
        assert len(tasks) > 0
        first_task_id = tasks[0]["id"]
        print(f"[PASS] 4. GET /api/patients/{{id}}/tasks - Found {len(tasks)} tasks")

        # 5. Patch Task Status
        patch_t = await client.patch(f"/api/tasks/{first_task_id}", json={"status": "Completed", "notes": "Verified by nurse"})
        assert patch_t.status_code == 200
        assert patch_t.json()["updated_status"] == "Completed"
        print(f"[PASS] 5. PATCH /api/tasks/{{id}} - Task {first_task_id[:8]} marked Completed")

        # 6. Get Review Queue
        rev_res = await client.get("/api/reviews?priority=All")
        assert rev_res.status_code == 200
        cases = rev_res.json()["review_cases"]
        assert len(cases) > 0, "Expected at least 1 escalation case"
        first_case_id = cases[0]["case_id"]
        print(f"[PASS] 6. GET /api/reviews - Found {len(cases)} review cases, Top Priority: {cases[0]['priority']}")

        # 7. Patch / Resolve Review Case
        patch_rev = await client.patch(f"/api/reviews/{first_case_id}", json={
            "action": "APPROVE",
            "reviewer_notes": "Reviewed with attending cardiologist. Dosage confirmed.",
            "resolved_values": {"due_date": "2026-10-18"}
        })
        assert patch_rev.status_code == 200
        assert patch_rev.json()["resolution_status"] == "RESOLVED"
        print(f"[PASS] 7. PATCH /api/reviews/{{id}} - Case {first_case_id[:8]} resolved successfully")

        # 8. Provider Search
        prov_res = await client.get("/api/providers/search?specialty=Cardiology&radius_km=10")
        assert prov_res.status_code == 200
        provs = prov_res.json()
        assert len(provs["providers"]) > 0
        assert "disclaimer" in provs
        print(f"[PASS] 8. GET /api/providers/search - Found {len(provs['providers'])} matching synthetic providers")

        # 9. Upload Flow (Sample 1 Diverticulitis)
        sample_path = "synthetic_data/discharge_summaries/sample_1_simple.pdf"
        with open(sample_path, "rb") as f:
            pdf_bytes = f.read()

        up_res = await client.post(
            "/api/discharge/upload",
            files={"file": ("sample_upload.pdf", pdf_bytes, "application/pdf")},
            data={"language_preference": "en"}
        )
        assert up_res.status_code == 202
        up_data = up_res.json()
        discharge_id = up_data["discharge_id"]
        print(f"[PASS] 9. POST /api/discharge/upload - 202 Accepted. Discharge ID: {discharge_id[:8]}")

        # 10. Status Polling
        status_res = await client.get(f"/api/discharge/{discharge_id}/status")
        assert status_res.status_code == 200
        s_data = status_res.json()
        print(f"[PASS] 10. GET /api/discharge/{{id}}/status - Progress: {s_data['progress_percentage']}%, Step: {s_data['current_step']}")

    print("=" * 60)
    print("ALL 10 VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_tests())
