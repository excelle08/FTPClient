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