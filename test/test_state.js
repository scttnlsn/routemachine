var assert = require('assert');
var State = require('../lib/state');

describe('State', function () {
    beforeEach(function () {
        this.state= new State([], 6);
        this.root = new State([
                new State([
                    new State([], 3),
                    new State([], 4)
                ], 2),
                new State([
                    this.state
                ], 5)
            ], 1);
    });

    describe('#path', function () {
        it('returns the path to the root', function () {
            assert.deepEqual(this.state.path(), [1, 5, 6]);
        });
    });

    describe('#walk', function () {
        it('walks the tree in order (dfs)', function () {
            var ids = [];

            this.root.walk(function (state) {
                ids.push(state.id);
            });

            assert.deepEqual(ids, [1, 2, 3, 4, 5, 6]);
        });
    });

    describe('#find', function () {
        it('returns state with given id', function () {
            assert.equal(this.root.find(6), this.state);
        });
    });

    describe('#add', function () {
        it('appends child state', function () {
            var parent = new State();
            var child = new State();

            parent.add(child);
            assert.equal(parent.children.length, 1);
            assert.equal(child.parent, parent);
        });
    });
});