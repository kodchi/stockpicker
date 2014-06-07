/*global define*/

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    'use strict';

    var GameModel = Backbone.Model.extend({
        url: '',

        initialize: function() {
        },

        defaults: {
            // each user has this much money in the beginning
            cash: 5000,
            stock: 0,
            // action can be 100, -100, or any other whole number
            // meaning buy 100, sell 100 of stocks at the 'quote' price
            action: null,
            // default list of symbols
            symbols: [
                'XOM', 'DOW', 'GE', 'WMT', 'PG', 'BRK.B', 'JNJ', 'AAPL', 'VZ',
                'DUK'
            ],
            // current symbol that's being viewed
            symbol: null,
            // quotes collection downloaded from Yahoo!
            quotes: null,
            // current quote
            quote: null
        },

        validate: function(attrs, options) {
        },

        parse: function(response, options)  {
            return response;
        }
    });

    return GameModel;
});
