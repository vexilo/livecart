Backend.StaticPage = Class.create();

Backend.StaticPage.prototype = 
{
  	treeBrowser: null,
  	
  	urls: new Array(),
	  
	initialize: function(pages)
	{
		this.treeBrowser = new dhtmlXTreeObject("pageBrowser","","", false);
		
		this.treeBrowser.def_img_x = 'auto';
		this.treeBrowser.def_img_y = 'auto';
				
		this.treeBrowser.setImagePath("image/backend/dhtmlxtree/");
		this.treeBrowser.setOnClickHandler(this.activateCategory.bind(this));

		this.treeBrowser.showFeedback = 
			function(itemId) 
			{
				if (!this.iconUrls)
				{
					this.iconUrls = new Object();	
				}
				
				this.iconUrls[itemId] = this.getItemImage(itemId, 0, 0);
				this.setItemImage(itemId, '../../../image/indicator.gif');
			}
		
		this.treeBrowser.hideFeedback = 
			function()
			{
				for (var itemId in this.iconUrls)
				{
					this.setItemImage(itemId, this.iconUrls[itemId]);	
				}				
			}
		
    	this.insertTreeBranch(pages, 0);    
	},
	
	showAddForm: function()
	{
		new LiveCart.AjaxUpdater(this.urls['add'], $('pageContent'), $('settingsIndicator'), null, this.initForm.bind(this));			
	},
	
	initForm: function()
	{
		tinyMCE.idCounter = 0;
        ActiveForm.prototype.initTinyMceFields($('editContainer'));
	},
	
	insertTreeBranch: function(treeBranch, rootId)
	{
		for (k in treeBranch)
		{
		  	if('function' != typeof treeBranch[k])
		  	{
				this.treeBrowser.insertNewItem(rootId, k, treeBranch[k], null, 0, 0, 0, '', 1);
				this.treeBrowser.showItemSign(k, 0);
			}
		}  	
	},
	
	save: function(form)
	{
		new LiveCart.AjaxRequest(form, $('saveIndicator'), this.saveCompleted.bind(this));	
	},
	
	saveCompleted: function(originalRequest)
	{
		var r = originalRequest.responseText;
		
		eval('var item = ' + originalRequest.responseText);
		
		if (!this.treeBrowser.getItemText(item.id))
		{
			this.treeBrowser.insertNewItem(0, item.id, item.title, null, 0, 0, 0, '', 1);
			this.treeBrowser.selectItem(item.id, true);
		}
		else
		{
			this.treeBrowser.setItemText(item.id, item.title);
		}
		
		new Backend.SaveConfirmationMessage(document.getElementsByClassName('yellowMessage')[0]);		
	},	
	
	activateCategory: function(id)
	{
		if (!this.treeBrowser.hasChildren(id))
		{
			this.treeBrowser.showFeedback(id);
			var url = this.urls['edit'].replace('_id_', id);
			var upd = new LiveCart.AjaxUpdater(url, 'pageContent', 'settingsIndicator');
			upd.onComplete = this.displayPage.bind(this);
		}
	},

	displayPage: function(response)
	{
		this.treeBrowser.hideFeedback();
		this.initForm();	
		var cancel = document.getElementsByClassName('cancel', $('pageContent'))[0];
		Event.observe(cancel, 'click', this.resetForm.bindAsEventListener(this));
	},
	
	deleteSelected: function()
	{
		var id = this.treeBrowser.getSelectedItemId();
		var url = this.urls['delete'].replace('_id_', id);
		new Ajax.Request(url, {onComplete: this.deleteCompleted.bind(this)});	
		this.treeBrowser.showFeedback(id);		
	},
	
	deleteCompleted: function(originalRequest)
	{
		eval('var id = ' + originalRequest.responseText);
		
		if (id != 0)
		{
			this.treeBrowser.deleteItem(id, true);
			new LiveCart.AjaxUpdater(this.urls['empty'], 'pageContent', 'settingsIndicator');
		}
	},
	
	moveUp: function()
	{
		var id = this.treeBrowser.getSelectedItemId();
		var url = this.urls['moveup'].replace('_id_', id);
		new Ajax.Request(url, {onComplete: this.moveCompleted.bind(this)});
		this.treeBrowser.showFeedback(id);
	},

	moveDown: function()
	{
		var id = this.treeBrowser.getSelectedItemId();
		var url = this.urls['movedown'].replace('_id_', id);
		new Ajax.Request(url, {onComplete: this.moveCompleted.bind(this)});
		this.treeBrowser.showFeedback(id);
	},
		
	moveCompleted: function(originalRequest)
	{
		eval('var result = ' + originalRequest.responseText);
		this.treeBrowser.hideFeedback();	
		
		if (result)
		{
			var direction = ('up' == result.order) ? 'up_strict' : 'down_strict';
			this.treeBrowser.moveItem(result.id, direction);				
		}
	}

	/*
	
	resetForm: function(e)
	{
		var el = Event.element(e);
		while (el.tagName != 'FORM')
		{
			el = el.parentNode;
		}
		
		el.reset();		
	},
	*/
}