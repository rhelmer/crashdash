function drawGraph(sel, productName, data, yAxisLabel) {
    var margin = {top: 50, right: 80, bottom: 50, left: 50},
        width = 300 - margin.left - margin.right,
        height = 220 - margin.top - margin.bottom;
    
    var parseDate = d3.time.format("%Y-%m-%d").parse;
    
    var x = d3.time.scale()
        .range([0, width]);
    
    var y = d3.scale.linear()
        .range([height, 0]);
    
    var color = d3.scale.category10();
    
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom").ticks(4)
        .tickFormat(d3.time.format('%m-%d'));
    
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");
    
    var line = d3.svg.line()
        .interpolate("basis")
        .x(function(d) {
            return x(d.date);
        })
        .y(function(d) {
            return y(d.crashes);
        });
    
    var svg = d3.select(sel).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    color.domain(
        d3.keys(data).filter(function(version) {
            return version;
        })
    );

    var dates = [];
    d3.keys(data).forEach(function(version) {
        d3.keys(data[version]).forEach(function(date) {
            dates.push(parseDate(date));
        });
    });

    var versions = color.domain().map(function(version) {
        return {
            version: version,
            values: d3.keys(data[version]).sort().map(function(d) {
                return {
                    date: parseDate(d),
                    crashes: data[version][d]};
            })
        };
    });

    x.domain(d3.extent(dates));

    y.domain([
        d3.min(versions, function(c) {
            return d3.min(c.values, function(v) {
                return v.crashes;
            });
        }),
        d3.max(versions, function(c) {
            return d3.max(c.values, function(v) {
                return v.crashes;
            });
        })
    ]);
  
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height + 25) +")")
        .call(xAxis)
        .selectAll("text")
            .attr("transform", function(d) {
                return "rotate(-65)"
            });

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(yAxisLabel);
  
    var version = svg.selectAll(".version")
        .data(versions)
      .enter().append("g")
        .attr("class", "version");
  
    version.append("path")
        .attr("class", "line")
        .attr("d", function(d) {
            return line(d.values);
        })
        .style("stroke", function(d) {
            return color(d.version);
        });
  
    d3.select(sel).selectAll('span')
        .data(versions)
      .enter()
        .append('span')
        .style('color', function(d) {
            return color(d.version);
        })
        .style('padding', '5px')
        .style('font-size', '14px')
        .style('font-family', 'sans-serif')
        .on('click', function(d) {
            topcrashReport(productName, d.version);
        })
        .text(function(d) {
            return d.version;
        });
}
