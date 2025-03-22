# Dependency-Auditing und Sicherheitsüberprüfung

Diese Dokumentation beschreibt, wie Sicherheitsüberprüfungen für Abhängigkeiten in der Shopping-List-App konfiguriert und verwendet werden.

## Übersicht

Moderne Webanwendungen nutzen zahlreiche externe Abhängigkeiten, die potenzielle Sicherheitsrisiken darstellen können. Die Shopping-List-App implementiert automatisierte Sicherheitsüberprüfungen, um diese Risiken zu minimieren.

## Automatisierte Checks

### npm audit

`npm audit` ist ein in npm integriertes Werkzeug, das Abhängigkeiten auf bekannte Sicherheitslücken überprüft. Es vergleicht die installierten Pakete mit der öffentlichen Sicherheitsdatenbank von npm.

#### Einrichtung

Die Sicherheitsüberprüfung ist auf mehreren Ebenen integriert:

1. **Manueller Check**:
   ```bash
   npm run audit:security
   ```

2. **Git Pre-Push Hook**:
   Vor jedem Push wird automatisch eine Sicherheitsüberprüfung durchgeführt.

3. **CI-Pipeline**:
   In der GitHub Actions CI-Pipeline ist ein Security-Audit-Schritt integriert.

#### Konfiguration

Die Sicherheitsüberprüfung ist mit folgenden Parametern konfiguriert:

- **Audit-Level**: `moderate`
  - Bedeutet, dass nur Schwachstellen mit moderatem oder höherem Schweregrad blockieren
  - Niedrige Schweregrade werden gemeldet, aber blockieren nicht den Workflow

#### Umgang mit Meldungen

Bei einer Sicherheitsmeldung sind folgende Maßnahmen zu ergreifen:

1. **Überprüfen der Meldung**:
   ```bash
   npm audit
   ```
   Dieser Befehl gibt detaillierte Informationen zu allen Sicherheitsproblemen aus.

2. **Beheben der Sicherheitslücken**:
   ```bash
   npm audit fix
   ```
   Führt ein automatisches Update der betroffenen Abhängigkeiten durch, sofern möglich.

3. **Manuelle Behebung**:
   Falls `npm audit fix` das Problem nicht lösen kann:
   - Aktualisieren Sie die direkten Abhängigkeiten manuell
   - Prüfen Sie, ob Abhängigkeiten mit bekannten Sicherheitslücken wirklich benötigt werden

4. **Überspringen in Ausnahmefällen**:
   In dringenden Fällen kann der Pre-Push-Hook überschrieben werden:
   ```bash
   git push --no-verify
   ```
   Dies sollte nur in Ausnahmefällen verwendet werden und die Sicherheitslücken sollten zeitnah behoben werden.

## Regelmäßige Überprüfungen

Zusätzlich zu den automatisierten Checks sollten regelmäßig (z.B. monatlich) folgende manuelle Überprüfungen durchgeführt werden:

1. **Vollständiger Audit**:
   ```bash
   npm audit --production
   ```
   Überprüft nur Produktionsabhängigkeiten, die in der tatsächlichen App verwendet werden.

2. **Überprüfung auf veraltete Abhängigkeiten**:
   ```bash
   npm outdated
   ```
   Zeigt an, welche Pakete aktualisiert werden können.

3. **Überprüfung der Lizenzen**:
   ```bash
   npx license-checker --summary
   ```
   Stellt sicher, dass alle verwendeten Pakete kompatible Lizenzen haben.

## Integration in den Entwicklungsprozess

Die Security-Checks sind in folgende Prozesse integriert:

1. **Lokale Entwicklung**: 
   - Vor jedem Push werden Sicherheitsprüfungen durchgeführt.
   - Entwickler erhalten sofort Feedback zu potenziellen Sicherheitsproblemen.

2. **Continuous Integration**:
   - Bei jedem Pull Request werden Sicherheitsprüfungen automatisch durchgeführt.
   - Sicherheitsprobleme werden früh im Entwicklungsprozess erkannt.

3. **Release-Prozess**:
   - Vor jedem Release muss ein vollständiger Sicherheitsaudit durchgeführt werden.
   - Keine bekannten kritischen oder hohen Sicherheitslücken dürfen in einer Release vorhanden sein.

## Zukünftige Erweiterungen

Für die Zukunft sind folgende Erweiterungen geplant:

1. **Snyk Integration**: Tiefergehende Sicherheitsanalyse
2. **Automatische Dependency-Updates**: Durch Dependabot oder ähnliche Tools
3. **Security-Header-Checks**: Überprüfung der HTTP-Sicherheitsheader
