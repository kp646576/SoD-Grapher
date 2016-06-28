// Shade using white space
function filterSound(fSound) {
    var gradSound = svg.append("defs")
        .append("linearGradient")
        .attr("id", "gradSound" + fSound);

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
