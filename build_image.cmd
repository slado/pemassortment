@Echo off
robocopy /E /R:0 \\FS3\Releases\HOS\PEM.Assortment\1.0.1.1 .\PEM.Assortment
docker build -t slado/pemassortment:latest .


