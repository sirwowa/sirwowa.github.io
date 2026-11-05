# Growing v8 – lokaler Prüfbericht

5. November 2026. Isolierte Testinstallation mit PHP 8.4.24/PDO_SQLite und Chromium/Playwright. Keine produktiven Daten oder Hosting-Einstellungen verändert.

Erfolgreich geprüft:

- Unangemeldete Aufrufe, Testkonten und noch nicht abgeschlossener Erstlogin werden für Adminfunktionen serverseitig abgewiesen. Fehlendes Sitzungstoken verhindert Zugriff. Datenbereiche nutzen feste SQL-Listen und gebundene Parameter.
- Kontodaten ändern, sperren und reaktivieren. Bestehende Serversitzungen werden ungültig. Eigener Adminzugang bleibt vor versehentlicher Sperrung oder Herabstufung geschützt. Weiterhin genau sechs reservierte Konten.
- Passwort-Reset mit zufälligem Übergangspasswort; Erstwechsel erzwungen. Wiederholte identische Reset-Anfrage ist idempotent. Testkonten sehen keine Adminschaltfläche. Bestehende Passwörter/Hashes werden nicht angezeigt.
- Tagebücher, Einträge, Kontoeinstellungen und Freigaben eines anderen Kontos bearbeiten. Versionskonflikt verhindert veraltetes Überschreiben. Identische Schreibwiederholungen erzeugen keine zweite Änderung. Ungültiges JSON, falsches Wurzelformat und ungültige Kalendertage werden abgelehnt.
- Archivieren und Wiederherstellen erhalten Kennungen und zugehörige Einträge/Freigaben. Ein absichtlich erzeugter Kennungskonflikt bei einer Wiederherstellung rollt die gesamte Wiederherstellung zurück; nach Behebung ist sie erneut möglich.
- JSON-Export enthält App-Daten und Korrespondenz, aber weder Authentifizierungstabellen, Passwortfelder/-Hashes noch das erzeugte Übergangspasswort. Adminaktionen erscheinen im Protokoll. Suche und Filter geprüft.
- Abgebrochene Speicherbestätigung und abgebrochene Navigation erhalten Formularentwürfe. Bei Versionskonflikt und ungültigem JSON bleiben Eingaben erhalten. Lokaler Entwurfsexport und Neuladen der Serverfassung funktionieren.
- Mobile Adminübersicht bei 320, 390, 768 und 1280 Pixeln ohne Dokumentüberbreite. Bedienung von Dateneditor, Papierkorb, Passwort-Reset und Export im Smartphone-Viewport getestet. Keine JavaScript-Laufzeitfehler in den geprüften Abläufen.
- Adminaktionen sind offline gesperrt und landen nicht in der Offline-Warteschlange. Logout entfernt die Adminansicht. Widerrufene Adminsitzung führt bei weiterem Zugriff zur Anmeldung zurück und entfernt die Adminansicht.
- Upgrade einer Kopie der bisherigen Datenbank erhält Konten, Passwort-Hashes, Tagebücher, Einträge, Einstellungen und eigene Datensätze unverändert und ergänzt die neuen Kontofelder.
- Regression v7: Logo/Begleiterteam, dreistufiges Tagebuch-Anlegen, Anfänger/Fortgeschritten/Experte, Erhalt ausgeblendeter Werte, gemeinsame Preise und isolierte Ausnahmen, Beobachtungsnotiz, persönliche Erinnerungen/Kalenderexport und Offline-Neustart mit Figuren funktionieren weiterhin.
- PHP- und geänderte JavaScript-Dateien ohne Syntaxfehler.

Grenzen: Kein Livezugriff auf ALL-INKL, kein Test auf echten iOS-/Android-Geräten, keine vollständige Sicherheitszertifizierung. Die normalen bestehenden Tagebuch-Schreibwege besitzen nicht automatisch die neuen Versionskontrollen des Admineditors. Der Datenexport ist kein vollständiges Server-Backup und hat keinen automatischen Wiederherstellungsimport. Bereits lokal gespeicherte Daten können durch Kontosperren nicht aus der Ferne gelöscht werden. Ursprüngliche Fachinhalte und Prognosen wurden nicht fachlich validiert oder erweitert. Kein Anspruch auf vollständige Fehlerfreiheit.
