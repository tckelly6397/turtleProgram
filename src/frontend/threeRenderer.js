/*
* Creates the Three.js display and displays objects
*/

import * as THREE from '../../build/three.module.js'
import { OrbitControls } from '../../build/OrbitControls.js'

var renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

document.getElementById('webglviewer').appendChild(renderer.domElement);

var scene = new THREE.Scene();

//Setup the camera
var camera = new THREE.PerspectiveCamera(
    75, //FOV
    window.innerWidth / window.innerHeight, //Ratio
    1, //Minimum distance
    10000000 //Maximum distance
)
camera.position.set(0, 0, 0);
camera.lookAt(10, 0, 0);

//Set the controls to orbital controls
var controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(camera.position.x + .1, camera.position.y, camera.position.z);
controls.panSpeed = 3;
controls.rotateSpeed = 1;
controls.enableDamping = true;
controls.dampingFactor = 0.2;

//Create the geometry of a cube of size 5
//Create a material applying the color and an opacity, defining its transparent
//Create a mesh applying the geometry and material
//Set the position of the mesh
//Add the cube to the scene
const geometryT = new THREE.BoxGeometry( 5, 5, 5 );
const materialT = new THREE.MeshBasicMaterial( {color: 0xf1332d } );
let cubeT = new THREE.Mesh( geometryT, materialT );
cubeT.position.set(15, 5, 0);
scene.add( cubeT );

// Call the animate function
animate();

// The animated function updates the scene
// and updates the controls
function animate() {

    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser calls a specified function to update an animation before the next repaint. (docs)
    requestAnimationFrame(animate);

    // Send a message to the main process
    window.api.send("getMap", "some data");

    // Update the controls
    controls.update();
    cubeT.updateMatrix();

    // Render the scene
    renderer.render(scene, camera);
}

//////////////////////
//Turtle stuff
//////////////////////
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
                objects.remove(value);
                scene.remove(value);
                break;
            }
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
function updateWorld(turtle) {
    console.log(turtle.x + " " + turtle.y + " " + turtle.z);
    cubeT.position.set(turtle.x * 5, turtle.y * 5, turtle.z * 5);

    objects = [];

    for(let i = 0; i < world.length; i++) {
        let block = world[i];
        console.log(block);

        addObject(block);
    }

    console.log(objectMap);
}

// Called when message received from main process
window.api.receive("updatedMap", (data) => {
    //Parse the JSON String
    data = JSON.parse(data);

    //Update the position
    cubeT.position.set(data[0] * 5, data[1] * 5, data[2] * 5);
    controls.target = cubeT.position;
});

//Get the world data
window.api.receive("world", (data) => {
    console.log(data);
    world = data.WorldData.blocks;
    console.log("test " + world);
    updateWorld(data.turtle);
});

//Updating detection
window.api.receive("detected", (data) => {
    console.log("b" + data)
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
        } else {
            window.api.send("move", command);
        }
    }
}
