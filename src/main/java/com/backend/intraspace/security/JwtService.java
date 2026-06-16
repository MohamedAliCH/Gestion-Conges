package com.backend.intraspace.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;

import java.util.Date;

@Service
public class JwtService {
    private static final String SECRET_KEY = "uneCleSuperLongueEtSecreteDauMoins256BitsEnBase64icicicicici";

    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .claim("role",userDetails.getAuthorities())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis()+1000*60*60))
                .signWith(getSigningKey())
                .compact();
    }

    public SecretKey getSigningKey(){
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);

    }

    public String extractEmailFromToken(String token){
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    private boolean isTokenExpired(String token){
        Date expiration = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getExpiration();
        return expiration.before(new Date());
    }

    public boolean isTokenValid(String token, UserDetails userDetails){
        String email = extractEmailFromToken(token);
        return email.equals(userDetails.getUsername())&&!isTokenExpired(token);
    }
}
