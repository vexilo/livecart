/**
 *	@author Integry Systems
 */

if (!Backend.ProductVariation)
{
	Backend.ProductVariation = {}
}

Backend.ProductVariation.Editor = function(parentId, params)
{
	this.__instances__[parentId] = this;

	this.parentId = parentId;

	this.types = params.variationTypes;
	this.variations = params.variations;
	this.matrix = params.matrix.products;
	this.currency = params.currency;

	this.typeInstances = {};
	this.itemInstances = {};
	this.variationInstances = {};

	this.findUsedNodes();
	this.bindEvents();
	this.initializeEditor();
}

Backend.ProductVariation.Editor.prototype =
{
	__instances__: {},

	typeInstances: {},
	itemInstances: {},
	variationInstances: {},

	columnCount: 0,

	idCounter: 0,

	itemIndex: 0,

	getInstance: function(parentId)
	{
		return this.__instances__[parentId];
	},

	findUsedNodes: function()
	{
		this.container = $('tabProductVariations_' + this.parentId + 'Content');
		this.mainMenu = this.container.down('ul.menu');
		this.addLink = this.mainMenu.down('.addType');

		this.form = this.container.down('form.variationForm');
		this.tableTemplate = this.container.down('#productVariationTemplate');
	},

	bindEvents: function()
	{
		Event.observe(this.addLink, 'click', this.createType.bindAsEventListener(this));
		Event.observe(this.form, 'submit', this.save.bindAsEventListener(this));
	},

	initializeEditor: function()
	{
		var table = this.tableTemplate.cloneNode(true);
		this.table = table;

		this.table.tbody = table.getElementsByTagName('tbody')[0];
		this.table.thead = table.getElementsByTagName('thead')[0]
		this.table.thead.tr = table.thead.getElementsByTagName('tr')[0];

		var rowTemplate = table.tbody.getElementsByTagName('tr')[0];
		this.rowTemplate = rowTemplate;
		this.variationCellTemplate = this.rowTemplate.getElementsByTagName('td')[0];
		rowTemplate.parentNode.removeChild(rowTemplate);
		rowTemplate.removeChild(this.variationCellTemplate);

		var typeHeaderCell = table.thead.getElementsByTagName('th')[0];
		typeHeaderCell.parentNode.removeChild(typeHeaderCell);
		this.typeHeaderCell = typeHeaderCell;

		table.id = '';

		if (0 == this.types.length)
		{
			// add default type and value
			var type = new Backend.ProductVariationType({}, this);
			var value = new Backend.ProductVariationVar({}, type);
			value.createItems();
		}
		else
		{
			// add created types
			this.types.each(function(type)
			{
				var inst = new Backend.ProductVariationType(type, this);

				this.variations.each(function(variation)
				{
					if (variation.Type.ID == inst.getID())
					{
						var value = new Backend.ProductVariationVar(variation, this.typeInstances[variation.Type.ID]);

						if ((variation.Type.position > 0) && (0 == variation.position))
						{
							value.addToItems();
						}
						else
						{
							value.createItems();
						}
					}
				}.bind(this));
			}.bind(this));

			// add item data
			$H(this.matrix).each(function(value)
			{
				var ids = value[0];
				var productData = value[1];

				var variations = [];
				ids.split(/-/).each(function(id)
				{
					variations.push(this.variationInstances[id]);
				}.bind(this));

				var item = this.getItemsByVariations(variations).pop();
				item.setData(productData);
				item.initFields();
			}.bind(this));
		}

		this.form.down('.tableContainer').appendChild(table);
		Event.observe(table.thead.down('th.isEnabled').down('input'), 'change', this.toggleAllStatus.bind(this));
	},

	registerType: function(type)
	{
		this.typeInstances[type.getID()] = type;
	},

	removeType: function(type)
	{
		delete this.typeInstances[type.getID()];

		// reindex
		var index = -1;
		$H(this.typeInstances).each(function(value)
		{
			value[1].index = ++index;
		});

		this.columnCount = ++index;
	},

	mergeItems: function()
	{
		$H(this.itemInstances).each(function(value)
		{
			var item = value[1];
			if (item.getRow().parentNode)
			{
				$H(this.itemInstances).each(function(value)
				{
					var otherItem = value[1];
					if ((otherItem != item))
					{
						var v1 = item.getSortedVariations();
						var v2 = otherItem.getSortedVariations();

						var match = true;
						for (var k = 0; k < v1.length; k++)
						{
							if (v1[k] != v2[k])
							{
								match = false;
								break;
							}
						}

						if (match)
						{
							otherItem.delete();
						}
					}
				});
			}
		}.bind(this));

		this.syncRowspans();
	},

	registerVariation: function(variation)
	{
		this.variationInstances[variation.getID()] = variation;
	},

	unregisterVariation: function(variation)
	{
		delete this.variationInstances[variation.getID()];
	},

	registerItem: function(item)
	{
		item.index = ++this.itemIndex;
		this.itemInstances[item.getID()] = item;
	},

	unregisterItem: function(item)
	{
		delete this.itemInstances[item.getID()];
	},

	getTypeByIndex: function(index)
	{
		var foundType = null;

		$H(this.typeInstances).each(function(value)
		{
			var type = value[1];
			if (type.index == index)
			{
				foundType = type;
				return;
			}
		});

		return foundType;
	},

	deleteColumn: function(columnID)
	{
		var rows = this.table.getElementsByTagName('tr');
		for (var k = 0; k < rows.length; k++)
		{
			var cell = rows[k].getElementsByTagName('td')[columnID];
			cell.parentNode.removeChild(cell);
		}
	},

	createColumn: function()
	{
		var tr = this.table.thead.tr;
		tr.insertBefore(this.typeHeaderCell.cloneNode(true), tr.cells[this.columnCount]);

		return this.columnCount++;
	},

	createType: function(e)
	{
		Event.stop(e);

		var type = new Backend.ProductVariationType({}, this);
		var defVariation = new Backend.ProductVariationVar({}, type);
		defVariation.addToItems();
	},

	toggleAllStatus: function(e)
	{
		var el = Event.element(e);
		var state = el.checked;
		$H(this.itemInstances).each(function(value)
		{
			var inst = value[1];
			if (!inst.isEnabled)
			{
				inst.isEnabled = inst.getRow().down('.isEnabled').down('input');
			}

			inst.isEnabled.checked = state;
		});
	},

	getTable: function()
	{
		return this.table;
	},

	getLastRow: function()
	{
		return this.table.tbody.getElementsByTagName('tr').pop();
	},

	getRowTemplate: function()
	{
		return this.rowTemplate;
	},

	getVariationCellTemplate: function()
	{
		return this.variationCellTemplate;
	},

	getUniqueID: function()
	{
		return 'new_' + ++this.idCounter;
	},

	getTypes: function()
	{
		return this.typeInstances;
	},

	getTypeCount: function()
	{
		return this.columnCount;
	},

	getVariationCombinations: function(skipType)
	{
		var combinations = [];

		$H(this.typeInstances).each(function(value)
		{
			var type = value[1];
			var combined = [];

			if (type != skipType)
			{
				var variations = type.getVariations();

				if (combinations.length > 0)
				{
					combinations.each(function(combination)
					{
						variations.each(function(variation)
						{
							var comb = combination.slice(0);
							comb.push(variation);
							combined.push(comb);
						});
					});
				}
				else
				{
					variations.each(function(variation)
					{
						combined.push([variation]);
					});
				}

				combinations = combined.slice(0);
			}
		});

		return combinations;
	},

	createItem: function(variations)
	{
		return new Backend.ProductVariationItem({}, variations, this.getParentItem(variations));
	},

	getParentItem: function(variations, maxIndex)
	{
		var parentTypeVariations = [];
		for (var k = 0; k < variations.length; k++)
		{
			parentTypeVariations[variations[k].getType().getIndex()] = variations[k];
		}

		/* find the parent row = most similar */
		var item = null;
		while (parentTypeVariations.length > 1)
		{
			parentTypeVariations.pop();
			var item = this.getItemsByVariations(parentTypeVariations, maxIndex).pop();
			if (item)
			{
				return item;
			}
		}
	},

	getItemsByVariations: function(variations, maxIndex)
	{
		if (!maxIndex)
		{
			maxIndex = 0;
		}

		var items = [];
		$H(this.itemInstances).each(function(value)
		{
			var item = value[1];
			if ((item.index < maxIndex) || !maxIndex)
			{
				var intersect = item.getVariations().findAll( function(token){ return variations.include(token) } );
				if (intersect.length == variations.length)
				{
					items.push(item);
				}
			}
		});

		return items;
	},

	getItemInstances: function()
	{
		return this.itemInstances;
	},

	recreateTypeCells: function()
	{
		/* reset name input cell pointers */
		$H(this.variationInstances).each(function(value)
		{
			value[1].mainCell = null;
		});

		$H(this.itemInstances).each(function(value)
		{
			var item = value[1];
			item.recreateTypeCells();
		});
	},

	syncRowspans: function()
	{
		this.getTypeByIndex(this.getTypeCount() - 1).updateRowSpan();
	},

	save: function(e)
	{
		// validate

		// enumerate rows
		var rows = [];
		$A(this.table.tbody.getElementsByTagName('tr')).each(function(row)
		{
			row.down('.isEnabled').down('input').name = 'isEnabled[' +  row.instance.getID() +']';
			rows.push(row.instance.getID());
		});

		this.form.elements.namedItem('items').value = Object.toJSON(rows);

		// types and variations
		var types = [];
		var variations = {}
		for (var k = 0; k < this.getTypeCount(); k++)
		{
			var type = this.getTypeByIndex(k);
			types.push(type.getID());

			variations[type.getID()] = [];
			type.getVariations().each(function(variation)
			{
				variation.getMainCell().nameInput.name = 'variation[' + variation.getID() + ']';
				variations[type.getID()].push(variation.getID());
			});
		}

		this.form.elements.namedItem('types').value = Object.toJSON(types);
		this.form.elements.namedItem('variations').value = Object.toJSON(variations);
	},

	updateIDs: function(ids)
	{
		['variationInstances', 'typeInstances', 'itemInstances'].each(function(type)
		{
			$H(ids).each(function(val)
			{
				var id = val[0];
				var newId = val[1];
				if (this[type][id])
				{
					this[type][id].setID(newId);
				}
			}.bind(this));
		}.bind(this));
	},

	updateImages: function(images)
	{
		$H(images).each(function(value)
		{
			this.itemInstances[value[0]].showImage(value[1]);
		}.bind(this));
	},

	changeInstanceID: function(instance, type, newId)
	{
		var id = instance.getID();
		this[type][newId] = this[type][id];
		delete this[type][id];
	}
}

Backend.ProductVariationType = function(data, editor)
{
	this.data = data;
	this.editor = editor;
	this.id = this.data['ID'] ? this.data['ID'] : this.getEditor().getUniqueID();

	this.variations = {};
	this.create();
	this.editor.registerType(this);
}

Backend.ProductVariationType.prototype =
{
	getEditor: function()
	{
		return this.editor;
	},

	setID: function(id)
	{
		this.getEditor().changeInstanceID(this, 'typeInstances', id);
		this.id = id;
	},

	create: function()
	{
		this.index = this.editor.createColumn();

		var headerCell = this.getHeaderCell();

		headerCell.getElementsBySelector('.addVariation')[0].onclick = this.createNewVariation.bind(this);
		headerCell.getElementsBySelector('.deleteVariationType')[0].onclick = this.delete.bind(this);

		if (this.data['name'])
		{
			headerCell.getElementsByTagName('input')[0].value = this.data['name'];
		}
	},

	getIndex: function()
	{
		return this.index;
	},

	getCells: function()
	{
		var cells = [];
		$H(this.editor.getItemInstances()).each(function(value)
		{
			var item = value[1];
			var cell = item.getCellByType(this);
			if (cell)
			{
				cells.push(cell);
			}
		}.bind(this));

		return cells;
	},

	getHeaderCell: function()
	{
		return this.editor.getTable().thead.getElementsByTagName('th')[this.index];
	},

	updateRowSpan: function()
	{
		var rowspan = 1;

		var child = this.editor.getTypeByIndex(this.index + 1);
		if (child)
		{
			var childVar = child.getVariations();
			rowspan = childVar.length ? childVar.length * parseInt(childVar[0].getMainCell().getAttribute('rowspan')) : 1;
		}

		this.getCells().each(function(cell)
		{
			cell.rowSpan = rowspan;
		});

		if (this.index > 0)
		{
			var parentType = this.editor.getTypeByIndex(this.index - 1);
			parentType.updateRowSpan();
		}
	},

	delete: function(e)
	{
		Event.stop(e);

		var editor = this.getEditor();

		// remove variations from all items
		$H(editor.getItemInstances()).each(function(value)
		{
			var item = value[1];

			var cell = item.getCellByType(this);

			if (cell)
			{
				cell.parentNode.removeChild(cell);
			}

			item.unregisterVariation(item.getVariationByType(this));
		}.bind(this));

		var headerCell = this.getHeaderCell();
		headerCell.parentNode.removeChild(headerCell);

		editor.removeType(this);
		editor.mergeItems();
	},

	createNewVariation: function(e)
	{
		Event.stop(e);

		var value = new Backend.ProductVariationVar({}, this);
		value.createItems();
	},

	registerVariation: function(variation)
	{
		this.variations[variation.getID()] = variation;
		this.editor.registerVariation(variation);
	},

	unregisterVariation: function(variation)
	{
		delete this.variations[variation.getID()];
		this.editor.unregisterVariation(variation);
	},

	getVariations: function()
	{
		var variations = [];
		$H(this.variations).each(function(value)
		{
			variations.push(value[1]);
		});

		return variations;
	},

	getSubTypes: function()
	{
		var sub = [];
		var index = this.getIndex();
		$A(this.getEditor().getTypes()).each(function(type)
		{
			if (type.getIndex() > index)
			{
				sub.push(type);
			}
		});

		return sub;
	},

	getID: function()
	{
		return this.id;
	}
}

/**
 * 	Product variation (for example: small, medium, large - for sizes, red, green, blue - for colors, etc.)
 */
Backend.ProductVariationVar = function(data, type)
{
	this.cells = [];

	this.data = data;
	this.type = type;
	this.id = this.data['ID'] ? this.data['ID'] : this.type.getEditor().getUniqueID();

	this.type.registerVariation(this);
}

Backend.ProductVariationVar.prototype =
{
	mainCell: null,

	cells: [],

	createItems: function()
	{
		var combinations = this.type.getEditor().getVariationCombinations(this.type);
		if (0 == combinations.length)
		{
			combinations = [[]];
		}

		for (var k = 0; k < combinations.length; k++)
		{
			combinations[k].push(this);
			var item = this.type.getEditor().createItem(combinations[k]);
		}

		if (this.type.getIndex() > 0)
		{
			this.type.getEditor().getTypeByIndex(this.type.getIndex() - 1).updateRowSpan();
		}
	},

	setID: function(id)
	{
		this.type.getEditor().changeInstanceID(this, 'variationInstances', id);
		delete this.type.variations[this.id];

		this.id = id;
		this.type.variations[this.id] = this;
	},

	addToItems: function()
	{
		$H(this.type.getEditor().getItemInstances()).each(function(value)
		{
			var item = value[1];
			item.addVariationCell(this);
		}.bind(this));
	},

	getType: function()
	{
		return this.type;
	},

	getID: function()
	{
		return this.id;
	},

	initCell: function(cell)
	{
		if (!this.mainCell || !this.mainCell.parentNode)
		{
			cell.addClassName('input');
			this.mainCell = cell;
			this.mainCell.nameInput = this.mainCell.getElementsByTagName('input')[0];

			if (this.data.name)
			{
				this.mainCell.nameInput.value = this.data.name;
			}

			this.mainCell.nameInput.onchange = this.changeName.bind(this);
			this.mainCell.nameInput.onkeyup = this.changeName.bind(this);
			this.mainCell.getElementsBySelector('.deleteVariation')[0].onclick = this.delete.bind(this);
		}
		else
		{
			cell.removeClassName('input');
			cell.getElementsByTagName('input')[0].name = '';
			this.cells.push(cell);
			this.changeName(null, cell);
		}
	},

	changeName: function(e, cell)
	{
		this.data.name = $F(this.mainCell.nameInput);

		(cell ? [cell] : this.cells).each(function(cell)
		{
			if (!cell.nameElement)
			{
				cell.nameElement = cell.getElementsByTagName('span')[0];
			}

			cell.nameElement.update(this.data.name);
		}.bind(this));
	},

	getMainCell: function()
	{
		return this.mainCell;
	},

	delete: function(e)
	{
		Event.stop(e);

		this.getItems().each(function(item)
		{
			item.delete();
		});

		this.type.unregisterVariation(this);

		var editor = this.type.getEditor();
		editor.recreateTypeCells();
		editor.syncRowspans();
	},

	getItems: function()
	{
		return this.type.getEditor().getItemsByVariations([this]);
	}
}

/**
 *	Actual child product
 */
Backend.ProductVariationItem = function(data, variations, parent)
{
	var orderedVariations = [];
	variations.each(function(variation)
	{
		orderedVariations[variation.getType().getIndex()] = variation;
	});

	this.data = data;
	this.variations = orderedVariations;
	this.id = this.data['ID'] ? this.data['ID'] : this.getEditor().getUniqueID();
	this.cells = {};

	this.createRow(parent);
}

Backend.ProductVariationItem.prototype =
{
	row: null,

	parent: null,

	createRow: function(parent)
	{
		var editor = this.getEditor();
		var parentRow = parent ? parent.getRow() : null;

		this.parent = parent;
		this.row = editor.getRowTemplate().cloneNode(true);
		this.row.instance = this;

		if (parentRow)
		{
			parentRow.parentNode.insertBefore(this.row, parentRow.nextSibling);
		}
		else
		{
			editor.getTable().tbody.appendChild(this.row);
		}

		this.getTypeCells().each(function(variation)
		{
			this.addVariationCell(variation);
		}.bind(this));

		editor.registerItem(this);
		editor.syncRowspans();
	},

	setData: function(data)
	{
		this.data = data;
		this.setID(this.data['ID']);
	},

	setID: function(id)
	{
		this.getEditor().changeInstanceID(this, 'itemInstances', id);
		this.id = id;
	},

	initFields: function()
	{
		if (0 == this.data['shippingWeight'])
		{
			this.data['shippingWeight'] = '';
		}

		this.row.fieldCells = {};
		$A(this.row.cells).each(function(cell)
		{
			this.row.fieldCells[cell.className] = cell;
		}.bind(this));

		this.row.fieldCells['isEnabled'].getElementsByTagName('input')[0].checked = (this.data['isEnabled'] == 1);

		['sku', 'shippingWeight', 'stockCount'].each(function(field)
		{
			this.row.fieldCells[field].getElementsByTagName('input')[0].value = this.data[field];
		}.bind(this));

		var priceField = 'price_' + this.getEditor().currency;
		if (this.data[priceField] && (this.data[priceField] != 0))
		{
			this.row.fieldCells['price'].getElementsByTagName('input')[0].value = this.data[priceField];
		}

		var priceSelect = this.row.fieldCells['price'].getElementsByTagName('select')[0];
		var weightSelect = this.row.fieldCells['shippingWeight'].getElementsByTagName('select')[0];

		if (this.data.childSettings)
		{
			if (this.data.childSettings.price)
			{
				priceSelect.value = this.data.childSettings.price;
			}

			if (this.data.childSettings.weight)
			{
				weightSelect.value = this.data.childSettings.weight;
			}
		}

		[priceSelect, weightSelect].each(function(el)
		{
			el.onchange = this.selectorChanged.bind(this);
			this.selectorChanged(el);
		}.bind(this));

		if (this.data.DefaultImage)
		{
			this.showImage(this.data.DefaultImage);
		}
	},

	containsVariation: function(variation)
	{
		return this.variations.include(variation);
	},

	addVariationCell: function(variation)
	{
		if (!this.containsVariation(variation))
		{
			this.variations.push(variation);
		}

		var cell = this.getEditor().getVariationCellTemplate().cloneNode(true);
		var lastVariation = this.row.getElementsBySelector('td.variation').pop();
		this.row.insertBefore(cell, lastVariation ? lastVariation.nextSibling : this.row.firstChild);

		this.cells[variation.getType().getID()] = cell;

		variation.initCell(cell);

		return cell;
	},

	recreateTypeCells: function()
	{
		$A(this.row.getElementsBySelector('td.variation')).each(function(cell)
		{
			cell.parentNode.removeChild(cell);
		});

		this.getTypeCells().each(function(variation)
		{
			this.addVariationCell(variation);
		}.bind(this));
	},

	getTypeCells: function()
	{
		/* find new parent item if the old doesn't exist anymore */
		if (!this.parent || !this.parent.getRow().parentNode)
		{
			/* so that this record itself is not matched as the closest parent */
			var temp = this.variations;
			var editor = this.getEditor();
			var variations = this.getSortedVariations();
			this.variations = [];

			this.parent = editor.getParentItem(variations, this.index);
			this.variations = temp;
		}

		if (this.parent)
		{
			this.variations = this.getSortedVariations();
			var parentVariations = this.parent.getSortedVariations();

			for (var k = 0; k < this.variations.length; k++)
			{
				if (this.variations[k] != parentVariations[k])
				{
					var variationCells = this.variations.slice(k);
					break;
				}
			}
		}
		else
		{
			var variationCells = this.getSortedVariations();
		}

		/* sort by index */
		var sorted = [];
		variationCells.each(function(variation)
		{
			sorted[variation.getType().getIndex()] = variation;
		});

		/* remove empty */
		var ret = [];
		sorted.each(function(variation)
		{
			if (variation)
			{
				ret.push(variation);
			}
		});

		return ret;
	},

	getCellByType: function(type)
	{
		return this.cells[type.getID()];
	},

	getEditor: function()
	{
		return this.variations[0].getType().getEditor();
	},

	getParentItem: function()
	{
		return this.parent;
	},

	getID: function()
	{
		return this.id;
	},

	getVariations: function()
	{
		return this.variations;
	},

	getSortedVariations: function()
	{
		var variations = [];
		this.variations.each(function(variation)
		{
			if (variation)
			{
				variations[variation.getType().getIndex()] = variation;
			}
		});

		var filtered = [];
		variations.each(function(variation)
		{
			if (variation)
			{
				filtered.push(variation);
			}
		});

		return filtered;
	},

	getVariationByType: function(type)
	{
		var found = null;
		this.getSortedVariations().each(function(variation)
		{
			if (type == variation.getType())
			{
				found = variation;
			}
		});

		return found;
	},

	getRow: function()
	{
		return this.row;
	},

	unregisterVariation: function(variation)
	{
		for (var k = 0; k < this.variations.length; k++)
		{
			if (this.variations[k] == variation)
			{
				delete this.variations[k];
			}
		}

		this.variations = this.getSortedVariations();
	},

	delete: function()
	{
		this.getEditor().unregisterItem(this);
		this.row.parentNode.removeChild(this.row);
	},

	selectorChanged: function(e)
	{
		var el = (e instanceof Event) ? Event.element(e) : e;
		var cell = el.parentNode;
		if ($F(el))
		{
			cell.addClassName('input');
		}
		else
		{
			cell.removeClassName('input');
		}
	},

	showImage: function(imgData)
	{
		if (imgData['paths'])
		{
			var img = this.row.fieldCells['image'].getElementsByTagName('img')[0];
			img.src = imgData['paths'][1] + '?' + (Math.random() * 10000);
			img.style.display = '';

			anchor = img.parentNode;
			anchor.href = imgData['paths'][4] + '?' + (Math.random() * 10000);
			anchor.onclick = function () {showLightbox(this); return false;}
		}
	}
}