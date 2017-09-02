export default class Input {
  constructor() {
    this.UP = 1;
    this.DOWN = 2;
    this.LEFT = 4;
    this.RIGHT = 8;
    this.ACTION = 16;

    this.pressed = 0;
    this.lastPressed = 0;

    this.justPressed = 0;
    this.justReleased = 0;
  }

  press(key) {
    this.pressed |= key;
  }

  release(key) {
    this.pressed &= ~key;
  }

  isPressed(key) {
    return (this.pressed & key) === key;
  }

  wasJustPressed(key) {
    return (this.justPressed & key) === key;
  }

  wasJustReleased(key) {
    return (this.justReleased & key) === key;
  }

  update() {
    this.justPressed = this.pressed & ~this.lastPressed;
    this.justReleased = this.lastPressed & ~this.pressed;

    this.lastPressed = this.pressed;
  }
}
