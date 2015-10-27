if(typeof window != 'undefined') {
    global = window;
}

Core = {
    code: function(cb) {
        // парсим events.* classes.* requests.* и сокращенные ev.* rq.* cl.*
        if(!(cb instanceof Function)) {
            throw new Error('when call Core.code(): callback is not function');
        }
        rq = requests = global.requests || {};
        cl = classes  = global.classes  || {};
        ev = events   = global.events   || {};

        var matches = cb.toString().match(/(rq|requests|ev|events|cl|classes)\.[a-zA-Z.0-9$_]+/g);

        console.log(matches);


        
    }
};
