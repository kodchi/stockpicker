/*global require*/
'use strict';

require.config({
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        bootstrap: {
            deps: ['jquery'],
            exports: 'jquery'
        }
    },
    paths: {
        backbone: '../bower_components/backbone/backbone-min',
        bootstrap: '../bower_components/sass-bootstrap/dist/js/bootstrap.min',
        d3: '../bower_components/d3/d3.min',
        jquery: '../bower_components/jquery/jquery.min',
        underscore: '../bower_components/underscore/underscore-min'
    }
});

require([
    'backbone',
    'routes/game'
], function (Backbone, GameRouter) {
    var router = new GameRouter();
    Backbone.history.start();
});
