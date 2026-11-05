# growfor – https://growfor.de

App: https://growfor.de/
Administration: https://growfor.de/administrator/
Wiederherstellung: https://growfor.de/update-recovery.php

Version 12.1 benennt die Web-App einschließlich Anmeldung, Administration und PWA-Name in growfor um. Das bisherige Maskottchen bleibt im Logo und Icon erhalten. Intern bleiben Updateformat, Signaturschlüssel und Speicherkennungen kompatibel. Ein gespeicherter alter Standardname „Growing“ wird als „growfor“ angezeigt; anders benannte eigene App-Namen bleiben erhalten.

## Erstmalig auf die eigene Domain hochladen

1. Im ALL-INKL-KAS die Domain growfor.de auf einen eigenen Webordner zeigen lassen, beispielsweise /growfor/.
2. SSL für growfor.de aktivieren und HTTPS verwenden.
3. Aus dem entpackten Komplettpaket ausschließlich den Inhalt von growing/ in diesen Webordner übertragen, einschließlich administrator/, avatars/, licenses/ und versteckter .htaccess-Dateien. index.html liegt direkt im Domain-Zielordner, nicht in einem zusätzlichen Unterordner growing/.
4. Bei bestehender Installation zuerst extern sichern; vorhandenes data/ und eigene config.php behalten. Es werden keine bestehenden Konten oder Passwörter zurückgesetzt.
5. https://growfor.de/ öffnen und als Admin anmelden. Der direkte Verwaltungszugang ist https://growfor.de/administrator/.

Die Domainadresse gehört zur Installationsanleitung; API- und Assetpfade bleiben relativ, damit die App auch in einer lokalen Prüfung und unter Unterordnern funktioniert. Auf deinem Server wurde durch die Erstellung dieses Pakets nichts installiert.

## Wenn der v12-Installer bereits vorhanden ist

Die Datei growfor-Update-v12.1.zip direkt in Administration → Updates hochladen, prüfen und installieren. Sie ist signiert und benötigt kein ZIP-Passwort. Bei noch fehlendem Installer zunächst das vollständige Paket einmal per FTP übertragen. Die Hostingvoraussetzungen und Sicherungshinweise aus UPDATE-v12.md gelten weiter.

Die Veröffentlichung wurde lokal auf Syntax und sichere Paketstruktur geprüft. Die Erreichbarkeit von growfor.de ließ sich aus dieser Cloud-Umgebung wegen einer Netzwerkbeschränkung nicht prüfen; daraus lässt sich kein Fehler deiner Domain ableiten. Vorhandene Homescreen-Verknüpfungen können ihren bisherigen Namen behalten; gegebenenfalls nach dem Update neu hinzufügen. Die optionale native Android-Testbrücke aus dem bisherigen Paket trägt weiterhin ihren bisherigen Testnamen.
