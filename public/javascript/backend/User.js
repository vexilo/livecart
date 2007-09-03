Backend.User = {};

Backend.UserGroup = Class.create();
Backend.UserGroup.prototype = 
{
  	Links: {},
    Messages: {},
    
    treeBrowser: null,
  	
  	urls: new Array(),
	  
	initialize: function(groups)
	{
        var self = this;      
        
		Backend.UserGroup.prototype.treeBrowser = new dhtmlXTreeObject("userGroupsBrowser","","", false);
        Backend.Breadcrumb.setTree(Backend.UserGroup.prototype.treeBrowser);
		
		Backend.UserGroup.prototype.treeBrowser.setOnClickHandler(this.activateGroup);
		
		Backend.UserGroup.prototype.treeBrowser.def_img_x = 'auto';
		Backend.UserGroup.prototype.treeBrowser.def_img_y = 'auto';
				
		Backend.UserGroup.prototype.treeBrowser.setImagePath("image/backend/dhtmlxtree/");
		Backend.UserGroup.prototype.treeBrowser.setOnClickHandler(this.activateGroup.bind(this));
       
		Backend.UserGroup.prototype.treeBrowser.showFeedback = 
			function(itemId) 
			{
				if (!this.iconUrls)
				{
					this.iconUrls = new Object();	
				}
				
				this.iconUrls[itemId] = this.getItemImage(itemId, 0, 0);
				this.setItemImage(itemId, '../../../image/indicator.gif');
			}
		
		Backend.UserGroup.prototype.treeBrowser.hideFeedback = 
			function()
			{
				for (var itemId in this.iconUrls)
				{
					this.setItemImage(itemId, this.iconUrls[itemId]);	
				}				
			}
		
    	this.insertTreeBranch(groups, 0); 
        
        var id = -2
        var match = null;
        if(!(match = Backend.ajaxNav.getHash().match(/group_(-?\d+)#\w+/))) 
        {
            window.location.hash = '#group_' + id + '#tabUsers__';
        }
        else
        {
            id = match[1];
        }
        
	    self.tabControl = TabControl.prototype.getInstance('userGroupsManagerContainer', self.craftTabUrl, self.craftContainerId, {}); 
        $("activeUserPath").innerHTML = this.treeBrowser.getItemText(id);
        
        this.bindEvents();
	},

    bindEvents: function()
    {        
        var self = this;
    
        if($("userGroups_add"))
        {
            Event.observe($("userGroups_add"), "click", function(e) {
                Event.stop(e);
                self.createNewGroup(); 
            });
        }
        
        if($("userGroups_delete"))
        {
            Event.observe($("userGroups_delete"), "click", function(e) {
                Event.stop(e);
                self.deleteGroup();
            });
        }
    },
    
    deleteGroup: function()
    {
        var $this = this;
        
        if(Backend.UserGroup.prototype.activeGroup < 0)
        {
             return alert(Backend.UserGroup.prototype.Messages.youCanntoDeleteThisGroup)
        }
        
        if (confirm(Backend.UserGroup.prototype.Messages.confirmUserGroupRemove)) 
        {
		    new LiveCart.AjaxRequest(
    			Backend.User.Group.prototype.Links.removeNewGroup + '/' + Backend.UserGroup.prototype.activeGroup,
    			false,
                function(response) 
                { 
                    response = eval("(" + response.responseText + ")");
                    if('success' == response.status)
                    {
                        Backend.UserGroup.prototype.treeBrowser.deleteItem(response.userGroup.ID, true);
                        var firstId = parseInt(Backend.UserGroup.prototype.treeBrowser._globalIdStorage[1]);
                        if(firstId)
                        {
                            Backend.UserGroup.prototype.treeBrowser.selectItem(firstId, true);
                        }
                    }
                }
            );
        }
    },

	createNewGroup: function()
	{
		new LiveCart.AjaxRequest(
            Backend.User.Group.prototype.Links.createNewUserGroup,
            false,
            function(response) 
            { 
                this.afterGroupAdded(response, this)
            }.bind(this)
		);
	},
    
	afterGroupAdded: function(response, self)
	{
        var newGroup = eval('(' + response.responseText + ')');
        self.treeBrowser.insertNewItem(-2, newGroup.ID, newGroup.name, 0, 0, 0, 0, 'SELECT');

        self.activateGroup(newGroup.ID);
        Backend.ajaxNav.add('group_' + newGroup.ID + '#tabUserGroup');
	},
    craftTabUrl: function(url)
    {
        return url.replace(/_id_/, Backend.UserGroup.prototype.treeBrowser.getSelectedItemId());
    },

    craftContainerId: function(tabId)
    {
        return tabId + '_' +  Backend.UserGroup.prototype.treeBrowser.getSelectedItemId() + 'Content';
    },
	
	insertTreeBranch: function(treeBranch, rootId)
	{
		var self = this;
        
            
        $A(treeBranch).each(function(node)
		{
            Backend.UserGroup.prototype.treeBrowser.insertNewItem(node.rootID, node.ID, node.name, null, 0, 0, 0, '', 1);
            self.treeBrowser.showItemSign(node.ID, 0);
            var group = document.getElementsByClassName("standartTreeRow", $("userGroupsBrowser")).last();
            group.id = 'group_' + node.ID;
            group.onclick = function()
            {
                Backend.UserGroup.prototype.treeBrowser.selectItem(node.ID, true);
            }
		});
	},
	
	activateGroup: function(id)
	{
        
        $$('.newUserForm').each(function(newForm)
        {
			if($('newUserForm_' + Backend.UserGroup.prototype.activeGroup))
			{
			    Backend.User.Add.prototype.getInstance(Backend.UserGroup.prototype.activeGroup).hideAddForm(); 
			}
        });
		
        var activateTab = $('tabUsers');
        if(id < 0)
        {
            $("tabUserGroup").hide();
            $("tabRoles").hide();
        }
        else
        {
            $("tabUserGroup").show();
            $("tabRoles").show();
        }
        
        if(id <= 0)
        {
            $("userGroups_delete").parentNode.hide();
        }
        else
        {
            $("userGroups_delete").parentNode.show();  
        }
        
        if(Backend.UserGroup.prototype.activeGroup && Backend.UserGroup.prototype.activeGroup != id)
        {
            Backend.UserGroup.prototype.activeGroup = id;
    		Backend.UserGroup.prototype.treeBrowser.showFeedback(id);
            
            Backend.ajaxNav.add('group_' + id);
            
            this.tabControl.activateTab(activateTab, function() { 
                Backend.UserGroup.prototype.treeBrowser.hideFeedback(id);
            });
            
            Backend.showContainer("userGroupsManagerContainer");
            
            $("activeUserPath").innerHTML = this.treeBrowser.getItemText(id);
        }
        
        Backend.UserGroup.prototype.activeGroup = id;
	},
	
	displayCategory: function(response)
	{
		Backend.UserGroup.prototype.treeBrowser.hideFeedback();	
		var cancel = document.getElementsByClassName('cancel', $('userGroupsContent'))[0];
		Event.observe(cancel, 'click', this.resetForm.bindAsEventListener(this));
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
    
    
    openUser: function(id, e) 
    {
        Event.stop(e);
        
		if(!e.target)
		{
            e.target = e.srcElement
		}

        var userIndicator = e.target.up('td').down('.progressIndicator');
        Backend.User.Editor.prototype.setCurrentId(id);
        
        userIndicator.style.visibility = 'visible';
        
    	var tabControl = TabControl.prototype.getInstance(
            'userManagerContainer',
            Backend.User.Editor.prototype.craftTabUrl, 
            Backend.User.Editor.prototype.craftContentId
        ); 
        
        tabControl.activateTab();
        
        if(Backend.User.Editor.prototype.hasInstance(id)) 
    	{
    		Backend.User.Editor.prototype.getInstance(id);			
    	}	
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
		var cont = $('productCount_' + categoryID);
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
    }
}




Backend.UserGroup.GridFormatter = 
{
	getClassName: function(field, value)
	{
		
	},
	
	formatValue: function(field, value, id)
	{
		if ('User.email' == field && Backend.UserGroup.prototype.usersMiscPermision)
		{
		    value = '<span>' + 
                    '<span class="progressIndicator userIndicator" id="userIndicator_' + id + '" style="visibility: hidden;">' + 
                    '</span>' + 
                '</span>' + 
                '<a href="#edit" id="user_' + id + '" onclick="Backend.UserGroup.prototype.openUser(' + id + ', event); return false;">' + 
                     value + 
                '</a>';	
		}
        else if('User.email' == field && window.opener)
        {
		    value = '<a href="#edit" onclick="window.opener.Backend.CustomerOrder.prototype.customerPopup.getSelectedObject(' + id + '); return false;">' + value + '</a>';	
                // asdasd'
        }
        
        if(value == '-')
        {
            value = "<center>" + value + "</center>";   
        }
		
		
		return value;
	}
}



Backend.UserGroup.massActionHandler = Class.create();
Backend.UserGroup.massActionHandler.prototype = 
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
		
        var filters = Object.toJSON(this.grid.getFilters());
		this.form.elements.namedItem('filters').value = filters ? filters : '';
        var selectedIDs = Object.toJSON(this.grid.getSelectedIDs());
        this.form.elements.namedItem('selectedIDs').value = selectedIDs ? selectedIDs : '';
        this.form.elements.namedItem('isInverse').value = this.grid.isInverseSelection() ? 1 : 0;
        new LiveCart.AjaxRequest(this.form, document.getElementsByClassName('progressIndicator', this.handlerMenu)[0], this.submitCompleted.bind(this));

        this.grid.resetSelection();   
    },
    
    submitCompleted: function()
    {
        this.grid.reloadGrid();   
    }
}


Backend.User.Group = Class.create();
Backend.User.Group.prototype = 
{
    Links: {},
    Messages: {},
    Instances: {},
    
    initialize: function(root) 
    {
        this.findNodes(root);
        this.bindEvents();
    },
    
    getInstance: function(root) 
    {
        if(!Backend.User.Group.prototype.Instances[$(root).id])
        {
            Backend.User.Group.prototype.Instances[$(root).id] = new Backend.User.Group(root);
        }
        
        return Backend.User.Group.prototype.Instances[$(root).id];
    },
    
    findNodes: function(root)
    {
        this.nodes = {};
        this.nodes.root = $(root);
        this.nodes.form = this.nodes.root.tagName == 'FORM' ? this.nodes.root : this.nodes.root.down('form');


        this.nodes.name = $(this.nodes.form).elements.namedItem('name');
        this.nodes.description = $(this.nodes.form).elements.namedItem('description');
        this.nodes.ID = $(this.nodes.form).elements.namedItem('ID');
    },
        
    bindEvents: function()
    {
        var self = this;
        
    },
    
    save: function() 
    {   
        this.nodes.form.action = Backend.User.Group.prototype.Links.save + "/" + this.nodes.ID.value
        var request = new LiveCart.AjaxRequest(
           this.nodes.form,
           false,
           function(response)
           {
               response = eval("(" + response.responseText + ")");
               this.afterSave(response);
           }.bind(this)
        );
    
        this.saving = false;
    },
    
    afterSave: function(response)
    {
        if(response.status == 'success')
        {
            new Backend.SaveConfirmationMessage($('groupConfirmation'));
            Backend.UserGroup.prototype.treeBrowser.setItemText(Backend.UserGroup.prototype.activeGroup, this.nodes.name.value);
        }
        else
        {
            ActiveForm.prototype.serErrorMessages(this.nodes.form, response.errors);
        }
    }
}



Backend.User.Editor = Class.create();
Backend.User.Editor.prototype = 
{
    Links: {},
    Messages: {},
    Instances: {},
    CurrentId: null,
    
    getCurrentId: function()
    {
        return Backend.User.Editor.prototype.CurrentId;
    },

    setCurrentId: function(id)
    {
        Backend.User.Editor.prototype.CurrentId = id;
    },

    craftTabUrl: function(url)
    {
        return url.replace(/_id_/, Backend.User.Editor.prototype.getCurrentId());
    },

    craftContentId: function(tabId)
    {
        return tabId + '_' +  Backend.User.Editor.prototype.getCurrentId() + 'Content'
    },

    getInstance: function(id, doInit)
    {
		if(!Backend.User.Editor.prototype.Instances[id])
        {
            Backend.User.Editor.prototype.Instances[id] = new Backend.User.Editor(id);
        }

        if(doInit !== false) Backend.User.Editor.prototype.Instances[id].init();
        
        return Backend.User.Editor.prototype.Instances[id];
    },
   
	showAddForm: function(groupID)
	{
        console.info('add form');
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
            
            if(this.nodes.sameAddress.checked) this.nodes.shippingAddress.hide();
            else this.nodes.shippingAddress.show();
            
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
        this.nodes.parent = $("tabUserInfo_" + this.id + "Content");
        this.nodes.form = this.nodes.parent.down("form");
		this.nodes.cancel = this.nodes.form.down('a.cancel');
		this.nodes.submit = this.nodes.form.down('input.submit');
		
		this.nodes.sameAddress = $("user_" + this.id +"_sameAddresses");
        this.nodes.shippingAddress = $("user_" + this.id +"_shippingAddress"); 
        this.nodes.billingAddress = $("user_" + this.id +"_billingAddress");
    },

    bindEvents: function(args)
    {
		var self = this;
		Event.observe(this.nodes.cancel, 'click', function(e) { Event.stop(e); self.cancelForm()});
        Event.observe(this.nodes.sameAddress, "click", function(e) {  
            Backend.User.Editor.prototype.showShippingAddress(this.nodes.sameAddress, this.nodes.shippingAddress, this.nodes.billingAddress);
		}.bind(this));
		
        

    },

    init: function(args)
    {	
		Backend.User.Editor.prototype.setCurrentId(this.id);
        var userIndicator = $('userIndicator_' + this.id);
        document.getElementsByClassName('UserIndicator').each(function(span)
        {
           if('visible' == span.style.visibility)
           {
               span.style.visibility = 'hidden';
               throw $break;
           }
        });
        
        if(userIndicator) 
        {
            userIndicator.style.visibility = 'hidden';
        }
        Backend.showContainer('userManagerContainer');

        this.tabControl = TabControl.prototype.getInstance("userManagerContainer", false);
    }, 

    cancelForm: function()
    {      
        ActiveForm.prototype.resetErrorMessages(this.nodes.form);
		Form.restore(this.nodes.form);
    },
    
    submitForm: function()
    {        
	    Backend.User.Editor.prototype.cloneBillingFormValues(this.nodes.sameAddress, this.nodes.shippingAddress, this.nodes.billingAddress);
		
        this.nodes.form.action = Backend.User.Editor.prototype.Links.update + "/" + this.id;
		new LiveCart.AjaxRequest(
            this.nodes.form,
            false,
            function(responseJSON) {
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
	
    showShippingAddress: function(checkbox, shippingAddress, billingAddress) {
        if(checkbox.checked) shippingAddress.hide(); 
        else shippingAddress.show();
    },
    
    cloneBillingFormValues: function(checkbox, shippingAddress, billingAddress) {        
        if(checkbox.checked)
        {
            $A(['input', 'select', 'textarea']).each(function(field) 
            {
                $A($(shippingAddress).getElementsByTagName(field)).each(function(input) 
                {
                    if(input.id)
                    {
                        var prototypeInput = $(input.id.replace(/shippingAddress/, "billingAddress"));
                        
                        // Select fields
                        if(input.options)
                        {
                            input.options.length = 0;
                            $A(prototypeInput.options).each(function(option) {
                                input.options[input.options.length] = new Option(option.text, option.value);
                            }.bind(this));
                            input.selectedIndex = prototypeInput.selectedIndex;
                            input.style.display = prototypeInput.style.display;
                        }
                        
                        input.style.display = prototypeInput.style.display;
                        input.value = prototypeInput.value;
                    }
                }.bind(this));
            }.bind(this));
        }
    }
}





Backend.User.Add = Class.create();
Backend.User.Add.prototype = 
{
    Instances: {},
    
    getInstance: function(groupID, grid)
    {
		if(!Backend.User.Add.prototype.Instances[groupID])
        {
            Backend.User.Add.prototype.Instances[groupID] = new Backend.User.Add(groupID, grid);
        }
        
        return Backend.User.Add.prototype.Instances[groupID];
    },
    
    initialize: function(groupID, grid)
  	{
        try
        {
            this.groupID = groupID;
            
            this.findUsedNodes();
            this.bindEvents();
            
            if(this.nodes.sameAddress.checked) this.nodes.shippingAddress.hide();
            else this.nodes.shippingAddress.show();
            
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
        this.nodes.parent = $("newUserForm_" + this.groupID);
        this.nodes.form = this.nodes.parent.down("form");
		this.nodes.cancel = this.nodes.form.down('a.cancel');
		this.nodes.submit = this.nodes.form.down('input.submit');
        
        this.nodes.menuShowLink = $("userGroup_" + this.groupID + "_addUser");
        this.nodes.menu = $("userGroup_" + this.groupID + "_addUser_menu");
        this.nodes.menuCancelLink = $("userGroup_" + this.groupID + "_addUserCancel");
        this.nodes.menuForm = this.nodes.parent;
		
        this.nodes.sameAddress = $("user_0_sameAddresses");
        this.nodes.shippingAddress = $("user_0_shippingAddress");
        this.nodes.billingAddress = $("user_0_billingAddress");
    },
   
	showAddForm: function()
	{
        ActiveForm.prototype.hideMenuItems(this.nodes.menu, [this.nodes.menuCancelLink]);
        ActiveForm.prototype.showNewItemForm(this.nodes.menuShowLink, this.nodes.menuForm, false); 
		$("userGroupsManagerContainer").hide();
	},
   
	hideAddForm: function()
	{
        ActiveForm.prototype.hideMenuItems(this.nodes.menu, [this.nodes.menuShowLink]);
        ActiveForm.prototype.hideNewItemForm(this.nodes.menuShowLink, this.nodes.menuForm, false); 
		$("userGroupsManagerContainer").show();
	},

    bindEvents: function(args)
    {
		var self = this;
		Event.observe(this.nodes.cancel, 'click', function(e) { Event.stop(e); self.cancelForm()});
		Event.observe(this.nodes.submit, 'click', function(e) { Event.stop(e); self.submitForm()});
        Event.observe(this.nodes.menuCancelLink, 'click', function(e) { Event.stop(e); self.cancelForm();});
		
        Event.observe("user_0_sameAddresses", "click", function(e) { this.showShippingAddress() }.bind(this));
    },
	
	showShippingAddress: function() {
        Backend.User.Editor.prototype.showShippingAddress(this.nodes.sameAddress, this.nodes.shippingAddress, this.nodes.billingAddress);
	},

    cancelForm: function()
    {      
        ActiveForm.prototype.resetErrorMessages(this.nodes.form);
		Form.restore(this.nodes.form);
        this.hideAddForm();
    },
    
    submitForm: function()
    {
        if (!validateForm(this.nodes.form)) 
        { 
            return false; 
        } 
		
        Backend.User.Editor.prototype.cloneBillingFormValues(this.nodes.sameAddress, this.nodes.shippingAddress, this.nodes.billingAddress);
        
        this.nodes.form.action = Backend.User.Editor.prototype.Links.create;
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
            window.usersActiveGrid[this.groupID].reloadGrid();
            Form.State.restore(this.nodes.form);
            this.hideAddForm();
        }
        else
        {
        	ActiveForm.prototype.setErrorMessages(this.nodes.form, response.errors)
        }
	}
}


Backend.User.StateSwitcher = Class.create();
Backend.User.StateSwitcher.prototype = 
{
    countrySelector: null, 
    stateSelector: null, 
    stateTextInput: null,
    url: '',
    
    initialize: function(countrySelector, stateSelector, stateTextInput, url)
    {
        this.countrySelector = countrySelector;
        this.stateSelector = stateSelector;
        this.stateTextInput = stateTextInput;        
        this.url = url;
        
        if (this.stateSelector.length > 0)
        {
            Element.show(this.stateSelector);            
            Element.hide(this.stateTextInput);               
        }
        else
        {
            Element.hide(this.stateSelector);            
            Element.show(this.stateTextInput);  
        }

        Event.observe(countrySelector, 'change', this.updateStates.bind(this)); 
    },
    
    updateStates: function(e, onComplete)
    {
        var url = this.url + '/?country=' + this.countrySelector.value;
				
        var self = this;
        new LiveCart.AjaxRequest(
            url, 
        	false,
            function(response) 
            {
                var states = $H(eval('(' + response.responseText + ')'));
                
                self.updateStatesComplete(states, onComplete)
            }    
        );  
        
        var indicator = document.getElementsByClassName('progressIndicator', this.countrySelector.parentNode);
        if (indicator.length > 0)
        {
            this.indicator = indicator[0];
            Element.show(this.indicator);  
        }    
        
        this.stateSelector.length = 0;
        this.stateTextInput.value = '';    
    },
    
    updateStatesComplete: function(states, onComplete)
    {
        if (!states.size())
        {
            Element.hide(this.stateSelector);   
            Element.show(this.stateTextInput);               
            this.stateTextInput.focus();
			this.stateSelector.options.length = 0;
        }
        else
        {
            this.stateSelector.options[this.stateSelector.length] = new Option('', '', true);  
                
            states.each(function(state)
            {
                this.stateSelector.options[this.stateSelector.length] = new Option(state.value, state.key, false);  
            }.bind(this));
            Element.show(this.stateSelector);            
            Element.hide(this.stateTextInput);
			
			this.stateTextInput.value = ''
            
            this.stateSelector.focus();
        }

        if (this.indicator)
        {
            Element.hide(this.indicator);              
        }       
        
        if(onComplete)
        {
            onComplete();
        }
    }
}   