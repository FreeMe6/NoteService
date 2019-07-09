/*
 * import {jsonGetData, jsonPostData, jsonPostData, jsonPostLocalData} from 'ajax.js'
 *
 */

/**
 *
 * @param {*} url
 * @param {*} params
 * @param {*} callback
 */
function jsonGetData(url, params, callback) {
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        data: params,
        success: function (data) {
            console.debug(data);
            callback(data);
        },
        error: function (e) {
            if (e) console.log(e);
        }
    });
}

/**
 *
 * @param {*} url
 * @param {*} params
 * @param {*} callback
 */
function jsonPostData(url, params, callback) {
    $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(params),
        success: function (data) {
            console.debug(data);
            callback(data);
        },
        error: function (e) {
            if (e) console.log(e);
        }
    });
}

/**
 * 将本地文件中的请求，转发成localhost的请求
 *
 * @param url
 * @param port
 * @returns {string}
 */
function localUrl(url, port) {
    port = port ? ':' + port : '';
    return `http://localhost${port}${url}`
}

/**
 * 基本本地文件的模拟请求
 * @param url
 * @param params
 * @param callback
 * @param conf 配置项
 * {
 *      port: 本地模拟的请求的端口
 * }
 */
function jsonGetLocalData(url, params, callback, conf) {
    $.ajax({
        url: localUrl(url, conf.port),
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        // 此处设置额外的模拟的请求头信息
        beforeSend: function(request) {
            request.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
            // request.setRequestHeader('Accept-Encoding', 'gzip, deflate');
            request.setRequestHeader('Accept-Language', 'zh-CN,zh;q=0.9');
        },
        data: params,
        success: function (data) {
            console.debug(data);
            callback(data);
        },
        error: function (e) {
            if (e) console.log(e);
        }
    });
}
/**
 * 基本本地文件的模拟请求
 * @param url
 * @param params
 * @param callback
 * @param conf 配置项
 * {
 *      port: 本地模拟的请求的端口
 * }
 */
function jsonPostLocalData(url, params, callback, conf) {
    $.ajax({
        url: localUrl(url, conf.port),
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        // 此处设置额外的模拟的请求头信息
        beforeSend: function(request) {
            request.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
            // request.setRequestHeader('Accept-Encoding', 'gzip, deflate');
            request.setRequestHeader('Accept-Language', 'zh-CN,zh;q=0.9');
        },
        data: JSON.stringify(params),
        success: function (data) {
            console.debug(data);
            callback(data);
        },
        error: function (e) {
            if (e) console.log(e);
        }
    });
}

/**
 * 获取返回结果中的数据
 * @param d
 * @returns {*}
 */
function getResultData(d) {
    return d.data && d.data.length > 0 ? d.data : [];
}

/**
 * 获取返回一条结果的数据
 * @param d
 * @returns {undefined}
 */
function getOneResultData(d) {
    return d.data && d.data.length > 0 ? d.data[0] : undefined;
}

/**
 * 兼容之前的请求
 * @type {{post(*=, *=, *, *): void, get(*=, *=, *, *): void}}
 * @private
 */
const _aj_ = {
    get(url, params, callback) {
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            data: params,
            success: function (data) {
                console.debug(data);
                callback(data);
            },
            error: function (e) {
                if (e) console.log(e);
            }
        });
    },
    post(url, params, callback) {
        $.ajax({
            url: url,
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(params),
            success: function (data) {
                console.debug(data);
                callback(data);
            },
            error: function (e) {
                if (e) console.log(e);
            }
        });
    }
};
