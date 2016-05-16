function graph(element, DATA, title) {

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
    var WIDTH = 1500 - MARGINS.left - MARGINS.right;
    var HEIGHT = 300 - MARGINS.top - MARGINS.bottom;

    var GRAPH = {
        title: title,
        xAxisLabel: "Time (seconds)",
        yAxisLabel: "" //"Sound Type"
    };

    var bgColor = "white";
    var svg = d3.select("#" + element).append("svg")
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
        var maxSound = 6;
        /*d3.max(data, function(d) {
                    return d.sound;
                });*/

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
                    color: +d.color
                };
            }, function(error, data2) {

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

                function addColorStop(gradient, offset, color) {
                    return gradient.append("stop")
                        .attr("offset", 1 - (maxTime - offset) / (maxTime - minTime))
                        .attr("stop-color", color);
                }

                function filterColor(fColor, on) {
                    var prevColor, nextColor;
                    for (var i = 0; i < data2.length - 1; i++) {
                        // Shade filter color or else background color if filter option is on
                        curColor = on && data2[i].color != fColor ? bgColor : colors(data2[i].color);
                        nextColor = on && data2[i + 1].color != fColor ? bgColor : colors(data2[i + 1].color);

                        stop[i].transition().attr("stop-color", curColor);
                        start[i].transition().attr("stop-color", nextColor);
                    }
                }


                // Use data from first graph
                svg.datum(data);

                // Color gradient
                grad = svg.append("defs")
                    .append("linearGradient")
                    .attr("id", "grad" + element);

                // Set up initial gradient
                var stop = [];
                var start = [];
                for (var i = 1; i < data2.length; i++) {
                    stop.push(addColorStop(grad, data2[i].time, colors(data2[i - 1].color)));
                    start.push(addColorStop(grad, data2[i].time, colors(data2[i].color)));
                }

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

                // Shade 
                var shadeGraph = svg.append("path")
                    .style("fill", "url(#grad" + element + ")")
                    .attr("d", area.y0(function(d) {
                        return HEIGHT - MARGINS.bottom;
                    }));







                var bisect = d3.bisector(function(d) {
                    return d.time;
                }).left;

                function filterSound(fSound) {

                    var gradSound = svg.append("defs")
                        .append("linearGradient")
                        .attr("id", "gradSound" + fSound + element);


                    for (var i = 1; i < data2.length; i++) {
                        // data less than the the border amount |    before the change|
                        var inside = false;
                        var range = data.filter(function(d) {
                            return d.time < data2[i].time && d.time >= data2[i - 1].time;
                        });

                        // Begin Boundary
                        var boundaryColor;
                        // Need to subtract first value off to get correct color
                        if (data[bisect(data, data2[i - 1].time) <= 0 ? 0 : bisect(data, data2[i - 1].time) - 1].sound == fSound)
                            boundaryColor = colors(data2[i - 1].color);
                        else
                            boundaryColor = "white";


                        // Filtered data1 (empty data)
                        if (range.length > 0) {
                            var startColor = range[0].sound != fSound ? "white" : colors(data2[i - 1].color);
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
                            prevColor = range[j - 1].sound != fSound ? "white" : colors(data2[i - 1].color);
                            curColor = range[j].sound != fSound ? "white" : colors(data2[i - 1].color);

                            //console.log("range[" + j.toString() + "].time: " + range[j].time);
                            //console.log("range[j] color: " + curColor);
                            // Stop
                            gradSound.append("stop").attr("offset", 1 - (maxTime - range[j].time) / (maxTime - minTime)).attr("stop-color", prevColor);
                            // Start
                            gradSound.append("stop").attr("offset", 1 - (maxTime - range[j].time) / (maxTime - minTime)).attr("stop-color", curColor);
                        }
                        //console.log("ending color: " + curColor.toString());
                        // Last range color cut off at start of next d2[i] value/ end value (stop)

                        // Need if statement to get around empty data1 case (change only if the data1 is not empty)
                        if (range.length > 0) {
                            gradSound.append("stop").attr("offset", 1 - (maxTime - data2[i].time) / (maxTime - minTime)).attr("stop-color", curColor);
                        }

                        //console.log("data2[i].time: " + data2[i].time.toString());
                        // End boundary
                        // Need to subtract 1 from the index to get correct value
                        // Next color data value (can potentially be the same color)
                        // Start
                        //console.log("ALL data2[i].time: " + data2[i].time);
                        //console.log("ALL BISECT: " + data[bisect(data, data2[i].time) - 1].sound);

                        if (!inside && data[bisect(data, data2[i].time) - 1].sound == fSound) {
                            gradSound.append("stop").attr("offset", 1 - (maxTime - data2[i].time) / (maxTime - minTime)).attr("stop-color", colors(data2[i - 1].color));
                        } else {
                            gradSound.append("stop").attr("offset", 1 - (maxTime - data2[i].time) / (maxTime - minTime)).attr("stop-color", "white");
                        }
                        if (data[bisect(data, data2[i].time) - 1].sound == fSound) {
                            // Need to use next value so "i"
                            gradSound.append("stop").attr("offset", 1 - (maxTime - data2[i].time) / (maxTime - minTime)).attr("stop-color", colors(data2[i].color));
                        } else {
                            // Set value to white if it's not 0.5 (don't care about the color)
                            gradSound.append("stop").attr("offset", 1 - (maxTime - data2[i].time) / (maxTime - minTime)).attr("stop-color", "white");
                        }
                    }
                }



                // Run all of the sound gradients
                var tmp = [1, 2, 3, 4, 5, 6];
                for (var i = 0; i < yAxisVals.length - 1; i++) {
                    filterSound(tmp[i]);
                }



                $("#other").on("click", function() {
                    shadeGraph.style("fill", "url(#grad" + element + ")");
                    filterColor(1, true);
                    outline.style("opacity", 1);
                });
                $("#monitor").on("click", function() {
                    shadeGraph.style("fill", "url(#grad" + element + ")");
                    filterColor(2, true);
                    outline.style("opacity", 1);
                });
                $("#keyboard").on("click", function() {
                    shadeGraph.style("fill", "url(#grad" + element + ")");
                    filterColor(3, true);
                    outline.style("opacity", 1);
                });
                $("#face").on("click", function() {
                    shadeGraph.style("fill", "url(#grad" + element + ")");
                    filterColor(4, true);
                    outline.style("opacity", 1);
                });
                $("#all").on("click", function() {
                    shadeGraph.style("fill", "url(#grad" + element + ")");
                    filterColor(0, false);
                    outline.style("opacity", 0);
                });
                $("#two-sp-one-ty").on("click", function() {
                    shadeGraph.style("fill", "url(#gradSound6" + element + ")");
                    outline.style("opacity", 1);
                });
                $("#two-sp").on("click", function() {
                    shadeGraph.style("fill", "url(#gradSound5" + element + ")");
                    outline.style("opacity", 1);
                });
                $("#one-sp-one-ty").on("click", function() {
                    shadeGraph.style("fill", "url(#gradSound4" + element + ")");
                    outline.style("opacity", 1);
                });
                $("#one-sp").on("click", function() {
                    shadeGraph.style("fill", "url(#gradSound3" + element + ")");
                    outline.style("opacity", 1);
                });
                $("#one-ty").on("click", function() {
                    shadeGraph.style("fill", "url(#gradSound2" + element + ")");
                    outline.style("opacity", 1);
                });
                $("#silent").on("click", function() {
                    shadeGraph.style("fill", "url(#gradSound1" + element + ")");
                    outline.style("opacity", 1);
                });



            });
            // End Data2 Function
        }
        // End shade

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

}


// Data Files
var DATA1 = {
    g1: "../data/1st/C1/sound_1.csv",
    g2: "../data/1st/C1/color_1.csv"
};

var DATA2 = {
    g1: "../data/1st/C2/sound_2.csv",
    g2: "../data/1st/C2/color_2.csv"
};

graph("graph1", DATA1, "Stages of Distraction Conversation 1");
graph("graph2", DATA2, "Stages of Distraction Conversation 2");
