var Segment = require('./segment');
var State = require('./state');

module.exports = Matcher;

function Matcher() {
    this.root = new State();
    this.routes = [];
    this.named = {};
}

Matcher.prototype.add = function (routes, options) {
    var state = this.root;
    var results = [];

    var handlers = routes.map(function (route) {
        var names = [];
        var segments = segment(route.path, names);

        results = results.concat(segments);

        segments.forEach(function (segment) {
            state = state.add(segment);
        });

        return { handler: route.handler, names: names };
    });

    state.handlers = handlers;

    if (options && options.name) {
        this.named[options.name] = { handlers: handlers, segments: results };
    }
};

Matcher.prototype.match = function (path) {
    var states = walk(this.root, path);
    var accepted = states.filter(function (state) {
        return !!state.handlers;
    });

    sort(accepted);

    var state = accepted[0];
    if (!state) return null;

    return handlers(state, path);
};

Matcher.prototype.route = function (name) {
    var route = this.named[name];
    if (!route) throw new Error('No named route: ' + name);
    return route;
};

Matcher.prototype.generate = function (name, params) {
    var route = this.route(name);

    return route.segments.reduce(function (result, segment) {
        return result + '/' + segment.generate(params);
    }, '');
};

Matcher.prototype.handlers = function (name) {
    return this.route(name).handlers;
};

// Helpers
// ---------------

function split(path) {
    if (path[0] === '/') path = path.slice(1);
    return path.split('/');
}

function segment(path, names) {
    var segments = split(path);
    var results = [];

    segments.forEach(function (segment) {
        var match;

        if (match = segment.match(/^:([^\/]+)$/)) {
            var name = match[1];
            results.push(Segment.create('dynamic', name))
            names.push(name);
        } else if (match = segment.match(/^\*([^\/]+)$/)) {
            var name = match[1];
            results.push(Segment.create('wildcard', name));
            names.push(name);
        } else if (segment !== '') {
            results.push(Segment.create('static', segment));
        }
    });

    return results;
}

// Sort a list of states: static < dynamic < wildcard
function sort(states) {
    states.sort(function (s1, s2) {
        var c1 = s1.counts();
        var c2 = s2.counts();

        if (c1.wildcard !== c2.wildcard) return c1.widlcard - c2.wildcard;
        if (c1.dynamic !== c2.dynamic) return c1.dynamic - c2.dynamic;
        if (c1.static !== c2.static) return c1.static - c2.static;

        return 0;
    });
}

// Recursively walk a graph of states returning an ordered
// list of states that match the given path.
function walk(root, path) {
    function next(states, str) {
        var results = [];

        states.forEach(function (state) {
            results = results.concat(state.match(str));
        });

        return results;
    }

    var states = [root];

    split(path).forEach(function (str) {
        states = next(states, str);
    });

    return states;
}

function handlers(state, path) {
    var match = state.regex().exec(path);
    var i = 1;

    return state.handlers.map(function (handler) {
        var params = {};

        handler.names.forEach(function (name) {
            params[name] = match[i++];
        });

        return { handler: handler.handler, params: params };
    });
}