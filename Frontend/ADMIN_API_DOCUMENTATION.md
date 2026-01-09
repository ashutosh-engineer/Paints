# Kubti Hardware - Admin API Documentation

**Base URL:** `http://your-server:8000` (or your deployed URL)

**Authentication:** All admin endpoints require JWT Bearer token with admin privileges.

---

## 🔐 Authentication

### Login
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Usage:** Include token in all requests:
```
Authorization: Bearer <access_token>
```

---

## 📊 Dashboard Statistics

### Get Admin Stats
```
GET /api/admin/stats
```

**Description:** Get comprehensive dashboard statistics for admin overview.

**Response:**
```json
{
  "total_users": 150,
  "admin_users": 2,
  "completed_profiles": 120,
  "incomplete_profiles": 30,
  "total_products": 250,
  "active_products": 230,
  "out_of_stock": 20,
  "total_orders": 500,
  "pending_orders": 25,
  "completed_orders": 450,
  "total_revenue": 2500000.00,
  "total_discount_given": 375000.00,
  "total_items_sold": 1250
}
```

**Desktop App Usage:**
- Display stat cards for quick overview
- Show Users, Orders, Items Sold counts
- Can ignore revenue fields if not needed

---

## 👥 User Management

### Get All Users
```
GET /api/admin/users?limit=100&offset=0
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | int | 10 | Number of users to fetch |
| offset | int | 0 | Skip first N users |

**Response:**
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "9876543210",
    "is_admin": false,
    "street_address": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "shop_name": "Doe Hardware",
    "trader_name": "John Doe",
    "address": "Full shop address",
    "shop_details_completed": true,
    "is_profile_complete": true,
    "points": 150,
    "created_at": "2025-01-01T10:00:00"
  }
]
```

### Get Single User
```
GET /api/admin/users/{user_id}
```

**Response:** Same as single user object above.

### Update User
```
PUT /api/admin/users/{user_id}
```

**Request Body:**
```json
{
  "full_name": "Updated Name",
  "phone": "9876543211",
  "is_admin": false,
  "is_profile_complete": true
}
```

### Delete User
```
DELETE /api/admin/users/{user_id}
```

**Response:**
```json
{
  "message": "User user@example.com deleted successfully"
}
```

**Note:** Cannot delete your own admin account.

---

## 📦 Order Management

### Get All Orders
```
GET /api/admin/orders?status=pending
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by: pending, confirmed, shipped, delivered, cancelled |

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 5,
    "order_number": "ORD-20250109-001",
    "total_amount": 1500.00,
    "original_amount": 1800.00,
    "discount_amount": 300.00,
    "status": "pending",
    "delivery_address": "123 Main Street",
    "delivery_city": "Mumbai",
    "delivery_state": "Maharashtra",
    "delivery_pincode": "400001",
    "delivery_phone": "9876543210",
    "order_date": "2025-01-09",
    "order_time": "14:30",
    "order_day": "Thursday",
    "points_earned": 15,
    "created_at": "2025-01-09T14:30:00",
    "order_items": [
      {
        "id": 1,
        "product_id": 10,
        "product_name": "Asian Paints Royale",
        "quantity": 2,
        "price_at_purchase": 750.00,
        "original_price": 900.00,
        "discount_percent": 17,
        "size_ordered": "4L"
      }
    ]
  }
]
```

**Desktop App Usage:**
- Display orders in a table/list
- Show product images using `product.image_path` from product lookup
- Filter by status for pending, delivered, etc.
- Click to expand and show all order items

### Update Order Status
```
PUT /api/admin/orders/{order_id}/status
```

**Request Body:**
```json
{
  "status": "delivered"
}
```

**Valid Status Values:** `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`

**Response:**
```json
{
  "message": "Order status updated to delivered"
}
```

---

## 🛍️ Product Management

### Get All Products (Admin)
```
GET /api/admin/products
```

**Response:**
```json
[
  {
    "id": 1,
    "category_id": 2,
    "name": "Asian Paints Royale Luxury Emulsion",
    "description": "Premium interior emulsion paint",
    "price": 750.00,
    "original_price": 900.00,
    "stock": 50,
    "image_path": "/static/images/products/royale.jpg",
    "size": "4L",
    "color": "White",
    "finish": "Matt",
    "is_featured": true,
    "is_active": true,
    "views": 1250,
    "sales_count": 45,
    "discount_percent": 17,
    "created_at": "2025-01-01T10:00:00",
    "category": {
      "id": 2,
      "name": "Interior Paints",
      "slug": "interior-paints"
    }
  }
]
```

### Create Product
```
POST /api/admin/products
```

**Request Body:**
```json
{
  "category_id": 2,
  "name": "New Paint Product",
  "description": "Product description",
  "price": 500.00,
  "original_price": 600.00,
  "stock": 100,
  "image_path": "/static/images/products/new.jpg",
  "size": "1L",
  "color": "Blue",
  "finish": "Gloss",
  "is_featured": false
}
```

### Update Product
```
PUT /api/admin/products/{product_id}
```

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "price": 550.00,
  "stock": 75,
  "is_active": true,
  "is_featured": true
}
```

### Delete Product
```
DELETE /api/admin/products/{product_id}
```

---

## 📂 Category Management

### Get All Categories (Admin)
```
GET /api/admin/categories
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Interior Paints",
    "slug": "interior-paints",
    "description": "Paints for interior walls",
    "image_folder": "interior",
    "display_order": 1,
    "is_active": true,
    "product_count": 45,
    "created_at": "2025-01-01T10:00:00"
  }
]
```

### Create Category
```
POST /api/admin/categories
```

**Request Body:**
```json
{
  "name": "New Category",
  "slug": "new-category",
  "description": "Category description",
  "image_folder": "new_folder",
  "display_order": 5
}
```

### Update Category
```
PUT /api/admin/categories/{category_id}
```

### Delete Category
```
DELETE /api/admin/categories/{category_id}
```

---

## 📈 Product Analytics

### Get Product Analytics
```
GET /api/admin/products/analytics
```

**Description:** Get detailed product sales analytics with customer breakdown.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Asian Paints Royale",
    "image_url": "/static/images/products/royale.jpg",
    "price": 750.00,
    "unique_customers": 25,
    "total_orders": 45,
    "total_quantity_sold": 120,
    "top_customers": [
      {
        "id": 5,
        "email": "customer@example.com",
        "full_name": "Top Buyer",
        "quantity_ordered": 15,
        "order_count": 5
      }
    ]
  }
]
```

**Desktop App Usage:**
- Show products ranked by sales
- Display product image, name, units sold
- Show unique buyers count
- Optionally show top customers per product

---

## 👤 Customer Analytics

### Get All Customers
```
GET /api/admin/customers
```

**Response:**
```json
[
  {
    "id": 5,
    "email": "customer@example.com",
    "full_name": "Customer Name",
    "phone": "9876543210",
    "address": "Full address",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "created_at": "2025-01-01T10:00:00",
    "total_orders": 10,
    "total_spent": 15000.00,
    "total_saved": 2500.00
  }
]
```

### Get Customer Details
```
GET /api/admin/customers/{customer_id}
```

**Response:** Full customer info with all their orders and order items.

---

## 🎁 Offers Management

### Get All Offers
```
GET /api/admin/offers
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "New Year Sale",
    "description": "20% off on all products",
    "discount_percent": 20,
    "valid_from": "2025-01-01T00:00:00",
    "valid_until": "2025-01-31T23:59:59",
    "is_active": true,
    "created_at": "2024-12-25T10:00:00"
  }
]
```

### Create Offer
```
POST /api/admin/offers
```

**Request Body:**
```json
{
  "title": "Summer Sale",
  "description": "Get 15% off",
  "discount_percent": 15,
  "valid_from": "2025-06-01T00:00:00",
  "valid_until": "2025-06-30T23:59:59",
  "is_active": true
}
```

### Update Offer
```
PUT /api/admin/offers/{offer_id}
```

### Delete Offer
```
DELETE /api/admin/offers/{offer_id}
```

---

## 🖼️ Image URLs

Product and category images are served from:
```
GET /static/images/{path}
```

**Example:**
- Product image: `http://your-server:8000/static/images/products/paint.jpg`
- Category image: `http://your-server:8000/static/images/categories/interior.jpg`

---

## 💡 Desktop App Implementation Guide

### Recommended Features

1. **Dashboard Overview**
   - Stat cards: Total Users, Total Orders, Items Sold
   - Recent orders list with product images
   - Top selling products chart

2. **Orders Management**
   - Table view with search/filter
   - Status filter dropdown (pending, confirmed, shipped, delivered)
   - Click to view order details with:
     - Customer info (name, phone, address)
     - Product images and names
     - Quantities ordered
     - Delivery address

3. **Product Analytics**
   - Products ranked by sales
   - Visual chart for top sellers
   - Show units sold, unique buyers
   - Top customer for each product

4. **User Management**
   - User list with loyalty points
   - Search by name, email, phone
   - View/Edit user details
   - Delete users

5. **Categories & Products**
   - CRUD operations for categories
   - CRUD operations for products
   - Image upload support

### API Call Pattern (JavaScript/TypeScript)

```javascript
const API_URL = 'http://your-server:8000';

// Get token after login
const token = localStorage.getItem('access_token');

// Make authenticated request
async function fetchAdminData(endpoint) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

// Examples
const stats = await fetchAdminData('/api/admin/stats');
const orders = await fetchAdminData('/api/admin/orders');
const users = await fetchAdminData('/api/admin/users?limit=100');
const analytics = await fetchAdminData('/api/admin/products/analytics');
```

---

## 📋 Error Responses

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Not an admin user |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error |

**Error Response Format:**
```json
{
  "detail": "Error message here"
}
```

---

## 🔗 Quick Reference

| Feature | Endpoint | Method |
|---------|----------|--------|
| Dashboard Stats | `/api/admin/stats` | GET |
| All Users | `/api/admin/users` | GET |
| All Orders | `/api/admin/orders` | GET |
| Update Order Status | `/api/admin/orders/{id}/status` | PUT |
| Product Analytics | `/api/admin/products/analytics` | GET |
| All Customers | `/api/admin/customers` | GET |
| All Categories | `/api/admin/categories` | GET |
| All Products | `/api/admin/products` | GET |
| All Offers | `/api/admin/offers` | GET |
