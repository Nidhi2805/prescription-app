' StartMedicalApp.vbs
' This VBScript starts the application completely hidden
' No command windows, no VSCode needed
' Just double-click and browser opens automatically

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get the directory where this script is located
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Create logs directory if it doesn't exist
logsDir = scriptDir & "\logs"
If Not fso.FolderExists(logsDir) Then
    fso.CreateFolder(logsDir)
End If

' Kill any existing node processes
WshShell.Run "taskkill /F /IM node.exe /T", 0, True
WScript.Sleep 2000

' Start Backend Server (completely hidden)
backendDir = scriptDir & "\backend"
backendCmd = "cmd /c cd /d """ & backendDir & """ && node server.js > """ & logsDir & "\backend.log"" 2>&1"
WshShell.Run backendCmd, 0, False

' Wait for backend to start
WScript.Sleep 3000

' Start Frontend (hidden, but will open browser)
frontendDir = scriptDir & "\frontend"
frontendCmd = "cmd /c cd /d """ & frontendDir & """ && npm start > """ & logsDir & "\frontend.log"" 2>&1"
WshShell.Run frontendCmd, 0, False

' Wait for React to compile and browser to open
WScript.Sleep 15000

' Show success message
MsgBox "Medical Prescription Application is starting!" & vbCrLf & vbCrLf & _
       "Browser will open automatically in a few seconds." & vbCrLf & vbCrLf & _
       "If browser doesn't open, go to: http://localhost:3000" & vbCrLf & vbCrLf & _
       "To stop the application, use 'Stop Medical App' icon.", _
       vbInformation, "Medical App Starting"

' Optional: Ensure browser opens
WScript.Sleep 5000
WshShell.Run "http://localhost:3000", 1, False

Set WshShell = Nothing
Set fso = Nothing
