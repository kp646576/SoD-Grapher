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

    var bgColor = "transparent";
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
                var filters = new Array();
                var numColors = 4;
                for (var i = 0; i < numColors; i++) {
                    filters[i] = new Array();
                }
                var prevColor, curColor;






                for (var i = 1; i < data2.length; i++) {
                    prevColor = data2[i - 1].color;
                    curColor = data2[i].color;

                    var tmp1 = addColorStop(grad, data2[i].time, colors(data2[i - 1].color));
                    //console.log(data2[i - 1].color - 1);
                    filters[data2[i - 1].color - 1].push(tmp1);

                    var tmp2 = addColorStop(grad, data2[i].time, colors(data2[i].color));
                    filters[data2[i].color - 1].push(tmp2);
                }


                /*for (var i = 1; i < data2.length; i++) {
                    stop.push(addColorStop(grad, data2[i].time, colors(data2[i - 1].color)));
                    start.push(addColorStop(grad, data2[i].time, colors(data2[i].color)));
                }*/

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





                // Cut finely, and turn on off through opacity 

                var bisect = d3.bisector(function(d) {
                    return d.time;
                }).left;





                var gradPointers = new Array();

                var numY1 = 6;
                for (var i = 0; i < numColors; i++) {
                    gradPointers[i] = new Array(6);
                    for (var j = 0; j < numY1; j++) {
                        gradPointers[i][j] = new Array();
                    }
                }

                // Offset color and sound by 1 to start from 0 index


                //[y1][y2];

                function filterByY1(filterY1) {
                    var gradY1 = svg.append("defs")
                        .append("linearGradient")
                        .attr("id", "gradY1" + element);

                    for (var i = 1; i < data2.length; i++) {
                        var data2Color = data2[i - 1].color;

                        // Get same color values from certain range
                        var range = data.filter(function(d) {
                            return d.time < data2[i].time && d.time >= data2[i - 1].time;
                        });

                        // From previous color set to new color
                        var prevY2 = i > 1 ? data[bisect(data, data2[i - 1].time) - 1] : data[bisect(data, data2[i - 1].time)];
                        if (range.length > 0 && prevY2.sound != range[0].sound) {
                            gradPointers[data2[i - 1].color - 1][prevY2.sound - 1].push(addColorStop(gradY1, range[0].time, colors(data2[i - 1].color)));
                        }

                        // Set contains only 1 value
                        if (range.length == 1) {
                            gradPointers[data2Color - 1][range[0].sound - 1].push(addColorStop(gradY1, range[0].time, colors(data2Color)));
                        }


                        for (var j = 1; j < range.length; j++) {
                            if (range[j].time < 22) {
                                //console.log(range[j].time);
                                //console.log(range.length);
                            }

                            // Previous point
                            if (j > 1 && range[j - 2].sound != range[j - 1].sound)
                                gradPointers[data2Color - 1][range[j - 2].sound - 1].push(addColorStop(gradY1, range[j - 1].time, colors(data2Color)));
                            gradPointers[data2Color - 1][range[j - 1].sound - 1].push(addColorStop(gradY1, range[j - 1].time, colors(data2Color)));

                            // Current point
                            if (range[j - 1].sound != range[j].sound)
                                gradPointers[data2Color - 1][range[j - 1].sound - 1].push(addColorStop(gradY1, range[j].time, colors(data2Color)));
                            gradPointers[data2Color - 1][range[j].sound - 1].push(addColorStop(gradY1, range[j].time, colors(data2Color)));

                        }


                        // Boundary check (for sharp color change to the next color)
                        var endingVal = data[bisect(data, data2[i].time) - 1].sound - 1;
                        gradPointers[data2Color - 1][endingVal].push(addColorStop(gradY1, data2[i].time, colors(data2Color)));
                        // offset 1
                        gradPointers[data2[i].color - 1][endingVal].push(addColorStop(gradY1, data2[i].time, colors(data2[i].color)));
                    }
                }


                filterByY1();
                shadeGraph.style("fill", "url(#gradY1" + element + ")");

                // [color][silent] ... [2 speaker & 1 typer] [values of each]
                var setManager = [];
                var unsetManager = [0, 1, 2, 3];

                var setY1Manager = [];
                var unsetY1Manager = [0, 1, 2, 3, 4, 5];


                function filterController() {
                    var internalSetManager, internalY1Manager;
                    // if all is on then 
                    if (setManager.length == 0)
                        internalSetManager = [0, 1, 2, 3];
                    else
                        internalSetManager = setManager;

                    if (setY1Manager.length == 0)
                        internalSetY1Manager = [0, 1, 2, 3, 4, 5]
                    else
                        internalSetY1Manager = setY1Manager;


                    // Unset (needs to be first)
                    for (var i = 0; i < gradPointers.length; i++) {
                        for (var l = 0; l < unsetManager.length; l++) {
                            if (i == unsetManager[l]) {
                                for (var j = 0; j < gradPointers[i].length; j++) {

                                    for (var k = 0; k < gradPointers[i][j].length; k++) {
                                        gradPointers[i][j][k].attr('style', 'stop-opacity:0');
                                    }
                                }
                            }
                        }
                    }
                    // Set
                    for (var i = 0; i < gradPointers.length; i++) {
                        for (var l = 0; l < internalSetManager.length; l++) {
                            if (i == internalSetManager[l]) {
                                for (var j = 0; j < gradPointers[i].length; j++) {
                                    for (var m = 0; m < internalSetY1Manager.length; m++) {
                                        if (j == internalSetY1Manager[m]) {
                                            for (var k = 0; k < gradPointers[i][j].length; k++) {
                                                gradPointers[i][j][k].attr('style', 'stop-opacity:1');
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    //}
                }

                //$("[name='my-checkbox2']").bootstrapSwitch('onColor', 'success');
                //$('#other').bootstrapToggle();

                function clickRoutine(prop, manager, value) {
                    $('#all').prop('checked', false).change()
                    if ($(prop).prop('checked')) {
                        manager.push(value);
                    } else {
                        var index = manager.indexOf(value);
                        manager.splice(index, 1);
                    }
                    //console.log(setManager);
                    filterController();
                    outline.style("opacity", 1);
                }

                //$("#all").bootstrapToggle("off");
                $("#other").change(function() {
                    clickRoutine("#other", setManager, 0);
                });

                $("#monitor").change(function() {
                    clickRoutine("#monitor", setManager, 1);
                });

                $("#keyboard").change(function() {
                    clickRoutine("#keyboard", setManager, 2);
                });

                $("#face").change(function() {
                    clickRoutine("#face", setManager, 3);
                });


                var variables = ["other", "monitor", "keyboard", "face", "silent", "one-ty", "one-sp", "one-sp-one-ty", "two-sp", "two-sp-one-ty"];

                $("#all").change(function() {
                    if ($(this).prop('checked')) {
                        for (var i = 0; i < variables.length; i++) {
                            $("#" + variables[i]).bootstrapToggle("off")
                        }
                        // Namespace issue
                        //outline.style("opacity", 0);
                        filterController();
                    }
                });

                $("#silent").change(function() {
                    clickRoutine("#silent", setY1Manager, 0);
                });

                $("#one-ty").change(function() {
                    clickRoutine("#one-ty", setY1Manager, 1);
                });

                $("#one-sp").change(function() {
                    clickRoutine("#one-sp", setY1Manager, 2);
                });

                $("#one-sp-one-ty").change(function() {
                    clickRoutine("#one-sp-one-ty", setY1Manager, 3);
                });

                $("#two-sp").change(function() {
                    clickRoutine("#two-sp", setY1Manager, 4);
                });

                $("#two-sp-one-ty").change(function() {
                    clickRoutine("#two-sp-one-ty", setY1Manager, 5);
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
