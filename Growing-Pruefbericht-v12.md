# Prüfbericht Growing v12

Lokal automatisiert am 5. November 2026 geprüft; kein Test auf dem ALL-INKL-Liveserver.

- Vollständiges signiertes Dateiupdate inklusive Vorschau, Installation und Versionswechsel ausgeführt.
- Bestehende Konfiguration, Konten/Passwort-Hashes und Tagebücher nach Installation byte-/datensatzgleich erhalten.
- SQLite-Sicherung aus laufender WAL-Datenbank erzeugt und enthaltene Kontodaten geprüft.
- Rückkehr zu den vorherigen Programmdateien ausgeführt; aktuelle Datenbank bleibt erhalten.
- Installationsabbruch durch hinterlegtes Journal und teilweise veränderte Datei simuliert; Wiederherstellung vor dem nächsten API-Aufruf ausgeführt.
- Manipulierte Nutzdatei, unsigned ZIP, gefährliche Pfade, doppelte ZIP-Einträge und Wiederholung/ältere Version abgewiesen.
- Fehlende Adminberechtigung und falsche/fehlende CSRF-Prüfung abgewiesen.
- Eigene Adresse `/administrator/`: Admin-Anmeldung landet direkt im CMS, Testkonto wird abgewiesen.
- Begleiterquellcode gespeichert, isoliert angezeigt, Vorschau löst keine App-Aktion aus.
- Zugriff auf das Eltern-DOM im Begleiterrahmen durch Sandbox blockiert. Freigegebener Aufruf öffnet den Tagebuch-Assistenten; nicht freigegebene Kostenaktion wird ignoriert.
- Persönliche Begleiterauswahl und schwebender Helfer geprüft.
- Updateoberfläche bei 320, 390, 768 und 1280 Pixeln ohne horizontalen Überlauf geprüft.
- PHP-/JavaScript-Syntax der geänderten Dateien geprüft.

Hostingvoraussetzungen und .htaccess-Schutz müssen auf ALL-INKL erfüllt sein; kein Apache-Livetest in dieser Umgebung. Die kleine PHP-Wiederherstellungsseite setzt eine gültige Admin-Sitzung voraus. Kein Ersatz für ein externes Backup bei beschädigtem Server/Dateirechten oder nicht mehr funktionierender Anmeldung. Sicherheitskern und Vertrauensschlüssel benötigen für Änderungen einen gesonderten Installationsweg.

Die optional mitgelieferte Android-GoPro-Brücke bleibt eine Testversion ohne Prüfung an deiner echten HERO8/Android-Hardware. Fachliche Inhalte wurden durch dieses Softwareupdate nicht neu verifiziert. Begleitercode trainiert kein KI-Modell.

Zusätzlich geprüft: vollständiger Upload/Prüfen/Installieren-Ablauf über die mobile Admin-Oberfläche und Versionsanzeige nach Neuladen; Rückkehr über die separate PHP-Wiederherstellungsseite; exklusive Updatesperre mit HTTP 503 für konkurrierende API-Anfragen; Schutz von Konfiguration, Datenpfaden und Vertrauensschlüssel auch gegenüber formal korrekt signierten, aber nicht erlaubten Zielpfaden.

Manuelle Anzeigephase: Auswahl von Phase und Fortschritt, Aktualisierung der Hauptanzeige, Erhalt der automatischen Datums- und Kostenberechnung, Offlineänderung mit anschließendem Neuladen, Synchronisierung und Rückkehr zur automatischen Anzeige geprüft. Mobile Verwaltungsliste auf eine vertikal scrollbar begrenzte Spalte korrigiert; automatische App-Tour im separaten Admin-Eingang unterdrückt.
