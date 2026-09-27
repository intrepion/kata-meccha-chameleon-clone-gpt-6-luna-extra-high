const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const gameMovement = require('../movement.js');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

const collisionData = [{
  shape: 'box',
  x: 0,
  z: 0,
  halfWidth: 1,
  halfDepth: 1,
  bottom: 0,
  top: 2
}];

test('a diagonal path outside a prop corner remains walkable', function () {
  const position = { x: 1.4, z: 1.4 };
  assert.equal(gameMovement.isBlocked(position, 0.5, 2, collisionData), false);
});

test('camera-relative forward follows the camera at quarter turns', function () {
  const facingNorth = gameMovement.movementVector({ KeyW: true }, 0, 1);
  const facingEast = gameMovement.movementVector({ KeyW: true }, Math.PI / 2, 1);
  assert.ok(Math.abs(facingNorth.x) < 1e-9);
  assert.ok(Math.abs(facingNorth.z + 1) < 1e-9);
  assert.ok(Math.abs(facingEast.x + 1) < 1e-9);
  assert.ok(Math.abs(facingEast.z) < 1e-9);
});

test('diagonal input does not exceed the chosen speed', function () {
  const direction = gameMovement.movementVector({ KeyW: true, KeyD: true }, 0.7, 5.1);
  assert.ok(Math.abs(Math.hypot(direction.x, direction.z) - 5.1) < 1e-9);
});

test('a direct overlap with a box remains blocked', function () {
  assert.equal(gameMovement.isBlocked({ x: 1.2, z: 1.2 }, 0.5, 2, collisionData), true);
});

test('round props use a radial hitbox instead of a square corner', function () {
  const roundObstacle = [{
    shape: 'circle',
    x: 0,
    z: 0,
    radius: 1,
    bottom: 0,
    top: 2
  }];
  assert.equal(gameMovement.isBlocked({ x: 1.2, z: 1.2 }, 0.5, 2, roundObstacle), false);
  assert.equal(gameMovement.isBlocked({ x: 1, z: 1 }, 0.5, 2, roundObstacle), true);
});

test('props above the character do not block ground movement', function () {
  const overheadObstacle = [{
    shape: 'box',
    x: 0,
    z: 0,
    halfWidth: 1,
    halfDepth: 1,
    bottom: 2.5,
    top: 3.5
  }];
  assert.equal(gameMovement.isBlocked({ x: 0, z: 0 }, 0.5, 2.15, overheadObstacle), false);
});

test('movement slides along an obstacle instead of stopping on both axes', function () {
  const position = gameMovement.moveOnPlane(
    { x: -1.6, z: 0 },
    1,
    1,
    0.5,
    2,
    collisionData,
    { minX: -10, maxX: 10, minZ: -10, maxZ: 10 }
  );
  assert.equal(position.x, -1.6);
  assert.equal(position.z, 1);
});

test('held movement keys can be cleared when the window loses focus', function () {
  const keys = { KeyW: true, KeyA: true, ShiftLeft: true };
  gameMovement.clearKeys(keys);
  assert.deepEqual(keys, {});
});

test('the browser game uses the shared movement resolver', function () {
  assert.match(html, /<script src="movement\.js"><\/script>/);
  assert.match(html, /GameMovement\.moveOnPlane\(/);
});
