# Questions de test — Chatbot Employé (RAG)

Ces questions sont destinées à tester le chatbot employé (`POST /api/chatbot/employe`) après avoir uploadé les 6 documents du dossier `assets/` via la page **Base documentaire**.

---

## 01 — Politique Générale des Congés
**Fichier :** `01_politique_generale_conges.pdf`

1. Combien de jours de congé est-ce que j'acquiers par mois ?
2. Combien de jours de congés annuels ai-je droit par an ?
3. À qui s'applique le règlement des congés ?
4. Combien de jours à l'avance dois-je poser ma demande de congé ?
5. Puis-je reporter mes congés non pris à l'année suivante ?
6. Quelle est la période de référence pour le calcul des congés ?
7. Un salarié embauché en juillet combien de jours de congés a-t-il ?

---

## 02 — Règlement des Congés Maladie
**Fichier :** `02_reglement_conge_maladie.pdf`

1. Quel est le délai pour informer mon employeur en cas d'arrêt maladie ?
2. Dans quel délai dois-je envoyer mon certificat médical ?
3. Combien de jours de congé maladie ai-je par an ?
4. Mon salaire est-il maintenu pendant un arrêt maladie ?
5. Que se passe-t-il si je dépasse 30 jours d'arrêt maladie ?
6. Qu'est-ce qu'un délai de carence ?
7. Combien d'arrêts distincts sur 12 mois déclenchent un entretien RH ?

---

## 03 — Congés Exceptionnels
**Fichier :** `03_conges_exceptionnels.pdf`

1. Combien de jours de congé ai-je droit pour mon mariage ?
2. Combien de jours en cas de décès de mon conjoint ?
3. Ai-je droit à un congé pour déménagement ?
4. Combien de jours de congé pour la naissance de mon enfant ?
5. Combien de jours en cas de décès d'un parent ?
6. Les congés exceptionnels sont-ils déduits de mon solde annuel ?
7. Quels justificatifs dois-je fournir pour un congé exceptionnel ?
8. Puis-je fractionner un congé exceptionnel ?

---

## 04 — Procédure de Demande de Congé
**Fichier :** `04_procedure_demande_conge.pdf`

1. Comment faire une demande de congé ?
2. Quel est le délai de réponse de mon responsable ?
3. Que se passe-t-il si mon responsable ne répond pas dans les délais ?
4. Quels sont les motifs de refus acceptables pour un congé ?
5. Combien de temps mes demandes de congés sont-elles archivées ?
6. Comment suis-je notifié de la décision sur ma demande ?
7. Que faire si ma demande de congé est refusée ?

---

## 05 — Soldes et Compteurs de Congés
**Fichier :** `05_soldes_compteurs_conges.pdf`

1. Comment est calculé mon solde de congés à l'embauche ?
2. Quand est-ce que mon solde de congés est mis à jour ?
3. Puis-je prendre des congés que je n'ai pas encore acquis ?
4. Que se passe-t-il si j'ai un solde négatif à la fin du contrat ?

6. Mon responsable peut-il voir mes soldes de congés ?
7. Les congés exceptionnels impactent-ils mon solde annuel ?

---

## 06 — Absences Non Justifiées et Sanctions
**Fichier :** `06_sanctions_absences_non_justifiees.pdf`

1. Qu'est-ce qu'une absence non justifiée ?
2. Que se passe-t-il le premier jour d'une absence non justifiée ?
3. Quelles sanctions risque-t-on pour une absence non justifiée ?
4. À partir de combien de jours d'absence non justifiée peut-on être licencié ?
5. Qu'est-ce qu'un abandon de poste ?
6. Comment contester une décision de refus de congé ?
7. Dans quel délai l'entreprise doit-elle répondre à une réclamation écrite ?

---

## Questions transversales (plusieurs documents)

1. Quelle est la différence entre un congé annuel, un congé maladie et un congé exceptionnel ?
2. Quels sont les différents types de congés disponibles dans l'entreprise ?
3. Combien de temps à l'avance dois-je prév5. Où puis-je consulter mon solde de congés ?enir en cas d'absence ?
4. Quels sont mes droits si ma demande de congé est refusée ?
5. Quelles sont les règles générales sur les congés dans l'entreprise ?

---

## Comment tester

1. Ouvrir la page **Base documentaire** (admin) et uploader les 6 PDFs
2. Attendre que le statut passe à **Indexé** (RAG traité)
3. Se connecter en tant qu'employé et ouvrir le **Chatbot**
4. Poser les questions ci-dessus et vérifier que les réponses proviennent bien des documents

> **Note :** Le chatbot employé utilise la RAG (Retrieval-Augmented Generation) — il cherche les passages pertinents dans les documents indexés avant de formuler la réponse. Les réponses peuvent varier légèrement à chaque appel.
