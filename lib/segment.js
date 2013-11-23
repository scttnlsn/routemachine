try {
    var escape = require('escape-regexp');
} catch (err) {
    var escape = require('escape-regexp-component');
}

module.exports = Segment;

function Segment(type, value) {
    this.type = type;
    types[this.type].call(this, value);
}

Segment.parse = function (str) {
    return parse.dynamic(str) || parse.wildcard(str) || parse.static(str);
};

Segment.create = function (type, value) {
    this.cache || (this.cache = {});
    this.cache[type] || (this.cache[type] = {});

    var segment = this.cache[type][value];
    if (!segment) {
        segment = new Segment(type, value);
        this.cache[type][value] = segment;
    }

    return segment;
};

Segment.prototype.match = function (value) {
    var re = new RegExp('^' + this.regex + '$');
    return !!re.exec(value);
};

// Types
// ---------------

var types = {};

types.static = function (value) {
    this.value = value;
    this.regex = escape(this.value);
    this.repeatable = false;
    this.name = null;

    this.generate = function (params) {
        return this.value;
    };
};

types.dynamic =  function (value) {
    this.name = value;
    this.regex = '([^/]+)';
    this.repeatable = false;

    this.generate = function (params) {
        return params[this.name];
    };
};

types.wildcard = function (value) {
    this.name = value;
    this.regex = '(.+)';
    this.repeatable = true;

    this.generate = function (params) {
        return params[this.name];
    };
};

// Parse
// ---------------

var parse = {};

parse.static = function (str) {
    if (str !== '') return Segment.create('static', str);
};

parse.dynamic = function (str) {
    var match = str.match(/^:([^\/]+)$/);
    if (match) return Segment.create('dynamic', match[1]);
};

parse.wildcard = function (str) {
    var match = str.match(/^\*([^\/]+)$/);
    if (match) return Segment.create('wildcard', match[1]);
};