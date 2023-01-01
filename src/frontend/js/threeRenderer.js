/*
* The basic THREE.js setup
* Handles the renderer, camera, player and animation
*/

/*=========================== Imports ===========================*/
import * as THREE from '../../../build/three.module.js';
import { OrbitControls } from '../../../build/OrbitControls.js';
import { GLTFLoader } from '../../../build/GLTFLoader.js';

/*=========================== Variables ===========================*/
export var scene = new THREE.Scene();
export var camera;
export var controls;
export var turtleObj;
var renderer = new THREE.WebGLRenderer();

/*=========================== Renderer Setup ===========================*/
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('webglviewer').appendChild(renderer.domElement);

/*=========================== Basic Camera Setup ===========================*/
var camera = new THREE.PerspectiveCamera(
    75, //FOV
    window.innerWidth / window.innerHeight, //Ratio
    1, //Minimum distance
    10000000 //Maximum distance
)
camera.position.set(0, 0, 0);
camera.lookAt(10, 0, 0);

/*=========================== Camera Control Setup ===========================*/
controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(camera.position.x + .1, camera.position.y, camera.position.z);
controls.panSpeed = 2;
controls.rotateSpeed = 1;
controls.enableDamping = true;
controls.dampingFactor = 0.2;

/*=========================== Ambient Lighting Setup ===========================*/
const light = new THREE.AmbientLight( 0xffffff ); // soft white light
scene.add( light );

/*=========================== Turtle Object Setup ===========================*/
turtleObj = new THREE.Object3D();
let loader = new GLTFLoader();
//Loads a model into the turtle object
loader.load('./models/untitled.glb', function(gltf) {
    turtleObj = gltf.scene.children[0];
    turtleObj.scale.set(2.5, 2.5, 2.5);
    turtleObj.add(gltf.scene);

    turtleObj.position.set(10, 5, 2);
});

/*=========================== Animation and Main Loop ===========================*/
animate();

// The animated function updates the scene, the controls and the turtle position
function animate() {

    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser calls a specified function to update an animation before the next repaint. (docs)
    requestAnimationFrame(animate);

    // Update the controls
    controls.update();

    //Update turtle
    turtleObj.updateMatrix();

    // Render the scene
    renderer.render(scene, camera);
}