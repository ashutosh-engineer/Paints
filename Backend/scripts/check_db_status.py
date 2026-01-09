import sqlite3

conn = sqlite3.connect('shop.db')
cursor = conn.cursor()

# Check products
cursor.execute("SELECT COUNT(*) FROM products")
product_count = cursor.fetchone()[0]
print(f"Products in database: {product_count}")

if product_count > 0:
    cursor.execute("SELECT id, name, price, stock, is_active FROM products LIMIT 5")
    print("\nFirst 5 products:")
    for row in cursor.fetchall():
        print(f"  ID: {row[0]}, Name: {row[1]}, Price: {row[2]}, Stock: {row[3]}, Active: {row[4]}")
else:
    print("\n⚠️  No products in database!")
    print("This is why 'Add to Cart' is failing.")
    print("\nSolutions:")
    print("1. Add products through admin panel")
    print("2. Users can only add hardcoded products (local cart)")

# Check users
cursor.execute("SELECT COUNT(*) FROM users")
user_count = cursor.fetchone()[0]
print(f"\nUsers in database: {user_count}")

# Check cart_items table structure
cursor.execute("PRAGMA table_info(cart_items)")
print("\nCart Items table columns:")
for col in cursor.fetchall():
    print(f"  {col[1]}: {col[2]}")

conn.close()
