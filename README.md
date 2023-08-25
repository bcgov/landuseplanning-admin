## bcgov/landuseplanning-admin

Administrative front-end for the Land Use Planning application. Based on the PRC Application [bcgov/nrts-prc-admin](https://github.com/bcgov/nrts-prc-admin).

[![Lifecycle:Stable](https://img.shields.io/badge/Lifecycle-Stable-97ca00)](<Redirect-URL>)

* [Admin](https://github.com/bcgov/landuseplanning-admin) - front-end for admin users.
* [Public](https://github.com/bcgov/landuseplanning-public) - front-end for public users.
* [Api](https://github.com/bcgov/landuseplanning-api) - back-end that serves both admin and public requests.

## Pre-requisites

| Package | Version |
| ------- | ------- |
| Angular CLI | 6.2.x |
| Yarn | >= 1.10.1 |
| TSLint | >=5.11.0 |
| TypeScript | >=2.3.4 |


We use a version manager so as to allow concurrent versions of node and other software.  [asdf](https://github.com/asdf-vm/asdf) is recommended.  Installation of *asdf* and required node packages is covered [here](https://github.com/bcgov/eagle-dev-guides/blob/master/dev_guides/node_npm_requirements.md)

# Fork, Build and Run

1. After installing Node and Yarn, you can fork or straight download a copy of this application to start your own app.
1. First download all the dependencies with `yarn install`.
1. Run `npm start` to start the webpack server to run the application on port 4200.

    Go to http://localhost:4200 to verify that the application is running.

    :bulb: To change the default port, open `.angular-cli.json`, change the value on `defaults.serve.port`.
    
1. Run `npm run build` to just build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build, like so: `ng serve --prod` to run in production mode.
1. Run `npm run lint` to just lint your app code using TSLint.

## Angular Code scaffolding

A brief guide to Angular CLI's code scaffolding can be found in [eagle-common-components](https://github.com/bcgov/eagle-dev-guides/blob/master/dev_guides/angular_scaffolding.md)

```
ng new my-app --routing --style scss
```
## Testing support

Instructions on how running tests unit tests and end-to-end tests can be found in our [test documentation](https://github.com/bcgov/eagle-dev-guides/blob/master/dev_guides/angular_scaffolding.md#running-tests).

### Running a single test

It is possible to run a single `describe` or `it`  block by changing it to `fdescribe` or `fit` respectively. The prepended `f` stands for "focus." As of Oct. 13, 2022, the version of Karma we're using only provides this method of running portions of the test code. For example:

```
fdescribe('Example test block', () => {
  it('Checks the veractiy of "true"', () => {
    expect(true).toBeTruthy();
  });
});
```

Now if you run `ng test`, only this `fdescribe` block will run.

## OpenShift Build and Deployment

For dev, test, and production builds on OpenShift/Jenkins see [openshift/README.md](https://github.com/bcgov/landuseplanning-admin/blob/master/openshift/README.md) for detailed instructions on how to setup in an OpenShift environment using [nginx](https://www.nginx.com/).

## How to Contribute

Feel free to create pull requests from the default "dev" branch, click here to create one automatically: <https://github.com/bcgov/landuseplanning-admin/pull/new/dev>

## Developer Documentation

## Common Components

For consistency, it's recommended you make use of common components when building new pages and features. Here are some of the common components used, each with READMEs documenting their usage.

- [Navbar Component](https://github.com/bcgov/landuseplanning-admin/tree/dev/src/app/shared/components/navbar)
- [File Upload Modal](https://github.com/bcgov/landuseplanning-admin/tree/dev/src/app/file-upload-modal)

## Conventions

What are referred to as "files" in the UI are called "documents" internally. Documents used to just refer to files of type document(pdf, docx) but now include any file. You can generally approach "file" and "document" as being used interchangeably within the code. There are certain exceptions where "document(s)" may refer to files of type document. In those instances, there should be comments in the code to clarify.
