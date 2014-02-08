var assert = require('assert');
var Machine = require('../lib/machine');

describe('Machine', function () {
    beforeEach(function () {
        this.machine = new Machine();

        this.states = [
            this.machine.add(['foo']),
            this.machine.add(['foo', 'bar']),
            this.machine.add(['foo', 'baz']),
            this.machine.add(['foo', 'baz', 'qux']),
            this.machine.add(['quux'])
        ];
    });

    describe('#add', function () {
        it('creates state hierarchy', function () {
            assert.equal(this.states[1].parent, this.states[0]);
            assert.equal(this.states[0].parent, this.machine.root);
        });
    });

    describe('#ancestor', function () {
        it('returns common ancestor for two given states', function () {
            assert.ok(this.machine.ancestor(this.states[1], this.states[3]) === this.states[0]);
            assert.ok(this.machine.ancestor(this.states[1], this.states[4]) === this.machine.root);
        });
    });

    describe('#between', function () {
        it('returns states between to given states', function () {
            var states = this.machine.between(this.states[0], this.states[3]);

            assert.equal(states.length, 2);
            assert.ok(states[0] === this.states[2]);
            assert.ok(states[1] === this.states[3]);
        });
    });
});