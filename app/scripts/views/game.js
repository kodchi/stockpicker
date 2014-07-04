/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'd3',
    'templates',
    'models/game',
    'models/quote',
    'collections/quote'
], function ($, _, Backbone, d3, JST, GameModel, QuoteModel, QuoteCollection) {
    'use strict';

    var GameView = Backbone.View.extend({
        el: '.body',

        indexTemplate: JST['app/scripts/templates/index.ejs'],
        gameTemplate: JST['app/scripts/templates/game.ejs'],

        events: {
            'click #actions li.amount': 'enableActions',
            'click #actions li.action': 'performAction'
        },

        initialize: function () {
//            this.model.on('change:symbol', this.updateQuotes, this);
            this.model.on('change:date', this.updatePortfolio, this);
            this.model.on('change:cash change:quote change:stock', this.updateUserStatus, this);
            _.bindAll(this, 'enableActions', 'performAction');
//            this.render();
        },

        render: function () {
            this.$el.html(this.indexTemplate({'model': this.model.toJSON()}));
        },

        renderGame: function () {
            this.updateQuotes();
            this.$el.html(this.gameTemplate({'model': this.model.toJSON()}));
            this.drawGraph();
        },

        /**
         * Perform the user's action: buy/sell some amount of stock.
         * Reset the action buttons too.
         * @param event
         */
        performAction: function (event) {
            var action = $(event.target).data('action'),
                amount = parseInt(this.$el.find('#actions .amount.on').data('amount'), 10);
            amount = (action === 'buy') ? amount : -amount;
            this.model.set('action', amount);
            // reset actions
            this.$el.find('#actions .on').removeClass('on');
            console.log('action = ', this.model.get('action'), 'cash = ', this.model.get('cash'));
        },

        /**
         * Show the user now much cash and how many stocks s/he has
         * @param event
         */
        updateUserStatus: function (event) {
            this.$el.find('#cash').text(this.model.get('cash'));
            this.$el.find('#stock').text(this.model.get('stock') +
                '($' + this.model.get('stock') * this.model.get('quote') + ')');
        },

        /**
         * Enable action links.
         * Once the user selects how much to buy/sell, make the action links
         * clickable.
         * @param event
         */
        enableActions: function (event) {
            $(event.target).addClass('on');
            this.$el.find('#actions .action').addClass('on');
        },

        updatePortfolio: function () {
            if (this.model.get('action')) {
                var cash = this.model.get('cash'),
                    stock = this.model.get('stock'),
                    action = this.model.get('action'),
                    quote = this.model.get('quote'),
                    actionCash,
                    actionStocks;

                // buy
                if (action > 0) {
                    actionCash = Math.floor(cash * action / 100);
                    actionStocks = Math.floor(actionCash / quote);
                    this.model.set({
                        'cash': cash - actionStocks * quote,
                        'stock': actionStocks
                    });
                // sell
                } else {
                    actionStocks = Math.floor(stock * -action / 100);
                    actionCash = actionStocks * quote;
                    this.model.set({
                        'cash': cash + actionCash,
                        'stock': stock - actionStocks
                    });
                }

                // clear action
                this.model.set('action', undefined);
            }

            // do final calculations
            if (this.model.get('finish')) {
                this.model.set('cash',
                    this.model.get('cash') +
                    this.model.get('stock') *
                    this.model.get('quote')
                );
                this.model.set('stock', 0);
            }
        },

        updateQuotes: function () {
            var beginningDate = new Date(2000, 0, 1),
                today = new Date(),
                startDate = new Date(beginningDate.getTime() + Math.random() * (today.getTime() - beginningDate.getTime())),
                // clone startDate
                endDate = new Date(startDate.getTime()),
                quotes;

            endDate.setDate(endDate.getDate() + 100); // add 100 days

            quotes = new QuoteCollection(
                this.model.get('symbol'),
                startDate.getFullYear() + '/' + (startDate.getMonth() + 1) + '/' + startDate.getDate(),
                endDate.getFullYear() + '/' + (endDate.getMonth() + 1) + '/' + endDate.getDate()
            );

            quotes.fetch({async: false});
            // todo reset model
            this.model.set('quotes', quotes);
        },

        drawGraph: function () {
            var that = this;
            var margin = {top: 20, right: 20, bottom: 30, left: 50},
                width = this.$el.width() - margin.left - margin.right,
                height = this.$el.width() / 2 - margin.top - margin.bottom;

            var parseDate = d3.time.format("%Y-%m-%d").parse;

            var x = d3.time.scale()
                .range([0, width]);

            var y = d3.scale.linear()
                .range([height, 0]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .tickFormat(function (d) {
                    return (d.getMonth() + 1) + '/' + d.getDate() + '/' +
                        d.getFullYear().toString().substr(2, 20);
                })
                .ticks(3);

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .ticks(3);

            var svg = d3.select("#graph").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // get only the first 30 quotes
            var data = this.model.get('quotes').toJSON().slice(0, 30);
            data.forEach(function (d) {
                d.date = parseDate(d.Date);
                d.close = +d.Close;
            });

            x.domain(d3.extent(data, function (d) {
                return d.date;
            }));
            y.domain(d3.extent(data, function (d) {
                return d.close;
            }));

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Price ($)");

            data.sort(function(a, b){ return d3.ascending(a.date, b.date); });
//            console.log(data);
            var d1;
            var path = svg.selectAll('circle')
                .data(data)
                .enter()
                .append('circle')
                .transition()
                .delay(function (d, i) {
                    return i * 500;
                })
                .attr({
                    'class': 'circle',
                    'r': 3,
                    'cx': function (d) {
                        return x(d.date);
                    },
                    'cy': function (d) {
                        return y(d.close);
                    }
                })
                .each('end', function (d, i) {
                    that.model.set({
                        'quote': d.close,
                        'date': d.date,
                        'finish': (i + 1 === data.length)
                    });
                    // connect dots
                    if (d1) {
                        connectCircles(d1, d);
                    }
                    d1 = d;
                });

            var connectCircles = function (d1, d2) {
                var line = d3.svg.line()
//                .interpolate('cardinal')
                    .x(function (d) {
                        return x(d.date);
                    })
                    .y(function (d) {
                        return y(d.close);
                    });
                var path = svg.append("path")
                    .datum([d1, d2])
                    .attr("class", "line")
                    .attr("d", line);

                var totalLength = path.node().getTotalLength();

                path
                    .attr("stroke-dasharray", totalLength + ' ' + totalLength)
                    .attr("stroke-dashoffset", totalLength)
                    .transition()
                    .duration(500)
                    .ease("linear")
                    .attr("stroke-dashoffset", 0);

            };
        }
    });

    return GameView;
});
