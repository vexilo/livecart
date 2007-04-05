<script type="text/javascript">
{literal}
    with(Backend.RelatedProduct.Group)
    {
        Links.save = '{/literal}{link controller=backend.productRelationshipGroup action=save}{literal}';
        Links.remove = '{/literal}{link controller=backend.productRelationshipGroup action=delete}{literal}';
        Links.sort = '{/literal}{link controller=backend.productRelationshipGroup action=sort}?target=productRelationshipGroup_list_{$productID}{literal}';
        Links.edit = '{/literal}{link controller=backend.productRelationshipGroup action=edit}{literal}';
        
        Messages.areYouSureYouWantToDelete = '{/literal}{t _Are_you_sure_you_want_to_delete|addslashes}{literal}'
    }
    
    
    Backend.RelatedProduct.links = {};
    Backend.RelatedProduct.messages = {};
    with(Backend.RelatedProduct)
    {
        links.related = '{/literal}{link controller=backend.productRelationship action=addRelated}/{$productID}{literal}';
        links.deleteRelated = '{/literal}{link controller=backend.productRelationship action=delete}/{$productID}{literal}';
        links.selectProduct = '{/literal}{link controller=backend.productRelationship action=selectProduct}#cat_{$categoryID}#tabProducts__{literal}';
        links.sort = '{/literal}{link controller=backend.productRelationship action=sort}/{$productID}{literal}';
        
        messages.selectProductTitle = '{/literal}{t _select_product|addslashes}{literal}';
        messages.areYouSureYouWantToDelete = '{/literal}{t _are_you_sure_you_want_to_delete_this_relation|addslashes}{literal}';
    }
{/literal}
</script>
    
<div id="productRelationshipMsg_{$productID}" style="display: none;"></div>

<fieldset class="container">
	<ul class="menu" id="productRelationship_menu_{$productID}">
	    <li><a href="#selectProduct" id="selectProduct_{$productID}">{t _select_product}</a></li>
	    <li><a href="#cancelSelectProduct" id="selectProduct_{$productID}_cancel" class="hidden">{t _cancel_adding_new_related_product}</a></li>
	    <li><a href="#new" id="productRelationshipGroup_new_{$productID}_show">{t _add_new_group}</a></li>
	    <li><a href="#new" id="productRelationshipGroup_new_{$productID}_cancel" class="hidden">{t _cancel_adding_new_group}</a></li>
	</ul>
</fieldset>

<div id="productRelationshipGroup_new_{$productID}_form">
    {include file="backend/productRelationshipGroup/form.tpl"}
    
    <script type="text/javascript">
    {literal}
        var emptyGroupModel = new Backend.RelatedProduct.Group.Model({Product: {ID: {/literal}{$productID}{literal}}}, Backend.availableLanguages);
        new Backend.RelatedProduct.Group.Controller($("productRelationshipGroup_new_{/literal}{$productID}{literal}_form").down('.productRelationshipGroup_form'), emptyGroupModel);
    {/literal}
    </script>
</div>


{* No group *}
<ul id="productRelationship_list_{$productID}_" class="productRelationship_list activeList_add_sort activeList_add_delete activeList_accept_productRelationship_list">
{foreach item="relationship" from=$relationshipsWithGroups}
    {if $relationship.ProductRelationshipGroup.ID}{php}break;{/php}{/if}
    {if $relationship.RelatedProduct.ID} 
        <li id="productRelationship_list_{$productID}_{$relationship.ProductRelationshipGroup.ID}_{$relationship.RelatedProduct.ID}">
            {include file="backend/productRelationship/addRelated.tpl" product=$relationship.RelatedProduct}
        </li>
    {/if}
{/foreach}
</ul>


<ul id="productRelationshipGroup_list_{$productID}" class="activeList_add_sort activeList_add_delete activeList_add_edit productRelationshipGroup_list">
{foreach item="relationship" from=$relationshipsWithGroups}
    {if !$relationship.ProductRelationshipGroup.ID}{php}continue;{/php}{/if}
    
    {if $lastProductRelationshipGroup != $relationship.ProductRelationshipGroup.ID }
        {if $lastProductRelationshipGroup > 0}</ul></li>{/if}
        <li id="productRelationshipGroup_list_{$productID}_{$relationship.ProductRelationshipGroup.ID}" class="productRelationshipGroup_item">
            <span class="productRelationshipGroup_title">{$relationship.ProductRelationshipGroup.name_lang}</span>
            {include file="backend/productRelationshipGroup/form.tpl"}	
            <ul id="productRelationship_list_{$productID}_{$relationship.ProductRelationshipGroup.ID}" class="productRelationship_list activeList_add_sort activeList_add_delete activeList_accept_productRelationship_list">
    {/if}
    
    {if $relationship.RelatedProduct.ID} {* For empty groups *}
    <li id="productRelationship_list_{$productID}_{$relationship.ProductRelationshipGroup.ID}_{$relationship.RelatedProduct.ID}">
    	{include file="backend/productRelationship/addRelated.tpl" product=$relationship.RelatedProduct}
    </li>
    {/if}

    {assign var="lastProductRelationshipGroup" value=$relationship.ProductRelationshipGroup.ID}
{/foreach}
</ul>

{literal}
<script type="text/javascript">
    try
    {
        Event.observe($("productRelationshipGroup_new_{/literal}{$productID}{literal}_show"), "click", function(e) 
        {
            Event.stop(e);
            var newForm = Backend.RelatedProduct.Group.Controller.prototype.getInstance($("productRelationshipGroup_new_{/literal}{$productID}{literal}_form").down('.productRelationshipGroup_form')).showNewForm();
        });
        
        Event.observe($("selectProduct_{/literal}{$productID}{literal}"), 'click', function(e) {
            Event.stop(e);
            new Backend.RelatedProduct.SelectProductPopup(
                Backend.RelatedProduct.links.selectProduct, 
                Backend.RelatedProduct.messages.selectProductTitle, 
                {
                    onProductSelect: function() { Backend.RelatedProduct.addProductToList({/literal}{$productID}{literal}, this.productID) }
                }
            );
          
            Backend.RelatedProduct.Group.Controller.prototype.getInstance($("productRelationshipGroup_new_{/literal}{$productID}{literal}_form").down('form')).hideNewForm();
        });
        

        {/literal}    
        var groupList = ActiveList.prototype.getInstance('productRelationshipGroup_list_{$productID}', Backend.RelatedProduct.Group.Callbacks);  
        ActiveList.prototype.getInstance("productRelationship_list_{$productID}_", Backend.RelatedProduct.activeListCallbacks);
        
        {assign var="lastRelationshipGroup" value="-1"}
        {foreach item="relationship" from=$relationshipsWithGroups}
            {if $relationship.ProductRelationshipGroup && $lastRelationshipGroup != $relationship.ProductRelationshipGroup.ID}
                 ActiveList.prototype.getInstance('productRelationship_list_{$productID}_{$relationship.ProductRelationshipGroup.ID}', Backend.RelatedProduct.activeListCallbacks);
            {/if}
            {assign var="lastRelationshipGroup" value=$relationship.ProductRelationshipGroup.ID}
        {/foreach}
        {literal}
        
        groupList.createSortable();
    }
    catch(e)
    {
        console.info(e);
    }
</script>
{/literal}