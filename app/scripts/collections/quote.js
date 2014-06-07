/*global define*/

define([
    'underscore',
    'backbone',
    'models/quote'
], function (_, Backbone, QuoteModel) {
    'use strict';

    var QuoteCollection = Backbone.Collection.extend({
        model: QuoteModel,

        initialize: function (symbol, startDate, endDate) {
            this.symbol = symbol;
            this.startDate = startDate;
            this.endDate = endDate;
        },

        url: function () {
            var query = encodeURIComponent(
                'SELECT * FROM yahoo.finance.historicaldata' +
                ' WHERE symbol="' + this.symbol + '"' +
                ' AND startDate="' + this.startDate + '"' +
                ' AND endDate="' + this.endDate + '"');
            return 'http://query.yahooapis.com/v1/public/yql?q=' + query +
                "&format=json&diagnostics=true&env=store://datatables.org/alltableswithkeys";
        },

        parse: function (data) {
            return data.query.results.quote;
        }
    });

    return QuoteCollection;
});
