# Windows Image Changer

Python-Tool für Arch Linux, um ein offline Windows-Image automatisch zu mounten und künstliche Benutzeraktivität zu erzeugen.

Das Tool verändert ein **nicht gestartetes Windows-System**, sodass es wie ein bereits längere Zeit genutztes System wirkt. Dabei werden typische Benutzerartefakte wie Dateien, Browserdaten, Registry-Einträge und Windows-Eventlogs erzeugt oder angepasst.

Alle Änderungen werden protokolliert und können über die erzeugten Backups wieder rückgängig gemacht werden.

---

# Features

- Automatische Erkennung der Windows-Partition
- Automatisches Mounten der NTFS-Partition
- Erkennung des Windows-Benutzers
- Erzeugen realistischer Benutzerdateien
- Browser-Verlauf und Bookmarks
- Registry-Anpassungen
- Austausch von Windows-Eventlogs
- Vollständiges Änderungsprotokoll
- Automatische Backups aller überschriebenen Dateien
- Reverse-Funktion zum Wiederherstellen des Ursprungszustands

---

# Voraussetzungen

- Arch Linux
- Python 3
- Windows muss vollständig heruntergefahren sein
- NTFS-Unterstützung (`ntfs3` oder `ntfs-3g`)
- Administratorrechte (root)

Installieren der benötigten Pakete:

```bash
pacman -Sy ntfs-3g
```

---

# Wichtiger Hinweis zu Windows 11

Windows 11 aktiviert teilweise automatisch die Geräteverschlüsselung (BitLocker).

Falls Linux die Windows-Partition als **BitLocker** erkennt, muss diese zuerst vollständig entschlüsselt werden.

Unter Windows:

```powershell
manage-bde -off C:
```

Status prüfen:

```powershell
manage-bde -status
```

Erst wenn dort steht:

```text
Konvertierungsstatus: Vollständig entschlüsselt
Verschlüsselt (Prozent): 0,0 %
```

kann die Partition vom Tool bearbeitet werden.

Windows anschließend vollständig herunterfahren:

```powershell
shutdown /s /f /t 0
```

---

# Nutzung

## Automatische Partitionssuche

Das Tool sucht automatisch die Windows-Partition auf dem angegebenen Datenträger.

```bash
python main.py --target /dev/sdb
```

---

## Direkte Partition angeben

```bash
python main.py --partition /dev/sdb3
```

---

## Dry Run

Zeigt geplante Änderungen an, schreibt jedoch nichts.

```bash
python main.py --target /dev/sdb --dry-run
```

---

## Status anzeigen

Analysiert das Windows-Image ohne Änderungen vorzunehmen.

```bash
python main.py --status --target /dev/sdb
```

---

## Alle bisherigen Runs anzeigen

```bash
python main.py --list
```

---

## Letzten Run rückgängig machen

```bash
python main.py --reverse latest
```

---

## Bestimmten Run rückgängig machen

```bash
python main.py --reverse logs/run_YYYYMMDD_HHMMSS/run.jsonl
```

---

# CLI Argumente

| Argument | Beschreibung |
|------------|--------------|
| `--target` | Gesamter Datenträger (z.B. `/dev/sdb`) |
| `--partition` | Direkte Windows-Partition (z.B. `/dev/sdb3`) |
| `--mountpoint` | Eigener Mountpunkt |
| `--profile` | Nutzungsprofil (`office`, `student`, `developer`, `home`, `gamer`) |
| `--profiles` | Verfügbare Profile anzeigen |
| `--seed` | Fester Zufallsseed |
| `--age` | Simuliertes Alter des Systems |
| `--browser` | Browser (`edge`, `chrome`, `all`, `none`) |
| `--events` | Eventlog-Template (`generic_heavy`, `none`) |
| `--registry` | Registry-Profil |
| `--quick`, `-q` | Schnellmodus |
| `--dry-run` | Keine Änderungen schreiben |
| `--reverse` | Änderungen rückgängig machen |
| `--list` | Vorherige Runs anzeigen |
| `--status` | Nur analysieren |
| `--verbose` | Ausführlichere Ausgabe |

---

# Beispiel

```bash
python main.py --target /dev/sdb
```

Beispielausgabe:

```text
[+] Suche Windows-Partition auf /dev/sdb
[+] Windows-Partition: /dev/sdb3
[+] Gemountet nach: /mnt/win_age_windows
[+] Gefundener User: jan
[+] Erzeuge Artefakte für jan
[+] Registry geändert
[+] Eventlog geschrieben
[+] Summary erstellt
[+] Diff erstellt
[+] Backups erstellt
[+] Unmounted.
```

---

# Erzeugte Änderungen

Je nach Profil werden unter anderem folgende Artefakte erzeugt.

## Dateien

Beispiele:

```text
Desktop/
    meeting_notes.txt
    todo.txt

Documents/
    Budget.xlsx
    Projektplanung.docx
    Rechnung_2025.pdf

Downloads/
    archive.zip
    setup_notes.txt

Pictures/
    IMG_20250517.jpg
```

---

## Browser

Je nach ausgewähltem Browser:

- Verlauf
- Bookmarks
- Downloads

Unterstützt:

- Microsoft Edge
- Google Chrome

---

## Registry

Typische Benutzerartefakte:

- RunMRU
- TypedPaths
- RecentDocs
- OpenSaveMRU
- OpenSavePidlMRU
- Explorer
- MountPoints2
- UserAssist

---

## Eventlogs

Je nach Template werden folgende EVTX-Dateien ersetzt:

```text
Application.evtx
System.evtx
Security.evtx
Windows PowerShell.evtx
Microsoft-Windows-PowerShell/Operational.evtx
TaskScheduler/Operational.evtx
TerminalServices-LocalSessionManager/Operational.evtx
```

---

# Logstruktur

Für jeden Lauf wird ein eigener Ordner erzeugt.

```text
logs/
└── run_YYYYMMDD_HHMMSS/
    ├── run.jsonl
    ├── summary.json
    ├── diff.json
    └── backups/
```

---

# run.jsonl

Enthält sämtliche Aktionen als JSON Lines.

Jede Zeile beschreibt genau eine Änderung.

Beispiele:

```json
{"action":"create_or_modify_file","path":"Users/jan/Desktop/todo.txt"}
```

```json
{"action":"registry_value_set","path":"Users/jan/NTUSER.DAT"}
```

```json
{"action":"replace_eventlog","path":"Windows/System32/winevt/Logs/Security.evtx"}
```

Diese Datei wird ebenfalls für die Reverse-Funktion verwendet.

---

# summary.json

Enthält eine kompakte Zusammenfassung des gesamten Runs.

Beispiel:

```json
{
    "run_id":"20260702_171814",
    "summary":{
        "statistics":{
            "total_changes":38863,
            "filesystem_items":16,
            "browser_items":12,
            "registry_items":32,
            "eventlog_items":38803,
            "evtx_files_replaced":7
        }
    }
}
```

---

# diff.json

Enthält alle Änderungen gruppiert nach Kategorien.

Unter anderem:

- Filesystem
- Browser
- Registry
- Eventlogs

Zusätzlich:

- SHA256 vorher
- SHA256 nachher
- Backup-Pfad
- Änderungsart
- Pfad

---

# Backups

Vor jeder Änderung werden Sicherungen erstellt.

Beispiele:

```text
backups/

Users/jan/NTUSER.DAT

Windows/System32/winevt/Logs/Security.evtx

Users/jan/AppData/Local/Microsoft/Edge/User Data/Default/History
```

Diese Backups werden für `--reverse` verwendet.

---

# Reverse

Den letzten Run rückgängig machen:

```bash
python main.py --reverse latest
```

Dabei werden:

- erzeugte Dateien gelöscht
- überschriebene Dateien wiederhergestellt
- Registry-Hives zurückkopiert
- Browserdaten zurückgesetzt
- Eventlogs wiederhergestellt

---

# Typischer Ablauf

1. Windows installieren
2. BitLocker/Geräteverschlüsselung deaktivieren
3. Windows vollständig herunterfahren

```powershell
shutdown /s /f /t 0
```

4. Arch starten

5. Tool ausführen

```bash
python main.py --target /dev/sdb
```

6. Windows starten

7. Änderungen prüfen

8. Optional Reverse testen

```bash
python main.py --reverse latest
```

---

# Fehlerbehebung

## Windows wird als BitLocker erkannt

Prüfen:

```bash
hexdump -C -n 16 /dev/sdb3
```

Falls dort

```text
-FVE-FS-
```

erscheint, ist BitLocker aktiv.

Unter Windows:

```powershell
manage-bde -off C:
```

anschließend warten bis

```text
0,0 %
```

erreicht ist.

---

## Windows-Partition wird nicht gefunden

Partitionen anzeigen:

```bash
lsblk -f
```

oder

```bash
fdisk -l /dev/sdb
```

Anschließend ggf. direkt angeben:

```bash
python main.py --partition /dev/sdb3
```

---

## Änderungen erscheinen in Windows nicht

Mögliche Ursachen:

- Windows wurde nicht vollständig heruntergefahren
- BitLocker ist aktiv
- VirtualBox verwendet Snapshots oder Differencing-Disks
- Falsche VDI wird bearbeitet

---

# Projektziel

Dieses Tool dient dazu, ein Windows-System vor einer Malware-Analyse mit realistischer Benutzeraktivität anzureichern.

Dadurch wirkt ein frisch installiertes Windows glaubwürdiger und die vom Tool erzeugten Änderungen können später anhand der Logdateien eindeutig von tatsächlichen Malware-Aktivitäten unterschieden werden.