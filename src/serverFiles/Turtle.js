/*
* Holds data pertaining to a Turtle
*/

//Turtle code: https://patebin.com/6ZnajFGz

const { Vector3 } = require("three");

class Turtle {
    //Variables ===
    //Label
    //Inventory
    //Position
    //Rotation
    //Fuel level
    //Map data
    label;
    inventory;
    position;
    rotation;
    fuel;
    ws;

    constructor(ws) {
        this.label = "";
        this.inventory = [];
        this.position = new Vector3();
        this.rotation = 0;
        this.fuel = 0;
        this.ws = ws;
    }

    //Functions ===
    //Execute
    //Move functions
    //Stats functions
    //Get Map data
    async turnRight() {
        const data = await this.execute("turtle.turnRight()");
        return data.callback;
    }

    async turnLeft() {
        const data = await this.execute("turtle.turnLeft()");
        return data.callback;
    }

    async moveForward() {
        const data = await this.execute("turtle.forward()");
        console.log(data);
        return data.callback;
    }

    async moveBackward() {
        const data = await this.execute("turtle.back()");
        return data.callback;
    }

    async moveDown() {
        const data = await this.execute("turtle.down()");
        return data.callback;
    }

    async moveUp() {
        const data = await this.execute("turtle.up()");
        return data.callback;
    }

    async digForward() {
        const data = await this.execute("turtle.dig()");
        return data.callback;
    }

    async digDown() {
        const data = await this.execute("turtle.digDown()");
        return data.callback;
    }

    async digUp() {
        const data = await this.execute("turtle.digUp()");
        return data.callback;
    }

    //Send data to a Turtle and execute it, returning what the command executes within the turtle as a Promise
    async execute(value) {
        //Add any data necessary to this JSON object
        let data = {
            "command": "return " + value
        }

        //Send the message
        this.ws.send(JSON.stringify(data));

        //Return a promise and wait for a response
        return new Promise((resolve, reject) => {
            this.ws.on('message', (message) => {
                resolve(JSON.parse(message));
            });
        }); 
    }

    getStats() {
        return "{" + this.label + ", " + this.inventory + 
        ", position{" + this.position.x + ", " + this.position.y + ", " + this.position.z + "}" +
        ", " + this.rotation + ", " + this.fuel + "}";
    }
}

module.exports = Turtle;