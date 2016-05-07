(function() {

    // Data Files
    var DATA = {
        g1: "../data/PRESTINE/sound-vanilla.csv",
        o1: "../data/PRESTINE/original.csv",
        o2: "../data/out2.csv",
        o3: "../data/out3.csv",
        o4: "../data/out4.csv"
    };

    // Graph Initializations
    var MARGINS = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 50,
        xAxisLabel: 20,
        yLabel: 20,
        yAxisLabel: 60
    };
    var WIDTH = 1000 - MARGINS.left - MARGINS.right;
    var HEIGHT = 400 - MARGINS.top - MARGINS.bottom;

    var GRAPH = {
        title: "[TITLE]",
        xAxisLabel: "Time (seconds)",
        yAxisLabel: "Sound Type"
    };

    var svg = d3.select("body").append("svg")
        .attr("width", WIDTH + MARGINS.left + MARGINS.right)
        .attr("height", HEIGHT + MARGINS.top + MARGINS.bottom);

    //================================================================================
    // Load 1st Graph Data
    //================================================================================
    d3.csv(DATA.g1, function(d) {
        return {
            time: +d.time,
            sound: +d.sound
        };
    }, function(error, data) {
        svg.datum(data);
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

        // y index of graph for given x
        var yIdx = d3.bisector(function(d) {
            return d.time;
        }).left;

        // Graph Title
        svg.append("text")
            .attr("class", "axis-label")
            // FIX: WIDTH margins & HEIGHT
            .attr("x", WIDTH / 2 + 50)
            .attr("y", MARGINS.top / 2 + 10)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text(GRAPH.title);

        // X-Axis Label
        svg.append("text")
            .attr("class", "axis-label")
            // FIX: WIDTH margins 
            .attr("x", WIDTH / 2 + 50)
            .attr("y", HEIGHT + MARGINS.xAxisLabel)
            .style("text-anchor", "middle")
            .text(GRAPH.xAxisLabel);

        // Y-Axis Label
        svg.append("text")
            .attr("transform", "translate(60, " + (HEIGHT / 2 - MARGINS.bottom) + ") rotate(-90)")
            .attr("class", "axis-label")
            .style("text-anchor", "middle")
            .text(GRAPH.yAxisLabel);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
            .call(xAxis);
        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (MARGINS.left + MARGINS.yAxisLabel + MARGINS.yLabel) + ",0)")
            .call(yAxis);

        var legend = svg.selectAll(".legend")
            .data(["Eye", "Face", "Monitor", "Other"])
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) {
                return "translate(0," + i * 20 + ")";
            });

        var color = d3.scale.ordinal()
            .range(["#27ae60", "#2980b9", "#f1c40f", "#c0392b"]);

        legend.append("rect")
            .attr("x", WIDTH + 20)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        legend.append("text")
            .attr("x", WIDTH + 10)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) {
                return d;
            });

        //================================================================================
        // 1st Graph (Outline)
        //================================================================================
        var lineGen = d3.svg.line()
            .x(function(d) {
                return xScale(d.time);
            })
            .y(function(d) {
                return yScale(d.sound);
            })
            // Create step-wise graph
            .interpolate('step-after');

        // Draw Outline
        svg.append('path')
            .attr('d', lineGen(data))
            .attr('stroke', 'black')
            .attr('stroke-width', 1.5)
            .attr('fill', 'none');

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
            }, function(error, data2) {
                svg.datum(data2);
                var area = d3.svg.area()
                    // Needed to abruptly end shading
                    .defined(function(d) {
                        return !isNaN(d.sound);
                    })
                    .x(function(d) {
                        return xScale(d.time);
                    })
                    .y1(function(d) {
                        //console.log(d.time);
                        //console.log(data[yIdx(data, d.time) - 1].sound);
                        var idx = yIdx(data, d.time);
                        // Need to floor index 
                        if (d.time > minTime)
                            idx -= 1;
                        // Important to use data from 1st graph
                        return yScale(data[idx].sound);
                    })
                    .interpolate("step-before");

                // Color gradient
                var grad = svg.append("defs")
                    .append("linearGradient")
                    .attr("id", "grad");

                function colors(n) {
                    if (n == 1)
                        return  "#27ae60"
                    else if (n == 2)
                        return "#2980b9"
                    else if (n == 3)
                        return "#f1c40f"
                    else 
                        return "#c0392b"
                }

                // Setting up where to stop colors (need to use stop/start of next color to get sharp contrasts versus blur)
                // Do not have to worry about shading last value (will use last value until the end)
                for (var i = 0; i < data2.length - 1; i++) {
                    console.log(1- (maxTime - data2[i].time) / (maxTime - minTime));
                    grad.append("stop").attr("offset", 1 - (maxTime - data2[i].time) / (maxTime - minTime) ).attr("stop-color", colors(data2[i].color));
                    grad.append("stop").attr("offset", 1 - (maxTime - data2[i].time) / (maxTime - minTime) ).attr("stop-color", colors(data2[i+1].color));
                }

                // Shade in 
                svg.append("path")
                .style("fill", "url(#grad)")
                .attr("d", area.y0(function(d) {
                    return HEIGHT - MARGINS.bottom;
                }));

            });
        }
        shade(DATA.o1, "out1");
        //shade(DATA.o2, "flat2");
        //shade(DATA.o3, "flat3");
        //shade(DATA.o4, "flat4");
    });
})();
