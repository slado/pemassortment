@echo off
docker-compose up
docker inspect -f "{{ .NetworkSettings.Networks.pemassortment_default.IPAddress }}" pemassortment-container
