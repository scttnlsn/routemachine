var assert = require('assert');
var sinon = require('sinon');
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

    describe('#navigate', function () {
        beforeEach(function () {
            var h = this.h = [handler(), handler(), handler(), handler()];

            this.router.define(function (route) {
                route('/foo').to(h[0], function (route) {
                    route('/:bar').to(h[1]);
                    route('/bar').to(h[2]);
                });

                route('/qux').to(h[3]);
            });
        });

        it('calls matching handlers', function () {
            this.router.navigate('/foo/123');

            assert.ok(this.h[0].exec.calledOnce);
            assert.deepEqual(this.h[0].exec.firstCall.thisValue.params, {});
            assert.ok(this.h[1].exec.calledOnce);
            assert.deepEqual(this.h[1].exec.firstCall.thisValue.params, { bar: '123' });
        });

        it('calls enter on each handler entered', function () {
            this.router.navigate('/foo/123');

            assert.ok(this.h[0].enter.calledOnce);
            assert.ok(this.h[1].enter.calledOnce);
        });

        it('does not call shared handlers more than once', function () {
            this.router.navigate('/foo/123');
            this.router.navigate('/foo/bar');

            assert.equal(this.h[0].enter.callCount, 1);
            assert.equal(this.h[0].exec.callCount, 1);
            assert.deepEqual(this.h[0].exec.firstCall.thisValue.params, {});
            assert.equal(this.h[1].enter.callCount, 1);
            assert.equal(this.h[1].exec.callCount, 1);
            assert.deepEqual(this.h[1].exec.firstCall.thisValue.params, { bar: '123' });
            assert.equal(this.h[2].enter.callCount, 1);
            assert.equal(this.h[2].exec.callCount, 1);
            assert.deepEqual(this.h[2].exec.firstCall.thisValue.params, {});
        });

        it('calls exit on unshared handlers', function () {
            this.router.navigate('/foo/123');
            this.router.navigate('/qux');

            assert.equal(this.h[1].exit.callCount, 1);
            assert.equal(this.h[0].exit.callCount, 1);
            assert.equal(this.h[3].enter.callCount, 1);
            assert.ok(this.h[1].exit.calledBefore(this.h[0].exit));
        });

        it('handles aync enter functions', function (done) {
            var h = {
                enter: function (callback) {
                    callback();
                },
                exec: function () {
                    done();
                }
            };

            this.router.define(function (route) {
                route('/a').to(h);
            });

            this.router.navigate('/a');
        });

        it('handles async exit functions', function (done) {
            var h1 = {
                enter: function () {},
                exec: function () {},
                exit: function (callback) { callback(); }
            };

            var h2 = {
                exec: function () { done(); }
            };

            this.router.define(function (route) {
                route('/a').to(h1);
                route('/b').to(h2);
            });

            this.router.navigate('/a');
            this.router.navigate('/b');
        });

        it('executes handler functions in hierarchical context', function () {
            var h1 = {
                enter: function () {
                    this.foo = 'bar';
                },
                exec: function () {
                    assert.equal(this.foo, 'bar');
                },
                exit: function () {
                    assert.equal(this.foo, 'bar');
                }
            };

            var h2 = {
                enter: function () {
                    assert.equal(this.foo, 'bar');
                    this.foo = 'baz';
                },
                exec: function () {
                    assert.equal(this.foo, 'baz');
                },
                exit: function () {
                    assert.equal(this.foo, 'baz');
                }
            };

            this.router.define(function (route) {
                route('/a').to(h1, function (route) {
                    route('/b').to(h2);
                });

                route('/c').to(handler());
            });

            this.router.navigate('/a');
            this.router.navigate('/a/b');
            this.router.navigate('/c');
        });

        it('exits and re-enters state when params change', function () {
            var h = handler();

            this.router.define(function (route) {
                route('/foo/:bar').to(h);
            });

            this.router.navigate('/foo/123');
            this.router.navigate('/foo/456');

            assert.equal(h.enter.callCount, 2);
            assert.equal(h.exit.callCount, 1);
            assert.equal(h.exec.callCount, 2);
        });


        it('enters index state', function () {
            var h1 = handler();
            var h2 = handler();

            this.router.define(function (route) {
                route('/').to(h1, function (route) {
                    route('/foo').to(h2);
                });
            });

            this.router.navigate('/');

            assert.ok(h1.enter.calledOnce);
            assert.ok(h1.exec.calledOnce);
        });

        it('re-execs current state', function () {
            var h1 = handler();
            var h2 = handler();

            this.router.define(function (route) {
                route('/').to(h1, function (route) {
                    route('/foo').to(h2);
                });
            });

            this.router.navigate('/foo');
            this.router.navigate('/');

            assert.equal(h1.exec.callCount, 2);
        });

        it('ignores trailing slash', function () {
            var h = handler();
            this.router.define(function (route) {
                route('/foo').to(h);
            });

            this.router.navigate('/foo/');

            assert.ok(h.exec.calledOnce);
        });
    });
});

// Helpers
// ---------------

function handler() {
    return {
        enter: sinon.spy(),
        exec: sinon.spy(),
        exit: sinon.spy()
    };
}