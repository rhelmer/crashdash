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
        .style('background-position', '100% 0')

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
                var yaxisLabel = 'Crashes / 100 ADI';
                days.forEach(function(day) {
                    var adu = crashesPerAdu.hits[productVersion][day];
                    // TODO hack for B2G
                    if (productName === 'B2G') {
                        data[day] = adu.report_count;
                        yAxisLabel = 'Crashes (No ADI)';
                    } else {
                        data[day] = adu.crash_hadu;
                    }
                });
                graphData[release.version] = data;
                
            });
            drawGraph(sel, productName, graphData, yAxisLabel);
        });
    });
});

function topcrashReport(productName, version) {
    d3.select('.report')
        .style('display', 'inline');
    d3.json(api_url + 'TCBS/?product=' + productName
            + '&version=' + version, function(tcbs) {
        d3.select('#topcrasher')
            .append('table')
            .style('border-collapse', 'collapse')
            .style('border', '2px black solid')

            .selectAll('tr')
            .data(tcbs.crashes)
            .enter().append('tr')
            .on('click', function(d) {
                d3.select('#topcrasher table')
                    .remove();
                reportListReport(d.signature);
            })

            .selectAll('td')
            .data(function(d) {
                return [d.currentRank,
                        (d.percentOfTotal * 100).toFixed(2) + '%',
                        d.changeInRank, d.count, d.signature];
            })
            .enter().append('td')
            .style('border', '1px black solid')
            .style('padding', '5px')
            .text(function(d) {
                return d;
            });
    });
}

function reportListReport(signature) {
    d3.select('#reportlist')
        .style('display', 'inline');
    d3.json(api_url + 'ReportList/?end_date=2014-03-26&signature=' + signature + '&start_date=2014-03-23', function(reportList) {
        d3.select('#reportlist')
            .append('table')
            .style('border-collapse', 'collapse')
            .style('border', '2px black solid')

            .selectAll('tr')
            .data(reportList.hits)
            .enter().append('tr')
            .on('click', function(d) {
                d3.select('#reportlist table')
                    .remove();
                reportIndexReport(d.uuid);
            })

            .selectAll('td')
            .data(function(d) {
                return [d.date_processed, d.duplicate_of, d.product, d.version,
                        d.build, d.os_name, d.cpu_name, d.reason, d.address,
                        d.uptime, d.install_time];
            })
            .enter().append('td')
            .style('border', '1px black solid')
            .style('padding', '5px')
            .text(function(d) {
                return d;
            });
    });
}

function reportIndexReport(uuid) {
    d3.select('#reportindex')
        .style('display', 'inline');
    d3.json(api_url + 'ProcessedCrash/?crash_id=' + uuid,
            function(processedCrash) {
        d3.select('#reportindex')
            .append('table')
            .style('border-collapse', 'collapse')
            .style('border', '2px black solid')

            .selectAll('tr')
            .data(d3.keys(processedCrash))
            .enter().append('tr')

            .selectAll('td')
            .data(function(d) {
                if (d == 'dump' || d == 'json_dump') {
                    return false;
                }
                return [d, processedCrash[d]];
            })
            .enter().append('td')
            .style('border', '1px black solid')
            .style('padding', '5px')
            .text(function(d) {
                return d;
            });
    });
}

d3.select('.close-report')
    .on('click', function(d) {
        d3.select('#topcrasher table')
            .remove();
        d3.select('#reportlist table')
            .remove();
        d3.select('#reportindex table')
            .remove();
        d3.select('.report')
            .style('display', 'none');
    });
