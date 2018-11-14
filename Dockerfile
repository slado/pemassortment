#FROM microsoft/iis
FROM microsoft/aspnet:4.7.2

SHELL ["powershell", "-Command", "$ErrorActionPreference = 'Stop';"]

#remove old content
RUN powershell -NoProfile -Command Remove-Item -Recurse C:\inetpub\wwwroot\*

#DacFramework is not needed anymore. That's why the tools are not installed at all
#install chocolatey
#WORKDIR /tools
#RUN Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
#RUN Install-PackageProvider -Name chocolatey -Force

#install DacFramework
#RUN choco install sql2017-dacframework --yes

# Create app directory
WORKDIR /inetpub/wwwroot

#copy application
COPY PEM.Assortment/ .

#copy configuration
COPY web.config .

#deploy databases
#WORKDIR /databases
#COPY GoodsDB.bacpac .
#COPY UIM.bacpac .

#RUN "'C:\Program Files\Microsoft SQL Server\140\DAC\bin\sqlpackage.exe /Action:Import /tsn:tcp:db,14331 /tdn:GoodsDB /tu:sa /tp:SunkaFl4ky /sf:GoodsDB.bacpac'"
#RUN "'C:\Program Files\Microsoft SQL Server\140\DAC\bin\sqlpackage.exe /Action:Import /tsn:tcp:db,14331 /tdn:UIM /tu:sa /tp:SunkaFl4ky /sf:UIM.bacpac'"

EXPOSE 8002
#WORKDIR /app/PEM.SiteGroups
#ENTRYPOINT ["dotnet", "PEM.Configuration.SiteGroups.dll"]
#RUN ["cmd ", "/c dir /s"]
