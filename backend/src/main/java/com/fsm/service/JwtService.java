package com.fsm.service;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.KeyLengthException; // Import this
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final JWSSigner signer;

    public JwtService(@Value("${jwt.secret}") String secret) {
        try {
            // Create a pure Nimbus MAC Signer directly from your secret string
            this.signer = new MACSigner(secret.getBytes(StandardCharsets.UTF_8));
        } catch (KeyLengthException e) {
            // If the secret in application.properties is less than 32 characters, this will trigger
            throw new IllegalArgumentException("JWT secret must be at least 32 characters long!", e);
        }
    }

    public String generateToken(String email, String role) {
        try {
            // 1. Create the Header (Explicitly HS256)
            JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);

            // 2. Create the Claims
            long nowMillis = System.currentTimeMillis();
            Date now = new Date(nowMillis);
            Date expiry = new Date(nowMillis + 86400000L); // 24 hours

            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .issuer("FieldSync")
                    .issueTime(now)
                    .expirationTime(expiry)
                    .subject(email)
                    .claim("role", role)
                    .build();

            // 3. Create the Unsigned JWT
            SignedJWT signedJWT = new SignedJWT(header, claims);

            // 4. Sign the JWT with our HMAC signer
            signedJWT.sign(this.signer);

            // 5. Serialize to the compact format (eyJ...)
            return signedJWT.serialize();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate JWT", e);
        }
    }
}