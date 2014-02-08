try {
    var Route = require('route');
} catch (err) {
    var Route = require('route-component');
}

module.exports = Matcher;

function Matcher() {
    this.items = [];
}

Matcher.prototype.add = function (url, value) {
    var route = new Route(url);
    this.items.push({ route: route, value: value });
};

Matcher.prototype.match = function (url) {
    for (var i = 0; i < this.items.length; i++) {
        var item = this.items[i];
        var params = item.route.match(url);
        if (params) return { value: item.value, params: params };
    }

    return null;
};