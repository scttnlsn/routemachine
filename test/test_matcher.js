var assert = require('assert');
var Matcher = require('../lib/matcher');

describe('Matcher', function () {
    beforeEach(function () {
        this.matcher = new Matcher();
    });

    it('matches static paths', function () {
        var value = {};
        this.matcher.add('/foo/bar', value);
        
        var match = this.matcher.match('/foo/bar');
        assert.equal(match.value, value);

        assert.equal(this.matcher.match('/foo/baz'), null);
    });

    it('matches dynamic paths', function () {
        var value = {};
        this.matcher.add('/foo/:bar', value);

        var match = this.matcher.match('/foo/123');
        assert.equal(match.value, value);
        assert.deepEqual(match.params.bar, '123');
    });

    it('matches wildcard paths', function () {
        var value = {};
        this.matcher.add('/foo/:bar/*', value);

        var match = this.matcher.match('/foo/1/2/3');
        assert.equal(match.value, value);
        assert.equal(match.params.bar, '1');
        assert.equal(match.params[0], '2/3');
    });
});