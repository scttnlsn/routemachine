module.exports = State;

function State(segment) {
    this.segment = segment;
    this.next = [];
    this.previous = null;
}

State.prototype.add = function (segment) {
    var state = this.next.filter(function (state) {
        return state.segment === segment;
    })[0];

    // Return existing state
    if (state) return state;

    // Add and return new state
    var state = new State(segment);
    state.previous = this;
    this.next.push(state);
    return state;
};

State.prototype.match = function (part) {
    var states = [].concat(this.next);

    if (this.segment && this.segment.repeatable) states.push(this);

    return states.filter(function (state) {
        return state.segment.match(part);
    });
};

State.prototype.walk = function (callback) {
    // Skip root state
    if (this.previous) {
        this.previous.walk(callback);
        callback(this);
    }
};

State.prototype.counts = function () {
    var counts = { static: 0, dynamic: 0, wildcard: 0 };
    
    this.walk(function (state) {
        counts[state.segment.type]++;
    });

    return counts;
};

State.prototype.regex = function () {
    var regex = '';

    this.walk(function (state) {
        regex += ('/' + state.segment.regex);
    });

    return new RegExp('^' + regex + '$');
};