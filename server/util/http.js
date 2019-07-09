const _http_ = require('http');
const _url_ = require('url');
const _formidable = require('formidable');
const _fs = require('fs');
const path = require('path');
const __S = {
    actions: new Map(),
    cachePool: new Map()
};

/**
 * 从map缓存中添加
 */
exports.cacheAdd = function cacheAdd(key, value) {
    console.debug('add cache of key[' + key + ']');
    __S.cachePool.set("" + key, value);
};

/**
 * 从map缓存中获取
 */
exports.cacheGet = function cacheGet(key) {
    console.debug('load cache of key[' + key + ']');
    return __S.cachePool.get("" + key);
};

/**
 * 从map缓存中删除
 */
exports.cacheRemove = function cacheRemove(key) {
    if (__S.cachePool.has("" + key)) {
        console.debug('remove cache of key[' + key + ']');
        __S.cachePool.delete("" + key);
    }
};

/**
 * 从map缓存中检查，是否包含
 */
exports.cacheContain = function (key) {
    return __S.cachePool.has("" + key);
};

// 规则参数列表，目前仅仅支持者几个校验规则
const ruleParams = {required: 'required', max: 'max', min: 'min', message: 'message', validator: 'validator'};

/**
 * 返回错误信息 {msg: ?, state: 'error', ot: ''}
 */
exports.responseError = function(res, msg, ot) {
    res.writeHead(200, { "Content-Type": "application/json;charset=utf-8" });
    // res.statusCode = 200;
    res.end(JSON.stringify({
        state: 'error',
        msg: msg,
        ot: ot
    }));
};

/**
 * 返回警告信息 {msg: ?, state: 'warning', ot: '', ts: ''}
 * @param res
 * @param msg
 * @param ot
 */
exports.responseWarning = function(res, msg, ot) {
    res.writeHead(200, { "Content-Type": "application/json;charset=utf-8" });
    // res.statusCode = 200;
    res.end(JSON.stringify({
        state: 'warning',
        msg: msg,
        ot: ot,
        ts: new Date().getTime()
    }));
};

/**
 * 返回空内容的正常相应 (204)
 */
exports.responseEmpty = function(res) {
    res.statusCode = 204;
    res.end(null);
};

/**
 * 返回空内容的正常相应 { msg: '404 Not Found', state: "error" }
 */
exports.responseNotFound = function(res) {
    res.statusCode = 404;
    res.end(JSON.stringify({ msg: '404 Not Found', state: "error" }));
};

/**
 * 返回正常相应消息 {msg: ?, state: 'success', ot: '', ts: ''}
 */
exports.responseOk = function(res, msg, ot) {
    res.writeHead(200, { "Content-Type": "application/json;charset=utf-8" });
    // res.statusCode = 200;
    res.end(JSON.stringify({
        state: 'success',
        msg: msg,
        ot: ot,
        ts: new Date().getTime()
    }));
};

/**
 * 返回正常响应的数据 {data: ?, state: 'success', ot: '', ts: ''}
 */
exports.responseData = function(res, data, msg, ot) {
    res.writeHead(200, { "Content-Type": "application/json;charset=utf-8" });
    res.statusCode = 200;
    res.end(JSON.stringify({
        state: 'success',
        msg: msg,
        data: data,
        ot: ot,
        ts: new Date().getTime()
    }));
};

 /**
  * 校验参数(支持部分规则：['required','max','min','validator'])
  * @param {*} rule 
  * @param {*} params 
  *  @param {*} callback (b_result,msg)
  */
exports.validator = function (rule, params ,callback) {

    let fg = true,
        msgSet = new Set(),
        keys = [];

    if (rule) {
        keys = Object.keys(rule);
        if(keys.length < 1) {
            callback(fg, undefined);
            return;
        }

        keys.forEach(key => {
            if(fg) {
                let v = params[key], r = rule[key], vd;

                vd = r[ruleParams.required];
                if(vd) {
                    if (v==='' || v === undefined || v === null) {
                        msgSet.add(`[${key}]参数是必填的项`);
                        fg &= false;
                    }
                }

                vd = r[ruleParams.max];
                if(vd!==undefined || vd!==null) {
                    if (v && v.length > vd) {
                        msgSet.add(`[${key}]参数最大长度为${vd}`);
                        fg &= false;
                    }
                }

                vd = r[ruleParams.min];
                if(vd!==undefined || vd!==null) {
                    if (v && v.length < vd) {
                        msgSet.add(`[${key}]参数最小长度为${vd}`);
                        fg &= false;
                    }
                }

                vd = r[ruleParams.validator];
                if(vd) {
                    //如果有自定的校验
                    fg &= vd(msgSet);
                }
            }
        });
    }

    callback(fg, msgSet.size >0 ? [... msgSet.values()]: undefined);
};

/**
 * 将string参数为空（null，undefined，‘’），返回 null，不为空则格式化后返回
 */
exports.isEmptyToNull = function (p) {
    return p && p.length <1 ? null : p ? p : null;
};

/**
 * port : 服务端口
 * done : 完成创建之后执行的回调
 * fOps : 配置处理Options请求的请求头的配置，不配置则采用默认配置
 */
exports.start = function (port, done, fOps) {
    const SF = this;
    const host = 'localhost';
    port = port ? port : '8888';

     // 仅仅内部使用
    const responseNotFound = function(res) {
        res.statusCode = 404;
        res.end(JSON.stringify({ msg: '404 Not Found', state: "error" }));
    };

    // 仅仅内部使用
    const responseEmpty = function(res) {
        res.statusCode = 204;
        res.end(null);
    };

    // show router supply
    console.log(__S.actions);

    _http_.createServer((req, res) => {})
        .listen(port, host, () => {
            console.log(`Server running at http://${host}:${port}/`);
            if (done) done();
        })
        .on('request', (request, response) => {
            //必须监听error并处理，否则错误会中断node服务器运行，从而结束服务
            request.on('error', (err) => console.error(err.stack));

            // 从request中取方法和url
            const { method, url } = request;
            // 注意，最后的参数为 true 时，p中的query参数是一个对象，为 false 时候则是 原始参数串
            const p = _url_.parse(request.url, true);
            //请求头参数名必须小写
            const { headers } = request;
            const userAgent = headers['user-agent'];

            // 关于Options的不通过的原因是请求头不识别，或者没有权限
            if (request.method === 'OPTIONS') {
                if (fOps) {
                    fOps();
                } else {
                    response.setHeader("Access-Control-Allow-Origin", "*");
                    response.setHeader("Access-Control-Allow-Methods", "OPTIONS");
                    response.setHeader("Access-Control-Allow-Headers", "content-type");
                }

                // 此处需要对百度的图片上传的部分进行单独的OPTIONS的通过的设置
                if('/upload.do' === p.pathname) {
                    response.setHeader("Access-Control-Allow-Headers", "x-requested-with");
                }

                response.statusCode = 204;
                response.end();
                return;
            }

            // 正常的请求的处理
            response.setHeader('Access-Control-Allow-Origin', '*');
            response.setHeader('Access-Control-Allow-Methods', 'PUT,POST');
            // response.setHeader('Access-Control-Allow-Credentials', 'true');

            // 不缓存
            response.setHeader("cache-control", "no-cache");
            // 设置返回的内容的格式(这里已经设置一个json格式的，后续的不需要再添加？)
            response.setHeader("content-type", "application/json; charset=utf-8");
            let time = new Date().getTime();
            response.setHeader("etag", "" + time);
            response.setHeader("User-Agent", "" + userAgent);

            /** 此处是打印一下请求的信息，好方便于检测 */
            console.log(`${request.method} | ${request.url} | ContentType: ${headers['content-type']}`);

            if (url === "/favicon.ico") {
                responseNotFound(response);
                return;
            }
            // console.log(p);
            // 支持GET和POST请求
            if (method === "GET") {
                let func = __S.actions.get(p.pathname);
                if (func) {
                    func(request, response, p.query);
                } else {
                    responseNotFound(response);
                }
            } else if (method === "POST") {
                // 采用中间件来实现post的处理，自行处理不方便处理图片和文件，所以对于非纯文本的，最好采用中间件
                // console.log(__dirname) # 查看当前的路径信息
                const form = new _formidable.IncomingForm();
                // 注意，此处的指定的目录必须存在，否则会报错的！
                form.uploadDir = path.join(__dirname,'imgs');
                form.parse(request,function(err,fields,files){
                    if(err) console.error(err);
                    // 此处如果发现有上传的文件，则将上传的文件进行处理
                    if (files.file) {
                        // 修改文件的名称
                        var oldpath = files.file.path;//其中的photo的名称就是表单提交的name属性的名称
                        var newpath = path.join(path.dirname(oldpath),files.file.lastModifiedDate.getTime()+".png");
                        _fs.rename(oldpath,newpath,(err)=>{
                            if(err) console.error(err);
                        });
                        fields.fileName = files.file.lastModifiedDate.getTime()+".png";
                    }
                    
                    // 调用路由配对的执行任务
                    let func = __S.actions.get(p.pathname);
                    if (func) {
                        func(request, response, fields);
                    } else {
                        responseNotFound(response);
                    }
                });
            } else {
                // empty return of unkonw request
                responseEmpty(response);
            }
        });
};

/**
 * 添加路由规则
 * @param {*} url 
 * @param {*} callback 
 */
exports.route = (url, callback) => {
    __S.actions.set(url, callback);
};

/**
 * 获取数字 Id
 * @returns {number}
 */
exports.gId = () => {
    const date = new Date();
    return parseInt(`${date.getFullYear()}${(date.getMonth() + 1)}${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}`);
};

// function getfavicon (res) {
//     let file = '../favicon.icon';
//     if(_fs.existsSync(file)) {
//         res.writeHead(200, {
//             'Content-Type': 'application/octet-stream'
//         });
//         let readStream = _fs.createReadStream(file);//得到文件输入流
//         readStream.on('data', (chunk) => {
//             res.write(chunk, 'binary');//文档内容以二进制的格式写到response的输出流
//         });
//         readStream.on('end', () => {
//             res.end();
//         })
//     } else {
//         console.log(`not exists '${file}' !`);
//         res.writeHead(204, {});
//         res.end();
//     }
// }

/*
开发备注：
1） 由于图片在文章主体中，一般情况是考虑部署，那么其中的图片的地址采用绝对定位的方式加nginx代理即可方便的实现
2） 受限于资料的转移，或者服务器的地址和端口的变更，采用绝对地址的方式比直接将全地址放进去肯定更好；
3） 如果是完全的独立的，不需要任何服务器代理，相对地址是最好的，此时，服务器方需要规定存储位置；
4） 如果是考虑采用后端的读取图片的数据，这个对于非内容嵌套的情况下是很好的，但是像我们的文本的开发则不算很好，除非你的
数据需要特殊处理，每次将其中的图片的链接进行转换处理；
 */