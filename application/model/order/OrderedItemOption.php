<?php

ClassLoader::import('application.model.product.ProductOptionChoice');
ClassLoader::import('application.model.order.OrderedItem');

/**
 * Represents a shopping basket item configuration value
 *
 * @package application.model.order
 * @author Integry Systems <http://integry.com>
 */
class OrderedItemOption extends ActiveRecordModel
{
	/**
	 * Define database schema used by this active record instance
	 *
	 * @param string $className Schema name
	 */
	public static function defineSchema($className = __CLASS__)
	{
		$schema = self::getSchemaInstance($className);
		$schema->setName($className);

		$schema->registerField(new ARPrimaryForeignKeyField("orderedItemID", "OrderedItem", "ID", "OrderedItem", ARInteger::instance()));
		$schema->registerField(new ARPrimaryForeignKeyField("choiceID", "ProductOptionChoice", "ID", "ProductOptionChoice", ARInteger::instance()));

		$schema->registerField(new ARField("priceDiff", ARFloat::instance()));
		$schema->registerField(new ARField("optionText", ARText::instance()));

		$schema->registerCircularReference('Choice', 'ProductOptionChoice');
		$schema->registerCircularReference('DefaultChoice', 'ProductOptionChoice');
	}

	/*####################  Static method implementations ####################*/

	public static function getNewInstance(OrderedItem $item, ProductOptionChoice $choice)
	{
		$instance = parent::getNewInstance(__CLASS__);
		$instance->orderedItem->set($item);
		$instance->choice->set($choice);

		return $instance;
	}

	public static function loadOptionsForItemSet(ARSet $orderedItems)
	{
		// load applied product option choices
		$ids = array();
		foreach ($orderedItems as $key => $item)
		{
			$ids[] = $item->getID();
		}

		$f = new ARSelectFilter(new INCond(new ARFieldHandle('OrderedItemOption', 'orderedItemID'), $ids));
		foreach (ActiveRecordModel::getRecordSet('OrderedItemOption', $f, array('DefaultChoice' => 'ProductOptionChoice', 'Option' => 'ProductOption', 'Choice' => 'ProductOptionChoice')) as $itemOption)
		{
			$itemOption->orderedItem->get()->loadOption($itemOption);
		}
	}

	/*####################  Saving ####################*/

	public function save()
	{
		if (!$this->orderedItem->get()->customerOrder->get()->isFinalized->get())
		{
			$this->updatePriceDiff();
		}

		return parent::save();
	}

	protected function insert()
	{
		$this->updatePriceDiff();

		return parent::insert();
	}

	private function updatePriceDiff()
	{
		$currency = $this->orderedItem->get()->customerOrder->get()->currencyID->get()->getID();
		$this->priceDiff->set($this->choice->get()->getPriceDiff($currency));
	}

	/*####################  Data array transformation ####################*/

	public static function transformArray($array, ARSchema $schema)
	{
		$array = parent::transformArray($array, $schema);

		$array['formattedPrice'] = array();
		$currency = $this->orderedItem->get()->getCurrency();
		$array['formattedPrice'] = $currency->getFormattedPrice($array['priceDiff']);

		return $array;
	}

}

?>