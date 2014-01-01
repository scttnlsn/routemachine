var Router = require('router');

$(function () {
    var router = Router();

    var templates = {
        index: _.template($('#index-template').html()),
        entries: _.template($('#entries-template').html()),
        entry: _.template($('#entry-template').html())
    };

    var handlers = {
        index: {
            enter: function () {
                console.log('Enter:', 'index');
            },

            exec: function () {
                console.log('Exec:', 'index', this.intermediate);
            },

            exit: function () {
                console.log('Exit:', 'index');
            }
        },

        home: {
            enter: function () {
                console.log('Enter:', 'home');
            },

            exec: function () {
                console.log('Exec:', 'home', this.intermediate);
                $('#main').html(templates.index());
            },

            exit: function () {
                console.log('Exit:', 'home');
            }
        },

        entries: {
            enter: function (done) {
                console.log('Enter:', 'entries');

                // Simulate async request
                setTimeout(function () {
                    this.entries = {
                        '1': { id: 1, title: 'Foo', body: 'This is entry foo.' },
                        '2': { id: 2, title: 'Bar', body: 'This is entry bar.' }
                    };
                    
                    done();
                }.bind(this), 1000);
            },

            exec: function () {
                console.log('Exec:', 'entries', this.intermediate);
            },

            exit: function () {
                console.log('Exit:', 'entries');
            }
        },

        entrylist: {
            enter: function () {
                console.log('Enter:', 'entrylist');
            },

            exec: function () {
                console.log('Exec:', 'entrylist', this.intermediate);
                $('#main').html(templates.entries({ entries: this.entries }));
            },

            exit: function () {
                console.log('Exit:', 'entrylist');
            }
        },

        entry: {
            enter: function () {
                console.log('Enter:', 'entry', this.params.id);
                this.entry = this.entries[this.params.id];
            },

            exec: function () {
                console.log('Exec:', 'entry', this.params.id, this.intermediate);
                $('#main').html(templates.entry({ entry: this.entry }));
            },

            exit: function () {
                console.log('Exit:', 'entry', this.params.id);
            }
        }
    };

    router.define(function (route) {
        route('/').to(handlers.index, function (route) {
            route('/').to(handlers.home);

            route('/entries').to(handlers.entries, function (route) {
                route('/').to(handlers.entrylist);
                route('/:id').to(handlers.entry);
            });
        });
    });

    window.onhashchange = function () {
        router.navigate(path());
    };

    router.navigate(path());

    function path() {
        var path = window.location.hash;
        if (path[0] === '#') path = path.slice(1);
        if (path === '') path = '/';
        return path;
    }
});