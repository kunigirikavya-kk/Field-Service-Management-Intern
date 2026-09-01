package com.fsm.config;

import com.nimbusds.jose.jwk.source.ImmutableSecret;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;


import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import java.nio.charset.StandardCharsets;
import java.util.List;

import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;

import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

@Configuration
public class JwtConfig {

    // =====================================================
    // SECRET KEY
    // =====================================================

    @Bean
    public SecretKey jwtSecretKey(
            @Value("${jwt.secret}") String secret
    ) {

        byte[] keyBytes =
                secret.getBytes(StandardCharsets.UTF_8);

        if (keyBytes.length < 32) {

            throw new IllegalArgumentException(
                    "JWT secret must be at least 32 characters long"
            );
        }

        return new SecretKeySpec(
                keyBytes,
                "HmacSHA256"
        );
    }

    // =====================================================
    // JWT ENCODER
    // =====================================================

    @Bean
    public JwtEncoder jwtEncoder(
            SecretKey jwtSecretKey
    ) {

        JWKSource<SecurityContext> jwkSource =
                new ImmutableSecret<>(jwtSecretKey);

        return new NimbusJwtEncoder(jwkSource);
    }

    // =====================================================
    // JWT DECODER
    // =====================================================

    @Bean
    public JwtDecoder jwtDecoder(
            SecretKey jwtSecretKey
    ) {

        NimbusJwtDecoder decoder =
                NimbusJwtDecoder
                        .withSecretKey(jwtSecretKey)
                        .macAlgorithm(
                                MacAlgorithm.HS256
                        )
                        .build();

        return decoder;
    }

    // =====================================================
    // JWT -> SPRING AUTHORITIES
    // =====================================================

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {

        JwtAuthenticationConverter converter =
                new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(
                this::extractAuthorities
        );

        return converter;
    }

    // =====================================================
    // ROLE EXTRACTION
    // =====================================================

    private Collection<GrantedAuthority> extractAuthorities(
        Jwt jwt
) {

    String role = jwt.getClaimAsString("role");

    if (
            role == null ||
            role.trim().isEmpty()
    ) {
        return List.of();
    }

    return List.of(
            new SimpleGrantedAuthority(
                    "ROLE_" + role.toUpperCase()
            )
    );
}
}