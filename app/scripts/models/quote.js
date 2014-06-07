/*global define*/

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    'use strict';

    var QuoteModel = Backbone.Model.extend({
        defaults: {
        }
    });

    return QuoteModel;
});
