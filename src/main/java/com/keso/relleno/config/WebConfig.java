package com.keso.relleno.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

//Este archivo Hace que Spring sirva esa carpeta en /uploads/**

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String ruta = Paths.get("uploads").toAbsolutePath().toUri().toString();
        if (!ruta.endsWith("/")) ruta += "/";
        registry.addResourceHandler("/uploads/**").addResourceLocations(ruta);
    }
}
