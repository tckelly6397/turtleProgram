//Send
//The data sent from the front end to the back end
//
//frontAction: An action sent from the front end, along with a command for a turtle to execute
//frontSynchWorld: Tell the backend to send world data
//frontUpdateWorld: Send the world data from front end to back end, will most likely be removed because I think all world data should be handled in the backend
//frontPrintAllTurtleData: Tells the backend to display all the connected turtles data

//Receive
//The data sent from the back end to the front end
//
//updateTurtleDta: Update the turtle in the front end, the position and rotation
//backSyncWorldData: Send the world data from the world file to the front end
//detected: Send a list of blocks that the turtle detected

const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "api", {
        send: (channel, data) => {
            // whitelist channels
            let validChannels = ["frontAction", "frontUpdateWorld", "frontPrintAllTurtleData", "frontSelectTurtle", "frontState"];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, func) => {
            let validChannels = ["updateTurtleData", "backSyncWorldData", "detected", "backSendTurtleList", "backSendRecipeLocations"];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender`
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        }
    }
);