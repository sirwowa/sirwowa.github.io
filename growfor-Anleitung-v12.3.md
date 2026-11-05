# growfor v12.3

Enthält alle Funktionen aus v12.2 einschließlich noreply@growfor.de und drei neue Bereiche.

## Installation

Mit vorhandenem v12-Installer: growfor-Update-v12.3.zip unter Administration → Updates hochladen, prüfen und installieren. Die signierte Update-ZIP braucht kein Passwort. Bei FTP-Installation den Inhalt von growing/ übertragen. Vorher sichern, vorhandenes data/ und eigene config.php behalten. Es werden keine Benutzer oder Passwörter zurückgesetzt.

## Automatischer Alltagsbegleiter

Der tägliche Begleiter erscheint beim Öffnen und während der Nutzung von selbst, wenn aus den vorhandenen Tagebuchdaten ein Hinweis entsteht. Einzelne Kalendertermine sind dafür nicht mehr nötig. Bei geöffneter App werden Hinweise minütlich neu bewertet; nach Rückkehr zur App bzw. im Vordergrund werden vorhandene Zusammenfassungen gelegentlich aktualisiert.

- Wasserhinweise verwenden die vorhandene zeitbasierte Intervallschätzung der App und das Datum des letzten Gießeintrags. Die Meldung fordert zur Prüfung auf, sie misst keine Feuchtigkeit. Nach einem Gießeintrag verschwindet sie; bei Offline-Einträgen wird die lokale Warteschlange berücksichtigt.
- Ein Düngehinweis erscheint nur, wenn bereits eine Düngehistorie existiert, deren letzter Eintrag mindestens sieben Tage zurückliegt, danach mindestens zwei Gießeinträge vorliegen und die ausgewählte Phase geeignet ist. Er erinnert daran, den eigenen Produktplan und Zustand zu prüfen, ohne Dosierungsvorgabe oder Behauptung eines sicheren Bedarfs.
- Ab Fortgeschritten werden fehlende bzw. mindestens zwei Tage alte Messwerteinträge als Dokumentationshinweis berücksichtigt. Anfänger erhalten diese zusätzlichen Messhinweise nicht.
- Fehlendes Startdatum wird als fehlende Grundlage gemeldet; zukünftige Starts, abgeschlossene/ausdrücklich geerntete und nur freigegebene fremde Grows bekommen keine aktiven Pflegehinweise.
- Die manuell gewählte Anzeigephase wird berücksichtigt. Es entstehen keine zusätzlichen Datenfelder, die für Erinnerungen ausgefüllt werden müssen.

Der Helfer zeigt den Grow und den Grund des Hinweises. „Gießen eintragen“, „Düngen eintragen“ usw. öffnen die vorhandene Eingabe; das bloße Anklicken protokolliert noch keine ausgeführte Pflegehandlung. Schließen pausiert die automatische Einblendung für zwei Stunden auf diesem Gerät. Die Aufgabenübersicht beim Alltagsbegleiter bleibt verfügbar. Persönliche Kalendereinträge existieren nur noch als freiwilliger Zusatz in einem eingeklappten Abschnitt.

Pop-ups stehlen keinen Eingabefokus und werden während Formularbearbeitung, offener Eingabemaske, Kameraaufnahme oder Administration zurückgehalten. Die Browser-Pause ist keine globale Erinnerungseinstellung und keine plattformübergreifende Aufgabe. Ohne Internet wird der zuletzt gespeicherte Datenstand verwendet. Es handelt sich um Hinweise innerhalb der geöffneten App, **nicht um Push-Benachrichtigungen bei geschlossener App**. Ohne Sensoren kann die App tatsächliche Trockenheit oder Nährstoffmängel nicht feststellen.

## Eigene Pflanzenarten und Wissenseinträge

Administration → Obst- & Gemüsewissen → Eigene Pflanzenarten. Dort bis zu 100 eigene Arten anlegen und eigene Namen bearbeiten. Grundarten bleiben erhalten; bestehende Wissenseinträge behalten beim Umbenennen ihre Zuordnung. Doppelte ASCII-Schreibweisen werden unabhängig von Groß-/Kleinschreibung abgewiesen; bei Umlauten Schreibvarianten bitte selbst vereinheitlichen.

„Neuen Eintrag anlegen“ öffnet einen Entwurf für die ausgewählte Art. Symptome, Ursachen, eigene Hinweise, Stichwörter und Quellen eintragen. Entwürfe sehen nur Admins. Zur Veröffentlichung bleiben die bestehenden Prüf- und Quellenfelder erforderlich. Eigene Texte werden nicht automatisch fachlich überprüft. In der normalen Bibliothek gibt es für Admins zusätzlich „Eigenen Eintrag anlegen“ direkt bei der ausgewählten Art. Veröffentlichte Arten/Einträge sind nach einmaligem Laden offline verfügbar.

## Drehbuch gestalten

Administration → Drehbuch gestalten. Eine aktive Darstellung für alle angemeldeten Nutzer wählen:

1. **Bisheriges Drehbuch:** ursprüngliche Fassung unverändert anzeigen.
2. **PDF:** Datei prüfen und hochladen, als Original-PDF mit Seitenwahl und Download anzeigen.
3. **JSON:** Datei importieren oder JSON in das Feld einfügen; Kapitel werden als Karten im App-Design dargestellt.
4. **Quellcode:** HTML, CSS und JavaScript einfügen und isoliert anzeigen.

Die Vorschau zeigt den noch nicht veröffentlichten Entwurf. „Entwurf speichern“ verändert die öffentliche Fassung nicht. Erst „Veröffentlichen“ ersetzt die sichtbare Fassung. Über „Bisheriges Drehbuch“ kann sie wieder umgestellt werden. Gleichzeitige Änderungen werden mit Versionskonflikt abgewiesen; lokale Eingaben bleiben bei einem Fehler erhalten. „Entwurf sichern“ lädt die aktuellen strukturierten Daten als JSON herunter, kein vollständiges Datenbankbackup.

### PDF

Bis zu 10 MB und 200 Seiten pro PDF; niedrigere PHP-Uploadgrenzen gelten zusätzlich und werden angezeigt. PDF.js 4.10.38 rendert jeweils eine Seite; Standardschriften und Zeichentabellen sind für den Offlinebetrieb mitgeliefert. Links, PDF-JavaScript oder Formularaktionen werden nicht ausgeführt. Sehr große Seitenbilder sind zum Schutz des Arbeitsspeichers begrenzt. Das Original-PDF bleibt herunterladbar.

**Ein PDF wird nicht automatisch in sauber gegliederte App-Kapitel oder ein anderes Layout umgewandelt.** Seiten behalten ihre ursprüngliche Gestaltung. Für ein vollständig zum App-Design passendes Kapitelbuch ist JSON geeignet. Passwortgeschützte oder beschädigte PDFs werden nicht als bearbeitbare Kapitel importiert.

PDFs werden als private Datenbankinhalte gespeichert, nicht unter öffentlichen Datei-URLs. Testnutzer können nur das aktuell veröffentlichte PDF abrufen; Admins können auch unveröffentlichte PDFs prüfen. Speicherlimit: 20 PDFs / insgesamt 100 MB. „Nicht verwendete PDFs entfernen“ löscht nach Bestätigung PDFs ohne Bezug zum gespeicherten Entwurf und zur veröffentlichten Fassung. Ungespeicherte Auswahl vorher sichern.

Das aktive PDF einmal online öffnen oder „Offline vorbereiten“ verwenden. Danach sind die veröffentlichte Fassung und der PDF-Renderer offline nutzbar. Bereits geladene Offlinekopien können nicht aus der Ferne zurückgerufen werden.

### JSON

Die Datei Drehbuch-Vorlage.json liegt bei und lässt sich im Editor herunterladen:

```json
{"format":"growfor-handbook-v1","title":"Mein Drehbuch","chapters":[{"title":"Erstes Kapitel","text":"Mein eigener Inhalt.","steps":["Erster eigener Punkt."]}]}
```

1–50 Kapitel, pro Kapitel title, text und optional steps mit höchstens 30 Einträgen. Keine weiteren Felder oder auszuführenden Skripte. Obergrenze ca. 1,5 MB. Der Editor übernimmt den importierten Titel; er bleibt danach frei bearbeitbar.

### HTML/CSS/JavaScript

Quellcode bis 100000 Zeichen. Die Ausführung erfolgt in einem isolierten iframe, ohne App-Daten-/Cookiezugriff und ohne freigegebene App-Aktionen. Externe Ressourcen und Netzwerkzugriffe sind eingeschränkt; Bilder als Data-URLs einbetten. PHP, Serverbefehle und direkter Datenbankzugriff werden nicht ausgeführt. Der Code wird nicht automatisch erzeugt oder fachlich geprüft.

## Sicherung

Eigene Arten und Wissenseinträge, Drehbuchentwurf, veröffentlichte Fassung und PDFs liegen in data/weedys.sqlite. Ein konsistentes vollständiges Datenbankbackup sichert sie mit. Der Admin-JSON-Export enthält PDF-Metadaten, nicht die binären PDF-Dateien. Bei App-Updates data/ und eigene config.php immer behalten. Keine privaten Testdatenbanken oder hochgeladenen Dokumente sind im ausgelieferten Paket enthalten.
