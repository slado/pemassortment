#FROM microsoft/iis
FROM microsoft/aspnet:4.7.2

SHELL ["powershell", "-Command", "$ErrorActionPreference = 'Stop';"]

#remove old content
RUN powershell -NoProfile -Command Remove-Item -Recurse C:\inetpub\wwwroot\*

#install chocolatey
WORKDIR /tools
RUN Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
RUN Install-PackageProvider -Name chocolatey -Force

#install DacFramework
RUN choco install sql2017-dacframework -y

# Create app directory
WORKDIR /inetpub/wwwroot

#copy application
COPY PEM.Assortment/ .

#copy configuration
COPY web.config .

EXPOSE 8002
#WORKDIR /app/PEM.SiteGroups
#ENTRYPOINT ["dotnet", "PEM.Configuration.SiteGroups.dll"]
#RUN ["cmd ", "/c dir /s"]
