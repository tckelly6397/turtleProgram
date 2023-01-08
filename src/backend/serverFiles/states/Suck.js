/*=========================== Imports ===========================*/

/*=========================== Variables ===========================*/

/*=========================== Functions ===========================*/
//direction: Up Down Forward
async function SuckAll(turtle, direction) {
    for(let i = 0; i < 16; i++) {
        let data = await turtle.executeAction("suck" + direction);

        //Keep sucking until suck returns false
        if(data == false) {
            break;
        }
    }

    await turtle.updateInventory();
}

module.exports = { SuckAll };