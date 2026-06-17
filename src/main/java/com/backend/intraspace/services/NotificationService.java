package com.backend.intraspace.services;

import com.backend.intraspace.entities.Employee;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final JavaMailSender mailSender;

    public NotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void envoyerIdentifiants(Employee emp, String motDePasseTemp) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(emp.getEmail());
            msg.setSubject("Bienvenue sur le portail RH — Vos identifiants");
            msg.setText(
                    "Bonjour " + emp.getPrenom() + " " + emp.getNom() + ",\n\n" +
                    "Votre compte a été créé.\n" +
                    "Email        : " + emp.getEmail() + "\n" +
                    "Mot de passe : " + motDePasseTemp + "\n\n" +
                    "Veuillez le changer à votre première connexion.\n"
            );
            mailSender.send(msg);
        } catch (Exception e) {
            System.err.println("⚠️ Erreur envoi email : " + e.getMessage());
        }
    }
}
