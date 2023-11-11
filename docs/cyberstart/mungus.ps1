echo "amogus jarson script go brrrr"

echo "firewall is being lit on fire"

Set-NetFirewallProfile -Profile Domain, Public, Private -Enabled True

echo "windows will start scanning automatically *some* of the time"

Set-ItemProperty -Path "HKLM:SOFTWARE\Microsoft\Windows Defender" -Name PassiveMode -Value 2 -Force

pause