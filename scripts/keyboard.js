///Listens for keyboard inputs
window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

//Structure logging currently pressed keys
const Key = {
  //Set of currently pressed keys
  _pressed: {},

  //Recognized keyCodes
  A: 65,
  W: 87,
  D: 68,
  S: 83,
  SPACE: 32,
  
  //Checks if keyCode is currently pressed
  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },
  
  //Adds pressed key to currently pressed
  onKeydown: function(event) {
    this._pressed[event.keyCode] = true;
  },
  
  //Removes pressed key from currently pressed
  onKeyup: function(event) {
    delete this._pressed[event.keyCode];
  }
};


