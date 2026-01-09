import sqlite3

conn = sqlite3.connect('shop.db')
cursor = conn.cursor()

# Check All-wood series products
cursor.execute('''
    SELECT p.id, p.name, c.name as category 
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE c.name = "All-wood Series"
    LIMIT 5
''')

print('All-wood Series Products in DB:')
for row in cursor.fetchall():
    print(f'  ID {row[0]}: {row[1]} (Category: {row[2]})')

# Check if products are active
cursor.execute('''
    SELECT p.id, p.name, p.is_active, p.stock
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE c.name = "All-wood Series"
''')

print('\nAll-wood Products Status:')
for row in cursor.fetchall():
    status = 'Active' if row[2] else 'Inactive'
    print(f'  ID {row[0]}: {row[1]} - {status}, Stock: {row[3]}')

conn.close()
