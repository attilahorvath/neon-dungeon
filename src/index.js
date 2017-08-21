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
    game.up = true;
    break;
  case 40: case 83: case 74:
    game.down = true;
    break;
  case 37: case 65: case 72:
    game.left = true;
    break;
  case 39: case 68: case 76:
    game.right = true;
    break;
  }
});

addEventListener('keyup', event => {
  switch (event.keyCode) {
  case 38: case 87: case 75:
    game.up = false;
    break;
  case 40: case 83: case 74:
    game.down = false;
    break;
  case 37: case 65: case 72:
    game.left = false;
    break;
  case 39: case 68: case 76:
    game.right = false;
    break;
  }
});

requestAnimationFrame(updateGame);
