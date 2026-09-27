const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const THREE = require('../vendor-three.min.js');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

function extractFunction(name) {
  const start = html.indexOf('function ' + name + '(');
  assert.notEqual(start, -1, 'expected to find ' + name + ' in the game');
  const open = html.indexOf('{', start);
  let depth = 0;
  for (let index = open; index < html.length; index++) {
    if (html[index] === '{') depth++;
    if (html[index] === '}' && --depth === 0) return html.slice(start, index + 1);
  }
  throw new Error('could not extract ' + name);
}

function paintCameraPosition(yaw, pitch) {
  const camera = new THREE.PerspectiveCamera(54, 1, 0.1, 90);
  const context = vm.createContext({
    THREE,
    camera,
    player: { root: { position: new THREE.Vector3(0, 0, 0) } },
    paintMode: true,
    paused: false,
    phase: 'hide',
    cameraYaw: yaw,
    cameraPitch: pitch,
    moveInputEmpty: function () { return true; }
  });
  const updateCamera = vm.runInContext('(' + extractFunction('updateCamera') + ')', context);
  updateCamera(1 / 60);
  camera.updateMatrixWorld(true);
  return camera.position.clone();
}

function paintRayCameraPosition(camera) {
  let matrixPosition;
  let rayDirection;
  const context = vm.createContext({
    window: { innerWidth: 100, innerHeight: 100 },
    camera,
    raycaster: {
      setFromCamera: function (_pointer, targetCamera) {
        matrixPosition = targetCamera.matrixWorld.elements.slice(12, 15);
        rayDirection = targetCamera.getWorldDirection(new THREE.Vector3()).toArray();
      },
      intersectObjects: function () { return []; }
    },
    pointer: new THREE.Vector2(),
    updateCamera: function () {
      camera.position.set(5, 3, 4);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    },
    player: { parts: [] },
    worldMeshes: []
  });
  const paintAt = vm.runInContext('(' + extractFunction('paintAt') + ')', context);
  paintAt(50, 50, false);
  return { position: matrixPosition, direction: rayDirection };
}

function orbitPaintCamera(yaw, pitch, dx, dy) {
  const camera = new THREE.PerspectiveCamera(54, 1, 0.1, 90);
  const context = vm.createContext({
    THREE,
    camera,
    player: { root: { position: new THREE.Vector3(0, 0, 0) } },
    paintMode: true,
    paused: false,
    phase: 'hide',
    cameraYaw: yaw,
    cameraPitch: pitch,
    moveInputEmpty: function () { return true; }
  });
  context.updateCamera = vm.runInContext('(' + extractFunction('updateCamera') + ')', context);
  const orbit = vm.runInContext('(' + extractFunction('orbitPaintCamera') + ')', context);
  context.updateCamera(0);
  camera.updateMatrixWorld(true);
  const before = camera.position.clone();
  orbit(dx, dy);
  return { before: before, after: camera.position.clone(), yaw: context.cameraYaw, pitch: context.cameraPitch };
}

test('the paint camera can orbit vertically instead of staying at one height', function () {
  const lowerView = paintCameraPosition(0, -0.3);
  const upperView = paintCameraPosition(0, 0.6);
  assert.ok(Math.abs(lowerView.y - upperView.y) > 0.5);
});

test('the paint camera can orbit around the character', function () {
  const frontView = paintCameraPosition(0, 0.1);
  const sideView = paintCameraPosition(Math.PI / 2, 0.1);
  assert.ok(Math.abs(frontView.x - sideView.x) > 2);
});

test('paint rays use the camera transform after the camera moves', function () {
  const camera = new THREE.PerspectiveCamera(54, 1, 0.1, 90);
  const ray = paintRayCameraPosition(camera);
  assert.deepEqual(ray.position, [5, 3, 4]);
  const expected = new THREE.Vector3(-5, -3, -4).normalize();
  ray.direction.forEach(function (value, index) {
    assert.ok(Math.abs(value - expected.toArray()[index]) < 1e-9);
  });
});

test('orbit gestures change yaw and pitch and immediately refresh the camera', function () {
  const result = orbitPaintCamera(0, 0.08, 120, -100);
  assert.ok(Math.abs(result.yaw) > 0.5);
  assert.ok(result.pitch > 0.5);
  assert.ok(result.before.distanceTo(result.after) > 2);
});
