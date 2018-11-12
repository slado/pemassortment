FROM microsoft/iis

#remove old content
RUN powershell -NoProfile -Command Remove-Item -Recurse C:\inetpub\wwwroot\*

# Create app directory
WORKDIR /inetpub/wwwroot

#copy application
COPY PEM.Assortment/ .

#EXPOSE 8888
#WORKDIR /app/PEM.SiteGroups
#ENTRYPOINT ["dotnet", "PEM.Configuration.SiteGroups.dll"]
#RUN ["cmd ", "/c dir /s"]
