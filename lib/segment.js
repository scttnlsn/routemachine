var escape = require('escape-regexp');

module.exports = Segment;

function Segment(type, value) {
    this.type = type;
    this.value = value;
}

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
    var re = new RegExp('^' + this.regex() + '$');
    return !!re.exec(value);
};

Segment.prototype.regex = function () {
    switch (this.type) {
        case 'static': return escape(this.value);
        case 'dynamic': return '([^/]+)';
        case 'wildcard': return '(.+)';
        default: throw new Error('Invalid type: ' + type);
    }
};

Segment.prototype.generate = function (params) {
    switch (this.type) {
        case 'static':
            return this.value;
        case 'dynamic':
        case 'wildcard':
            return params[this.value];
        default:
            throw new Error('Invalid type: ' + type);
    }
};

Segment.prototype.repeatable = function () {
    return this.type === 'wildcard';
};