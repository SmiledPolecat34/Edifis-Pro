# Scripts cURL — Critical-path (API Sécurité/Auth)

Objectif: vérifier rapidement les parcours critiques (happy path + erreurs majeures) sans outillage lourd.

Prérequis
- API démarrée (ex: http://localhost:5000)
- Variables d&#39;env utiles:
  - JWT_SECRET, JWT_EXPIRES_IN
  - FRONTEND_URL / CORS_ORIGINS (selon votre config)
  - RESET_TOKEN_TTL_MINUTES (par défaut 20)
- Compte existant: remplacez email/mot de passe ci-dessous par des valeurs réelles de votre base.

Base
- Export d&#39;URL:
  - Windows PowerShell: `$env:BASE_URL = "http://localhost:5000"`
  - Bash: `export BASE_URL="http://localhost:5000"`

1) Login — Happy path et erreurs
- Succès:
  curl -X POST "%BASE_URL%/api/users/login" ^
    -H "Content-Type: application/json" ^
    -d "{\"email\":\"john@example.com\",\"password\":\"Sup3rPassword!\"}"

  Réponse attendue: 200, JSON avec { token }

- Mauvais mot de passe:
  curl -X POST "%BASE_URL%/api/users/login" ^
    -H "Content-Type: application/json" ^
    -d "{\"email\":\"john@example.com\",\"password\":\"wrong\"}"

  Réponse attendue: 401

- Utilisateur inconnu:
  curl -X POST "%BASE_URL%/api/users/login" ^
    -H "Content-Type: application/json" ^
    -d "{\"email\":\"nobody@example.com\",\"password\":\"whatever\"}"

  Réponse attendue: 401

2) Change password — JWT requis
- Remplacer %JWT% par le token renvoyé au login.

- Succès:
  curl -X POST "%BASE_URL%/api/users/change-password" ^
    -H "Content-Type: application/json" ^
    -H "Authorization: Bearer %JWT%" ^
    -d "{\"currentPassword\":\"AncienPwd@123\",\"newPassword\":\"N0uveauPwd!Fort\",\"confirmNewPassword\":\"N0uveauPwd!Fort\"}"

  Attendu: 200 { message }

- Policy non respectée (ex: trop court)
  curl -X POST "%BASE_URL%/api/users/change-password" ^
    -H "Content-Type: application/json" ^
    -H "Authorization: Bearer %JWT%" ^
    -d "{\"currentPassword\":\"any\",\"newPassword\":\"faible\",\"confirmNewPassword\":\"faible\"}"

  Attendu: 400 { message: "Erreur de validation" }

- Ancien mot de passe incorrect
  curl -X POST "%BASE_URL%/api/users/change-password" ^
    -H "Content-Type: application/json" ^
    -H "Authorization: Bearer %JWT%" ^
    -d "{\"currentPassword\":\"BAD\",\"newPassword\":\"Sup3rStrongPwd!\",\"confirmNewPassword\":\"Sup3rStrongPwd!\"}"

  Attendu: 400/401

- Token manquant
  curl -X POST "%BASE_URL%/api/users/change-password" ^
    -H "Content-Type: application/json" ^
    -d "{\"currentPassword\":\"any\",\"newPassword\":\"Sup3rStrongPwd!\",\"confirmNewPassword\":\"Sup3rStrongPwd!\"}"

  Attendu: 401

3) Forgot password — Réponse générique + Rate limit
- Happy path (email connu):
  curl -X POST "%BASE_URL%/api/auth/forgot-password" ^
    -H "Content-Type: application/json" ^
    -d "{\"email\":\"john@example.com\"}"

  Attendu: 200, envoi "email" (transport JSON en dev). La réponse reste générique (pas d&#39;énumération).

- Email inconnu:
  curl -X POST "%BASE_URL%/api/auth/forgot-password" ^
    -H "Content-Type: application/json" ^
    -d "{\"email\":\"nobody@example.com\"}"

  Attendu: 200 (générique), pas d&#39;envoi de mail.

- Rate limit (ex: spam sur la même IP/email): répéter plusieurs fois le même appel rapidement → 429

4) Reset password — Token à usage unique, TTL
- Récupération du token: en dev, inspecter les logs (email JSON dans la console) ou base (table password_reset_tokens, token_hash).
  Hypothèse dev: le contrôleur prend un `token` brut et calcule le hash côté serveur.

- Succès (token non expiré/non utilisé):
  curl -X POST "%BASE_URL%/api/auth/reset-password" ^
    -H "Content-Type: application/json" ^
    -d "{\"token\":\"%RAW_TOKEN%\",\"newPassword\":\"Sup3rStrongPwd!\",\"confirmNewPassword\":\"Sup3rStrongPwd!\"}"

  Attendu: 200/201 { message }, invalidation des autres tokens actifs.

- Token expiré:
  curl -X POST "%BASE_URL%/api/auth/reset-password" ^
    -H "Content-Type: application/json" ^
    -d "{\"token\":\"expired\",\"newPassword\":\"Sup3rStrongPwd!\",\"confirmNewPassword\":\"Sup3rStrongPwd!\"}"

  Attendu: 400

- Token déjà utilisé:
  curl -X POST "%BASE_URL%/api/auth/reset-password" ^
    -H "Content-Type: application/json" ^
    -d "{\"token\":\"used\",\"newPassword\":\"Sup3rStrongPwd!\",\"confirmNewPassword\":\"Sup3rStrongPwd!\"}"

  Attendu: 400

- Token invalide:
  curl -X POST "%BASE_URL%/api/auth/reset-password" ^
    -H "Content-Type: application/json" ^
    -d "{\"token\":\"invalid\",\"newPassword\":\"Sup3rStrongPwd!\",\"confirmNewPassword\":\"Sup3rStrongPwd!\"}"

  Attendu: 400

5) Sécurité — Headers Helmet (smoke)
- Examiner quelques en-têtes (prod/mock): strict-transport-security, x-content-type-options, referrer-policy, content-security-policy.
  curl -I "%BASE_URL%/"

6) CORS — Whitelist (smoke)
- Origin autorisée:
  curl -X OPTIONS "%BASE_URL%/api/users/login" ^
    -H "Origin: http://localhost:5173" ^
    -H "Access-Control-Request-Method: POST"

- Origin refusée:
  curl -X OPTIONS "%BASE_URL%/api/users/login" ^
    -H "Origin: http://evil.local" ^
    -H "Access-Control-Request-Method: POST"

Notes & Hypothèses
- En dev, l&#39;email part sur un transport JSON (aucun envoi réel).
- Les tokens reset sont hachés (SHA-256) en base; le `token` fourni par l&#39;utilisateur est en clair et comparé après hash serveur.
- Le payload JWT est homogène: { userId, role }.
- La policy mot de passe suit: min 12, 1 Maj, 1 min, 1 chiffre, 1 spécial.
