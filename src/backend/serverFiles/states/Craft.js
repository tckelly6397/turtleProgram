/*
Craft:
	Arguments: item-name count
	Get item list from json file
	Check if it has necessary items
    Check max item crafting
	Sort inventory
	If Place chest is false
		Mine forward
		Place chest
	Empty inventory(all, filter: [necessary items])
	Transfer Inventory side rows
	Transfer siderows crafting recipe at max crafting amount
	Empty(side rows)
	Craft item-name (count > max amount ? count : max amount)
	Suck all chest
	Dig chest
*/