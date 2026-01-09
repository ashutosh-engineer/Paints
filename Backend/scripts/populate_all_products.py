"""
Populate Neon PostgreSQL database with ALL products from ShopScreen.js
Uses the same database connection as the main app
NO PRICE FIELDS - only name, description, image_path, series, size, finish
"""
import sys
import os

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, get_db, SessionLocal
from app.models import Base, Category, Product

print("🚀 Populating Neon PostgreSQL database with ALL products...")

# Create session
db = SessionLocal()

try:
    # First, delete all existing products
    deleted = db.query(Product).delete()
    db.commit()
    print(f"🗑️ Deleted {deleted} existing products")
    
    # Create categories
    categories_data = [
        {"name": "All-wood Series", "slug": "all-wood-series", "description": "Premium wood coating solutions", "display_order": 1},
        {"name": "Alldry Series Waterproof", "slug": "alldry-series-waterproof", "description": "Waterproofing solutions", "display_order": 2},
        {"name": "Calista Series Exterior", "slug": "calista-series-exterior", "description": "Premium exterior paints", "display_order": 3},
        {"name": "Opus Interior Series", "slug": "opus-interior-series", "description": "Interior paint solutions", "display_order": 4},
        {"name": "Opus One Interior", "slug": "opus-one-interior", "description": "Premium one interior series", "display_order": 5},
        {"name": "Opus One Series Interior", "slug": "opus-one-series-interior", "description": "One series interior paints", "display_order": 6},
        {"name": "Opus One Series Exterior", "slug": "opus-one-series-exterior", "description": "One series exterior paints", "display_order": 7},
        {"name": "Opus Style Series Interior", "slug": "opus-style-series-interior", "description": "Style series interior paints", "display_order": 8},
        {"name": "Opus Style Series Oil Paint", "slug": "opus-style-series-oil-paint", "description": "Oil based paints and primers", "display_order": 9},
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

    # All-wood Series Products (10 products)
    allwood_products = [
        {
            "name": "Allwood 1k Finish (Soft Touch)",
            "description": "Premium 1K finish with soft touch for wood surfaces",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/04df5763-30b8-4daa-9eec-075c7c0cbb70.jpg",
            "size": "1L",
            "finish": "Soft Touch",
        },
        {
            "name": "Melamine (Premium Finish)",
            "description": "Premium melamine finish for durable wood coating",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/0ed58c94-c96c-456a-a90d-598854333aad.jpg",
            "size": "1L",
            "finish": "Premium",
        },
        {
            "name": "PU Luxury Finish",
            "description": "Polyurethane luxury finish for premium wood protection",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/1644e53a-db6f-4703-ba90-44b429b20a88.jpg",
            "size": "1L",
            "finish": "Luxury",
        },
        {
            "name": "Opus Wood Filler Grain and Dent Filler",
            "description": "Professional wood filler for grain and dent filling",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/3a332493-e06d-4533-85d9-a2ca0c84f3e8.jpg",
            "size": "500g",
            "finish": "Filler",
        },
        {
            "name": "Opus PU Thinner Luxury Thinner",
            "description": "Premium PU thinner for luxury finishes",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/4d346365-8f27-4a8f-aa26-ad9eccdbd2b9.jpg",
            "size": "1L",
            "finish": "Thinner",
        },
        {
            "name": "Opus Allwood Sanding Sealer",
            "description": "Professional sanding sealer for wood preparation",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/7b13e895-7cdf-44a3-8f07-98142fe19fc0.jpg",
            "size": "1L",
            "finish": "Sealer",
        },
        {
            "name": "Opus Allwood PU Luxury Finish",
            "description": "Premium polyurethane luxury finish coating",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/85249a45-e3ef-4b7c-8707-be0c7ec05a9f.jpg",
            "size": "1L",
            "finish": "Luxury",
        },
        {
            "name": "Opus Allwood Wood Stain",
            "description": "Professional wood stain for natural wood enhancement",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/8e25017b-04ab-4aad-a78d-b6d1b7206020.jpg",
            "size": "500ml",
            "finish": "Stain",
        },
        {
            "name": "Opus Allwood Melamine",
            "description": "Premium melamine coating for wood surfaces",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/f223e03d-3bf5-4ec8-9cf3-82315819a0bf.jpg",
            "size": "1L",
            "finish": "Melamine",
        },
        {
            "name": "Opus Allwood Italian PU",
            "description": "Italian polyurethane finish for premium wood coating",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/f4adb8de-61f4-4c18-8026-a384eb63055b.jpg",
            "size": "1L",
            "finish": "Italian PU",
        },
    ]

    # Alldry Series Waterproof Products (8 products)
    alldry_products = [
        {
            "name": "Opus Alldry Wall in Proof",
            "description": "Premium waterproofing solution for walls",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20alldry%20series%20waterproof/4392d790-2ac7-4266-9708-79a158ead022.jpg",
            "size": "1L",
            "finish": "Waterproof",
        },
        {
            "name": "Opus Total 2K",
            "description": "Two-component waterproofing system",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20alldry%20series%20waterproof/64a5b3f8-5122-4a28-8a26-67cb822cb0e8.jpg",
            "size": "1L",
            "finish": "Waterproof",
        },
        {
            "name": "Opus Alldry Total 2K Flex",
            "description": "Flexible two-component waterproofing solution",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20alldry%20series%20waterproof/a996487c-8456-4195-8e7c-4b04087d7f14.jpg",
            "size": "1L",
            "finish": "Flex",
        },
        {
            "name": "Opus Alldry Wall Flex",
            "description": "Flexible waterproofing for wall protection",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20alldry%20series%20waterproof/bd2baa44-0747-4029-99e3-35445a865114.jpg",
            "size": "1L",
            "finish": "Flex",
        },
        {
            "name": "Opus Alldry Crack Flex Master",
            "description": "Advanced crack repair and waterproofing solution",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20alldry%20series%20waterproof/df331e8e-b797-40c8-a611-dd8bbc80702b.jpg",
            "size": "1L",
            "finish": "Flex Master",
        },
        {
            "name": "Opus Alldry Wall in Proof Premium",
            "description": "Premium waterproofing solution for walls",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20alldry%20series%20waterproof/e794d3a1-3256-48ed-bb2c-5f61cb14fabc.jpg",
            "size": "1L",
            "finish": "Waterproof",
        },
        {
            "name": "Opus Alldry Salt Seal",
            "description": "Salt protection and waterproofing solution",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20alldry%20series%20waterproof/f3d8393e-bed1-4069-8cf0-607d3a1063c1.jpg",
            "size": "1L",
            "finish": "Salt Seal",
        },
        {
            "name": "Opus Alldry Repair Master",
            "description": "Complete repair and waterproofing master solution",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20alldry%20series%20waterproof/fe496552-79dd-4f8d-88d1-5ae2d6c8293a.jpg",
            "size": "1L",
            "finish": "Repair Master",
        },
    ]

    # Calista Series Exterior Products (5 products)
    calista_products = [
        {
            "name": "Calista Perfect Choice Premier",
            "description": "Premium exterior paint from Calista series for perfect finishing",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20calista%20series%20exterior/010cc20d-7a34-4f43-bf79-9bd5ff52ec05.jpg",
            "size": "1L",
            "finish": "Premium",
        },
        {
            "name": "Calista Neo Star",
            "description": "High-quality exterior paint with neo star finish",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20calista%20series%20exterior/4f56b779-0dd3-4378-acd7-6cf7c3081511.jpg",
            "size": "1L",
            "finish": "Neo Star",
        },
        {
            "name": "Neo Floor Shade",
            "description": "Specialized floor shade paint for exterior surfaces",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20calista%20series%20exterior/6b624d4d-2860-442b-9fc6-6eb69b9fea31.jpg",
            "size": "1L",
            "finish": "Floor Shade",
        },
        {
            "name": "Calista Neo Tile Shade",
            "description": "Tile shade finish for exterior walls and surfaces",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20calista%20series%20exterior/9760acbb-c35a-4f97-a22f-1df130b263cb.jpg",
            "size": "1L",
            "finish": "Tile Shade",
        },
        {
            "name": "Calista NEO Star Shine",
            "description": "Premium shine finish for exterior applications",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20calista%20series%20exterior/cd55aa28-79a1-423c-a527-0f6bf6e04fb5.jpg",
            "size": "1L",
            "finish": "Star Shine",
        },
    ]

    # Opus Interior Series Products (5 products)
    opus_interior_products = [
        {
            "name": "Calista Ever Wash Shine",
            "description": "Premium washable interior paint with shine finish",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20interior%20series/184a9fab-cc56-44a4-980a-9df0b3de7758.jpg",
            "size": "1L",
            "finish": "Ever Wash Shine",
        },
        {
            "name": "Calista Ever Stay",
            "description": "Long-lasting interior paint with superior coverage",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20interior%20series/505364e9-f31d-46c8-a0da-962d3795bfe4.jpg",
            "size": "1L",
            "finish": "Ever Stay",
        },
        {
            "name": "Calista Ever Wash",
            "description": "Easy to clean washable interior paint",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20interior%20series/996d9988-34ab-49ae-a1d4-987c7f17b990.jpg",
            "size": "1L",
            "finish": "Ever Wash",
        },
        {
            "name": "Calista Ever Clear Matt",
            "description": "Premium matt finish interior paint with clear coverage",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20interior%20series/9e9ae34d-ae96-4596-a23a-1b95e9ff926c.jpg",
            "size": "1L",
            "finish": "Ever Clear Matt",
        },
        {
            "name": "Calista Ever Clear",
            "description": "Crystal clear finish for interior walls",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20interior%20series/f619cd21-3e43-4f49-9222-d65d18b8a1b2.jpg",
            "size": "1L",
            "finish": "Ever Clear",
        },
    ]

    # Opus One Interior Products (2 products)
    opus_one_interior_products = [
        {
            "name": "Opus One Pure Legend",
            "description": "Premium legendary finish for interior walls",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20interior/04aebd31-5467-41c4-86e3-3ae1fcb6ae6f.jpg",
            "size": "1L",
            "finish": "Pure Legend",
        },
        {
            "name": "One Pure Elegance",
            "description": "Elegant finish for sophisticated interiors",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20interior/35d59de7-0680-4fd9-a008-040317468d18.jpg",
            "size": "1L",
            "finish": "Pure Elegance",
        },
    ]

    # Opus One Series Interior Products (12 products)
    opus_one_series_interior_products = [
        {
            "name": "One Pure Elegance Shine",
            "description": "Premium shine finish with pure elegance",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20Interior/3e7f7ef0-068c-4213-8d84-a9a18ba4edf8.jpg",
            "size": "1L",
            "finish": "Pure Elegance Shine",
        },
        {
            "name": "One Dream Duracoat",
            "description": "Durable coating with dream finish",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20Interior/5defe0fe-6a95-45e0-80d1-ec8ab9dfd77a.jpg",
            "size": "1L",
            "finish": "Dream Duracoat",
        },
        {
            "name": "One Timeless Stone",
            "description": "Timeless stone finish for elegant interiors",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20Interior/6a0fdfc4-e823-42cb-b49a-897b52f9529e.jpg",
            "size": "1L",
            "finish": "Timeless Stone",
        },
        {
            "name": "One Dream Effects",
            "description": "Special effect finish for dream interiors",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20Interior/77737ed9-7d2c-4d04-a35a-f3bc41266245.jpg",
            "size": "1L",
            "finish": "Dream Effects",
        },
        {
            "name": "One Timeless Marmorino",
            "description": "Classic marmorino finish for timeless beauty",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20Interior/8f3f52a2-3866-49e8-b954-2010fdb40c24.jpg",
            "size": "1L",
            "finish": "Timeless Marmorino",
        },
        {
            "name": "One Dream Effects Metallic",
            "description": "Metallic dream effects for stunning walls",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20Interior/93992534-8293-4b0b-a6ba-3fc99f765eb5.jpg",
            "size": "1L",
            "finish": "Dream Effects Metallic",
        },
        {
            "name": "One Dream Marble",
            "description": "Luxurious marble finish effect",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20Interior/97eb3b68-f594-42bf-8f38-5693d92f0353.jpg",
            "size": "1L",
            "finish": "Dream Marble",
        },
        {
            "name": "One Timeless Natura",
            "description": "Natural timeless finish for organic look",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20Interior/9d94ccae-02fa-4c7d-9694-0ec0449e4af0.jpg",
            "size": "1L",
            "finish": "Timeless Natura",
        },
        {
            "name": "One Dream Texture",
            "description": "Textured finish with dream quality",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20Interior/a2041046-0cbc-44ba-aa9a-eb0bd27b6aa5.jpg",
            "size": "1L",
            "finish": "Dream Texture",
        },
        {
            "name": "One Timeless Clay",
            "description": "Timeless clay finish for natural elegance",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20Interior/aaa12240-9d7c-4225-a8dc-fa3f4f099d88.jpg",
            "size": "1L",
            "finish": "Timeless Clay",
        },
        {
            "name": "One Timeless Marmorino Metallic",
            "description": "Metallic marmorino finish for luxurious look",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20Interior/ac5ab0a5-c5b2-4842-9502-078456fd3784.jpg",
            "size": "1L",
            "finish": "Timeless Marmorino Metallic",
        },
        {
            "name": "One Pro Smooth Premiere",
            "description": "Professional smooth premiere finish",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20Interior/eedc1124-c2ba-4aa7-94ab-71a62bc1ef8c.jpg",
            "size": "1L",
            "finish": "Pro Smooth Premiere",
        },
    ]

    # Opus One Series Exterior Products (7 products)
    opus_one_series_exterior_products = [
        {
            "name": "One True Look",
            "description": "Premium exterior finish with true color appearance",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20exterior/56d1f2c4-1234-4567-89ab-cdef01234567.jpg",
            "size": "1L",
            "finish": "True Look",
        },
        {
            "name": "One True Flex",
            "description": "Flexible exterior coating for weather resistance",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20exterior/601502a7-5428-43e0-baa4-ca137a37ef90.jpg",
            "size": "1L",
            "finish": "True Flex",
        },
        {
            "name": "One Explore Roller",
            "description": "Smooth roller application for exterior surfaces",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20exterior/657d361a-3e75-423a-b79b-44cffe5d45b4.jpg",
            "size": "1L",
            "finish": "Explore Roller",
        },
        {
            "name": "One Explore 15",
            "description": "15-year durability exterior paint",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20exterior/6bda1180-c9a4-4327-9b8f-f872c25139da.jpg",
            "size": "1L",
            "finish": "Explore 15",
        },
        {
            "name": "One True Vision",
            "description": "Clear vision exterior finish with enhanced clarity",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20exterior/8ded96c1-7be9-4388-8f66-c5a76cf2108b.jpg",
            "size": "1L",
            "finish": "True Vision",
        },
        {
            "name": "One True Life",
            "description": "Long-lasting exterior paint for true protection",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20exterior/9390b253-b389-4be9-8420-d27c0ac1b281.jpg",
            "size": "1L",
            "finish": "True Life",
        },
        {
            "name": "One Inspire Clear Coat",
            "description": "Inspiring clear coat finish for exterior walls",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20one%20series%20exterior/d14c5101-4540-44e9-a9fe-96fcb3d3c014.jpg",
            "size": "1L",
            "finish": "Inspire Clear Coat",
        },
    ]

    # Opus Style Series Interior Products (10 products)
    opus_style_series_interior_products = [
        {
            "name": "Opus Power Bright Shine",
            "description": "Powerful bright shine finish for interiors",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20style%20series%20interior/0bb59105-4fe5-49d7-ad6d-1416f59057cd.jpg",
            "size": "1L",
            "finish": "Power Bright Shine",
        },
        {
            "name": "Opus Style Color Smart",
            "description": "Smart color technology for interior walls",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20style%20series%20interior/0db34cdf-05e6-4c4d-a033-2c8c3ee892b8.jpg",
            "size": "1L",
            "finish": "Color Smart",
        },
        {
            "name": "Opus Style Super Smooth",
            "description": "Super smooth finish for flawless walls",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20style%20series%20interior/36a482c4-6fdc-4746-8f0c-e6d3c1e6ff9f.jpg",
            "size": "1L",
            "finish": "Super Smooth",
        },
        {
            "name": "Style Power Fit",
            "description": "Perfect fit finish with power coverage",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20style%20series%20interior/58f9cae3-a27a-4075-9064-01c9433bb90b.jpg",
            "size": "1L",
            "finish": "Power Fit",
        },
        {
            "name": "Style Pro Hide Premiere",
            "description": "Professional hiding power premiere finish",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20style%20series%20interior/8478c6fc-c86b-45a3-a59b-5acc22c1828b.jpg",
            "size": "1L",
            "finish": "Pro Hide Premiere",
        },
        {
            "name": "Style Perfect Smart Premiere",
            "description": "Perfect smart premiere finish for modern interiors",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20style%20series%20interior/89d4068a-b0ef-46dc-b8bb-838566d84d5c.jpg",
            "size": "1L",
            "finish": "Perfect Smart Premiere",
        },
        {
            "name": "Style Color Fresh",
            "description": "Fresh color finish with lasting vibrancy",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20style%20series%20interior/b5d0ec34-be47-4e4f-a9cb-8c03701eab67.jpg",
            "size": "1L",
            "finish": "Color Fresh",
        },
        {
            "name": "Opus Style Power Bright",
            "description": "Power bright finish for stunning interiors",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20style%20series%20interior/de8261c0-c556-4b00-8728-4cf879c13ef5.jpg",
            "size": "1L",
            "finish": "Power Bright",
        },
        {
            "name": "Opus Style Color Smart Shine",
            "description": "Smart shine with advanced color technology",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20style%20series%20interior/ecb6d2e7-1394-410f-b5fb-e282a25b9bf0.jpg",
            "size": "1L",
            "finish": "Color Smart Shine",
        },
        {
            "name": "Opus Style Super Bright",
            "description": "Super bright finish for luminous walls",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20style%20series%20interior/fe6ac6c5-1407-43ef-baca-938d987b3478.jpg",
            "size": "1L",
            "finish": "Super Bright",
        },
    ]

    # Opus Style Series Oil Paint Products (3 products)
    opus_style_oil_paint_products = [
        {
            "name": "Opus Style Pro Hide Cement ST Primer",
            "description": "Professional cement primer for superior adhesion",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20style%20series%20oil%20paint/953f5e52-9f22-4b6a-911d-7330920259df.jpg",
            "size": "1L",
            "finish": "Pro Hide Cement ST Primer",
        },
        {
            "name": "Opus Style Cover Max Red Oxide Primer",
            "description": "Maximum coverage red oxide primer for metal surfaces",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20style%20series%20oil%20paint/a693aa11-d1a9-417c-9d80-b31ca5766bba.jpg",
            "size": "1L",
            "finish": "Cover Max Red Oxide Primer",
        },
        {
            "name": "Opus Style Cover Max Gloss Enamel",
            "description": "High gloss enamel with maximum coverage",
            "image_path": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20style%20series%20oil%20paint/fe81774e-bda8-470d-9dff-0bddc4165e1d.jpg",
            "size": "1L",
            "finish": "Cover Max Gloss Enamel",
        },
    ]

    # Add products to each category
    products_by_category = [
        ("all-wood-series", allwood_products),
        ("alldry-series-waterproof", alldry_products),
        ("calista-series-exterior", calista_products),
        ("opus-interior-series", opus_interior_products),
        ("opus-one-interior", opus_one_interior_products),
        ("opus-one-series-interior", opus_one_series_interior_products),
        ("opus-one-series-exterior", opus_one_series_exterior_products),
        ("opus-style-series-interior", opus_style_series_interior_products),
        ("opus-style-series-oil-paint", opus_style_oil_paint_products),
    ]

    total_added = 0
    for cat_slug, products in products_by_category:
        category = categories.get(cat_slug)
        if not category:
            print(f"⚠️ Category {cat_slug} not found, skipping...")
            continue
            
        print(f"\n📁 Adding products to {category.name}...")
        for product_data in products:
            product = Product(
                category_id=category.id,
                name=product_data["name"],
                description=product_data["description"],
                image_path=product_data["image_path"],
                size=product_data.get("size", "1L"),
                finish=product_data.get("finish", ""),
                stock=100,
                price=0,
                original_price=0,
                is_active=True,
                is_featured=True
            )
            db.add(product)
            total_added += 1
            print(f"  ✓ Added: {product_data['name']}")
    
    db.commit()

    # Count total products
    total_products = db.query(Product).count()
    total_categories = db.query(Category).count()
    
    print(f"\n✅ Database populated successfully!")
    print(f"📦 Total products: {total_products}")
    print(f"📁 Total categories: {total_categories}")
    print(f"➕ Products added this run: {total_added}")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
    raise
finally:
    db.close()
