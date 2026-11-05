# Growing v9 – lokaler Prüfbericht

5. November 2026. Separate Testinstallation mit PHP 8.4.24/PDO_SQLite und Chromium/Playwright. Keine Änderung an produktiven Daten oder Hosting-Einstellungen.

Erfolgreich geprüft:

- Bibliothek startet leer; zwölf feste Obst- und Gemüsearten. Nicht unterstützte Arten und zusätzliche, nicht vorgesehene Schreibfelder werden serverseitig zurückgewiesen. Kein Anschluss an den bisherigen Cannabis-Fragenhelfer.
- Ohne Anmeldung kein Zugriff auf die Bibliothek. Testkonten können keine Wissenseinträge verwalten. Fehlendes oder ungültiges Admin-Sitzungstoken blockiert die Verwaltungsfunktionen.
- Entwürfe bleiben für Testkonten unsichtbar. Veröffentlichung erfordert vollständige Fachfelder, Stichwörter, Quelle und ausdrückliche redaktionelle Bestätigung. Jede erneute Veröffentlichung benötigt die Bestätigung erneut. Archivieren nimmt einen Eintrag aus der aktuellen Online-Bibliothek; erneutes Veröffentlichen funktioniert.
- Quellenvalidierung verweigert JavaScript-URLs und URLs mit eingebetteten Zugangsdaten. Externe Links öffnen mit noopener/noreferrer. Eingegebene HTML-Fragmente werden als Text dargestellt und nicht ausgeführt.
- Wiederholung einer identischen Speicheranfrage ist idempotent. Veraltete Bearbeitungsstände werden mit Versionskonflikt abgelehnt; lokale Eingaben bleiben erhalten. Entwurfsexport und bewusstes Neuladen funktionieren.
- Stichwortsuche berücksichtigt nur die gewählte Obst-/Gemüseart. Groß-/Kleinschreibung, Akzente und Satzzeichen werden normalisiert. Keine passenden Einträge erzeugen eine eindeutige Leermeldung statt erfundener Antworten. Quellen und redaktionelles Prüfdatum sind sichtbar; Download-Stand mit ISO-Zeitzone korrekt dargestellt.
- Neue Verwaltung und öffentliche Bibliothek bei 320, 390, 768 und 1280 Pixeln ohne Dokumentüberbreite. Abgebrochene Speicherbestätigung und Validierungsfehler erhalten Eingaben. Keine JavaScript-Laufzeitfehler in den geprüften Abläufen.
- Vorbereitete veröffentlichte Bibliothek nach Offline-Neustart nutzbar. Admin-Speichern offline abgewiesen, keine Adminaktion in der Offline-Warteschlange, Entwurf bleibt erhalten.
- Admin-Datenexport enthält orchard_knowledge. Upgrade einer Kopie der v8-Datenbank erhält alle bestehenden Konten, Passwort-Hashes, Tagebücher, Einträge, Einstellungen, Freigaben, Nachrichten, Protokoll und Papierkorb unverändert; neue Bibliothek ist leer.
- Regression v8: Admin-Berechtigungen, Kontosperre/Reaktivierung, Sitzungswiderruf, Passwort-Reset mit Erstwechsel, Schutz des eigenen Adminzugangs, Datensatzbearbeitung, Freigaben, Konflikte, Archivierung/Wiederherstellung und Export ohne Authentifizierungsgeheimnisse bestanden.
- Regression v7: Begleiterteam und geführtes Tagebuch-Anlegen, drei Eingabestufen, Erhalt ausgeblendeter Angaben, gemeinsame Preisvorgaben und einzelne Ausnahmen, Beobachtungsnotizen, eigene Erinnerungen/Kalenderexport und Offline-Neustart bestanden.
- Syntaxprüfung der PHP-Dateien und geänderten JavaScript-Dateien bestanden.

Grenzen: Fachliche Richtigkeit selbst eingetragener Inhalte und verlinkter Quellen wird nicht automatisch geprüft. Keine automatische Diagnose, kein Sprachmodell, kein Training und keine Garantie für Suchtreffer. Offline-Geräte können ältere veröffentlichte Texte enthalten, bis sie wieder aktualisieren. Neue Bedienabläufe wurden nicht auf echten iOS-/Android-Geräten oder dem ALL-INKL-Hosting geprüft. Kein vollständiges Sicherheitszertifikat und keine Zusicherung vollständiger Fehlerfreiheit. Testinhalte und Testdatenbanken gehören nicht zum Auslieferungspaket.
