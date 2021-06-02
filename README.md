# Memory-Multiplayer-JS
A client-server programming project based on the classic game Memory by Tim Trostmann and Marc Reitstetter based on the 5th term exam "Projekt Inormatik" at Univeristy of Applied Siences Schmalkalden.

**Features**
- multiplayer function 
- chat

**Requirements**
- Node.js is required for this project to run.

**The project**
- uses Socket.io for realtime client-server communication on the foundation of websockets

Edit: 
- this game is a work in progress
- due to time complications the code is not throughfully refactored --> in planning
  (too much code in single files)

**How to run:**
- to run it type "node server" or "node ." in a terminal (in path of the project).

**Known issues:** (for now)
- in login form both players need to create the room and then join it
- when the room with a specific name was alredy created, the other player will join in with the other player --> game starts
  (this is not really a bug, but can be confusing and is set to be fixed)
- sometimes the game logic breaks when clicked to fast and too many times
- refreshing the page causes the websocket to see you as a new user --> game breaks
