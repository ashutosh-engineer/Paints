from fastapi import FastAPI, Depends, HTTPException, status, Header, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List, Dict
import time
import json
from collections import defaultdict
from datetime import datetime, timedelta

from .database import engine, get_db, Base
from .models import User, Category, Product, CartItem, Order, OrderItem, AdminOffer
from .schemas import (
    UserRegister, UserLogin, Token, UserResponse,
    UserProfileUpdate, LocationUpdate, AdminUserUpdate, ShopDetailsUpdate,
    CategoryCreate, CategoryUpdate, CategoryResponse,
    ProductCreate, ProductUpdate, ProductResponse,
    CartItemCreate, CartItemUpdate, CartItemResponse,
    OrderCreate, OrderCreateDirect, OrderResponse,
    AdminOfferCreate, AdminOfferResponse, AdminCreate, AdminChangePassword
)
from .auth import (
    get_password_hash, verify_password, create_access_token, decode_token
)

# Database Connection Check
try:
    with engine.connect() as connection:
        print("\n" + "="*50)
        print("✅  DATABASE CONNECTED SUCCESSFULLY!")
        print("    Connection string used (masked): " + str(engine.url).split("@")[-1])
        print("="*50 + "\n")
except Exception as e:
    print("\n" + "="*50)
    print("❌  DATABASE CONNECTION FAILED!")
    print(f"Error: {e}")
    print("="*50 + "\n")

# Create database tables
Base.metadata.create_all(bind=engine)

# API Documentation Metadata
tags_metadata = [
    {
        "name": "Root",
        "description": "API information and health check endpoints",
    },
    {
        "name": "Authentication",
        "description": "User registration and login operations. Get JWT tokens for accessing protected endpoints.",
    },
    {
        "name": "User Profile",
        "description": "Manage user profile information, location, and account settings. **Authentication required.**",
    },
    {
        "name": "Products",
        "description": "Browse products, view details, and search the product catalog. Public access for viewing.",
    },
    {
        "name": "Shopping Cart",
        "description": "Manage shopping cart items. Add, update, remove products. **Authentication required.**",
    },
    {
        "name": "Orders",
        "description": "Create and manage orders. View order history and track shipments. **Authentication required.**",
    },
    {
        "name": "Admin - Users",
        "description": "Admin-only endpoints for user management. **Admin authentication required.**",
    },
    {
        "name": "Admin - Products",
        "description": "Admin-only endpoints for product management (CRUD operations). **Admin authentication required.**",
    },
    {
        "name": "Admin - Analytics",
        "description": "Admin-only endpoints for sales analytics, statistics, and reports. **Admin authentication required.**",
    },
]

app = FastAPI(
    title="Birla Opus E-Commerce API",
    description="""
## Professional E-Commerce Platform API

A comprehensive RESTful API for managing an e-commerce platform with user authentication,
product catalog, shopping cart, order processing, and admin analytics.

### Key Features

* 🔐 **JWT Authentication** - Secure token-based authentication
* 👤 **User Management** - Profile management with location services
* 📦 **Product Catalog** - Browse and search products
* 🛒 **Shopping Cart** - Add, update, and manage cart items
* 💳 **Order Processing** - Complete checkout and order tracking
* 💰 **Discount System** - Automatic discount calculation and savings tracking
* 📊 **Admin Analytics** - Comprehensive sales and customer analytics
* 🔒 **Security** - Rate limiting, input validation, and secure password hashing

### Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_token_here>
```

Get your token by calling `/api/auth/login` or `/api/auth/register`.

### Rate Limiting

API requests are limited to **100 requests per minute per IP address**.

### Response Codes

* `200` - Success
* `201` - Created
* `400` - Bad Request
* `401` - Unauthorized (missing or invalid token)
* `403` - Forbidden (insufficient permissions)
* `404` - Not Found
* `422` - Validation Error
* `429` - Too Many Requests (rate limit exceeded)
* `500` - Internal Server Error

### Contact

* **Support**: support@birlaopu.com
* **Documentation**: [View Full Docs](/docs)
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=tags_metadata,
    contact={
        "name": "Birla Opus Support",
        "email": "support@birlaopu.com",
    },
    license_info={
        "name": "Proprietary",
        "url": "https://birlaopu.com/license",
    },
)

# Rate limiting storage
rate_limit_storage = defaultdict(list)

# Security middleware for rate limiting
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Get client IP
    client_ip = request.client.host
    
    # Skip rate limiting for health check
    if request.url.path in ["/", "/health"]:
        return await call_next(request)
    
    # Rate limit: 100 requests per minute per IP
    current_time = datetime.now()
    minute_ago = current_time - timedelta(minutes=1)
    
    # Clean old entries
    rate_limit_storage[client_ip] = [
        req_time for req_time in rate_limit_storage[client_ip]
        if req_time > minute_ago
    ]
    
    # Check rate limit
    if len(rate_limit_storage[client_ip]) >= 100:
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests. Please try again later."}
        )
    
    # Add current request
    rate_limit_storage[client_ip].append(current_time)
    
    response = await call_next(request)
    
    # Add security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    return response

# Configure CORS - Allow all origins for React Native and Electron apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (React Native, Electron, Web)
    allow_credentials=False,  # Must be False when using allow_origins=["*"]
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "X-Requested-With",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
    ],
    expose_headers=["*"],
    max_age=86400,  # Cache preflight for 24 hours
)

# Dependency to get current user from JWT token
async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    # Extract token from "Bearer <token>"
    try:
        token = authorization.split(" ")[1]
    except IndexError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    email = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user

@app.get(
    "/",
    tags=["Root"],
    summary="API Information",
    description="Get basic information about the Birla Opus API service"
)
def root():
    """
    Returns basic API information including service name and version.
    """
    return {
        "service": "Birla Opus E-commerce API",
        "version": "1.0.0",
        "description": "Professional e-commerce platform with user management, product catalog, shopping cart, and order processing",
        "documentation": "/docs",
        "contact": "support@birlaopu.com"
    }

@app.get(
    "/health",
    tags=["Root"],
    summary="Health Check",
    description="Check if the API and database are operational"
)
def health():
    """
    Health check endpoint for monitoring and load balancers.
    
    Returns:
        - status: API operational status
        - database: Database connection status
    """
    return {"status": "healthy", "database": "connected", "timestamp": time.time()}

# ==================== AUTH ENDPOINTS ====================

@app.post(
    "/api/auth/register",
    response_model=Token,
    tags=["Authentication"],
    summary="Register New User",
    description="Create a new user account with email and password",
    status_code=status.HTTP_201_CREATED
)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user account.
    
    **Requirements:**
    - Valid email address
    - Password: minimum 8 characters, at least one letter and one number
    - Full name (optional)
    
    **Returns:**
    - JWT access token valid for 30 days
    - Token type (Bearer)
    
    **Example:**
    ```json
    {
        "email": "user@example.com",
        "password": "SecurePass123",
        "full_name": "John Doe"
    }
    ```
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create access token
    access_token = create_access_token(data={"sub": new_user.email})
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post(
    "/api/auth/login",
    response_model=Token,
    tags=["Authentication"],
    summary="User Login",
    description="Authenticate user and receive JWT token"
)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user with email and password.
    
    **Returns:**
    - JWT access token (valid for 30 days)
    - Token type (Bearer)
    
    **Usage:**
    Include the token in subsequent requests:
    ```
    Authorization: Bearer <your_token_here>
    ```
    
    **Example Request:**
    ```json
    {
        "email": "user@example.com",
        "password": "SecurePass123"
    }
    ```
    
    **Error Responses:**
    - 401: Invalid credentials
    - 422: Validation error
    """
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user.email})
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get(
    "/api/auth/validate",
    tags=["Authentication"],
    summary="Validate Token",
    description="Check if the current JWT token is valid and return user info"
)
def validate_token(current_user: User = Depends(get_current_user)):
    """
    Validate JWT token and return user information.
    
    **Authentication Required:** Yes
    
    **Use Case:** Check if user is still logged in on app startup.
    
    **Returns:**
    - valid: true if token is valid
    - user: User information including is_admin status
    
    **Error Responses:**
    - 401: Token invalid or expired
    """
    return {
        "valid": True,
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "phone": current_user.phone,
            "is_admin": current_user.is_admin,
            "is_profile_complete": current_user.is_profile_complete,
            "shop_details_completed": current_user.shop_details_completed,
            "points": current_user.points
        }
    }

# ==================== USER PROFILE ENDPOINTS ====================

@app.get(
    "/api/user/profile",
    response_model=UserResponse,
    tags=["User Profile"],
    summary="Get User Profile",
    description="Retrieve the authenticated user's profile information"
)
def get_profile(current_user: User = Depends(get_current_user)):
    """
    Get the current user's complete profile.
    
    **Authentication Required:** Yes
    
    **Returns:**
    - User ID
    - Email address
    - Full name
    - Phone number
    - Address details (street, city, state, pincode)
    - Location coordinates (latitude, longitude)
    - Admin status
    - Profile completion status
    - Account creation date
    
    **Example Response:**
    ```json
    {
        "id": 1,
        "email": "user@example.com",
        "full_name": "John Doe",
        "phone": "+919876543210",
        "is_admin": false,
        "street_address": "123 Main St",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001",
        "is_profile_complete": true,
        "created_at": "2025-10-23T10:00:00"
    }
    ```
    """
    return current_user

@app.put("/api/user/profile", response_model=UserResponse)
def update_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    if profile_data.full_name is not None:
        current_user.full_name = profile_data.full_name
    if profile_data.phone is not None:
        current_user.phone = profile_data.phone
    
    # Update location fields
    if profile_data.street_address is not None:
        current_user.street_address = profile_data.street_address
    if profile_data.city is not None:
        current_user.city = profile_data.city
    if profile_data.state is not None:
        current_user.state = profile_data.state
    if profile_data.pincode is not None:
        current_user.pincode = profile_data.pincode
    
    # Check if profile is complete
    if current_user.full_name and current_user.phone:
        current_user.is_profile_complete = True
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@app.post("/api/user/shop-details", response_model=UserResponse)
def update_shop_details(
    shop_data: ShopDetailsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user shop details"""
    current_user.shop_name = shop_data.shop_name
    current_user.trader_name = shop_data.trader_name
    current_user.address = shop_data.address
    current_user.shop_details_completed = True
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@app.put("/api/user/location", response_model=UserResponse)
def update_location(
    location_data: LocationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user location/address"""
    if location_data.street_address is not None:
        current_user.street_address = location_data.street_address
    if location_data.city is not None:
        current_user.city = location_data.city
    if location_data.state is not None:
        current_user.state = location_data.state
    if location_data.pincode is not None:
        current_user.pincode = location_data.pincode
    if location_data.latitude is not None:
        current_user.latitude = location_data.latitude
    if location_data.longitude is not None:
        current_user.longitude = location_data.longitude
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@app.get(
    "/api/user/stats",
    tags=["User Profile"],
    summary="Get User Statistics",
    description="Retrieve the user's shopping statistics including total savings"
)
def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive shopping statistics for the authenticated user.
    
    **Authentication Required:** Yes
    
    **Returns:**
    
    **Order Statistics:**
    - Total orders placed
    - Delivered orders count
    
    **Purchase Statistics:**
    - Total items purchased (across all orders)
    
    **Financial Statistics:**
    - Total spent (after discounts)
    - Original total (before discounts)
    - Total saved (discount amount)
    - Savings percentage
    
    **Use Cases:**
    - Display in user profile
    - Show savings achievements
    - Track purchase history
    - Loyalty program integration
    
    **Example Response:**
    ```json
    {
        "total_orders": 12,
        "delivered_orders": 10,
        "total_items_purchased": 45,
        "total_spent": 125000.00,
        "original_total": 150000.00,
        "total_saved": 25000.00,
        "savings_percentage": "16.67%"
    }
    ```
    
    **Calculation:**
    - Savings % = (total_saved / original_total) × 100
    - All amounts are cumulative across all orders
    - Only completed orders are included in calculations
    
    **Error Responses:**
    - 401: Not authenticated
    """
    from sqlalchemy import func
    
    # Get user's orders
    total_orders = db.query(Order).filter(Order.user_id == current_user.id).count()
    
    # Calculate total spent and savings
    user_orders = db.query(Order).filter(Order.user_id == current_user.id).all()
    
    total_spent = sum(order.total_amount for order in user_orders)
    total_saved = sum(order.discount_amount for order in user_orders)
    original_total = sum(order.original_amount for order in user_orders)
    
    # Get total items purchased
    total_items = db.query(func.sum(OrderItem.quantity)).join(Order).filter(
        Order.user_id == current_user.id
    ).scalar() or 0
    
    # Get delivered orders count
    delivered_orders = db.query(Order).filter(
        Order.user_id == current_user.id,
        Order.status == "delivered"
    ).count()
    
    # Get cart items count
    cart_items_count = db.query(func.count(CartItem.id)).filter(
        CartItem.user_id == current_user.id
    ).scalar() or 0
    
    return {
        "total_orders": total_orders,
        "delivered_orders": delivered_orders,
        "total_items_purchased": int(total_items),
        "cart_items_count": int(cart_items_count),
        "total_spent": float(total_spent),
        "total_saved": float(total_saved),
        "original_total": float(original_total),
        "savings_percentage": round((total_saved / original_total * 100), 2) if original_total > 0 else 0,
        "reward_points": current_user.points or 0  # User's loyalty points
    }

# ==================== DASHBOARD DATA ENDPOINTS ====================

@app.get("/api/rewards")
def get_rewards(current_user: User = Depends(get_current_user)):
    """Get user rewards status"""
    # TODO: Implement actual rewards logic
    return {
        "available": False,
        "count": 0,
        "points": 0
    }

@app.get("/api/offers")
def get_offers(current_user: User = Depends(get_current_user)):
    """Get available offers"""
    # TODO: Implement actual offers from database
    return {
        "offers": [
            {
                "id": 1,
                "title": "Premium Emulsion Paint",
                "description": "High quality interior paint",
                "price": 450,
                "originalPrice": 600,
                "discount": 25,
                "image": "https://via.placeholder.com/200"
            },
            {
                "id": 2,
                "title": "Exterior Weather Shield",
                "description": "Weather resistant exterior coating",
                "price": 550,
                "originalPrice": 750,
                "discount": 27,
                "image": "https://via.placeholder.com/200"
            }
        ]
    }

# ==================== ADMIN ENDPOINTS ====================

# Dependency to verify admin access
async def get_admin_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

@app.get("/api/admin/users", response_model=List[UserResponse])
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)"""
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@app.get("/api/admin/users/{user_id}", response_model=UserResponse)
def get_user_by_id(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get specific user by ID (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@app.put("/api/admin/users/{user_id}", response_model=UserResponse)
def update_user_by_admin(
    user_id: int,
    update_data: AdminUserUpdate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Update user details (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if update_data.full_name is not None:
        user.full_name = update_data.full_name
    if update_data.phone is not None:
        user.phone = update_data.phone
    if update_data.is_admin is not None:
        user.is_admin = update_data.is_admin
    if update_data.is_profile_complete is not None:
        user.is_profile_complete = update_data.is_profile_complete
    
    db.commit()
    db.refresh(user)
    return user

@app.delete("/api/admin/users/{user_id}")
def delete_user(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete user (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.is_admin and user.id == admin_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own admin account"
        )
    
    db.delete(user)
    db.commit()
    return {"message": f"User {user.email} deleted successfully"}

@app.post("/api/admin/create-admin", response_model=UserResponse, tags=["Admin - User Management"])
def create_admin_user(
    admin_data: AdminCreate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Create a new admin user (admin only).
    
    **Required Fields:**
    - email: Valid email address
    - password: Minimum 6 characters
    - full_name: Admin's full name
    
    **Returns:** The newly created admin user
    """
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == admin_data.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new admin user
    hashed_password = get_password_hash(admin_data.password)
    new_admin = User(
        email=admin_data.email.lower(),
        hashed_password=hashed_password,
        full_name=admin_data.full_name,
        is_admin=True,
        is_profile_complete=True
    )
    
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    
    return new_admin

@app.put("/api/admin/change-password", tags=["Admin - User Management"])
def change_admin_password(
    password_data: AdminChangePassword,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Change the current admin's password.
    
    **Required Fields:**
    - current_password: Current password for verification
    - new_password: New password (minimum 6 characters)
    
    **Returns:** Success message
    """
    # Verify current password
    if not verify_password(password_data.current_password, admin_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    admin_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}

@app.get(
    "/api/admin/stats",
    tags=["Admin - Analytics"],
    summary="Get Admin Statistics",
    description="Retrieve comprehensive dashboard statistics for admin"
)
def get_admin_stats(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive statistics for the admin dashboard.
    
    **Authentication Required:** Yes (Admin only)
    
    **Returns:**
    
    **User Statistics:**
    - Total users registered
    - Number of admin users
    - Completed profiles count
    
    **Product Statistics:**
    - Total products in catalog
    - Active products
    - Out of stock products
    
    **Sales Statistics:**
    - Total orders placed
    - Pending orders
    - Completed/delivered orders
    
    **Revenue Statistics:**
    - Total revenue generated
    - Total discounts given
    - Total items sold across all products
    
    **Example Response:**
    ```json
    {
        "total_users": 150,
        "admin_users": 2,
        "completed_profiles": 120,
        "total_products": 250,
        "product_stats": {
            "active_products": 230,
            "out_of_stock": 20
        },
        "sales_stats": {
            "total_orders": 500,
            "pending_orders": 25,
            "completed_orders": 450
        },
        "revenue_stats": {
            "total_revenue": 2500000.00,
            "total_discount_given": 375000.00,
            "total_items_sold": 1250
        }
    }
    ```
    
    **Error Responses:**
    - 401: Not authenticated
    - 403: Not an admin user
    """
    from sqlalchemy import func
    
    total_users = db.query(User).count()
    admin_users = db.query(User).filter(User.is_admin == True).count()
    completed_profiles = db.query(User).filter(User.is_profile_complete == True).count()
    
    # Product stats
    total_products = db.query(Product).count()
    active_products = db.query(Product).filter(Product.is_active == True).count()
    out_of_stock = db.query(Product).filter(Product.stock == 0).count()
    
    # Sales stats
    total_orders = db.query(Order).count()
    pending_orders = db.query(Order).filter(Order.status == "pending").count()
    completed_orders = db.query(Order).filter(Order.status == "delivered").count()
    
    # Revenue stats
    total_revenue = db.query(func.sum(Order.total_amount)).scalar() or 0
    total_discount_given = db.query(func.sum(Order.discount_amount)).scalar() or 0
    
    # Total items sold
    total_items_sold = db.query(func.sum(Product.sales_count)).scalar() or 0
    
    return {
        "total_users": total_users,
        "admin_users": admin_users,
        "completed_profiles": completed_profiles,
        "incomplete_profiles": total_users - completed_profiles,
        "total_products": total_products,
        "active_products": active_products,
        "out_of_stock": out_of_stock,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "completed_orders": completed_orders,
        "total_revenue": float(total_revenue),
        "total_discount_given": float(total_discount_given),
        "total_items_sold": int(total_items_sold)
    }

# =========================
# CATEGORY MANAGEMENT
# =========================

@app.get("/api/categories", response_model=List[CategoryResponse])
def get_categories(
    db: Session = Depends(get_db)
):
    """Get all active categories"""
    categories = db.query(Category).filter(Category.is_active == True).order_by(Category.display_order).all()
    
    # Add product count to each category
    for category in categories:
        category.product_count = db.query(Product).filter(
            Product.category_id == category.id,
            Product.is_active == True
        ).count()
    
    return categories

@app.post("/api/admin/categories", response_model=CategoryResponse)
def create_category(
    category: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin: Create a new category"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check if slug already exists
    existing = db.query(Category).filter(Category.slug == category.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category with this slug already exists")
    
    db_category = Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    db_category.product_count = 0
    return db_category

@app.get("/api/admin/categories", response_model=List[CategoryResponse])
def get_all_categories_admin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin: Get all categories including inactive"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    categories = db.query(Category).order_by(Category.display_order).all()
    for category in categories:
        category.product_count = db.query(Product).filter(Product.category_id == category.id).count()
    
    return categories

@app.put("/api/admin/categories/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    category_update: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin: Update category"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    for key, value in category_update.dict(exclude_unset=True).items():
        setattr(db_category, key, value)
    
    db.commit()
    db.refresh(db_category)
    db_category.product_count = db.query(Product).filter(Product.category_id == category_id).count()
    return db_category

@app.delete("/api/admin/categories/{category_id}")
def delete_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin: Delete category"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if category has products
    product_count = db.query(Product).filter(Product.category_id == category_id).count()
    if product_count > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete category with {product_count} products")
    
    db.delete(db_category)
    db.commit()
    return {"message": "Category deleted successfully"}

# =========================
# PRODUCT MANAGEMENT
# =========================

@app.get(
    "/api/products",
    response_model=List[ProductResponse],
    tags=["Products"],
    summary="Get Products",
    description="Retrieve products with optional filtering, searching, and sorting"
)
def get_products(
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = "newest",
    is_featured: Optional[bool] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of products with advanced filtering and sorting options.
    
    **Authentication:** Not required (public endpoint)
    
    **Query Parameters:**
    - `category_id`: Filter by category ID
    - `search`: Search in product name and description
    - `sort_by`: Sort options (newest, price_low, price_high, name, highest_discount, popular)
    - `is_featured`: Filter featured products (true/false)
    - `skip`: Number of records to skip (pagination)
    - `limit`: Maximum number of records to return (default: 50, max: 100)
    
    **Sort Options:**
    - `newest` - Most recently added products (default)
    - `price_low` - Lowest price first (uses discounted price)
    - `price_high` - Highest price first (uses discounted price)
    - `name` - Alphabetical order (A-Z)
    - `highest_discount` - Highest discount percentage first
    - `popular` - Most sold products
    
    **Example Request:**
    ```
    GET /api/products?category_id=1&search=cement&sort_by=price_low&limit=20
    ```
    
    **Returns:**
    List of products with:
    - Product details (id, name, description, price)
    - Discount information (discount_percent, discounted_price)
    - Stock status
    - Category information
    - Sales count
    - Featured status
    """
    query = db.query(Product).options(
        joinedload(Product.category)
    ).filter(Product.is_active == True)
    
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    if search:
        query = query.filter(
            (Product.name.ilike(f"%{search}%")) | 
            (Product.description.ilike(f"%{search}%"))
        )
    
    if is_featured is not None:
        query = query.filter(Product.is_featured == is_featured)
    
    # Sorting
    if sort_by == "price_low":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_high":
        query = query.order_by(Product.price.desc())
    elif sort_by == "popular":
        query = query.order_by(Product.sales_count.desc(), Product.views.desc())
    else:  # newest
        query = query.order_by(Product.created_at.desc())
    
    products = query.offset(skip).limit(limit).all()
    
    # Calculate discount percent
    for product in products:
        if product.original_price and product.original_price > product.price:
            product.discount_percent = int(((product.original_price - product.price) / product.original_price) * 100)
        else:
            product.discount_percent = 0
    
    return products

@app.get("/api/products/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Get single product details"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product or not product.is_active:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Increment view count
    product.views += 1
    db.commit()
    
    # Calculate discount
    if product.original_price and product.original_price > product.price:
        product.discount_percent = int(((product.original_price - product.price) / product.original_price) * 100)
    else:
        product.discount_percent = 0
    
    return product

@app.post("/api/admin/products", response_model=ProductResponse)
def create_product(
    product: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin: Create new product"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Verify category exists
    category = db.query(Category).filter(Category.id == product.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    db_product.discount_percent = 0
    return db_product

@app.get("/api/admin/products", response_model=List[ProductResponse])
def get_all_products_admin(
    category_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin: Get all products including inactive"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = db.query(Product)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    products = query.order_by(Product.created_at.desc()).all()
    
    for product in products:
        if product.original_price and product.original_price > product.price:
            product.discount_percent = int(((product.original_price - product.price) / product.original_price) * 100)
        else:
            product.discount_percent = 0
    
    return products

@app.put("/api/admin/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_update: ProductUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin: Update product"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in product_update.dict(exclude_unset=True).items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    
    if db_product.original_price and db_product.original_price > db_product.price:
        db_product.discount_percent = int(((db_product.original_price - db_product.price) / db_product.original_price) * 100)
    else:
        db_product.discount_percent = 0
    
    return db_product

@app.delete("/api/admin/products/{product_id}")
def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin: Delete product"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if product is in any carts or orders
    cart_items = db.query(CartItem).filter(CartItem.product_id == product_id).count()
    if cart_items > 0:
        raise HTTPException(status_code=400, detail="Cannot delete product that is in user carts")
    
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted successfully"}

# =========================
# SHOPPING CART
# =========================

@app.get("/api/cart", response_model=List[CartItemResponse])
def get_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's shopping cart"""
    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    
    response = []
    for item in cart_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product and product.is_active:
            cart_item_data = {
                "id": item.id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "selected_size": item.selected_size,
                "product": product,
                "subtotal": product.price * item.quantity
            }
            # Add discount to product
            if product.original_price and product.original_price > product.price:
                product.discount_percent = int(((product.original_price - product.price) / product.original_price) * 100)
            else:
                product.discount_percent = 0
            
            response.append(cart_item_data)
    
    return response

# =========================
# Admin Product Management
# =========================

@app.post("/api/admin/products", response_model=ProductResponse)
def create_product_admin(
    product: ProductCreate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Create new product"""
    # Generate slug from name
    slug = product.name.lower().replace(' ', '-')
    
    db_product = Product(
        category_id=product.category_id,
        name=product.name,
        slug=slug,
        description=product.description,
        price=product.price,
        discount_percent=product.discount_percent,
        stock_quantity=product.stock_quantity,
        sku=product.sku or f"SKU-{int(time.time())}",
        is_active=product.is_active if hasattr(product, 'is_active') else True,
        images=product.images if hasattr(product, 'images') else []
    )
    
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    return db_product

@app.put("/api/admin/products/{product_id}", response_model=ProductResponse)
def update_product_admin(
    product_id: int,
    product: ProductUpdate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Update product"""
    db_product = db.query(Product).filter(Product.id == product_id).first()
    
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Update fields
    if product.name is not None:
        db_product.name = product.name
        db_product.slug = product.name.lower().replace(' ', '-')
    if product.description is not None:
        db_product.description = product.description
    if product.price is not None:
        db_product.price = product.price
    if product.discount_percent is not None:
        db_product.discount_percent = product.discount_percent
    if product.stock_quantity is not None:
        db_product.stock_quantity = product.stock_quantity
    if product.category_id is not None:
        db_product.category_id = product.category_id
    if product.sku is not None:
        db_product.sku = product.sku
    if product.is_active is not None:
        db_product.is_active = product.is_active
    if product.images is not None:
        db_product.images = product.images
    
    db.commit()
    db.refresh(db_product)
    
    return db_product

@app.delete("/api/admin/products/{product_id}")
def delete_product_admin(
    product_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Delete product"""
    db_product = db.query(Product).filter(Product.id == product_id).first()
    
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(db_product)
    db.commit()
    
    return {"message": "Product deleted successfully"}

# =========================
# Shopping Cart
# =========================

@app.post(
    "/api/cart",
    response_model=CartItemResponse,
    tags=["Shopping Cart"],
    summary="Add to Cart",
    description="Add a product to the user's shopping cart",
    status_code=status.HTTP_201_CREATED
)
def add_to_cart(
    cart_item: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a product to the shopping cart.
    
    **Authentication Required:** Yes
    
    **Behavior:**
    - If product already in cart, quantity is increased
    - Stock availability is validated
    - Product must be active
    
    **Request Body:**
    ```json
    {
        "product_id": 1,
        "quantity": 2
    }
    ```
    
    **Returns:**
    - Cart item with product details
    - Current quantity in cart
    
    **Error Responses:**
    - 400: Insufficient stock
    - 404: Product not found or inactive
    - 401: Not authenticated
    """
    # Check if product exists and is active
    product = db.query(Product).filter(
        Product.id == cart_item.product_id,
        Product.is_active == True
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product.stock < cart_item.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # Check if item already in cart
    existing_item = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.product_id == cart_item.product_id
    ).first()
    
    if existing_item:
        existing_item.quantity += cart_item.quantity
        if cart_item.selected_size:
            existing_item.selected_size = cart_item.selected_size
        if product.stock < existing_item.quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        db.commit()
        db.refresh(existing_item)
        cart_response = existing_item
    else:
        db_cart_item = CartItem(
            user_id=current_user.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            selected_size=cart_item.selected_size
        )
        db.add(db_cart_item)
        db.commit()
        db.refresh(db_cart_item)
        cart_response = db_cart_item
    
    # Prepare response
    if product.original_price and product.original_price > product.price:
        product.discount_percent = int(((product.original_price - product.price) / product.original_price) * 100)
    else:
        product.discount_percent = 0
    
    return {
        "id": cart_response.id,
        "product_id": cart_response.product_id,
        "quantity": cart_response.quantity,
        "selected_size": cart_response.selected_size,
        "product": product,
        "subtotal": product.price * cart_response.quantity
    }

@app.put("/api/cart/{cart_item_id}", response_model=CartItemResponse)
def update_cart_item(
    cart_item_id: int,
    cart_update: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update cart item quantity"""
    cart_item = db.query(CartItem).filter(
        CartItem.id == cart_item_id,
        CartItem.user_id == current_user.id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    product = db.query(Product).filter(Product.id == cart_item.product_id).first()
    if product.stock < cart_update.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    cart_item.quantity = cart_update.quantity
    db.commit()
    db.refresh(cart_item)
    
    if product.original_price and product.original_price > product.price:
        product.discount_percent = int(((product.original_price - product.price) / product.original_price) * 100)
    else:
        product.discount_percent = 0
    
    return {
        "id": cart_item.id,
        "product_id": cart_item.product_id,
        "quantity": cart_item.quantity,
        "product": product,
        "subtotal": product.price * cart_item.quantity
    }

@app.delete("/api/cart/{cart_item_id}")
def remove_from_cart(
    cart_item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove item from cart"""
    cart_item = db.query(CartItem).filter(
        CartItem.id == cart_item_id,
        CartItem.user_id == current_user.id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    db.delete(cart_item)
    db.commit()
    return {"message": "Item removed from cart"}

@app.delete("/api/cart")
def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clear entire cart"""
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Cart cleared"}

# =========================
# ORDER MANAGEMENT
# =========================

@app.post(
    "/api/orders",
    response_model=OrderResponse,
    tags=["Orders"],
    summary="Create Order",
    description="Create a new order from shopping cart items",
    status_code=status.HTTP_201_CREATED
)
def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new order from the user's shopping cart.
    
    **Authentication Required:** Yes
    
    **Process:**
    1. Validates cart is not empty
    2. Checks product availability and stock
    3. Calculates discounts automatically
    4. Creates order with all items
    5. Updates product sales count
    6. Clears the shopping cart
    
    **Request Body:**
    ```json
    {
        "delivery_address": "123 Main Street",
        "delivery_name": "John Doe",
        "delivery_phone": "+919876543210",
        "delivery_city": "Mumbai",
        "delivery_state": "Maharashtra",
        "delivery_pincode": "400001",
        "payment_method": "cod"
    }
    ```
    
    **Payment Methods:**
    - `cod` - Cash on Delivery
    - `online` - Online Payment (future implementation)
    
    **Returns:**
    - Complete order details
    - Order items with discount information
    - Original amount (before discount)
    - Discount amount (savings)
    - Total payable amount
    - Order status (pending)
    
    **Discount Calculation:**
    - Automatic discount applied based on product settings
    - Total savings calculated and displayed
    - Historical prices stored for accurate invoicing
    
    **Error Responses:**
    - 400: Cart empty or product unavailable
    - 401: Not authenticated
    """
    # Get cart items
    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Calculate total, original amount, and discount
    total_amount = 0
    original_amount = 0
    discount_amount = 0
    order_items_data = []
    total_points = 0
    
    # Helper function to calculate points from size
    def calculate_points_from_size(size_str):
        """Calculate points: 1L=1pt, 4L=4pts, 10L=10pts, 20L=20pts"""
        if not size_str:
            return 0
        try:
            liters = int(size_str.replace('L', '').strip())
            return liters
        except:
            return 0
    
    for cart_item in cart_items:
        product = db.query(Product).filter(Product.id == cart_item.product_id).first()
        
        if not product or not product.is_active:
            raise HTTPException(status_code=400, detail=f"Product {cart_item.product_id} not available")
        
        if product.stock < cart_item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")
        
        # Calculate original price (before discount)
        item_original_price = product.original_price if product.original_price else product.price
        
        # Calculate discounted price
        discount_percent = 0
        if product.original_price and product.original_price > product.price:
            discount_percent = int(((product.original_price - product.price) / product.original_price) * 100)
        
        discounted_price = product.price
        
        # Calculate totals
        item_total = discounted_price * cart_item.quantity
        item_original_total = item_original_price * cart_item.quantity
        item_discount = item_original_total - item_total
        
        total_amount += item_total
        original_amount += item_original_total
        discount_amount += item_discount
        
        # Calculate points for this item - use selected_size if available, else product.size
        size_to_use = cart_item.selected_size if cart_item.selected_size else product.size
        if size_to_use:
            points_per_item = calculate_points_from_size(size_to_use)
            total_points += points_per_item * cart_item.quantity
        
        order_items_data.append({
            "product_id": product.id,
            "product_name": product.name,
            "quantity": cart_item.quantity,
            "price_at_purchase": 0.0,
            "original_price": 0.0,
            "discount_percent": 0,
            "size_ordered": size_to_use
        })
    
    # Create order
    from datetime import datetime
    now = datetime.now()
    order_number = f"ORD{now.strftime('%Y%m%d%H%M%S%f')}{current_user.id}"
    
    db_order = Order(
        user_id=current_user.id,
        order_number=order_number,
        total_amount=0.0,
        original_amount=0.0,
        discount_amount=0.0,
        status="pending",
        delivery_address=order_data.delivery_address,
        delivery_city=order_data.delivery_city,
        delivery_state=order_data.delivery_state,
        delivery_pincode=order_data.delivery_pincode,
        delivery_phone=order_data.delivery_phone,
        order_date=now.strftime('%d-%m-%Y'),
        order_time=now.strftime('%I:%M %p'),
        order_day=now.strftime('%A'),
        points_earned=total_points
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    # Create order items and update stock
    for item_data in order_items_data:
        order_item = OrderItem(
            order_id=db_order.id,
            **item_data
        )
        db.add(order_item)
        
        # Update product stock and sales count
        product = db.query(Product).filter(Product.id == item_data["product_id"]).first()
        product.stock -= item_data["quantity"]
        product.sales_count += item_data["quantity"]
    
    # Award points to user
    if total_points > 0:
        current_user.points = (current_user.points or 0) + total_points
    
    # Clear cart
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    
    db.commit()
    db.refresh(db_order)
    
    return db_order

@app.post(
    "/api/orders/direct",
    response_model=OrderResponse,
    tags=["Orders"],
    summary="Create Order Directly",
    description="Create a new order with items directly (without cart)",
    status_code=status.HTTP_201_CREATED
)
def create_order_direct(
    order_data: OrderCreateDirect,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create order directly with provided items (for hardcoded products or direct checkout)"""
    from datetime import datetime
    
    if not order_data.items or len(order_data.items) == 0:
        raise HTTPException(status_code=400, detail="No items provided")
    
    # Calculate points based on sizes ordered
    def calculate_points_from_size(size_str):
        """Calculate points: 1L=1pt, 4L=4pts, 10L=10pts, 20L=20pts"""
        if not size_str:
            return 0
        # Extract number from size string (e.g., '4L' -> 4)
        try:
            liters = int(size_str.replace('L', '').strip())
            return liters
        except:
            return 0
    
    # Calculate total points for this order
    total_points = 0
    for item in order_data.items:
        if item.size_ordered:
            points_per_item = calculate_points_from_size(item.size_ordered)
            total_points += points_per_item * item.quantity
    
    # Generate order number
    now = datetime.now()
    order_number = f"ORD{now.strftime('%Y%m%d%H%M%S%f')}{current_user.id}"
    
    # Create order
    db_order = Order(
        user_id=current_user.id,
        order_number=order_number,
        total_amount=0.0,
        original_amount=0.0,
        discount_amount=0.0,
        status="pending",
        delivery_address=order_data.delivery_address,
        delivery_city=order_data.delivery_city,
        delivery_state=order_data.delivery_state,
        delivery_pincode=order_data.delivery_pincode,
        delivery_phone=order_data.delivery_phone,
        order_date=now.strftime('%d-%m-%Y'),
        order_time=now.strftime('%I:%M %p'),
        order_day=now.strftime('%A'),
        points_earned=total_points
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    # Create order items
    for item in order_data.items:
        order_item = OrderItem(
            order_id=db_order.id,
            product_id=item.product_id if item.product_id else None,
            product_name=item.product_name,
            quantity=item.quantity,
            price_at_purchase=0.0,
            original_price=0.0,
            discount_percent=0,
            size_ordered=item.size_ordered
        )
        db.add(order_item)
    
    # Award points to user
    if total_points > 0:
        current_user.points = (current_user.points or 0) + total_points
    
    db.commit()
    db.refresh(db_order)
    
    return db_order

@app.get("/api/orders", response_model=List[OrderResponse])
def get_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's order history"""
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    return orders

@app.get("/api/orders/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific order details"""
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return order

@app.get("/api/admin/orders")
def get_all_orders_admin(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin: Get all orders with product images"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = db.query(Order).options(joinedload(Order.order_items).joinedload(OrderItem.product))
    if status:
        query = query.filter(Order.status == status)
    
    orders = query.order_by(Order.created_at.desc()).all()
    
    # Build response with product images
    result = []
    for order in orders:
        order_dict = {
            "id": order.id,
            "user_id": order.user_id,
            "order_number": order.order_number,
            "total_amount": order.total_amount,
            "original_amount": order.original_amount,
            "discount_amount": order.discount_amount,
            "status": order.status,
            "delivery_address": order.delivery_address,
            "delivery_city": order.delivery_city,
            "delivery_state": order.delivery_state,
            "delivery_pincode": order.delivery_pincode,
            "delivery_phone": order.delivery_phone,
            "order_date": order.order_date,
            "order_time": order.order_time,
            "order_day": order.order_day,
            "points_earned": order.points_earned or 0,
            "created_at": order.created_at,
            "order_items": []
        }
        
        for item in order.order_items:
            item_dict = {
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product_name,
                "product_image": item.product.image_path if item.product else None,
                "quantity": item.quantity,
                "price_at_purchase": item.price_at_purchase,
                "original_price": item.original_price,
                "discount_percent": item.discount_percent,
                "size_ordered": item.size_ordered
            }
            order_dict["order_items"].append(item_dict)
        
        result.append(order_dict)
    
    return result

@app.get(
    "/api/admin/sales-analytics",
    tags=["Admin - Analytics"],
    summary="Get Sales Analytics",
    description="Retrieve detailed sales analytics with top products, customers, and discount data"
)
def get_sales_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive sales analytics for business intelligence.
    
    **Authentication Required:** Yes (Admin only)
    
    **Returns:**
    
    **Top Selling Products (Top 10):**
    - Product ID and name
    - Units sold
    - Total revenue generated
    - Sorted by units sold (descending)
    
    **Top Customers by Spending:**
    - Customer information (ID, email, name)
    - Total orders placed
    - Total amount spent
    - Total savings from discounts
    - Sorted by spending (descending)
    
    **Products with Most Discounts:**
    - Product information
    - Discount percentage
    - Units sold with discount
    - Total discount amount given
    - Sorted by discount amount (descending)
    
    **Use Cases:**
    - Identify best-selling products
    - Find most valuable customers
    - Analyze discount effectiveness
    - Sales performance tracking
    - Inventory planning
    - Marketing strategy insights
    
    **Example Response:**
    ```json
    {
        "top_selling_products": [
            {
                "id": 1,
                "name": "Premium Cement",
                "units_sold": 500,
                "total_revenue": 250000.00
            }
        ],
        "top_customers": [
            {
                "id": 5,
                "email": "customer@example.com",
                "full_name": "John Doe",
                "total_orders": 15,
                "total_spent": 75000.00,
                "total_saved": 10000.00
            }
        ],
        "products_with_most_discounts": [
            {
                "id": 3,
                "name": "Building Tiles",
                "discount_percent": 20,
                "units_sold": 200,
                "total_discount_given": 40000.00
            }
        ]
    }
    ```
    
    **Error Responses:**
    - 401: Not authenticated
    - 403: Not an admin user
    """
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    from sqlalchemy import func
    
    # Top selling products
    top_products = db.query(
        Product.id,
        Product.name,
        Product.sales_count,
        func.sum(OrderItem.quantity).label('total_sold'),
        func.sum(OrderItem.price_at_purchase * OrderItem.quantity).label('revenue')
    ).join(OrderItem).group_by(Product.id).order_by(func.sum(OrderItem.quantity).desc()).limit(10).all()
    
    # Customer purchase summary
    customer_summary = db.query(
        User.id,
        User.email,
        User.full_name,
        func.count(Order.id).label('total_orders'),
        func.sum(Order.total_amount).label('total_spent'),
        func.sum(Order.discount_amount).label('total_saved')
    ).join(Order).group_by(User.id).order_by(func.sum(Order.total_amount).desc()).all()
    
    # Products with most discount given
    discount_products = db.query(
        Product.id,
        Product.name,
        func.sum(OrderItem.quantity * (OrderItem.original_price - OrderItem.price_at_purchase)).label('total_discount_given')
    ).join(OrderItem).group_by(Product.id).order_by(
        func.sum(OrderItem.quantity * (OrderItem.original_price - OrderItem.price_at_purchase)).desc()
    ).limit(10).all()
    
    return {
        "top_selling_products": [
            {
                "product_id": p.id,
                "name": p.name,
                "units_sold": int(p.total_sold or 0),
                "revenue": float(p.revenue or 0)
            }
            for p in top_products
        ],
        "top_customers": [
            {
                "user_id": c.id,
                "email": c.email,
                "name": c.full_name or "N/A",
                "total_orders": c.total_orders,
                "total_spent": float(c.total_spent or 0),
                "total_saved": float(c.total_saved or 0)
            }
            for c in customer_summary
        ],
        "products_with_most_discounts": [
            {
                "product_id": p.id,
                "name": p.name,
                "total_discount_given": float(p.total_discount_given or 0)
            }
            for p in discount_products
        ]
    }

@app.put("/api/admin/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin: Update order status"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    valid_statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = status
    db.commit()
    return {"message": f"Order status updated to {status}"}

# ============================================================================
# ADMIN CUSTOMERS MANAGEMENT
# ============================================================================

@app.get("/api/admin/customers", tags=["Admin - Customers"])
def get_all_customers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin: Get all customers with their statistics"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    from sqlalchemy import func
    
    # Get all customers with order stats
    customers = db.query(
        User.id,
        User.email,
        User.full_name,
        User.phone,
        User.address,
        User.city,
        User.state,
        User.pincode,
        User.created_at,
        func.count(Order.id).label('total_orders'),
        func.sum(Order.total_amount).label('total_spent'),
        func.coalesce(func.sum(Order.discount_amount), 0).label('total_saved')
    ).outerjoin(Order, User.id == Order.user_id)\
     .filter(User.is_admin == False)\
     .group_by(User.id)\
     .order_by(func.count(Order.id).desc())\
     .all()
    
    result = []
    for customer in customers:
        result.append({
            "id": customer.id,
            "email": customer.email,
            "full_name": customer.full_name,
            "phone": customer.phone,
            "address": customer.address,
            "city": customer.city,
            "state": customer.state,
            "pincode": customer.pincode,
            "created_at": customer.created_at.isoformat() if customer.created_at else None,
            "total_orders": customer.total_orders or 0,
            "total_spent": float(customer.total_spent or 0),
            "total_saved": float(customer.total_saved or 0)
        })
    
    return result

@app.get("/api/admin/customers/{customer_id}", tags=["Admin - Customers"])
def get_customer_details(
    customer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin: Get detailed customer information with orders"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get customer
    customer = db.query(User).filter(User.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Get customer's orders with items
    orders = db.query(Order).filter(Order.user_id == customer_id).order_by(Order.created_at.desc()).all()
    
    orders_data = []
    for order in orders:
        order_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        orders_data.append({
            "id": order.id,
            "order_number": order.order_number,
            "total_amount": order.total_amount,
            "original_amount": order.original_amount,
            "discount_amount": order.discount_amount,
            "status": order.status,
            "delivery_address": order.delivery_address,
            "delivery_city": order.delivery_city,
            "delivery_state": order.delivery_state,
            "delivery_pincode": order.delivery_pincode,
            "delivery_phone": order.delivery_phone,
            "order_date": order.order_date,
            "order_time": order.order_time,
            "order_day": order.order_day,
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "items": [
                {
                    "id": item.id,
                    "product_id": item.product_id,
                    "product_name": item.product_name,
                    "quantity": item.quantity,
                    "price_at_purchase": item.price_at_purchase,
                    "original_price": item.original_price,
                    "discount_percent": item.discount_percent
                }
                for item in order_items
            ]
        })
    
    return {
        "id": customer.id,
        "email": customer.email,
        "full_name": customer.full_name,
        "phone": customer.phone,
        "address": customer.address,
        "city": customer.city,
        "state": customer.state,
        "pincode": customer.pincode,
        "created_at": customer.created_at.isoformat() if customer.created_at else None,
        "orders": orders_data
    }

@app.get("/api/admin/products/analytics", tags=["Admin - Analytics"])
def get_product_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin: Get all products with order analytics"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    from sqlalchemy import func, distinct, or_
    from sqlalchemy.orm import aliased
    
    # Get ALL products with their order stats
    products = db.query(Product).filter(Product.is_active == True).all()
    
    result = []
    for product in products:
        # Count orders for this product - match by product_id OR product_name (for hardcoded products)
        order_stats = db.query(
            func.count(distinct(Order.user_id)).label('unique_customers'),
            func.count(OrderItem.id).label('total_orders'),
            func.coalesce(func.sum(OrderItem.quantity), 0).label('total_quantity_sold')
        ).select_from(OrderItem)\
         .join(Order, OrderItem.order_id == Order.id)\
         .filter(
             or_(
                 OrderItem.product_id == product.id,
                 OrderItem.product_name == product.name
             )
         )\
         .first()
        
        result.append({
            "id": product.id,
            "name": product.name,
            "image_url": product.image_path,
            "unique_customers": order_stats.unique_customers if order_stats else 0,
            "total_orders": order_stats.total_orders if order_stats else 0,
            "total_quantity_sold": order_stats.total_quantity_sold if order_stats else 0,
        })
    
    # Sort by total_orders descending (products with most orders first)
    result.sort(key=lambda x: x['total_orders'], reverse=True)
    
    return result

# ============================================================================
# ADMIN OFFERS MANAGEMENT
# ============================================================================

@app.post("/api/admin/offers", response_model=AdminOfferResponse, tags=["Admin - Offers"])
def create_admin_offer(
    offer_data: AdminOfferCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin: Create a new promotional offer"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    db_offer = AdminOffer(**offer_data.dict())
    db.add(db_offer)
    db.commit()
    db.refresh(db_offer)
    return db_offer

@app.get("/api/admin/offers", response_model=List[AdminOfferResponse], tags=["Admin - Offers"])
def get_all_admin_offers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin: Get all offers"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    offers = db.query(AdminOffer).order_by(AdminOffer.created_at.desc()).all()
    return offers

@app.get("/api/offers", response_model=List[AdminOfferResponse], tags=["Offers"])
def get_active_offers(db: Session = Depends(get_db)):
    """Get active promotional offers for users"""
    from datetime import datetime
    now = datetime.now()
    
    offers = db.query(AdminOffer).filter(
        AdminOffer.is_active == True,
        AdminOffer.valid_from <= now,
        AdminOffer.valid_until >= now
    ).all()
    return offers

@app.put("/api/admin/offers/{offer_id}", response_model=AdminOfferResponse, tags=["Admin - Offers"])
def update_admin_offer(
    offer_id: int,
    offer_data: AdminOfferCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin: Update an offer"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    offer = db.query(AdminOffer).filter(AdminOffer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    for key, value in offer_data.dict().items():
        setattr(offer, key, value)
    
    db.commit()
    db.refresh(offer)
    return offer

@app.delete("/api/admin/offers/{offer_id}", tags=["Admin - Offers"])
def delete_admin_offer(
    offer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin: Delete an offer"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    offer = db.query(AdminOffer).filter(AdminOffer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    db.delete(offer)
    db.commit()
    return {"message": "Offer deleted successfully"}

@app.patch("/api/admin/offers/{offer_id}/toggle", tags=["Admin - Offers"])
def toggle_offer_status(
    offer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin: Toggle offer active status"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    offer = db.query(AdminOffer).filter(AdminOffer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    offer.is_active = not offer.is_active
    db.commit()
    return {"message": f"Offer {'activated' if offer.is_active else 'deactivated'}", "is_active": offer.is_active}

# ============================================================================
# WebSocket Notification System
# ============================================================================

class ConnectionManager:
    """Manages WebSocket connections for real-time notifications"""
    
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = defaultdict(list)
    
    async def connect(self, websocket: WebSocket, user_id: int):
        """Connect a new WebSocket client"""
        await websocket.accept()
        self.active_connections[user_id].append(websocket)
        print(f"✅ User {user_id} connected. Active connections: {len(self.active_connections[user_id])}")
    
    def disconnect(self, websocket: WebSocket, user_id: int):
        """Disconnect a WebSocket client"""
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
            print(f"❌ User {user_id} disconnected. Remaining connections: {len(self.active_connections.get(user_id, []))}")
    
    async def send_personal_message(self, message: dict, user_id: int):
        """Send a message to a specific user"""
        if user_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"Error sending message to user {user_id}: {e}")
                    disconnected.append(connection)
            
            # Remove disconnected connections
            for conn in disconnected:
                self.disconnect(conn, user_id)
    
    async def broadcast(self, message: dict, exclude_user: Optional[int] = None):
        """Broadcast a message to all connected users"""
        for user_id, connections in list(self.active_connections.items()):
            if exclude_user and user_id == exclude_user:
                continue
            await self.send_personal_message(message, user_id)

# Initialize connection manager
manager = ConnectionManager()

@app.websocket("/ws/notifications/{user_id}")
async def websocket_notifications(
    websocket: WebSocket,
    user_id: int,
    token: Optional[str] = None
):
    """
    WebSocket endpoint for real-time notifications
    
    Connect to this endpoint to receive real-time notifications:
    - Order status updates
    - Discount alerts
    - Reward notifications
    - Admin announcements
    
    **Query Parameters:**
    - `token`: JWT authentication token (required)
    
    **Message Format:**
    ```json
    {
        "id": "unique_notification_id",
        "type": "order|discount|alert|info|reward",
        "title": "Notification Title",
        "message": "Notification message content",
        "timestamp": "2025-01-01T12:00:00",
        "data": {}
    }
    ```
    """
    # Verify token
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    try:
        payload = decode_token(token)
        token_user_id = payload.get("user_id")
        
        if not token_user_id or token_user_id != user_id:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    except:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    # Connect the client
    await manager.connect(websocket, user_id)
    
    # Send welcome message
    await manager.send_personal_message({
        "id": f"welcome_{user_id}_{int(time.time())}",
        "type": "info",
        "title": "Connected",
        "message": "You are now connected to real-time notifications",
        "timestamp": datetime.now().isoformat()
    }, user_id)
    
    try:
        while True:
            # Keep connection alive and receive messages from client
            data = await websocket.receive_text()
            
            # Handle ping/pong for connection health
            if data == "ping":
                await websocket.send_text("pong")
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as e:
        print(f"WebSocket error for user {user_id}: {e}")
        manager.disconnect(websocket, user_id)

# Helper function to send notifications
async def send_notification(user_id: int, notification: dict):
    """Helper function to send notification to a specific user"""
    notification_data = {
        "id": notification.get("id", f"notif_{int(time.time() * 1000)}"),
        "type": notification.get("type", "info"),
        "title": notification.get("title", "Notification"),
        "message": notification.get("message", ""),
        "timestamp": notification.get("timestamp", datetime.now().isoformat()),
        "data": notification.get("data", {})
    }
    await manager.send_personal_message(notification_data, user_id)

if __name__ == "__main__":
    import uvicorn
    import socket
    
    # Get local IP address
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
    
    print("=" * 60)
    print("🚀 Starting Kubti Hardware API Server...")
    print("=" * 60)
    print("📊 Database: SQLite (kubti_hardware.db)")
    print("🌐 Local Access: http://localhost:8000")
    print(f"📱 Network Access: http://{local_ip}:8000")
    print(f"🔗 From Expo App: Update config/api.js to http://{local_ip}:8000")
    print("📚 API Docs: http://localhost:8000/docs")
    print("=" * 60)
    print("\n⚠️  If connection fails from mobile device:")
    print("   1. Check Windows Firewall allows port 8000")
    print("   2. Ensure phone and computer are on same WiFi network")
    print(f"   3. Update frontend/config/api.js with: http://{local_ip}:8000")
    print("=" * 60 + "\n")
    
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
