
Set WshShell = CreateObject("WScript.Shell")

WshShell.CurrentDirectory = "R:\Website-WhatsApp-Automation"

WshShell.Run "cmd.exe /c node src\app.js >> logs\automation.log 2>&1", 0, False
