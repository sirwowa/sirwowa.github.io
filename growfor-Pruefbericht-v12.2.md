# growfor v12.2 – Prüfung

Lokal am 5. November 2026 geprüft, mit einer privaten Test-Mailannahme statt echtem E-Mail-Versand. Keine Nachricht an reale Empfänger versandt, keine Hostingänderung auf growfor.de durchgeführt.

API-Prüfungen bestanden:

- Versand standardmäßig deaktiviert; Einstellungen und Testmail nur für Admins.
- Gleiche neutrale Antwort für unbekannte/unbestätigte/Platzhalteradressen, kein Versand an diese.
- E-Mail-Bestätigung mit Ablauf, Zweckbindung und einmaliger Verwendung.
- Rücksetzen nach bestätigter E-Mail, Passwortkontrolle, Begrenzung pro E-Mail und Entwertung alter Sitzungen sowie weiterer Rücksetzlinks.
- Testnutzer und Admins können denselben Wiederherstellungsweg nutzen.
- E-Mail-Änderung benötigt das aktuelle Passwort und löscht die Bestätigung.
- Versandfehler bleiben gegenüber Unangemeldeten neutral, dabei angelegte Token werden entfernt und Fehler im Adminprotokoll erfasst.
- Keine Roh-Tokens oder Mailtexte im Protokoll, nur Token-Prüfwerte in der Datenbank.

Browser-Prüfungen bestanden:

- Im Profil Bestätigungsmail anfordern, Link ausdrücklich bestätigen, Token aus Adresszeile entfernen und Status aktualisieren.
- Auf „Passwort vergessen?“ klicken, Rücksetzlink anfordern, Passwort zweimal eingeben und mit neuem Passwort anmelden.
- Separater Admin-Eingang mit Mailkonfiguration; noreply@growfor.de als Vorgabe.
- Darstellung ohne horizontalen Überlauf bei 320, 390, 768 und 1280 Pixeln.

Die bisherige Anmeldesicherung des Nutzers wurde nur lokal auf einer Kopie migriert; Benutzer-/Passwortfelder, drei Grows und 19 Einträge bleiben erhalten. Keine private Datenbank im Download. PHP-/JavaScript-Syntax und Signatur/Paketstruktur separat geprüft.

Nicht geprüft: reale Zustellung durch ALL-INKL, Spamfilter und DNS-Mailauthentifizierung. mail()-Annahme ist keine Zustellbestätigung. Der Betreiber muss eine Testmail tatsächlich empfangen und den Versand erst danach aktivieren.

Zusätzlich geprüft: Absender- und Headerprüfung, feste HTTPS-Domain für Links, CSRF-Abweisung, Versionskonflikt der Mailkonfiguration sowie gleichzeitige E-Mail-/Passwortänderung mit Erhalt der aktuellen Sitzung und Entzug der E-Mail-Bestätigung.
