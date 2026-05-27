package com.manohari.service;
import com.manohari.dto.request.CartItemRequest;
import com.manohari.dto.response.CartResponse;
public interface CartService {
    CartResponse getCart(String identifier);
    CartResponse addToCart(String identifier, CartItemRequest request);
    CartResponse updateCartItem(String identifier, String productId, int quantity, String color, String size);
    CartResponse removeFromCart(String identifier, String productId, String color, String size);
    void clearCart(String identifier);
}
