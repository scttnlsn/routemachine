var async = require('async');

module.exports = Transition;

function Transition(machine, from, to) {
    this.machine = machine;
    this.from = from;
    this.to = to;

    if (this.from === this.to) {
        this.exit = [this.from];
        this.enter = [this.to];
    } else if (this.from) {
        var lcm = this.machine.ancestor(to, this.from);
        this.exit = this.machine.between(lcm, this.from).reverse();
        this.enter = this.machine.between(lcm, this.to);
    } else {
        this.exit = [];
        this.enter = this.machine.between(null, this.to);
    }
}

Transition.prototype.before = function () {
    var handler = this.to.handler;
    if (handler.before) return handler.before.call(handler.ctx);
};

Transition.prototype.run = function (callback) {
    var self = this;

    var stop = this.before();
    if (stop) return false;

    async.eachSeries(self.exit, exit, function () {
        async.eachSeries(self.enter, enter, function () {
            self.to.handler.exec.call(self.to.ctx);
            callback();
        });
    });

    return true;
};

// Helpers
// ---------------

function exit(state, callback) {
    var handler = state.handler;
    if (!handler.exit) return callback();

    if (handler.exit.length === 0) {
        // Sync
        handler.exit.call(state.ctx);
        callback();
    } else {
        // Async
        handler.exit.call(state.ctx, callback);
    }
}

function enter(state, callback) {
    var handler = state.handler;
    if (!handler.enter) return callback();

    if (handler.enter.length === 0) {
        // Sync
        handler.enter.call(state.ctx);
        callback();
    } else {
        // Async
        handler.enter.call(state.ctx, callback);
    }
}