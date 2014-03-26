/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'models/game'
], function ($, _, Backbone, JST, GameModel) {
    'use strict';

    var GameView = Backbone.View.extend({
        el: '.body',
        template: JST['app/scripts/templates/game.ejs'],
        initialize: function () {
            this.model = new GameModel();
            this.render();
        },
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
        }

    });

    return GameView;
});
