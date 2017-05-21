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
        el: '#files',
        data: {
            files: files,
            working_dir: current_dir
        },
        methods: {
            getDate: function(file) {
                return ' '.join([file.month, file.day, file.time]);
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
                    getApi('/ftp/root' + new_dir, {}, function (err, r) {
                        if (err) {
                            alert(err.message);
                        } else {
                            _this.files.splice(1, _this.files.length - 1);
                            for (var i in r) {
                                _this.files.push(r[i]);
                            }
                        }
                    });
                } else {
                    var url = [
                        window.location.protocol, '//',
                        window.location.host, '/ftp/root',
                        this.working_dir, file.name
                    ].join('');
                    window.open(url, '_blank');
                }
            },
            
            rename: function(file) {
                
            },
            
            move: function (file) {
                
            },
            
            delete: function (file) {

            }
        }
    })
}