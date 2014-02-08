var State = require('./state');

var sep = '/';

module.exports = Machine;

function Machine() {
    this.root = new State([], sep);
    this.root.ctx = {};
}

Machine.prototype.add = function (path, handler) {
    var name = path.pop();

    var pid = sep + path.join(sep);
    var sid = sep + path.concat([name]).join(sep);

    var parent = this.root.find(pid);
    if (!parent) throw new Error('No parent state: ' + name);

    var state = new State([], sid);
    state.handler = handler;
    state.ctx = Object.create(parent.ctx);
    parent.add(state);
    
    return state;
};

Machine.prototype.ancestor = function (x, y) {
    if (!x || !y) return this.root;
    
    var px = x.path();
    var py = y.path();

    var n = Math.min(px.length, py.length);
    var id = null;

    for (var i = 0; i < n; i++) {
        if (px[i] == py[i]) {
            id = px[i];
        } else {
            break;
        }
    }

    return this.root.find(id);
};

Machine.prototype.between = function (from, to) {
    from || (from = this.root);
    
    var states = [];
    var current = this.root.find(to.id);

    while (current.id !== from.id) {
        states.push(current);
        current = current.parent;
    }

    return states.reverse();
};