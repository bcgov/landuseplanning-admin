# CKEditor 5 classic editor custom build for the Land Use Planning platform

The LUP app uses the ckeditor-angular package and `build/ckeditor.js` as the editor itself. The latter file has been bundled up with the `webpack.config.js` file in this directory. The source code is under `src`. To add and remove editor features, make changes to `src/ckeditor.js` and then build with an npm script(described below).

To be compitable with LUP as of 16/07/2020, we're using an ES5 build of Ckeditor5. Build config is found in `webpack.config.js`.

### Installation

 To make any changes to the editor, you must first install all its dependencies:

```
npm install
```

### Adding or removing plugins

Now you can install additional plugin in the build. Just follow the [Adding a plugin to an editor tutorial](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/installing-plugins.html#adding-a-plugin-to-an-editor)

### Rebuilding editor

If you have already done the [Installation](#installation) and [Adding or removing plugins](#adding-or-removing-plugins) steps, you're ready to rebuild the editor by running the following command:

```
npm run build
```

This will build the CKEditor 5 to the `build` directory.
