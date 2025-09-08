FROM node:20-bookworm-slim AS build
WORKDIR /app

# Copie les fichiers de dépendances
COPY package*.json ./

# Installe avec npm
RUN npm install

# Copie le reste du code
COPY . .

# Build
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
