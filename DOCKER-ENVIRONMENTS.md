# Docker-Umgebungskonfigurationen für die Shopping-List-App

Dieses Dokument erklärt die verschiedenen Umgebungskonfigurationen für die Docker-Deployment der Shopping-List-App.

## Umgebungsdateien (.env)

### Verfügbare Umgebungskonfigurationen

- `.env.example`: Vorlage für eigene Umgebungsdateien
- `.env.development`: Entwicklungsumgebung (andere Ports und Namen zur Unterscheidung)
- `.env.production`: Produktionsumgebung (Standard-Setup)

### Verwendung

Um eine bestimmte Umgebungskonfiguration zu verwenden:

```bash
# Entwicklungsumgebung
cp .env.development .env
docker compose up -d --build

# Produktionsumgebung
cp .env.production .env
docker compose up -d --build
```

## Umgebungsvariablen

| Variable       | Beschreibung                                            | Standardwert             |
| -------------- | ------------------------------------------------------- | ------------------------ |
| CONTAINER_NAME | Name des Docker-Containers                              | shopping-list-app        |
| HOST_PORT      | Port auf dem Host-System                                | 3000                     |
| NODE_ENV       | Node.js-Umgebung                                        | production               |
| APP_ENV        | Anwendungsumgebung                                      | production               |
| NETWORK_NAME   | Name des Docker-Netzwerks                               | shopping-list-network    |
| DOMAIN         | Domain für Traefik (nur bei docker-compose.traefik.yml) | shoppinglist.example.com |
| CERT_RESOLVER  | Zertifikats-Resolver für Traefik                        | letsencrypt              |

## Verschiedene Compose-Datei-Optionen

### Basis-Konfiguration (docker-compose.yml)

Die Basiskonfiguration enthält:

- Build-Anweisungen
- Port-Mapping
- Netzwerk-Konfiguration
- Container-Gesundheitsprüfung

### Lokale Entwicklung (docker-compose.override.yml)

Diese Datei wird automatisch mit docker-compose.yml zusammengeführt, wenn sie vorhanden ist, und bietet:

- Volume-Mounts für schnelle Änderungen
- Entwicklungsspezifische Umgebungsvariablen

### Traefik-Integration (docker-compose.traefik.yml)

Für die Integration mit dem Traefik Reverse Proxy:

```bash
docker compose -f docker-compose.yml -f docker-compose.traefik.yml up -d
```

Diese Konfiguration fügt hinzu:

- Traefik-Labels für Routing
- TLS/SSL-Konfiguration
- Integration mit dem Traefik-Netzwerk

## Multi-Umgebungs-Deployment

### Mehrere Instanzen parallel

Um verschiedene Instanzen parallel zu betreiben:

```bash
# Entwicklungsinstanz
CONTAINER_NAME=shopping-list-dev HOST_PORT=3001 docker compose up -d

# Testinstanz
CONTAINER_NAME=shopping-list-test HOST_PORT=3002 docker compose up -d

# Produktionsinstanz
docker compose up -d
```

### Staging-Umgebung

Für eine Staging-Umgebung vor der Produktion:

```bash
cp .env.production .env
sed -i 's/shopping-list-app/shopping-list-staging/g' .env
sed -i 's/3000/3010/g' .env
docker compose up -d --build
```
