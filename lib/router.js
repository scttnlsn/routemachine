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

Router.prototype.add = function (path, options) {
    var state = this.machine.add(path, options);
    if (options.url) this.matcher.add(options.url, state);
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