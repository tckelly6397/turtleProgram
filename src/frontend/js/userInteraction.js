/*=========================== Imports ===========================*/
import { scene, camera, controls } from './threeRenderer.js';
import * as THREE from '../../../build/three.module.js';
import { getBlockByObject } from './mapHandler.js';

/*=========================== Variables ===========================*/
let keyMap = new Map();
let selections = [];
let objects = [];

/*=========================== Functions ===========================*/
function updateSelectVisuals() {
    //Clear the objects
    for(let i = 0; i < objects.length; i++) {
        let obj = objects[i];
        scene.remove(obj);
    }

    //Increment by two getting the selection to make the outline of what is selected
    for(let i = 0; selections.length >= 1 && i < selections.length; i+=2) {
        let selectData1 = selections[i];
        let selectData2 = selections[i + 1];
    }
}

document.getElementById("save-selection-btn").click(() => {
    if(document.getElementById("save-selection-btn").getAttribute("data-canclick") == false) {
        return;
    }

    //Save the selection

    //Reset the data
    clearSelection();
});

document.getElementById("clear-selection-btn").click(clearSelection());

function clearSelection() {
    if(document.getElementById("clear-selection-btn").getAttribute("data-canclick") == false) {
        return;
    }

    //Clear the selection
    selections = [];

    //Reset data on buttons
    let selectionButtons = document.getElementById("selection-btns").children;
    for(let i = 0; i < selectionButtons.length; i++) {
        let btn = selectionButtons[i];

        btn.classList.add("low-opacity");
        btn.setAttribute("data-canclick", "false");
    }
}

/*=========================== KeyBoard Controls ===========================*/
//Given keyboard input control the turtle
function turtleControls(event) {
    if(event.key == 'w' && keyMap.get(event.key) != true) {
        window.api.send("frontAction", JSON.stringify({"action": "forward", "args": ""}));
    } else if(event.key == 'a' && keyMap.get(event.key) != true) {
        window.api.send("frontAction", JSON.stringify({"action": "turnLeft", "args": ""}));
    } else if(event.key == 'd' && keyMap.get(event.key) != true) {
        window.api.send("frontAction", JSON.stringify({"action": "turnRight", "args": ""}));
    } else if(event.key == 's' && keyMap.get(event.key) != true) {
        window.api.send("frontAction", JSON.stringify({"action": "back", "args": ""}));
    } else if(event.key == ' ' && keyMap.get(event.key) != true) {
        window.api.send("frontAction", JSON.stringify({"action": "up", "args": ""}));
    } else if(event.shiftKey && keyMap.get(event.key) != true) {
        window.api.send("frontAction", JSON.stringify({"action": "down", "args": ""}));
    }
}

document.addEventListener('keydown', function(event) {
    //Call the turtle controls
    turtleControls(event);

    keyMap.set(event.key, true);
});

document.addEventListener('keyup', function(event) {
    keyMap.set(event.key, false);
});

/*=========================== Mouse Controls ===========================*/
//Get interaction with a block
function getIntersection(event) {
    var mouse = new THREE.Vector2();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
      return intersects[0].object;
    } else {
        return undefined;
    }
}

//Handles the cursor while moving along the front end, changing how it looks whether hovered over objects or not
document.addEventListener('mousemove', (event) => {
    let object = getIntersection(event);

    if(object != undefined) {
        document.body.style.cursor = 'pointer';
    } else {
        document.body.style.cursor = 'default';
    }
});

//Handles the interactions with blocks such as getting the info and setting the camera position to attach to a block
function handleInteractionWithBlocks(event) {
    const object = getIntersection(event);

    if(object != undefined) {
        let block = getBlockByObject(object);
        if(block != undefined) {
            document.getElementById("block-info-area").innerText = "Block: " + block.name;
        }

        if(block != undefined && event.button == 2) {
            let data = {
                "state": "pathfindClick",
                "args": {"x": block.x, "y": block.y, "z": block.z, "canMine": true}
            }
            window.api.send("frontState", JSON.stringify(data));
        }

        //Set target to block on middle click
        if(event.button == 1) {
            scene.updateMatrixWorld(true);
            var position = new THREE.Vector3();
            position.setFromMatrixPosition( object.matrixWorld );

            controls.target = position;
        }
    }
}

//Handles the nteraction with blocks to highlight them and save their data to a relative map
function selectBlocks(event) {
    const object = getIntersection(event);
    let block;

    if(object != undefined) {
        block = getBlockByObject(object);
    } else {
        console.log("Not a valid block to select.");
        return;
    }

    //Set data on buttons
    let selectionButtons = document.getElementById("selection-btns").children;
    for(let i = 0; i < selectionButtons.length; i++) {
        let btn = selectionButtons[i];

        btn.classList.remove("low-opacity");
        btn.setAttribute("data-canclick", "true");
    }

    updateSelectVisuals();
}

//Handles the mouse interaction with blocks in the view
//On mouse down check if you intersected with a block
document.addEventListener('mousedown', (event) => {
    //If ctrl is held down then return so other even handler can handle the click
    if(event.ctrlKey) {
        selectBlocks(event);
    } else {
        handleInteractionWithBlocks(event);
    }
});