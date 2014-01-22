$(function(){
    var api_url = '/api/';
    var products = {'B2G': 'Firefox OS',
                    'Firefox': 'Firefox Desktop',
                    'FennecAndroid': 'Fennec',
                    'MetroFirefox': 'Firefox Metro',
                    'Thunderbird': 'Thunderbird',
                    'SeaMonkey': 'SeaMonkey'}
    $.getJSON(api_url + 'CurrentVersions', function(payload) {
        var featured = {};
        $.each(payload, function(idx, release) {
            if (release.featured) {
                if (release.product in products) {
                    if (release.product in featured) {
                        featured[release.product].push(release.version);
                    } else {
                        featured[release.product] = [release.version];
                    }
                }
            }
        });
        for (product in products) {
            var versions = featured[product];
            var productName = products[product];
            $('#product-list')
                .append('<a ' +
                        'href="https://crash-stats.allizom.org/home/products/' +                        product + '">' +
                        '<li>' +
                        productName + '<br>' +
                        '<img src="/static/' + product + '.png">' +
                        '</li>' +
                        '</a>');
            crashesPerAdu(product, versions);
        }
    });

    function crashesPerAdu(product, versions) {
        $.getJSON(api_url + 'CrashesPerAdu/?product=' + product +
            '&versions=' + versions.join('&versions='),
            function(payload) {
            $.each(payload.hits, function(productVersion, data) {
                var version = productVersion.split(':')[1];
            });
        });
    }
});
