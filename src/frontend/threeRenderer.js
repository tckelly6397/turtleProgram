/*
* Creates the Three.js display and displays objects
*/

import * as THREE from '../../build/three.module.js'
import { OrbitControls } from '../../build/OrbitControls.js'
import { GLTFLoader } from '../../build/GLTFLoader.js';

var renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

document.getElementById('webglviewer').appendChild(renderer.domElement);

export var scene = new THREE.Scene();

//Setup the camera
export var camera = new THREE.PerspectiveCamera(
    75, //FOV
    window.innerWidth / window.innerHeight, //Ratio
    1, //Minimum distance
    10000000 //Maximum distance
)
camera.position.set(0, 0, 0);
camera.lookAt(10, 0, 0);

//Set the controls to orbital controls
export var controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(camera.position.x + .1, camera.position.y, camera.position.z);
controls.panSpeed = 2;
controls.rotateSpeed = 1;
controls.enableDamping = true;
controls.dampingFactor = 0.2;

//Create lighting so model can have color
const light = new THREE.AmbientLight( 0xffffff ); // soft white light
scene.add( light );
export var cubeT = new THREE.Object3D();

//The turtle object
let loader = new GLTFLoader();

loader.load('./models/untitled.glb', function(gltf) {
    cubeT = gltf.scene.children[0];
    cubeT.scale.set(2.5, 2.5, 2.5);
    scene.add(gltf.scene);

    cubeT.position.set(10, 5, 2);
});

// Call the animate function
animate();

// The animated function updates the scene
// and updates the controls
function animate() {

    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser calls a specified function to update an animation before the next repaint. (docs)
    requestAnimationFrame(animate);

    // Update the controls
    controls.update();

    //Update turtle
    cubeT.updateMatrix();

    // Render the scene
    renderer.render(scene, camera);
}