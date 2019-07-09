#!/bin/bash
echo 'Starting'
mkdir NoteService
mkdir NoteService/bk
mkdir NoteService/bk/imgs
mkdir NoteService/server
mkdir NoteService/server/util
mkdir NoteService/server/util/imgs
DATE=`date +%F | sed 's/-//g'``date +%T | sed 's/://g'`


echo 'Bakup Files ......'
cp -avx server/util NoteService/server
cp server/db1.db NoteService/server
cp server/package.json NoteService/server
cp server/server.js NoteService/server


cp -avx three NoteService
cp -avx .git NoteService
cp .gitignore NoteService
cp index.html NoteService
cp install.sh NoteService
cp favicon.ico NoteService
cp ajax.js NoteService
cp run.sh NoteService
cp ReadMe.txt NoteService
cp loding2.gif NoteService
cp soft.rar NoteService/bk
cp bk/db1.db NoteService/bk
cp bk/imgs/* NoteService/bk/imgs
cp zip.sh NoteService
cp zip_all.sh NoteService
cp re_init.sh NoteService


echo '正在打包......'
tar -czf NoteService$DATE.tar.gz NoteService
rm -rf NoteService
echo '打包完成!'
exit 0;
