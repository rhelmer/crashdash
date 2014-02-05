$(function(){
    var api_url = '/api/';
    var products = {'B2G': 'Firefox OS',
                    'Firefox': 'Firefox Desktop',
                    'FennecAndroid': 'Fennec Android',
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
            var sparklines = '';
            for (i in versions) {
                var version = versions[i].replace('.', '_', 'g');
                var channel = channelFromVersion(version);
                sparklines += '<p title="' + versions[i] +'" class="spark">' +
                           '<span class="spark" id="sparkline-' +
                           product + '-' + version + '"></span>' + channel +
                            '</p>';
            }

            $('#product-list')
                .append('<a ' +
                        'href="https://crash-stats.allizom.org/home/products/' +                        product + '">' +
                        '<li>' +
                        '<img src="/static/' + product + '.png">' +
                        productName + '<br>' +
                        sparklines +
                        '</li>' +
                        '</a>');
            crashesPerAdu(product, versions);
        }
    });

    generateWarnings();


    function crashesPerAdu(product, versions) {
        // FIXME hardcoded from_date
        var url = api_url + 'CrashesPerAdu/?product=' + product +
            '&from_date=2014-01-01&versions=' + versions.join('&versions=');
        $.getJSON(url, function(payload) {
            var results = {};
            $.each(payload.hits, function(productVersion, data) {
                var version = productVersion.split(':')[1];
                version = version.replace('.', '_', 'g');
                var series = [];
                $.each(data, function(date, raw) {
                    series.push(raw.crash_hadu);
                })
                var channel = channelFromVersion(version);
                var color = '';
                if (channel == 'nightly') {
                    color = 'red';
                } else if (channel == 'aurora') {
                    color = 'orange';
                } else if (channel == 'beta') {
                    color = 'yellow';
                } else {
                    color = 'green';
                }
                $('#sparkline-' + product + '-' + version).sparkline(series,
                    { lineColor: color,
                      fillColor: false,
                      disableInteraction: true });
            });
        });
    }

    function channelFromVersion(version) {
        var channel = 'release';

        if (version.indexOf('a1') != -1) {
            channel = 'nightly';
        } else if (version.indexOf('a2') != -1) {
            channel = 'aurora';
        } else if (version.indexOf('b') != -1) {
            channel = 'beta';
        }

        return channel;
    }


    function generateWarnings() {
        var url = api_url + 'ExplosiveCrashes/' +
            '?end_date=2014-01-22&start_date=2013-12-22';
        var payload = $.getJSON(url);
        $.getJSON(url, function(payload) {
            $.each(payload.hits, function(idx, data) {
                $('#warnings').append('Exploding signatures:'+
                  '<a href="https://crash-stats.mozilla.com/explosive/">' 
                  + data.signatures + '</a><br />');
            });
        });
    }
});
