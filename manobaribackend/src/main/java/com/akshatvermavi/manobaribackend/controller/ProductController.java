package com.akshatvermavi.manobaribackend.controller;

import com.akshatvermavi.manobaribackend.model.Product;
import com.akshatvermavi.manobaribackend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/api")
public class ProductController {

    @Autowired
    private ProductService service;

    @GetMapping("/")
    public String greet(){
        return "Hello World!";
    }

    // method that return the list of the product
    @GetMapping("/product")
    public ResponseEntity<List<Product>> getAllProducts(){
       return new ResponseEntity<>(service.getAllProducts(), HttpStatus.OK); //it shows in postman that status code is 200, we can change it as well
    }

    @GetMapping("/product/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable int id) {
        Product product = service.getProductById(id);
        if (product != null) {
            return new ResponseEntity<>(product, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

}
