package com.backend.intraspace.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    @Async("emailExecutor")
    public void sendTempPasswordEmail(String toEmail, String tempPassword) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject("Bienvenue chez IntraSpace - Vos identifiants de connexion");
            message.setText("Bonjour,\n\n"
                    + "Votre compte IntraSpace a été créé avec succès.\n"
                    + "Voici votre mot de passe temporaire pour vous connecter : " + tempPassword + "\n\n"
                    + "Veuillez vous connecter et modifier votre mot de passe dès votre première connexion.\n\n"
                    + "Cordialement,\n"
                    + "L'équipe IntraSpace");

            mailSender.send(message);
            log.info("Email avec mot de passe temporaire envoyé avec succès à : {}", toEmail);
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi de l'email à {}: {}", toEmail, e.getMessage(), e);
        }
    }
}
