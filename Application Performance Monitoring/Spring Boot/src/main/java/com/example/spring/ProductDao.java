package com.example.spring;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class ProductDao {
    private final JdbcTemplate jdbcTemplate;

    public ProductDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Product> findAll() {
        return jdbcTemplate.query(
            "SELECT id, name, price, description FROM product ORDER BY id",
            (rs, rowNum) -> {
                Product p = new Product();
                p.setId(rs.getLong("id"));
                p.setName(rs.getString("name"));
                p.setPrice(rs.getInt("price"));
                p.setDescription(rs.getString("description"));
                return p;
            }
        );
    }

    public void insert(Product p) {
        jdbcTemplate.update(
            "INSERT INTO product (name, price, description) VALUES (?, ?, ?)",
            p.getName(),
            p.getPrice(),
            p.getDescription()
        );
    }
}

