$(document).ready(loadAdminView());

function loadAdminView() {
    params = getArgs();

    getApi('/api/user/student', {
        page: params.page || 1,
        limit: 20
    }, function (err, students) {
        if (err) {
            alert('Error loading student ' + err.message); 
        } else {
            studentView(students);

            getApi('/api/user/teacher', {
                page: params.page || 1,
                limit: 20
            }, function (err, teachers) {
                if (err) {
                    alert('error loading teacher - ' + err.message);
                } else {
                    teacherView(teachers);

                    getApi('/api/admin/course', {
                        page: params.page || 1,
                        limit: 20
                    }, function (err, courses) {
                        if (err) {
                            alert('error loading courses - ' + err.message);
                        } else {
                            courseView(courses);

                            getApi('/api/admin/selection', {
                                page: params.page || 1,
                                limit: 20
                            }, function (err, selections) {
                                if (err) {
                                    alert('error loading selections - ' + err.message); 
                                } else {
                                    selectionView(selections);

                                    getApi('/api/admin/selection', {
                                        page: params.page || 1,
                                        limit: 20
                                    }, function (err, grades) {
                                        if (err) {
                                            alert('error loading grades - ' + err.message);
                                        }
                                        gradeView(grades);
                                    });
                                }
                            });
                        }
                    });
                }
            }) ;
        }
    });
}

function studentView (students) {
    var vm = new Vue({
        el: '#students',
        data: {
            students: students,
            my_page: 1,
            query: '',
            name: '',
            update: false,
            id: 0,
            sid: '',
            gender: 0,
            major: 0,
            password: ''

        },
        computed: {
            page: {
                get: function () {
                    return this.my_page;
                },
                set: function (val) {
                    this.my_page = val;
                    var _this = this;
                    getApi('/api/user/student', {
                        page: this.my_page,
                        keyword: this.query
                    }, function (err, r) {
                        if (err) {
                            alert('Error paging: ' + err.message);
                        } else {
                            if (_this.my_page > 1 && r.length == 0) {
                                _this.my_page = val - 1;
                                return;
                            }
                            reloadArray(_this.students, r);
                        }
                    });
                }
            }
        },
        methods: {
            previous: function () {
                if (this.page == 1) {
                    return;
                }
                this.page = this.page - 1;
            },
            next: function () {
                this.page = this.page + 1;
            },
            queryStudent: function (argument) {
                var _this = this;
                getApi('/api/user/student', {
                    page: this.page,
                    keyword: this.query
                }, function (err, r) {
                    if (err) {
                        alert('Error query: ' + err.message);
                    } else {
                        reloadArray(_this.students, r);
                    }
                });
            },
            getGender: function(gender) {
                return (gender == 1) ? '男' : '女';
            },
            refresh: function() {
                this.page = this.page;
            },
            updateStuInfo: function () {
                var _this = this;
                console.log(this.update);
                var url = (this.update) ? '/api/user/student/' + this.sid : '/api/admin/user/student';
                postApi(url, {
                    sid: this.sid,
                    name: this.name,
                    gender: this.gender,
                    password: this.password,
                    major: this.major
                }, function (err, r) {
                    _this.update = false;
                    if (err) {
                        alert('update error: ' + err.message);
                    } else {
                        $('#edit-students').modal('hide');
                        _this.page = _this.page;
                    }
                });
            },
            showEditStuInfo: function (student) {
                if (student) {
                    this.name = student.name;
                    this.major = student.major;
                    this.gender = student.gender;
                    this.sid = student.sid;
                    this.update = true;
                } else {
                    this.name = '';
                    this.major = '';
                    this.gender = 1;
                    this.sid = '';
                    this.update = false;
                }
                this.password = '';
                $('#edit-students').modal('show');
            },
            showRemove: function (student) {
                var _this = this;
                if (confirm('确实要删除学生 [' + student.name + ', ' + student.sid + '] 吗?')) {
                    deleteApi('/api/admin/user/student/' + student.sid, {}, function (err, r) {
                        if (err) {
                            alert('删除失败: ' + err.message);
                        } else {
                            _this.page = _this.page;
                        }
                    })
                }
            }
        }
    });
}

function teacherView(teachers) {
    var vm = new Vue({
        el: '#teachers',
        data: {
            teachers: teachers,
            my_page: 1,
            query: '',
            name: '',
            tid: '',
            password: '',
            address: '',
            title: '',
            tel: '',
            email: '',
            intro: '',
            update: false
        },
        computed: {
            page: {
                get: function () {
                    return this.my_page;
                },
                set: function (val) {
                    this.my_page = val;
                    var _this = this;
                    getApi('/api/user/teacher', {
                        page: this.my_page,
                        keyword: this.query
                    }, function (err, r) {
                        if (err) {
                            alert('Error paging: ' + err.message);
                        } else {
                            if (_this.my_page > 1 && r.length == 0) {
                                _this.my_page = val - 1;
                                return;
                            }
                            reloadArray(_this.teachers, r);
                        }
                    });
                }
            }
        },
        methods: {
            previous: function () {
                if (this.page == 1) {
                    return;
                }
                this.page = this.page - 1;
            },
            next: function () {
                this.page = this.page + 1;
            },
            refresh: function () {
                this.page = this.page;
            },
            updateTeacherInfo: function () {
                var _this = this;
                var url = (this.update) ? '/api/user/teacher/' + this.tid : '/api/admin/user/teacher';
                postApi(url, {
                    tid: this.tid,
                    name: this.name,
                    password: this.password,
                    title: this.title,
                    address: this.address,
                    telephone: this.tel,
                    email: this.email,
                    intro: this.intro
                }, function (err, r) {
                    _this.update = false;
                    if (err) {
                        alert('update error: ' + err.message);
                    } else {
                        _this.page = _this.page;
                        $('#edit-teachers').modal('hide');
                    }
                })
            },
            showEditTeacherInfo: function (teacher) {
                if (teacher) {
                    this.name = teacher.name;
                    this.tid = teacher.tid;
                    this.title = teacher.title;
                    this.password = '';
                    this.address = teacher.address;
                    this.tel = teacher.telephone;
                    this.email = teacher.email;
                    this.intro = teacher.intro;
                    this.update = true;
                } else {
                    this.name = '';
                    this.id = '';
                    this.title = '';
                    this.password = '';
                    this.address = '';
                    this.tel = '';
                    this.email = '';
                    this.intro = '';
                    this.update = false;
                }
                $('#edit-teachers').modal('show');
            },
            showRemove: function (teacher) {
                var _this = this;
                if (confirm('确定要删除教师 [' + teacher.name + ', ' + teacher.tid + '] 吗?')) {
                    deleteApi('/api/admin/user/teacher/' + teacher.tid, {}, function (err, r) {
                        if (err) {
                            alert('删除失败: ' + err.message);
                        } else {
                            _this.page = _this.page;
                        }
                    })
                }
            }
        }
    });
}

function courseView (courses) {
    var vm = new Vue({
        el: '#courses',
        data: {
            courses: courses,
            my_page: 1,
            query: '',
            id: '',
            cid: '',
            name: '',
            teacher_query: '',
            teacher_name:'',
            teacher: '',
            place: '',
            day: '',
            start_time: '',
            end_time: '',
            credit: '',
            update: false
        },
        computed: {
            page: {
                get: function () {
                    return this.my_page;
                },
                set: function (val) {
                    this.my_page = val;
                    var _this = this;
                    getApi('/api/admin/course', {
                        page: this.my_page,
                        keyword: this.query
                    }, function (err, r) {
                        if (err) {
                            alert('Error paging: ' + err.message);
                        } else {
                            if (_this.my_page > 1 && _this.courses.length == 0) {
                                _this.my_page = _this.my_page - 1;
                                return;
                            }
                            reloadArray(_this.courses, r);
                        }
                    });
                }
            }
        },
        methods: {
            previous: function () {
                if (this.page == 1) {
                    return;
                }
                this.page = this.page - 1;
            },
            next: function () {
                this.page = this.page + 1;
            },
            refresh: function() {
                this.page = this.page;
            },
            getTime: function (course) {
                var day = ['一', '二', '三', '四', '五', '六', '日'];
                return ['星期', day[course.day - 1], ', 第', course.start_time, '-', course.end_time, '节'].join('');
            },
            updateCourseInfo: function () {
                var _this = this;
                var url = (this.update) ? '/api/admin/course/' + this.id : '/api/admin/course';
                postApi(url, {
                    cid: this.cid,
                    name: this.name,
                    teacher: this.teacher,
                    place: this.place,
                    day: this.day,
                    start_time: this.start_time,
                    end_time: this.end_time,
                    credit: this.credit
                }, function (err, r) {
                    if (err) {
                        alert('update error: ' + err.message);
                    } else {
                        _this.page = _this.page;
                        _this.update = false;
                        $('#edit-course').modal('hide');
                    }
                });
            },
            showEditCourseInfo: function (course) {
                if (course) {
                    this.name = course.name;
                    this.id = course.id;
                    this.cid = course.cid;
                    this.teacher = course.teacher;
                    this.place = course.place;
                    this.day = course.day;
                    this.start_time = course.start_time;
                    this.end_time = course.end_time;
                    this.credit = course.credit;
                    this.update = true;
                } else {
                    this.name = '';
                    this.id = '';
                    this.cid = '';
                    this.teacher = '';
                    this.teacher_query = '';
                    this.teacher_name = '';
                    this.place = ''
                    this.day = '';
                    this.start_time = '';
                    this.end_time = '';
                    this.credit = '';
                    this.update = false;
                }
                $('#edit-course').modal('show');
            },
            queryTeacher: function () {
                var query = this.teacher_query;
                var _this = this;
                getApi('/api/user/teacher', {
                    keyword: query
                }, function (err, r) {
                    if (r && r.length > 0) {
                        _this.teacher_name = r[0].name;
                        _this.teacher = r[0].id;
                    }
                });
            },
            showRemove: function (course) {
                var _this = this;
                if (confirm('确定要删除课程 [' + course.name + ', ' + course.cid + '] 吗?')) {
                    deleteApi('/api/admin/course/' + course.id, {}, function (err, r) {
                        if (err) {
                            alert('删除失败: ' + err.message);
                        } else {
                            _this.page = _this.page;
                        }
                    });
                }
            }
        }
    });
}

function selectionView(selections) {
    var vm = new Vue({
        el: '#group',
        data: {
            selections: selections,
            my_page: 1,
            keyword: '',
            update: false,
            id: '',
            student: '',
            student_query: '',
            student_name: '',
            course: '',
            course_query: '',
            course_name: '',
            course_place: '',
            course_teacher_name: '',
            course_time: '',
            course_credit: ''
        },
        computed: {
            page: {
                get: function () {
                    return this.my_page;
                },
                set: function (val) {
                    this.my_page = val;
                    var _this = this;
                    getApi('/api/admin/selection', {
                        page: this.my_page,
                        keyword: this.keyword
                    }, function (err, r) {
                        if (err) {
                            alert('Error paging: ' + err.message);
                        } else {
                            if (_this.my_page > 1 && r.length == 0) {
                                _this.my_page = _this.my_page - 1;
                                return;
                            }
                            reloadArray(_this.selections, r);
                        }
                    });
                }
            }
        },
        methods: {
            previous: function () {
                if (this.page <= 1) {
                    return;
                }
                this.page = this.page - 1;
            },
            next: function () {
                this.page = this.page + 1;
            },
            refresh: function () {
                this.page = this.page;
            },
            showEdit: function (selection) {
                if (selection) {
                    this.id = selection.id;
                    this.student = selection.student;
                    this.course = selection.course;
                    this.student_query = '';
                    this.student_name = '';
                    this.course_credit = '';
                    this.course_name = '';
                    this.course_place = '';
                    this.course_teacher_name = '';
                    this.course_time = '';
                    this.update = true;
                } else {
                    this.id = '';
                    this.update = false;
                    this.student = '';
                    this.course = '';
                    this.student_query = '';
                    this.student_name = '';
                    this.course_credit = '';
                    this.course_name = '';
                    this.course_place = '';
                    this.course_teacher_name = '';
                    this.course_time = '';
                }
                $('#edit-selection').modal('show');
            },
            updateSelection: function () {
                var url = '/api/admin/selection' + ((this.update) ? '/' + this.id : '');
                var _this = this;
                postApi(url, {
                    student: this.student,
                    course: this.course
                }, function (err, r) {
                    if (err) {
                        alert('更新失败 - ' + err.message);
                    } else {
                        _this.page = _this.page;
                        _this.update = false;
                        $('#edit-selection').modal('hide');
                    }
                });
            },

            queryStudent: function () {
                var t = this;
                getApi('/api/user/student', {
                    keyword: this.student_query
                }, function (err, r) {
                    if (r && r.length > 0) {
                        t.student = r[0].id;
                        t.student_name = r[0].name + '(' + r[0].sid + ')';
                    }
                });
            },

            queryCourse: function () {
                var t = this;
                getApi('/api/admin/course', {
                    keyword: this.course_query
                }, function (err, r) {
                    if (r && r.length > 0) {
                        t.course = r[0].id;
                        t.course_name = r[0].name;
                        t.course_place = r[0].place;
                        t.course_teacher_name = r[0].teacher_name;
                        t.course_time = t.getTime(r[0]);
                        t.course_credit = r[0].credit;
                    }
                });
            },

            getTime: function (course) {
                var day = ['一', '二', '三', '四', '五', '六', '日'];
                return ['星期', day[course.day - 1], ', 第', course.start_time, '-', course.end_time, '节'].join('');
            },

            showRemove: function (selection) {
                var t = this;
                if (confirm('确定要删除这条选课信息吗?')) {
                    deleteApi('/api/admin/selection/' + selection.id, {}, function (err, r) {
                        if (err) {
                            alert('删除失败 - ' + err.message);
                        } else {
                            t.page = t.page;
                        }
                    });
                }
            }
        }
    });
}

function gradeView(grades) {
    var vm = new Vue({
        el: '#grades',
        data: {
            grades: grades,
            my_page: 1,
            query: ''
        },
        computed: {
            page: {
                get: function () {
                    return this.my_page;
                },
                set: function (val) {
                    this.my_page = val;
                    var _this = this;
                    getApi('/api/admin/selection', {
                        page: this.my_page,
                        keyword: this.query
                    }, function (err, r) {
                        if (err) {
                            alert('Error paging: ' + err.message);
                        } else {
                            reloadArray(_this.grades, r);
                        }
                    });
                }
            }
        },
        methods: {
            previous: function () {
                if (this.page == 1) {
                    return;
                }
                this.page = this.page - 1;
            },
            next: function () {
                this.page = this.page + 1;
            },
            refresh: function () {
                this.page = this.page;
            }
        }
    });
}