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
    var handlers = this.match(path);

    for (var i = 0; i < this.current.length && handlers[i].handler === this.current[i].handler; i++);

    handlers.slice(i).forEach(function (handler) {
        handler.handler.exec.call(handler.handler, handler.params);
    });

    this.current = handlers;
};