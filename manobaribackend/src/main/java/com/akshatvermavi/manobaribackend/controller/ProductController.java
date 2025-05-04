package com.akshatvermavi.manobaribackend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ProductController {

    public String greet(){
        return "Hello World!";
    }
}
