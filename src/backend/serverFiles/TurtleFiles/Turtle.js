/*
* Holds data pertaining to a Turtle
* Turtle code: https://pastebin.com/SYnheFxj
*/

/*=========================== Imports ===========================*/
const { Vector3 } = require("three");
const fs = require('fs');
const Item = require("./item.js");

/*=========================== Global Constants ===========================*/
const namesPath = './src/backend/resources/TurtleData/names.json';

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
    CRAFT: "craft",
    GETTURTLEDATA: "getTurtleData",
    REBOOTTURTLE: "rebootTurtle",
    TURNONTURTLE: "turnOnTurtle"
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
            [Actions.FORWARD]: async () => {return await this.moveForward();},
            [Actions.BACK]: async () => {return await this.moveBackward();},
            [Actions.UP]: async () => {return await this.moveUp();},
            [Actions.DOWN]: async () => {return await this.moveDown();},
            [Actions.TURNRIGHT]: async () => {return await this.turnRight();},
            [Actions.TURNLEFT]: async () => {return await this.turnLeft();},
            [Actions.DIGFORWARD]: async () => {return (await this.execute("turtle.dig()")).callback;},
            [Actions.DIGUP]: async () => {return (await this.execute("turtle.digUp()")).callback;},
            [Actions.DIGDOWN]: async () => {return (await this.execute("turtle.digDown()")).callback;},
            [Actions.GETLABEL]: async () => {return (await this.execute("os.getComputerLabel()")).callback;},
            [Actions.GETFUEL]: async () => {return (await this.execute("turtle.getFuelLevel()")).callback;},
            [Actions.COMPUTERID]: async () => {return (await this.execute("os.getComputerID()")).callback;},
            [Actions.DETECTUP]: async () => {return (await this.execute("turtle.inspectUp()"));},
            [Actions.DETECTFORWARD]: async () => {return (await this.execute("turtle.inspect()"));},
            [Actions.DETECTDOWN]: async () => {return (await this.execute("turtle.inspectDown()"));},
            [Actions.SETLABEL]: async (name) => {return (await this.execute("os.setComputerLabel(" + "\"" + name + "\"" + ")"));},
            [Actions.SELECTITEM]: async (slot) => {return await this.selectSlot(slot);},
            [Actions.REFUEL]: async (amount) => {return (await this.execute("turtle.refuel(" + amount + ")"));},
            [Actions.GETITEMDETAIL]: async () => {return (await this.execute("turtle.getItemDetail()")).callback;},
            [Actions.PLACEDOWN]: async (name) => {return this.place("Down");},
            [Actions.PLACEFORWARD]: async (name) => {return await this.place("");},
            [Actions.PLACEUP]: async (name) => {return await this.place("Up");},
            [Actions.STATS]: async () => {return await this.getTurtleData();},
            [Actions.ATTACKFORWARD]: async () => {return (await this.execute("turtle.attack()"));},
            [Actions.ATTACKUP]: async () => {return (await this.execute("turtle.attackUp()"));},
            [Actions.ATTACKDOWN]: async () => {return (await this.execute("turtle.attackDown()"));},
            [Actions.EQUIPLEFT]: async () => {return (await this.execute("turtle.equipLeft()"));},
            [Actions.EQUIPRIGHT]: async () => {return (await this.execute("turtle.equipRight()"));},
            [Actions.SUCKDOWN]: async () => {return await this.suck("Down");},
            [Actions.SUCKFORWARD]: async () => {return await this.suck("");},
            [Actions.SUCKUP]: async () => {return await this.suck("Up");},
            [Actions.DROPDOWN]: async () => {return await this.drop("Down");},
            [Actions.DROPFORWARD]: async () => {return await this.drop("");},
            [Actions.DROPUP]: async () => {return await this.drop("Up");},
            [Actions.TRANSFERTO]: async (args) => {return (await this.execute("turtle.transferTo(" + args.slot + ", " + args.amount + ")"));},
            [Actions.CRAFT]: async (args) => {return (await this.execute("turtle.craft(" + args.amount + ")"));},
            [Actions.GETTURTLEDATA]: async (args) => {return (await this.getExternalTurtleData(args));},
            [Actions.REBOOTTURTLE]: async (args) => {return (await this.execute("peripheral.wrap(\"" + args.direction + "\").reboot()"))},
            [Actions.TURNONTURTLE]: async (args) => {return (await this.execute("peripheral.wrap(\"" + args.direction + "\").turnOn()"))}
        }
    }

    /*=========================== Executions ===========================*/
    //Takes in a action name and optional arguments
    //Executes the action
    async executeAction(action, args) {
        let data = await this.actionMap[action](args);

        return data;
    }

    async drop(direction) {
        let data = await (await this.execute("turtle.drop" + direction + "()")).callback;

        if(data == true) {
            await this.updateSelectedSlot();
        }

        return data;
    }

    async suck(direction) {
        let data = await (await this.execute("turtle.suck" + direction + "()")).callback;

        if(data == true) {
            await this.updateSelectedSlot();
        }

        return data;
    }

    async selectItemByName(name) {
        for(let i = 0; i < this.inventory.length; i++) {
            let itemI = this.inventory[i];

            if(itemI != undefined && itemI.label == name) {
                await this.executeAction(Actions.SELECTITEM, i + 1);
                return true;
            }
        }

        return false;
    }

    async place(direction) {
        let isPlaced = (await this.execute("turtle.place" + direction + "()")).callback;

        if(isPlaced) {
            await this.updateSelectedSlot();
        }

        return isPlaced;
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

    async getExternalTurtleData(args) {
        let direction = args.direction;

        let data = {
            "label": (await this.execute("peripheral.wrap(\"" + direction + "\").getLabel()")).callback,
            "computerId": (await this.execute("peripheral.wrap(\"" + direction + "\").getID()")).callback
        }

        return data;
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

                if(message == "undefined") {
                    reject(message);
                } else {
                    resolve(JSON.parse(message));
                }
            });

            //Took too long
            setTimeout(() => {
                reject("Error from [" + this.label + "] while running [" + data.command + "]");
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
            let names = fs.readFileSync(namesPath, {encoding:'utf8', flag:'r'});
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