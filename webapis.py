# -*- coding: utf-8 -*-

from flask import Flask, Response, redirect, session
from flask import request, jsonify, make_response, render_template
from ftp_core import FTPException, FTPClientConnection
from model import File
from random import random
from config import get_config
import json, time, hashlib


app = Flask(__name__)
conns = dict()


def get_conn():
    if 'sessionid' not in session:
        return None
    if session['sessionid'] not in conns:
        return None
    return conns[session['sessionid']]


def get_session_id():
    random_str = str(time.time()) + str(random())
    return hashlib.md5(random_str.encode('utf-8')).hexdigest()


def return_json(obj):
    return Response(json.dumps(obj), mimetype='application/json')


@app.errorhandler(FTPException)
def handle_ftp_exception(error):
    resp = jsonify(error=500, message=error.message, data='')
    resp.status_code = 500
    return resp


@app.route('/', methods=['GET'])
def index_page():
    return render_template('index.html')


@app.route('/login', methods=['GET'])
def login_page():
    return render_template('login.html')


@app.route('/ftp/user', methods=['POST'])
def login_api():
    conn = FTPClientConnection(server=get_config('server_ip'),
                               control_port=get_config('cport'),
                               data_port=get_config('dport'),
                               username=get_config('username'),
                               password=get_config('password'))
    id = get_session_id()
    session['sessionid'] = id
    if 'username' in request.form:
        conn.username = request.form['username']
        conn.password = request.form['password']

    response = conn.login()
    conns[id] = conn
    return return_json({'code': response[0], 'message': response[1]})


@app.route('/ftp/root/', methods=['GET'])
def list_root():
    return list_or_retr('/')


@app.route('/ftp/root/<path:path>', methods=['GET'])
def list_or_retr(path):
    conn = get_conn()
    # Do list if the arg indicates directory:
    if path[-1] == '/':
        conn.cwd(path)
        data = conn.list().split('\r\n')
        file_list = []
        for line in data:
            if not line:
                continue
            print(line)
            f = File(line)
            file_list.append(f.dict)
        return return_json(file_list)
    else:
        return conn.direct_retr(path)


@app.route('/ftp/root/<path:path>', methods=['PUT'])
def put_file(path):
    conn = get_conn()
    if path[-1] == '/':
        resp = conn.mkdir(path)
        return return_json({'code': resp[0], 'message': resp[1]})
    else:
        pass


@app.route('/ftp/root/<path:path>', methods=['DELETE'])
def delete_file(path):
    conn = get_conn()
    if path[-1] == '/':
        resp = conn.rmdir(path)
        return return_json({'code': resp[0], 'message': resp[1]})
    else:
        pass


@app.route('/ftp/pwd', methods=['GET'])
def print_working_dir():
    conn = get_conn()
    return return_json({'working_dir': conn.pwd()[1]})


@app.route('/logout')
def logout():
    del conns[session['sessionid']]
    return return_json({'status': 'OK'})