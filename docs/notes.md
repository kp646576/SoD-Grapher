Fix issue with setting max domain from importing data


Shades whole graph color green
grad.select("stop")
.attr("offset", 1)
.attr("stop-color", "green");


Ex:  
data1:
...
[45]: 130.32
[46]: 132.54
...

data2:
[0]: 131.34

bisect(data1, data2[0]) --> [46]

To floor need to use:
	bisect(data1, data2[0]) - 1 --> 45

Meaning this does not work for 0th element unless smaller

skips


Constant chaining? Probably not
stop[i].transition().attr("stop-color", curColor);









// Set up initial gradient
Started index at 1 to avoid additional computations (i + 1)'s

```
var stop = [];
var start = [];
for (var i = 1; i < data2.length; i++) {
    stop.push(addColorStop(grad, data2[i].time, colors(data2[i - 1].color)));
    start.push(addColorStop(grad, data2[i].time, colors(data2[i].color))); 
}
```


                // Setting up where to stop colors (need to use stop/start of next color to get sharp contrasts versus blur)
                // Do not have to worry about shading last value (will use last value until the end)
                // Use data from second graph
                // Hack needed to change color using gradient to have abrupt color changes
