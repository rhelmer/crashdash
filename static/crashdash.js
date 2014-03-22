$(function(){
    var api_url = '/api/';
    var products = {'B2G': 'Firefox OS',
                    'Firefox': 'Firefox Desktop',
                    'FennecAndroid': 'Fennec Android',
                    'MetroFirefox': 'Firefox Metro',
                    'Thunderbird': 'Thunderbird',
                    'SeaMonkey': 'SeaMonkey'}

    d3.json(api_url + 'ExplosiveCrashes/', function(explosiveCrashes) {
        var crashes = explosiveCrashes['hits'];
        d3.select('#warnings').selectAll('div')
            .data(crashes)
            .enter()
            .append('span')
            .text(function(d) { 
                return 'Explosive crash: ' + d;
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
            .data(Object.keys(products))
            .enter()
            .append('li')
            .text(function(d) { return products[d]; })
            .attr('id', function(d) { return d; })
            .append('img')
            .attr({
                'src': function(d) {
                    return ('/static/' + d + '.png');
                }
            })
        Object.keys(products).forEach(function(productName) {
            var url = api_url + 'CrashesPerAdu/' + '?product=' + productName;
            for (var i=0; i < featured[productName].length; i++) {
                url += '&versions=' + featured[productName][i].version;
            }
            var versions = [];
            featured[productName].forEach(function(release) {
                versions.push(release.version);
            });
            d3.select('li#' + productName).selectAll('div')
                .data(versions)
                .enter()
                .append('p')
                .text(function(d) {
                    return d;
                })
                .attr('id', function(d) { return d; })
                .attr('class', productName)

            d3.json(url, function(crashesPerAdu) {
                featured[productName].forEach(function(release) {
                    var productVersion = productName + ':' + release.version;
                    console.log(crashesPerAdu.hits[productVersion]);
                });
            });
        });
    });
});
