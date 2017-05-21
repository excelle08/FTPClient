/**
 * Created by Excelle on 2/22/16.
 */

function _ajax(method, url, data, callback) {
    jQuery.ajax({
        type: method,
        url: url,
        data: data,
        dataType: 'json'
    }).done(function(r) {
        if (r && (r.message || r.error)) {
            return callback && callback(r);
        }
        return callback && callback(null, r);
    }).fail(function(jqXHR, textStatus) {
        try {
            data = JSON.parse(jqXHR.responseText);
            return callback && callback(data);
        } catch (ex) {
            return callback && callback({
                error: 'HTTP ' + jqXHR.status,
                message: 'Network error (HTTP ' + jqXHR.status + ')'
            });
        }
    });
}

function postApi(url, data, callback) {
    if (arguments.length === 2) {
        callback = data;
        data = {};
    }
    _ajax('POST', url, data, callback);
}

function getApi(url, data, callback) {
    if (arguments.length === 2) {
        callback = data;
        data = {};
    }

    _ajax('GET', url, data, callback);
}

function putApi(url, data, callback) {
    if (arguments.length === 2) {
        callback = data;
        data = {};
    }

    _ajax('PUT', url, data, callback);
}

function putRawData(url, data, callback) {
    rawApi('PUT', url, data, callback);
}

function deleteApi(url, data, callback) {
    if (arguments.length === 2) {
        callback = data;
        data = {};
    }

    _ajax('DELETE', url, data, callback);
}

function patchApi(url, data, callback) {
    if (arguments.length === 2) {
        callback = data;
        data = {};
    }

    _ajax('PATCH', url, data, callback);
}

function jsonApi(method, url, object, callback) {
    jQuery.ajax({
        type: method,
        url: url,
        data: JSON.stringify(object),
        contentType: 'application/json',
        dataType: 'json'
    }).done(function (r) {
        if (r && (r.message || r.error)) {
            return callback && callback(r);
        }
        return callback && callback(null, r);
    }).fail(function (jqXHR, textStatus) {
        return callback && callback({
                error: 'HTTP ' + jqXHR.status,
                message: 'Network error - HTTP ' + jqXHR.status
            });
    });
}

function rawApi(method, url, data, callback) {
    jQuery.ajax({
        type: method,
        url: url,
        data: data,
        contentType: 'application/octet-stream',
        dataType: 'text'
    }).done(function (r) {
        if (r && (r.message || r.error)) {
            return callback && callback(r);
        }
        return callback && callback(null, r);
    }).fail(function (jqXHR, textStatus) {
        return callback && callback({
                error: 'HTTP ' + jqXHR.status,
                message: 'Network error - HTTP ' + jqXHR.status
            });
    });
}

function isNothing(obj) {
    return !Object.keys(obj).length;
}

function getArgs() {
    var queryStr = window.location.search.substring(1);
    var s = queryStr.split('&');
    var args = {};
    for(var i = 0; i < s.length; i ++) {
        var kv = s[i].split('=');
        args[kv[0]] = kv[1];
    }

    return args;
}

function showError(message, id) {
    var obj = id ? $('#' + id) : $('.alert-danger');
    obj.removeClass('hidden');
    obj.text(message).show();
}

function showSuccess(message, id) {
    var obj = id ? $('#' + id) : $('.alert-success');
    obj.removeClass('hidden');
    obj.text(message).show();
}

function toDateTime(ts) {
    var date = new Date(ts * 1000);
    return [date.getFullYear().toString(), '-', date.getMonth().toString(), '-', date.getDate().toString(),
        ' ', date.getHours().toString(), ':', date.getMinutes().toString(), ':', date.getSeconds().toString()].join('');
}

function reloadArray (target, data) {
    target.splice(0, target.length);
    for(var i in data) {
        target.push(data[i]);
    }
}

function roundUp (number, precision) {
    if (!precision) {
        precision = 100;
    }
    return Math.round(number * precision) / precision;
}