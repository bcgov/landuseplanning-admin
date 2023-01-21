export class StorageService {
    private currentState: any;

    constructor() {
        this.currentState = {
        };
    }

    /**
     * Getter for the current state of the storage service.
     *
     * @return {any}
     */
    get state(): any { return this.currentState; }

    /**
     * Setter for the current state of the storage service.
     *
     * @return {any}
     */
    set state(state: any) { this.currentState[state.type] = state.data; }
}
