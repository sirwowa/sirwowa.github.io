# Sideline · Deine Sportkarten

Persönliche, deutschsprachige Sammelkarten-App für NFL und NBA. Eigenständige Umsetzung für eine private Sammlung, ohne Verbindung zu LUDEX.

## Start

Node.js **24 oder neuer** ist erforderlich. Keine Datenbankinstallation nötig: SQLite ist in Node integriert. Es gibt keine Laufzeit-Paketabhängigkeiten und keinen Build-Schritt.

```sh
cd /workspace/sirwowa.github.io
npm ci --cache /tmp/sideline-npm-cache
npm start
```

Der Server lauscht standardmäßig nur auf `127.0.0.1`, Port `3000`. `npm run dev` startet ihn mit automatischem Neustart bei Codeänderungen. `HOST`, `PORT` und `DATA_DIR` sind optional konfigurierbar. Die existierenden `index.htm`- und `start*.json`-Dateien gehören zur bisherigen statischen Website; die neue App wird durch `server.mjs` aus `public/` ausgeliefert.

## Cardsight einrichten

Hinterlege `CARDSIGHT_API_KEY` sicher in den Umgebungseinstellungen oder als Server-Umgebungsvariable. Lokal kann eine **nicht versionierte** `.env` verwendet werden; `.env.example` dokumentiert die Variablen ohne Schlüsselwerte. Nach einer Konfigurationsänderung den Server neu starten. Schlüssel gehören nicht in Frontend-Code, Git, Screenshots oder Backups.

Der vom Nutzer bereitgestellte Testschlüssel wurde nur im laufenden Testprozess verwendet und nicht in Projektdateien gespeichert. Für neue Prozesse muss eine sichere Bindung eingerichtet sein. Einen in einem Chat geteilten Schlüssel vor dauerhafter Nutzung ersetzen.

Die API-Aufrufe finden ausschließlich auf dem Server statt:

- Erkennung: `POST https://api.cardsight.ai/v1/identify/card/football` bzw. `/basketball`, Bild als JPEG-, PNG- oder WebP-Binärdaten, Header `X-API-Key`.
- Katalogsuche: `GET /v1/catalog/search`, auf Sportart und Kartentreffer eingeschränkt.
- Vertragsgrundlage: [Cardsight-Dokumentation](https://cardsight.ai/documentation/api-reference) und [OpenAPI-Schema](https://api.cardsight.ai/documentation/json), geprüft am 27.10.2026.

In der Ansicht **Karte erfassen** NFL oder NBA wählen und **Kamera öffnen**. Die Live-Kamera benötigt HTTPS oder localhost und eine Browser-Freigabe. Karte gerade im Rahmen ausrichten; der Rahmen kann für Querformat-Karten gedreht werden. **Fotografieren & erkennen** schneidet exakt den Rahmenbereich aus und übermittelt nur diesen Zuschnitt an Cardsight. Alternativ ein Foto hochladen, mit Zoom und Horizontal-/Vertikal-Reglern zuschneiden und **Zuschnitt übernehmen & erkennen** drücken. Beide Aktionen können API-Kontingent verbrauchen. Während der Erkennung läuft eine Lichtlinie über das Bild; erkannte Karten erhalten eine Erfolgsanimation. Reduzierte Bewegung wird berücksichtigt.

**Sichere Treffer automatisch speichern** ist voreingestellt und kann abgeschaltet werden; die Einstellung bleibt auf dem jeweiligen Browser erhalten. Nur ein einzelner exakter Kartentreffer mit hoher Sicherheit und Spielername wird automatisch mit Zuschnitt gespeichert. Unsichere oder mehrere Treffer werden zur Prüfung angezeigt und können ausdrücklich gespeichert bzw. im Formular korrigiert werden. Sicherheit und reine Set-Zuordnungen werden angezeigt. Der Zuschnitt ist rahmenbasiert, keine automatische Perspektivkorrektur oder Freistellung an schrägen Kartenrändern. Deshalb die Karte genau und gerade im Rahmen ausrichten. Kameratracks werden nach der Aufnahme, beim Abbrechen und beim Verlassen der Ansicht beendet. Keine Treffer, Zeitüberschreitungen, ungültige Schlüssel und Anfragelimits werden als solche behandelt. Ein fehlender Schlüssel blockiert nur API-Funktionen; die manuelle Erfassung bleibt möglich.

Die Erkennung übernimmt verfügbare Spieler-, Set-, Saison-, Nummern-, Parallel- und Grading-Angaben. Ein erkanntes Set kann ohne Spieler zurückkommen. Parallels sind Vorschläge; die Angaben müssen geprüft werden. Teamdaten liefert der geprüfte Erkennungsvertrag nicht und sie können manuell ergänzt werden. Die App bewertet keinen Kartenzustand anhand eines Fotos. Kaufpreise und Marktwerte in EUR sind **manuelle Angaben**, keine aktuellen Marktpreise.

## Sammlung und Sicherung

- Karten mit Foto hinzufügen, bearbeiten und löschen; Anzahl, Zustand, Grading, Kaufpreis und eigenen Marktwert erfassen.
- Nach Spieler, Team, Set, Jahr und Kartennummer suchen; nach Sportart, Wert, Jahr und Favoriten filtern bzw. sortieren.
- Wunschliste getrennt verwalten; Wunschkarten können durch Ändern der Ablage in die Sammlung übernommen werden.
- SQLite-Datei: `data/collection.sqlite` (einschließlich temporärer WAL-Dateien während des Betriebs). Datenverzeichnis ist nicht in Git.
- Unter **Einstellungen** JSON-Backups inklusive Fotos herunterladen oder importieren. Import ergänzt fehlende IDs und überschreibt vorhandene Einträge nicht. Ein Import ist auf 1.000 Karten und 60 MB begrenzt; die gesamte Sammlung kann größer werden. Bei großen Sammlungen das Datenverzeichnis nach sauberem Serverstopp zusätzlich vollständig sichern.
- Maximal 5 MB je Foto. Erlaubt sind JPEG, PNG und WebP.

## Hosting

Diese Version ist eine **lokale Einzelbenutzer-App ohne Benutzeranmeldung**. Nicht ungeschützt im Internet veröffentlichen. Für Zugriff von mehreren Geräten braucht sie einen geschützten Node.js-Host mit HTTPS, Zugangsschutz und dauerhaftem Datenträger für `DATA_DIR`. Der Serverprozess und SQLite-Daten müssen beim Hosting erhalten bleiben.

GitHub Pages unterstützt nur statische Dateien und kann diesen Node.js-Server oder API-Schlüssel nicht ausführen. Ein Push in dieses Repository stellt die neue App daher nicht automatisch bereit. Eine öffentliche Bereitstellung wurde nicht durchgeführt.

## Prüfungen

```sh
npm test
npm run test:browser
```

Die zwölf Node-Tests prüfen echte HTTP-Aufrufe mit isolierten SQLite-Datenbanken, Persistenz, Validierung, atomare Backup-Importe, API-Verträge und Fehlerfälle. Die zehn Playwright-Prüfungen testen Desktop und Handy einschließlich CRUD, NFL-/NBA-Autovervollständigung, Kamera-Rahmen, Track-Freigabe, Scan-Animation, automatischer Speicherung und tatsächlichem Pixel-Zuschnitt ohne den Testhintergrund. Die Kamera wird dabei mit einem kontrollierten Browser-Kamerastream simuliert; eine echte Handykamera muss auf dem Zielgerät geprüft werden. API-Antworten werden in automatisierten Erkennungstests kontrolliert simuliert; diese Tests verbrauchen keine Cardsight-Anfragen.

Browser-Tests verwenden standardmäßig `/usr/bin/chromium`. Bei anderer Installation `CHROMIUM_PATH` auf die vorhandene Chromium-Datei setzen. Die Testdatenbanken liegen in temporären Verzeichnissen; deine echte Sammlung wird von den Tests nicht verändert.

Zusätzlich wurden während der Entwicklung echte Cardsight-Aufrufe geprüft: authentifizierter Health-Check, NFL-Katalogsuche über den App-Server und Erkennung des offiziellen Cardsight-Beispielfotos (Shohei Ohtani). Ein eigenes NFL-/NBA-Kartenfoto wurde noch nicht live geprüft.
