import asyncio
import os
from app.db.session import init_db, AsyncSessionLocal
from app.services.synthetic_seed import seed_synthetic_data, generate_sample_pdf_files

async def reset():
    await init_db()
    async with AsyncSessionLocal() as session:
        await seed_synthetic_data(session)
    generate_sample_pdf_files()
    print("Database and benchmark summaries initialized!")

if __name__ == "__main__":
    asyncio.run(reset())
