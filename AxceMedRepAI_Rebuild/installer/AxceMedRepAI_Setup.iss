; Inno Setup 6 Installer Configuration Script for AxceMedRep AI
; Produces AxceMedRepAI_Setup_v10.exe Windows Installer

#define MyAppName "AxceMedRep AI"
#define MyAppVersion "10.0.1"
#define MyAppPublisher "Axce Health Technologies"
#define MyAppURL "https://axcemedrep.health"
#define MyAppExeName "AxceMedRepAI.Desktop.exe"

[Setup]
AppId={{E5A89B12-4C10-4A33-8F9E-3D2C1B0A4E5F}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
OutputDir=..\dist_installer
OutputBaseFilename=AxceMedRepAI_Setup_v10
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
ArchitecturesInstallIn64BitMode=x64compatible

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
; Desktop Executable & Dependencies
Source: "..\src\AxceMedRepAI.Desktop\bin\Release\net10.0-windows\publish\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; SQLite Initial Database Schema
Source: "..\src\AxceMedRepAI.Infrastructure\Persistence\AxceMedRep.db"; DestDir: "{commonappdata}\AxceMedRepAI"; Flags: ignoreversion onlyifdoesntexist

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
