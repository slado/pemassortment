@echo off
docker run -p 8002:80 -d --name pemassortment-container --rm slado/pemassortment >containerid
docker inspect -f "{{ .NetworkSettings.Networks.nat.IPAddress }}" pemassortment-container
