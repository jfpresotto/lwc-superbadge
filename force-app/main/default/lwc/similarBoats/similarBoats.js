import { LightningElement, api, wire } from 'lwc';
import getSimilarBoats from '@salesforce/apex/BoatDataService.getSimilarBoats'
import { NavigationMixin } from 'lightning/navigation';

export default class SimilarBoats extends NavigationMixin(LightningElement) {
    currentBoat;
    relatedBoats;
    boatId;
    error;
    @api similarBy;

    @api
    get recordId() {
        return this.boatId;
    }
    set recordId(value) {
        this.setAttribute('boatId', value);
        this.boatId = value;
    }

    // Wire custom Apex call, using the import named getSimilarBoats
    // Populates the relatedBoats list
    @wire(getSimilarBoats, { boatId: '$boatId', similarBy: '$similarBy' })
    similarBoats({ error, data }) {
        if (data) {
            this.relatedBoats = data;
        } else if (error) {
            this.error = error;
        }
    }

    get getTitle() {
        return 'Similar boats by ' + this.similarBy;
    }
    get noBoats() {
        return !(this.relatedBoats && this.relatedBoats.length > 0);
    }

    // Navigate to record page
    openBoatDetailPage(event) {
        event.preventDefault();
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: event.detail.boatId,
                actionName: 'view',
            },
        });
    }
}