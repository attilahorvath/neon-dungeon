import Game from './Game';

const game = new Game();

const updateGame = timestamp => {
  requestAnimationFrame(updateGame);

  game.update(timestamp);
  game.draw();
};

addEventListener('keydown', event => {
  switch (event.keyCode) {
  case 38: case 87: case 75:
    game.input.press(game.input.UP);
    break;
  case 40: case 83: case 74:
    game.input.press(game.input.DOWN);
    break;
  case 37: case 65: case 72:
    game.input.press(game.input.LEFT);
    break;
  case 39: case 68: case 76:
    game.input.press(game.input.RIGHT);
    break;
  }
});

addEventListener('keyup', event => {
  switch (event.keyCode) {
  case 38: case 87: case 75:
    game.input.release(game.input.UP);
    break;
  case 40: case 83: case 74:
    game.input.release(game.input.DOWN);
    break;
  case 37: case 65: case 72:
    game.input.release(game.input.LEFT);
    break;
  case 39: case 68: case 76:
    game.input.release(game.input.RIGHT);
    break;
  }
});

requestAnimationFrame(updateGame);
