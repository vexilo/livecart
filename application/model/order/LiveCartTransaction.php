<?php

ClassLoader::import('library.payment.TransactionDetails');

class LiveCartTransaction extends TransactionDetails
{
	public function __construct(CustomerOrder $order, Currency $currency)
	{
        parent::__construct();
        
        // billing address
        $address = $order->billingAddress->get();
        $fields = array('firstName', 'lastName', 'companyName', 'phone', 'city', 'postalCode', 'countryID' => 'country');
        foreach ($fields as $key => $field)
        {
            $addressField = is_numeric($key) ? $field : $key;            
            $this->$field->set($address->$addressField->get());
        }
    
        $this->state->set($this->getStateValue($address));    
        
        // shipping address
        $address = $order->shippingAddress->get();
        foreach ($fields as $key => $field)
        {
            $addressField = is_numeric($key) ? $field : $key;            
            $field = 'shipping' . ucfirst($field);
            $this->$field->set($address->$addressField->get());
        }
    
        $this->state->set($this->getStateValue($address));    
        
        $this->shippingEmail->set($order->user->get()->email->get());
        $this->email->set($order->user->get()->email->get());
        
        // amount
        $this->amount->set($order->getTotal($currency));
        $this->currency->set($currency->getID());
        
        // transaction identification
        $this->invoiceID->set($order->getID());
        $this->clientID->set($order->user->get()->getID());
    }
    
    private function getStateValue(UserAddress $address)
    {
        if ($state = $address->state->get())
        {
            if ($state->code->get())
            {
                return $state->code->get();
            }
            else
            {
                return $state->name->get();
            }            
        }
        else
        {
            return $address->stateName->get();   
        }        
    }
}

?>