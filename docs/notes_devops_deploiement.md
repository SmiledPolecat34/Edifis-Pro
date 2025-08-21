# Notes DevOps et Déploiement - Edifis Pro

## 1. Architecture de Déploiement

### 1.1 Vue d'Ensemble
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │    Backend      │     │   Base de       │
│   React/Vite    │────▶│  Node/Express   │────▶│   Données       │
│   (Port 5173)   │     │   (Port 5000)   │     │   MySQL 8.0     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                        │
         └───────────────────────┴────────────────────────┘
                              Docker Network
```

### 1.2 Stack Technique
- **Frontend** : React 18 + TypeScript + Vite
- **Backend** : Node.js 18/20 LTS + Express.js
- **Base de données** : MySQL 8.0 + Sequelize ORM
- **Conteneurisation** : Docker + Docker Compose
- **CI/CD** : GitHub Actions
- **Monitoring** : Winston Logs + Rotation

## 2. Configuration Docker

### 2.1 Dockerfile Backend
```dockerfile
FROM node:18-alpine

# Répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 5000

# Variables d'environnement par défaut
ENV NODE_ENV=production

# Commande de démarrage
CMD ["node", "server.js"]
```

### 2.2 Docker Compose
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./db/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./db/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql
    networks:
      - edifis-network

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      DB_HOST: mysql
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME}
      JWT_SECRET: ${JWT_SECRET}
      FRONTEND_URL: ${FRONTEND_URL}
    depends_on:
      - mysql
    networks:
      - edifis-network
    volumes:
      - ./backend/uploads:/app/uploads

  frontend:
    build: ./frontend/edifis-pro
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://backend:5000
    depends_on:
      - backend
    networks:
      - edifis-network

volumes:
  mysql_data:

networks:
  edifis-network:
    driver: bridge
```

## 3. Pipeline CI/CD

### 3.1 GitHub Actions Workflow
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        cache-dependency-path: backend/package-lock.json
    
    - name: Install dependencies
      run: npm ci
      working-directory: ./backend
    
    - name: Run tests
      run: npm test
      working-directory: ./backend
    
    - name: Security audit
      run: npm audit --audit-level=high
      working-directory: ./backend
    
    - name: Upload coverage
      uses: actions/upload-artifact@v3
      with:
        name: coverage-backend
        path: backend/coverage

  build-and-deploy:
    needs: test-backend
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Build Docker images
      run: docker-compose build
    
    - name: Deploy to production
      run: |
        echo "Déploiement en production..."
        # Commandes de déploiement spécifiques
```

### 3.2 Étapes du Pipeline
1. **Tests unitaires** : Jest avec couverture > 80%
2. **Audit sécurité** : npm audit niveau high
3. **Build** : Construction des images Docker
4. **Deploy** : Déploiement sur environnement cible

## 4. Variables d'Environnement

### 4.1 Backend (.env)
```bash
# Application
NODE_ENV=production
PORT=5000
LOG_LEVEL=info

# Base de données
DB_HOST=localhost
DB_PORT=3306
DB_USER=edifis_user
DB_PASSWORD=SecurePassword123!
DB_NAME=edifis_pro
DB_DIALECT=mysql

# Authentification
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=24h

# CORS
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,https://edifispro.com

# Sécurité
BCRYPT_ROUNDS=10
RESET_TOKEN_TTL_MINUTES=20
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email (Production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@edifispro.com
SMTP_PASS=smtp-password
EMAIL_FROM=Edifis Pro <noreply@edifispro.com>

# Uploads
UPLOAD_MAX_SIZE=5242880
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif
```

### 4.2 Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Edifis Pro
VITE_APP_VERSION=1.0.0
```

## 5. Sécurité en Production

### 5.1 Configuration Helmet
```javascript
// Production security headers
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));
}
```

### 5.2 CORS Production
```javascript
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGINS.split(',');
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

## 6. Logging et Monitoring

### 6.1 Configuration Winston
```javascript
const winston = require('winston');
require('winston-daily-rotate-file');

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/edifis-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info'
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    fileRotateTransport,
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

### 6.2 Métriques à Surveiller
- **Performance** : Temps de réponse API < 500ms
- **Disponibilité** : Uptime > 99%
- **Erreurs** : Taux d'erreur < 1%
- **Sécurité** : Tentatives de connexion échouées
- **Ressources** : CPU < 80%, RAM < 85%

## 7. Procédures de Déploiement

### 7.1 Déploiement Initial
```bash
# 1. Cloner le repository
git clone https://github.com/edifis-pro/edifis-pro.git
cd edifis-pro

# 2. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec les valeurs de production

# 3. Construire et lancer avec Docker
docker-compose up -d --build

# 4. Vérifier les logs
docker-compose logs -f

# 5. Initialiser la base de données
docker-compose exec backend npm run db:migrate
docker-compose exec backend npm run db:seed
```

### 7.2 Mise à Jour
```bash
# 1. Pull des dernières modifications
git pull origin main

# 2. Rebuild et redémarrage
docker-compose down
docker-compose up -d --build

# 3. Migrations si nécessaire
docker-compose exec backend npm run db:migrate
```

### 7.3 Rollback
```bash
# 1. Revenir à la version précédente
git checkout <previous-tag>

# 2. Rebuild avec l'ancienne version
docker-compose down
docker-compose up -d --build

# 3. Restaurer la base de données si nécessaire
docker-compose exec mysql mysql -u root -p < backup.sql
```

## 8. Sauvegarde et Restauration

### 8.1 Backup Automatique
```bash
#!/bin/bash
# backup.sh - À exécuter via cron quotidiennement

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/edifis-pro"

# Backup base de données
docker-compose exec mysql mysqldump -u root -p${DB_ROOT_PASSWORD} \
  ${DB_NAME} > ${BACKUP_DIR}/db_${DATE}.sql

# Backup uploads
tar -czf ${BACKUP_DIR}/uploads_${DATE}.tar.gz ./backend/uploads

# Rotation des backups (garder 30 jours)
find ${BACKUP_DIR} -name "*.sql" -mtime +30 -delete
find ${BACKUP_DIR} -name "*.tar.gz" -mtime +30 -delete
```

### 8.2 Restauration
```bash
# Restaurer la base de données
docker-compose exec mysql mysql -u root -p${DB_ROOT_PASSWORD} \
  ${DB_NAME} < /backups/db_20240115_120000.sql

# Restaurer les uploads
tar -xzf /backups/uploads_20240115_120000.tar.gz -C ./backend/
```

## 9. Monitoring et Alertes

### 9.1 Health Check Endpoint
```javascript
// backend/routes/health.js
router.get('/health', async (req, res) => {
  try {
    // Vérifier la connexion DB
    await sequelize.authenticate();
    
    res.json({
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

### 9.2 Alertes Recommandées
- CPU > 80% pendant 5 minutes
- RAM > 85% pendant 5 minutes
- Disque > 90% utilisé
- API indisponible > 1 minute
- Taux d'erreur > 5% sur 5 minutes
- Tentatives de connexion échouées > 10/minute

## 10. Optimisations Production

### 10.1 Performance
- Activer la compression gzip
- Mettre en cache les assets statiques
- Utiliser un CDN pour les images
- Optimiser les requêtes DB avec indexes

### 10.2 Sécurité
- Utiliser HTTPS uniquement
- Rotation des secrets tous les 90 jours
- Audit de sécurité mensuel
- Tests de pénétration trimestriels

### 10.3 Scalabilité
- Load balancer pour plusieurs instances
- Redis pour la gestion des sessions
- Queue pour les tâches asynchrones
- Monitoring avec Prometheus/Grafana

## 11. Checklist de Production

### Avant le Déploiement
- [ ] Variables d'environnement configurées
- [ ] Base de données initialisée
- [ ] Certificats SSL installés
- [ ] Backups configurés
- [ ] Monitoring actif
- [ ] Tests de charge passés

### Après le Déploiement
- [ ] Health check OK
- [ ] Logs sans erreurs critiques
- [ ] Performance conforme
- [ ] Alertes configurées
- [ ] Documentation à jour
- [ ] Équipe formée

---

*Documentation DevOps v1.0*  
*Dernière mise à jour : [Date]*  
*Maintenu par : Équipe DevOps Edifis Pro*
