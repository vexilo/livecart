<?php

/**
 * Renders text field
 *
 * If you wish to use autocomplete on a text field an additional parameter needs to be passed:
 *
 * <code>
 *	  autocomplete="controller=somecontroller field=fieldname"
 * </code>
 *
 * The controller needs to implement an autoComplete method, which must return the AutoCompleteResponse
 *
 * @param array $params
 * @param Smarty $smarty
 * @return string
 *
 * @package application.helper.smarty.form
 * @author Integry Systems
 */
function smarty_function_textfield($params, Smarty_Internal_Template $smarty)
{
	if (empty($params['name']))
	{
		$params['name'] = $smarty->getTemplateVars('input_name');
	}

	$smarty->assign('last_fieldType', 'textfield');

	$formParams = $smarty->_tag_stack[0][1];
	$formHandler = $formParams['handle'];
	$fieldName = $params['name'];
	if (!($formHandler instanceof Form))
	{
		throw new HelperException('Element must be placed in {form} block');
	}

	if (!isset($params['type']))
	{
		$params['type'] = 'text';
	}

	// Check permissions
	if($formParams['readonly'])
	{
		$params['readonly'] = 'readonly';
	}

	$value = array_pop(array_filter(array(isset($params['value']) ? $params['value'] : '', isset($params['default']) ? $params['default'] : '', $formHandler->get($fieldName))));

	$noFormat = $params['noFormat'];
	unset($params['value'], $params['default'], $params['noFormat']);

	if (isset($params['autocomplete']) && ($params['autocomplete'] != 'off') && empty($params['id']))
	{
		$params['id'] = uniqid();
	}

	if (!empty($params['placeholder']))
	{
		$params['placeholder'] = $smarty->getApplication()->translate($params['placeholder']);
	}

	if (isset($params['autocomplete']) && $params['autocomplete'] != 'off')
	{
		$autocomplete = $params['autocomplete'];
		$params['autocomplete'] = 'off';
	}

	$content = '<input';
	foreach ($params as $name => $param) {
		$content .= ' ' . $name . '="' . $param . '"';
	}

	$content .= ' value="' . htmlspecialchars($value, ENT_QUOTES, 'UTF-8') . '"';
	$content .= '/>';

	if (!$noFormat)
	{
		$content = '<div class="controls">' . $content . '</div>';
	}

	if (!empty($autocomplete))
	{
	  	$acparams = array();
		foreach (explode(' ', $params['autocomplete']) as $param)
	  	{
			list($p, $v) = explode('=', $param, 2);
			$acparams[$p] = $v;
		}

		$url = $smarty->getApplication()->getRouter()->createURL(array('controller' => $acparams['controller'],
													  'action' => 'autoComplete',
													  'query' => 'field=' . $acparams['field']), true);

		$content .= '<span id="autocomplete_indicator_' . $params['id'] . '" class="progressIndicator" style="display: none;"></span>';
		$content .= '<div id="autocomplete_' . $params['id'] . '" class="autocomplete"></div>';

		$content .= '<script type="text/javascript">
						jQuery("#' . $params['id'] . '").typeahead({
								source: function (query, process) {
									return jQuery.get("' . $url . '", { ' . $acparams['field'] . ': query }, function (data) {
										return process(jQuery.parseJSON(data));
									});
								}});
					</script>';
	}

	return $content;
}

?>