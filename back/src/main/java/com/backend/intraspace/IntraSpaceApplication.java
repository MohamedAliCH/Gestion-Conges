package com.backend.intraspace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class IntraSpaceApplication {

    public static void main(String[] args) {
        SpringApplication.run(IntraSpaceApplication.class, args);
    }

}
