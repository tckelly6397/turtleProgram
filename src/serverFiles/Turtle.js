//Turtle code: https://patebin.com/6ZnajFGz

//import { Item } from "./Item";
const { Vector3 } = require("three");
//import { WebSocket, WebSocketServer } from "ws";

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
    turnRight() {
        return this.execute("turtle.turnRight()").then(function(data) {
            return data.callback;
        });
    }

    turnLeft() {
        return this.execute("turtle.turnLeft()").then(function(data) {
            return data.callback;
        });
    }

    moveForward() {
        return this.execute("turtle.forward()").then(function(data) {
            console.log(data);
            return data.callback;
        });
    }

    moveBackward() {
        return this.execute("turtle.back()").then(function(data) {
            return data.callback;
        });
    }

    moveDown() {
        return this.execute("turtle.down()").then(function(data) {
            return data.callback;
        });
    }

    moveUp() {
        return this.execute("turtle.up()").then(function(data) {
            return data.callback;
        });
    }

    digForward() {
        return this.execute("turtle.dig()").then(function(data) {
            return data.callback;
        });
    }

    digDown() {
        return this.execute("turtle.digDown()").then(function(data) {
            return data.callback;
        });
    }

    digUp() {
        return this.execute("turtle.digUp()").then(function(data) {
            return data.callback;
        });
    }

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