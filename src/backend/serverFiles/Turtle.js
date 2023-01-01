/*
* Holds data pertaining to a Turtle
*/

//Turtle code: https://patebin.com/6ZnajFGz

const { Vector3 } = require("three");
const fs = require('fs');

const Actions = {
	FORWARD: "forward",
	BACK: "back",
	UP: "up",
	DOWN: "down",
    TURNRIGHT: "turnRight",
    TURNLEFT: "turnLeft",
    DIGFORWARD: "digForward",
    DIGUP: "digUp",
    DIGDOWN: "digDown",
    GETLABEL: "getLabel",
    GETFUEL: "getFuel",
    COMPUTERID: "getComputerId",
    DETECTUP: "detectUp",
    DETECTFORWARD: "detectForward",
    DETECTDOWN: "detectDown",
    STATS: "stats",
    SETLABEL: "setLabel"
}

class Turtle {
    label;
    inventory;
    position;
    rotation;
    fuel;
    ws;
    busy;
    computerId;
    actionMap;
    mapLocation;

    constructor(ws) {
        this.inventory = [];
        this.position = new Vector3();
        this.rotation = 0;
        this.ws = ws;
        this.busy = false;
        this.mapLocation = undefined;

        this.actionMap = {
            "forward": () => {return this.moveForward();},
            "back": () => {return this.moveBackward();},
            "up": () => {return this.moveUp();},
            "down": () => {return this.moveDown();},
            "turnRight": () => {return this.turnRight();},
            "turnLeft": () => {return this.turnLeft();},
            "digForward": async () => {return (await this.execute("turtle.dig()")).callback;},
            "digUp": async () => {return (await this.execute("turtle.digUp()")).callback;},
            "digDown": async () => {return (await this.execute("turtle.digDown()")).callback;},
            "getLabel": async () => {return (await this.execute("os.getComputerLabel()")).callback;},
            "getFuel": async () => {return (await this.execute("turtle.getFuelLevel()")).callback;},
            "getComputerId": async () => {return (await this.execute("os.getComputerID()")).callback;},
            "detectUp": async () => {return (await this.execute("turtle.inspectUp()"));},
            "detectForward": async () => {return (await this.execute("turtle.inspect()"));},
            "detectDown": async () => {return (await this.execute("turtle.inspectDown()"));},
            "setLabel": async (name) => {return (await this.execute("os.setComputerLabel(" + "\"" + name + "\"" + ")"));},
            "stats": async () => {return this.getStats;}
        }
    }

    //Functions ===
    //Execute
    //Move functions
    //Stats functions
    //Get Map data

    async executeAction(action, args) {
        var startTime = performance.now()

        let data = await this.actionMap[action](args);

        var endTime = performance.now();
        //console.log(`action ${action} took ${endTime - startTime} milliseconds`)

        return data;
    }

    async updateMetaData() {
        this.fuel = await this.executeAction(Actions.GETFUEL);
        this.computerId = await this.executeAction(Actions.COMPUTERID);
        this.label = await this.executeAction(Actions.GETLABEL);

        if(this.label == undefined) {
            //Get a random name
            let names = fs.readFileSync("./src/backend/serverFiles/TurtleData/names.json", {encoding:'utf8', flag:'r'});
            names = JSON.parse(names);
            let name = names[Math.ceil(Math.random() * names.length)];

            await this.executeAction(Actions.SETLABEL, name);
            this.label = await this.executeAction(Actions.GETLABEL);
        }

        if(this.mapLocation == undefined) {
            this.mapLocation = this.label + "World.json";
        }
    }

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

    waitFor(conditionFunction) {
        const poll = resolve => {
          if(conditionFunction()) resolve();
          else setTimeout(_ => poll(resolve), 5);
        }

        return new Promise(poll);
    }

    //Send data to a Turtle and execute it, returning what the command executes within the turtle as a Promise
    async execute(value) {
        //Wait until commands are done
        await this.waitFor(_ => this.busy === false);
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

            //Took too long
            setTimeout(() => {
                reject("Error");
            }, 1000);
        });
    }

    getStats() {
        return "{label: " + this.label + ", computerId: " + this.computerId + ", Inventory: " + this.inventory +
        ", position{" + this.position.x + ", " + this.position.y + ", " + this.position.z + "}" +
        ", rotation: " + this.rotation + ", fuel: " + this.fuel + ", world: " + this.mapLocation + "}";
    }

    getTurtleData() {
        let data = {
            "label": this.label,
            "computerId": this.computerId,
            "fuel": this.fuel,
            "rotation": this.rotation,
            "x": this.position.x,
            "y": this.position.y,
            "z": this.position.z,
            "mapLocation": this.mapLocation
        }

        return data;
    }

    //Returns a list of blocks based on the detection of the turtle
    async detect() {
        let blocks = [];
        let top = await this.executeAction(Actions.DETECTUP);
        let down = await this.executeAction(Actions.DETECTDOWN);
        let forward = await this.executeAction(Actions.DETECTFORWARD);

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

        return JSON.stringify(blocks);
    }
}

module.exports = { Turtle, Actions };