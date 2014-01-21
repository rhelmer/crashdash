$(function(){
    var api_url = '/api/';
    $.getJSON(api_url + 'CurrentVersions', function(payload) {
        var featured = {};
        $.each(payload, function(idx, release) {
            if (release.featured) {
                featured[release.product] = release.version;
            }
        });
        $.each(featured, function(product, version) {
            $('#product-list')
                .append('<a href="' + product + '">' +
                        '<li>' +
                        product + '<br>' +
                        '<img src="/static/' + product + '.png">' +
                        '</li>' +
                        '</a>');
        });
    });

    function crashTrends(product, version) {
        $.getJSON(api_url + 'CrashTrends/?end_date=2014-01-21&product=' + product + '&start_date=2014-01-19&version=' + version, function(payload) {
            $.each(payload.crashtrends, function(idx, trend) {
            });
        });
    }
});
