var MyApp = {};

var AppRouter = Backbone.Router.extend({
    currentComponent : false,
    routes : {
        "welcome" : "welcome",
        "bouncing" : "bounce",
        "*default" : "welcome",
    },
    changeComponent : function (component, options) {
        this.currentComponent !== false && this.currentComponent.destructor();
        var componentClass = component.extend(options);
        this.currentComponent = new componentClass;
    },
    welcome : function () {
        this.changeComponent(Welcome);
    },
    bounce : function () {
        this.changeComponent(Bouncing);
    }
});

var Clock = Backbone.Model.extend({
    initialize : function () {
        this.clock = setInterval(_.bind(this.setTime, this), 1000);
        this.view = new ClockView({ model : this, el : Clock.element });
        this.setTime();
    },
    destructor : function () {
        clearInterval(this.clock);
        this.off();
    },
    setTime : function () {
        this.set({ current : new Date() });
    }
}, {
    element : "#c2"
});

var ClockView = Backbone.View.extend({
    initialize : function () {
        this.model.on('change', this.render, this);
    },
    render : function () {
        this.$el.html(this.model.get('current') + '');
    }
});

var Timer = Backbone.Model.extend({
    initialize : function () {
        this.set({ current : +new Date, initialTime : +new Date });
        this.view = new ClockView({ model : this, el : Timer.element });
        MyApp.clock.on('change', this.clockChange, this);
        this.clockChange(MyApp.clock);
    },
    clockChange : function (model) {
        var newTime = this.get('current')-(model.get('current')-this.get('initialTime'))*3600;
        if (newTime <= 0) {
            MyApp.clock.off('change', this.change);
            this.set({ current : 'no time left' });
            return;
        }
        this.set({ current : new Date(newTime) });
    }
}, {
    element : "#c1"
});

var Welcome = Backbone.Model.extend({
    initialize : function () {
        this.view = new WelcomeView({ model : this });
    },
    destructor : function () {
        // 
    }
});
var WelcomeView = Backbone.View.extend({
    el : "#mainPanel",
    initialize : function () {
        this.render();
    },
    render : function () {
        this.$el.html('Welcome');
    }
});

var Bouncing = Backbone.Model.extend({
    defaults : {
        left : 0, 
        top : 0,
        xDirection : true, // left/right
        yDirection : true // down/up
    },
    initialize : function () {
        this.view = new BouncingView({ model : this });
    },
    destructor : function () {
        clearInterval(this.animation);
        this.off();
        this.view.remove();
    },
    animate : function () {
        this.animation = setInterval(_.bind(this.move, this), 10);
    },
    move : function (model) {
        var left = this.get('left');
        var top = this.get('top');
        var xDirection = this.get('xDirection');
        var yDirection = this.get('yDirection');
        (xDirection) ? left+=0.5 : left-=0.5;
        (yDirection) ? top+=1 : top-=1;
        if (left > this.get('width')) { 
            xDirection = false;
            left = this.get('width')-1;
        }
        if (left < 0) {
            xDirection = true;
            left = 1;
        }
        if (top > this.get('height')) {
            yDirection = false;
            top = this.get('height')-1;
        }
        if (top < 0) {
            yDirection = true;
            top = 1;
        }
        this.set({
            'left' : left,
            'top' : top,
            'xDirection' : xDirection,
            'yDirection' : yDirection
        });
    }
});

var BouncingView = Backbone.View.extend({
    el : "#c3",
    panel : "#mainPanel",
    loaded : "#loaded",
    url : 'html/bouncing.html',
    initialize : function () {
        this.panel = $(this.panel);
        this.panel.load(this.url, _.bind(this.render, this));
    },
    remove : function () {
        this.$el.html("");
    },
    render : function () {
        this.loaded = $(this.loaded);
        this.panel.prepend('Bouncing Rectangle');
        this.$el.html("Come on get into the corner"); 
        this.bouncer = $("#bouncer");
        this.model.set({ 
            width : this.loaded.width()-this.bouncer.width(), 
            height : this.loaded.height()-this.bouncer.height() 
        });
        this.model.on('change', this.move, this);
        this.model.animate();
        return this;
    },
    move : function () {
        this.bouncer.css('left', parseInt(this.model.get('left')));
        this.bouncer.css('top', parseInt(this.model.get('top')));
    }
});

$(function () {
    MyApp.clock = new Clock();
    MyApp.router = new AppRouter();
    Backbone.history.start({ pushState : false, root: "" });
    MyApp.timer = new Timer();
});
