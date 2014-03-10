$(function(){
    var api_url = '/api/';
    var products = {'B2G': 'Firefox OS',
                    'Firefox': 'Firefox Desktop',
                    'FennecAndroid': 'Fennec Android',
                    'MetroFirefox': 'Firefox Metro',
                    'Thunderbird': 'Thunderbird',
                    'SeaMonkey': 'SeaMonkey'}

    d3.json(api_url + 'CurrentVersions', function(data) {
        var featured = {};
        data.forEach(function(release, i) {
            if (release.featured) {
                var productName = release.product;
                if (productName in featured) {
                    featured[productName].push(release);
                } else {
                    featured[productName] = [release]
                }
            }
        });
        d3.select('ul').selectAll('li')
            .data(Object.keys(products))
          .enter().append('li')
            .text(function(d) {
                return products[d];
            })
          .append('img')
            .attr({
                'src': function(d) { return ('/static/' + d + '.png'); }
            });
    });
});
