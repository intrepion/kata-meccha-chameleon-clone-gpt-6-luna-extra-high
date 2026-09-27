(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.GameMovement = api;
}(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';

  function movementVector(keys, yaw, speed) {
    var right = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
    var forward = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0);
    var inputLength = Math.hypot(right, forward);
    if (inputLength > 1) {
      right /= inputLength;
      forward /= inputLength;
    }
    var cosine = Math.cos(yaw);
    var sine = Math.sin(yaw);
    return {
      x: (cosine * right - sine * forward) * speed,
      z: (-sine * right - cosine * forward) * speed
    };
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function isBlocked(position, radius, characterHeight, obstacles) {
    for (var i = 0; i < obstacles.length; i++) {
      var obstacle = obstacles[i];
      var bottom = obstacle.bottom === undefined ? 0 : obstacle.bottom;
      var top = obstacle.top === undefined ? obstacle.y : obstacle.top;
      if (top <= 0 || bottom >= characterHeight) continue;

      if (obstacle.shape === 'circle') {
        var circleRadius = obstacle.radius === undefined ? Math.max(obstacle.rx, obstacle.rz) : obstacle.radius;
        var circleDx = position.x - obstacle.x;
        var circleDz = position.z - obstacle.z;
        var combinedRadius = radius + circleRadius;
        if (circleDx * circleDx + circleDz * circleDz < combinedRadius * combinedRadius) return true;
        continue;
      }

      var halfWidth = obstacle.halfWidth === undefined ? obstacle.rx : obstacle.halfWidth;
      var halfDepth = obstacle.halfDepth === undefined ? obstacle.rz : obstacle.halfDepth;
      var nearestX = clamp(position.x, obstacle.x - halfWidth, obstacle.x + halfWidth);
      var nearestZ = clamp(position.z, obstacle.z - halfDepth, obstacle.z + halfDepth);
      var dx = position.x - nearestX;
      var dz = position.z - nearestZ;
      if (dx * dx + dz * dz < radius * radius) return true;
    }
    return false;
  }

  function moveOnPlane(position, dx, dz, radius, characterHeight, obstacles, bounds) {
    var next = { x: position.x, z: position.z };
    bounds = bounds || {};

    var candidateX = clamp(next.x + dx, bounds.minX === undefined ? -Infinity : bounds.minX, bounds.maxX === undefined ? Infinity : bounds.maxX);
    if (!isBlocked({ x: candidateX, z: next.z }, radius, characterHeight, obstacles)) next.x = candidateX;

    var candidateZ = clamp(next.z + dz, bounds.minZ === undefined ? -Infinity : bounds.minZ, bounds.maxZ === undefined ? Infinity : bounds.maxZ);
    if (!isBlocked({ x: next.x, z: candidateZ }, radius, characterHeight, obstacles)) next.z = candidateZ;

    return { x: next.x, z: next.z, moved: next.x !== position.x || next.z !== position.z };
  }

  function clearKeys(keys) {
    Object.keys(keys).forEach(function (key) { delete keys[key]; });
  }

  return {
    movementVector: movementVector,
    isBlocked: isBlocked,
    moveOnPlane: moveOnPlane,
    clearKeys: clearKeys
  };
}));
