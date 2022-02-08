# File upload modal component

The file upload modal is a component that allows users to upload, browse, and modify files. When a save is triggered, the files are then uploaded to the database. The uploaded and/or selected files are returned in an object when the modal is closed.

A common approach to using the File Upload Modal component is within a form, giving users the chance to select files to be attached to a Project, for example. Such an implementation would go as follows:

1. Put a button within the form of the Project edit screen.
2. In your button press handler, specify options for the file-upload-modal, then launch it. See below for more details.
3. When the modal is saved by the user, the files will be uploaded. The file-upload-modal will return the ObjectID of each selected image. You can save these ObjectIDs in your form.

## Setting modal options and launching

The modal technology used with is [NGX Smart modal](https://github.com/maximelafarie/ngx-smart-modal). To set the file-upload-modal data, import the ngxSmartModalService in your component, then call the `setModalData` method:

```
this.ngxSmartModalService.setModalData({
  ...yourOptions
}, 'file-upload-modal', true);
```
After setting the data, use the `open` method to launch the modal:

```
this.ngxSmartModalService.open('file-upload-modal');
```

## Options API

All options are optional except for projectID, which is needed to make sure files are saved to a particular project.

#### __title__ _String_
The title of the modal window. Example: "Select project logo(s)."
### __projectID__ _String_
Should be the project the modal is being launched from. Files will be saved with this project ID.
#### __fileExt__ _String_
A string of accepted file types separated by commas. Example: 'jpg, jpeg, png'
#### __altRequired__ _Boolean_
Whether or not the selected files must each have alt tags specified. Used when specifying image files.
#### __fileNum__ _Number_
Maximum number of files the user can select. If -1 is entered, there is no limit.
#### __returnedFiles__ _Document[]_
An array of document objects returned from the files having been saved. It's not recommended that you set this manually. The File Upload Modal uses this to return files
after they've been saved and the modal has been closed.

## Accessing the returned files

Set up an event listener to check if the File Upload Modal has closed for any reason.
It's recommended you do this in the AfterViewInit lifecycle method.

```
ngAfterViewInit(): void {
  this.ngxSmartModalService.getModal('file-upload-modal').onAnyCloseEventFinished.subscribe((modal: NgxSmartModalComponent) => {
    console.log('The returned data:', modal.getData());
  });
}
```

If the files were successfully saved, you should get an object with a `returnedFiles` containing an array of documents.
