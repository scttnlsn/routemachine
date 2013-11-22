var assert = require('assert');
var Router = require('../lib/router');

describe('Router', function () {
    beforeEach(function () {
        this.router = new Router();
    });

    it('matches multiple routes', function () {
        var h = [{}, {}];

        this.router.define(function (route) {
            route('/foo').to(h[0]);
            route('/foo/:bar').to(h[1]);
        });

        var m1 = this.router.match('/foo');
        assert.deepEqual(m1, [{ handler: h[0], params: {}}]);
        var m2 = this.router.match('/foo/123');
        assert.deepEqual(m2, [{ handler: h[1], params: { bar: '123' }}]);
    });

    it('matches nested routes', function () {
        var h = [{}, {}];

        this.router.define(function (route) {
            route('/foo', function (route) {
                route('/').to(h[0]);
                route('/:bar').to(h[1]);
            });
        });

        var m1 = this.router.match('/foo');
        assert.deepEqual(m1, [{ handler: h[0], params: {}}]);
        var m2 = this.router.match('/foo/123');
        assert.deepEqual(m2, [{ handler: h[1], params: { bar: '123' }}]);
    });

    it('matches nested handlers', function () {
        var h = [{}, {}, {}, {}, {}];

        this.router.define(function (route) {
            route('/foo').to(h[0], function (route) {
                route('/bar').to(h[1], function (route) {
                    route('/').to(h[3]);
                    route('/:baz').to(h[4]);
                });

                route('/:bar').to(h[2]);
            });
        });

        var m1 = this.router.match('/foo');
        assert.deepEqual(m1, [
            { handler: h[0], params: {}}
        ]);

        var m2 = this.router.match('/foo/bar');
        assert.deepEqual(m2, [
            { handler: h[0], params: {}},
            { handler: h[1], params: {}},
            { handler: h[3], params: {}}
        ]);

        var m3 = this.router.match('/foo/123');
        assert.deepEqual(m3, [
            { handler: h[0], params: {}},
            { handler: h[2], params: { bar: '123' }}
        ]);

        var m4 = this.router.match('/foo/bar/456');
        assert.deepEqual(m4, [
            { handler: h[0], params: {}},
            { handler: h[1], params: {}},
            { handler: h[4], params: { baz: '456' }}
        ]);
    });
});