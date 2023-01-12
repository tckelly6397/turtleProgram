/*=========================== Imports ===========================*/
const SaveLoadManager = require("../TurtleFiles/SaveLoadManager.js");
const Turtle = require("../TurtleFiles/Turtle.js");
const { Heap } = require("heap-js");
const TurtleUtil = require("../TurtleFiles/TurtleUtil.js");

/*=========================== Variables ===========================*/
let win;

/*=========================== Functions ===========================*/
//Gets the distance between xyz coordinates
function distancePos(x1, y1, z1, x2, y2, z2) {
    let deltaX = x2 - x1;
    let deltaY = y2 - y1;
    let deltaZ = z2 - z1;
    distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);

    return distance;
}

//Get the distance between two nodes
function distanceNodes(node1, node2) {
    return distancePos(node1.x, node1.y, node1.z, node2.x, node2.y, node2.z);
}

//Gets a node, given a position and the begin as well as the end node
function makeNode(x, y, z) {
    let node = {
        "x": x,
        "y": y,
        "z": z,
        "parent": "",
        "gCost": 0,
        "hCost": 0,
        "fCost": (() => { return this.gCost + this.hCost })
    }

    return node;
}

//Check if two nodes are equal
function isNodesEqual(node1, node2) {

    if(node1.x == node2.x && node1.y == node2.y && node1.z == node2.z) {
        return true;
    }

    return false;
}

//Gets a block from a given list of blocks given coordinates
function getBlockInMap(x, y, z, map, canMine, canMinePlacedByTurtle) {
    for(let i = 0; i < map.length; i++) {
        let block = map[i];

        if(block.x == x && block.y == y && block.z == z) {
            if(canMine && TurtleUtil.excludeBlockFilter.indexOf(block.name) != -1) {
                return false;
            } else if(canMine && TurtleUtil.excludeBlockFilter.indexOf(block.name) == -1) {
                //Check if the block was placed by a turtle
                //If the block is there, and you can't mine blocks placed by turtles and the block is placed by a turtle then return false
                if(block != undefined && canMinePlacedByTurtle == false && block.placedByTurtle == true) {
                    return false;
                }

                return true;
            }

            return false;
        }
    }

    return true;
}

//Gets a node from a list given coordinates
function getNodeFromListGivenCoords(x, y, z, list) {
    for(let i = 0; i < list.length; i++) {
        let neighbor = list[i];

        if(neighbor.x == x && neighbor.y == y && neighbor.z == z) {
            return neighbor;
        }
    }

    return false;
}

//If there is a node then add it to the list of neighbors
function addNodeFromList(x, y, z, map, neighborList, canMine, canMinePlacedByTurtle) {
    let neighbor = getNodeFromListGivenCoords(x, y, z, neighborList);

    //If a neighbor was found then return it
    if(neighbor != false) {
        return neighbor;
    }

    //If there is not a block then create it, the reason for this is because if there is a node in the map that means there
    //is a block there so the turtle shouldn't try to move through it
    if(getBlockInMap(x, y, z, map, canMine, canMinePlacedByTurtle)) {
        return makeNode(x, y, z);
    }
}

//Get a list of neighbors
function getOpenNeighborsOfNode(current, map, neighborList, canMine, canMinePlacedByTurtle) {
    let neighbors = [];
    let x = current.x;
    let y = current.y;
    let z = current.z;

    //A LITTLE BIT LESS HORRENDOUS CODE
    let xList = [1, -1, 0, 0, 0, 0];
    let yList = [0, 0, 1, -1, 0, 0];
    let zList = [0, 0, 0, 0, 1, -1];
    for(let i = 0; i < 6; i++) {
        let node = addNodeFromList(x + xList[i], y + yList[i], z + zList[i], map, neighborList, canMine, canMinePlacedByTurtle);
        if(node != undefined) {
            neighbors.push(node);
        }
    }

    return neighbors;
}

//Get the node list because the path is carried within the parents form the end to the begin node, then reverse the list so that
//you can get the order in which to execute actions
function getPath(beginNode, endNode) {
    let path = [];
    let current = endNode;

    //Loop through the nodes until you reach the begin node
    while(current != beginNode) {
        path.push(current);
        current = current.parent;
    }

    //Push the final node
    path.push(current);

    return path.reverse();
}

//Rotates the turtle until its facing the correct direction on X
async function rotateToPositionX(turtle, deltaX) {

    while(deltaX != (Math.round(Math.cos(turtle.rotation * (Math.PI/180))))) {
        let rotationCos = Math.round(Math.sin(turtle.rotation * (Math.PI/180)));

        if(rotationCos == 1 && deltaX == 1) {
            await turtle.executeAction(Turtle.Actions.TURNLEFT);
        } else if(rotationCos == -1 && deltaX == 1) {
            await turtle.executeAction(Turtle.Actions.TURNRIGHT);
        } else if(rotationCos == 1 && deltaX == -1) {
            await turtle.executeAction(Turtle.Actions.TURNRIGHT);
        } else if(rotationCos == -1 && deltaX == -1) {
            await turtle.executeAction(Turtle.Actions.TURNLEFT);
        } else {
            await turtle.executeAction(Turtle.Actions.TURNLEFT);
        }
    }
}

//Rotates the turtle until its facing the correct direction on Z
async function rotateToPositionZ(turtle, deltaZ) {

    while(deltaZ != Math.round(Math.sin(turtle.rotation * (Math.PI/180)))) {
        let rotationSin = Math.round(Math.cos(turtle.rotation * (Math.PI/180)));

        if(rotationSin == -1 && deltaZ == -1) {
            await turtle.executeAction(Turtle.Actions.TURNRIGHT);
        } else if(rotationSin == 1 && deltaZ == -1) {
            await turtle.executeAction(Turtle.Actions.TURNLEFT);
        } else if(rotationSin == -1 && deltaZ == 1) {
            await turtle.executeAction(Turtle.Actions.TURNLEFT);
        } else if(rotationSin == 1 && deltaZ == 1) {
            await turtle.executeAction(Turtle.Actions.TURNRIGHT);
        } else {
            await turtle.executeAction(Turtle.Actions.TURNLEFT);
        }
    }
}

function MoveException(message) {
    this.message = message;
    this.name = 'MoveException'
}

function BlockException(message) {
    this.message = message;
    this.name = 'MoveException'
}

//Move the turtle and if it's allowed to mine try to dig and then move if the turtle hasn't initially moved
async function move(turtle, action, canMine, canMinePlacedByTurtle) {
    let moved = await turtle.executeAction(action);

    //If it's allowed to mine and it hasn't moved then mine
    if(canMine && moved == false) {
        SaveLoadManager.updateLocalWorld(turtle, await TurtleUtil.detectAll(turtle, win), false);
        let didDig = await TurtleUtil.dig(turtle, action, false, canMinePlacedByTurtle, win);
        if(didDig == false) {
            throw new MoveException("Unable to move");
        }
        moved = await turtle.executeAction(action);
    }

    return moved;
}

//Given a turtle and a node to move to, execute the correct turtle function to move to that node
async function moveToNode(turtle, node, canMine, canMinePlacedByTurtle) {
    let deltaX = node.x - turtle.position.x;
    let deltaY = node.y - turtle.position.y;
    let deltaZ = node.z - turtle.position.z;

    //Move on y axis if the node position is changed on the y axis
    if(deltaY == 1) {
        return await move(turtle, Turtle.Actions.UP, canMine, canMinePlacedByTurtle);
    } else if(deltaY == -1) {
        return await move(turtle, Turtle.Actions.DOWN, canMine, canMinePlacedByTurtle);
    }

    //Rotate on the corresponding axis given it's change in position
    if(deltaX == 1 || deltaX == -1) {
        await rotateToPositionX(turtle, deltaX);
    }
    if(deltaZ == 1 || deltaZ == -1) {
        await rotateToPositionZ(turtle, deltaZ);
    }

    //Must be the first node
    if(deltaX == 0 && deltaY == 0 && deltaZ == 0) {
        return true;
    }

    //Move
    return await move(turtle, Turtle.Actions.FORWARD, canMine, canMinePlacedByTurtle);
}

//Execute actions given a path
//Each node should be one away from the current turtles position
async function executePath(turtle, path, endX, endY, endZ, canMine, canMinePlacedByTurtle) {

    //Loop through the path
    for(let i = 0; i < path.length; i++) {
        let node = path[i];
        let moved;

        //Try to move to the node
        moved = await moveToNode(turtle, node, canMine, canMinePlacedByTurtle);

        //If the turtle moved into a block then detect the new blocks and find a new path
        if(moved == false) {
            await TurtleUtil.detectAll(turtle, win);
            await Pathfind(turtle, endX, endY, endZ, win, canMine, canMinePlacedByTurtle);
            return;
        }

        //Update the turtle data and send it to the front end
        SaveLoadManager.updateTurtle(turtle);

        if(win != undefined) {
            win.webContents.send("updateTurtleData", JSON.stringify(turtle.getTurtleData()));
        }
    }
}

async function Pathfind(turtle, endX, endY, endZ, win_, canMine, canMinePlacedByTurtle) {
    let startTime = performance.now();
    win = win_;
    let beginX = turtle.position.x;
    let beginY = turtle.position.y;
    let beginZ = turtle.position.z;

    //Main variables
    const customComparator = (a, b) => (a.gCost + a.hCost) - (b.gCost + b.hCost);
    let openList = new Heap(customComparator);
    let closedList = [];
    let neighborList = [];
    //Needed so the turtle knows where blocks are
    let map = SaveLoadManager.LocalWorldMap.get(turtle.mapLocation);

    //Initialize nodes and list
    let beginEndDistance = distancePos(beginX, beginY, beginZ, endX, endY, endZ);

    let beginNode = makeNode(beginX, beginY, beginZ);
    beginNode.hCost = beginEndDistance;
    openList.add(beginNode);

    let endNode = makeNode(endX, endY, endZ);
    endNode.gCost = beginEndDistance;

    //Check if the endNode is valid
    let block = SaveLoadManager.getBlock(turtle, endX, endY, endZ);
    if(block != -1) {
        if(!canMine) {
            throw new BlockException("Cannot mine.");
        }

        if(canMine && !canMinePlacedByTurtle && block.placedByTurtle == true) {
            throw new BlockException("Cannot mine blocks placed by turtles.");
        }
    }

    //Run the algorithm
    while(openList.length > 0) {
        //The node with the lowest fCost
        let current = openList.pop();

        //Add it to the closed list
        closedList.push(current);

        //Check if they're at equal positions
        if(isNodesEqual(current, endNode)) {
            endNode = current;
            break;
        }

        //Look through the neighbors
        let neighbors = getOpenNeighborsOfNode(current, map, neighborList, canMine, canMinePlacedByTurtle);
        for(let i = 0; i < neighbors.length; i++) {
            let neighbor = neighbors[i];
            neighborList.push(neighbor);

            //If the neighbor is inside of the closed list then go to next neighbor
            if(closedList.indexOf(neighbor) != -1) {
                continue;
            }

            let newPath = current.gCost + distanceNodes(current, neighbor);
            if(newPath < neighbor.gCost || !openList.contains(neighbor)) {
                neighbor.gCost = newPath;
                neighbor.hCost = distanceNodes(neighbor, endNode);
                neighbor.parent = current;

                if(!openList.contains(neighbor)) {
                    openList.add(neighbor);
                }
            }
        }
    }

    //Traverse through the parents
    let nodePath = getPath(beginNode, endNode);

    let endTime = performance.now();
    console.log(`finding the path took ${endTime - startTime} milliseconds`);

    //Make the turtle move
    await executePath(turtle, nodePath, endX, endY, endZ, canMine, canMinePlacedByTurtle);

    //Send to the save load manager
    SaveLoadManager.updateTurtle(turtle);
    return true;
}

module.exports = { Pathfind };

//How to optimize more
//Split the beginPosition through endPosition into parts by making educated guesses
//This would allow the turtle to move more and think less, getting closer to the position and requiring less thinking
//This would be less precise

//Keep track of which blocks were placed by turtles, if it was not placed by a turtle then the turtle can mine it.