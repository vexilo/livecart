<p>With LC you can localize your e-store and provide the product and shipping pricing in visitor's home
currency. That is, you can set multiple currencies and allow users to switch between currencies to view the 
prices of products and conclude payments in the currency they prefer. To do that you have to define 
which currencies your store will support.</p> 	

<div class="tasks">
<fieldset>
<legend>Things you can do</legend>
<ul>	
	<li><a href="{self}#add">Add new Currency</a></li>
	<li><a href="{self}#set_base">Set Base Currency</a></li>
	<li><a href="{self}#adjust_rates">Adjust Exchange Rates</a></li>
<!--
	<li><a href="{self}#adjust_automaticaly">Set Automatic Exchange Rates Adjust</a></li>
-->
	<li><a href="{self}#enable_disable">Enable or Disable Currency</a></li>
	<li><a href="{self}#format">Set Price Formatting</a></li>
	<li><a href="{self}#sort">Sort Currencies</a></li>
	<li><a href="{self}#delete">Delete Currency</a></li>				
</ul>
</fieldset>
</div>

<h3 id="add">Add Currency</h3>
<p>To add a new currency:</p>

<ol>
	<li>Click the "Add currency" link:</li>
	<img src="image/doc/currency/add_currency.bmp">
	<li>Then choose a currency from the pulldown menu:</li>
	<img src="image/doc/currency/menu_add.bmp">
	<li>Finally click the "Add Currency" button:</li>
	<img src="image/doc/currency/add_button.bmp">
</ol>


<h3 id="set_base">Set the Base Currency</h3>
<p>The base currency is used as the main currency of your system. All the other currency rates are calculated
 in respect with the base currency.    

If you want to change the base currency click the "Set as base currency" link under the currency name.</p>
<img src="image/doc/currency/set_base.bmp">
<p class="note"><strong>Note</strong>: Once you change the base currency all prices have to be recalculated and re-set for all the products.</p>
<br \><br \>

<h3 id="adjust_rates">Adjust Exchange Rates</h3>
<p>To adjust exchange rates of your (active) currencies click on the "Adjust Exchange Rates" 
tab (to proceed to manual exchange rates setting page):</p>
<img src="image/doc/currency/adjust_exchange_rates.bmp">
<img src="image/doc/currency/adjust_exchange_rates_highlight_red.bmp">
<img src="image/doc/currency/adjust_exchange_rates_highlight_blue.bmp">
<img src="image/doc/currency/adjust_exchange_rates_highlight_green.bmp">

<p>To set the currency exchange rates simply enter currency's value in the appropriate field. For instance, if 
one United Kingdom Pound is worth 1.96475 US Dollars, enter this value:</p>
<img src="image/doc/currency/adjust_exchange_rates_blink.bmp">

<p>and click "Save" to set the rates:</p>
<img src="image/doc/currency/save.bmp">

<p class="note"><strong>Note</strong>: rates always have to be calculated in relation to the <strong>base</strong>
 currency.</p>
 <!--
<p>See <a href="{self}#adjust_automaticaly"> Automatic Adjust</a> for keeping your rates up-to-date.</p>
-->

<!--
<h3 id="adjust_automaticaly">Automaticaly Adjust Exchange Rates</h3>
<p>To configure automatic exchange rates click <strong>Adjust Exchange Rates</strong> tab.</p>

<p>In the currency exchange rates management page you can enable automatic currency updaters and keep your currencies 
up-to-date. To do that:
<ul><ins>
	<li>Check/click <i>Update currency exchange rates automatically using currency data feeds</i></li>
	<li>Select an update frequency</li>
	<li>Choose which currencies should be updated and select an update engine to use (read about update engines)</li>
</ins></ul>
</p>
-->

<h3 id="enable_disable">Enable or Disable Currencies</h3>
<p>All the currencies are disabled by default. To enable a currency click it's checkbox on the 
left of the currency name.</p>
<img src="image/doc/currency/enable.bmp">

<p>Clear the mark to disable it.</p>


<h3 id="format">Price Formatting</h3>
<p>To express the type of money you can set special currency symbols ("$", etc.) that will be displayed in your 
store with a particular price. To set price formatting:</p>

<ol>
	<li>Hover your mouse cursor over the currency and click the "Pen" icon on the left:</li>
	<img src="image/doc/currency/edit.bmp">
	<li>In the <strong>Price Formatting</strong> you can enter the prefix and suffix (prefix before the price,
	suffix - after) that will be displayed with the price:</li>
	<img src="image/doc/currency/prefix_suffix.bmp">
	<li>Click "Save" to set formatting:</li>
	<img src="image/doc/currency/save.bmp">
</ol>


<h3 id="sort">Sort Currencies</h3>
<p>Sorting currencies determines the order in which the active currencies are be displayed to your customers in 
the currency switching menu. To set the appropriate currency order, click on the currency and drag it up or down.</p>
<img src="image/doc/currency/sort.bmp">


<h3 id="delete">Delete</h3>
<p>To delete a currency, move your mouse over the currency and click the "Delete" icon on the left.</p>
<img src="image/doc/currency/delete.bmp">

