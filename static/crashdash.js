$(function(){
    var api_url = 'http://localhost:5000/api/';
    $.get(api_url + 'CrontabberState', function(payload) {
        console.log(payload);
    });
});
