# Basis-Image mit Node.js LTS
FROM node:20-alpine as build-stage

# Arbeitsverzeichnis im Container
WORKDIR /app

# Optimierung: Nur package.json und package-lock.json kopieren für effizientes Caching
COPY package*.json ./

# Abhängigkeiten installieren
RUN npm ci

# Restliche Projektdateien kopieren
COPY . .

# Produktions-Build
RUN npm run build

# Zweites Stage für kleineres Image
FROM node:20-alpine as production-stage

# Arbeitsverzeichnis im Container
WORKDIR /app

# Nur die für die Produktion notwendigen Dateien kopieren
COPY --from=build-stage /app/.output ./.output
COPY --from=build-stage /app/package.json ./

# Exposition des Ports
EXPOSE 3000

# Umgebungsvariable für Produktionsumgebung
ENV NODE_ENV=production

# Befehl zum Starten des Servers
CMD ["node", ".output/server/index.mjs"]
