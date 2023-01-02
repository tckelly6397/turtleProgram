/*=========================== Imports ===========================*/
import * as THREE from '../../../build/three.module.js';
import { scene, camera, controls } from './threeRenderer.js';

/*=========================== Variables ===========================*/
let objects = [];
const colorMap = new Map();

/*=========================== Functions ===========================*/
//Get the block form a object
//If nothing found return -1
function getBlockByObject(obj) {

    for(let i = 0; i < objects.length; i++) {
        let data = objects[i];

        if(data.object == obj) {
            return data.block;
        }
    }

    return -1;
}

//Get the block form a object
//If nothing found return -1
function getDataByPosition(x, y, z) {

    for(let i = 0; i < objects.length; i++) {
        let data = objects[i];

        if(equalBlock(data.block, x, y, z)) {
            return data;
        }
    }

    return -1;
}

//Check if two block positions are equal
function equalBlock(block, x, y, z) {
    if(block.x == x && block.y == y && block.z == z) {
        return true;
    }

    return false;
}

//Add a block/update a block by position
export function addBlock(block) {
    //Get the current blocks position
    let mapData = getDataByPosition(block.x, block.y, block.z);

    //If there is a block there and they're different then remove the current one and add a new one
    if(mapData != -1 && mapData.block.name != block.name) {
        removeData(mapData);

        addObject(block);
    }

    //If there isn't a block there then add it
    if(mapData == -1) {
        addObject(block);
    }
}

//Remove a data from the list
function removeData(data) {
    const index = objects.indexOf(data);
    if (index > -1) {
        objects.splice(index, 1);
    }

    scene.remove(data.object);
}

//Remove a block based on its position
export function removeBlock(block) {
    //Get the current blocks position
    let mapData = getDataByPosition(block.x, block.y, block.z);

    //If there is a block in the position then remove it
    if(mapData != -1) {
        removeData(mapData);
    }
}

//Clear all the blocks out of the scene
function clearAllBlocks() {
    for(let i = 0; i < objects.length; i++) {
        let data = objects[i];
        scene.remove(data.object);
    }
    objects = [];
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

    //Add the object
    let data = {
        "block": block,
        "object": cube
    }
    objects.push(data);
    scene.add( cube );
}

//Get the world and update it
//Parameter is the turtle
export function updateWorld(turtle, initialWorld) {
    //Remove all objects
    clearAllBlocks();

    for(let i = 0; i < initialWorld.length; i++) {
        let block = initialWorld[i];

        addObject(block);
    }
}

/*=========================== Events ===========================*/
//Side stuff
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

addEventListener('mousemove', (event) => {
    let object = getIntersection(event);

    if(object != undefined) {
        document.body.style.cursor = 'pointer';
    } else {
        document.body.style.cursor = 'default';
    }
});

addEventListener('mousedown', (event) => {
    let object = getIntersection(event);

    if(object != undefined) {
        let block = getBlockByObject(object);
        if(block != undefined) {
            document.getElementById("info-area").innerText = block.name;
        }

        //Set target to block on middle click
        if(event.button == 1) {
            scene.updateMatrixWorld(true);
            var position = new THREE.Vector3();
            position.setFromMatrixPosition( object.matrixWorld );

            controls.target = position;
        }
    }
});