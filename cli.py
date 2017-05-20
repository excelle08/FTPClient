# -*- coding: utf-8 -*-

import ftp_core

def help():
    print('PWD; TYPE <t>; MLSD <dirname>; FEAT; LIST; CWD <dir>; RETR <path> <dest>;'
          'STOR <src> <dest>; DELE <name>; MV <orig> <new>; HELP; EXIT')

server = input('Server IP: ')
port = input('Command Port: ')
username = input('Username: ')
password = input('Password: ')

conn = ftp_core.FTPClientConnection(server=server,
                                    control_port=int(port),
                                    username=username,
                                    password=password)
print(''.join(str(conn.welcome_msg)))
conn.login()

while True:
    command = input('FTP> ')
    args = command.split(' ')

    cmd = args[0]
    try:
        if cmd.lower() == 'pwd':
            print(conn.pwd())
        elif cmd.lower() == 'mlsd':
            print(conn.mlsd(args[1]))
        elif cmd.lower() == 'type':
            print(conn.type(args[1]))
        elif cmd.lower() == 'feat' or cmd.lower() == 'features':
            print(conn.feat())
        elif cmd.lower() == 'list' or cmd.lower() == 'ls':
            print(conn.list())
        elif cmd.lower() == 'cwd' or cmd.lower() == 'cd':
            print(conn.cwd(args[1]))
        elif cmd.lower() == 'retr' or cmd.lower() == 'get':
            print(conn.retr(args[1], args[2]))
        elif cmd.lower() == 'stor' or cmd.lower() == 'put':
            print(conn.stor(args[1], args[2]))
        elif cmd.lower() == 'dele' or cmd.lower() == 'rm':
            print(conn.dele(args[1]))
        elif cmd.lower() == 'mv':
            print(conn.rename(args[1], args[2]))
        elif cmd.lower() == 'help':
            help()
        elif cmd.lower() == 'mkdir' or cmd.lower() == 'mkd':
            print(conn.mkdir(args[1]))
        elif cmd.lower() == 'rmdir' or cmd.lower() == 'rmd':
            print(conn.rmdir(args[1]))
        elif cmd.lower() == 'exit':
            break
        else:
            print('%s is not implemented in this client.' % cmd)
    except ftp_core.FTPException as e:
        print(e)
    except IndexError:
        print('Too few arguments: %s' % str(args))