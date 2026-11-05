# Growing – lokaler Prüfbericht, 5. November 2026

Geprüft wurde eine getrennte Kopie von v6, anschließend die korrigierte v7. Isolierte SQLite-Datenbanken, keine Änderung am produktiven Hosting. PHP 8.4 mit PDO_SQLite, Chromium/Playwright. Prüfung technischer Funktion, Bedienung und allgemeiner Kostenrechnung. Cannabis-Fachinhalte, Sortenwerte, Ertragsprognosen, Gieß-/Düngeempfehlungen und Diagnoseaussagen der ursprünglichen App wurden nicht validiert oder erweitert.

## Reproduzierte und korrigierte Fehler

1. Ungültige Kosteneingaben löschten den Entwurf: Fehlermeldungen erhalten jetzt Eingaben; korrigiertes Formular lässt sich speichern.
2. Menüwechsel verwarfen ungespeicherte Formulare: Bestätigung vor Navigation, Zurück und Wischen; Abbrechen erhält den Entwurf.
3. Zurückgeänderte Formularwerte galten weiter als ungespeichert: Vergleich mit den Ausgangswerten statt dauerhaftem „dirty“-Schalter.
4. Als Zeichenketten gespeicherte Centbeträge verfälschten Summen: validierte numerische Übernahme und exakte Summierung.
5. Ungültige gespeicherte Belegdaten konnten die Ansicht abbrechen: ungültige Zeilen bleiben erhalten, werden markiert und aus der Summe ausgeschlossen; Rohdatenexport vorhanden.
6. Unvollständige Offline-Vorbereitung konnte Erfolg melden: aktivierten Service Worker, vollständigen Cache und frisch geladene kontoeigene Daten prüfen. Fehlerfall mit absichtlich nicht erreichbarer Bilddatei und anschließender erfolgreicher Wiederholung getestet.
7. Gleichzeitige Einstellungsänderungen zweier Geräte überschrieben sich: atomarer Versionsvergleich auf dem Server; veraltete lokale Fassung bleibt zur Prüfung erhalten. Download beider Fassungen und ausdrücklich bestätigte Übernahme getestet.
8. Erfolgshinweise fehlten in der geöffneten Tagebuchansicht: Statusmeldung ergänzt.

## Erfolgreiche Prüfungen

- Fehlerhafte Betragseingabe, erhaltener Entwurf, anschließende Korrektur und Speicherung.
- Menü-Abbruch, bestätigter Wechsel und zurückgeänderte Formulare.
- Währungsberechnung: 40 Fälle gegen unabhängig mit Python Decimal berechnete Referenzen; Dezimalkomma, halbe Centbeträge, Strom, Wasser und anteiliger Einkauf. Negative, leere und mehrdeutige Zahlen zurückgewiesen.
- Unveränderlichkeit bestehender Belegbeträge nach Preisänderung, Bearbeitung und Zuordnungsfilter.
- Zwei getrennte Browserkontexte mit gleichem Konto, Konflikterhaltung, Abbruch/Bestätigung der Übernahme; aufeinanderfolgende Offline-Änderungen und Wiederholung nach verlorener Serverantwort ohne doppelte Schreibvorgänge.
- Ohne Anmeldung kein Zugriff; Test2 darf Test1-Unterhaltung nicht lesen; nur Admin darf antworten; Kontozuordnung und wiederholte Nachrichten geprüft; automatische Dankesnachricht vorhanden.
- Sour: vollständiges Anlegen eines Tagebuchs durch drei Formularschritte. Flora: Beobachtungsnotiz serverseitig nachgelesen. Luna: selbst festgelegter Termin, Fälligkeit, Kalenderdownload und Erledigen.
- Anfänger/Fortgeschritten/Experte: korrekte sichtbare Eingaben; gespeicherte Werte bleiben beim Wechsel auf Anfänger erhalten.
- Gemeinsame Preise, isolierte Ausnahme eines Tagebuchs, Vererbung in anderen Tagebüchern und Zurücksetzen der Ausnahme.
- Team und Kostenansicht zwischen 320 und 1280 Pixeln ohne Überbreite des Dokuments. Neue Figuren nach Offline-Neustart verfügbar. Keine JavaScript-Laufzeitfehler in den geprüften Abläufen. Syntaxprüfung der PHP- und geänderten JavaScript-Dateien.

## Grenzen und offene Live-Prüfungen

- Keine produktive URL bereitgestellt: echtes ALL-INKL-Hosting, Apache-Schutz, HTTPS, iOS-/Android-Installation, echte Touchgesten und Kalenderalarme auf Geräten noch offen.
- Erinnerungen sind sichtbare Hinweise in der geöffneten App. Externe Kalenderalarme hängen vom Import und den Geräteeinstellungen ab. Keine Hintergrund-Push-Zustellung.
- Offline-Speicherung hängt vom Browserspeicher ab; Geräteverlust oder das Löschen der Browserdaten kann noch nicht übertragene Änderungen verlieren lassen. Neue Tagebücher benötigen eine Verbindung.
- Konfliktübernahme ersetzt alle Einstellungen der gewählten lokalen Fassung, auch Inventar, Figuren und Belege. Vorher beide Versionen sichern und prüfen; keine automatische Zusammenführung.
- Vereinbarte schwache Startpasswörter bleiben für noch nicht eingerichtete Konten bestehen. Der erzwungene Erstwechsel ersetzt nicht die zeitnahe Einrichtung dieser Konten.
- Dies ist ein lokaler Funktionstest, keine vollständige Sicherheitszertifizierung und keine Zusicherung von Fehlerfreiheit.
