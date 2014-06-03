/*global define*/

define([
    'jquery',
    'backbone',
    'views/game'
], function ($, Backbone, GameView) {
    'use strict';

    // https://designbye.wordpress.com/tag/historical-stock-quotes/

    var GameRouter = Backbone.Router.extend({
        routes: {
            '': 'home'
        },

        initialize: function () {
        },

        home: function () {
            return new GameView();
        }

    });

    return GameRouter;
});
