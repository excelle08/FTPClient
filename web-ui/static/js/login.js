$(document).ready(loginView);

function loginView() {
    var vm = new Vue({
        el: "#login-form",
        data: {
            username: 'anonymous',
            password: 'password'
        },
        methods: {
            login: function () {
                if (this.username == '') {
                    return showError('Please enter username');
                }
                if (this.password == '') {
                    return showError('Please enter password');
                }

                postApi('/ftp/user', {
                    username: this.username,
                    password: this.password
                }, function (resp, __) {
                    if (resp.code == 230) {
                        showSuccess('Login successful, redirecting to homepage');
                        setTimeout(function(){
                            location.assign('/');
                        }, 1);
                    } else {
                        return showError(resp.message);
                    }
                });
            }
        }
    })
}