# Turtle program
## Overview
A desktop application based on the Electron framework using Three.js as the renderer and WebSocket to communicate. Uses data from clients to visualize and interact with a game. Using an AI system the turtles can do complex tasks.

## Inspired by
https://www.youtube.com/watch?v=pwKRbsDbxqc&t=1682s

## Environment setup
### Node Modules
electron\
electron-prompt\
ws\
three

## Turtle setup
Paste this as startup\
pastebin get DGZejmGJ startup\
https://pastebin.com/DGZejmGJ

## Features
-Crafting\
-Replication\
-Remote control\
-Inventory sorting\
-Inventory management\
-Saving and Loading\
-Visualization\
-Pathfinding\
-Building blueprints

## ToDo
### Basics
-Implement exceptions\
-Error handling\
-Make blocks that turtles place have an attribtue that it was placed by a turtle

### Advanced
-Furnace usage\
-Mining\
-Tree farming\
-Hive AI\

-Multi threads(So the main thread doesn't pause on execution and allow turtles to execute fatser)\
-On WebSocket request send an id that is expected back rather than keeping a boolean to see if the turtle is busy, allows for multiple turtles to execute at once

### Extra
-Textures\
-Rotation offset\
-Other peripherals\
-Farming

## AI Idea
This is crazy but heres the plan
https://docs.google.com/document/d/1a4ert9upmV6r99dBzyar_n_ZdZ_TYz9vZFOH0HqIWp4/edit?usp=sharing

## Screenshots
![Initial Tests](./images/example-12-30.PNG)
![Diamonds](./images/diamonds-12-30.PNG)
![House](./images/house-1-2.PNG)
![Pathfinding](./images/pathfinding-1-6.PNG)
![Selecting](./images/selecting-1-9.PNG)
