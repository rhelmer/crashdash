$(function(){
    var api_url = '/api/';
    var products = {'B2G': 'Firefox OS',
                    'Firefox': 'Firefox Desktop',
                    'FennecAndroid': 'Fennec Android',
                    'MetroFirefox': 'Firefox Metro',
                    'Thunderbird': 'Thunderbird',
                    'SeaMonkey': 'SeaMonkey'}
    d3.json(api_url + 'CurrentVersions', function(data) {
        var featured = [];
        data.forEach(function(release, i) {
            if (release.featured) {
                featured.push(release);
            }
        });
        console.log('featured:', featured);
        d3.select('product-list')
            .data(featured)
          .enter().append('li')
            .text(function(d) { return d; });
    });
});
