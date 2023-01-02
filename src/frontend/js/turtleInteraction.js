/*
* Handles the turtle movement and sends instructions to the Map handler
*/

/*=========================== Imports ===========================*/
import { scene, turtleObj, controls, camera } from './threeRenderer.js';
import * as THREE from '../../../build/three.module.js';
import * as MapHandler from './mapHandler.js';

/*=========================== Variables ===========================*/

/*=========================== Functions ===========================*/
//Rotate the turtle
function rotate(angle) {
    turtleObj.rotation.y = -angle * Math.PI / 180;
}

function updateTurtle(turtle) {
    turtleObj.position.set(turtle.x * 5, turtle.y * 5, turtle.z * 5);

    //Allow panning of object without moving the object
    scene.updateMatrixWorld(true);
    var positionNew = new THREE.Vector3();
    positionNew.setFromMatrixPosition( turtleObj.matrixWorld );
    controls.target = positionNew;
    rotate(turtle.rotation);

    console.log(turtle.label);
    document.getElementById("turtle-name").innerText = turtle.label;
}

/*=========================== Events ===========================*/
// Called when message received from main process
window.api.receive("updateTurtleData", (turtle) => {
    turtle = JSON.parse(turtle);
    updateTurtle(turtle);
});

//Get the world data
window.api.receive("backSynchWorldData", (data) => {
    MapHandler.updateWorld(data.turtle, data.blocks);
    updateTurtle(data.turtle);
});

//Updating detection
window.api.receive("detected", (data) => {
    data = JSON.parse(data);

    for(let i = 0; i < data.length; i++) {
        let block = data[i];

        if(block.name == "air") {
            MapHandler.removeBlock(block);
        } else {
            MapHandler.addBlock(block);
        }
    }
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
});

/*=========================== Controls ===========================*/
var InteractionContainers = document.getElementsByClassName('interaction-container');

for(var j = 0; j < InteractionContainers.length; j++) {
    for (var i = 0; i < InteractionContainers[j].children.length; i++) {
        InteractionContainers[j].children[i].onclick = function () {
            let command = this.getAttribute("data-command");

            if(command == "updateWorld") {
                window.api.send("frontUpdateWorld");
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