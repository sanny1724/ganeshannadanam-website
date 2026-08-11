Set WshShell = CreateObject("WScript.Shell")
' Run batch script hidden in the background without showing any terminal window
WshShell.Run chr(34) & WshShell.CurrentDirectory & "\start-agent.bat" & Chr(34), 0
Set WshShell = Nothing
