/*global define*/

define([
    'jquery',
    'backbone',
    'models/game',
    'views/game'
], function ($, Backbone, GameModel, GameView) {
    'use strict';

    // https://designbye.wordpress.com/tag/historical-stock-quotes/

    var GameRouter = Backbone.Router.extend({
        routes: {
            'game/:symbol': 'game',
            '': 'home'
        },

        initialize: function () {
            this.gameModel = new GameModel();
            this.gameView = new GameView({model: this.gameModel});
        },

        home: function () {
            return this.gameView.render();
        },

        game: function (symbol) {
            this.gameModel.set('symbol', symbol);
            this.gameView.renderGame();
        }

    });

    return GameRouter;
});
