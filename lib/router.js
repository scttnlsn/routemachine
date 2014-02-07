var async = require('async');
var equals = require('equals');
var Matcher = require('./matcher');

try {
    var Emitter = require('emitter');
} catch (err) {
    var Emitter = require('emitter-component');
}

module.exports = Router;

function Router() {
    this.matcher = new Matcher();
    this.current = [];
}

Emitter(Router.prototype);

Router.prototype.define = function (callback) {
    var self = this;
    var routes = [];

    function define(prefix, callback) {
        function route(part, callback) {
            var path = prefix + part;

            function to(handler, callback) {
                if (typeof handler === 'function') handler = { exec: handler };
                
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

    this.emit('navigate', path);

    var groups = group(this.current, handlers);

    async.eachSeries(groups.exiting, exit, function () {
        async.eachSeries(groups.entering, enter, function () {
            var last = groups.all[groups.all.length - 1];
            if (last.cancelled) return;

            if (groups.entering.length === 0) {
                last.context.intermediate = false;
                last.handler.exec.call(last.context);
            }

            self.current = groups.all;
        });
    });
};

// Helpers
// ---------------

function group(from, to) {
    var index = 0;
    var limit = Math.min(from.length, to.length);

    while (index < limit) {
        if (!equals(from[index].params, to[index].params)) break;
        if (from[index].handler !== to[index].handler) break;
        index++;
    }

    var exiting = from.slice(index);
    var entering = to.slice(index);
    var all = from.slice(0, index).concat(entering);

    // Setup hierarchical contexts

    var context = {
        intermediate: true,
        cancelled: false,
        cancel: function () {
            this.cancelled = true;
        }
    };

    if (index > 0) context = from[index - 1].context;

    entering.forEach(function (item, i) {
        context = item.context = Object.create(context);
        if (i === entering.length - 1) context.intermediate = false;
    });

    return {
        exiting: exiting.reverse(),
        entering: entering,
        all: all
    };
}

function enter(item, callback) {
    var context = item.context;
    context.params = item.params;
    var handler = item.handler;

    function exec() {
        handler.exec.call(context);
        callback();
    }

    if (context.cancelled) return callback();
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

    if (context.cancelled) return callback();
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