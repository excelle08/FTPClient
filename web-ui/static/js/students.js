
$(document).ready(loadStudentView);

function loadStudentView() {
    params = getArgs();
    getApi('/api/user', {}, function (err, student_info) {
        if (err) {
            alert('加载学生信息出错');
        } else {
            getApi('/api/student/' + student_info.id.toString() + '/grades', {
            }, function (err, grades) {
                if(err) {
                    alert('Error loading student\'s grades');
                } else {
                    getApi('/api/selection/student/' + student_info.id.toString(), {
                    }, function (err, ratings) {
                        if (err) {
                            alert('Error loading rating info.'); 
                        } else {
                            getApi('/api/student/' + student_info.id.toString() + '/courses', {
                            }, function (err, courses) {
                                if (err) {
                                    alert('Error loading courses');
                                } else {
                                    navBar(student_info);
                                    viewGrades(grades);
                                    rateCourses(ratings);
                                    viewClassTable(courses);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

function navBar(student) {
    var vm = new Vue({
        el: '#student-basic',
        data: {
            name: student.name,
            student_id: student.sid,
            semester: student.semester,
            semesters: student.semesters
        },
        methods: {
        }
    });

    var info = new Vue({
        el: '#info',
        data: {
            name: student.name,
            id: student.id,
            student_id: student.sid,
            major: student.major,
            gender: (student.gender == 1) ? '男' : '女',
            old_password: '',
            new_password: ''
        },
        methods: {
            changePassword: function () {
                if (!this.old_password.trim()) {
                    return alert('请输入旧密码!');
                }
                if (!this.new_password.trim()) {
                    return alert('请输入新密码!');
                }
                if (this.new_password.length < 6) {
                    return alert('密码长度太短');
                }

                postApi('/api/user/student/' + this.student_id, {
                    old_password: this.old_password,
                    password: this.new_password
                }, function (err, r) {
                    if (err) {
                        alert(err.message);
                    } else {
                        alert('密码修改成功,请重新登录!');
                        deleteApi('/api/user', {}, function (err, r) {
                            location.assign('/');
                        });
                    }
                });
            }
        }
    });
}

function viewGrades(grades) {
    var vm = new Vue({
        el: '#grades',
        data: {
            grades: grades,
        }
    });
}

function rateCourses(ratings) {
    var vm = new Vue({
        el: '#ratings',
        data: {
            courses: ratings,
            page: 1
        },
        methods: {
            previous: function () {
                /* body... */
            },
            next: function () {
                /* body... */
            },
            submitRating: function (course) {
                var value = $('input[name="rating-' + course.id + '"]:checked').val();
                postApi('/api/student/rate/' + course.id + '/' + value, {
                }, function (err, r) {
                    if (err) {
                        alert('Error rating: ' + err.message);
                    } else {
                        alert('评价成功！')
                    }
                })
            }
        }
    })
}

function viewClassTable (courses) {
    // Preprocess

    var table = [];
    for(var i=0; i<5; i++) {
        var row = [];
        for(var j=0; j<7; j++) {
            row.push('');
        }
        table.push(row);
    }

    for(var i in courses) {
        table[courses[i].start_time - 1][courses[i].day - 1] = courses[i];
    }

    var vm = new Vue({
        el: '#group',
        data: {
            courses: table
        },
        methods: {

        }
    });
}