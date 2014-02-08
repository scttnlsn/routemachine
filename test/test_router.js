var assert = require('assert');
var sinon = require('sinon');
var Router = require('../lib/router');

describe('Router', function () {
    beforeEach(function () {
        this.router = new Router();

        this.handlers = {
            '/foo': handler('/foo'),
            '/foo/bar': handler('/foo/bar'),
            '/foo/baz': handler(),
            '/foo/baz/qux': handler('/foo/baz/qux'),
            '/quux': handler('/quux')
        };

        this.router.add(['foo'], this.handlers['/foo']);
        this.router.add(['foo', 'bar'], this.handlers['/foo/bar']);
        this.router.add(['foo', 'baz'], this.handlers['/foo/baz']);
        this.router.add(['foo', 'baz', 'qux'], this.handlers['/foo/baz/qux']);
        this.router.add(['quux'], this.handlers['/quux']);
    });

    describe('#navigate', function () {
        it('transitions states', function () {
            var ok = this.router.navigate('/quux');

            assert.ok(ok);
            assert.ok(this.handlers['/quux'].enter.calledOnce);
            assert.ok(this.handlers['/quux'].exec.calledOnce);

            var ok = this.router.navigate('/foo/baz/qux');

            assert.ok(ok);
            assert.ok(this.handlers['/quux'].exit.calledOnce);
            assert.ok(this.handlers['/foo'].enter.calledOnce);
            assert.ok(!this.handlers['/foo'].exec.called);
            assert.ok(this.handlers['/foo/baz'].enter.calledOnce);
            assert.ok(!this.handlers['/foo/baz'].exec.called);
            assert.ok(this.handlers['/foo/baz/qux'].enter.calledOnce);
            assert.ok(this.handlers['/foo/baz/qux'].exec.calledOnce);

            var ok = this.router.navigate('/foo/baz'); // passthrough state only (no url)

            assert.ok(!ok);
            assert.ok(!this.handlers['/foo/baz/qux'].exit.called);

            var ok = this.router.navigate('/foo');
            assert.ok(ok);
            assert.ok(this.handlers['/foo/baz/qux'].exit.calledOnce);
            assert.ok(this.handlers['/foo/baz'].exit.calledOnce);
            assert.ok(this.handlers['/foo'].enter.calledOnce);
            assert.ok(this.handlers['/foo'].exec.calledOnce);
        });

        it('emits `navigate` event', function (done) {
            this.router.on('navigate', function (url) {
                assert.equal(url, '/foo');
                done();
            });

            this.router.navigate('/foo');
        });

        it('handles async enter', function (done) {
            this.router.add(['a'], {
                url: '/a',

                enter: function (callback) {
                    setTimeout(callback, 0);
                },

                exec: function () {
                    done();
                }
            });

            this.router.navigate('/a');
        });

        it('handles async exit', function (done) {
            this.router.add(['a'], {
                url: '/a',
                exec: sinon.spy(),

                exit: function (callback) {
                    setTimeout(callback, 0);
                }
            });

            this.router.add(['b'], {
                url: '/b',

                exec: function () {
                    done();
                }
            });

            this.router.navigate('/a');
            this.router.navigate('/b');
        });

        it('executes handlers in hierarchical context', function () {
            this.router.add(['a'], {
                url: '/a',

                enter: function () {
                    this.foo = 'bar';
                },

                exec: function () {
                    assert.equal(this.foo, 'bar');
                },

                exit: function () {
                    assert.equal(this.foo, 'bar');
                }
            });

            this.router.add(['a', 'b'], {
                url: '/a/b',

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
            });

            this.router.add(['c'], {
                url: '/c',
                exec: function () {
                    assert.ok(!this.foo);
                }
            });

            this.router.navigate('/a');
            this.router.navigate('/a/b');
            this.router.navigate('/c');
        });

        it('exits and re-enters state when params change', function () {
            var h = handler('/foo/:bar');
            this.router.reset();
            this.router.add(['foo'], h);

            this.router.navigate('/foo/123');
            this.router.navigate('/foo/456');

            assert.equal(h.enter.callCount, 2);
            assert.equal(h.exec.callCount, 2);
            assert.equal(h.exit.callCount, 1);
        });
    });
});

// Helpers
// ---------------

function handler(url) {
    return {
        url: url,
        enter: sinon.spy(),
        exec: sinon.spy(),
        exit: sinon.spy()
    };
}