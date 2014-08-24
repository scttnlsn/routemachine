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
    url: '/foo',

    enter: function () {
        console.log('enter foo');
    },

    exec: function () {
        console.log('exec foo');
    }
};

var bar = {
    url: '/foo/bar',

    enter: function () {
        console.log('enter bar');
    },

    exec: function () {
        console.log('exec bar');
    },

    exit: function () {
        console.log('exit bar');
    }
};

router.define(function (root) {
    root.define('foo', foo, function (foo) {
        foo.define('bar', bar);
    });
});

router.navigate('/foo/bar');
// => enter foo
// => enter bar
// => exec bar
router.navigate('/foo');
// => exit bar
// => exec foo
```

## License

The MIT License (MIT)

Copyright (c) 2014 Scott Nelson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
