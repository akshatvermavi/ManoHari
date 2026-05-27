package com.manohari.service.impl;

import com.manohari.dto.request.CartItemRequest;
import com.manohari.dto.response.CartResponse;
import com.manohari.exception.BadRequestException;
import com.manohari.exception.ResourceNotFoundException;
import com.manohari.model.Cart;
import com.manohari.model.Product;
import com.manohari.model.User;
import com.manohari.repository.CartRepository;
import com.manohari.repository.ProductRepository;
import com.manohari.repository.UserRepository;
import com.manohari.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    public CartResponse getCart(String identifier) {
        User user = getUser(identifier);
        Cart cart = cartRepository.findByUserId(user.getId())
            .orElse(Cart.builder().userId(user.getId()).items(new ArrayList<>()).build());
        return mapToResponse(cart);
    }

    @Override
    public CartResponse addToCart(String identifier, CartItemRequest request) {
        User user = getUser(identifier);
        Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!product.isActive()) throw new BadRequestException("Product is not available");

        BigDecimal price = product.getDiscountedPrice() != null
            ? product.getDiscountedPrice() : product.getPrice();

        Cart cart = cartRepository.findByUserId(user.getId())
            .orElse(Cart.builder().userId(user.getId()).items(new ArrayList<>()).build());

        // Check if same variant already in cart
        Optional<Cart.CartItem> existing = cart.getItems().stream()
            .filter(i -> i.getProductId().equals(request.getProductId())
                && nullSafeEquals(i.getColor(), request.getColor())
                && nullSafeEquals(i.getSize(), request.getSize()))
            .findFirst();

        if (existing.isPresent()) {
            existing.get().setQuantity(existing.get().getQuantity() + request.getQuantity());
        } else {
            String image = product.getImages() != null && !product.getImages().isEmpty()
                ? product.getImages().get(0) : null;
            cart.getItems().add(Cart.CartItem.builder()
                .productId(product.getId())
                .productTitle(product.getTitle())
                .productImage(image)
                .color(request.getColor())
                .size(request.getSize())
                .quantity(request.getQuantity())
                .price(price)
                .build());
        }

        cartRepository.save(cart);
        return mapToResponse(cart);
    }

    @Override
    public CartResponse updateCartItem(String identifier, String productId, int quantity, String color, String size) {
        User user = getUser(identifier);
        Cart cart = cartRepository.findByUserId(user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        cart.getItems().stream()
            .filter(i -> i.getProductId().equals(productId)
                && nullSafeEquals(i.getColor(), color)
                && nullSafeEquals(i.getSize(), size))
            .findFirst()
            .ifPresent(item -> {
                if (quantity <= 0) cart.getItems().remove(item);
                else item.setQuantity(quantity);
            });

        cartRepository.save(cart);
        return mapToResponse(cart);
    }

    @Override
    public CartResponse removeFromCart(String identifier, String productId, String color, String size) {
        User user = getUser(identifier);
        Cart cart = cartRepository.findByUserId(user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        cart.getItems().removeIf(i -> i.getProductId().equals(productId)
            && nullSafeEquals(i.getColor(), color)
            && nullSafeEquals(i.getSize(), size));

        cartRepository.save(cart);
        return mapToResponse(cart);
    }

    @Override
    public void clearCart(String identifier) {
        User user = getUser(identifier);
        cartRepository.deleteByUserId(user.getId());
    }

    private CartResponse mapToResponse(Cart cart) {
        List<CartResponse.CartItemResponse> items = cart.getItems().stream()
            .map(i -> CartResponse.CartItemResponse.builder()
                .productId(i.getProductId())
                .productTitle(i.getProductTitle())
                .productImage(i.getProductImage())
                .color(i.getColor()).size(i.getSize())
                .quantity(i.getQuantity()).price(i.getPrice())
                .totalPrice(i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .build())
            .collect(Collectors.toList());

        BigDecimal total = items.stream()
            .map(CartResponse.CartItemResponse::getTotalPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
            .id(cart.getId()).items(items)
            .totalAmount(total).totalItems(items.size()).build();
    }

    private User getUser(String identifier) {
        return userRepository.findByEmail(identifier)
            .or(() -> userRepository.findByPhoneNumber(identifier))
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private boolean nullSafeEquals(String a, String b) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return a.equals(b);
    }
}
