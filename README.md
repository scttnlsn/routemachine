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

router.route(['foo'], {
    url: '/foo',

    enter: function () {
        console.log('enter foo');
    },

    exec: function () {
        console.log('exec foo');
    }
});

router.route(['foo', 'bar'], {
    url: '/foo/bar',

    exec: function () {
        console.log('exec bar');
    },

    exit: function () {
        console.log('exit bar');
    }
});

router.navigate('/bar');
// => enter foo
// => exec bar
router.navigate('/foo');
// => exit bar
// => exec foo
```