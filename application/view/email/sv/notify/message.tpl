Nytt meddelande angående order hos {'STORE_NAME'|config}
En kund har lagt till ett nytt meddelande angående <b class="orderID">#{$order.ID}</b>

--------------------------------------------------
{$message.text}
--------------------------------------------------

Du kan svara från kontrollpanelens orderhantering:
{backendOrderUrl order=$order url=true}#tabOrderCommunication__

{include file="email/en/signature.tpl"}