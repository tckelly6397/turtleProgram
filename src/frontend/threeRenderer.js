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

//Create the geometry of a cube of size 5
//Create a material applying the color and an opacity, defining its transparent
//Create a mesh applying the geometry and material
//Set the position of the mesh
//Add the cube to the scene
//const geometryT = new THREE.BoxGeometry( 5, 5, 5 );
//const materialT = new THREE.MeshBasicMaterial( {color: 0xf1332d } );
//export var cubeT = new THREE.Mesh( geometryT, materialT );
//cubeT.position.set(15, 5, 0);
//scene.add( cubeT );

const light = new THREE.AmbientLight( 0xffffff ); // soft white light
scene.add( light );
export var cubeT = new THREE.Object3D();

let loader = new GLTFLoader();
//Update 3D Model
window.api.receive("models", (data) => {
    data = JSON.parse(data);
    let name = data[Math.floor(Math.random()*data.length)];

    //TEMPORARY FOR ROTATION
    //name = "untitled.glb";

    loader.load('./models/' + name, function(gltf) {
        cubeT = gltf.scene.children[0];
        cubeT.scale.set(2.5, 2.5, 2.5);
        scene.add(gltf.scene);

        cubeT.position.set(10, 5, 2);
    });
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

//module.exports = { scene, cubeT };
