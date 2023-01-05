const { LocalWorldMap } = require("../TurtleFiles/SaveLoadManager.js");
const Turtle = require("../TurtleFiles/Turtle.js");

//Converts data to something readable by the Math.distance function
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

//Gets the begin node defaulting gCost to 0
function getBeginNode(x, y, z, endX, endY, endZ) {
    let gCost = 0;
    let hCost = distancePos(x, y, z, endX, endY, endZ);

    let node = {
        "x": x,
        "y": y,
        "z": z,
        "parent": "",
        "gCost": gCost,
        "hCost": hCost,
        "fCost": (() => { return this.gCost + this.hCost })
    }

    return node;
}

//Gets the end node defaulting hCost to 0
function getEndNode(x, y, z, beginX, beginY, beginZ) {
    let gCost = distancePos(x, y, z, beginX, beginY, beginZ);
    let hCost = 0;

    let node = {
        "x": x,
        "y": y,
        "z": z,
        "parent": "",
        "gCost": gCost,
        "hCost": hCost,
        "fCost": (() => { return this.gCost + this.hCost })
    }

    return node;
}

//Gets the node with the lowest fCost
function getOpenWithLowestFCost(list) {
    let minNode = list[0];

    for(let i = 1; i < list.length; i++) {
        let node = list[i];
        let fCost = node.fCost;
        let hCost = node.hCost;

        if(fCost < minNode.fCost || fCost == minNode.hCost && hCost < minNode.hCost) {
            minFCost = fCost;
        }
    }

    return minNode;
}

//Given a list remove an item
function removeItemFromList(item, list) {
    const index = list.indexOf(item);

    if(index != -1) {
        list.splice(index, 1);
    }
}

//Check if two nodes are equal
function isNodesEqual(node1, node2) {

    if(node1.x == node2.x && node1.y == node2.y && node1.z == node2.z) {
        return true;
    }

    return false;
}

function getBlockInMap(x, y, z, map) {
    for(let i = 0; i < map.length; i++) {
        let block = map[i];

        if(block.x == x && block.y == y && block.z == z) {
            return false;
        }
    }

    return true;
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

//If there is a node then add it to the list of neighbors
function addNodeFromMap(x, y, z, map, neighborList, beginNode, endNode) {
    for(let i = 0; i < neighborList.length; i++) {
        let neighbor = neighborList[i];

        if(neighbor.x == x && neighbor.y == y && neighbor.z == z) {
            return neighbor;
        }
    }

    //If there is not a block then add it
    if(getBlockInMap(x, y, z, map)) {
        return makeNode(x, y, z, beginNode, endNode);
    }
}

//Get a list of neighbors
function getOpenNeighborsOfNode(current, map, neighborList, beginNode, endNode) {
    let neighbors = [];
    let x = current.x;
    let y = current.y;
    let z = current.z;

    //HORRENDOUS CODE
    let node1 = addNodeFromMap(x + 1, y, z, map, neighborList, beginNode, endNode);
    if(node1 != undefined)
        neighbors.push(node1);
    let node2 = addNodeFromMap(x - 1, y, z, map, neighborList, beginNode, endNode);
    if(node2 != undefined)
        neighbors.push(node2);
    let node3 = addNodeFromMap(x, y + 1, z, map, neighborList, beginNode, endNode);
    if(node3 != undefined)
        neighbors.push(node3);
    let node4 = addNodeFromMap(x, y - 1, z, map, neighborList, beginNode, endNode);
    if(node4 != undefined)
        neighbors.push(node4);
    let node5 = addNodeFromMap(x, y, z + 1, map, neighborList, beginNode, endNode);
    if(node5 != undefined)
        neighbors.push(node5);
    let node6 = addNodeFromMap(x, y, z - 1, map, neighborList, beginNode, endNode);
    if(node6 != undefined)
        neighbors.push(node6);

    return neighbors;
}

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
        await turtle.executeAction(Turtle.Actions.TURNRIGHT);
    }
}

//Rotates the turtle until its facing the correct direction on Z
async function rotateToPositionZ(turtle, deltaZ) {

    while(deltaZ != Math.round(Math.sin(turtle.rotation * (Math.PI/180)))) {
        await turtle.executeAction(Turtle.Actions.TURNRIGHT);
    }
}

async function moveToNode(turtle, node) {
    let deltaX = node.x - turtle.position.x;
    let deltaY = node.y - turtle.position.y;
    let deltaZ = node.z - turtle.position.z;

    //Move on y axis
    if(deltaY == 1) {
        await turtle.executeAction(Turtle.Actions.UP);
        return;
    } else if(deltaY == -1) {
        await turtle.executeAction(Turtle.Actions.DOWN);
        return;
    }

    if(deltaX == 1 || deltaX == -1) {
        //Rotate
        await rotateToPositionX(turtle, deltaX);
        //Move
        await turtle.executeAction(Turtle.Actions.FORWARD);
        return;
    }

    if(deltaZ == 1 || deltaZ == -1) {
        //Rotate
        await rotateToPositionZ(turtle, deltaZ);
        //Move
        await turtle.executeAction(Turtle.Actions.FORWARD);
        return;
    }
}

//Execute actions given a path
//Each node should be one away from the current turtles position
async function executePath(turtle, path) {

    for(let i = 0; i < path.length; i++) {
        let node = path[i];

        await moveToNode(turtle, node);
    }
}

async function Pathfind(turtle, endX, endY, endZ) {
    let beginX = turtle.position.x;
    let beginY = turtle.position.y;
    let beginZ = turtle.position.z;

    //Main variables
    let openList = [];
    let closedList = [];
    let neighborList = [];

    let map = LocalWorldMap.get(turtle.mapLocation);

    //Initialize nodes and list
    let beginNode = getBeginNode(beginX, beginY, beginZ, endX, endY, endZ);
    let endNode = getEndNode(endX, endY, endZ, beginX, beginY, beginZ);
    openList.push(beginNode);

    while(openList.length > 0) {
        let current = openList[0]
        current = getOpenWithLowestFCost(openList);
        removeItemFromList(current, openList);

        closedList.push(current);

        if(isNodesEqual(current, endNode)) {
            endNode = current;
            break;
        }

        let neighbors = getOpenNeighborsOfNode(current, map, neighborList, beginNode, endNode);
        for(let i = 0; i < neighbors.length; i++) {
            let neighbor = neighbors[i];
            neighborList.push(neighbor);

            if(closedList.indexOf(neighbor) != -1) {
                continue;
            }

            let newPath = current.gCost + distanceNodes(current, neighbor);
            if(newPath < neighbor.gCost || openList.indexOf(neighbor) == -1) {
                neighbor.gCost = newPath;
                neighbor.hCost = distanceNodes(neighbor, endNode);
                neighbor.parent = current;

                if(openList.indexOf(neighbor) == -1) {
                    openList.push(neighbor);
                }
            }
        }
    }

    //Traverse through the parents
    let nodePath = getPath(beginNode, endNode);

    //Make the turtle move
    await executePath(turtle, nodePath);
}

//THE PROBLEM IS THAT EACH TIME YOU GET NEIGHBORS YOU CREATE A NEW NODE FOR EACH NEIGHBOR, KEEP TRACK OF NEIGHBORS WHEN CREATED

module.exports = { Pathfind };