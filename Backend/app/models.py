from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    
    # Admin flag
    is_admin = Column(Boolean, default=False)
    
    # Address fields
    street_address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    pincode = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Shop details fields
    shop_name = Column(String, nullable=True)
    trader_name = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    shop_details_completed = Column(Boolean, default=False)
    
    # Profile completion tracking
    is_profile_complete = Column(Boolean, default=False)
    
    # Loyalty points system
    points = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    orders = relationship("Order", back_populates="user")
    cart_items = relationship("CartItem", back_populates="user")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)
    slug = Column(String, unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    image_folder = Column(String, nullable=True)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    stock = Column(Integer, default=0)
    image_path = Column(String, nullable=True)
    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # Product details
    size = Column(String, nullable=True)  # e.g., "1L", "4L", "20L"
    color = Column(String, nullable=True)
    finish = Column(String, nullable=True)  # Matte, Glossy, etc.
    
    # SEO and sorting
    views = Column(Integer, default=0)
    sales_count = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    category = relationship("Category", back_populates="products")
    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1)
    selected_size = Column(String, nullable=True)  # User's selected size like '1L', '4L', '10L', '20L'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="cart_items")
    product = relationship("Product", back_populates="cart_items")


class AdminOffer(Base):
    __tablename__ = "admin_offers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    discount_percent = Column(Integer, nullable=False)
    valid_from = Column(DateTime(timezone=True), nullable=False)
    valid_until = Column(DateTime(timezone=True), nullable=False)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    order_number = Column(String, nullable=True, index=True)  # Order ID for display
    total_amount = Column(Float, nullable=False)
    original_amount = Column(Float, nullable=False)  # Price before discount
    discount_amount = Column(Float, default=0.0)  # Total discount applied
    status = Column(String, default="pending")  # pending, confirmed, shipped, delivered, cancelled
    
    # Delivery address
    delivery_address = Column(Text, nullable=False)
    delivery_city = Column(String, nullable=True)
    delivery_state = Column(String, nullable=True)
    delivery_pincode = Column(String, nullable=True)
    delivery_phone = Column(String, nullable=True)
    
    # Order timestamps
    order_date = Column(String, nullable=True)  # DD-MM-YYYY format
    order_time = Column(String, nullable=True)  # HH:MM AM/PM format
    order_day = Column(String, nullable=True)  # Day of week
    
    # Points earned from this order
    points_earned = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)  # Allow null for hardcoded products
    product_name = Column(String, nullable=False)  # Store product name at time of purchase
    quantity = Column(Integer, nullable=False)
    price_at_purchase = Column(Float, nullable=False)  # Discounted price
    original_price = Column(Float, nullable=False)  # Original price before discount
    discount_percent = Column(Integer, default=0)  # Discount applied
    size_ordered = Column(String, nullable=True)  # Size like '1L', '4L', '10L', '20L'
    
    # Relationships
    order = relationship("Order", back_populates="order_items")
    product = relationship("Product", back_populates="order_items")
