package com.backend.intraspace.security;

import com.backend.intraspace.entities.Employee;
import com.backend.intraspace.repositories.EmployesRepo;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final EmployesRepo employesRepo;

    public CustomUserDetailsService(EmployesRepo employesRepo) {
        this.employesRepo = employesRepo;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Employee emp = employesRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé : " + email));
        return User.builder()
                .username(emp.getEmail())
                .password(emp.getMotDePasse())
                .roles(emp.getRole().name())
                .build();
    }
}
