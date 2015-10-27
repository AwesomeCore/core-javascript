Core = {
    code: function(cb) {
        // парсим events.* classes.* requests.* и сокращенные ev.* rq.* cl.*
        if(!(cb instanceof Function)) {
            throw new Error('when call Core.code(): callback is not function');
        }
        rq = requests = requests || {};
        cl = classes  = classes  || {};
        ev = events   = events   || {};

        
    }
};