# Utilise une image Node.js légère
FROM node:20-bookworm-slim

# Crée un répertoire de travail
WORKDIR /app

# Copie les fichiers de dépendances en cache
COPY package*.json ./

# Installe les dépendances, ci car cela permet de ne pas les réinstaller à chaque fois
RUN npm ci

# Copie le reste des fichiers de l'application
COPY . .

# Expose le port 5000 pour permettre les connexions externes
EXPOSE 5000

# Démarre l'application
CMD ["npm", "start"]
