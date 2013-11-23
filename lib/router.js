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
    if (handlers === null) return null;

    var groups = group(this.current, handlers);

    async.each(groups.exiting, exit, function () {
        async.each(groups.entering, enter, function () {
            self.current = groups.all;
        });
    });
};

// Helpers
// ---------------

function group(from, to) {
    var index = 0;
    while (index < from.length && from[index].handler === to[index].handler) {
        index++;
    }

    var exiting = from.slice(index);
    var entering = to.slice(index);
    var all = from.slice(0, index).concat(entering);

    // Setup hierarchical contexts

    var context = {};
    if (index > 0) context = from[index - 1].context;

    entering.forEach(function (item) {
        context = item.context = Object.create(context);
    });

    return {
        exiting: exiting.reverse(),
        entering: entering,
        all: all
    };
}

function enter(item, callback) {
    var context = item.context;
    var handler = item.handler;

    function exec() {
        handler.exec.call(context, item.params);
        callback();
    }

    if (!handler.enter) return exec();

    if (handler.enter.length === 0) {
        // Sync
        handler.enter.call(context);
        exec();
    } else {
        // Async
        handler.enter.call(context, exec);
    }
}

function exit(item, callback) {
    var context = item.context;
    var handler = item.handler;

    if (!handler.exit) return callback();
    
    if (handler.exit.length === 0) {
        // Sync
        handler.exit.call(context);
        callback();
    } else {
        // Async
        handler.exit.call(context, callback);
    }
}