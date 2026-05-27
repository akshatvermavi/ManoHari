package com.manohari;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableMongoAuditing
@EnableCaching
@EnableAsync
@EnableScheduling
public class ManohariApplication {
    public static void main(String[] args) {
        SpringApplication.run(ManohariApplication.class, args);
    }
}
