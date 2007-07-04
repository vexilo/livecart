Backend.CustomerOrder = Class.create();
Backend.CustomerOrder.prototype = 
{
  	Links: {},
    Messages: {},
    
    treeBrowser: null,
  	
  	urls: new Array(),
	  
	initialize: function(groups)
	{
		Backend.CustomerOrder.prototype.treeBrowser = new dhtmlXTreeObject("orderGroupsBrowser","","", false);
		Backend.CustomerOrder.prototype.treeBrowser.setOnClickHandler(this.activateGroup);
		
		Backend.CustomerOrder.prototype.treeBrowser.def_img_x = 'auto';
		Backend.CustomerOrder.prototype.treeBrowser.def_img_y = 'auto';
				
		Backend.CustomerOrder.prototype.treeBrowser.setImagePath("image/backend/dhtmlxtree/");
       
		Backend.CustomerOrder.prototype.treeBrowser.showFeedback = 
			function(itemId) 
			{
				if (!this.iconUrls)
				{
					this.iconUrls = new Object();	
				}
				
				this.iconUrls[itemId] = this.getItemImage(itemId, 0, 0);
				this.setItemImage(itemId, '../../../image/indicator.gif');
			}
		
		Backend.CustomerOrder.prototype.treeBrowser.hideFeedback = 
			function()
			{
				for (var itemId in this.iconUrls)
				{
					this.setItemImage(itemId, this.iconUrls[itemId]);	
				}				
			}
		
    	this.insertTreeBranch(groups, 0); 
        
        if(!Backend.ajaxNav.getHash().match(/group_\d+#\w+/)) window.location.hash = '#group_1#tabOrders__';
	    this.tabControl = TabControl.prototype.getInstance('orderGroupsManagerContainer', this.craftTabUrl, this.craftContainerId, {}); 

        Backend.CustomerOrder.prototype.instance = this;
        
        var $this = this;
        Event.observe($("createNewOrderLink"), "click", function(e) {
            Event.stop(e);
            Backend.CustomerOrder.prototype.customerPopup = new Backend.SelectPopup(
                Backend.CustomerOrder.Links.selectCustomer, 
                Backend.CustomerOrder.Messages.selecCustomerTitle, 
                {
                    onObjectSelect: function() { 
                       console.info('asdad');
                       $this.createNewOrder(this.objectID); 
                    }
                }
            );
        });
	},
    
    createNewOrder: function(customerID)
    {
        var $this = this;
        new LiveCart.AjaxRequest(
            Backend.CustomerOrder.Links.createOrder + "?customerID=" + customerID,
            false,
            function(response)
            {
                response = eval("(" + response.responseText + ")");
                
                if('success' == response.status)
                {
                    window.ordersActiveGrid[Backend.CustomerOrder.prototype.activeGroup].reloadGrid();
                    
                    new Backend.SaveConfirmationMessage($("orderCreatedConfirmation"));	
                    new Backend.SelectPopup.prototype.popup.Backend.SaveConfirmationMessage(Backend.SelectPopup.prototype.popup.$("orderCreatedConfirmation")); // show message in the popup
                }
                else
                {
                     if(response.errors.noaddress)
                     {	
                         new Backend.SaveConfirmationMessage($("userHasNoAddressError")); // show error on the main page
                         new Backend.SelectPopup.prototype.popup.Backend.SaveConfirmationMessage(Backend.SelectPopup.prototype.popup.$("userHasNoAddressError")); // show error in popup
                     }
                }
            } 
        );
    },
    
    craftTabUrl: function(url)
    {
        return url.replace(/_id_/, Backend.CustomerOrder.prototype.treeBrowser.getSelectedItemId());
    },

    craftContainerId: function(tabId)
    {
        return tabId + '_' +  Backend.CustomerOrder.prototype.treeBrowser.getSelectedItemId() + 'Content';
    },
	
	insertTreeBranch: function(treeBranch, rootId)
	{
        $A(treeBranch).each(function(node)
		{
            Backend.CustomerOrder.prototype.treeBrowser.insertNewItem(node.rootID, node.ID, node.name, null, 0, 0, 0, '', 1);
            this.treeBrowser.showItemSign(node.ID, 0);
            var group = document.getElementsByClassName("standartTreeRow", $("orderGroupsBrowser")).last().up('tr');
            group.id = 'group_' + node.ID;
            group.onclick = function()
            {
                Backend.CustomerOrder.prototype.treeBrowser.selectItem(node.ID, true);
            }
		}.bind(this));
	},

	activateGroup: function(id)
	{
        var self = Backend.CustomerOrder.prototype.instance;
        
        if(id == 8)
        {
            $("tabOrderProducts").hide();
        }
        else
        {
            $("tabOrderProducts").show();
        }
        
        if(Backend.CustomerOrder.prototype.activeGroup && Backend.CustomerOrder.prototype.activeGroup != id)
        {           
            // Remove empty shippments
            var productsContainer = $("orderManagerContainer");
            if(productsContainer && productsContainer.style.display != 'none')
            {
                if(!Backend.CustomerOrder.Editor.prototype.getInstance(Backend.CustomerOrder.Editor.prototype.getCurrentId()).removeEmptyShipmentsConfirmation()) 
                {
                    Backend.CustomerOrder.prototype.treeBrowser.selectItem(Backend.CustomerOrder.prototype.activeGroup, false);
                    return;
                }
            }
            
            Backend.CustomerOrder.prototype.activeGroup = id;
    		Backend.CustomerOrder.prototype.treeBrowser.showFeedback(id);
            
            Backend.ajaxNav.add('group_' + id);
            
            self.tabControl.activateTab('tabOrders', function() { 
                Backend.CustomerOrder.prototype.treeBrowser.hideFeedback(id);
            });
            
            Backend.showContainer("orderGroupsManagerContainer");
        }
        
        Backend.CustomerOrder.prototype.activeGroup = id;
	},
	
	displayCategory: function(response)
	{
		Backend.CustomerOrder.prototype.treeBrowser.hideFeedback();
	},
	
	resetForm: function(e)
	{
		var el = Event.element(e);
		while (el.tagName != 'FORM')
		{
			el = el.parentNode;
		}
		
		el.reset();		
	},
	
	save: function(form)
	{
		var indicator = document.getElementsByClassName('progressIndicator', form)[0];
		new LiveCart.AjaxRequest(form, indicator, this.displaySaveConfirmation.bind(this));	
	},
	
	displaySaveConfirmation: function()
	{
		new Backend.SaveConfirmationMessage(document.getElementsByClassName('yellowMessage')[0]);			
	},
   
	updateHeader: function ( activeGrid, offset ) 
	{
		var liveGrid = activeGrid.ricoGrid;
		
		var totalCount = liveGrid.metaData.getTotalRows();
		var from = offset + 1;
		var to = offset + liveGrid.metaData.getPageSize();
		
		if (to > totalCount)
		{
			to = totalCount;		
		}
		  
       
		var categoryID = activeGrid.tableInstance.id.split('_')[1];		
		var cont =  activeGrid.tableInstance.up('.sectionContainer').down('.orderCount');
		var countElement = document.getElementsByClassName('rangeCount', cont)[0];
		var notFound = document.getElementsByClassName('notFound', cont)[0];
								
		if (totalCount > 0)
		{
			if (!countElement.strTemplate)
			{
				countElement.strTemplate = countElement.innerHTML;	
			}		
			
			var str = countElement.strTemplate;
			str = str.replace(/%from/, from);
			str = str.replace(/%to/, to);
			str = str.replace(/%count/, totalCount);
									
			countElement.innerHTML = str;
			notFound.style.display = 'none';
			countElement.style.display = '';					
		}
		else
		{
			notFound.style.display = '';
			countElement.style.display = 'none';					
		}
    },
    
    openOrder: function(id, e) 
    {
        Event.stop(e);
        
        Backend.CustomerOrder.Editor.prototype.setCurrentId(id); 
        $('orderIndicator_' + id).style.visibility = 'visible';
        
    	var tabControl = TabControl.prototype.getInstance(
            'orderManagerContainer',
            Backend.CustomerOrder.Editor.prototype.craftTabUrl, 
            Backend.CustomerOrder.Editor.prototype.craftContentId
        ); 
        
        tabControl.activateTab();
        
        if(Backend.CustomerOrder.Editor.prototype.hasInstance(id)) 
    	{
    		Backend.CustomerOrder.Editor.prototype.getInstance(id);			
    	}	
    }
}

Backend.CustomerOrder.Links = {}; 
Backend.CustomerOrder.Messages = {}; 

Backend.CustomerOrder.GridFormatter = 
{
    lastUserID: 0,
    
	getClassName: function(field, value)
	{
		
	},
	
	formatValue: function(field, value, id)
	{
		if ('User.fullName' == field && Backend.CustomerOrder.prototype.usersMiscPermission)
		{
		    value = 
            '<span>' + 
            '    <span class="progressIndicator" id="orderIndicator_' + id + '" style="visibility: hidden;"></span>' + 
            '</span>' + 
            '<a href="#edit" id="order_' + id + '" onclick="try { Backend.CustomerOrder.prototype.openOrder(' + id + ', event); } catch(e) { console.info(e) }  return false;">' +
                 value + 
            '</a>'
		}
// Email lead to user's page
//      else if ('User.email' == field && Backend.CustomerOrder.prototype.usersMiscPermission)
//		{
//		    value = 
//          '<span>' + 
//          '    <span class="progressIndicator UserIndicator" id="orderUserIndicator_' + id + '_' + Backend.CustomerOrder.GridFormatter.lastUserID + '" style="visibility: hidden;"></span>' + 
//          '</span>' + 
//          '<a href="#edit" id="user_' + Backend.CustomerOrder.GridFormatter.lastUserID + '" onclick="Backend.UserGroup.prototype.openUser(' + Backend.CustomerOrder.GridFormatter.lastUserID + ', event); } catch(e) { console.info(e) }  return false;">' + 
//              value + 
//          '</a>';	
//		}
		else if ('CustomerOrder.ID2' == field && Backend.CustomerOrder.prototype.ordersMiscPermission)
		{
		    value = id;
        }
        else if('User.ID' == field)
        {
            Backend.CustomerOrder.GridFormatter.lastUserID = value;
        }
        
        if(value == '-')
        {
            value = "<center>" + value + "</center>";   
        }
		
		return value;
	}
}



Backend.CustomerOrder.massActionHandler = Class.create();
Backend.CustomerOrder.massActionHandler.prototype = 
{
    handlerMenu: null,    
    actionSelector: null,
    valueEntryContainer: null,
    form: null,
        
    grid: null,
    
    initialize: function(handlerMenu, activeGrid)
    {
        this.handlerMenu = handlerMenu;     
        this.actionSelector = handlerMenu.getElementsByTagName('select')[0];
        this.valueEntryContainer = handlerMenu.down('.bulkValues');
        this.form = this.actionSelector.form;

        this.actionSelector.onchange = this.actionSelectorChange.bind(this);
        Event.observe(this.actionSelector.form, 'submit', this.submit.bind(this));
            
        this.grid = activeGrid;
    },
    
    actionSelectorChange: function()
    {
		for (k = 0; k < this.valueEntryContainer.childNodes.length; k++)
        {
            if (this.valueEntryContainer.childNodes[k].style)
            {
                Element.hide(this.valueEntryContainer.childNodes[k]);
            }
        }
        
        Element.show(this.valueEntryContainer);
        
        if (this.actionSelector.form.elements.namedItem(this.actionSelector.value))
        {
            Element.show(this.form.elements.namedItem(this.actionSelector.value));
            this.form.elements.namedItem(this.actionSelector.value).focus();
        }    
        else if (this.handlerMenu.down('.' + this.actionSelector.value))
        {
			var el = document.getElementsByClassName(this.actionSelector.value, this.handlerMenu)[0];
			Element.show(el);
		}
    },
    
    submit: function()
    {
        if ('delete' == this.actionSelector.value)
        {
			if (!confirm(this.deleteConfirmMessage))
			{
				return false;
			}
		}
		
		this.form.elements.namedItem('filters').value = Object.toJSON(this.grid.getFilters());
        var selectedIDs = Object.toJSON(this.grid.getSelectedIDs());
        this.form.elements.namedItem('selectedIDs').value = selectedIDs ? selectedIDs : '';
        this.form.elements.namedItem('isInverse').value = this.grid.isInverseSelection() ? 1 : 0;
        console.info(this.form.elements.namedItem('filters'))
        new LiveCart.AjaxRequest(this.form, document.getElementsByClassName('progressIndicator', this.handlerMenu)[0], this.submitCompleted.bind(this));

        this.grid.resetSelection();   
    },
    
    submitCompleted: function()
    {
        this.grid.reloadGrid();   
    }
}


Backend.CustomerOrder.Editor = Class.create();
Backend.CustomerOrder.Editor.prototype = 
{
    Links: {},
    Messages: {},
    Instances: {},
    CurrentId: null,
    
    getCurrentId: function()
    {
        return Backend.CustomerOrder.Editor.prototype.CurrentId;
    },

    setCurrentId: function(id)
    {
        Backend.CustomerOrder.Editor.prototype.CurrentId = id;
    },

    craftTabUrl: function(url)
    {
        return url.replace(/_id_/, Backend.CustomerOrder.Editor.prototype.getCurrentId());
    },

    craftContentId: function(tabId)
    {
        // Remove empty shippments
        if(tabId != 'tabOrderProducts')
        {
            var productsContainer = $("tabOrderProducts_" + Backend.CustomerOrder.Editor.prototype.getCurrentId() + "Content");
            if(productsContainer && productsContainer.style.display != 'none')
            {
                if(!Backend.CustomerOrder.Editor.prototype.getInstance(Backend.CustomerOrder.Editor.prototype.getCurrentId()).removeEmptyShipmentsConfirmation())
                {
                    TabControl.prototype.getInstance("orderManagerContainer", false).activateTab($("tabOrderProducts"));
                    return false;
                }
            }
        }
        
        return tabId + '_' +  Backend.CustomerOrder.Editor.prototype.getCurrentId() + 'Content'
    },

    getInstance: function(id, doInit)
    {
		if(!Backend.CustomerOrder.Editor.prototype.Instances[id])
        {
            Backend.CustomerOrder.Editor.prototype.Instances[id] = new Backend.CustomerOrder.Editor(id);
        }

        if(doInit !== false) Backend.CustomerOrder.Editor.prototype.Instances[id].init();
        
        return Backend.CustomerOrder.Editor.prototype.Instances[id];
    },
    
    
    
    hasInstance: function(id)
    {
        return this.Instances[id] ? true : false;
    },
    
    initialize: function(id)
  	{
        try
        {
            this.id = id ? id : '';
    
            this.findUsedNodes();
            this.bindEvents();
            
            Form.State.backup(this.nodes.form);
        }
        catch(e)
        {
            console.info(e);
        }

	},

	findUsedNodes: function()
    {
        this.nodes = {};
        this.nodes.parent = $("tabOrderInfo_" + this.id + "Content");
        this.nodes.form = this.nodes.parent.down("form");
		this.nodes.isCanceled = this.nodes.form.down('a.isCanceled');
		this.nodes.status = this.nodes.form.down('select.status');
    },

    bindEvents: function(args)
    {
		Event.observe(this.nodes.isCanceled, 'click', function(e) { Event.stop(e); this.switchCancelled(); }.bind(this));
		Event.observe(this.nodes.status, 'change', function(e) { Event.stop(e); this.submitForm(); }.bind(this));
    },

    switchCancelled: function()
    {
        new LiveCart.AjaxRequest(
            Backend.CustomerOrder.Editor.prototype.Links.switchCancelled + '/' + this.id, 
            false,
            function(response) {
	            response = eval("(" + response.responseText + ")");
                
	            if(response.status == 'success')
	            {
	                this.nodes.isCanceled.update(response.value);
	            }
	        }.bind(this)
        );
    },
    
    updateStatus: function()
    {
        this.form.submit();
    },

    init: function(args)
    {	
		Backend.CustomerOrder.Editor.prototype.setCurrentId(this.id);
        var orderIndicator = $('orderIndicator_' + this.id);
        if(orderIndicator) 
        {
            orderIndicator.style.visibility = 'hidden';
        }
        Backend.showContainer("orderManagerContainer");

        this.tabControl = TabControl.prototype.getInstance("orderManagerContainer", false);
    },
    
    cancelForm: function()
    {      
        ActiveForm.prototype.resetErrorMessages(this.nodes.form);
		Form.restore(this.nodes.form);
    },
    
    submitForm: function()
    {
		new LiveCart.AjaxRequest(
            this.nodes.form,
            false,
            function(responseJSON) 
            {
				ActiveForm.prototype.resetErrorMessages(this.nodes.form);
				var responseObject = eval("(" + responseJSON.responseText + ")");
				this.afterSubmitForm(responseObject);
		    }.bind(this)
        );
    },
	
	afterSubmitForm: function(response)
	{
		if(response.status == 'success')
		{
			Form.State.backup(this.nodes.form);
		}
		else
		{
			ActiveForm.prototype.setErrorMessages(this.nodes.form, response.errors)
		}
	},
    
    removeEmptyShipmentsFromHTML: function()
    {
        new LiveCart.AjaxRequest(Backend.Shipment.Links.removeEmptyShipments + "/" + this.id);
        
        var container = $("tabOrderProducts_" + this.id + "Content").down('.orderShipments');
        document.getElementsByClassName('orderShipmentsItem', container).each(function(itemList)
        {
             if(!itemList.down('li'))
             {
                 Element.remove(itemList.up('.orderShipment'));
             }
        });
        
    },
    
    
    hasEmptyShipments: function()
    {
        var container = $("tabOrderProducts_" + this.id + "Content").down('.orderShipments');;
        var hasEmptyShipments = false;
        document.getElementsByClassName('orderShipmentsItem', container).each(function(itemList)
        {
             if(!itemList.down('li'))
             {
                 hasEmptyShipments = true;
                 return $break;
             }
        })
        
        return hasEmptyShipments;
    },
    
    removeEmptyShipmentsConfirmation: function()
    {
        if(!Backend.Shipment.removeEmptyShipmentsConfirmationLastCallTime) Backend.Shipment.removeEmptyShipmentsConfirmationLastCallTime = 0;
    
        var container = null;
        if($("tabOrderProducts_" + this.id + "Content"))
        {
            container = $("tabOrderProducts_" + this.id + "Content").down('.orderShipments');;
        }
           
        if($("orderManagerContainer").style.display == 'none' || !container || (container.style.display == 'none'))
        {
            Backend.Shipment.removeEmptyShipmentsConfirmationLastCallTime = (new Date()).getTime();
            return true;   
        }
        else
        {
            if(!this.hasEmptyShipments()) 
            {
                Backend.Shipment.removeEmptyShipmentsConfirmationLastCallTime = (new Date()).getTime();
                this.removeEmptyShipmentsFromHTML();
                return true;
            }  
            
            // Confirm can be called few times in a row. To prevent multiple dialogs
            // rember user last decision
            if((new Date()).getTime() - Backend.Shipment.removeEmptyShipmentsConfirmationLastCallTime < 100)
            {
                return Backend.Shipment.removeEmptyShipmentsConfirmationLastUserDecision;
            }
            
            if(confirm(Backend.Shipment.Messages.emptyShipmentsWillBeRemoved))
            {
                Backend.Shipment.removeEmptyShipmentsConfirmationLastUserDecision = true;
                Backend.Shipment.removeEmptyShipmentsConfirmationLastCallTime = (new Date()).getTime();
                
                this.removeEmptyShipmentsFromHTML();
                
                return true;   
            }   
            else
            {
                Backend.Shipment.removeEmptyShipmentsConfirmationLastUserDecision = false;
                Backend.Shipment.removeEmptyShipmentsConfirmationLastCallTime = (new Date()).getTime();
                return false;
            }
        }
    }
}


Backend.CustomerOrder.Address = Class.create();
Backend.CustomerOrder.Address.prototype = 
{
    Links: {},
    Messages: {},
    Instances: {},
    
    getCurrentId: function()
    {
        return Backend.CustomerOrder.Address.prototype.CurrentId;
    },

    setCurrentId: function(id)
    {
        Backend.CustomerOrder.Address.prototype.CurrentId = id;
    },

    getInstance: function(root, doInit)
    {
		if(!Backend.CustomerOrder.Address.prototype.Instances[root.id])
        {
            Backend.CustomerOrder.Address.prototype.Instances[root.id] = new Backend.CustomerOrder.Address(root);
        }

        if(doInit !== false) Backend.CustomerOrder.Address.prototype.Instances[root.id].init();
        
        return Backend.CustomerOrder.Address.prototype.Instances[root.id];
    },

    hasInstance: function(root)
    {
        return this.Instances[root.id] ? true : false;
    },
    
    initialize: function(root)
  	{
        try
        {
            this.findUsedNodes(root);
            this.bindEvents();

            this.stateSwitcher = new Backend.User.StateSwitcher(
                this.nodes.form.elements.namedItem('countryID'), 
                this.nodes.form.elements.namedItem('stateID'), 
                this.nodes.form.elements.namedItem('stateName'),
                Backend.CustomerOrder.Editor.prototype.Links.states
            );
      
            Form.State.backup(this.nodes.form);
            this.stateID = this.nodes.form.elements.namedItem('stateID').value;
        }
        catch(e)
        {
            console.info(e);
        }

	},
    
	findUsedNodes: function(root)
    {
        this.nodes = {};
        this.nodes.parent = root;
        this.nodes.form = root;
		this.nodes.cancel = this.nodes.form.down('a.cancel');
		this.nodes.submit = this.nodes.form.down('input.submit');
    },

    bindEvents: function(args)
    {
		Event.observe(this.nodes.cancel, 'click', function(e) { Event.stop(e); this.cancelForm()}.bind(this));
        Event.observe(this.nodes.form.elements.namedItem('existingUserAddress'), 'change', function(e) { this.useExistingAddress()}.bind(this));
    },
    
    useExistingAddress: function()
    {
        if(this.nodes.form.elements.namedItem('existingUserAddress').value)
        {
            var address = Backend.CustomerOrder.Editor.prototype.existingUserAddresses[this.nodes.form.elements.namedItem('existingUserAddress').value];
    
            this.nodes.form.elements.namedItem('firstName').value = address.UserAddress.address1;
            this.nodes.form.elements.namedItem('lastName').value = address.UserAddress.firstName;
            this.nodes.form.elements.namedItem('countryID').value = address.UserAddress.countryID;
            
            if(address.UserAddress.stateID)
            {
                this.nodes.form.elements.namedItem('stateID').value = address.UserAddress.stateID;
            }
            else
            {
                this.nodes.form.elements.namedItem('stateName').value = address.UserAddress.stateName;
            }
            
            this.nodes.form.elements.namedItem('city').value = address.UserAddress.city;
            this.nodes.form.elements.namedItem('address1').value = address.UserAddress.address1;
            this.nodes.form.elements.namedItem('address2').value = address.UserAddress.address2;
            this.nodes.form.elements.namedItem('postalCode').value = address.UserAddress.postalCode;
            this.nodes.form.elements.namedItem('phone').value = address.UserAddress.phone;
            
            this.stateSwitcher.updateStates(null, function(){ this.nodes.form.elements.namedItem('stateID').value = address.UserAddress.stateID; }.bind(this));
        }
    },

    init: function(args)
    {	
		Backend.CustomerOrder.Address.prototype.setCurrentId(this.id);
        var orderIndicator = $('orderIndicator_' + this.id);
        if(orderIndicator) 
        {
            orderIndicator.style.visibility = 'hidden';
        }
        
        this.tabControl = TabControl.prototype.getInstance("orderManagerContainer", false);
    },
    
    cancelForm: function()
    {
        var $this = this;
        
        ActiveForm.prototype.resetErrorMessages(this.nodes.form);
		Form.State.restore(this.nodes.form, ['existingUserAddress']);
        this.stateSwitcher.updateStates(null, function(){ $this.nodes.form.elements.namedItem('stateID').value = $this.stateID; });
    },

    submitForm: function()
    {
		new LiveCart.AjaxRequest(
            this.nodes.form,
    		false,
            function(responseJSON) 
            {
                ActiveForm.prototype.resetErrorMessages(this.nodes.form);
                var responseObject = eval("(" + responseJSON.responseText + ")");
                this.afterSubmitForm(responseObject);
            }.bind(this)
		);
    },

	afterSubmitForm: function(response)
	{
		if(response.status == 'success')
		{
			new Backend.SaveConfirmationMessage($('orderConfirmation'));
            this.stateID = this.nodes.form.elements.namedItem('stateID').value;
			Form.State.backup(this.nodes.form);
		}
		else
		{
			ActiveForm.prototype.setErrorMessages(this.nodes.form, response.errors)
		}
	}
}