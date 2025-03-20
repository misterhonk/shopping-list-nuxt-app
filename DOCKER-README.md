# Docker-Setup für die Shopping-List-App

Diese Dokumentation beschreibt, wie die Shopping-List-App mit Docker auf einem Server bereitgestellt werden kann.

## Voraussetzungen

- Docker installiert (Version 19.03.0 oder höher)
- Docker Compose installiert (Version 1.27.0 oder höher)

## Deployment-Anleitung

### 1. Erstes Deployment

Um die Anwendung zum ersten Mal zu deployen:

```bash
# Im Projektverzeichnis
docker-compose up -d --build
```

Dies wird:

- Das Docker-Image bauen
- Den Container im detached-Modus starten (läuft im Hintergrund)
- Den Container auf Port 3000 verfügbar machen

### 2. App aktualisieren

Wenn du Änderungen an der Anwendung vornimmst:

```bash
# Im Projektverzeichnis
git pull  # Neue Änderungen holen, falls vorhanden
docker-compose down
docker-compose up -d --build
```

### 3. Logs anzeigen

Um die Container-Logs anzusehen:

```bash
docker-compose logs -f shopping-list-app
```

Mit der Option `-f` wird der Log-Stream verfolgt (ähnlich wie bei `tail -f`).

### 4. Container stoppen

Um den Container zu stoppen:

```bash
docker-compose down
```

## Wichtige Hinweise

### Persistenz der Daten

Diese App speichert Daten im LocalStorage des Browsers des Nutzers. Das bedeutet:

- Die Daten werden auf dem Endgerät des Nutzers gespeichert, nicht auf dem Server
- Es ist keine separate Datenbank erforderlich
- Nutzer können ihre Daten nicht zwischen verschiedenen Geräten synchronisieren, es sei denn, die Backend-Integration (siehe Roadmap) wird implementiert

### Sicherheit

- Der Container läuft als nicht-privilegierter Benutzer
- HTTP-Verkehr sollte über einen reverse proxy (z.B. Nginx, Traefik) geleitet werden, der HTTPS bereitstellt

## Reverse-Proxy-Konfiguration (Empfohlen)

Für den produktiven Einsatz wird empfohlen, einen Reverse-Proxy wie Nginx oder Traefik vor der Anwendung zu betreiben. Das bietet mehrere Vorteile:

- SSL/TLS-Verschlüsselung (HTTPS)
- Besseres Cache-Verhalten
- Erleichterte Verwaltung mehrerer Dienste auf einem Server

### Beispiel für eine Traefik-Konfiguration

Eine einfache `docker-compose.override.yml` für Traefik könnte so aussehen:

```yaml
version: '3.8'

services:
  shopping-list-app:
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.shopping-list.rule=Host(`einkaufsliste.beispiel.de`)'
      - 'traefik.http.routers.shopping-list.entrypoints=websecure'
      - 'traefik.http.routers.shopping-list.tls.certresolver=myresolver'
      - 'traefik.http.services.shopping-list.loadbalancer.server.port=3000'
    networks:
      - traefik-public
      - shopping-list-network

networks:
  traefik-public:
    external: true
```

Dabei wird davon ausgegangen, dass Traefik bereits auf deinem Server eingerichtet ist.
