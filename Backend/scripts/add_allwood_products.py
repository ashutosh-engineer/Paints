"""
Add All-Wood Series Products to Database
This script adds the Birla Opus All-Wood Series products with their Supabase image URLs
"""

import sys
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, Product, Category

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

def add_allwood_series_products():
    db: Session = SessionLocal()
    
    try:
        # Find or create the "Paints" category (All-wood series is a paint category)
        category = db.query(Category).filter(Category.slug == "paints").first()
        
        if not category:
            print("❌ Paints category not found. Creating it...")
            category = Category(
                name="Paints",
                slug="paints",
                description="Premium quality paints for all surfaces",
                image_folder="paints",
                display_order=1,
                is_active=True
            )
            db.add(category)
            db.commit()
            db.refresh(category)
            print(f"✅ Created Paints category with ID: {category.id}")
        else:
            print(f"✅ Found Paints category with ID: {category.id}")
        
        # All-Wood Series Products
        allwood_products = [
            {
                "name": "Allwood 1k Finish (Soft Touch)",
                "image_url": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/04df5763-30b8-4daa-9eec-075c7c0cbb70.jpg",
                "description": "Premium 1K finish with soft touch for wood surfaces",
                "price": 2500.00,
                "size": "1L",
                "finish": "Soft Touch"
            },
            {
                "name": "Melamine (Premium Finish)",
                "image_url": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/0ed58c94-c96c-456a-a90d-598854333aad.jpg",
                "description": "Premium melamine finish for durable wood coating",
                "price": 2800.00,
                "size": "1L",
                "finish": "Premium"
            },
            {
                "name": "PU Luxury Finish",
                "image_url": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/1644e53a-db6f-4703-ba90-44b429b20a88.jpg",
                "description": "Polyurethane luxury finish for premium wood protection",
                "price": 3200.00,
                "size": "1L",
                "finish": "Luxury"
            },
            {
                "name": "Opus Wood Filler Grain and Dent Filler",
                "image_url": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/3a332493-e06d-4533-85d9-a2ca0c84f3e8.jpg",
                "description": "Professional wood filler for grain and dent filling",
                "price": 1500.00,
                "size": "500g",
                "finish": "Filler"
            },
            {
                "name": "Opus PU Thinner Luxury Thinner",
                "image_url": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/4d346365-8f27-4a8f-aa26-ad9eccdbd2b9.jpg",
                "description": "Premium PU thinner for luxury finishes",
                "price": 800.00,
                "size": "1L",
                "finish": "Thinner"
            },
            {
                "name": "Opus Allwood Sanding Sealer",
                "image_url": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/7b13e895-7cdf-44a3-8f07-98142fe19fc0.jpg",
                "description": "Professional sanding sealer for wood preparation",
                "price": 1800.00,
                "size": "1L",
                "finish": "Sealer"
            },
            {
                "name": "Opus Allwood PU Luxury Finish",
                "image_url": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/85249a45-e3ef-4b7c-8707-be0c7ec05a9f.jpg",
                "description": "Premium polyurethane luxury finish coating",
                "price": 3500.00,
                "size": "1L",
                "finish": "Luxury"
            },
            {
                "name": "Opus Allwood Wood Stain",
                "image_url": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/8e25017b-04ab-4aad-a78d-b6d1b7206020.jpg",
                "description": "Professional wood stain for natural wood enhancement",
                "price": 1200.00,
                "size": "500ml",
                "finish": "Stain"
            },
            {
                "name": "Opus Allwood Melamine",
                "image_url": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/f223e03d-3bf5-4ec8-9cf3-82315819a0bf.jpg",
                "description": "Premium melamine coating for wood surfaces",
                "price": 2600.00,
                "size": "1L",
                "finish": "Melamine"
            },
            {
                "name": "Opus Allwood Italian PU",
                "image_url": "https://ioqckwusiiaapujiklsa.supabase.co/storage/v1/object/public/images_Birlaopus/Birla%20opus%20all%20wood%20series/f4adb8de-61f4-4c18-8026-a384eb63055b.jpg",
                "description": "Italian polyurethane finish for premium wood coating",
                "price": 3800.00,
                "size": "1L",
                "finish": "Italian PU"
            }
        ]
        
        print(f"\n📦 Adding {len(allwood_products)} All-Wood Series products...")
        
        added_count = 0
        updated_count = 0
        
        for product_data in allwood_products:
            # Check if product already exists by name
            existing_product = db.query(Product).filter(
                Product.name == product_data["name"],
                Product.category_id == category.id
            ).first()
            
            if existing_product:
                # Update existing product
                existing_product.image_path = product_data["image_url"]
                existing_product.description = product_data["description"]
                existing_product.price = product_data["price"]
                existing_product.size = product_data["size"]
                existing_product.finish = product_data["finish"]
                existing_product.stock = 100
                existing_product.is_active = True
                updated_count += 1
                print(f"🔄 Updated: {product_data['name']}")
            else:
                # Create new product
                new_product = Product(
                    category_id=category.id,
                    name=product_data["name"],
                    description=product_data["description"],
                    price=product_data["price"],
                    original_price=product_data["price"] * 1.2,  # 20% markup for original price
                    stock=100,
                    image_path=product_data["image_url"],
                    size=product_data["size"],
                    finish=product_data["finish"],
                    is_featured=True,  # Mark as featured since it's a premium series
                    is_active=True
                )
                db.add(new_product)
                added_count += 1
                print(f"✅ Added: {product_data['name']}")
        
        # Commit all changes
        db.commit()
        
        print(f"\n✨ Success!")
        print(f"   - Added: {added_count} new products")
        print(f"   - Updated: {updated_count} existing products")
        print(f"   - Total: {added_count + updated_count} All-Wood Series products")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        db.rollback()
        return False
        
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("🎨 Adding Birla Opus All-Wood Series Products")
    print("=" * 60)
    
    success = add_allwood_series_products()
    
    if success:
        print("\n✅ All products added successfully!")
        print("🔗 Images are loaded directly from Supabase storage")
        print("📱 Products will appear in the 'All-wood Series' filter")
    else:
        print("\n❌ Failed to add products. Check error messages above.")
        sys.exit(1)
