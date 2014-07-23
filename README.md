CoreJS
======

Awesome Event Oriented Javascript Framework

#Installing

#API

##Events
Event is a complex event model. 

###Initialization

```javascript
  var Object = {
      FirstExampleEvent : new Core.EventPoint()
    , SecondExampleEvent: new Core.EventPoint()
  }
```

###Firing

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

##Requests

###Initialization

```javascript
  var Object = {
      ExampleRequest: new Core.RequestPoint()
  }
```

###Firing

```javascript
  var FireObject = {
    fireRequest: function() {
      new Object.ExampleRequest({param1: 'param1'});
    }
  }
```
###Catching

```javascript
var CatchObject = {
  onRequest: function() {
    var request = Core.CatchRequest(Object.ExampleRequest);
    
    return function(success) {
      //code here
      var data = { answer: 'answer to request', params: request.param1};
      success(data);
    }
  }
}
```




