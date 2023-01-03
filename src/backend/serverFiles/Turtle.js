/*
* Holds data pertaining to a Turtle
* Turtle code: https://pastebin.com/SYnheFxj
*/

/*=========================== Imports ===========================*/
const { Vector3 } = require("three");
const fs = require('fs');
const Item = require("./item.js");

/*=========================== ENUM Actions ===========================*/
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
    SETLABEL: "setLabel",
    SELECTITEM: "selectItem",
    GETITEMDETAIL: "getItemDetail",
    PLACEUP: "placeUp",
    PLACEFORWARD: "placeForward",
    PLACEDOWN: "placeDown",
    REFUEL: "refuel",
    ATTACKUP: "attackUp",
    ATTACKFORWARD: "attackForward",
    ATTACKDOWN: "attackDown",
    EQUIPLEFT: "equipLeft",
    EQUIPRIGHT: "equipRight",
    SUCKDOWN: "suckDown",
    SUCKFORWARD: "suckForward",
    SUCKUP: "suckUp",
    DROPDOWN: "dropDown",
    DROPFORWARD: "dropForward",
    DROPUP: "dropUp",
    TRANSFERTO: "transferTo",
    CRAFT: "craft"
}

/*=========================== Turtle Class ===========================*/
class Turtle {
    /*=========================== Variables ===========================*/
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
    selectedSlot;

    /*=========================== Constructor ===========================*/
    constructor(ws) {
        this.inventory = new Array(16);
        this.position = new Vector3();
        this.rotation = 0;
        this.ws = ws;
        this.busy = false;
        this.mapLocation = undefined;
        this.selectedSlot = 0;

        /*=========================== Action Map ===========================*/
        //Maps action names to function executions
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
            "selectItem": async (slot) => {return this.selectSlot(slot);},
            "refuel": async (amount) => {return (await this.execute("turtle.refuel(" + amount + ")"));},
            "getItemDetail": async () => {return (await this.execute("turtle.getItemDetail()")).callback;},
            "placeDown": async (name) => {return this.placeDown(name);},
            "placeForward": async (name) => {return await this.place(name);},
            "placeUp": async (name) => {return this.placeUp(name);},
            "stats": async () => {return this.getTurtleData();},
            "attackForward": async () => {return (await this.execute("turtle.attack()"));},
            "attackUp": async () => {return (await this.execute("turtle.attackUp()"));},
            "attackDown": async () => {return (await this.execute("turtle.attackDown()"));},
            "equipLeft": async () => {return (await this.execute("turtle.equipLeft()"));},
            "equipRight": async () => {return (await this.execute("turtle.equipRight()"));},
            "suckDown": async () => {return (await this.execute("turtle.suckDown()"));},
            "suckForward": async () => {return (await this.execute("turtle.suck()"));},
            "suckUp": async () => {return (await this.execute("turtle.suckUp()"));},
            "dropDown": async () => {return (await this.execute("turtle.dropDown()"));},
            "dropForward": async () => {return (await this.execute("turtle.drop()"));},
            "dropUp": async () => {return (await this.execute("turtle.dropUp()"));},
            "transferTo": async (args) => {return (await this.execute("turtle.transferTo(" + args.slot + ", " + args.amount + ")"));},
            "craft": async (args) => {return (await this.execute("turtle.craft(" + args.name + ", " + args.amount + ")"));}
        }
    }

    /*=========================== Executions ===========================*/
    //Takes in a action name and optional arguments
    //Executes the action
    async executeAction(action, args) {
        var startTime = performance.now()

        let data = await this.actionMap[action](args);

        var endTime = performance.now();
        //console.log(`action ${action} took ${endTime - startTime} milliseconds`)

        return data;
    }

    async selectItemByName(name) {
        for(let i = 0; i < this.inventory.length; i++) {
            let itemI = this.inventory[i];

            if(itemI.label == name) {
                await this.executeAction(Actions.SELECTITEM, i + 1);
                return true;
            }
        }

        return false;
    }

    async placeUp(name) {
        return (await this.execute("turtle.placeUp()")).callback;
    }

    async place(name) {
        return (await this.execute("turtle.place()")).callback;
    }

    async placeDown(name) {

        return (await this.execute("turtle.placeDown()")).callback;
    }

    async selectSlot(slot) {
        let selectSlot = await this.execute("turtle.select(" + slot + ")");

        if(selectSlot != undefined) {
            this.selectedSlot = slot;
        }

        return slot;
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

    /*=========================== Extra Functions ===========================*/
    //Updates the turtles meta data
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

        this.updateInventory();
    }

    async updateInventory() {
        //Loop through the inventory slots
        for(let i = 1; i < 17; i++) {
            await this.executeAction(Actions.SELECTITEM, i);
            let item = await this.executeAction(Actions.GETITEMDETAIL);

            //If a item is found then add it to the inventory
            if(item != undefined) {
                this.inventory[i - 1] = new Item(item.name, item.count);
            } else {
                this.inventory[i - 1] = undefined;
            }
        }
    }

    async updateSelectedSlot() {
        let item = await this.executeAction(Actions.GETITEMDETAIL);

        //If a item is found then add it to the inventory
        if(item != undefined) {
            this.inventory[this.selectedSlot - 1] = new Item(item.name, item.count);
        } else {
            this.inventory[this.selectedSlot - 1] = undefined;
        }
    }

    //Retrieve the turtle data
    getTurtleData() {
        let data = {
            "label": this.label,
            "computerId": this.computerId,
            "fuel": this.fuel,
            "rotation": this.rotation,
            "x": this.position.x,
            "y": this.position.y,
            "z": this.position.z,
            "mapLocation": this.mapLocation,
            "inventory": this.inventory,
            "selectedSlot": this.selectedSlot
        }

        return data;
    }

    //Returns a list of blocks based on the detection of the turtle
    async detect() {
        let blocks = [];
        let top = await this.executeAction(Actions.DETECTUP);
        let down = await this.executeAction(Actions.DETECTDOWN);
        let forward = await this.executeAction(Actions.DETECTFORWARD);

        let blockU = this.getBlockData(top, 0, 1, 0);
        let blockD = this.getBlockData(down, 0, -1, 0);
        let blockF = this.getBlockData(forward, Math.round(Math.cos(this.rotation * (Math.PI/180))), 0, Math.round(Math.sin(this.rotation * (Math.PI/180))));

        blocks.push(blockU);
        blocks.push(blockD);
        blocks.push(blockF);

        return JSON.stringify(blocks);
    }

    //Accept a detection and an offset and return the block data
    getBlockData(detection, xOff, yOff, zOff) {

        return {
            "name": (detection.callback) ? detection.extra.name : "air",
            "x": this.position.x + xOff,
            "y": this.position.y + yOff,
            "z": this.position.z + zOff,
            "extra": (detection.callback) ? detection.extra : "empty"
        }
    }
}

module.exports = { Turtle, Actions };