(function() {

    // Graph Initializations
    var MARGINS = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 50,
        xAxisLabel: 20,
        yLabel: 20,
        yAxisLabel: 30
    };
    var WIDTH = 1000 - MARGINS.left - MARGINS.right;
    var HEIGHT = 400 - MARGINS.top - MARGINS.bottom;

    var xAxisLabel = "Time (seconds)";
    var yAxisLabel = "Sound Type";

    var svg = d3.select("body").append("svg")
        .attr("width", WIDTH + MARGINS.left + MARGINS.right)
        .attr("height", HEIGHT + MARGINS.top + MARGINS.bottom);

    //================================================================================
    // Load 1st Graph Data
    //================================================================================
    d3.csv("../data/sound.csv", function(d) {
        return {
            time: +d.time,
            sound: +d.sound
        };
    }, function(error, data) {

        // Initializations
        var minTime = data[0].time;
        var maxTime = data[data.length - 1].time;
        var minSound = d3.min(data, function(d) {
            return d.sound;
        });
        var maxSound = d3.max(data, function(d) {
            return d.sound;
        });

        var xScale = d3.scale.linear().domain([minTime, maxTime]).range([MARGINS.left + MARGINS.yAxisLabel + MARGINS.yLabel, WIDTH - MARGINS.right]);
        // NOTE: Need to subtract 0.5 to align data with uppermost tick mark
        var yScale = d3.scale.linear().domain([0, maxSound]).range([HEIGHT - MARGINS.top, MARGINS.bottom]);

        // FIX: Use Sound
        var yAxisVals = ["", "None", "1 Person", "2 People", "Other"];
        var yAxisScale = d3.scale.ordinal().domain(yAxisVals).rangePoints([HEIGHT - MARGINS.top, MARGINS.bottom]);

        var xAxis = d3.svg.axis()
            .scale(xScale);
        var yAxis = d3.svg.axis()
            .scale(yAxisScale)
            .outerTickSize(0)
            .orient("left");

        // X-Axis Label
        svg.append("text")
            .attr("class", "axis-label")
            .attr("x", WIDTH / 2)
            .attr("y", HEIGHT + MARGINS.xAxisLabel)
            .style("text-anchor", "middle")
            .text(xAxisLabel);

        // Y-Axis Label
        svg.append("text")
            .attr("transform", "translate(20, " + (HEIGHT / 2 - MARGINS.bottom) + ") rotate(-90)")
            .attr("class", "axis-label")
            .style("text-anchor", "middle")
            .text(yAxisLabel);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
            .call(xAxis);
        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (MARGINS.left + MARGINS.yAxisLabel + MARGINS.yLabel) + ",0)")
            .call(yAxis);

        //================================================================================
        // 1st Graph (Outline)
        //================================================================================
        var lineGen = d3.svg.line()
            .x(function(d) {
                return xScale(d.time);
            })
            .y(function(d) {
                return yScale(d.sound);
            });

        //================================================================================
        // 1st Graph Outline
        //================================================================================
        
        /*svg.append('path')
            .attr('d', lineGen(data))
            .attr('stroke', 'black')
            .attr('stroke-width', 2)
            .attr('fill', 'none');*/

        //================================================================================
        // 2nd Graph (Color)
        //================================================================================

        function shade(filePath, color) {
            d3.csv(filePath, function(d) {
                return {
                    time: +d.time,
                    sound: +d.sound,
                    color: +d.color
                };
            }, function(error, data) {
                svg.datum(data);
                var area = d3.svg.area()
                    // Needed to abruptly end shading
                    .defined(function(d) {
                        return !isNaN(d.sound);
                    })
                    .x(function(d) {
                        return xScale(d.time);
                    })
                    .y1(function(d) {
                        return yScale(d.sound);
                    });

                svg.append("path")
                    .attr("class", color)
                    .attr("d", area.y0(function(d) {
                        return HEIGHT - MARGINS.bottom;
                    }));
            });
        }

        shade("../data/out1.csv", "out1");
        shade("../data/out2.csv", "flat2");
        shade("../data/out3.csv", "flat3");
        shade("../data/out4.csv", "flat4");

    });
})();
