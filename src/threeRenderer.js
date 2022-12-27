import * as THREE from '../build/three.module.js'
import { OrbitControls } from '../build/OrbitControls.js'

var renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

document.getElementById('webglviewer').appendChild(renderer.domElement);

var scene = new THREE.Scene();

//Camera
var camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    10000000
)
camera.position.set(0, 0, 0);
camera.lookAt(10, 0, 0);

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

for(let i = 0; i < 5; i++) {
    const geometryC = new THREE.BoxGeometry( 5, 5, 5 );
    let color = new THREE.Color( 0xffffff );
    color.setHex( Math.random() * 0xffffff );
    const materialC = new THREE.MeshBasicMaterial( {color: color } );
    materialC.transparent = true;
    materialC.opacity = 0.5;
    const cube = new THREE.Mesh( geometryC, materialC );
    cube.position.set(-5 + -5 * i, 0, 0);
    scene.add( cube );
}

// Call the animate function
animate();

// The animated function updates the scene
// and updates the controls
function animate() {

    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser calls a specified function to update an animation before the next repaint. (docs)
    requestAnimationFrame(animate);

    // Update the controls
    controls.update();

    // Render the scene
    renderer.render(scene, camera);

}