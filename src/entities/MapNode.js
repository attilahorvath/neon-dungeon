const MIN_SIZE = 16;
const MIN_ROOM_OFFSET = 1;
const MIN_ROOM_SIZE = 10;

export default class MapNode {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.snakes = 0;
    this.containsGem = false;
    this.containsHeart = false;
  }

  isLeaf() {
    return !this.childA && !this.childB;
  }

  split() {
    if (!this.isLeaf() || this.w < MIN_SIZE * 2 || this.h < MIN_SIZE * 2) {
      this.createRoom();
      return false;
    }

    if (this.w / this.h <= 0.75) {
      this.splitHorizontally();
    } else if (this.h / this.w <= 0.75) {
      this.splitVertically();
    } else if (Math.random() < 0.5) {
      this.splitHorizontally();
    } else {
      this.splitVertically();
    }

    this.childA.split();
    this.childB.split();
  }

  splitHorizontally() {
    const size = Math.round(MIN_SIZE + Math.random() * (this.h - MIN_SIZE * 2));

    this.childA = new MapNode(this.x, this.y, this.w, size);
    this.childB = new MapNode(this.x, this.y + size, this.w, this.h - size);
  }

  splitVertically() {
    const size = Math.round(MIN_SIZE + Math.random() * (this.w - MIN_SIZE * 2));

    this.childA = new MapNode(this.x, this.y, size, this.h);
    this.childB = new MapNode(this.x + size, this.y, this.w - size, this.h);
  }

  createRoom() {
    this.roomW = Math.round(MIN_ROOM_SIZE + Math.random() *
      (this.w - 2 * MIN_ROOM_OFFSET - MIN_ROOM_SIZE));
    this.roomH = Math.round(MIN_ROOM_SIZE + Math.random() *
      (this.h - 2 * MIN_ROOM_OFFSET - MIN_ROOM_SIZE));
    this.roomX = Math.round(this.x + MIN_ROOM_OFFSET + Math.random() *
      (this.w - this.roomW - 2 * MIN_ROOM_OFFSET));
    this.roomY = Math.round(this.y + MIN_ROOM_OFFSET + Math.random() *
      (this.h - this.roomH - 2 * MIN_ROOM_OFFSET));
  }

  leafCount() {
    if (this.isLeaf()) {
      return 1;
    }

    return this.childA.leafCount() + this.childB.leafCount();
  }

  visitLeaves(f) {
    if (this.isLeaf()) {
      return f(this);
    }

    this.childA.visitLeaves(f);
    this.childB.visitLeaves(f);
  }

  visitLeafPairs(f) {
    if (this.isLeaf()) {
      return this;
    }

    const leafA = this.childA.visitLeafPairs(f);
    const leafB = this.childB.visitLeafPairs(f);

    f(leafA, leafB);

    return Math.random() < 0.5 ? leafA : leafB;
  }

  getRandomLeaf() {
    if (this.isLeaf()) {
      return this;
    }

    return Math.random() < 0.5 ? this.childA.getRandomLeaf()
      : this.childB.getRandomLeaf();
  }
}
