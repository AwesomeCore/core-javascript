CoreJS
======

Awesome Event Oriented Javascript Framework

#Installing

#API

##Events

###Initialization

```javascript
  var Object = {
      FirstExampleEvent : new Core.EventPoint()
    , SecondExampleEvent: new Core.EventPoint()
  }
```

###Fireing

```javascript
  var FireObject = {
    fireEvent: function() {
      new Object.FirstExampleEvent({param1: 'param1'});
      new Object.SecondExampleEvent();
    }
  }
```
###Catching

####Single Event Catching
```javascript
var CatchObject = {
  onEvent: function() {
    var event = Core.CatchEvent(Object.FirstExampleEvent);
    
    // event == { param1: 'param1' }
  }
}
```

####Multiple Event Catching
```javascript
var CatchObject = {
  onEvent: function() {
    var event = Core.CatchEvent(Object.FirstExampleEvent, Object.SecondExampleEvent);
    
    if( event instanceof Object.FirstExampleEvent ) {
      // event == { param1: 'param1' }
    } else {
      //
    }
    
    
  }
}
```






