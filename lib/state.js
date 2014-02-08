module.exports = State;

function State(children, id) {
    this.children = children || [];
    this.id = id

    for (var i = 0; i < this.children.length; i++) {
        this.children[i].parent = this;
    }
}

State.prototype.path = function () {
    var state = this;
    var path = [];

    while (state.parent) {
        path.push(state.id);
        state = state.parent;
    }

    path.push(state.id);
    return path.reverse();
};

State.prototype.walk = function (fn) {
    var stop = fn(this);
    if (stop) return true;

    for (var i = 0; i < this.children.length; i++) {
        var child = this.children[i];
        var stop = child.walk(fn);
        if (stop) return true;
    }
};

State.prototype.find = function (id) {
    var found = null;

    this.walk(function (state) {
        if (state.id === id) {
            found = state;
            return true
        }
    });

    return found;
};

State.prototype.add = function (child) {
    child.parent = this;
    this.children.push(child);
};