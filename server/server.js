/*
 * 服务程序
 */
const SqliteDB = require('./util/sqlite.js').SqliteDB;
const App = require('./util/http.js');
const file = "./db1.db";
const sqliteDB = new SqliteDB(file);

/** 本服务的数据库定义 */
const dbTables = {
    /** 系统用户表 */
    sys_user: {
        tableName: 'sys_user',
        columns: {
            id: {type: Number, sqlType: 'INTEGER NOT NULL PRIMARY KEY'},
            username: {type: String, sqlType: 'VARCHAR NOT NULL'},
            password: {type: String, sqlType: 'VARCHAR NOT NULL'},
            phone: {type: Number, sqlType: 'BIGINT'},
            valid: {type: Number, sqlType: 'TINYINT NOT NULL'}
        },
        create() {
            let S = this, fds = Object.keys(this.columns), arr = [], sql = null;
            fds.forEach(key => {
                arr.push(`${key} ${S.columns[key].sqlType}`);
            });
            sql = `create table if not exists ${S.tableName}(${arr.toString()});`;
            sqliteDB.createTable(sql);
        },
        getColumnsFiled() {
            return Object.keys(this.columns).toString();
        }
    },
    /** 分类表 */
    classify: {
        tableName: 'classify',
        columns: {
            id: {type: Number, sqlType: 'INTEGER NOT NULL PRIMARY KEY'},
            name: {type: String, sqlType: 'VARCHAR NOT NULL'},
            valid: {type: Number, sqlType: 'TINYINT NOT NULL'},
            user: {type: Number, sqlType: 'TINYINT NOT NULL'}
        },
        create() {
            let S = this, fds = Object.keys(this.columns), arr = [], sql = null;
            fds.forEach(key => {
                arr.push(`${key} ${S.columns[key].sqlType}`);
            });
            sql = `create table if not exists ${S.tableName}(${arr.toString()});`;
            sqliteDB.createTable(sql);
        },
        getColumnsFiled() {
            return Object.keys(this.columns).toString();
        }
    },
    /** 记录表 */
    notes: {
        tableName: 'notes',
        columns: {
            id: {type: Number, sqlType: 'INTEGER NOT NULL PRIMARY KEY'},
            classify: {type: Number, sqlType: 'INTEGER NOT NULL'},
            title: {type: String, sqlType: 'VARCHAR NOT NULL'},
            content: {type: String, sqlType: 'TEXT NOT NULL'},
            remark: {type: String, sqlType: 'VARCHAR'},
            valid: {type: Number, sqlType: 'INTEGER NOT NULL'},
            user: {type: Number, sqlType: 'TINYINT NOT NULL'}
        },
        create() {
            let S = this, fds = Object.keys(this.columns), arr = [], sql = null;
            fds.forEach(key => {
                arr.push(`${key} ${S.columns[key].sqlType}`);
            });
            sql = `create table if not exists ${S.tableName}(${arr.toString()});`;
            sqliteDB.createTable(sql);
        },
        getColumnsFiled() {
            return Object.keys(this.columns).toString();
        }
    }
};

/** 定义一个未登录的状态特征值，用于校验和返回，作为当前是否登录过的标志 */
const loginRoute = 'toLogin';

/** 当前登录用户记录的key */
const currentLogin = 'user';

/** 检查获取当前登录用户 */
App.route("/user/getLogin.do", (req, res, params) => {
    if (App.cacheContain(currentLogin)) {
        App.responseData(res, [App.cacheGet(currentLogin)]);
    } else {
        App.responseError(res, loginRoute);
    }
});

/** 注销登录 */
App.route("/user/logout.do", (req, res, params) => {
    App.cacheRemove(currentLogin);
    App.responseOk(res, null);
});

/** 修改密码 */
App.route("/user/repassword.do", (req, res, params) => {
    App.validator({
        username: {required: true},
        password: {required: true},
        npassword: {required: true},
        rnpassword: {required: true}
    }, params, (valid, msg) => {
        if (valid) {
            if (params.npassword === params.rnpassword) {
                try {
                    let sql = `select * from ${dbTables.sys_user.tableName} where username='${params.username}' and password='${params.password}'`;
                    sqliteDB.queryData(sql, d => {
                        if (d && d.length > 0) {
                            let user = d[0];
                            let sql = `update ${dbTables.sys_user.tableName} set password='${params.npassword}' where id=${user.id}`;
                            sqliteDB.executeSql(sql, () => {
                                App.cacheRemove(currentLogin);
                                App.responseOk(res, '更新成功')
                            })
                        } else {
                            App.responseWarning(res, '用户密码错误');
                        }
                    })
                } catch (e) {
                    App.responseError(res, '执行失败');
                }
            } else {
                App.responseError(res, "两次密码输入不一致");
            }
        } else {
            App.responseError(res, msg);
        }
    })
})

/** 登陆 */
App.route("/user/login.do", (req, res, params) => {
    App.validator({
        username: {required: true},
        password: {required: true}
    }, params, (valid, msg) => {
        if (valid) {
            try {
                let sql = `select * from ${dbTables.sys_user.tableName} where username='${params.username}' and password='${params.password}'`;
                sqliteDB.queryData(sql, d => {
                    if (d && d.length > 0) {
                        // 每次登陆都将上次的信息进行覆盖
                        App.cacheAdd(currentLogin, d[0]);
                        App.responseData(res, d, '登录成功');
                    } else {
                        App.responseWarning(res, '登录失败');
                    }
                });
            } catch (e) {
                App.responseError(res, '执行失败');
            }
        } else {
            App.responseError(res, msg);
        }
    })
});

/** 注册 */
App.route("/user/register.do", (req, res, params) => {
    App.validator({
        username: {required: true, min: 1},
        password: {required: true},
        phone: {required: false}
    }, params, (valid, msg) => {
        if (valid) {
            try {
                let sql = `select * from ${dbTables.sys_user.tableName} where username='${params.username}'`;
                sqliteDB.queryData(sql, d => {
                    if (d && d.length > 0) {
                        App.responseWarning(res, '用户已存在！')
                    } else {
                        sql = `insert into ${dbTables.sys_user.tableName}(${dbTables.sys_user.getColumnsFiled()}) values(?,?,?,?,?)`;

                        sqliteDB.insertData(sql, [
                            [App.gId(), params.username, params.password, null, 1]
                        ], () => {
                            App.responseOk(res, '添加用户成功！');
                        });
                    }
                });
            } catch (e) {
                App.responseError(res, '执行失败');
            }
        } else {
            App.responseError(res, msg);
        }
    })
});

/** 添加分类 */
App.route("/classify/add.do", (req, res, params) => {
    App.validator({
        name: {required: true},
        user: {
            validator: msgSet => {
                if (App.cacheContain(currentLogin)) {
                    msgSet.add(loginRoute);
                    params.user = App.cacheGet(currentLogin).id;
                    return true;
                } else {
                    return false;
                }
            }
        },
    }, params, (valid, msg) => {
        if (valid) {
            try {
                let sql = `insert into ${dbTables.classify.tableName}(${dbTables.classify.getColumnsFiled()}) values(?,?,?,?)`;
                sqliteDB.insertData(sql, [
                    [App.gId(), params.name, 1, params.user]
                ], () => {
                    App.responseOk(res, '添加分类成功！');
                });
            } catch (e) {
                App.responseError(res, '执行失败');
            }
        } else {
            App.responseError(res, msg);
        }
    })
});

/** 更新分类 */
App.route("/classify/update.do", (req, res, params) => {
    App.validator({
        id: {required: true},
        name: {required: true},
        user: {
            validator: msgSet => {
                if (App.cacheContain(currentLogin)) {
                    msgSet.add(loginRoute);
                    return true;
                } else {
                    return false;
                }
            }
        }
    }, params, (valid, msg) => {
        if (valid) {
            try {
                App.cacheRemove(params.id);
                let sql = `update ${dbTables.classify.tableName} set name='${params.name}' where id=${params.id}`;
                sqliteDB.executeSql(sql, () => {
                    App.responseOk(res, '更新成功')
                })
            } catch (e) {
                App.responseError(res, '执行失败');
            }
        } else {
            App.responseError(res, msg);
        }
    })
});

/** 删除分类 */
App.route("/classify/delete.do", (req, res, params) => {
    App.validator({
        id: {required: true},
        user: {
            validator: msgSet => {
                if (App.cacheContain(currentLogin)) {
                    msgSet.add(loginRoute);
                    return true;
                } else {
                    return false;
                }
            }
        }
    }, params, (valid, msg) => {
        if (valid) {
            try {
                App.cacheRemove(params.id);

                let sql = `delete from ${dbTables.classify.tableName} where id=${params.id}`;
                sqliteDB.executeSql(sql, () => {
                    App.responseOk(res, '删除成功')
                })
            } catch (e) {
                App.responseError(res, '执行失败');
            }
        } else {
            App.responseError(res, msg);
        }

    })
});

/** 根据分类id查询issue列表 */
App.route("/issue/listByCid.do", (req, res, params) => {

    App.validator({
        classify: {required: true},
        user: {
            validator: msgSet => {
                if (App.cacheContain(currentLogin)) {
                    msgSet.add(loginRoute);
                    params.user = App.cacheGet(currentLogin).id;
                    return true;
                } else {
                    return false;
                }
            }
        }
    }, params, (valid, msg) => {
        if (valid) {
            try {
                let sql = `select * from ${dbTables.notes.tableName} where classify=${params.classify} and user=${params.user} order by title`;
                sqliteDB.queryData(sql, d => {
                    App.responseData(res, d);
                });
            } catch (e) {
                App.responseError(res, '执行失败');
            }
        } else {
            App.responseError(res, msg);
        }
    })
});

/** 获取issue记录 */
App.route("/issue/get.do", (req, res, params) => {
    // 如果已经缓存则直接走缓存
    if (App.cacheContain(currentLogin) && App.cacheContain(params.id)) {
        let rel = App.cacheGet(params.id);
        App.responseData(res, rel);
        return;
    }

    // 首次或缓存中没有时从数据库查询
    App.validator({
        id: {required: true},
        user: {
            validator: msgSet => {
                if (App.cacheContain(currentLogin)) {
                    msgSet.add(loginRoute);
                    return true;
                } else {
                    return false;
                }
            }
        }
    }, params, (valid, msg) => {
        if (valid) {
            try {
                let sql = `select * from ${dbTables.notes.tableName} where id=${params.id}`;
                sqliteDB.queryData(sql, d => {
                    App.cacheAdd(params.id, d);
                    App.responseData(res, d);
                });
            } catch (e) {
                App.responseError(res, '执行失败');
            }
        } else {
            App.responseError(res, msg);
        }
    })
});

/** 添加issue记录 */
App.route("/issue/add.do", (req, res, params) => {
    App.validator({
        classify: {required: true},
        title: {required: true, min: 1},
        content: {required: true, min: 1},
        remark: {required: false},
        user: {
            validator: msgSet => {
                if (App.cacheContain(currentLogin)) {
                    msgSet.add(loginRoute);
                    params.user = App.cacheGet(currentLogin).id;
                    return true;
                } else {
                    return false;
                }
            }
        }
    }, params, (valid, msg) => {
        if (valid) {
            try {
                let sql = `insert into ${dbTables.notes.tableName}(${dbTables.notes.getColumnsFiled()}) values(?,?,?,?,?,?,?)`;
                sqliteDB.insertData(sql, [
                    [App.gId(), params.classify, params.title, params.content, App.isEmptyToNull(params.remark), 1, params.user]
                ], () => {
                    App.responseOk(res, '添加成功！');
                });
            } catch (e) {
                App.responseError(res, '执行失败');
            }
        } else {
            App.responseWarning(res, msg);
        }
    })
});

/** 更新issue记录 */
App.route("/issue/update.do", (req, res, params) => {
    App.validator({
        id: {required: true},
        classify: {required: true},
        title: {required: true, min: 1, max: 250},
        content: {required: true, min: 1},
        remark: {required: false},
        user: {
            validator: msgSet => {
                if (App.cacheContain(currentLogin)) {
                    msgSet.add(loginRoute);
                    return true;
                } else {
                    return false;
                }
            }
        }
    }, params, (valid, msg) => {
        if (valid) {
            try {
                App.cacheRemove(params.id);
                let remark = App.isEmptyToNull(params.remark);
                remark = remark ? `'${remark}'` : remark;
                let sql = `update ${dbTables.notes.tableName} set classify=${params.classify}, title='${params.title}', content='${params.content}', remark=${remark} where id=${params.id}`;
                sqliteDB.executeSql(sql, () => {
                    App.responseOk(res, '更新成功')
                })
            } catch (e) {
                App.responseError(res, '执行失败');
            }
        } else {
            App.responseError(res, msg);
        }
    })
});

/** 删除issue记录 */
App.route("/issue/delete.do", (req, res, params) => {
    App.validator({
        id: {required: true},
        user: {
            validator: msgSet => {
                if (App.cacheContain(currentLogin)) {
                    msgSet.add(loginRoute);
                    return true;
                } else {
                    return false;
                }
            }
        }
    }, params, (valid, msg) => {
        if (valid) {
            try {
                App.cacheRemove(params.id);

                let sql = `delete from ${dbTables.notes.tableName} where id=${params.id}`;
                sqliteDB.executeSql(sql, () => {
                    App.responseOk(res, '删除成功')
                })
            } catch (e) {
                App.responseError(res, '执行失败');
            }
        } else {
            App.responseError(res, msg);
        }
    })
});

/** 统计不同的分类下面的issue的数量 */
App.route("/issue/count.do", (req, res, params) => {
    App.validator({
        user: {
            validator: msgSet => {
                if (App.cacheContain(currentLogin)) {
                    msgSet.add(loginRoute);
                    params.user = App.cacheGet(currentLogin).id;
                    return true;
                } else {
                    return false;
                }
            }
        }
    }, params, (valid, msg) => {
        if (valid) {
            try {
                let sql = `select * from ${dbTables.classify.tableName} where user=${params.user} order by name `;
                sqliteDB.queryData(sql, data => {
                    App.responseData(res, data);
                });
            } catch (e) {
                App.responseError(res, '执行失败');
            }
        } else {
            App.responseError(res, msg);
        }
    })
});

/** 图片上传 */
App.route("/upload.do", (req, res, params) => {
    // 去掉上传的文件的文件数据，否则后续的转换可能会出错，因为转换成json的时候，你一个文件怎么去转。
    params.file = null;
    // 注意，文件的上传是服务器中完成的，此处会返回文件的新名称，字段为 fileName
    App.responseData(res, params);
});

/** 启动服务 */
App.start(3100, () => {
    dbTables.sys_user.create();
    dbTables.classify.create();
    dbTables.notes.create();
});

