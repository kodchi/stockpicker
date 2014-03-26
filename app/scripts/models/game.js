/*global define*/

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    'use strict';

    var GameModel = Backbone.Model.extend({
        defaults: {
        }
    });

    return GameModel;
});
