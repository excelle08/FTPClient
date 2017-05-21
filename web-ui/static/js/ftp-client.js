/**
 * Created by Excelle on 5/21/17.
 */

current_dir = '/';

$(document).ready(function() {
    d = window.location.hash.substring(1);
    if (d) {
        current_dir = d;
    }
    getApi('/ftp/root' + current_dir, {}, function (err, r) {
        if (err) {
            alert(err.message);
        } else {
            r.unshift({
                name: '..',
                mode: 'dr-xr-xr-x',
                link_num: '',
                owner: '',
                group: '',
                length: '',
                month: '',
                day: '',
                time: ''
            });
            initFileList(r);
        }
    })
});

function initFileList(files) {
    var vm = new Vue({
        el: '#ftp-client-main',
        data: {
            files: files,
            working_dir: current_dir
        },
        methods: {
            getSize: function (size) {
                var result = '';
                if (size >= 1024 && size < 1048576) {
                    result = roundUp(size / 1024, 100) + ' KB';
                } else if (size >= 1048576 && size < 1048576 * 1024) {
                    result = roundUp(size / 1048576, 100) + ' MB';
                } else if (size >= 1048576 * 1024) {
                    result = roundUp(size / 1048576 / 1024, 100) + ' GB';
                } else {
                    result = size + ' B';
                }
                return result;
            },
            
            access: function(file) {
                if (file.mode[0] == 'd') {
                    // Is directory
                    var new_dir = '';
                    var _this = this;
                    if (file.name == '..') {
                        if (this.working_dir == '/') {
                            return;
                        }
                        var components = this.working_dir.split('/');
                        components = components.splice(0, components.length - 2);
                        new_dir = components.join('/') + '/';
                    } else {
                        new_dir = this.working_dir + file.name + '/';
                    }
                    this.working_dir = new_dir;
                    current_dir = new_dir;
                    this.refresh();
                } else {
                    var url = [
                        window.location.protocol, '//',
                        window.location.host, '/ftp/root',
                        this.working_dir, file.name
                    ].join('');
                    window.open(url, '_blank');
                }
            },

            refresh: function () {
                var _this = this;
                getApi('/ftp/root' + this.working_dir, {}, function (err, r) {
                        if (err) {
                            alert(err.message);
                        } else {
                            _this.files.splice(1, _this.files.length - 1);
                            for (var i in r) {
                                _this.files.push(r[i]);
                            }
                        }
                    });
            },
            
            rename: function(file) {
                
            },
            
            move: function (file) {
                
            },
            
            delete: function (file) {
                var _this = this;
                if (file.name == '..') {
                    return alert('此项目用于返回上一级目录,不能删除');
                }
                if (window.confirm('确定要删除文件 ' + file.name + ' 吗?')) {
                    url = '/ftp/root' + this.working_dir + file.name;
                    if (file.mode[0] == 'd') {
                        url = url + '/';
                    }
                    deleteApi(url, {},
                        function (resp, __) {
                            if (resp.status && resp.status == 1) {
                                alert('删除成功');
                            } else {
                                alert(resp.message);
                            }
                            _this.refresh();
                        })
                }
            },

            upload: function () {
                var f = $('#file-uploader')[0];
                var data = '';
                var name = '';
                var _this = this;
                if (f.files && f.files[0]) {
                    var file = f.files[0];
                    var fr = new FileReader();
                    var wd = this.working_dir;
                    name = file.name;
                    fr.onload = function () {
                        data = fr.result;
                        putRawData('/ftp/root' + wd + file.name, data,
                            function (err, r) {
                                if (err) {
                                    alert(err.message);
                                } else {
                                    alert('上传成功');
                                    _this.refresh();
                                }
                        });
                    };
                    fr.readAsBinaryString(file);
                } else {
                    alert('没有选定文件');
                }
            }
        }
    });
}