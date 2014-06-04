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

        initialize: function () {
            console.log(this.model, 'ssshh');
            this.model.on('change:symbol', this.updateQuotes, this);
            _.bindAll(this, 'updateQuotes');
//            this.render();
        },

        render: function () {
            this.$el.html(this.indexTemplate({'model': this.model.toJSON()}));
        },

        renderGame: function () {
            this.$el.html(this.gameTemplate({'model': this.model.toJSON()}));
            this.drawGraph();
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
                width = $('.body').width() - margin.left - margin.right,
                height = $('.body').width() / 2 - margin.top - margin.bottom;

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
                });

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");

            var line = d3.svg.line()
//                .interpolate('cardinal')
                .x(function (d) {
                    return x(d.date);
                })
                .y(function (d) {
                    return y(d.close);
                });

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
            var path = svg.append("path")
                .datum(data)
                .attr("class", "line")
                .attr("d", line);

            var totalLength = path.node().getTotalLength();

            var timer,
                i = 1,
                timerCallback = function () {
                    console.log(i++);
                };

            path
                .attr("stroke-dasharray", totalLength + ' ' + totalLength)
                .attr("stroke-dashoffset", totalLength)
                .transition()
                // each day lasts 3 secs
                .duration(data.length * 3000)
                .ease("linear")
                .attr("stroke-dashoffset", 0)
                .each('start', function () {
                    timer = setInterval(timerCallback, 4000);
                })
                .each('end', function () {
                    clearTimeout(timer);
                });

        }
    });

    return GameView;
});
