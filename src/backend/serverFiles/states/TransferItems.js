const Turtle = require('../Turtle.js');

//Defined slots presets
const DefinedSlots = {
    "SideSlots": [4, 8, 12, 13, 14, 15, 16]
}

async function transfer(turtle, slot, amount) {
    //Define the arguments by removing an index from the empty slots and stating a max amount to transfer
    let args = {
        "slot": slot,
        "amount": amount
    }

    //Transfer the item
    await turtle.executeAction(Turtle.Actions.TRANSFERTO, args);
}

//Slots: the slots to items to
async function TransferItems(turtle, slots) {
    let inventory = turtle.inventory;

    //Keep track of the empty slots
    let emptySlots = [];

    //Within the defined slots given, check which ones are empty and apply to the emptySlots variable
    for(let i = 0; i < slots.length; i++) {
        let item = inventory[slots[i] - 1];

        if(item == undefined) {
            emptySlots.push(slots[i]);
        }
    }

    //Loop through the inventory
    for(let i = 0; i < inventory.length; i++) {
        //If there are no empty slots then break
        if(emptySlots.length == 0) {
            break;
        }

        let item = inventory[i];

        //If there is no item or the index is on one of the defined slots then go to next
        if(item == undefined || slots.indexOf(i + 1) != -1) {
            continue;
        }

        //Select the slot if it is a correct item
        await turtle.executeAction(Turtle.Actions.SELECTITEM, i + 1);

        //Transfer the item
        await transfer(turtle, emptySlots.pop(), 64);
    }

    //Update the inventory
    await turtle.updateInventory();
}

/* TransferData example
{
  name: 'minecraft:redstone',
  amount: 6,
  toSlots: [ 10 ],
  fromSlots: [ { count: 14, slot: 15 } ]
}
*/
async function TransferSpecificItem(turtle, transferData) {
    let amount = transferData.amount;
    let fromSlots = transferData.fromSlots;
    let toSlots = transferData.toSlots;

    //The amount to transfer if there is more left over
    let leftOver = 0;
    //If there was a left over then this is the amount that is needed to be initially transfered
    let initialAmount = 0;
    for(const slot of fromSlots) {
        //Select the slot
        await turtle.executeAction(Turtle.Actions.SELECTITEM, slot.slot);

        if(initialAmount != 0 && slot.count > initialAmount) {
            //Transfer the item
            await transfer(turtle, toSlots[toSlots.length - 1], initialAmount);
            slot.count -= initialAmount;
            toSlots.pop();
        }

        if(toSlots.length == 0) {
            continue;
        }

        //The amount of times it can transfer
        let timesToTransfer = Math.floor(slot.count / amount);
        //The remainder
        leftOver = slot.count % amount;

        for(let i = 0; i < timesToTransfer && toSlots.length != 0; i++) {
            transferSlot = toSlots.pop();
            //Transfer the item
            await transfer(turtle, transferSlot, amount);
        }

        if(leftOver != 0 && toSlots[toSlots.length - 1] != undefined) {
            //Transfer the item
            //console.log("transferSlot in undefined: " + toSlots[0]);
            await transfer(turtle, toSlots[toSlots.length - 1], leftOver);

            initialAmount = amount - leftOver;
        } else {
            initialAmount = 0;
        }
    }
}

module.exports = { TransferItems, TransferSpecificItem, DefinedSlots };