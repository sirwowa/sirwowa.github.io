# growfor v12.3 – lokale Prüfung

Geprüft am 5. November 2026 in isolierten Testinstallationen. Keine Änderungen am Live-Server growfor.de.

Bestanden:

- Eigene Pflanzenarten über API und mobile Administration anlegen, umbenennen; Duplikate, Versionskonflikte und Testnutzer-Änderungen abweisen. Bestehende Artikel bleiben ihrer Art zugeordnet.
- Eigenen Wissenseintrag im Browser anlegen; Entwurf nur für Admin sichtbar, veröffentlichter Eintrag über die Bibliothek abrufbar.
- Drehbuchentwurf getrennt von Veröffentlichung speichern; JSON-Schema, fremde Felder, veraltete Versionen, Rollen und CSRF prüfen.
- Eigenes zweitseitiges Test-PDF hochladen, echte Canvas-Seiten zeichnen, Seiten wechseln und Original herunterladen. Unveröffentlichtes PDF für Testnutzer nicht abrufbar.
- PDF nach vollständigem Offline-Neuladen über zuvor vorbereiteten Service Worker anzeigen, einschließlich lokaler Standardschriften/Zeichentabellen.
- JSON-Datei importieren, Titel übernehmen, Kapitelvorschau im App-Design anzeigen und veröffentlichen.
- HTML-/CSS-/JavaScript-Vorschau ausführen; Zugriff auf das Eltern-DOM im Sandbox-Rahmen abgewiesen.
- Automatischen Begleiter ohne persönlichen Kalendertermin anzeigen; Gießeintrag erfassen und den zugehörigen Hinweis automatisch entfernen.
- Automatische Aufgabenübersicht als Hauptansicht der täglichen Hilfe; manuelle Termine nur optional eingeklappt.
- Erfahrungsstufen filtern Messhinweise; vorhandene Düngehistorie erzeugt bei erfüllten Bedingungen einen Prüfhinweis; abgeschlossene Phasen unterdrücken aktive Pflegehinweise.
- Darstellungen bei 320, 390, 768 und 1280 Pixeln ohne horizontalen Überlauf; keine unbehandelten JavaScriptfehler in den geprüften Browserabläufen.
- Dependency-Audit für die PDF-Build-Abhängigkeiten: keine gemeldeten Sicherheitslücken zum Prüfzeitpunkt. Dies ist keine Garantie gegen unbekannte Schwachstellen.

Verwendet: PDF.js 4.10.38, isolierter Browser-Quellcode, SQLite und PHP. PHP-/JavaScript-Syntax sowie die signierte Update-Struktur werden vor Veröffentlichung separat geprüft. PDF.js führt in dieser Einbettung weder PDF-JavaScript noch Formularaktionen aus; es werden nur Seiten und Text gerendert.

Grenzen: kein echter Feuchte-/Nährstoffsensor, keine sicheren Bedarfsaussagen und keine Push-Erinnerung bei geschlossener App. Bestehende Intervallschätzung wird als Tagebuchhinweis verwendet. Fachtexte und Quellen der Anwender werden nicht automatisch verifiziert. PDFs werden originalgetreu angezeigt, nicht automatisch perfekt in App-Kapitel umgewandelt. Hosting-Uploadgrenzen, sehr große/verschlüsselte PDFs und spezifische ältere Mobilbrowser können zusätzliche Einschränkungen verursachen. Kein Livesystemtest bei ALL-INKL.
