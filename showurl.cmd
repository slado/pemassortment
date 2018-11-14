@echo off
docker inspect -f "{{ .NetworkSettings.Networks.pemassortment_default.IPAddress }}" pemassortment-container>ip.txt
set /P IP=<ip.txt
echo http://%IP%/
