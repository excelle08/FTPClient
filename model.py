import json


class File():

    def __init__(self, mode, link_num, owner, group, length, month, day, time, filename):
        self.mode = mode
        self.link_num = link_num
        self.owner = owner
        self.group = group
        self.length = length
        self.month = month
        self.day = day
        self.time = time
        self.filename = filename

    def __init__(self, ls_record):
        fields = ls_record.split(maxsplit=9)
        print(fields)
        self.mode = fields[0]
        self.link_num = fields[1]
        self.owner = fields[2]
        self.group = fields[3]
        self.length = fields[4]
        self.month = fields[5]
        self.day = fields[6]
        self.time = fields[7]
        self.time = fields[8]

    @property
    def dict(self):
        return self.__dict__
