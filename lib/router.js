var async = require('async');
var Matcher = require('./matcher');

module.exports = Router;

function Router() {
    this.matcher = new Matcher();
    this.current = [];
}

Router.prototype.define = function (callback) {
    var self = this;
    var routes = [];

    function define(prefix, callback) {
        function route(part, callback) {
            var path = prefix + part;

            function to(handler, callback) {
                routes.push({ path: path, handler: handler });
                self.matcher.add(routes);

                if (callback) define('', callback);

                routes.pop();
            }

            if (callback) {
                define(path, callback);
            } else {
                return { to: to };
            }
        }

        callback(route);
    } 

    define('', callback);
};

Router.prototype.match = function (path) {
    return this.matcher.match(path);
};

Router.prototype.navigate = function (path) {
    var self = this;
    var handlers = this.match(path);
    var grouped = group(this.current, handlers);

    async.each(grouped.exiting, exit, function () {
        async.each(grouped.entering, enter, function () {
            self.current = handlers;
        });
    });
};

// Helpers
// ---------------

function group(before, after) {
    var index = 0;

    while (index < before.length && before[index].handler === after[index].handler) {
        index++;
    }

    return {
        exiting: before.slice(index),
        entering: after.slice(index)
    };
}

function enter(item, callback) {
    var handler = item.handler;

    function exec() {
        handler.exec.call(handler, item.params);
        callback();
    }

    if (!handler.enter) return exec();

    if (handler.enter.length === 0) {
        handler.enter.call(handler);
        exec();
    } else {
        handler.enter.call(handler, exec);
    }
}

function exit(item, callback) {
    var handler = item.handler;

    if (!handler.exit) return callback();
    
    if (handler.exit.length === 0) {
        // Sync
        handler.exit.call(handler);
        callback();
    } else {
        // Async
        handler.exit.call(handler, callback);
    }
}