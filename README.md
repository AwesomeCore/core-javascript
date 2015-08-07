CoreJS
======

Awesome Event Oriented Javascript Framework

This framework provide us with new principles of the design of the code. The main idea is that the hole project is a set of modules. Every module has it's own objects. Some objects may have Events and Requests.

Event is a complex object, that means that something has already happend.
Request is a complex object, that means that something asks to perform its request.

Other objects of the system can subscribe to Events and Requests. Subscription is a static process.
During initialization Core parses project and subscribes objects on Events and Requests.

#Installing

#API

##Events
###Description
There are three steps for using Events: initialization, firing, catching.
You can pass some data with Event.

###Example
####Initialization
To initialize Event object call `Core.registerEventPoint` with Event name. Event name consists of Object name that has this Event and action name.
```javascript
  Core.registerEventPoint('Player_Started');
```

####Firing
To fire Event call `FireEvent` function with created Event.
```javascript
  var Player = {
      mediaTag: document.getElementById('audio')

    , start: function() {
      this.mediaTag.play();
      
      FireEvent(new Player_Started({data: 'some-data'}));
    }
  }
```

####Catching
The main twist is that you can catch the fired Event at any spaces of your code.
So this can cut your code several times.

Also you can dinamically subscribe to the event. It is useful in different cases, for example, in angular directives.

#####Single Event Catching
```javascript
var GoogleTrackingObject = {
  sendPlayerEvent: function() {
    var event = CatchEvent(Player_Started);
    
    /* event.data === 'some-data'  //true    */
    
    ga('send', 'event', 'player', 'start');
  }
}
```

#####Multiple Event Catching
```javascript
var GoogleTrackingObject = {
  sendPlayerEvents: function() {
    var event = CatchEvent(Player_Started, Player_Paused);
    
    ga('send', 'event', 'player', 'player_event');
  }
}
```

##Requests
###Description
There are three steps for using them: initialization, firing, catching.
You can pass some data with the Request.

###Example
####Initialization
Just create Request object.
```javascript
  Core.registerRequestPoint('PlayerUI_StartRequest')
```

####Firing
Fire it and ask something to perform your request.
```javascript
  var PlayerUi = {
    startPlaying: function() {
      FireRequest(
          new PlayerUI_StartRequest({data: 'some-data'})
        , function() {} // success callback
        , function() {} // error callback
        , {} // context
      )
    }
  }
```

####Catching
Catch the Request and perform it.
```javascript
var PlayerAudio = {
  startPlaying: function() {
    var request = CatchRequest(PlayerUI_StartRequest);
    
    /* request.data === 'some-data'  //true    */
    
    return function(cb, eb) {
      /* start playing audio player logic */
      cb();
    }
  }
}
```

There can be several objects that can resolve Requests. When one of them can't process Request it call error callback function and next object start processing.

```javascript
var PlayerAudio = {
    mediaTag: null
  
  , startPlaying: function() {
    CatchRequest(PlayerUI_StartRequest);
    
    return function(cb, eb) {
      if( !PlayerAudio.mediaTag ) {
        return eb();
      }
      
      /* start playing audio player logic */
      cb();
    }
  }
}

var Player = {
  start: function() {
    CatchRequest(PlayerUI_StartRequest);
    
    return function(cb, eb) {
      /* start playing audio player logic */
      cb();
    }
  }
}
```

##States

###Description
####Usage
```javascript
 Core.state(state1, state2, ...)
```

####Params
```javascript
  (String) '' // name of the state
```

####Returns
```javascript
 (Object) {
    value: (String)    // current state value
  , go   : (Function)  // method to change state
 }
```

###Examples
####Initialization
```javascript
 var Object = {
   mainState: Core.state('Idle', 'Running', 'Stopped')
 }
```
When the object has been inited, its state goes to the first value of the set.


####Changing State
```javascript
  Object.mainState.go('Running');
```

When state has been changed, the Event `Object.mainState.GoRunning` fires. And it can be catched at any space of the application.

```javascript
 var MiddleObject = {
  getState: function() {
    Core.CatchEvent(Object.mainState.GoRunning, Object.mainState.GoStopped);
    
    if( Object.mainState.value === 'Running' ) {
      // your code here
    }
  }
 }
```
