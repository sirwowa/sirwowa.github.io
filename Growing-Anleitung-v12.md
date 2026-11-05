# Growing v12 – Updates im Browser und eigener Admin-Eingang

Stand: 5. November 2026. Die Änderung ist lokal geprüft; auf deinem ALL-INKL-Server wurde nichts installiert.

## Einmalige Einrichtung

Deine bisherige App besitzt noch keinen Installer. Deshalb ist **dieses eine Update noch per FTP erforderlich**. Zuerst den gesamten bisherigen App-Ordner extern sichern, einschließlich `data/` und eigener `config.php`. Dann die Dateien aus `growing/` übertragen, **bestehendes `data/` und eigene `config.php` behalten**. Den neuen Ordner `administrator/`, alle vier `update-*`-Dateien, `update-public.pem`, `release.json` und versteckte `.htaccess`-Dateien vollständig mit übertragen. Danach App online neu laden.

Bei späteren normalen Programmupdates: Administration → Updates → signierte ZIP hochladen → prüfen → installieren. Es sind keine FTP-Zugangsdaten in der App nötig.

Voraussetzungen: PHP 8+, PDO SQLite, PHP ZIP/ZipArchive, OpenSSL, aktivierte Apache-.htaccess-Regeln sowie ein für den PHP-Benutzer beschreibbarer App-Ordner. Der Installer zeigt die PHP-Fähigkeiten und Uploadgrenzen an. Ob dein ALL-INKL-Tarif das bereits unterstützt, ist noch nicht live geprüft. Falls ein Punkt fehlt, bei ALL-INKL klären; niemals pauschal Dateirechte auf 777 setzen. Eine fehlende PHP-Erweiterung kann die App selbst nicht installieren.

## Eigenständige Adresse für die Administration

Wenn die App unter `https://deine-domain.de/growing/` liegt, lautet der direkte Zugang:

`https://deine-domain.de/growing/administrator/`

Bei Installation im Domain-Hauptordner entsprechend `/administrator/`. Der Eingang hat eine eigene Admin-Anmeldung und öffnet direkt die Verwaltung. Er verwendet dieselben Konten und dieselbe Datenbank wie die App. Testkonten erhalten keinen Verwaltungszugriff. Über „App öffnen“ gelangst du wieder zur normalen App.

Es ist eine separate Eingangsseite mit gemeinsam genutztem Backend und Frontend-Modulen, kein zweites, technisch vollständig unabhängiges System. Der zusätzliche Wiederherstellungszugang unten funktioniert unabhängig vom App-JavaScript.

## Sichere Update-ZIPs

- Nur speziell erzeugte, digital signierte Growing-Update-Pakete werden angenommen. Die bisherigen passwortgeschützten Komplettpakete sind dafür ungeeignet.
- Upload maximal 20 MB, entpackt maximal 40 MB und 500 ZIP-Einträge. Niedrigere Hostinggrenzen gelten zusätzlich.
- Signatur, Dateiprüfsummen, Pfade, Schreibrechte und freier Speicher werden geprüft. Keine beliebige ZIP-Extraktion, keine Symlinks, keine doppelten Einträge und keine ZIP-Pfadtraversierung.
- Die Vorschau nennt Version und betroffene Dateianzahl. Sie verändert noch keine App-Dateien und gilt 30 Minuten für den Admin, der sie hochgeladen hat.
- Bei der Installation werden die bisherigen betroffenen Dateien und eine konsistente SQLite-Datenbankkopie gesichert. Konfiguration, eigene Daten, Passwörter und bestehende Einträge werden nicht aus dem ZIP ersetzt.
- Während des Dateiaustauschs werden API-Zugriffe kurz gesperrt. Bereits geöffnete App-Seiten nach dem Update vollständig neu laden.
- Ein Installationsjournal ermöglicht bei einem Abbruch die Rücknahme der Dateiaustausche vor dem nächsten API-Aufruf. Bei einem manuellen Zurückkehren werden ebenfalls die Programmdateien zurückgesetzt; die aktuelle Datenbank bleibt erhalten. So werden nachträglich erfasste Einträge nicht versehentlich gelöscht.
- Nur neuere Builds werden akzeptiert. Mehrfachklicks installieren dasselbe Paket nicht erneut. Der Updateweg unterstützt kompatible Dateiupdates im Formatschema 1, keine destruktiven Datenbankmigrationen oder Dateilöschungen.
- Der kleine Installer-Kern, der Signaturprüfschlüssel und der Wiederherstellungseingang bleiben stabil und werden nicht durch App-Update-ZIPs überschrieben. Eine spätere Änderung dieses Sicherheitskerns oder des Vertrauensschlüssels kann erneut einen gezielten FTP-Eingriff benötigen.

Die enthaltene separate Datei `Growing-Update-v12.0.1.zip` ist ein signiertes Testupdate mit demselben Funktionsumfang. Nach der einmaligen Einrichtung von v12.0 kannst du damit den neuen Ablauf ausprobieren; die Versionsanzeige steigt auf 12.0.1. Für künftige Änderungen wird jeweils eine neue signierte Update-ZIP erstellt. Die private Signierdatei ist nicht im öffentlichen Download enthalten.

## Wiederherstellung

In Administration → Updates kannst du zu den vorherigen Programmdateien zurückkehren. Außerdem gibt es:

`https://deine-domain.de/growing/update-recovery.php`

Diese kleine PHP-Seite benötigt kein App-JavaScript. Sie verlangt eine noch gültige Admin-Sitzung, das aktuelle Adminpasswort und eine Sicherheitsprüfung. Wenn Anmeldung, Hosting, Sicherungsdateien oder Installer selbst nicht erreichbar sind, bleibt die vorher angelegte externe FTP-Sicherung erforderlich. Diese Seite setzt kein vergessenes Passwort zurück.

Sicherungen und vorgemerkte ZIPs liegen in `data/updates/`. Der Bereich muss durch `.htaccess` vor HTTP-Zugriff geschützt sein. Datenbankkopien enthalten personenbezogene Daten und Passwort-Hashes; niemals öffentlich freigeben. Backups bleiben erhalten und belegen Speicher. Die Datenbankkopie wird nicht automatisch zurückgespielt. Eine vollständige manuelle Datenbankwiederherstellung muss vorher mit dem aktuellen Datenbestand abgeglichen werden.

## Eigene Begleiter per Quellcode

Administration → Begleiter → erstellen oder bearbeiten:

1. Namen und Gestaltung festlegen.
2. Optional eigenen **HTML-, CSS- und JavaScript-Code** in das Quellcodefeld einfügen, maximal 30000 Zeichen. Die Datei `Begleiter-Beispiel.html` enthält ein lauffähiges Beispiel.
3. „Quellcode-Vorschau“ ansehen. Die Vorschau führt keine App-Aktionen aus.
4. Die gewünschten App-Fähigkeiten aktivieren und speichern.
5. Im Begleiterteam das Profil öffnen und „Als meinen App-Begleiter wählen“ anklicken. Diese persönliche Auswahl wird mit deinen Kontoeinstellungen gespeichert. Der schwebende Helfer öffnet dann das ausgewählte Profil mitsamt eigener Animation.

Quellcode wird ausschließlich in einem isolierten iframe mit `sandbox="allow-scripts"` ausgeführt. Er erhält keine App-Daten, Sitzungscookies oder Zugriffsrechte auf die übergeordnete Seite. Externe Ressourcen, API-Aufrufe, Formulare und eingebettete weitere Frames werden per Sandbox/CSP beschränkt. Zugangs- oder Zahlungsdaten gehören nie in eine selbst gestaltete Figur. Der Code ist für andere angemeldete Nutzer sichtbar, wenn sie den veröffentlichten Begleiter öffnen; dort keine Geheimnisse hinterlegen.

Eine App-Aktion aus dem eigenen Code anfordern:

```html
<button onclick="GrowingCompanionAction('setup')">Tagebuch anlegen</button>
```

Zulässige Aktionen:

| Aktion | Funktion |
| --- | --- |
| `setup` | Tagebuch-Assistent |
| `observations` | Beobachtungsnotiz |
| `reminders` | Eigene Erinnerungen |
| `help` | App-Bedienhilfe |
| `costs` | Kostenübersicht |
| `library` | Obst-/Gemüsebibliothek |

Nur die beim Profil aktivierten Aktionen werden ausgeführt. Der Elternrahmen prüft Absenderfenster, isolierten Ursprung, eine zufällige Nachrichtenkennung und die freigegebenen Fähigkeiten. Damit entsteht keine freie Serverprogrammierung und kein KI-Modelltraining. PHP, Serverbefehle, externe Skriptimporte und direkter Datenbankzugriff sind über dieses Feld nicht verfügbar. Bilder können als Data-URL eingebettet, Figuren über CSS oder lokales Canvas gezeichnet werden. Neue Bilder/Animationen werden nicht automatisch aus dem Quellcode erzeugt.

## Phase und Animation einfach selbst anpassen

Grow öffnen → auf der Seite „Stand“ direkt unter der Pflanze **Phase anpassen**. Gewünschte Phase wählen und bei Bedarf den Regler von Anfang (0 %) bis Ende (100 %) dieser Phase verschieben. Die Vorschau zeigt die schematische Pflanze sofort; „Phase speichern“ übernimmt deine Wahl. Sie bleibt stehen, bis du sie änderst. Über „Wieder automatisch anzeigen“ gelangst du zur datumsbasierten Zeitschätzung zurück.

Die manuelle Anzeige gilt für die Hauptanimation, den Phasentext und die Miniatur in der Growübersicht. Sie verändert keine ursprünglichen Datumsangaben, historischen Kosten oder bestehenden Kalenderpläne. Prozentangaben beschreiben nur die von dir gewählte Position innerhalb der Phase, keine gemessene Gesundheit oder wissenschaftliche Reifeprognose. Bestehende Datumsprognosen können daher weiterhin andere Schätzwerte anzeigen. Eine tatsächliche Ernte bzw. ein geänderter Kalendertermin muss bei den zugehörigen Datumsangaben eingetragen werden.

Nur der Besitzer kann diese Korrektur vornehmen. Freigegebene Leser sehen sie. Die Änderung wird serverseitig als einzelne Statuskorrektur gespeichert, ohne den übrigen Growdatensatz zu ersetzen. Offline wird sie vorgemerkt und nach Rückkehr der Verbindung bei geöffneter App und gültiger Sitzung übertragen.
