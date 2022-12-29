/*
* Creates the Three.js display and displays objects
*/

import * as THREE from '../build/three.module.js'
import { OrbitControls } from '../build/OrbitControls.js'

/*
const THREE = require('../build/three.module.js');
const OrbitControls = require('../build/OrbitControls.js');
*/

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
controls.panSpeed = 15;

//Sphere
var geometry = new THREE.SphereBufferGeometry(3, 32, 32);
var material = new THREE.MeshBasicMaterial({
    color: 0x00ff00 
});
var sphere = new THREE.Mesh(geometry, material);
sphere.position.set(10, 0, 0);
scene.add(sphere);

//Creates n cubes
let n = 10;
for(let i = 0; i < n; i++) {
    //Create the geometry of a cube of size 5
    const geometryC = new THREE.BoxGeometry( 5, 5, 5 );

    //Create a basic random Color
    let color = new THREE.Color( Math.random() * 0xffffff );

    //Create a material applying the color and an opacity, defining its transparent
    const materialC = new THREE.MeshBasicMaterial( {color: color } );
    materialC.transparent = true;
    materialC.opacity = 0.5;

    //Create a mesh applying the geometry and material
    const cube = new THREE.Mesh( geometryC, materialC );
    //Set the position of the mesh
    cube.position.set(-5 + -5 * i, 0, 0);

    //Add the cube to the scene
    scene.add( cube );
}

//Create the geometry of a cube of size 5
const geometryT = new THREE.BoxGeometry( 5, 5, 5 );

//Create a material applying the color and an opacity, defining its transparent
const materialT = new THREE.MeshBasicMaterial( {color: 0xf1332d } );

//Create a mesh applying the geometry and material
let cubeT = new THREE.Mesh( geometryT, materialT );
//Set the position of the mesh
cubeT.position.set(15, 5, 0);

//Add the cube to the scene
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

// Called when message received from main process
window.api.receive("updatedMap", (data) => {
    //Parse the JSON String
    data = JSON.parse(data);

    //Update the position
    cubeT.position.set(data[0] * 5, data[1] * 5, data[2] * 5);
});

document.getElementById("forwardBtn").onclick = function(){
    // Send a message to the main process
    console.log("moving");
    window.api.send("move", "forward");
}

document.getElementById("backBtn").onclick = function(){
    // Send a message to the main process
    console.log("moving");
    window.api.send("move", "back");
}

document.getElementById("rightBtn").onclick = function(){
    // Send a message to the main process
    console.log("moving");
    window.api.send("move", "turnRight");
}

document.getElementById("leftBtn").onclick = function(){
    // Send a message to the main process
    console.log("moving");
    window.api.send("move", "turnLeft");
}

document.getElementById("upBtn").onclick = function(){
    // Send a message to the main process
    console.log("moving");
    window.api.send("move", "up");
}

document.getElementById("downBtn").onclick = function(){
    // Send a message to the main process
    console.log("moving");
    window.api.send("move", "down");
}