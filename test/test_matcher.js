var assert = require('assert');
var Matcher = require('../lib/matcher');

describe('Matcher', function () {
    beforeEach(function () {
        this.matcher = new Matcher();
    });

    it('matches static routes', function () {
        var h = {};
        this.matcher.add([{ path: '/foo/bar', handler: h }]);

        var params = this.matcher.match('/foo/bar');
        assert.deepEqual(params, [{ handler: h, params: {} }]);
        assert.equal(this.matcher.match('/foo/baz'), null);
    });

    it('matches dynamic routes', function () {
        var h = {};
        this.matcher.add([{ path: '/foo/:bar', handler: h }]);

        var match = this.matcher.match('/foo/123');
        assert.deepEqual(match, [{ handler: h, params: { bar: '123' }}]);
        assert.equal(this.matcher.match('/bar'), null);
    });

    it('matches wildcard routes', function () {
        var h = {};
        this.matcher.add([{ path: '/foo/*bar', handler: h }]);

        var match = this.matcher.match('/foo/1/2/3');
        assert.deepEqual(match, [{ handler: h, params: { bar: '1/2/3' }}]);
    });

    it('matches against multiple routes', function () {
        var h = [{}, {}];

        this.matcher.add([{ path: '/foo/:bar', handler: h[0] }]);
        this.matcher.add([{ path: '/baz/:qux', handler: h[1] }]);

        var m1 = this.matcher.match('/foo/123');
        assert.deepEqual(m1, [{ handler: h[0], params: { bar: '123' }}]);
        var m2 = this.matcher.match('/baz/456');
        assert.deepEqual(m2, [{ handler: h[1], params: { qux: '456' }}]);
    });

    it('matches overlapping routes', function () {
        var h = [{}, {}];

        this.matcher.add([{ path: '/foo/:bar', handler: h[0] }]);
        this.matcher.add([{ path: '/foo/bar/:baz', handler: h[1] }]);

        var m1 = this.matcher.match('/foo/123');
        assert.deepEqual(m1, [{ handler: h[0], params: { bar: '123' }}]);
        var m2 = this.matcher.match('/foo/bar/456');
        assert.deepEqual(m2, [{ handler: h[1], params: { baz: '456' }}]);
    });

    it('matches nested routes', function () {
        var h = [{}, {}];

        this.matcher.add([
            { path: '/foo/:bar', handler: h[0] },
            { path: '/baz/:qux', handler: h[1] }
        ]);

        var match = this.matcher.match('/foo/123/baz/456');
        assert.deepEqual(match, [
            { handler: h[0], params: { bar: '123' } },
            { handler: h[1], params: { qux: '456' } }
        ]);
    });

    it('matches empty routes', function () {
        var h = [{}, {}, {}, {}];

        this.matcher.add([
            { path: '/foo', handler: h[0] },
            { path: '/', handler: h[1] },
            { path: '/bar', handler: h[2] }
        ]);

        this.matcher.add([
            { path: '/foo', handler: h[0] },
            { path: '/', handler: h[1] },
            { path: '/:bar', handler: h[3] }
        ]);

        var m1 = this.matcher.match('/foo/bar');
        assert.deepEqual(m1, [
            { handler: h[0], params: {} },
            { handler: h[1], params: {} },
            { handler: h[2], params: {} }
        ]);

        var m2 = this.matcher.match('/foo/baz');
        assert.deepEqual(m2, [
            { handler: h[0], params: {} },
            { handler: h[1], params: {} },
            { handler: h[3], params: { bar: 'baz' }}
        ]);
    });

    it('gives preference to routes with fewer dynamic segments', function () {
        var h = [{}, {}];

        this.matcher.add([{ path: '/foo/:bar', handler: h[0] }]);
        this.matcher.add([{ path: '/foo/bar', handler: h[1] }]);

        var m1 = this.matcher.match('/foo/bar');
        assert.deepEqual(m1, [{ handler: h[1], params: {}}]);
        var m2 = this.matcher.match('/foo/baz');
        assert.deepEqual(m2, [{ handler: h[0], params: { bar: 'baz' }}]);
    });

    describe('', function () {
        beforeEach(function () {
            var h = this.h = [{}, {}, {}];

            this.matcher.add([{ path: '/foo', handler: h[0] }], { name: 'a' });
            this.matcher.add([{ path: '/foo/:bar', handler: h[1] }], { name: 'b' });
            this.matcher.add([{ path: '/foo', handler: h[0] }, { path: '/bar', handler: h[2] }], { name: 'c' });
        });

        it('returns paths for named routes', function () {
            assert.equal(this.matcher.generate('a'), '/foo');
            assert.equal(this.matcher.generate('b', { bar: '123' }), '/foo/123');
            assert.equal(this.matcher.generate('c'), '/foo/bar');
        });

        it('returns handlers for named routes', function () {
            var h1 = this.matcher.handlers('a');
            assert.deepEqual(h1, [{ handler: this.h[0], names: [] }]);

            var h2 = this.matcher.handlers('b');
            assert.deepEqual(h2, [{ handler: this.h[1], names: ['bar'] }]);

            var h3 = this.matcher.handlers('c');
            assert.deepEqual(h3, [{ handler: this.h[0], names: [] }, { handler: this.h[2], names: [] }]);
        });
    });
});