var Machine = require('./machine');
var Matcher = require('./matcher');
var Transition = require('./transition');

try {
    var Emitter = require('emitter');
} catch (err) {
    var Emitter = require('emitter-component');
}

module.exports = Router;

function Router() {
    this.reset();
}

Emitter(Router.prototype);

Router.prototype.reset = function () {
    this.machine = new Machine();
    this.matcher = new Matcher();
    this.state = null;
};

Router.prototype.add = function (path, handler) {
    var state = this.machine.add(path.slice(), handler);
    if (handler.url) this.matcher.add(handler.url, state);
};

Router.prototype.define = function (prefix, fn) {
    var self = this;

    if (fn === undefined) {
        fn = prefix;
        prefix = [];
    }

    var define = function (name, handler, fn) {
        var path = prefix.concat([name]);
        self.add(path, handler);
        if (fn) self.define(path, fn);
    };

    fn({ define: define });
};

Router.prototype.navigate = function (url) {
    var self = this;
    var match = this.matcher.match(url);
    if (!match) return false;

    var state = match.value;
    var params = match.params;
    state.ctx.params = params;
    
    var transition = new Transition(this.machine, this.state, state);
    transition.run(function () {
        self.state = state;
        self.emit('navigate', url);
    });

    return true;
};