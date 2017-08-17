const MIN_SIZE = 50;
const MIN_ROOM_OFFSET = 5;
const MIN_ROOM_SIZE = 30;

export default class MapNode {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  split() {
    if (this.childA || this.childB ||
        this.w <= MIN_SIZE * 2 || this.h <= MIN_SIZE * 2) {
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
    let size = MIN_SIZE + Math.random() * (this.h - MIN_SIZE * 2);

    this.childA = new MapNode(this.x, this.y, this.w, size);
    this.childB = new MapNode(this.x, this.y + size, this.w, this.h - size);
  }

  splitVertically() {
    let size = MIN_SIZE + Math.random() * (this.w - MIN_SIZE * 2);

    this.childA = new MapNode(this.x, this.y, size, this.h);
    this.childB = new MapNode(this.x + size, this.y, this.w - size, this.h);
  }

  createRooms() {
    this.visitLeaves(leaf => {
      leaf.roomW = MIN_ROOM_SIZE + Math.random() * (leaf.w - 2 * MIN_ROOM_OFFSET
                   - MIN_ROOM_SIZE);
      leaf.roomH = MIN_ROOM_SIZE + Math.random() * (leaf.h - 2 * MIN_ROOM_OFFSET
                   - MIN_ROOM_SIZE);
      leaf.roomX = leaf.x + MIN_ROOM_OFFSET + Math.random() * (leaf.w -
                   leaf.roomW - 2 * MIN_ROOM_OFFSET);
      leaf.roomY = leaf.y + MIN_ROOM_OFFSET + Math.random() * (leaf.h -
                   leaf.roomH - 2 * MIN_ROOM_OFFSET);
    });
  }

  leafCount() {
    if (!this.childA || !this.childB) {
      return 1;
    }

    return this.childA.leafCount() + this.childB.leafCount();
  }

  visitLeaves(f) {
    if (!this.childA || !this.childB) {
      return f(this);
    }

    this.childA.visitLeaves(f);
    this.childB.visitLeaves(f);
  }
}
