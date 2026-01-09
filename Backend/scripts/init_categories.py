from database import SessionLocal
from models import Category

def create_categories():
    db = SessionLocal()
    
    categories_data = [
        {
            "name": "All Wood Series",
            "slug": "all-wood-series",
            "description": "Premium wood finish series for elegant interiors",
            "image_folder": "Birla opus all wood series",
            "display_order": 1
        },
        {
            "name": "AllDry Series Waterproof",
            "slug": "alldry-waterproof",
            "description": "Waterproof paint series for moisture-prone areas",
            "image_folder": "Birla opus alldry series waterproof",
            "display_order": 2
        },
        {
            "name": "Calista Series Exterior",
            "slug": "calista-exterior",
            "description": "Weather-resistant exterior paint collection",
            "image_folder": "Birla opus calista series exterior",
            "display_order": 3
        },
        {
            "name": "Interior Series",
            "slug": "interior-series",
            "description": "Classic interior paint range",
            "image_folder": "Birla opus interior series",
            "display_order": 4
        },
        {
            "name": "One Interior",
            "slug": "one-interior",
            "description": "Premium one-coat interior finish",
            "image_folder": "Birla opus one interior",
            "display_order": 5
        },
        {
            "name": "One Series Exterior",
            "slug": "one-series-exterior",
            "description": "High-performance exterior coating",
            "image_folder": "Birla opus one series exterior",
            "display_order": 6
        },
        {
            "name": "Style Series Interior",
            "slug": "style-series-interior",
            "description": "Stylish interior decorative paints",
            "image_folder": "Birla opus style series interior",
            "display_order": 7
        },
        {
            "name": "Style Series Oil Paint",
            "slug": "style-series-oil-paint",
            "description": "Durable oil-based paint solutions",
            "image_folder": "Birla opus style series oil paint",
            "display_order": 8
        }
    ]
    
    try:
        for cat_data in categories_data:
            # Check if category already exists
            existing = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
            if existing:
                print(f"✓ Category '{cat_data['name']}' already exists")
                continue
            
            category = Category(**cat_data)
            db.add(category)
            print(f"✓ Created category: {cat_data['name']}")
        
        db.commit()
        print("\n✅ All categories initialized successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🔄 Initializing product categories...")
    print("=" * 60)
    create_categories()
