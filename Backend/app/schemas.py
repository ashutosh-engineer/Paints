from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
import re

# User Registration
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    full_name: Optional[str] = Field(None, max_length=100)
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('Password must contain at least one letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        return v
    
    @validator('full_name')
    def validate_full_name(cls, v):
        if v and len(v.strip()) == 0:
            return None
        if v and not re.match(r'^[a-zA-Z\s.]+$', v):
            raise ValueError('Full name can only contain letters, spaces, and dots')
        return v.strip() if v else None

# User Login - accepts any string for email to be more lenient
class UserLogin(BaseModel):
    email: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=1, max_length=100)
    
    @validator('email')
    def validate_email_format(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Email is required')
        return v.strip().lower()

# Token Response
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Admin Change Password
class AdminChangePassword(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=6)
    
    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 6:
            raise ValueError('New password must be at least 6 characters')
        return v

# User Profile Update
class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=15)
    street_address: Optional[str] = Field(None, max_length=200)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    pincode: Optional[str] = Field(None, max_length=10)
    
    @validator('full_name')
    def validate_full_name(cls, v):
        if v and len(v.strip()) == 0:
            return None
        if v and not re.match(r'^[a-zA-Z\s.]+$', v):
            raise ValueError('Full name can only contain letters, spaces, and dots')
        return v.strip() if v else None
    
    @validator('phone')
    def validate_phone(cls, v):
        if v and not re.match(r'^\+?[0-9]{10,15}$', v):
            raise ValueError('Invalid phone number format')
        return v
    
    @validator('street_address', 'city', 'state')
    def validate_location_fields(cls, v):
        if v and len(v.strip()) == 0:
            return None
        return v.strip() if v else None
    
    @validator('pincode')
    def validate_pincode(cls, v):
        if v and not re.match(r'^[0-9]{6}$', v):
            raise ValueError('Pincode must be 6 digits')
        return v

# Location/Address Update
class LocationUpdate(BaseModel):
    street_address: Optional[str] = Field(None, max_length=200)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    pincode: Optional[str] = Field(None, max_length=10)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    @validator('street_address', 'city', 'state')
    def validate_text_fields(cls, v):
        if v and len(v.strip()) == 0:
            return None
        return v.strip() if v else None
    
    @validator('pincode')
    def validate_pincode(cls, v):
        if v and not re.match(r'^[0-9]{4,10}$', v):
            raise ValueError('Invalid pincode format')
        return v

# Shop Details Update
class ShopDetailsUpdate(BaseModel):
    shop_name: str
    trader_name: str
    address: str
    
    @validator('shop_name', 'trader_name', 'address')
    def validate_required_fields(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('This field is required')
        return v.strip()

# User Response
class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    is_admin: bool = False
    street_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    shop_name: Optional[str] = None
    trader_name: Optional[str] = None
    address: Optional[str] = None
    shop_details_completed: bool = False
    is_profile_complete: bool
    points: int = 0
    created_at: datetime

    class Config:
        from_attributes = True

# Admin User Management
class AdminUserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    is_admin: Optional[bool] = None
    is_profile_complete: Optional[bool] = None

# Create Admin User
class AdminCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    full_name: str = Field(..., min_length=1, max_length=100)
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v
    
    @validator('full_name')
    def validate_full_name(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Full name is required')
        return v.strip()

# Category Schemas
class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image_folder: Optional[str] = None
    display_order: int = 0

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_folder: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None

class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    image_folder: Optional[str] = None
    display_order: int
    is_active: bool
    product_count: Optional[int] = 0
    created_at: datetime

    class Config:
        from_attributes = True

# Product Schemas
class ProductCreate(BaseModel):
    category_id: int
    name: str
    description: Optional[str] = None
    price: float
    original_price: Optional[float] = None
    stock: int = 0
    image_path: Optional[str] = None
    size: Optional[str] = None
    color: Optional[str] = None
    finish: Optional[str] = None
    is_featured: bool = False

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    stock: Optional[int] = None
    image_path: Optional[str] = None
    size: Optional[str] = None
    color: Optional[str] = None
    finish: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None

class ProductResponse(BaseModel):
    id: int
    category_id: int
    name: str
    description: Optional[str] = None
    price: float
    original_price: Optional[float] = None
    stock: int
    image_path: Optional[str] = None
    size: Optional[str] = None
    color: Optional[str] = None
    finish: Optional[str] = None
    is_featured: bool
    is_active: bool
    views: int
    sales_count: int
    discount_percent: Optional[int] = None
    created_at: datetime
    category: Optional['CategoryResponse'] = None

    class Config:
        from_attributes = True

# Cart Schemas
class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1
    selected_size: Optional[str] = None

class CartItemUpdate(BaseModel):
    quantity: int
    selected_size: Optional[str] = None

class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    selected_size: Optional[str] = None
    product: ProductResponse
    subtotal: float

    class Config:
        from_attributes = True

# Admin Offers Schemas
class AdminOfferCreate(BaseModel):
    title: str
    description: Optional[str] = None
    discount_percent: int
    valid_from: datetime
    valid_until: datetime
    is_active: bool = True

class AdminOfferResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    discount_percent: int
    valid_from: datetime
    valid_until: datetime
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Order Schemas
class OrderItemCreate(BaseModel):
    product_id: Optional[int] = None
    product_name: str
    quantity: int
    price: float
    size_ordered: Optional[str] = None  # '1L', '4L', '10L', '20L'

class OrderCreate(BaseModel):
    delivery_address: str
    delivery_city: str
    delivery_state: str
    delivery_pincode: str
    delivery_phone: str

class OrderCreateDirect(BaseModel):
    delivery_address: str
    delivery_city: str
    delivery_state: str
    delivery_pincode: str
    delivery_phone: str
    items: List[OrderItemCreate]
    total_amount: float

class OrderItemResponse(BaseModel):
    id: int
    product_id: Optional[int] = None
    product_name: str
    product_image: Optional[str] = None
    quantity: int
    price_at_purchase: float
    original_price: float
    discount_percent: int
    size_ordered: Optional[str] = None

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    user_id: int
    order_number: Optional[str] = None
    total_amount: float
    original_amount: float
    discount_amount: float
    status: str
    delivery_address: str
    delivery_city: Optional[str] = None
    delivery_state: Optional[str] = None
    delivery_pincode: Optional[str] = None
    delivery_phone: Optional[str] = None
    order_date: Optional[str] = None
    order_time: Optional[str] = None
    order_day: Optional[str] = None
    points_earned: int = 0
    created_at: datetime
    order_items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True
