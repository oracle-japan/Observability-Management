package com.example.spring;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class ProductController {

    private final ProductDao productDao;

    public ProductController(ProductDao productDao) {
        this.productDao = productDao;
    }

    // list page
    @GetMapping("/")
    public String showProducts(Model model) {
        model.addAttribute("products", productDao.findAll());
        return "products";
    }

    // add form page
    @GetMapping("/products/new")
    public String newProductForm(Model model) {
        model.addAttribute("product", new Product());
        return "product-form";
    }

    // create
    @PostMapping("/products")
    public String createProduct(Product product) {
        productDao.insert(product);
        return "redirect:/";
    }
}

