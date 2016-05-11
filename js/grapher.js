(function() {

    // Data Files
    var DATA = {
        g1: "../data/C2/C2_000_300/talking.csv",
        g2: "../data/C2/C2_000_300/color.csv"
            //g1: "../data/C1/C1_120_240/talking.csv",
            //g2: "../data/C1/C1_120_240/color.csv"
            //g1: "../data/C1/C1_120_300/talking.csv",
            //g2: "../data/C1/C1_120_300/color.csv"
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
    var WIDTH = 2000 - MARGINS.left - MARGINS.right;
    var HEIGHT = 300 - MARGINS.top - MARGINS.bottom;

    var GRAPH = {
        title: "Stages of Distraction",
        xAxisLabel: "Time (seconds)",
        yAxisLabel: "" //"Sound Type"
    };

    var svg = d3.select("#svg").append("svg")
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

        // Math.min(d1minTime, d2minTime) Math.max(d1maxTime, d2maxTime)
        var xScale = d3.scale.linear().domain([minTime, maxTime]).range([MARGINS.left + MARGINS.yAxisLabel + MARGINS.yLabel, WIDTH - MARGINS.right]);
        // NOTE: Need to subtract 0.5 to align data with uppermost tick mark
        var yScale = d3.scale.linear().domain([0, maxSound]).range([HEIGHT - MARGINS.top, MARGINS.bottom]);

        // FIX: Use Sound
        var yAxisVals = ["", "Silent", "1 Typer", "1 Speaker", "1 Speaker & Typer", "2 Speakers", "2 Speakers & 1 Typer"];
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
            .data(["Other", "Monitor", "Keyboard", "Face"])
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
        var outline = svg.append('path')
            .attr('d', lineGen(data))
            .attr('stroke', 'black')
            .attr('stroke-width', 1.5)
            // Need to no fill black
            .attr('fill', 'none')
            .style("opacity", 0);

        //================================================================================
        // 2nd Graph (Color)
        //================================================================================

        var grad;

        function shade(filePath) {
            d3.csv(filePath, function(d) {
                return {
                    time: +d.time,
                    //sound: +d.sound,
                    color: +d.color
                };
            }, function(error, data2) {

                // Use data from first graph
                svg.datum(data);
                var area = d3.svg.area()
                    // Used for holes in data
                    .defined(function(d) {
                        return !isNaN(d.time);
                    })
                    .x(function(d) {
                        return xScale(d.time);
                    })
                    .y1(function(d) {
                        // Important to use data from 1st graph
                        return yScale(d.sound);
                    })
                    .interpolate("step-after");

                // Color gradient
                grad = svg.append("defs")
                    .append("linearGradient")
                    .attr("id", "grad");

                function colors(n) {
                    if (n == 1)
                        return "#27ae60"
                    else if (n == 2)
                        return "#2980b9"
                    else if (n == 3)
                        return "#f1c40f"
                    else
                        return "#c0392b"
                }

                // Setting up where to stop colors (need to use stop/start of next color to get sharp contrasts versus blur)
                // Do not have to worry about shading last value (will use last value until the end)
                // Use data from second graph
                // Hack needed to change color using gradient to have abrupt color changes
                var start = [];
                var stop = [];
                start.push(grad.append("stop").attr("offset", 0).attr("stop-color", colors(data2[0].color)));
                for (var i = 1; i < data2.length; i++) {
                    //console.log(1- (maxTime - data2[i].time) / (maxTime - minTime));
                    //console.log(data2[i].color);
                    stop.push(grad.append("stop").attr("offset", 1 - (maxTime - data2[i].time) / (maxTime - minTime)).attr("stop-color", colors(data2[i - 1].color)));
                    start.push(grad.append("stop").attr("offset", 1 - (maxTime - data2[i].time) / (maxTime - minTime)).attr("stop-color", colors(data2[i].color)));
                }

                // Shade 
                var shadeGraph = svg.append("path")
                    .style("fill", "url(#grad)")
                    .attr("d", area.y0(function(d) {
                        return HEIGHT - MARGINS.bottom;
                    }));

                // Filter
                function filterColor(fColor, on) {
                    var prevColor;
                    var curColor;
                    on && data2[0].color != fColor ? start[0].transition().attr("stop-color", "white") : start[0].transition().attr("stop-color", colors(data2[0].color));
                    for (var i = 1; i < data2.length; i++) {
                        // Shade filterColor or else white if filter option is on
                        prevColor = on && data2[i - 1].color != fColor ? "white" : colors(data2[i - 1].color);
                        curColor = on && data2[i].color != fColor ? "white" : colors(data2[i].color);

                        stop[i - 1].transition().attr("stop-color", prevColor);
                        start[i].transition().attr("stop-color", curColor);
                    }
                }

                var bisect = d3.bisector(function(d) {
                    return d.time;
                }).left;
                //console.log(bisect(data2, 5));
                //console.log(data[1].time);

                function filterSound(fSound) {
                    //shadeGraph.data();
                    //console.log(data.filter(function(d) { return d.time < 50;}));

                    var gradSound = svg.append("defs")
                        .append("linearGradient")
                        .attr("id", "gradSound");


                    //var range = data.filter(function(d) { return d.sound == 0.5});





                    for (var i = 1; i < data2.length; i++) {
                        // data less than the the border amount |    before the change|
                        var inside = false;
                        var range = data.filter(function(d) {
                            return d.time < data2[i].time && d.time >= data2[i - 1].time;
                        });

                        // Begin Boundary
                        var boundaryColor;
                        // Need to subtract first value off to get correct color
                        if (data[bisect(data, data2[i - 1].time) <= 0 ? 0 : bisect(data, data2[i - 1].time) - 1].sound == 0.5)
                                boundaryColor = colors(data2[i - 1].color);
                        else
                            boundaryColor = "white";

                        //gradSound.append("stop").attr("offset", 1 - (maxTime - data2[i - 1].time) / (maxTime - minTime)).attr("stop-color", boundaryColor);



                   



                        // Filtered data1 (empty data)
                        if (range.length > 0) {
                            var startColor = range[0].sound != 0.5 ? "white" : colors(data2[i - 1].color);
                                                        if (range[0].time > 70 && range[0].time < 80) {
                            console.log("range[0].time: " + range[0].time);
                            console.log("boundaryColor: " + boundaryColor);
                            console.log("range[0].sound: " + range[0].sound);
                            console.log("range[j] color: " + data2[i - 1].color);
                             console.log("startColor: " + startColor);
                        }
                           
                            // Stop
                            gradSound.append("stop").attr("offset", 1 - (maxTime - range[0].time) / (maxTime - minTime)).attr("stop-color", boundaryColor);
                            // Start
                            gradSound.append("stop").attr("offset", 1 - (maxTime - range[0].time) / (maxTime - minTime)).attr("stop-color", startColor);
                        }

                        // Everything in this range will be either data2[i-1] or white
                        var prevColor;
                        var curColor = startColor;
                        for (var j = 1; j < range.length; j++) {
                            inside = true;
                            prevColor = range[j - 1].sound != 0.5 ? "white" : colors(data2[i - 1].color);
                            curColor = range[j].sound != 0.5 ? "white" : colors(data2[i - 1].color);

                            //console.log("range[" + j.toString() + "].time: " + range[j].time);
                            //console.log("range[j] color: " + curColor);
                            // Stop
                            gradSound.append("stop").attr("offset", 1 - (maxTime - range[j].time) / (maxTime - minTime)).attr("stop-color", prevColor);
                            // Start
                            gradSound.append("stop").attr("offset", 1 - (maxTime - range[j].time) / (maxTime - minTime)).attr("stop-color", curColor);
                        }
                        console.log("ending color: " + curColor.toString());
                        // Last range color cut off at start of next d2[i] value/ end value (stop)

                        // Need if statement to get around empty data1 case (change only if the data1 is not empty)
                        if (range.length > 0) {
                            if (range[0].time > 70 && range[0].time < 80) {
                            console.log("ending color range > 0: " + curColor.toString());
                        }
                            gradSound.append("stop").attr("offset", 1 - (maxTime - data2[i].time) / (maxTime - minTime)).attr("stop-color", curColor);
                        }

                        //console.log("data2[i].time: " + data2[i].time.toString());
                        // End boundary
                        // Need to subtract 1 from the index to get correct value
                        // Next color data value (can potentially be the same color)
                        // Start
                        console.log("ALL data2[i].time: " + data2[i].time);
                        console.log("ALL BISECT: " + data[bisect(data, data2[i].time) - 1].sound);

                        if (!inside && data[bisect(data, data2[i].time) - 1].sound == 0.5) {
                            gradSound.append("stop").attr("offset", 1 - (maxTime - data2[i].time) / (maxTime - minTime)).attr("stop-color", colors(data2[i - 1].color));
                        } else {
                            gradSound.append("stop").attr("offset", 1 - (maxTime - data2[i].time) / (maxTime - minTime)).attr("stop-color", "white");
                        }
                        if (data[bisect(data, data2[i].time) - 1].sound == 0.5) {
                            if (data[bisect(data, data2[i].time) - 1].time > 70 && data[bisect(data, data2[i].time) - 1].time < 80) {
                            console.log("data2[i].time: " + data2[i].time);
                            console.log("data[bisect(data, data2[i].time)].time: " + data[bisect(data, data2[i].time) - 1].time.toString());
                            console.log("color: " +data2[i].color.toString());
                        }
                            // Need to use next value so "i"
                            gradSound.append("stop").attr("offset", 1 - (maxTime - data2[i].time) / (maxTime - minTime)).attr("stop-color", colors(data2[i].color));
                        } else {
                            // Set value to white if it's not 0.5 (don't care about the color)
                            gradSound.append("stop").attr("offset", 1 - (maxTime - data2[i].time) / (maxTime - minTime)).attr("stop-color", "white");
                        }


                    }

                    //console.log(data[bisect(data, 1) == 0 ? 0 : bisect(data, 1) ].sound);
                    shadeGraph.style("fill", "url(#gradSound)");
                    //console.log(1- (maxTime - data2[i].time) / (maxTime - minTime));
                    //console.log(data2[i].color);
                    //gradSound.append("stop").attr("offset", 1 - (maxTime - data2[i].time) / (maxTime - minTime)).attr("stop-color", colors(data2[i - 1].color)));
                    //gradSound.append("stop").attr("offset", 1 - (maxTime - data2[i].time) / (maxTime - minTime)).attr("stop-color", colors(data2[i].color)));
                    //}






                    /* var prevColor;
                     var curColor;
                     data[0].sound != fSound ? start[0].transition().attr("stop-color", "white") : start[0].transition().attr("stop-color", colors(data2[0].color));
                     for (var i = 1; i < data2.length; i++) {
                         // Shade filterColor or else white if filter option is on
                         prevColor = data[i - 1].sound != fSound ? "white" : colors(data2[i - 1].color);
                         curColor = data[i].sound != fSound ? "white" : colors(data2[i].color);

                         stop[i - 1].transition().attr("stop-color", prevColor);
                         start[i].transition().attr("stop-color", curColor);
                     }



                     shadeGraph.style("fill", "url(#gradSound)")*/
                }

                d3.select("#other").on("click", function() {
                    filterColor(1, true);
                    outline.style("opacity", 1);
                });
                d3.select("#monitor").on("click", function() {
                    filterColor(2, true);
                    outline.style("opacity", 1);
                });
                d3.select("#keyboard").on("click", function() {
                    filterColor(3, true);
                    outline.style("opacity", 1);
                });
                d3.select("#face").on("click", function() {
                    filterColor(4, true);
                    outline.style("opacity", 1);
                });
                d3.select("#all").on("click", function() {
                    filterColor(0, false);
                    outline.style("opacity", 0);
                });
                d3.select("#one-ty").on("click", function() {
                    filterSound(1);
                    outline.style("opacity", 1);
                });
                d3.select("#silent").on("click", function() {
                    filterSound(0.5);
                    outline.style("opacity", 1);
                });

            });
            // End Data2 Function
        }
        // End Shade

        // Run shade
        shade(DATA.g2);
    });

    // Export/save graph
    /*d3.select("#save").on("click", function() {
        var html = d3.select("svg")
            .attr("version", 1.1)
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .node().parentNode.innerHTML;

        var imgsrc = 'data:image/svg+xml;base64,' + btoa(html);
        var img = '<img src="' + imgsrc + '">';
        d3.select("#svgdataurl").html(img);


        var canvas = document.querySelector("canvas"),
            context = canvas.getContext("2d");

        var image = new Image;
        image.src = imgsrc;
        image.onload = function() {
            context.drawImage(image, 0, 0);

            var canvasdata = canvas.toDataURL("image/png");

            var pngimg = '<img src="' + canvasdata + '">';
            d3.select("#pngdataurl").html(pngimg);

            var a = document.createElement("a");
            //a.download = "sample.png";
            //a.href = canvasdata;
            //a.click();
        };

    });*/

})();
