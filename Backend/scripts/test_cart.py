import requests
import json

BASE_URL = "http://localhost:8000"

# Test 1: Check if server is running
print("Testing backend server...")
try:
    response = requests.get(f"{BASE_URL}/")
    print(f"✓ Server is running: {response.status_code}")
except Exception as e:
    print(f"✗ Server error: {e}")
    exit(1)

# Test 2: Try to add to cart without auth (should fail with 401)
print("\nTesting cart endpoint without auth...")
try:
    response = requests.post(
        f"{BASE_URL}/api/cart",
        json={"product_id": 1, "quantity": 1}
    )
    print(f"Response: {response.status_code} - {response.text[:100]}")
except Exception as e:
    print(f"Error: {e}")

print("\n✓ Backend is responding!")
print("\nTo test with authentication:")
print("1. Login from the app")
print("2. Check the console logs for the token")
print("3. The error 'failed to add item to cart' might be due to:")
print("   - No products in database")
print("   - Product ID doesn't exist")
print("   - Product is out of stock")
print("   - Authentication token expired")
