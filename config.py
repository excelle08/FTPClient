# -*- coding: utf-8 -*-

config = {
    "server_ip": '127.0.0.1',
    "cport": 2122,
    "dport": 23,
    "username": 'anonymous',
    "password": 'elradfmwM'
    }


class ConfigMissingException(Exception):
    pass


def get_config(key, default = None):
    if key in config:
        return config[key]
    if default is None:
        raise ConfigMissingException('Missing config key %s' % key)
    else:
        return default