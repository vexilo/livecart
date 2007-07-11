<?php
ClassLoader::import("application.controller.backend.abstract.StoreManagementController");
ClassLoader::import("application.model.order.CustomerOrder");
ClassLoader::import("application.model.order.OrderNote");
ClassLoader::import("framework.request.validator.RequestValidator");
ClassLoader::import("framework.request.validator.Form");

/**
 * Manage order notes (communication with customer)
 *
 * @package application.controller.backend
 * @author Saulius Rupainis <saulius@integry.net>
 *
 * @role order
 */
class OrderNoteController extends StoreManagementController
{
    public function index()
    {
        $order = CustomerOrder::getInstanceById($this->request->get('id'));
        $response = new ActionResponse();
        $response->set('form', $this->buildOrderNoteForm());
        $response->set('order', $order->toArray());
        $response->set('notes', $order->getNotes()->toArray());
        return $response;
    }
    
    public function view()
    {
        return new ActionResponse('note', ActiveRecordModel::getInstanceById('OrderNote', $this->request->get('id'), OrderNote::LOAD_DATA, OrderNote::LOAD_REFERENCES)->toArray());
    }
    
    public function add()
    {
        if ($this->buildOrderNoteValidator()->isValid())
        {
            $note = OrderNote::getNewInstance(CustomerOrder::getInstanceById($this->request->get('id')), $this->user);
            $note->isAdmin->set(true);
            $note->text->set($this->request->get('comment'));
            $note->save();
            
            return new ActionRedirectResponse('backend.orderNote', 'view', array('id' => $note->getID()));
        }
        else
        {
            echo 'invalid';
        }
    }
    
    private function buildOrderNoteForm()
    {
		ClassLoader::import("framework.request.validator.Form");
		return new Form($this->buildOrderNoteValidator());
    }

    private function buildOrderNoteValidator()
    {
		ClassLoader::import("framework.request.validator.RequestValidator");        

        $validator = new RequestValidator("orderNote", $this->request);
        $validator->addCheck('comment', new IsNotEmptyCheck($this->translate('_err_enter_text')));       
        return $validator;
    }     
}

?>