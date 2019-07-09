#!/bin/bash
echo 'Starting'
mkdir dist
mkdir dist/server
mkdir dist/server/util
mkdir dist/server/util/imgs
DATE=`date +%F | sed 's/-//g'``date +%T | sed 's/://g'`
#cd server
#NAME=node_modules$DATE.tar.gz
#tar -czf $NAME node_modules
#cd ..
echo 'Bakup Files ......'
#cp server/$NAME dist/server
#cp -avx server/node_modules dist/server
cp server/server.js dist/server
cp server/util/http.js dist/server/util
cp server/util/sqlite.js dist/server/util
cp -avx three dist
cp index.html dist
cp install.sh dist
cp favicon.ico dist
cp ajax.js dist
cp run.sh dist
cp ReadMe.txt dist
cp loding2.gif dist
#cp soft/Git-2.13.0-64-bit.exe dist/softs
#cp soft/node-v10.15.3-x64.thunder_tmp.msi dist/softs
cp bk/db1.db dist/server
cp bk/imgs/* dist/server/util/imgs
# package
echo '正在打包......'
tar -czf dist$DATE.tar.gz dist/
rm -rf dist
echo '压缩包：dist.tar.gz 打包完成!'
exit 0;

#########################################
# 19625版本
#########################################
# - 更新了服务中的底层的http框架接口
# - 更新了页面上的一些提示错误，处理参数校验
# - 更新了多用户支持
# - 更新了数据库的多用户支持
# - 更新了界面样式
#########################################