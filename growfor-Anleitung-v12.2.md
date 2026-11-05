# growfor v12.2 – Passwort vergessen per E-Mail

Absender: **noreply@growfor.de**. App-Adresse: **https://growfor.de**.

## Update

Wenn der v12-Installer vorhanden ist: `growfor-Update-v12.2.zip` unter Administration → Updates hochladen, prüfen und installieren. Die signierte Update-ZIP benötigt kein Passwort. Bei Installation per FTP nur den Inhalt von growing/ übertragen; bestehendes data/ und eigene config.php behalten. Zuerst ein externes Backup anlegen. Benutzer, Passwörter, Grows und Einträge werden beim Update nicht zurückgesetzt.

## Einmalig bei ALL-INKL einrichten

1. Falls noch nicht vorhanden, die Adresse noreply@growfor.de im KAS als gültige Absenderadresse bzw. Postfach einrichten. Keine Hosting- oder Mailpasswörter im Chat teilen.
2. In growfor als Admin anmelden → Administration → **E-Mail & Passwörter**.
3. App-Adresse https://growfor.de und Absender noreply@growfor.de prüfen. Bei Unterordnerinstallation die vollständige App-Adresse verwenden.
4. Einstellungen zunächst speichern, ohne die Wiederherstellung zu aktivieren.
5. „Testmail an meine Profiladresse senden“ wählen. Hierfür muss deine eigene echte E-Mail-Adresse im Profil stehen.
6. Tatsächlichen Eingang einschließlich Spamordner prüfen. Erst danach „E-Mail-Wiederherstellung aktivieren“ einschalten und speichern.

Der Versand verwendet die PHP-Mailfunktion des Hostings. SMTP-Zugangsdaten sind dafür nicht in der App nötig. Das Vorhandensein von mail() oder dessen erfolgreiche Rückgabe beweist keine Zustellung. Wenn keine Testmail ankommt: Absenderfreigabe, Postfach, Mailfunktion sowie SPF/DKIM/DMARC bei ALL-INKL prüfen lassen. Auf deinem tatsächlichen Server wurde der Versand hier noch nicht getestet. Bis zur Aktivierung wird keine automatische Wiederherstellung angeboten; vorliegende Links funktionieren bei deaktiviertem Versand ebenfalls nicht.

## Jeder Nutzer bestätigt seine Adresse selbst

Gilt für Testnutzer, Hauptadmin und weitere Konten mit Adminrolle gleichermaßen. Im Profil eine echte E-Mail-Adresse hinterlegen; eine Änderung verlangt das aktuelle Passwort. Danach „Bestätigungsmail anfordern“ wählen, den Link aus der Mail öffnen und auf der Seite ausdrücklich bestätigen. Der Bestätigungslink gilt 24 Stunden und ist einmalig. Anschließend im Profil den Bestätigungsstatus aktualisieren.

Platzhalter wie test1@users.invalid sind nicht geeignet. Bisher gespeicherte E-Mail-Adressen werden beim Update nicht automatisch als bestätigt markiert. Wenn jemand sein Passwort schon vergessen hat und seine Adresse noch nicht bestätigt war, benötigt er zunächst die Hilfe des Admins bzw. beim Hauptadmin den abgesicherten Hosting-Wiederherstellungsweg. Bloß eine fremde E-Mail-Adresse einzutragen genügt nicht für eine spätere Kontowiederherstellung.

## Passwort vergessen

Auf der Anmeldung den Link **Passwort vergessen?** anklicken, bestätigte E-Mail-Adresse eingeben und die Mail öffnen. Der Rücksetzlink gilt 30 Minuten. Neues Passwort zweimal identisch eingeben (mindestens zehn Zeichen; serverseitig höchstens 72 Bytes). Danach mit dem eingerichteten Anmeldenamen anmelden; Admins können weiterhin ihre E-Mail verwenden. Der Anmeldename steht auch in der Mail.

Beim Zurücksetzen bleiben Kontorolle, Grows, Einträge und Einstellungen erhalten. Alte Anmeldesitzungen und andere Rücksetzlinks für das Konto werden ungültig. Bereits gekoppelte Gerätezugänge können wegen der Änderung der Kontosicherheitsversion ebenfalls eine neue Kopplung benötigen.

## Schutz und Grenzen

- In der Datenbank stehen nur SHA-256-Prüfwerte der zufälligen Einmaltokens. Keine Klartexttokens, Passwörter oder Rücksetzlinks im Versandprotokoll.
- Links sind an Zweck, Nutzer, E-Mail-Adresse und Kontosicherheitsversion gebunden. Gesperrte Konten erhalten keinen nutzbaren Rücksetzlink.
- Ein Link allein verändert noch nichts: Mail-Scanner oder ein bloßer Seitenaufruf bestätigen keine E-Mail und ändern kein Passwort.
- Das Geheimnis im Link wird als URL-Fragment übertragen, vor weiterer Interaktion aus der Adresszeile entfernt und nur im Arbeitsspeicher der Seite gehalten. Beim Neuladen ggf. den ursprünglichen Mail-Link erneut öffnen.
- Für bekannte, unbekannte, unbestätigte und begrenzte Anfragen erscheint derselbe neutrale Text. Versandfehler werden nicht als Kontoinformation an Unangemeldete verraten.
- Begrenzungen pro Adresse/IP und für Bestätigungs- und Testmails; HTTPS erforderlich. Links und Profil-/Versandeinstellungen werden nicht offline vorgemerkt.
- Profiländerung der E-Mail löscht deren Bestätigung und macht alte Links ungültig. Auch eine E-Mail-Änderung durch den Admin erfordert eine neue Bestätigung durch den Nutzer.
- Das Protokoll zeigt nur Versandversuche, nicht den tatsächlichen Empfang. Es wird nach 30 Tagen bereinigt. Zugriff nur für Admins.

Dieses Update stellt keine bereits vergessenen Passwörter automatisch wieder her und aktiviert den Mailversand nicht ohne deine Einrichtung. Die zuvor bereitgestellte einmalige Admin-Wiederherstellung ist nicht Teil des App-Pakets.
