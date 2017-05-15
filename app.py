# -*- coding: utf-8 -*-
from webapis import *
import sys, os


def run_app(environ, start_response):
    app._static_folder = os.path.abspath('.') + '/web-ui/static'
    app.config['debug'] = True
    app.secret_key = 'dsafdsagteraf'
    return app(environ, start_response)


if __name__ == '__main__':
    app._static_folder = os.path.abspath('.') + '/web-ui/static'
    app.template_folder = os.path.abspath('.') + '/web-ui/templates'
    app.config['debug'] = True
    app.secret_key = 'dsafdsagteraf'
    app.run(debug=True, host='127.0.0.1')