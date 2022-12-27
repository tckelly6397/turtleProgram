/*
* Holds data pertaining to Items
*/

class Item {
    label;
    count;

    constructor(label, count) {
        this.label = label;
        this.count = count;
    }
}

module.exports = Item;