$(document).ready(loadTeacherView);

function loadTeacherView () {
    var params = getArgs();

    getApi('/api/user', {}, function (err, teacher) {
        if (err) {
            alert('Error loading teacher info. - ' + err.message);
        } else {
            getApi('/api/teacher/' + teacher.id + '/courses', {
                page: params.page || 1
            }, function (err, classes) {
                if (err) {
                    alert('Error loading classes. - ' + err.message);
                } else {
                    gradeView(classes, teacher);
                    ratingView(classes);
                    infoView(teacher);
                }
            });
        }
    });
}

function isExceed(num){
    return (num < 0 || num > 100);
}

function gradeView (classes, my) {
    var vm = new Vue({
        el: '#grades',
        data: {
            classes: classes,
            my_id: my.id,
            my_page: 1,
            students: [],
            current_class: {},
            regular_ratio: '',
            midterm_ratio: '',
            final_ratio: '',
            data: {
                five: 1,
                four: 1,
                three: 0,
                two: 0,
                one: 0
            }
        },
        computed: {
            page: {
                get: function () {
                    return this.my_page;
                },
                set: function (val) {
                    this.my_page = val;
                    var _this = this;
                    getApi('/api/teacher/' + this.my_id + '/courses', {
                        page: this.my_page
                    }, function (err, r) {
                        if (err) {
                            alert('Error paging: ' + err.message);
                        } else {
                            if (_this.my_page > 1 && r.length < 1) {
                                _this.my_page = _this.my_page - 1;
                                return;
                            }
                            reloadArray(_this.classes, r);
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
            getTime: function (course) {
                var day = ['一', '二', '三', '四', '五', '六', '日'];
                return ['星期', day[course.day - 1], ', 第', course.start_time, '-', course.end_time, '节'].join('');
            },
            showSetGrade: function (_class) {
                this.current_class = _class;
                this.students.splice(0, this.students.length);
                var t = this;

                getApi('/api/selection/course/' + this.current_class.id, {}, function (err, r) {
                    if (err) {
                        alert(err.message);
                    } else {
                        t.current_class.student_count = r.length;
                        for (var i in r) {
                            t.students.push(r[i]);
                            $('#modal-set-grades').modal('show');
                        }
                    }
                })
            },
            displayStat: function (_class) {

                $('#modal-visualize-grades').modal('show');
            },
            editStuGrade: function (record) {
                var regular = parseInt($('#stu-regular-score-' + record.id).val());
                var midterm = parseInt($('#stu-midterm-score-' + record.id).val());
                var final = parseInt($('#stu-final-score-' + record.id).val());
                var regular_rate = parseInt(this.regular_ratio);
                var midterm_rate = parseInt(this.midterm_ratio);
                var final_rate = parseInt(this.final_ratio);
                if (isNaN(regular) || isNaN(midterm) || isNaN(final) || isNaN(regular_rate)
                    || isNaN(midterm_rate) || isNaN(final_rate)) {
                    return alert('请输入数字!');
                }
                if (isExceed(regular) || isExceed(midterm) || isExceed(final) || isExceed(regular_rate) ||
                isExceed(midterm_rate) || isExceed(final_rate)) {
                    return alert('请输入0-100的数值!');
                }
                if (regular_rate + midterm_rate + final_rate != 100) {
                    return alert('三部分比例之和应为100!');
                }

                var total = regular * regular_rate / 100 +
                        midterm * midterm_rate / 100 + final * final_rate / 100;

                total = Math.round(total);

                postApi('/api/teacher/grade/' + record.id, {
                    regular: regular,
                    midterm: midterm,
                    final: final,
                    total: total
                }, function (err, r) {
                    if (err) {
                        alert('修改成绩失败: ' + err.message);
                    } else {
                        alert('修改成功!');
                        $('#stu-total-score-' + record.id).val(total);
                        $('#stu-gpa-' + record.id).html(r.GPA);
                    }
                });

            }
        }
    });
}

function ratingView (classes) {
    var vm = new Vue({
        el: '#customer',
        data: {
            classes: classes,
            my_page: 1,
            ratings: {},
            data: {
                five: 1,
                four: 1,
                three: 0,
                two: 0,
                one: 0
            }
        },
        computed: {
            page: {
                get: function () {
                    return this.my_page;
                },
                set: function (val) {
                    this.my_page = val;
                    var _this = this;
                    getApi('/api/teacher/class', {
                        page: this.my_page
                    }, function (err, r) {
                        if (err) {
                            alert('Error paging: ' + err.message);
                        } else {
                            reloadArray(_this.classes, r);
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
            getTime: function (course) {
                var day = ['一', '二', '三', '四', '五', '六', '日'];
                return ['星期', day[course.day - 1], ', 第', course.start_time, '-', course.end_time, '节'].join('');
            },
            next: function () {
                this.page = this.page + 1;
            },
            displayRatingStat: function (_class) {
                getApi('/api/selection/course/' + _class.id, {}, function (err, r) {
                    if (r) {
                        var data = {
                            five: 0,
                            four: 0,
                            three: 0,
                            two: 0,
                            one: 0
                        };
                        for (var i in r) {
                            if (r[i].rating > 4.0) {
                                data.five = data.five + 1;
                            } else if (r[i].rating > 3.0 && r[i] <= 4.0) {
                                data.four = data.four + 1;
                            } else if (r[i].rating > 2.0 && r[i] <= 3.0) {
                                data.three = data.three + 1;
                            } else if (r[i].rating > 1.0 && r[i] <= 2.0) {
                                data.two = data.two + 1;
                            } else  if (r[i].rating == 0) {
                                continue;
                            } else {
                                data.one = data.one + 1;
                            }
                        }
                        $('#rating-graph').html('<p class="lead">\
                                                        Level 5: <code>' + data.five + '</code>\
                                                    </p>\
                                                    <p class="lead">\
                                                        Level 4: <code>' + data.four + '</code>\
                                                    </p>\
                                                    <p class="lead">\
                                                        Level 3: <code>' + data.three + '</code>\
                                                    </p>\
                                                    <p class="lead">\
                                                        Level 2: <code>' + data.two + '</code>\
                                                    </p>\
                                                    <p class="lead">\
                                                        Level 1: <code>' + data.one + '</code>\
                                                    </p>');
                    }
                });
                $('#modal-visualize-ratings').modal('show');
            }

        }
    });
}

function ratingChart() {
    var myChart = echarts.init(document.getElementById('rating-graph'));
    var options = {
        tooltip: {
            show: true
        },
        legend: {
            data: ['人数']
        },
        xAxis: [
            {
                type: 'category',
                data: ['<60', '60~70', '70~80', '80~90', '>90']
            }
        ],
        yAxis: [
            {
                type: 'value'
            }
        ],
        series: [
            {
                "name": "人数",
                "type": "bar",
                "data": [5, 12, 24, 22, 10]
            }
        ]
    };
    myChart.setOption(options);
}

function infoView (teacher) {
    var vm = new Vue({
        el: '#info',
        data: {
            name: teacher.name,
            teacher_id: teacher.tid,
            title: teacher.title,
            address: teacher.address,
            telephone: teacher.telephone,
            email: teacher.email,
            intro: teacher.intro,
            password: '',
            new_password: ''
        },
        methods: {
            updateTeacherInfo: function () {
                postApi('/api/user/teacher/' + this.teacher_id, {
                    address: this.address,
                    telephone: this.telephone,
                    email: this.email,
                    intro: this.intro,
                    old_password: this.password,
                    password: this.new_password
                }, function (err, r) {
                    if (err) {
                        alert('Error: ' + err.message);
                    } else {
                        alert('修改成功！');
                        location.reload();
                    }
                });
            }
        }
    })
}