var margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = 1400 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangePoints([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .ticks(5)
    .orient("left");

var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.episode); })
    .y(function(d) { return y(d.rating); });

var svg = d3.select(".ratings-all").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
  	.attr("style", "fill:#aaa")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.tsv("/data/ratings-all.tsv", function(error, data) {
  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "episode"; }));

  data.forEach(function(d) {
    var re = /(-.*$)/;
    var str = d.episode;
    d.episode = str.replace(re, '');
  });

  var hosts = color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {episode: d.episode, rating: +d[name]};
      })
    };
  });

  x.domain(data.map(function(d) { return d.episode; }));

  y.domain([
    d3.min(hosts, function(c) { return d3.min(c.values, function(v) { return v.rating; }); }),
    d3.max(hosts, function(c) { return d3.max(c.values, function(v) { return v.rating; }); })
  ]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .attr("style", "fill:#aaa")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .attr("style", "fill:#aaa")
      .style("text-anchor", "end")
      .text("Rating");

  var host = svg.selectAll(".host")
      .data(hosts)
      .enter().append("g")
      .attr("class", "host");

  host.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return color(d.name); });

  host.append("text")
      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.episode) + "," + y(d.value.rating) + ")"; })
      .attr("x", 3)
      .attr("dy", ".35em")
      .attr("style", "fill:#aaa")
      .text(function(d) { return d.name; });
});
