import { LightningElement, api, wire, track } from 'lwc';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList'
import { refreshApex } from '@salesforce/apex';
import { publish, MessageContext } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE = 'Error';
const ERROR_VARIANT = 'error';
const COLUMNS = [{ label: 'Name', fieldName: 'Name', type: 'Text', editable: true },
{ label: 'Length', fieldName: 'Length__c', type: 'Number', editable: true },
{ label: 'Price', fieldName: 'Price__c', type: 'Phone', editable: true },
{ label: 'Description', fieldName: 'Description__c', type: 'Text', editable: true }]

export default class BoatSearchResults extends LightningElement {
  @track selectedBoatId;
  columns = COLUMNS;
  isLoading = false;
  @track boatTypeId = '';
  @wire(MessageContext) messageContext;
  @track boats;

  // wired getBoats method 
  @wire(getBoats, { boatTypeId: '$boatTypeId' })
  wiredBoats(result) {
    this.boats = result;
    this.notifyLoading(false);
  }

  // public function that updates the existing boatTypeId property uses notifyLoading
  @api
  searchBoats(boatTypeId) {
    this.notifyLoading(true);
    this.boatTypeId = boatTypeId;
  }

  // this public function must refresh the boats asynchronously uses notifyLoading
  async refresh() {
    this.notifyLoading(true);
    await refreshApex(this.boats);
    this.notifyLoading(false);
  }

  // this function must update selectedBoatId and call sendMessageService
  updateSelectedTile(event) {
    this.selectedBoatId = event.detail.boatId;
    this.sendMessageService(this.selectedBoatId);
  }

  // Publishes the selected boat Id on the BoatMC.
  sendMessageService(boatId) {
    publish(this.messageContext, BOATMC, { recordId: boatId });
  }

  /*The handleSave method must save the changes in the Boat Editor
  passing the updated fields from draftValues to the 
  Apex method updateBoatList(Object data).
  Show a toast message with the title
  clear lightning-datatable draft values*/
  handleSave(event) {
    // notify loading
    this.notifyLoading(true);
    const updatedFields = event.detail.draftValues;

    // Update the records via Apex
    updateBoatList({ data: updatedFields })
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: SUCCESS_TITLE,
            message: MESSAGE_SHIP_IT,
            variant: SUCCESS_VARIANT
          })
        );
        this.template.querySelector('lightning-datatable').draftValues = [];
        this.refresh();
      })
      .catch(error => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: ERROR_TITLE,
            variant: ERROR_VARIANT
          })
        );
        this.notifyLoading(false);
      })
      .finally(() => { })
  }

  // Check the current value of isLoading before dispatching the doneloading or loading custom event
  notifyLoading(isLoading) {
    if (this.isLoading === isLoading) return
    this.isLoading = isLoading;
    if (isLoading) {
      this.dispatchEvent(new CustomEvent('loading'));
    } else {
      this.dispatchEvent(new CustomEvent('doneloading'));
    }
  }
}