/*
* Creates the Three.js display and displays objects
*/

import * as THREE from '../../build/three.module.js'
import { OrbitControls } from '../../build/OrbitControls.js'

var renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

document.getElementById('webglviewer').appendChild(renderer.domElement);

export var scene = new THREE.Scene();

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
export var controls = new OrbitControls(camera, renderer.domElement);
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
export var cubeT = new THREE.Mesh( geometryT, materialT );
cubeT.position.set(15, 5, 0);
scene.add( cubeT );

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

//module.exports = { scene, cubeT };
