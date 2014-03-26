/*global define*/

define([
    'underscore',
    'backbone',
    'models/game'
], function (_, Backbone, GameModel) {
    'use strict';

    var GameCollection = Backbone.Collection.extend({
        model: GameModel
    });

    return GameCollection;
});
