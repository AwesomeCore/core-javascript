if(typeof window != 'undefined') {
    global = window;
}

/**
 * @global
 * @name __inline_debug__
 */
try {
    global.__defineSetter__('__inline_debug__', function(value) {
        var e = new Error;
        console.log(value);
        console.log(e.stack ? e.stack.split("\n").slice(3).join("\n") : 'no stack provided');
    });
} catch(e) {
    // игнорируем - defineSetter не поддерживается
}

// Only add setZeroTimeout to the window object, and hide everything
// else in a closure.

if(!window.setImmediate) {
    (function () {
        var timeouts = [];
        var messageName = "zero-timeout-message";

        // Like setTimeout, but only takes a function argument.  There's
        // no time argument (always zero) and no arguments (you have to
        // use a closure).
        function setImmediate(fn) {
            timeouts.push(fn);
            window.postMessage(messageName, "*");
        }

        function handleMessage(event) {
            if (event.source == window && event.data == messageName) {
                event.stopPropagation();
                if (timeouts.length > 0) {
                    var fn = timeouts.shift();
                    fn();
                }
            }
        }

        window.addEventListener("message", handleMessage, true);

        // Add the one thing we want added to the window object.
        window.setImmediate = setImmediate;
    })();
}

Core = {
      __event_stack: []
    , _eventsTracking: 0
    , _eventsTrackingObjects: []
    , log: (function() {
        var a = [];
        a.__proto__ = { __proto__: a.__proto__, push: function() {
            Array.prototype.push.apply(this, arguments);
            while (this.length > 200) {
                this.shift();
            }
            if( this._eventsTracking ) {
                console.log(Array.prototype.map(arguments, function(v) {return v}))
            }
        }};
        return a;
    })()
    , EnableEventsTracking: function() {
        this._eventsTracking = true;
    }
    , DisableEventsTracking: function() {
        this._eventsTracking = false;
    }
    , EventPoint: function() {
            function event(data) {
                if (arguments.length > 1) {
                    console.error('we does not support events with big number of arguments. only 1 or nothing.');
                }
                if (data) {
                    for (var i in data) {
                        this[i] = data[i];
                    }
                }
                if (Core._eventsTracking) {
                    console.log(event._event, data)
                }
                this._event = event._event;
            }

            event.listeners = [];
            return event;
        }
    , RequestPoint: function() {
        function request(data, cb, fail_cb) {
            var i;
            if(data) {
                for(i in data) {
                    this[i] = data[i];
                }
            }
            this._request = request._request;
        }
        request.listeners = [];
        return request;
    }
    , _contexts: []
    , globalContext: {}
    , fetchContext: function() {
        if(!this._contexts.length) {
            throw new Error('Cannot fetch context not in CatchEvent or CatchRequest call');
        }
        return this._contexts[0]
    }
    , getStack: function(e) {
        return new (function stack() {
            (e || new Error()).stack.replace(/^ +at /mg, '').split(/\n/).slice(3).filter(function(string) {
                return !string.match(/^(Object\.Core\.)?Fire(Event|Request)/);
            })
        })
    }
    , FireEvent: function(event, /** optional */ context ) {

        //event.__proto__ = {__proto__: event.__proto__, stack: Core.getStack()};

        if(event instanceof Function) {
            console.log(event);
            throw new Error('Trying to fire not object, but Function');
        }

        this._contexts.unshift(context);

        var listeners = event.constructor.listeners;

        if(!event.constructor.options || event.constructor.options.log !== false) {
            this.log.push(event);
        }

        var methods = [];

        for(var i = 0; i < listeners.length; i++) {
            var handler = listeners[i];
            Core.__event_stack.unshift(event);

            try {
                (handler[1] instanceof Function ? (handler[1]) : handler[0][handler[1]] ).apply(handler[0], handler[2]);
                methods.push(handler[1])
            } catch (e) {
                methods.push('error: ', handler[1]);
                setImmediate(function() { throw e });
            }

            Core.__event_stack.shift();
        }
        if(!event.constructor.options || event.constructor.options.log !== false) {
            this.log.push(methods);
        }

        this._contexts.shift(context)
    }
    //, FireEvent: function(event, /** optional */ context ) {
    //
    //    //event.__proto__ = {__proto__: event.__proto__, stack: Core.getStack()};
    //
    //    if(event instanceof Function) {
    //        console.log(event);
    //        throw new Error('Trying to fire not object, but Function');
    //    }
    //
    //    setImmediate(function() {
    //        Core._contexts.unshift(context);
    //    });
    //
    //    var listeners = event.constructor.listeners;
    //
    //    if(!event.constructor.options || event.constructor.options.log !== false) {
    //        this.log.push(event);
    //    }
    //
    //    var methods = [];
    //
    //    setImmediate(function() {
    //        Core.__event_stack.unshift(event);
    //    });
    //
    //    for(var i = 0; i < listeners.length; i++) (function(handler){
    //        methods.push(handler[1]);
    //
    //        setImmediate(function() {
    //            (handler[1] instanceof Function ? (handler[1]) : handler[0][handler[1]] ).apply(handler[0], handler[2]);
    //        });
    //
    //    })(listeners[i])
    //
    //
    //    if(!event.constructor.options || event.constructor.options.log !== false) {
    //        this.log.push(methods);
    //    }
    //
    //    setImmediate(function() {
    //        Core.__event_stack.shift();
    //        Core._contexts.shift(context)
    //    });
    //}
    , FireRequest: function(request, cb, fail_cb, /** optional */context) {

        //request.__proto__ = {__proto__: request.__proto__, stack: Core.getStack()};

        if(request instanceof Function) {
            console.log(request);
            throw new Error('Trying to fire not object, but Function');
        }

        this._contexts.unshift(context);

        if(!request.constructor.options || request.constructor.options.log !== false) {
            this.log.push(request);
        }

        var _this = request;

        _this.__proto__._cb      = cb;
        _this.__proto__._fail_cb = fail_cb;

        if(!_this.__proto__._started) {
            _this.__proto__._started = true;
            if(global[_this._request + '_Start']) {
                var StartEvent = new global[_this._request + '_Start']();
                StartEvent.__proto__ = {__proto__: StartEvent.__proto__, request: _this};
                FireEvent(StartEvent)
            }
        }

        var methods = [];

        var listeners = request.constructor.listeners;
        for(var i in listeners) {
            Core.__event_stack.unshift(_this);
            try {
                var handler = listeners[i][0][listeners[i][1]](listeners[i][2]);
                if(handler) {
                    request._handlers.push([listeners[i][1], handler]);
                }
            } catch (e) {
                setImmediate(function() {throw e});
            }
            Core.__event_stack.shift();
        }

        if(!request.constructor.options || request.constructor.options.log !== false) {
            this.log.push(methods);
        }

        this._contexts.shift(context);

        function run_handler(i) {
            var handler = request._handlers[i];
            if(handler) {
                request._handlers_results.push(handler[0]);
                handler[1](function(result) {
                    var data = {
                        result: result
                    };

                    if(_this._reqid) {
                        data._reqid = _this._reqid
                    }
                    if(!_this._handled) {
                        _this.__proto__._handled = true;

                        var SuccessEvent = new global[request._request + '_Success'](data);
                        SuccessEvent.__proto__ = {__proto__: SuccessEvent.__proto__, request: request};
                        FireEvent(SuccessEvent);
                    }

                    request._handlers_results.push(result);

                    _this.__proto__._cb && _this.__proto__._cb(result);
                }, handler.name != 'success' ? function(){ run_handler(i + 1) } : new Function);
            } else {
                var data = {};
                if(_this._reqid) {
                    data._reqid = _this._reqid
                }
                if(!_this._handled) {
                    _this.__proto__._handled = true;
                    var FailEvent = new global[request._request + '_Fail'](data);
                    FailEvent.__proto__ = {__proto__: FailEvent.__proto__, request: request};
                    FireEvent(FailEvent);
                }
                _this.__proto__._fail_cb instanceof Function && _this.__proto__._fail_cb();
            }
        }

        if(cb || fail_cb) {
            run_handler(0)
        } else {
            //_this._run_handler = run_handler;
            run_handler(0)
        }

        if(!request.constructor.options || request.constructor.options.log !== false) {
            Core.log.push(request._handlers_results);
        }
    }
    , contextMatches: function checkRecursive(context, pattern) {
        for( var i in pattern ) {
            if( pattern.hasOwnProperty(i) ) {
                if( typeof pattern[i] != "object" ) {
                    if( pattern[i] != context[i] ) {
                        return false;
                    }
                } else if(pattern[i] instanceof Array) {
                    // наверное, будем сравнивать поэлементно?
                    // пока пропущу
                    throw new Error('Comparation of Arrays is not realized yet. P.S. Dear developer, please, select preferred model and realize.');
                } else {
                    if( !context[i] || !checkRecursive(context[i], pattern[i]) ) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    , _clone: function(obj, to) {
        if(obj) {
            for(var i in obj) {
                if(obj.hasOwnProperty(i)) {
                    to[i] = obj[i];
                }
            }
        }

    }
    , registerEventPoint: function(name, options) {

        if(global[name] instanceof Core.EventPoint) return;

        eval('var eventConstructor = function ' + name + '(data) { \n' +
        '   Core._clone(data, this); \n' +
        '   this._event = ' + name + '._event; \n' +
        '}');

        eventConstructor.prototype = {__proto__: options && options.parent || Core.EventPoint.prototype, constructor: eventConstructor};
        eventConstructor.listeners = [];
        eventConstructor._event    = name;
        eventConstructor.options   = options;

        global[name] = eventConstructor;
    }
    , registerRequestPoint: function(name, options) {

        if(global[name] instanceof Core.RequestPoint) return;

        eval('var requestConstructor = function ' + name + '(data) { \n' +
        '   Core._clone(data, this); \n' +
        '   this._request = ' + name + '._request; \n' +
        '   this.__proto__ = {__proto__: this.__proto__, _handlers: [], _handlers_results: [], _cb: null, _fail_cb: null, _started: false, _handled: false} \n' +
        '}');

        requestConstructor.prototype = {__proto__: options && options.parent || Core.RequestPoint.prototype, constructor: requestConstructor};
        requestConstructor._request  = name;
        requestConstructor.listeners = [];
        requestConstructor.options   = options;

        global[name] = requestConstructor;

        this.registerEventPoint(name + '_Start'  , {log: false});
        this.registerEventPoint(name + '_Success', {log: !options || options.log});
        this.registerEventPoint(name + '_Fail'   , {log: !options || options.log});
    }
    , _namespaces: {}
    , getNamespace: function(namespace) {
        if(!this._namespaces[namespace]) {
            this._namespaces[namespace] = new function(){
                this.processNamespace = function() {
                    Core.processNamespace(this);
                }
            };
        }
        return this._namespaces[namespace];
    }
    , processNamespace: function(namespace) {
        for(var _classname in namespace) {
            var _class = namespace[_classname];
            if (typeof _class !== 'object' || !_class)
                continue;
            if (_class.hasOwnProperty('__inited__'))
                continue;
            if (_class.__init instanceof Function) {
                _class.__init();
            }
            for(var method in _class) {
                var events;
                if (_class[method] instanceof Function) {
                    if (events = _class[method].toString().replace(/\n/g,"").match(/(Core\.)?(CatchEvent|CatchRequest)\(([^\)]+)\)/m)) {
                        events = events[3].replace(/^[ \t]*|[ \t]*$/g,"").split(/[ \t\n\r]*,[ \t\n\r]*/);
                        for(var i in events) {
                            try {
                                var parts = events[i].split('.');
                                var cursor = global;
                                for(var n in parts) {
                                    cursor = cursor[parts[n]];
                                }
                                cursor.listeners.push([_class, method]);

                                if( _class[method].toString().indexOf('CatchEvent') > -1 ) {
                                    cursor._event   = events[i];
                                } else if( _class[method].toString().indexOf('CatchRequest') > -1 ) {
                                    cursor._request = events[i];
                                }
                            } catch(e) {
                                console.error('cannot parse ' + events[i] + ' in CatchEvent in [namespace].' + _classname + '.' + method, e.stack ? e.message : e, e.stack ? e.stack : 'no stack provided');
                            }
                        }
                    }
                }
            }
            if(_class.Init) {
                FireEvent(new _class.Init);
            }
            if( Object.defineProperty && Object.getOwnPropertyDescriptor(_class, '__inited__') && Object.getOwnPropertyDescriptor(_class, '__inited__').writable !== false ) {
                Object.defineProperty(_class, '__inited__', { value: true});
            } else {
                _class.__inited__ = true
            }
        }
    }
    , processObject: function(object) {
        var _class = object;

        if( _class.__inited__ )
            return;
        if( _class.__init instanceof Function ) {
            _class.__init();
        }
        for( var method in _class ) {
            var events;
            if( _class[method] instanceof Function ) {
                if( events = _class[method].toString().replace(/\n/g,"").match(/(Core\.)?(CatchEvent|CatchRequest)\(([^\)]+)\)/m) ) {
                    events = events[3].replace(/^[ \t\n\r]*|[ \t\n\r]*$/mg,"").split(/[ \t\n\r]*,[ \t\n\r]*/);
                    for( var i in events ) {
                        try {
                            var parts = events[i].split('.');
                            var cursor = global;
                            for(var n in parts) {
                                cursor = cursor[parts[n]];
                            }
                            cursor.listeners.push([_class, method]);

                            if( _class[method].toString().indexOf('CatchEvent') > -1 ) {
                                cursor._event   = events[i];
                            } else if( _class[method].toString().indexOf('CatchRequest') > -1 ) {
                                cursor._request = events[i];
                            }
                        } catch(e) {
                            console.error('cannot parse ' + events[i] + ' in [namespace].' + '.' + method, e.stack ? e.message : e, e.stack ? e.stack : 'no stack provided');
                        }
                    }
                }
            }
        }
        if( _class.Init ) {
            try {
                FireEvent(new _class.Init);
            } catch(e) {
                console.error(e.stack ? e.message : e, e.stack ? e.stack : 'no stack provided');
            }
        }
        _class.__inited__ = true;

        return object;
    }
    , CatchEvent:   function() { return Core.__event_stack[0]; /* supress no arguments warning */ arguments;}
    , CatchRequest: function() { return Core.__event_stack[0]; /* supress no arguments warning */ arguments;}
    , state: function() {
        if(!arguments.length) {
            throw new Error('no states defined');
        }
        var args = arguments;
        var o = {
            Changed: new Core.EventPoint(),
            value: args[0],
            addCssTrigger: function(selector, prefix) {
                o.cssTrigger = selector;
                o.cssTriggerPrefix = prefix || '';
                jQuery(function() {
                    jQuery(o.cssTrigger).addClass(o.cssTriggerPrefix + o.value);
                });
                return o;
            },
            go: function(state) {
                if(!o["Go" + state]) {
                    throw new Error('wrong state ' + state);
                }
                console.log(state, o.value);
                if(state == o.value) {
                    return;
                }
                var from = o.value;
                o.value = state;
                if(o.cssTrigger) {
                    for(var i = 0; i < args.length; i++) {
                        jQuery(o.cssTrigger).removeClass(o.cssTriggerPrefix + args[i]);
                    }
                    jQuery(o.cssTrigger).addClass(o.cssTriggerPrefix + state);
                }
                setTimeout( function() {
                    FireEvent(new o.Changed({from: from, to: state}));
                    FireEvent(new o["Go" + state]({from: from}));
                }, 0);
            }
        };
        for(var i = 0; i < args.length; i++) {
            o["Go" + args[i]] = new Core.EventPoint();
        }
        return o;
    }
    , stack: function() {
        var stack = [];

        for(var i = 0 ; i < arguments.length; i++) {
            stack[i] = arguments[i];
        }

        stack.set = function(layer_num, name, data) {
            this[layer_num] = [name, data];
            this.splice(layer_num + 1);
        };

        return stack;
    }
    , processGlobal: function() {
        CatchEvent(DOM_Init);
        for(var i in window) {
            if(i.match(/^[A-Z]/) && window.hasOwnProperty(i)) {
                //if(i instanceof Core.RequestPoint) {
                //}
                Core.processObject(window[i])
            }
        }
    }
};

Core.RequestPoint.prototype.addHandler = function addHandler(handler) {
    this._handlers.push(addHandler.caller, handler);
};

if(typeof window != 'undefined') {

    /** @name DOM_Init */
    Core.registerEventPoint('DOM_Init');
    /** @name DOM_Unload */
    Core.registerEventPoint('DOM_Unload');
    /** @name DOM_Changed */
    Core.registerEventPoint('DOM_Changed');
    /** @name Window_Scroll */
    Core.registerEventPoint('Window_Scroll');
    /** @name Window_Resize */
    Core.registerEventPoint('Window_Resize');

    Event_DOM_Init      = DOM_Init     ;
    Event_DOM_Unload    = DOM_Unload   ;
    Event_Window_Scroll = Window_Scroll;
    Event_Window_Resize = Window_Resize;
    Event_DOM_Changed   = DOM_Changed  ;

    // cross-browser DOM_Ready
    (function contentLoaded(win, fn) {

        var done = false, top = true,

            doc = win.document, root = doc.documentElement,

            add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
            rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
            pre = doc.addEventListener ? '' : 'on',

            init = function(e) {
                if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
                (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
                if (!done && (done = true)) fn.call(win, e.type || e);
            },

            poll = function() {
                try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
                init('poll');
            };

        if (doc.readyState == 'complete') fn.call(win, 'lazy');
        else {
            if (doc.createEventObject && root.doScroll) {
                try { top = !win.frameElement; } catch(e) { }
                if (top) poll();
            }
            doc[add](pre + 'DOMContentLoaded', init, false);
            doc[add](pre + 'readystatechange', init, false);
            win[add](pre + 'load', init, false);
        }

    })(window, function core_events_list(e){
        var old_onscroll, old_onresize;
        if(window.onscroll || document.body.onscroll) {
            old_onscroll = window.onscroll || document.body.onscroll;
        }
        if(window.onresize || document.body.onresize) {
            old_onresize = window.onresize || document.body.onresize;
        }

        FireEvent(new DOM_Init());

        FireEvent(new DOM_Changed({element: document.body}));

        window.onscroll = document.body.onscroll = function(event) {
            if(old_onscroll) {
                old_onscroll(event);
            }
            FireEvent(new Window_Scroll({dom_event: event}));
        };
        window.onresize = document.body.onresize = function(event) {
            if(old_onresize) {
                old_onresize(event);
            }
            FireEvent(new Window_Resize({dom_event: event}));
        };

        window.onbeforeunload = function(event) {
            FireEvent(new DOM_Unload({dom_event: event}));
        };

    });
}

if(typeof global.Event == 'undefined' ) {
    global.Event = {};
}

if(typeof require != 'undefined') {
    module.exports = Core;
}

//global.after = function after() {
//    return {_check: 'after', values: Array.prototype.slice.apply(arguments)}
//};

CatchEvent   = function(){ return Core.CatchEvent  .apply(Core, arguments); };
CatchRequest = function(){ return Core.CatchRequest.apply(Core, arguments); };
FireRequest  = function(){ return Core.FireRequest .apply(Core, arguments); };
FireEvent    = function(){ return Core.FireEvent   .apply(Core, arguments); };
EventPoint   = Core.EventPoint;

