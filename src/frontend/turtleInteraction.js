import { scene, cubeT, controls } from './threeRenderer.js'
import * as THREE from '../../build/three.module.js'

let world;
let objects = [];
const colorMap = new Map();
let objectMap = new Map();

//Check if two block positions are equal
function equalBlock(block1, block2) {
    if(block1.x == block2.x && block1.y == block2.y && block1.z == block2.z) {
        return true;
    }

    return false;
}

//Add a block/update a block by position
function addBlock(block) {
    for (let [key, value] of objectMap) {
        if(equalBlock(block, key) == true) {
            if(block.name != key.name) {
                const index = objects.indexOf(value);
                if (index > -1) {
                    objects.splice(index, 1);
                }
                scene.remove(value);
                break;
            }
            return;
        }
    }

    addObject(block);
}

//Remove a block based on its position
function removeBlock(block) {
    for (let [key, value] of objectMap) {
        if(equalBlock(block, key) == true) {
            const index = objects.indexOf(value);
            if (index > -1) {
                objects.splice(index, 1);
            }
            objectMap.delete(key);
            scene.remove(value);
            break;
        }
    }
}

//Add a THREE JS object
function addObject(block) {
    //Set the color
    if(colorMap.get(block.name) == undefined) {
        colorMap.set(block.name, Math.random() * 0xffffff);
    }

    //Create the geometry of a cube of size 5
    const geometryC = new THREE.BoxGeometry( 5, 5, 5 );

    //Create a basic random Color
    let color = new THREE.Color( colorMap.get(block.name) );

    //Create a material applying the color and an opacity, defining its transparent
    const materialC = new THREE.MeshBasicMaterial( {color: color } );
    materialC.transparent = true;
    materialC.opacity = 0.5;

    //Create a mesh applying the geometry and material
    const cube = new THREE.Mesh( geometryC, materialC );
    //Set the position of the mesh
    cube.position.set(block.x * 5, block.y * 5, block.z * 5);

    //Add the cube to the scene
    objects.push( cube );
    objectMap.set(block, cube);
    scene.add( cube );
}

//Get the world and update it
//Parameter is the turtle
function updateWorld(turtle, initialWorld) {
    cubeT.position.set(turtle.x * 5, turtle.y * 5, turtle.z * 5);

    objects = [];

    for(let i = 0; i < initialWorld.length; i++) {
        let block = initialWorld[i];

        addObject(block);
    }
}

// Called when message received from main process
window.api.receive("updateTurtlePosition", (data) => {
    //Parse the JSON String
    data = JSON.parse(data);

    //Update the position
    cubeT.position.set(data[0] * 5, data[1] * 5, data[2] * 5);
    controls.target = cubeT.position;
});

//Get the world data
window.api.receive("world", (data) => {
    world = data.WorldData.blocks;
    updateWorld(data.turtle, data.WorldData.blocks);
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


//Apply click events to the buttons
var InteractionChildren = document.getElementById('interaction-buttons').children;

for (var i = 0; i < InteractionChildren.length; i++) {
    InteractionChildren[i].onclick = function () {
        let command = this.getAttribute("data-command");

        if(command == "getWorld") {
            window.api.send("getWorld", command);
        } else if(command == "detect") {
            window.api.send("detect", command);
        } else if(command == "updateWorld") {
            let worldData = [];
            for (let [key, value] of objectMap) {
                console.log(key);
                worldData.push(key);
            }

            window.api.send("updateWorld", worldData);
        } else {
            window.api.send("move", command);
        }
    }
}

document.addEventListener('keydown', function(event) {
    if(event.key == 'w') {
        window.api.send("move", "forward");
    } else if(event.key == 'a') {
        window.api.send("move", "turnLeft");
    } else if(event.key == 'd') {
        window.api.send("move", "turnRight");
    } else if(event.key == 's') {
        window.api.send("move", "back");
    } else if(event.key == ' ') {
        window.api.send("move", "up");
    } else if(event.shiftKey) {
        window.api.send("move", "down");
    } else if(event.key == 'f') {
        window.api.send("detect", "");
    }
});