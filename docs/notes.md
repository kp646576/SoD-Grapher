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