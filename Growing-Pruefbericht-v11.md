# Prüfbericht Growing v11

Lokal automatisiert geprüft am 5. November 2026; keine Prüfung des ALL-INKL-Livesystems.

- XLSX-Vorlage tatsächlich im Browser eingelesen, serverseitige Vorschau und Speichern ausgeführt.
- Einzelne Katalogsorte angelegt, Namen im Tagebuchassistenten vorgeschlagen.
- Begleiter erstellt und Kostenfunktion aus seiner Aktionsauswahl geöffnet.
- Layout ohne horizontalen Überlauf bei 320, 390, 768 und 1280 Pixeln geprüft.
- Testkonto für Admin-Katalogzugriff mit HTTP 403 abgewiesen.
- Veraltete Version HTTP 409; ungültige URL, negative Bestände, doppelte Zeilen und unbekannte Fähigkeiten HTTP 400.
- Importmodi Überspringen/Aktualisieren, identische Anfragewiederholung ohne Doppeländerung und CSRF-Abweisung geprüft.
- Excel-Formeln und übergroße entpackte Arbeitsmappe abgewiesen.
- PHP-/JavaScript-Syntaxprüfung der geänderten Dateien.

Bereits im selben Entwicklungsstand separat geprüft: zentrale Darstellungseinstellungen einschließlich Konfliktbehandlung; Gerätecode mit Upload-Beschränkung, Ablauf, Widerruf und Kontosperrung; Zeitraffer-Browseraufnahme, Videodatei und Offline-Synchronisierung. Native Bridge: 7 JVM-Tests ohne Fehler, Android-Lint ohne Fehler und mit 10 Warnungen; Release-APK signiert. Keine reale HERO8-/Android-Geräteprüfung, keine Garantie für Übertragung während laufender GoPro-Aufnahme.

Fachliche Inhalte des bisherigen Sortenbestands wurden durch diese Softwareprüfung nicht neu wissenschaftlich geprüft. Der neue Katalog ist eine Verwaltungsdatenbank; der Editor trainiert kein KI-Modell. Keine neue Live-Datenquelle oder Preisabfrage hinzugefügt.
