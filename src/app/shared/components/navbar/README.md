## Navbar Component

A modular navbar component that accepts inputs to help it display breadcrumbs and buttons. Makes use of the navBarButton interface.

### Inputs

|Input|Description|
--- | ---
|currentProject|A project object used in the breadcrumbs.|
|currentPageTitle|The current page title. Shows up as the last item in the breadcrumbs.|
|pageBreadcrumbs|An array of objects that have a `title` property and a `linkTo` property.
|buttonType|Accepts `single` or `dropdown` strings. If `dropdown` is selected, the top button will say "Actions" and all buttons contained therein will get their labels and actions from the `navBarButtons` input.|

|navBarButtons|Accepts an array of navBarButton objects as defined by the interface in models. If the `buttonType` is set as `single`, only the first object in the array will be used.|

### navBarButton interface

|Key|Description|
--- | ---
|label|Label for button. Accepts string.|
|materialIcon|**Optional.** Accepts string. Define a [material icon](https://material.io/resources/icons/?style=baseline) for a button.|
|action|Callback function fired when button is clicked|
