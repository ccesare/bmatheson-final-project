var app;

d3.queue()
  .defer(d3.json, 'data/data.json')
  .awaitAll(function (error, results) {
    if (error) { throw error; }
    app.initialize(results[0]);

  });

app = {
  data: [],
  components: [],

  options: {
    value: 'reports',
    filtered: true,
    form: 'all',
  },

  initialize: function (data) {
    app.data = data;

    parseDate = d3.timeParse("%m/%d/%Y"); //https://bl.ocks.org/d3noob/0e276dc70bb9184727ee47d6dd06e915

    data.forEach(function(d) {
        d.date = parseDate(d.date)
    });

    app.components = [
      new Chart('#chart')
    ];

    // Data Scale Transformations Reports / Pages / Dollars
    d3.select("#reports").on("click", function() { 
      if (app.options.value !== 'reports') {app.options.value = 'reports';
       app.components.forEach(function (d) {d.update(); });
      }});

    d3.select("#pages").on("click", function() { 
      if (app.options.value !== 'pages') {app.options.value = 'pages';
      app.components.forEach(function (d) {d.update(); });
      }
    });

    d3.select("#dollars").on("click", function() { 
      if (app.options.value !== 'dollars') {app.options.value = 'dollars';
      app.components.forEach(function (d) {d.update(); });
      }
    });

    // Highlight specific report type
    d3.select('#f3b').on("click", function() {
      if (app.options.form !== 'f3') {app.options.form = 'f3';
      app.components.forEach(function (d) {d.update(); });
      }
    });

    d3.select('#f3xb').on("click", function() {
      if (app.options.form !== 'f3X') {app.options.form = 'f3X';
      app.components.forEach(function (d) {d.update(); });
      }
    });

    d3.select('#f5b').on("click", function() {
      if (app.options.form !== 'f5') {app.options.form = 'f5';
      app.components.forEach(function (d) {d.update(); });
      }
    });

   d3.select('#all').on("click", function() {
      if (app.options.form !== 'all') {app.options.form = 'all';
      app.components.forEach(function (d){d.update(); })
    }
    });



    // app.update();
  },

  update: function () {
    app.components.forEach(function (c) { if (c.update) { c.update(); }});
  }
}

function Chart(selector) {
  var chart = this;

  // SVG and MARGINS

  var margin = {
    top: 15, right: 25, bottom: 40, left: 75
  };

  chart.width = 1000 - margin.left - margin.right;
  chart.height = 400 - margin.top - margin.bottom;

  chart.svg = d3.select(selector)
    .append('svg')
    .attr('width', chart.width + margin.left + margin.right)
    .attr('height', chart.height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // SCALES

  chart.x = d3.scaleTime()
    .domain([d3.min(app.data, function (d) { return d.date; }), d3.max(app.data, function (d) { return d.date; })])
    .range([0, chart.width])
    .nice();

  chart.y = d3.scaleLinear()
    .domain([0, 0]) // temporary y scale holder until update function runs.
    .range([chart.height, 0])
    .nice();

  // AXES

  var xAxis = d3.axisBottom()
    .scale(chart.x);

  var yAxis = d3.axisLeft()
    .scale(chart.y)

  chart.svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + chart.height + ')')
    .call(xAxis)
    .append('text')
    .attr('y', 30)
    .attr('x', chart.width)
    .style('text-anchor', 'end')
    .style('fill', '#000')
    .style('font-weight', 'bold')
    .text('Date');

  chart.svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis)
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', -65)
    .attr('x', 0)
    .style('text-anchor', 'end')
    .style('fill', '#000')
    .style('font-weight', 'bold')
    .text('Quantity');

  pathF3X = chart.svg.append("path");
  pathF3 = chart.svg.append("path");
  pathF5 = chart.svg.append("path");

// tooltip attempt (https://bl.ocks.org/mbostock/3902569)

  focus = chart.svg.append("g")
      .attr("class", "focus")
      .style("display", "none");

  focus.append("circle")
      .attr('id',"f3xcirc")
      .attr("r", 4.5);

  focus.append("circle")
      .attr('id',"f3circ")
      .attr("r", 4.5);

  focus.append("circle")
      .attr('id',"f5circ")
      .attr("r", 4.5);

  focus.append("text")
      .attr("x", 9)
      .attr("dy", ".35em");

  chart.svg.append("rect")
      .attr("class", "overlay")
      .attr("width", chart.width)
      .attr("height", chart.height);

  chart.update();

}

Chart.prototype = {
  update: function () {
    var chart = this;

    // TRANSFORM DATA

    var txData = app.data.slice();

    if (app.options.filtered) {
      txData = txData.filter(function (d){ return d.value === app.options.value;
      })
    }

    var maxF3 = d3.max(txData, function (d) { return d.f3; })
    var maxF3X = d3.max(txData, function (d) { return d.f3x; })

    chart.y = d3.scaleSqrt()
      .domain([0, d3.max([maxF3,maxF3X])])
      .range([chart.height, 0])
      .nice();

    var yAxis = d3.axisLeft()
      .scale(chart.y)
      .tickSize(-chart.width);

    chart.svg.select('.y.axis')
      .transition().duration(2000).call(yAxis);

    // UPDATE CHART ELEMENTS

    lineF3 = d3.line()
      .x(function (d) { return chart.x(d.date)})
      .y(function (d) { return chart.y(d.f3)})

    lineF3X = d3.line()
      .x(function (d) { return chart.x(d.date)})
      .y(function (d) { return chart.y(d.f3x)})

    lineF5 = d3.line()
      .x(function (d) { return chart.x(d.date)})
      .y(function (d) { return chart.y(d.f5)})

    pathF3X.datum(txData)
        .attr("class", function () { 
          if (app.options.form === "f3X"|| app.options.form === "all") {return "f3x"} else {return "inactivef3x"}
        })  
        .attr("d",lineF3X);

    pathF3.datum(txData)
        .attr("class", function () { 
          if (app.options.form === "f3"|| app.options.form === "all") {return "f3"} else {return "inactivef3"}
        })
        .attr("d",lineF3);

    pathF5.datum(txData)
        .attr("class", function () { 
          if (app.options.form === "f5"|| app.options.form === "all") {return "f5"} else {return "inactivef5"}
        })
        .attr("d",lineF5);

  var bisectDate = d3.bisector(function(d) { return d.date; }).left;

  formatTime = d3.timeFormat("%0m/%0d/%Y")
  percFormat = d3.format(",.1%") 

  minDate = d3.min(app.data,function (d) {return d.date})
  maxDate = d3.max(app.data,function (d) {return d.date})

  totDays = (maxDate - minDate)/1000/60/60/24
  totReps = d3.sum(txData, function(d) { return d.f3; });

  console.log(totReps)


    chart.svg
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on('mousemove', mousemove);

      function mousemove() {
          var x0 = chart.x.invert(d3.mouse(this)[0]),
          i = bisectDate(txData, x0, 1),
          d0 = txData[i - 1],
          d1 = txData[i],
          d = x0 - d0.date > d1.date - x0 ? d1 : d0
          percDays = ((d1.date-minDate)/1000/60/60/24)/totDays;
          // percF3 = 
      focus.select("#f3xcirc").attr("transform", "translate(" + chart.x(d.date) + "," + chart.y(d.f3x) + ")");
      focus.select("#f3circ").attr("transform", "translate(" + chart.x(d.date) + "," + chart.y(d.f3) + ")");
      focus.select("#f5circ").attr("transform", "translate(" + chart.x(d.date) + "," + chart.y(d.f5) + ")");
      d3.select("#date").html(function (d){return formatTime(d0.date)});
      d3.select("#percentDates").html(function (d){return percFormat(percDays)});
    };

  }
}