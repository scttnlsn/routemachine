# routemachine

Stateful client-side router

## Install

Browserify:

    npm install routemachine

Component:

    component install scttnlsn/routemachine

## Usage

```javascript
var routemachine = require('routemachine');
var router = routemachine();

var foo = {
    enter: function () {
        // Path is /foo/bar or /foo/baz
    },

    exec: function () {
        // Path is /foo
    }
};

var bar = function () {
    // Path is /foo/bar
};

var baz = function () {
    // Path is /foo/baz
};

router.define(function (route) {
    route('/foo').to(foo, function (route) {
        route('/bar').to(bar);
        route('/baz').to(baz);
    });
});

router.navigate('/foo/bar');
router.navigate('/foo/baz');
```