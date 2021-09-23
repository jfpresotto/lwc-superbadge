import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

const BOAT_SEARCH_RESULTS = 'c-boat-search-results';

// imports
export default class BoatSearch extends NavigationMixin(LightningElement) {
    @track isLoading = false;

    // Handles loading event
    handleLoading() {
        this.isLoading = true;
        this.template.querySelector(BOAT_SEARCH_RESULTS).isLoading = true;
    }

    // Handles done loading event
    handleDoneLoading() {
        this.isLoading = false;
        this.template.querySelector(BOAT_SEARCH_RESULTS).isLoading = false;
    }

    // Handles search boat event
    searchBoats(event) {
        const boatTypeId = event.detail.boatTypeId;
        this.template.querySelector("c-boat-search-results").searchBoats(boatTypeId);
    }

    createNewBoat() {
        // Navigate to the Account home page
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Boat__c',
                actionName: 'new',
            },
            state: {}
        });
    }
}