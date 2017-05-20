var navbar = '<nav class="navbar navbar-inverse navbar-fixed-top">\
        <div class="container-fluid" id="header-nav">\
            <div class="navbar-header">\
                <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">\
                <span class="sr-only">Toggle navigation</span>\
                <span class="icon-bar"></span>\
                <span class="icon-bar"></span>\
                <span class="icon-bar"></span>\
            </button>\
            <a class="navbar-brand" href="#">{{ title }}</a>\
            </div>\
            <div id="navbar" class="navbar-collapse collapse">\
                <ul class="nav navbar-nav navbar-right">\
                <slot></slot>\
                </ul>\
            </div>\
        </div>\
    </nav>';

registerComponents();

function registerComponents () {
    Vue.component('navbar', {
        template: '<nav class="navbar navbar-inverse navbar-fixed-top">\
        <div class="container-fluid" id="header-nav">\
            <div class="navbar-header">\
                <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">\
                <span class="sr-only">Toggle navigation</span>\
                <span class="icon-bar"></span>\
                <span class="icon-bar"></span>\
                <span class="icon-bar"></span>\
            </button>\
            <a class="navbar-brand" href="#">{{ title }}</a>\
            </div>\
            <div id="navbar" class="navbar-collapse collapse">\
                <ul class="nav navbar-nav navbar-right">\
                <slot></slot>\
                </ul>\
            </div>\
        </div>\
    </nav>'
    });
}