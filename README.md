CoreJS
======

Awesome Event Oriented Javascript Framework

#Installing

#API

##Events

###Initialization

```javascript
  var Object = {
    ExampleEvent: new Core.EventPoint()
  }
```

###Fireing
```javascript
  var FireObject = {
    fireEvent: function() {
      new Object.ExamplaEvent({param1: 'param1'});
    }
  }
```
###Catching
```javascript
var CatchObject = {
  onEvent: function() {
    var event = Core.CatchEvent(Object.ExampleEvent);
    
    // event = { param1: 'param1' }
  }
}
