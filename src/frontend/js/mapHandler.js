import * as THREE from '../../../build/three.module.js';
import { scene, camera } from './threeRenderer.js';

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

//Clear all the blocks out of the scene
function clearAllBlocks() {
    for (let [key, value] of objectMap) {
        const index = objects.indexOf(value);
        if (index > -1) {
            objects.splice(index, 1);
        }
        objectMap.delete(key);
        scene.remove(value);
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
    updateTurtle(turtle);

    objects = [];

    for(let i = 0; i < initialWorld.length; i++) {
        let block = initialWorld[i];

        addObject(block);
    }
}

function getUpdateWorldData() {
    let worldData = [];
    for (let [key, value] of objectMap) {
        console.log(key);
        worldData.push(key);
    }

    let args = {
        "blocks": worldData,
        "turtleList": turtleList
    }

    window.api.send("frontUpdateWorld", JSON.stringify(args));
}



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
        const inverse = new Map();
        objectMap.forEach((value, key) => inverse.set(value, key));

        let block = inverse.get(object);
        if(block != undefined) {
            document.getElementById("info-area").innerText = block.name;
        }

        //Set target to block
        /*
        scene.updateMatrixWorld(true);
        var position = new THREE.Vector3();
        position.setFromMatrixPosition( object.matrixWorld );

        controls.target = position;
        */
    }
});