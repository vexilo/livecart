{includeJs file="library/form/Validator.js"}
{includeJs file="library/form/ActiveForm.js"}

{include file="layout/frontend/header.tpl"}
{* include file="layout/frontend/leftSide.tpl" *}
{* include file="layout/frontend/rightSide.tpl" *}

<div id="content" class="left right">
	
	<h1>{t Remind Password}</h1>
	
    {form action="controller=user action=doRemindPassword" method="post" handle=$form}
        <p>
            <label for="email">Your e-mail address:</label>
            {textfield class="text" name="email"}
        </p>
        
        <p>
            <label></label>
            <input type="submit" class="submit" value="{tn _continue}" />        
           	<label class="cancel">
                {t _or}    
                <a class="cancel" href="{link route=$return}">{t _cancel}</a>
            </label>
        </p>
        
        <input type="hidden" name="return" value="{$return}" />
        
    {/form}
	
</div>

{include file="layout/frontend/footer.tpl"}