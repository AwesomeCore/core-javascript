check = function(value, check_instance) { return check._handlers[check_instance._check].call(check_instance, value)};
check._handlers = {};
check._register = function(name, handler) {
    check[name] = function(value) {
        this._check = name;
        this.value = value;
    };
    check._handlers[name] = handler;
    //check[name].prototype.__proto__ = check;
    return check[name];
};

check.eq         = check._register('eq'         , function(value) { return value === this.value });
check.more       = check._register('more'       , function(value) { return value >  this.value });
check.moreOrEq   = check._register('moreOrEq'   , function(value) { return value >= this.value });
check.less       = check._register('less'       , function(value) { return value <  this.value });
check.lessOrEq   = check._register('lessOrEq'   , function(value) { return value <= this.value });
check.startsWith = check._register('startsWith' , function(value) { throw 'not implemented' });
check.oneOf      = check._register('oneOf'      , function(value) { return this.value.indexOf(value) !== -1 });
check.isString   = check._register('isString'   , function(value) { return typeof(value) == 'string' });
check.isNumber   = check._register('isNumber'   , function(value) { return typeof(value) == 'number' });
check.isObject   = check._register('isObject'   , function(value) { return typeof(value) == 'object' });
check.isArray    = check._register('isArray'    , function(value) { return typeof(value) == 'object' && value instanceof Array });
check.instanceof = check._register('instanceof' , function(value) { return this.value == 'function' ?
value instanceof this.value :
    (window[this.value] && value instanceof window[this.value])
});
check.contain    = check._register('contain'    , function(value) {
    var i;
    if(value instanceof Array) {
        for(i = 0; i < this.value.length; i++) {
            if(value.indexOf(this.value[i]) === -1) {
                return false;
            }
        }
    } else {
        for(i in this.value) {
            if (typeof this.value[i] == 'object' && this.value[i] instanceof check) {
                if(!this.value[i](value[i])) {
                    return false
                }
            } else {
                if(this.value[i] != value[i]) {
                    return false
                }
            }
        }
    }
    return true
});
check.eachMatch  = check._register('eachMatch'  , function(value) {
    for(var i = 0; i < value.length; i++) {
        if(!this.value(value[i])) {
            return false;
        }
    }
    return true;
});
