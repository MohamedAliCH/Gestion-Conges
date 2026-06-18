package com.backend.intraspace.security;

import com.backend.intraspace.entities.Employee;
import com.backend.intraspace.repositories.EmployesRepo;
import org.springframework.security.core.userdetails.User;
import com.backend.intraspace.entities.Employe;
import com.backend.intraspace.repositories.EmployeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final EmployeRepository employeRepository;




    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Employe employe=employeRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("utilisateur non trouvable"));

        return new org.springframework.security.core.userdetails.User(
                employe.getEmail(),
                employe.getPassword(),
                Collections.singletonList(
                        new SimpleGrantedAuthority(employe.getRole().name())
                )
        );

    }
}
