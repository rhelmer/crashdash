#!/usr/bin/env python

from flask import Flask, Response, render_template, request
from flask.ext.cache import Cache
from urllib import urlencode
import requests
import os

app = Flask(__name__)

api_url = 'https://crash-stats.allizom.org/api'
proxy_cache = 60 # minutes

# Set up cache
cache_config = {
  'CACHE_TYPE': 'filesystem',
  'CACHE_THRESHOLD': 1000,
  'CACHE_DIR': 'cache'
}
cache = Cache(config = cache_config)
cache.init_app(app, config = cache_config)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/<endpoint>/')
def api(endpoint):
    request_url = '%s/%s' % (api_url, endpoint)
    proxy_request = make_proxy(request_url, request.args)
    return Response(proxy_request.text)

@cache.memoize(proxy_cache * 60)
def make_proxy(url, params):
    # requests doesn't support multidict yet :(
    # https://github.com/kennethreitz/requests/issues/1155

    url += '?'
    for key in params:
        for val in params.getlist(key):
            url += '%s=%s&' % (key, val)

    return requests.get(url)

if __name__ == '__main__':
    # Bind to PORT if defined, otherwise default to 5000.
    port = int(os.environ.get('PORT', 5000))
    app.debug = True
    app.run(host='0.0.0.0', port=port)
