$(function(){
    var api_url = '/api/';
    $.getJSON(api_url + 'CurrentVersions', function(payload) {
        var featured = {};
        $.each(payload, function(idx, release) {
            if (release.featured) {
                if (release.product in featured) {
                    featured[release.product].push(release.version);
                } else {
                    featured[release.product] = [release.version];
                }
            }
        });
        $.each(featured, function(product, versions) {
            $('#product-list')
                .append('<a href="' + product + '">' +
                        '<li>' +
                        product + '<br>' +
                        '<img src="/static/' + product + '.png">' +
                        '</li>' +
                        '</a>');
            crashesPerAdu(product, versions);
        });
    });

    function crashesPerAdu(product, versions) {
        $.getJSON(api_url + 'CrashesPerAdu/?product=' + product +
            '&versions=' + versions.join('&versions='),
            function(payload) {
            $.each(payload.hits, function(productVersion, data) {
                console.log(productVersion);
            });
        });
    }
});
