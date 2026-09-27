# MECCHA CHAMELEON

A browser-playable 3D recreation of **Meccha Chameleon**'s paint-yourself hide-and-seek loop. The game is rendered in real time with Three.js and builds its room, characters, paint textures, lighting, and props from code.

## Play

Open index.html in a modern desktop browser. The Three.js runtime is included locally, so the game itself runs offline.

## Match roles

- **Hider:** Start with 18 seconds to find a spot and paint your blank body. Survive the seekers for 70 seconds.
- **Seeker:** Search for five roaming hiders and tag each one before the 70-second timer ends.

## Controls

| Input | Action |
| --- | --- |
| WASD | Move |
| Mouse drag | Look around |
| Shift | Run |
| Space | Hop; as Seeker, tag a nearby hider |
| P | Open or close body paint |
| Left-click and drag | Paint your body |
| Right-click a surface | Sample its color |
| Right-drag in Paint Mode | Turn around your body |
| E | Tag a nearby hider |
| Q | Pulse scanner (Seeker) |
| Escape | Close paint or pause |

Paint Mode freezes movement and moves the camera into close-up view. Use the color chips, adjust the brush, and paint around your body. The seekers use sight lines; covering your body, matching nearby colors, and staying still make you harder to spot.

## Scope

This is a local single-player recreation with seeker and hider bots. The original game's online matchmaking, multiplayer rooms, user-made maps, and network play are not included.

## Third-party runtime

The game includes the Three.js 0.152.2 browser build and its MIT license in vendor-three.min.js and vendor-three.LICENSE.txt.
