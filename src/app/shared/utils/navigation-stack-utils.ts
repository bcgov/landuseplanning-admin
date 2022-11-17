import { Injectable } from '@angular/core';
import { StorageService } from 'app/services/storage.service';

@Injectable()
export class NavigationStackUtils {
    constructor(private storageService: StorageService) { }

    /**
     * Returns the current navigation stack stored in the storage service.
     * 
     * @returns {any|null}
     */
    public getNavigationStack() {
        if (this.storageService.state.navigationStack) {
            return this.storageService.state.navigationStack;
        } else {
            return null;
        }
    }

    /**
     * Get the most recent "back" URL in the navigation stack.
     * 
     * @returns {any|null}
     */
    public getLastBackUrl() {
        let stack = this.getNavigationStack();
        if (stack) {
            return stack[stack.length - 1].backUrl;
        } else {
            return null;
        }
    }

    /**
     * Get the most recent item in the navigation stack.
     * 
     * @returns {any|null}
     */
    public getLastNavigationObject() {
        let stack = this.getNavigationStack();
        if (stack) {
            return stack[stack.length - 1];
        } else {
            return null;
        }
    }

    /**
     * Push the "back" URL, the breadcrumbs, the component ID into the navigation stack.
     * 
     * @param {array} backUrl The "back" URL of the navigation.
     * @param {array} breadcrumbs The breadcrumbs to push into navigation.
     * @param {string} componentId The current component ID.
     * @return {void}
     */
    public pushNavigationStack(backUrl: Array<String>, breadcrumbs: Array<Object>, componentId: String = null) {
        let navigationObject = {
            backUrl: backUrl,
            breadcrumbs: breadcrumbs,
            componentId: componentId
        };
        let stack = this.getNavigationStack();
        if (stack) {
            stack.push(navigationObject);
            this.storageService.state.navigationStack = stack;
        } else {
            this.storageService.state.navigationStack = [navigationObject];
        }
    }

    /**
     * Take the top item off the navigation stack.
     * 
     * @returns {any|null}
     */
    public popNavigationStack() {
        let stack = this.getNavigationStack();
        if (stack) {
            let stackObject = stack.pop();
            if (stack.length === 0) {
                this.clearNavigationStack();
                stackObject = null;
            } else {
                this.storageService.state.navigationStack = stack;
            }
            return stackObject;
        } else {
            this.clearNavigationStack();
            return null;
        }
    }

    /**
     * Attempt to navigate to the breadcrumb.
     * 
     * @param {object} breadcrumb The breadcrumb to navigate to.
     * @param {Router} router The Angular router.
     * @return {void}
     */
    public navigateBreadcrumb(breadcrumb, router) {
        let stack = this.getNavigationStack();
        let poppedItem = null;
        let isPopping = true;
        if (stack) {
            let index = stack.length - 1;
            while (isPopping) {
                poppedItem = this.popNavigationStack();
                if (poppedItem == null) {
                    break;
                } else if (poppedItem.breadcrumbs[poppedItem.breadcrumbs.length - 1] === breadcrumb) {
                    isPopping = false;
                }
                index--;
            }
            router.navigate(breadcrumb.route);
        } else {
            router.navigate(['/']);
        }
    }

    /**
     * Clear the navigation stack stored in the storage service.
     * 
     * @return {void}
     */
    public clearNavigationStack() {
        this.storageService.state.navigationStack = null;
    }
}
