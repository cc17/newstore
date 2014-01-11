/**
 * Created by pc on 13-12-25.
 */
define("src/js/libs/cache", [], function(require, exports) {
    var storage = window.localStorage;
    var fStore = {};
    var JSON = window.JSON;
    var adapter = storage && JSON ? {
        setItem: function(key, data) {
            return storage.setItem(key, JSON.stringify(data));
        },
        getItem: function(key) {
            var str = storage.getItem(key);
            if (str) {
                return JSON.parse(str);
            }
            return null;
        },
        removeItem: function(key) {
            return storage.removeItem(key);
        }
    } : {
        setItem: function(key, data) {
            return fStore[key] = data;
        },
        getItem: function(key) {
            if (typeof fStore[key] !== "undefined") {
                return fStore[key];
            }
            return null;
        },
        removeItem: function(key) {
            fStore[key] = null;
            return delete fStore[key];
        }
    };
    function set(key, data, ttl) {
        var obj = {
            data: data
        };
        if (ttl) {
            obj.expired = new Date().getTime() + ttl * 1e3;
        }
        return adapter.setItem(key, obj);
    }
    function get(key) {
        var obj = adapter.getItem(key);
        if (obj) {
            if (obj.expired && obj.expired < new Date().getTime()) {
                return;
            }
            return obj.data;
        }
    }
    function del(key) {
        return adapter.removeItem(key);
    }
    return {
        set: set,
        get: get,
        del: del
    };
});