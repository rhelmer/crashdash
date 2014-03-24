$(function(){
    var api_url = '/api/';
    var products = {'B2G': 'Firefox OS',
                    'Firefox': 'Firefox Desktop',
                    'MetroFirefox': 'Firefox for Metro',
                    'FennecAndroid': 'Fennec Android',
                    'Thunderbird': 'Thunderbird',
                    'SeaMonkey': 'SeaMonkey'}

    d3.json(api_url + 'ExplosiveCrashes/', function(explosiveCrashes) {
        var crashes = explosiveCrashes['hits'];
        d3.select('#warnings').selectAll('article')
            .data(crashes)
            .enter()
            .append('p')
            .text(function(d) { 
                console.log(d);
                return 'Explosive signature: ' + d.signatures;
            })
    });

    d3.json(api_url + 'CurrentVersions/', function(currentVersions) {
        var featured = {};
        currentVersions.forEach(function(release, i) {
            var productName = release.product;
            if (release.featured) {
                if (productName in featured) {
                    featured[productName].push(release);
                } else {
                    featured[productName] = [release]
                }
            }
        });
        d3.select('ul').selectAll('li')
            .data(d3.keys(products))
            .enter()
            .append('li')
            .text(function(d) { return products[d]; })
            .attr('id', function(d) { return d; })
            .style({
                'background-image': function(d) {
                    return 'url(/static/' + d + '.png';
                }
            })
            .style('background-repeat', 'no-repeat')
            .style('background-position', '100% 0');

        d3.keys(products).forEach(function(productName) {
            var url = api_url + 'CrashesPerAdu/' + '?product=' + productName;
            for (var i=0; i < featured[productName].length; i++) {
                url += '&versions=' + featured[productName][i].version;
            }
            var versions = [];
            featured[productName].forEach(function(release) {
                versions.push(release.version);
            });

            d3.json(url, function(crashesPerAdu) {
                var graphData = {};
                var sel = 'li#' + productName;
                featured[productName].some(function(release) {
                    var productVersion = productName + ':' + release.version;
                    if (crashesPerAdu.hits[productVersion] === undefined) {
                        return false;
                    }
                    var days = d3.keys(crashesPerAdu.hits[productVersion]);
                    var data = {};
                    days.forEach(function(day) {
                        var adu = crashesPerAdu.hits[productVersion][day];
                        // TODO hack for B2G
                        if (productName === 'B2G') {
                            data[day] = adu.report_count;
                        } else {
                            data[day] = adu.crash_hadu;
                        }
                    });
                    graphData[release.version] = data;
                    
                });
                drawGraph(sel, productName, graphData);
            });
        });
    });
});

function drawGraph(sel, productName, data) {
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

    var yaxis_label = 'Crashes / 100 ADI';
    // TODO hack for B2G
    if (productName === 'B2G') {
        yaxis_label = 'Crashes (No ADI)';
    }
  
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(yaxis_label);
  
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
  
    version.append("text")
        .datum(function(d) {
            return {
                version: d.version,
                value: d.values[d.values.length - 1]
            };
        })
        .attr("transform", function(d) {
            return "translate(" + x(d.value.date) + "," +
                   y(d.value.crashes) + ")";
        })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function(d) {
            return d.version;
        });
}
