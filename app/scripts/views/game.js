/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates'
], function ($, _, Backbone, JST) {
    'use strict';

    var GameView = Backbone.View.extend({
        template: JST['app/scripts/templates/game.ejs']
    });

    return GameView;
});
