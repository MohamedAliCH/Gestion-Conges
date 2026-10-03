package com.backend.intraspace;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest
class IntraSpaceApplicationTests {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void testChangelog() {
        try {
            jdbcTemplate.execute("TRUNCATE TABLE conges, employes CASCADE;");
            System.out.println("--- DB TRUNCATED SUCCESSFULLY ---");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

