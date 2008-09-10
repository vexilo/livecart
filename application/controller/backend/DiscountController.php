<?php

ClassLoader::import("application.controller.backend.abstract.ActiveGridController");
ClassLoader::import("application.model.discount.DiscountCondition");

/**
 *
 * @package application.controller.backend
 * @author Integry Systems
 * @role product
 */
class DiscountController extends ActiveGridController
{
	const TYPE_TOTAL = 0;
	const TYPE_COUNT = 1;
	const TYPE_ITEMS = 2;
	const TYPE_USERGROUP = 3;
	const TYPE_USER = 4;
	const TYPE_DELIVERYZONE = 5;

	public function index()
	{
		$response = $this->getGridResponse();

		$response->set('form', $this->buildForm());

		$response->set('conditionForm', $this->buildConditionForm());

		$response->set('conditionTypes', array( self::TYPE_TOTAL => $this->translate('_type_order_total'),
						self::TYPE_COUNT => $this->translate('_type_order_count'),
						self::TYPE_ITEMS => $this->translate('_type_items_in_cart'),
						self::TYPE_USERGROUP => $this->translate('_type_user_group'),
						self::TYPE_USER => $this->translate('_type_user'),
						self::TYPE_DELIVERYZONE => $this->translate('_type_delivery_zone')));

		$response->set('comparisonTypes', array(
						DiscountCondition::COMPARE_GTEQ => $this->translate('_compare_gteq'),
						DiscountCondition::COMPARE_LTEQ => $this->translate('_compare_lteq'),
						DiscountCondition::COMPARE_EQ => $this->translate('_compare_eq'),
						DiscountCondition::COMPARE_NE => $this->translate('_compare_ne')));

		$response->set('comparisonFields', array(
						'count' => $this->translate('_with_count'),
						'subTotal' => $this->translate('_with_subTotal'),
						));

		$response->set('actionTypes', array(
						DiscountAction::MEASURE_PERCENT => $this->translate('_percentage_discount'),
						DiscountAction::MEASURE_AMOUNT => $this->translate('_fixed_amount_discount'),
					  ));

		$response->set('applyToChoices', array(
						DiscountAction::TYPE_ORDER_DISCOUNT => $this->translate('_apply_order'),
						DiscountAction::TYPE_ITEM_DISCOUNT => $this->translate('_apply_matched_items'),
						DiscountAction::TYPE_CUSTOM_DISCOUNT => $this->translate('_apply_custom_items'),
					  ));

		$response->set('currencyCode', $this->application->getDefaultCurrencyCode());

		return $response;
	}

	public function add()
	{
		return new ActionResponse('form', $this->buildForm());
	}

	public function edit()
	{
		$condition = ActiveRecordModel::getInstanceById('DiscountCondition', $this->request->get('id'), DiscountCondition::LOAD_DATA, DiscountCondition::LOAD_REFERENCES);
		$condition->loadAll();

		$response = new ActionResponse('condition', $condition->toArray());

		$records = array();
		$zones = ActiveRecordModel::getRecordSetArray('DeliveryZone', new ARSelectFilter());
		//$zones = array_merge(array(DeliveryZone::getDefaultZoneInstance()->toArray()), $zones);
		//$this->loadLanguageFile('backend/DeliveryZone');
		//$zones[0]['name'] = $this->translate('_default_zone');
		$records['DeliveryZone'] = $zones;
		$records['UserGroup'] = ActiveRecordModel::getRecordSetArray('UserGroup', new ARSelectFilter());

		$response->set('records', $records);

		$form = $this->buildForm();
		$form->setData($condition->toArray());
		$response->set('form', $form);

		// actions
		$f = new ARSelectFilter();
		$f->setOrder(new ARFieldHandle('DiscountAction', 'position'));
		$actions = $condition->getRelatedRecordSet('DiscountAction', $f, array('DiscountCondition', 'DiscountCondition_ActionCondition'));
		foreach ($actions as $action)
		{
			if ($action->actionCondition->get())
			{
				$action->actionCondition->get()->load();
				$action->actionCondition->get()->loadAll();
			}
		}

		$response->set('actions', $actions->toArray());

		return $response;
	}

	public function save()
	{
		$validator = $this->buildValidator();

		if ($validator->isValid())
		{
			$instance = ($id = $this->request->get('id')) ? ActiveRecordModel::getInstanceByID('DiscountCondition', $id, ActiveRecordModel::LOAD_REFERENCES) : DiscountCondition::getNewInstance();
			$instance->loadRequestData($this->request);
			$instance->save();

			return new JSONResponse(array('condition' => $instance->toFlatArray()), 'success', $this->translate('_rule_was_successfully_saved'));
		}
		else
		{
			return new JSONResponse(array('errors' => $validator->getErrorList()), 'failure');
		}
	}

	public function addCondition()
	{
		$parent = ActiveRecordModel::getInstanceByID('DiscountCondition', $this->request->get('id'), DiscountCondition::LOAD_DATA);
		$child = DiscountCondition::getNewInstance($parent);
		$child->save();

		return new JSONResponse($child->toArray());
	}

	public function deleteCondition()
	{
		$condition = ActiveRecordModel::getInstanceByID('DiscountCondition', $this->request->get('id'), DiscountCondition::LOAD_DATA);
		$condition->delete();

		return new JSONResponse(true);
	}

	public function updateConditionField()
	{
		list($fieldName, $id) = explode('_', $this->request->get('field'));

		$field = 'comparisonValue' == $fieldName ? ($this->request->get('type') == self::TYPE_COUNT ? 'count' : 'subTotal') : $fieldName;

		$condition = ActiveRecordModel::getInstanceByID('DiscountCondition', $id, DiscountCondition::LOAD_DATA);

		if ($this->request->get('type') == self::TYPE_ITEMS && 'comparisonValue' == $fieldName)
		{
			$field = $this->request->get('productField');
		}

		if (('count' == $field) || ('subTotal' == $field))
		{
			$condition->count->set(null);
			$condition->subTotal->set(null);
		}

		$value = $this->request->get('value');

		if ('isAnyRecord' == $field)
		{
			$value = !$value;
		}

		$condition->$field->set($value);
		$condition->save();

		return new JSONResponse($fieldName);
	}

	public function addRecord()
	{
		$condition = ActiveRecordModel::getInstanceByID('DiscountCondition', $this->request->get('id'), DiscountCondition::LOAD_DATA);
		$object = ActiveRecordModel::getInstanceByID($this->request->get('class'), $this->request->get('recordID'), DiscountCondition::LOAD_DATA);
		$record = DiscountConditionRecord::getNewInstance($condition, $object);
		$record->save();

		$this->deleteOtherTypeRecords($condition, $object);

		return new JSONResponse(array('className' => get_class($object), 'data' => $record->toArray()));
	}

	public function deleteRecord()
	{
		$record = ActiveRecordModel::getInstanceByID('DiscountConditionRecord', $this->request->get('id'), DiscountConditionRecord::LOAD_DATA);
		$record->delete();

		return new JSONResponse(true);
	}

	public function saveSelectRecord()
	{
		$condition = ActiveRecordModel::getInstanceByID('DiscountCondition', $this->request->get('id'), DiscountCondition::LOAD_DATA);

		// delete existing record
		$record = ActiveRecordModel::getInstanceByID($this->request->get('class'), $this->request->get('recordID'));
		foreach ($record->getRelatedRecordSet('DiscountConditionRecord', new ARSelectFilter(new EqualsCond(new ARFieldHandle('DiscountConditionRecord', 'conditionID'), $condition->getID()))) as $existing)
		{
			$existing->delete();
		}

		$this->deleteOtherTypeRecords($condition, $record);

		// create
		if ($this->request->get('state') == 'true')
		{
			$rec = DiscountConditionRecord::getNewInstance($condition, $record);
			$rec->save();
		}
	}

	private function deleteOtherTypeRecords(DiscountCondition $condition, ActiveRecordModel $record)
	{
		if (in_array(get_class($record), array('Manufacturer', 'Category', 'Product')))
		{
			foreach(array('categoryID', 'productID', 'manufacturerID') as $field)
			{
				$c = new IsNullCond(new ARFieldHandle('DiscountConditionRecord', $field));
				if (isset($cond))
				{
					$cond->addAND($c);
				}
				else
				{
					$cond = $c;
				}
			}
		}
		else
		{
			$class = get_class($record);
			$field = strtolower(substr($class, 0, 1)) . substr($class, 1) . 'ID';
			$cond = new IsNullCond(new ARFieldHandle('DiscountConditionRecord', $field));
		}

		foreach ($condition->getRelatedRecordSet('DiscountConditionRecord', new ARSelectFilter($cond)) as $oldType)
		{
			$oldType->delete();
		}
	}

	public function addAction()
	{
		$parent = ActiveRecordModel::getInstanceByID('DiscountCondition', $this->request->get('id'), DiscountCondition::LOAD_DATA);
		$child = DiscountAction::getNewInstance($parent);
		$child->isEnabled->set(true);
		$child->save();

		return new JSONResponse($child->toArray());
	}

	public function deleteAction()
	{
		$action = ActiveRecordModel::getInstanceByID('DiscountAction', $this->request->get('id'), DiscountAction::LOAD_DATA);
		$action->delete();

		return new JSONResponse(true);
	}

	public function updateActionField()
	{
		list($fieldName, $id) = explode('_', $this->request->get('field'));
		$value = $this->request->get('value');

		$action = ActiveRecordModel::getInstanceByID('DiscountAction', $id, DiscountAction::LOAD_DATA, array('DiscountCondition', 'DiscountCondition_ActionCondition'));

		if ('type' == $fieldName)
		{
			switch ($value)
			{
				case DiscountAction::TYPE_ORDER_DISCOUNT:
					$action->actionCondition->set(null);
					break;

				case DiscountAction::TYPE_ITEM_DISCOUNT:
					$action->actionCondition->set($action->condition->get());
					break;

				case DiscountAction::TYPE_CUSTOM_DISCOUNT:
					$newCondition = DiscountCondition::getNewInstance();
					$newCondition->isEnabled->set(true);
					$newCondition->isActionCondition->set(true);
					$newCondition->save();

					$action->actionCondition->set($newCondition);
					$action->save();

					return new JSONResponse(array('field' => $fieldName, 'condition' => $newCondition->toArray()));

					break;
			}
		}
		else
		{
			$action->$fieldName->set($value);
		}

		$action->save();

		return new JSONResponse($fieldName);
	}

	public function sortActions()
	{
	  	$order = $this->request->get('actionContainer_' . $this->request->get('conditionId'));
		foreach ($order as $key => $value)
		{
			$update = new ARUpdateFilter();
			$update->setCondition(new EqualsCond(new ARFieldHandle('DiscountAction', 'ID'), $value));
			$update->addModifier('position', $key);
			ActiveRecord::updateRecordSet('DiscountAction', $update);
		}

		$resp = new RawResponse();
	  	$resp->setContent($this->request->get('draggedId'));
		return $resp;
	}

	public function changeColumns()
	{
		parent::changeColumns();
		return $this->getGridResponse();
	}

	private function getGridResponse()
	{
		$response = new ActionResponse();
		$this->setGridResponse($response);
		return $response;
	}

	protected function getClassName()
	{
		return 'DiscountCondition';
	}

	protected function getCSVFileName()
	{
		return 'discounts.csv';
	}

	protected function getDefaultColumns()
	{
		return array('DiscountCondition.ID', 'DiscountCondition.isEnabled', 'DiscountCondition.name', 'DiscountCondition.couponCode', 'DiscountCondition.position');
	}

	public function getAvailableColumns()
	{
		$availableColumns = parent::getAvailableColumns();
		$validColumns = array('DiscountCondition.name', 'DiscountCondition.isEnabled', 'DiscountCondition.couponCode', 'DiscountCondition.validFrom', 'DiscountCondition.validTo', 'DiscountCondition.position');

		return array_intersect_key($availableColumns, array_flip($validColumns));
	}

	protected function getSelectFilter()
	{
		// we don't need the root node or action conditions
		$f = new ARSelectFilter(new EqualsCond(new ARFieldHandle($this->getClassName(), 'parentNodeID'), 1));
		$f->mergeCondition(new NotEqualsCond(new ARFieldHandle($this->getClassName(), 'isActionCondition'), 1));
		return $f;
	}

	protected function setDefaultSortOrder(ARSelectFilter $filter)
	{
		$filter->setOrder(new ARFieldHandle($this->getClassName(), 'position'), 'ASC');
	}

	private function buildValidator()
	{
		ClassLoader::import("framework.request.validator.RequestValidator");

		$validator = new RequestValidator("discountCondition", $this->request);
		$validator->addCheck("name", new IsNotEmptyCheck($this->translate("_rule_name_empty")));

		return $validator;
	}

	/**
	 * Builds a condition main details form instance
	 *
	 * @return Form
	 */
	private function buildForm()
	{
		ClassLoader::import("framework.request.validator.Form");
		return new Form($this->buildValidator());
	}

	private function buildConditionValidator()
	{
		ClassLoader::import("framework.request.validator.RequestValidator");
		return new RequestValidator("discountConditionRule", $this->request);
	}

	/**
	 * Builds a condition main details form instance
	 *
	 * @return Form
	 */
	private function buildConditionForm()
	{
		ClassLoader::import("framework.request.validator.Form");
		return new Form($this->buildConditionValidator());
	}

}

?>