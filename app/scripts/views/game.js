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
            'click #actions li': 'createAction'
        },

        initialize: function () {
            console.log(this.model, 'ssshh');
            this.model.on('change:symbol', this.updateQuotes, this);
            this.model.on('change:quote', this.updatePortfolio, this);
            this.model.on('change:cash change:stock', this.updateUserStatus, this)
            _.bindAll(this, 'createAction');
//            this.render();
        },

        render: function () {
            this.$el.html(this.indexTemplate({'model': this.model.toJSON()}));
        },

        renderGame: function () {
            this.$el.html(this.gameTemplate({'model': this.model.toJSON()}));
            this.drawGraph();
        },

        createAction: function (event) {
            this.model.set('action', parseInt($(event.target).data('action')));
            console.log(this.model.get('action'));
        },

        updateUserStatus: function (event) {
            this.$el.find('#cash').text(this.model.get('cash'));
            this.$el.find('#stock').text(this.model.get('stock'));
        },

        updatePortfolio: function () {
            if (!this.model.get('action')) {
                return;
            }
            var stockPrice = this.model.get('action') * this.model.get('quote');
            this.model.set({
                cash: this.model.get('cash') - stockPrice,
                stock: this.model.get('stock') + this.model.get('action')
            });
            // clear action
            this.model.set('action', undefined);
        },

        updateQuotes: function () {
            var quotes = new QuoteCollection(
                this.model.get('symbol'),
                '2012-01-01',
                '2012-01-31'
            );
            quotes.fetch({async: false});
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
                    return (d.getMonth() + 1) + '/' + d.getDate();
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

            var data = this.model.get('quotes').toJSON();
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
                    return i * 2000;
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
                    that.model.set('quote', d.close);
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
