FROM microsoft/iis

#remove old content
RUN powershell -NoProfile -Command Remove-Item -Recurse C:\inetpub\wwwroot\*

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
