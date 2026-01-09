import sqlite3

conn = sqlite3.connect('shop.db')
cursor = conn.cursor()

print("📦 Database Products Summary\n")
print("=" * 60)

# Count products by category
cursor.execute("""
    SELECT c.name, COUNT(p.id) as count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id
    GROUP BY c.name
    ORDER BY count DESC
""")

for row in cursor.fetchall():
    print(f"  {row[0]}: {row[1]} products")

print("\n" + "=" * 60)
print(f"\nTotal Products: {cursor.execute('SELECT COUNT(*) FROM products').fetchone()[0]}")
print(f"Total Categories: {cursor.execute('SELECT COUNT(*) FROM categories').fetchone()[0]}")

# Show sample products with full details
print("\n📋 Sample Products:\n")
cursor.execute("""
    SELECT p.id, p.name, p.price, p.size, c.name as category
    FROM products p
    JOIN categories c ON p.category_id = c.id
    LIMIT 5
""")

for row in cursor.fetchall():
    print(f"  ID {row[0]}: {row[1]}")
    print(f"    Price: ₹{row[2]}, Size: {row[3]}, Category: {row[4]}\n")

conn.close()

print("✅ Database is ready!")
print("\n💡 Products can now be:")
print("   - Added to cart via API")
print("   - Ordered with size selection")
print("   - Points calculated based on size")
