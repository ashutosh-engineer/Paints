from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from models import Base, Category, Product
import sys

# Create database engine
DATABASE_URL = "sqlite:///./shop.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Create session
from sqlalchemy.orm import sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

print("🚀 Populating database with all products...")

# Create categories
categories_data = [
    {"name": "All-wood Series", "slug": "all-wood-series", "description": "Premium wood coating solutions"},
    {"name": "All-dry Series", "slug": "all-dry-series", "description": "Quick-dry coating products"},
    {"name": "Calista Series", "slug": "calista-series", "description": "Elegant interior finishes"},
    {"name": "Pearl Series", "slug": "pearl-series", "description": "Lustrous pearl finishes"},
    {"name": "Supreme Series", "slug": "supreme-series", "description": "Supreme quality paints"},
    {"name": "Texture Series", "slug": "texture-series", "description": "Textured wall finishes"},
    {"name": "Red Series", "slug": "red-series", "description": "Premium red oxide paints"},
    {"name": "Waterproofing", "slug": "waterproofing", "description": "Water protection solutions"},
    {"name": "Primer Series", "slug": "primer-series", "description": "Base coating primers"},
]

categories = {}
for cat_data in categories_data:
    existing = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
    if not existing:
        category = Category(**cat_data, is_active=True)
        db.add(category)
        db.commit()
        db.refresh(category)
        categories[cat_data["slug"]] = category
        print(f"✓ Created category: {cat_data['name']}")
    else:
        categories[cat_data["slug"]] = existing
        print(f"✓ Category exists: {cat_data['name']}")

# All-wood Series Products
allwood_products = [
    {
        "name": "Allwood 1k Finish (Soft Touch)",
        "description": "Premium 1K finish with soft touch for wood surfaces",
        "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/04df5763-30b8-4daa-9eec-075c7c0cbb70.jpg",
        "size": "1L",
        "finish": "Soft Touch",
        "stock": 100,
        "price": 850,
        "original_price": 1000,
    },
    {
        "name": "Melamine (Premium Finish)",
        "description": "Premium melamine finish for durable wood coating",
        "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/0ed58c94-c96c-456a-a90d-598854333aad.jpg",
        "size": "1L",
        "finish": "Premium",
        "stock": 100,
        "price": 950,
        "original_price": 1100,
    },
    {
        "name": "Allwood 2k (High Gloss)",
        "description": "High gloss 2K finish for professional wood coating",
        "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/1c7ac8d4-2b3d-4db7-a6ec-1e8a42ba5c69.jpg",
        "size": "1L",
        "finish": "High Gloss",
        "stock": 100,
        "price": 1200,
        "original_price": 1400,
    },
    {
        "name": "Allwood 2k (Matt Finish)",
        "description": "Matt finish 2K coating for elegant wood surfaces",
        "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/1fb6dfc9-2edc-48d0-8f31-6b2fb9f69f0c.jpg",
        "size": "1L",
        "finish": "Matt",
        "stock": 100,
        "price": 1200,
        "original_price": 1400,
    },
    {
        "name": "Opus Allwood NC Deco",
        "description": "NC deco finish for decorative wood coating",
        "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/5bfb24ea-e2f2-4da0-bc6e-11dd4b4c8eb5.jpg",
        "size": "1L",
        "finish": "Deco",
        "stock": 100,
        "price": 750,
        "original_price": 900,
    },
    {
        "name": "Opus Allwood Sanding Sealer",
        "description": "Professional sanding sealer for wood preparation",
        "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/9f1f6cd9-c91b-4b53-892b-0d7c681e5e4b.jpg",
        "size": "1L",
        "finish": "Sealer",
        "stock": 100,
        "price": 600,
        "original_price": 750,
    },
    {
        "name": "Opus Allwood PU Luxury Finish",
        "description": "Luxury PU finish for premium wood coating",
        "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/a0c7f73c-63df-4076-a17d-c9a8bfcd04ee.jpg",
        "size": "1L",
        "finish": "Luxury",
        "stock": 100,
        "price": 1500,
        "original_price": 1800,
    },
    {
        "name": "Opus Allwood Wood Stain",
        "description": "Premium wood stain for natural wood enhancement",
        "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/add83dd8-b4c5-465d-805f-c0dc57afa64a.jpg",
        "size": "1L",
        "finish": "Stain",
        "stock": 100,
        "price": 550,
        "original_price": 700,
    },
    {
        "name": "Opus Allwood Melamine",
        "description": "Professional melamine coating for wood surfaces",
        "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/c7c89b31-1d1f-475f-aa97-6c72c0dd2bb4.jpg",
        "size": "1L",
        "finish": "Melamine",
        "stock": 100,
        "price": 900,
        "original_price": 1100,
    },
    {
        "name": "Opus Allwood Italian PU",
        "description": "Italian PU finish for superior wood protection",
        "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/cc11e69f-b3e8-485f-abc0-af28f53d2f25.jpg",
        "size": "1L",
        "finish": "Italian PU",
        "stock": 100,
        "price": 1600,
        "original_price": 1900,
    },
]

category_allwood = categories["all-wood-series"]
for product_data in allwood_products:
    product = Product(
        category_id=category_allwood.id,
        **product_data,
        is_active=True,
        is_featured=True
    )
    db.add(product)
    print(f"  ✓ Added: {product_data['name']}")

# All-dry Series Products
alldry_products = [
    {
        "name": "Opus All-dry Exterior Gloss",
        "description": "Quick-dry exterior gloss finish",
        "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20Opus%20all%20dry%20series/061c8e8c-8c6e-4d6d-be19-82e0ba0c2dd1.jpg",
        "size": "1L",
        "finish": "Gloss",
        "stock": 100,
        "price": 650,
        "original_price": 800,
    },
    {
        "name": "Opus All-dry Interior Gloss",
        "description": "Fast-drying interior gloss paint",
        "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20Opus%20all%20dry%20series/6e5ad30c-0411-42bb-bc15-cf15c3b7f30f.jpg",
        "size": "1L",
        "finish": "Gloss",
        "stock": 100,
        "price": 600,
        "original_price": 750,
    },
    {
        "name": "Opus All-dry Quick Dry Enamel",
        "description": "Quick dry enamel for smooth finish",
        "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20Opus%20all%20dry%20series/b4da0e9c-7c80-4738-a56d-b9ae804b4d7c.jpg",
        "size": "1L",
        "finish": "Enamel",
        "stock": 100,
        "price": 700,
        "original_price": 850,
    },
]

category_alldry = categories["all-dry-series"]
for product_data in alldry_products:
    product = Product(
        category_id=category_alldry.id,
        **product_data,
        is_active=True,
        is_featured=True
    )
    db.add(product)
    print(f"  ✓ Added: {product_data['name']}")

db.commit()

# Count total products
total_products = db.query(Product).count()
print(f"\n✅ Database populated successfully!")
print(f"📦 Total products: {total_products}")
print(f"📁 Total categories: {len(categories)}")

db.close()
