package com.manohari.controller;

import com.manohari.dto.request.CartItemRequest;
import com.manohari.dto.response.ApiResponse;
import com.manohari.dto.response.CartResponse;
import com.manohari.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(@AuthenticationPrincipal UserDetails userDetails) {
        CartResponse cart = cartService.getCart(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(cart));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CartItemRequest request) {
        CartResponse cart = cartService.addToCart(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(cart));
    }

    @PutMapping("/update/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String productId,
            @RequestParam int quantity,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String size) {
        CartResponse cart = cartService.updateCartItem(userDetails.getUsername(), productId, quantity, color, size);
        return ResponseEntity.ok(ApiResponse.success(cart));
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeFromCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String productId,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String size) {
        CartResponse cart = cartService.removeFromCart(userDetails.getUsername(), productId, color, size);
        return ResponseEntity.ok(ApiResponse.success(cart));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<String>> clearCart(@AuthenticationPrincipal UserDetails userDetails) {
        cartService.clearCart(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared"));
    }
}
