/*
* Handles the turtle movement and sends instructions to the Map handler
*/

/*=========================== Imports ===========================*/
import { scene, turtleObj, controls, camera } from './threeRenderer.js';
import * as THREE from '../../../build/three.module.js';
import * as MapHandler from './mapHandler.js';

/*=========================== Variables ===========================*/
let turtleList;

/*=========================== Functions ===========================*/
//Rotate the turtle
function rotate(angle) {
    turtleObj.rotation.y = -angle * Math.PI / 180;
}

function updateTurtle(data) {
    turtleObj.position.set(data.x * 5, data.y * 5, data.z * 5);

    //Allow panning of object without moving the object
    scene.updateMatrixWorld(true);
    var positionNew = new THREE.Vector3();
    positionNew.setFromMatrixPosition( turtleObj.matrixWorld );
    controls.target = positionNew;
    rotate(data.rotation);

    document.getElementById("turtle-name").innerText = data.label;
}

/*=========================== Events ===========================*/
// Called when message received from main process
window.api.receive("updateTurtleData", (data) => {
    data = JSON.parse(data);
    updateTurtle(data);
});

//Get the world data
window.api.receive("backSynchWorldData", (data) => {
    //Clear the world
    clearAllBlocks();

    if(data != undefined) {
        console.log(data);
        updateWorld(data.turtle, data.blocks);
    }
});

//Updating detection
window.api.receive("detected", (data) => {
    data = JSON.parse(data);

    for(let i = 0; i < data.length; i++) {
        let block = data[i];
        console.log(block);

        if(block.name == "air") {
            removeBlock(block);
        } else {
            addBlock(block);
        }
    }
});

window.api.receive("retrieveAndUpdateWorldData", (data) => {
    getUpdateWorldData();
});

//Retrieve the turtle list
//Loop through it and apply to the drop down list
window.api.receive("backSendTurtleList", (data) => {
    let turtleDrop = document.getElementById("turtle-list");
    turtleDrop.innerHTML = '';

    //For each turtle in the list add it to the drop down list
    data.forEach(t => {
        let element = document.createElement("a");
        element.classList.add("dropdown-item");
        element.innerText = t.label + "(" + t.computerId + ")";
        let clickCommand = "window.api.send(\"frontSelectTurtle\", " + JSON.stringify(t) + ");"
        element.setAttribute("onclick", clickCommand);
        turtleDrop.appendChild(element);
    });

    turtleList = data;
});

/*=========================== Controls ===========================*/
var InteractionContainers = document.getElementsByClassName('interaction-container');

for(var j = 0; j < InteractionContainers.length; j++) {
    for (var i = 0; i < InteractionContainers[j].children.length; i++) {
        InteractionContainers[j].children[i].onclick = function () {
            let command = this.getAttribute("data-command");

            if(command == "getWorld") {
                window.api.send("frontSynchWorld", command);
            } else if(command == "updateWorld") {
                getUpdateWorldData();
            } else if(command == "printTurtleData") {
                window.api.send("frontPrintAllTurtleData");
            } else {
                window.api.send("frontAction", command);
            }
        }
    }
}

document.addEventListener('keydown', function(event) {
    if(event.key == 'w') {
        window.api.send("frontAction", "forward");
    } else if(event.key == 'a') {
        window.api.send("frontAction", "turnLeft");
    } else if(event.key == 'd') {
        window.api.send("frontAction", "turnRight");
    } else if(event.key == 's') {
        window.api.send("frontAction", "back");
    } else if(event.key == ' ') {
        window.api.send("frontAction", "up");
    } else if(event.shiftKey) {
        window.api.send("frontAction", "down");
    }
});