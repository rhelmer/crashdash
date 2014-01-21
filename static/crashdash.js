$(function(){
    var api_url = 'http://localhost:5000/api/';
    $.get(api_url + 'CrashTrends/?end_date=2014-01-21&product=Firefox&start_date=2014-01-19&version=29.0a1', function(payload) {
        console.log(payload);
    });
});
