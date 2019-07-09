#!/bin/bash
cd ./server
echo '正在安装'
# 检查cnpm是否安装，如果没有安装则安装
command -v cnpm >/dev/null 2>&1 || { echo '正在安装cnpm工具';npm install -g cnpm --registry=https://registry.npm.taobao.org;}
# 使用cnpm来安装
echo '正在使用cnpm进行安装依赖库';
cnpm install formidable fs http url path sqlite3 --save
exit 0;

