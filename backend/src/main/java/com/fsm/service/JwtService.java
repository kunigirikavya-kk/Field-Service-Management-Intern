package com.fsm.service;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final JWSSigner signer;
    private final long expirationMillis;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-minutes:120}") long expirationMinutes
    ) {
        if (secret == null || secret.length() < 32) {
            throw new IllegalArgumentException(
                    "JWT_SECRET must be at least 32 characters long"
            );
        }

        try {
            this.signer = new MACSigner(secret.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new IllegalArgumentException(
                    "Unable to initialize JWT signer",
                    e
            );
        }

        if (expirationMinutes <= 0) {
            throw new IllegalArgumentException(
                    "JWT_EXPIRATION_MINUTES must be greater than zero"
            );
        }

        this.expirationMillis = expirationMinutes * 60_000L;
    }

    public String generateToken(String email, String role) {
        try {
            Date now = new Date();
            Date expiry = new Date(now.getTime() + expirationMillis);

            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .issuer("FieldSync")
                    .issueTime(now)
                    .expirationTime(expiry)
                    .subject(email)
                    .claim("role", role)
                    .build();

            SignedJWT signedJWT = new SignedJWT(
                    new JWSHeader(JWSAlgorithm.HS256),
                    claims
            );

            signedJWT.sign(this.signer);
            return signedJWT.serialize();

        } catch (Exception e) {
            throw new IllegalStateException("Failed to generate JWT", e);
        }
    }
}
