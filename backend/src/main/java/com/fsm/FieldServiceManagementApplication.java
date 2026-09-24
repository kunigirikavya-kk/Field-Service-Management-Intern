package com.fsm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FieldServiceManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(FieldServiceManagementApplication.class, args);
    }
}