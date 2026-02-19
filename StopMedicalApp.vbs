' StopMedicalApp.vbs
' This VBScript stops the Medical Prescription Application
' Completely hidden - no command windows

Set WshShell = CreateObject("WScript.Shell")

' Kill all node processes (this stops both frontend and backend)
WshShell.Run "taskkill /F /IM node.exe /T", 0, True

' Wait a moment
WScript.Sleep 1000

' Show confirmation message
MsgBox "Medical Prescription Application has been stopped successfully!" & vbCrLf & vbCrLf & _
       "All services have been terminated." & vbCrLf & vbCrLf & _
       "You can close your browser now.", _
       vbInformation, "Medical App Stopped"

Set WshShell = Nothing
