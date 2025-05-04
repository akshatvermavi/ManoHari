package com.akshatvermavi.manobaribackend.repo;

import com.akshatvermavi.manobaribackend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepo extends JpaRepository<Product, Integer> { // class you are working with and primary key

}

