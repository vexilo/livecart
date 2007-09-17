Backend.ObjectImage = Class.create();

Backend.ObjectImage.prototype = 
{
	container: null,
	addForm: null,	
	addMenu: null,	
		
	ownerID: null,
	
	sortUrl: false,
	deleteUrl: false,
	editUrl: false,
	saveUrl: false,
				
	delConfirmMsg: '',
	editCaption: '',
	saveCaption: '',
	
	prefix: '',
	
	initialize: function(container, prefix)
	{	  
		this.container = container;
		this.container.handler = this;
		
		this.initActiveList();
		
		this.ownerID = ActiveList.prototype.getRecordId(container);
		this.prefix = prefix;
		
		this.addForm = $(this.prefix + 'ImgAdd_' + this.ownerID);
		this.addMenu = $(this.prefix + 'ImgMenu_' + this.ownerID);
	},
	
	initList: function(imageList)
	{             
        this.initActiveList();
		
		for (k = 0; k < imageList.length; k++)
		{
		  	this.addToList(imageList[k], false);
		}  
		                
        this.arrangeImages(); 
		this.activeList.touch(true);  
	},
    
    arrangeImages: function()
    {
        var images = this.container.getElementsByTagName('li');
        var mainP = this.container.getElementsByTagName('p')[0];
		var supplementalP = this.container.getElementsByTagName('p')[1];
                
    	var firstli = images[0];
    		
        if (firstli)
        {           
            // move first image under "Main Image"
            if (mainP.nextSibling == supplementalP)
            {
                firstli.parentNode.insertBefore(firstli, mainP.nextSibling);            
            }    
            
            while ('LI' == firstli.nextSibling.tagName)
            {
                firstli.parentNode.insertBefore(firstli.nextSibling, supplementalP.nextSibling);   
            }            
        }
        
        supplementalP.style.display = images.length < 2 ? 'none' : '';
        mainP.style.display = images.length == 0 ? 'none' : '';
    },    
        
	initActiveList: function()
	{
		// display message if no images are uploaded
		this.showNoImagesMessage();

		this.activeList = ActiveList.prototype.getInstance(this.container, {
	         
			 beforeEdit:     function(li) 
			 {
                 if (!this.isContainerEmpty(li, 'edit'))
                 {
                     this.toggleContainer(li, 'edit');
                     return;
                 }
                 
                 var recordId = this.getRecordId(li);	
				 var ownerId = this.getRecordId(li.parentNode);	
					
				 var handler = li.parentNode.handler;	
				
    			 var uploadForm = $(handler.prefix + 'ImgAdd_' + handler.ownerID).getElementsByTagName('form')[0];
    			 uploadForm.reset();
				 var form = uploadForm.cloneNode(true);    
                 ActiveForm.prototype.resetErrorMessages(form);
        				 
				 form.action = handler.saveUrl;
				 onsubm = function(e) {var form = Event.element(e); this.showProgressIndicator(form); }
				 form.onsubmit = onsubm.bindAsEventListener(handler);
				 
				 form.elements.namedItem('imageId').value = recordId;
				 
				 Element.addClassName(form.getElementsByTagName('fieldset')[0], 'container');
				 
				 form.getElementsByTagName('legend')[0].innerHTML = handler.editCaption;
				 
				 form.elements.namedItem('upload').value = handler.saveCaption;
				 
				 legends = form.getElementsByTagName('legend');
				 for (k = 0; k < legends.length; k++)
				 {
				 	expanderIcon = document.getElementsByClassName('expandIcon', legends[k]);
					if (expanderIcon.length > 0)
					{
  				    	expanderIcon[0].parentNode.removeChild(expanderIcon[0]);
					} 
				 }
				 
				 var imageData = document.getElementsByClassName('image', li)[0].imageData;
				 for (k in imageData)
				 {
					if (k.substr(0, 5) == 'title')
					{
					  	if (form.elements.namedItem(k))
					  	{
							if (!imageData[k])
							{
                                imageData[k] = '';
                            }
                            form.elements.namedItem(k).value = imageData[k];    
						}
					}   
				 }

                 var editCont = li.down('.activeList_editContainer');
				 editCont.innerHTML = '';
                 editCont.style.display = 'none';
                 editCont.appendChild(form);
				 
				 Event.observe(form.down('a'), "click", function(e) 
				 {
				     Event.stop(e);		
                     this.toggleContainerOff(e.target.up('li').down(".activeList_editContainer"));
				 }.bind(this));
				 
                 this.toggleContainerOn(editCont);

                 Backend.LanguageForm.prototype.closeTabs(form);                 
                 new Backend.LanguageForm();
			 },
	         
			 beforeSort:     function(li, order) 
			 { 
				 var recordId = this.getRecordId(li);	
				 var ownerId = this.getRecordId(li.parentNode);	
				 return li.parentNode.handler.sortUrl + '?ownerId=' + ownerId + '&draggedId=' + recordId + '&' + order 
			 },
	         
			 beforeDelete:   function(li)
	         {				 	
				 var recordId = this.getRecordId(li);	
				 li.handler = li.parentNode.handler;
                 if(confirm(li.parentNode.handler.delConfirmMsg)) 
				 {
					 return li.parentNode.handler.deleteUrl + '/' + recordId;
				 }
	         },
	         afterEdit:      function(li, response) {  },
	         afterSort:      function(li, response) { li.parentNode.handler.arrangeImages(); },
	         afterDelete:    function(li, response)  
			 { 
	             try 
	             { 
	                 response = eval('(' + response + ')'); 
	             } 
	             catch(e) 
	             { 
	                 return false; 
	             }
			            
                li.handler.updateTabCounters();
                                             
				li.handler.showNoImagesMessage();			   	
				
				li.handler.arrangeImages();		
			 }
	     },
         
         this.activeListMessages
         );
	},
	
	updateTabCounters: function()
	{
        if (this.container.hasClassName('prodImageList'))
        {
            var tabControl = TabControl.prototype.getInstance("productManagerContainer", false);
            tabControl.setCounter('tabProductImages', this.container.getElementsByTagName('li').length);
        }
        else
        {
            CategoryTabControl.prototype.resetTabItemsCount(this.ownerID);
        }        
    },
	
	showProgressIndicator: function(form)
	{
		var inst = document.getElementsByClassName('progressIndicator', form)[0];
		Element.show(inst);	
	},
	
	hideProgressIndicator: function(form)
	{
		var inst = document.getElementsByClassName('progressIndicator', form)[0];
		Element.hide(inst);	
	},

	showNoImagesMessage: function()
	{
		// display message if no images are uploaded
		document.getElementsByClassName('noRecords', this.container.parentNode)[0].style.display = (this.container.childNodes.length > 0) ? 'none' : 'block';	 	 
	},
	
	createEntry: function(imageData)
	{
		var templ = document.getElementsByClassName('imageTemplate', this.container.parentNode)[0].cloneNode(true);
	  		  	
	  	image = templ.getElementsByTagName('img')[0];
		image.src = imageData['paths'][1];
	  	
		if (imageData['title'])
		{
			document.getElementsByClassName('imageTitle', templ)[0].innerHTML = imageData['title'];		  
		}
		return templ;	  
	},
	
	addToList: function(imageData, highLight)
	{
		var templ = this.createEntry(imageData);
		var li = ActiveList.prototype.getInstance(this.container).addRecord(imageData['ID'], templ.innerHTML, highLight);
        li.id = this.__createElementID(imageData['ID']);
		li.down('.image').imageData = imageData;
		
        Event.observe(li.down('.image'), "click", function(e) 
        { 
            for (k in e.target.imageData['paths']) 
            { 
                if (e.target.src.substr(e.target.src.length - e.target.imageData['paths'][k].length, e.target.imageData['paths'][k].length) == e.target.imageData['paths'][k])
                {
                    var currentImg = k;
                }  
            }

            var nextImg = parseInt(currentImg) + 1;

            if (!e.target.imageData['paths'][nextImg])
            {
                nextImg = 1;    
            } 

            e.target.src = e.target.imageData['paths'][nextImg];
        }.bind(this));
	},
	
	updateEntry: function(imageData, highLight)
	{
	  	// force image reload
	  	var timeStamp = new Date().getTime();
        var li = $(this.__createElementID(imageData['ID']));
		var imageChanged = false;
		for(var k = 1; k < 10; k++)
	  	{
			if (!imageData['paths'][k]) break;
            imageData['paths'][k] +=  '?' + timeStamp + 'xyz';
            if(!imageChanged) {
				li.down('.image').src = imageData['paths'][k];
				imageChanged = true;
            }
		}
		
		li.down('.image').imageData = imageData;
		li.down('.imageTitle').innerHTML = li.down('form').elements.namedItem("title").value;
	  	
		ActiveList.prototype.highlight(li);
	},

	upload: function(form)
	{
		errorElement = document.getElementsByClassName('errorText', this.addForm)[0];
		errorElement.style.display = 'none';
		this.showProgressIndicator(this.addForm);
        
        if(form.action.match(/random=/))
        {
            form.action.replace(/random=/, 'random=' + "random=" + Math.random() * 100000)
        }
        else
        {
            if(form.action.match(/\?/))
            {
                form.action += '&';    
            }
            else
            {
                form.action += '?';
            }
            
            form.action += "random=" + Math.random() * 100000
        }
        
		return false;
	},
	
	cancelAdd: function()
	{
        var form = this.addForm.down('form');
        ActiveForm.prototype.resetErrorMessages(form);
        Backend.LanguageForm.prototype.closeTabs(form);
        form.reset();
    },
	
	postUpload: function(result)
	{
		var errorElement = document.getElementsByClassName('errorText', this.addForm)[0];

		if (result['error'])  	
		{
            errorElement.innerHTML = result['error'];
			Element.removeClassName(errorElement, 'hidden');
			Effect.Appear(errorElement, {duration: 0.4});
		}
		else
		{
			errorElement.style.display = 'none';
			this.addToList(result, true);		  
			
			var menu = new ActiveForm.Slide(this.addMenu);
			menu.hide("prodImageAdd", this.addForm)
			
			this.initActiveList();
            
            this.updateTabCounters(this.container.down('li'));
            
            this.arrangeImages();
		    this.cancelAdd();
		}
	},

	postSave: function(imageId, result)
	{
		var entry = $(this.__createElementID(result['ID']));
		this.hideProgressIndicator(entry);
		var errorElement = document.getElementsByClassName('errorText', entry)[0];
		if (result['error'])  	
		{
			errorElement.removeClassName('hidden');
            errorElement.innerHTML = result['error'];
			Effect.Appear(errorElement, {duration: 0.4});
		}
		else
		{
			errorElement.style.display = 'none';
			console.info(result);
			this.updateEntry(result, true);		  
			
            ActiveList.prototype.getInstance(this.container).toggleContainerOff(entry.down(".activeList_editContainer"))
			
			this.initActiveList();
		}
	},
	
	__createElementID: function(id)
	{
		return this.prefix + 'image_' + id;		
	},
	
	setSortUrl: function(url)
	{
	  	this.sortUrl = url;
	},
	
	setDeleteUrl: function(url)
	{
	  	this.deleteUrl = url;
	},

	setEditUrl: function(url)
	{
	  	this.editUrl = url;
	},

	setSaveUrl: function(url)
	{
	  	this.saveUrl = url;
	},

	setEditCaption: function(message)
	{
	  	this.editCaption = message;
	},

	setSaveCaption: function(message)
	{
	  	this.saveCaption = message;
	},

	setDeleteMessage: function(message)
	{
	  	this.delConfirmMsg = message;
	}
}
