#!/bin/bash
rm -rf ./.idea
rm -rf ./server/util/imgs/*
DATE=`date +%F | sed 's/-//g'``date +%T | sed 's/://g'`
tar -czf ./node_lib_bk_$DATE.tar.gz ./server/node_modules
rm -rf ./server/node_modules
rm -rf ./server/db1.db
rm -rf package.json
