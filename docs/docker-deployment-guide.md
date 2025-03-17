# Docker Deployment Guide für die Shopping-List-App

Dieses Dokument ist eine umfassende Anleitung zur Bereitstellung der Shopping-List-App mit Docker, sowohl für Entwicklungs- als auch für Produktionsumgebungen.

## Inhaltsverzeichnis

1. [Einrichtung](#einrichtung)
2. [Umgebungen starten](#umgebungen-starten)
   - [Produktionsumgebung](#produktionsumgebung)
   - [Entwicklungsumgebung](#entwicklungsumgebung)
   - [Beide Umgebungen parallel](#beide-umgebungen-parallel)
3. [Container-Management](#container-management)
4. [Integration mit Traefik](#integration-mit-traefik)
5. [Anpassung der Konfiguration](#anpassung-der-konfiguration)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)
8. [CI/CD Integration](#cicd-integration)

## Einrichtung

### Voraussetzungen

- Docker installiert (Version 19.03.0+)
- Docker Compose installiert (Version 1.27.0+)
- Git-Repository der Shopping-List-App

### Repository klonen (für Ersteinrichtung)

```bash
git clone https://[dein-repo-url]/shopping-list-app.git
cd shopping-list-app
```

### Docker-Dateien prüfen

Folgende Dateien sollten vorhanden sein:
- `Dockerfile` - Definition des Container-Images
- `docker-compose.yml` - Hauptkonfiguration
- `docker-compose.override.yml` - Entwicklungsspezifische Konfiguration
- `docker-compose.traefik.yml` - Konfiguration für Traefik-Integration
- `.env.production` - Produktions-Umgebungsvariablen
- `.env.development` - Entwicklungs-Umgebungsvariablen
- `.env.example` - Beispiel für eigene Konfigurationen

## Umgebungen starten

### Produktionsumgebung

```bash
# Produktionsumgebungs-Konfiguration aktivieren
cp .env.production .env

# Container bauen und starten
docker compose up -d --build
```

Die Produktionsumgebung ist dann verfügbar unter:
- http://localhost:3000 (oder der konfigurierte HOST_PORT)

### Entwicklungsumgebung

```bash
# Entwicklungsumgebungs-Konfiguration aktivieren
cp .env.development .env

# Container bauen und starten
docker compose up -d --build
```

Die Entwicklungsumgebung ist dann verfügbar unter:
- http://localhost:3001 (oder der konfigurierte HOST_PORT)

### Beide Umgebungen parallel

Um beide Umgebungen gleichzeitig zu betreiben, kannst du Umgebungsvariablen direkt übergeben:

```bash
# Produktionsumgebung (mit Standardwerten aus .env)
docker compose up -d --build

# Entwicklungsumgebung (mit überschriebenen Umgebungsvariablen)
CONTAINER_NAME=shopping-list-app-dev HOST_PORT=3001 NODE_ENV=development APP_ENV=development NETWORK_NAME=shopping-list-dev-network docker compose up -d --build
```

## Container-Management

### Logs anzeigen

```bash
# Logs der Produktionsumgebung
docker compose logs -f shopping-list-app

# Logs der Entwicklungsumgebung (mit angepasstem Containernamen)
docker logs shopping-list-app-dev -f
```

### Container stoppen

```bash
# Produktionsumgebung stoppen
docker compose down

# Entwicklungsumgebung stoppen (wenn sie mit Umgebungsvariablen gestartet wurde)
CONTAINER_NAME=shopping-list-app-dev HOST_PORT=3001 docker compose down
```

### Ressourcennutzung überwachen

```bash
docker stats shopping-list-app shopping-list-app-dev
```

### Update der Anwendung

```bash
# Neuestes Code-Update holen
git pull

# Container neu bauen und starten (für Produktion)
cp .env.production .env
docker compose down
docker compose up -d --build
```

## Integration mit Traefik

Für die Integration mit Traefik als Reverse Proxy:

```bash
# Stelle sicher, dass das Traefik-Netzwerk existiert
docker network create traefik-public || true

# Starte die App mit Traefik-Konfiguration
DOMAIN=shoppinglist.yourdomain.com docker compose -f docker-compose.yml -f docker-compose.traefik.yml up -d
```

### Anpassung der Traefik-Konfiguration

Die wichtigsten Umgebungsvariablen für Traefik:
- `DOMAIN` - Domainname für die App (z.B. shoppinglist.yourdomain.com)
- `CERT_RESOLVER` - Name des Zertifikatsresolvers in deiner Traefik-Konfiguration

## Anpassung der Konfiguration

### Eigene Umgebungsdatei erstellen

Kopiere `.env.example` und passe die Werte an:

```bash
cp .env.example .env.custom
# Bearbeite .env.custom nach Bedarf
```

### Verfügbare Umgebungsvariablen

| Variable | Beschreibung | Standardwert |
|----------|--------------|--------------|
| CONTAINER_NAME | Name des Docker-Containers | shopping-list-app |
| HOST_PORT | Port auf dem Host-System | 3000 |
| NODE_ENV | Node.js-Umgebung | production |
| APP_ENV | Anwendungsumgebung | production |
| NETWORK_NAME | Name des Docker-Netzwerks | shopping-list-network |
| DOMAIN | Domain für Traefik | shoppinglist.example.com |
| CERT_RESOLVER | Zertifikats-Resolver für Traefik | letsencrypt |

## Troubleshooting

### Container startet nicht

Prüfe die Logs:
```bash
docker compose logs
```

Häufige Probleme:
- Port bereits in Verwendung: Ändere den HOST_PORT in der .env-Datei
- Fehler beim Build: Probleme mit Abhängigkeiten oder unvollständiger Code

### App ist nicht erreichbar

1. Prüfe, ob der Container läuft:
   ```bash
   docker ps | grep shopping-list-app
   ```

2. Prüfe die Port-Bindung:
   ```bash
   docker port shopping-list-app
   ```

3. Prüfe die Health-Checks:
   ```bash
   docker inspect shopping-list-app | grep -A 10 Health
   ```

### Docker-Image neu bauen erzwingen

Um ein vollständig neues Image zu bauen (ohne Cache):
```bash
docker compose build --no-cache
docker compose up -d
```

## Best Practices

### Image-Tags für Versionen

Für wichtige Releases solltest du Tags verwenden:
```bash
docker tag shopping-list-app-shopping-list-app:latest shopping-list-app:v1.0.0
```

### Regelmäßige Updates

Halte das Base-Image aktuell:
```bash
# Hole das neueste Node.js-Image
docker pull node:20-alpine

# Baue dein Image neu
docker compose build --pull
docker compose up -d
```

### Daten-Persistenz

Die App verwendet Browser-LocalStorage, daher ist keine Container-Persistenz erforderlich. Für zukünftige Backend-Integration kann ein Volume hinzugefügt werden:

```yaml
volumes:
  - shopping-list-data:/app/data

volumes:
  shopping-list-data:
```

## CI/CD Integration

Für automatisierte Deployments kannst du einen einfachen Workflow einrichten:

1. Push in den Main-Branch
2. CI/CD-Pipeline baut das Docker-Image
3. Automatisches Deployment auf dem Server

### Beispiel für einen Deploy-Befehl

```bash
ssh user@server "cd /path/to/shopping-list-app && git pull && docker compose down && docker compose up -d --build"
```

Diese Anleitung sollte dir helfen, die Shopping-List-App effizient mit Docker zu deployen und zu verwalten.
