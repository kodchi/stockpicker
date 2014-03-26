/*global define*/

define([
    'jquery',
    'backbone',
    'views/game'
], function ($, Backbone, GameView) {
    'use strict';

    var GameRouter = Backbone.Router.extend({
        routes: {
            '': 'home'
        },

        home: function () {
            return new GameView();
        }

    });

    return GameRouter;
});
