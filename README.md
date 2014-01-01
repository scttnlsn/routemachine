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
        console.log('enter foo');
    },

    exec: function () {
        console.log('exec foo');
    }
};

var bar = {
    exec: function () {
        console.log('exec bar');
    },

    exit: function () {
        console.log('exit bar');
    }
};

router.define(function (route) {
    route('/foo').to(foo, function (route) {
        route('/bar').to(bar);
    });
});

router.navigate('/foo/bar');
// => enter foo
// => exec bar
router.navigate('/foo');
// => exit bar
// => exec foo
```