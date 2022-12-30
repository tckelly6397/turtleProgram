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
    busy;
    computerId;

    constructor(ws) {
        this.inventory = [];
        this.position = new Vector3();
        this.rotation = 0;
        this.ws = ws;
        this.busy = false;

        this.getLabel().then(value => {
                this.label = value;
                this.getFuel().then(value => {
                    this.fuel = value;
                    this.getComputerId().then(value => {
                        this.computerId = value;
                    });
                });
            });
    }

    //Functions ===
    //Execute
    //Move functions
    //Stats functions
    //Get Map data
    async turnRight() {
        const data = await this.execute("turtle.turnRight()");

        if(data.callback === true) {
            this.rotation += 90;
        }

        return data.callback;
    }

    async turnLeft() {
        const data = await this.execute("turtle.turnLeft()");

        if(data.callback === true) {
            this.rotation -= 90;
        }

        return data.callback;
    }

    async moveForward() {
        const data = await this.execute("turtle.forward()");
        console.log(data);

        if(data.callback === true) {
            this.position.add(new Vector3(Math.round(Math.cos(this.rotation * (Math.PI/180))), 0, Math.round(Math.sin(this.rotation * (Math.PI/180)))));
        }

        return data.callback;
    }

    async moveBackward() {
        const data = await this.execute("turtle.back()");

        if(data.callback === true) {
            this.position.add(new Vector3(Math.round(-Math.cos(this.rotation * (Math.PI/180))), 0, Math.round(-Math.sin(this.rotation * (Math.PI/180)))));
        }

        return data.callback;
    }

    async moveDown() {
        const data = await this.execute("turtle.down()");

        if(data.callback === true) {
            this.position.add(new Vector3(0, -1, 0));
        }

        return data.callback;
    }

    async moveUp() {
        const data = await this.execute("turtle.up()");

        if(data.callback === true) {
            this.position.add(new Vector3(0, 1, 0));
        }

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

    async getLabel() {
        const data = await this.execute("os.getComputerLabel()");
        return data.callback;
    }

    async getLabel() {
        const data = await this.execute("os.getComputerLabel()");
        return data.callback;
    }

    async getFuel() {
        const data = await this.execute("turtle.getFuelLevel()");
        return data.callback;
    }

    async getComputerId() {
        const data = await this.execute("os.getComputerID()");
        return data.callback;
    }

    async detectUp() {
        const data = await this.execute("turtle.inspectUp()");
        return data;
    }

    async detectForward() {
        const data = await this.execute("turtle.inspect()");
        return data;
    }

    async detectDown() {
        const data = await this.execute("turtle.inspectDown()");
        return data;
    }

    //Send data to a Turtle and execute it, returning what the command executes within the turtle as a Promise
    async execute(value) {
        this.busy = true;

        //Add any data necessary to this JSON object
        let data = {
            "command": "return " + value
        }

        //Send the message
        this.ws.send(JSON.stringify(data));

        //Return a promise and wait for a response
        return new Promise((resolve, reject) => {
            this.ws.on('message', (message) => {
                this.busy = false;
                resolve(JSON.parse(message));
            });
        });
    }

    getStats() {
        return "{" + this.label + ", " + this.computerId + ", " + this.inventory +
        ", position{" + this.position.x + ", " + this.position.y + ", " + this.position.z + "}" +
        ", " + this.rotation + ", " + this.fuel + "}";
    }

    getPositionAsJSON() {
        let coords = [
            this.position.x,
            this.position.y,
            this.position.z
        ]

        return JSON.stringify(coords);
    }

    isBusy() {
        return this.busy;
    }

    async detect() {
        let blocks = [];
        let top = await this.detectUp();
        let down = await this.detectDown();
        let forward = await this.detectForward();

        let blockU = {
            "name": (top.callback) ? top.extra.name : "air",
            "x": this.position.x,
            "y": this.position.y + 1,
            "z": this.position.z
        }

        let blockD = {
            "name": (down.callback) ? down.extra.name : "air",
            "x": this.position.x,
            "y": this.position.y - 1,
            "z": this.position.z
        }

        let blockF = {
            "name": (forward.callback) ? forward.extra.name : "air",
            "x": this.position.x + Math.round(Math.cos(this.rotation * (Math.PI/180))),
            "y": this.position.y,
            "z": this.position.z + Math.round(Math.sin(this.rotation * (Math.PI/180)))
        }

        blocks.push(blockU);
        blocks.push(blockD);
        blocks.push(blockF);

        console.log("ttt" + blocks);

        return JSON.stringify(blocks);
    }
}

module.exports = Turtle;