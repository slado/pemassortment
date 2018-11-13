@Echo off
robocopy /E /R:0 \\FS3\Releases\HOS\PEM.Assortment\1.0.1.1 .\PEM.Assortment
robocopy /r:0 \\10.10.1.199\t$\temp\ . GoodsDB.bacpac
robocopy /r:0 \\10.10.1.199\t$\temp\ . UIM.bacpac


docker build -t slado/pemassortment:latest .


