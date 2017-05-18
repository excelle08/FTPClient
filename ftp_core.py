import socket
import re, os
import select
from enum import Enum


class ComMode(Enum):
    Active = 0
    Passive = 1


class DataRepr(Enum):
    ASCII = 0
    Binary = 1
    EBCDIC = 2
    Local = 3


class TransferMode(Enum):
    Stream = 0
    Block = 1
    Compressed = 2


class FTPException(Exception):
    pass


EOF = '\xff\x01'
EOR = '\xff\x02'
cmd_buffer_size = 8
data_buffer_size = 4096
recv_timeout = 0.3


class FTPClientConnection:
    @staticmethod
    def parse_port(upper, lower):
        """
        Parse PASV response value into port number
        :param upper: Upper 8 bits. In 5th element of PASV response tuple.
        :param lower: Lower 8 bits. In 6th element of PASV response tuple.
        :return: The actual data port
        """
        return int(upper) * 256 + int(lower)

    def __init__(self, server, control_port=21, data_port=20, com_mode=ComMode.Passive,
                 data_repr=DataRepr.Binary, transfer_mode=TransferMode.Stream, username='Anonymous',
                 password=''):
        """
        Constructor
        :param server:
        :param control_port:
        :param data_port:
        :param com_mode:
        :param data_repr:
        :param transfer_mode:
        :param username:
        :param password:
        :return:
        """
        self.server = server
        self.cmd_conn = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.data_conn = None
        self.username = username
        self.password = password
        self.com_mode = com_mode
        self.data_repr = data_repr
        self.transfer_mode = transfer_mode
        self.command_port = control_port
        self.data_port = data_port
        self.welcome_msg = ''

        # Connect command port
        self.cmd_conn.connect((self.server, self.command_port))
        self.cmd_conn.setblocking(0)
        while True:
            r, _, _ = select.select([self.cmd_conn], [], [], recv_timeout)
            if r:
                msg = self.cmd_conn.recv(cmd_buffer_size).decode('utf-8')
                self.welcome_msg += msg
                if not msg:
                    break
            else:
                break

    def __del__(self):
        """
        Destructor
        :return:
        """
        self.cmd_conn.close()

    def simple_command(self, cmd):
        """
        Simple command that does not use data port to transfer data
        :param cmd: Command
        :return: A list, and its elements are (Code, Message)
        """
        self.cmd_conn.send(bytes(cmd + '\r\n', 'ASCII'))
        data = []
        while True:
            r, _, _ = select.select([self.cmd_conn], [], [], recv_timeout)
            if r:
                resp_part = self.cmd_conn.recv(cmd_buffer_size)
                data.append(resp_part.decode('utf-8'))
                if not resp_part:
                    break
            else:
                break
        raw_msg = ''.join(data)
        messages = raw_msg.split('\r\n')
        msg_list = []
        for line in messages:
            if not line:
                continue
            code = line.split(' ')[0]
            if code.isdigit():
                code = int(code)
                msg = line.split(' ', maxsplit=1)[1]
            else:
                code = 0
                msg = line
            msg_list.append((code, msg))

        return msg_list

    def login(self):
        """
        Do login. Equivalent to USER and PASS.
        :return: (Response code, Message)
        """
        user = self.simple_command('USER %s' % self.username)[0]
        if user[0] != 331:
            raise FTPException('FTP login error: %d - %s' % (user[0], user[1]))
        _pass = self.simple_command('PASS %s' % self.password)[0]
        if _pass[0] != 230:
            raise FTPException('FTP login error: %d - %s' % (_pass[0], _pass[1]))
        return _pass

    def init_data_port(self):
        """
        Initialize data transfer port.
        :return: Port number
        """
        if self.com_mode == ComMode.Passive:
            pasv_msg = self.simple_command('PASV')[0]
            s = re.search(r'\(\d+,\d+,\d+,\d+,(\d+),(\d+)\)', pasv_msg[1])
            self.data_port = FTPClientConnection.parse_port(s.group(1), s.group(2))
            self.data_conn = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.data_conn.connect((self.server, self.data_port))

            return self.data_port
        else:
            raise FTPException('PORT mode is not implemented yet')

    def prepare_data(self, data=None):
        """
        Prepare for data transfer on data port
        :param data: Data to send. Being None means receiving only
        :return: The data received
        """
        if self.com_mode == ComMode.Passive:
            recv_data = []
            if data:
                self.data_conn.send(data)
            else:
                while True:
                    r, _, _ = select.select([self.data_conn], [], [], recv_timeout)
                    if r:
                        data_part = self.data_conn.recv(data_buffer_size)
                        recv_data.append(data_part)
                        if not data_part:
                            break
            self.data_conn.close()
            return b''.join(recv_data)
        else:
            self.data_conn.close()
            raise FTPException('PORT mode is not implemented yet')

    def pwd(self):
        """
        PWD command: Print working directory.
        :return:
        """
        resp = self.simple_command('PWD')[0]
        if resp[0] != 257:
            raise FTPException('PWD Error: %d - %s' % (resp[0], resp[1]))
        return resp[1]

    def mlsd(self, dirname=''):
        """
        MLSD command: List the directory if exists.
        :return:
        """
        port = self.init_data_port()
        resp = self.simple_command('MLSD %s' % dirname)[0]
        if resp[0] != 150:
            raise FTPException('MLSD Error: %d - %s' % (resp[0], resp[1]))
        result = self.prepare_data()
        for i in iter(self.cmd_conn.recv(), b''):
            # For message after data transfer
            pass

        return result

    def type(self, type_id='I'):
        """
        Set data representation type.
        :param type_id: I for Image/Binary, A for ASCII.
        :return:
        """
        resp = self.simple_command('TYPE %s' % type_id)[0]
        if resp[0] != 200:
            raise FTPException('TYPE error: %d - %s' % (resp[0], resp[1]))

        if type_id.upper() == 'I':
            self.data_repr = DataRepr.Binary
        else:
            self.data_repr = DataRepr.ASCII

        return resp[1]

    def feat(self):
        """
        FEAT: get feature list implemented by server
        :return: Return a list of features.
        """
        resp = self.simple_command('FEAT')
        features = []
        for line in resp:
            if line[0] == 0:
                features.append(line[1])

        return features

    def list(self):
        """
        LIST: list directory
        :return:
        """
        port = self.init_data_port()
        resp = self.simple_command('LIST')[0]
        data = self.prepare_data()

        return data.decode('utf-8')

    def cwd(self, target):
        """
        CWD: Change working directory
        :return:
        """
        resp = self.simple_command('CWD %s' % target)[0]
        if resp[0] // 100 != 2:
            raise FTPException('CWD error: %d - %s' % (resp[0], resp[1]))
        return resp[1]

    def direct_retr(self, filename):
        port = self.init_data_port()
        resp_s = self.simple_command('RETR %s' % filename)
        if len(resp_s) > 0 and resp_s[0][0] == 550:
            raise FTPException('RETR Error: %s' % (resp_s[0][1]))
        data = self.prepare_data()

        return data

    def retr(self, filename, dest):
        """
        RETR: retrieve file
        :param filename: Path of file on server
        :param dest: Destination
        :return: length of data retrieved
        """
        data = self.direct_retr(filename)
        with open(dest, 'wb') as f:
            f.write(data)

        return len(data)

    def direct_store(self, data, dest):
        port = self.init_data_port()
        resp = self.simple_command('STOR %s' % dest)[0]
        if resp[0] == 150:
            self.prepare_data(data)
        else:
            if self.data_conn:
                self.data_conn.close()
            raise FTPException('STOR error: %s' % resp[1])
        return len(data)

    def stor(self, source, dest):
        """
        STOR: store file
        :param source: Source file in local
        :param dest: Destination on server
        :return: length of data transferred
        """
        data = ''
        if not os.path.exists(source):
            raise FTPException('%s does not exist.' % source)
        with open(source, 'rb') as f:
            data = f.read()
        return self.direct_store(data, dest)

    def dele(self, path):
        """
        Delete file
        :param path: path
        :return: message
        """
        resp = self.simple_command('DELE %s' % path)[0]
        if resp[0] != 250:
            raise FTPException('DELE Error: (%d) %s' % (resp[0], resp[1]))
        return resp[1]

    def mkdir(self, path):
        """
        Make directory
        :param path:
        :return:
        """
        resp = self.simple_command('MKD %s' % path)[0]
        if resp[0] != 250:
            raise FTPException('MKD error: (%d) %s' % (resp[0], resp[1]))
        return resp[1]

    def rmdir(self, path):
        """
        Remove directory
        :param path:
        :return:
        """
        resp = self.simple_command('RMD %s' % path)[0]
        if resp[0] != 250:
            raise FTPException('RMD error: (%d) %s' % (resp[0], resp[1]))
        return resp[1]

    def rename(self, orig, new):
        """
        Rename: RNFR and RNTO
        :param orig: original name
        :param new: new name
        :return: message
        """
        rnfr = self.simple_command('RNFR %s' % orig)[0]
        if rnfr[0] != 350:
            raise FTPException('Rename error at RNFR: %s' % rnfr[1])
        rnto = self.simple_command('RNTO %s' % new)[0]
        if rnto[0] != 250:
            raise FTPException('Rename error at RNTO: %s' % rnto[1])
        return rnto[1]
