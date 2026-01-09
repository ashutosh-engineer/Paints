import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

async function getAuthHeaders() {
  const token = await AsyncStorage.getItem('access_token');
  if (!token) {
    throw new Error('Not authenticated');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export const fetchCart = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/cart`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) {
      // If unauthorized or other error, return empty cart instead of throwing
      if (response.status === 401) {
        console.log('Not authenticated, returning empty cart');
        return [];
      }
      const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch cart' }));
      console.warn('Cart fetch error:', errorData.detail);
      return [];
    }
    return response.json();
  } catch (error) {
    console.log('Cart API error:', error.message);
    return []; // Return empty cart on any error
  }
};

export const addToCart = async (productId, quantity, selectedSize = null) => {
  const headers = await getAuthHeaders();
  const body = { product_id: productId, quantity };
  if (selectedSize) {
    body.selected_size = selectedSize;
  }
  const response = await fetch(`${API_URL}/api/cart`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to add item to cart' }));
    throw new Error(errorData.detail);
  }
  return response.json();
};

export const updateCartItemQuantity = async (cartItemId, quantity) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/cart/${cartItemId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ quantity }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to update cart item' }));
    throw new Error(errorData.detail);
  }
  return response.json();
};

export const removeFromCart = async (cartItemId) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/cart/${cartItemId}`, {
    method: 'DELETE',
    headers,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to remove item from cart' }));
    throw new Error(errorData.detail);
  }
  return response.json();
};

export const clearCart = async () => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/cart`, {
    method: 'DELETE',
    headers,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to clear cart' }));
    throw new Error(errorData.detail);
  }
  return response.json();
};
