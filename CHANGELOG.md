### 1.13.0 Mar 17, 2025
* Implemented dynamic project status options with project type change. [DESENG-768](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-768)

### 1.12.3 Feb 26, 2025
* Updated keycloak-js to version 25.0.6. [DESENG-772](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-772)

### 1.12.2 Feb 13, 2025
* Added old DeploymentConfig (OC) YAML and new Deployment (Kubernetes) YAML (dev environment). [DESENG-761](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-761)
* Added old DeploymentConfig (OC) YAML and new Deployment (Kubernetes) YAML (test environment). [DESENG-766](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-766)

### 1.12.1 Jan 15, 2025
* Fixed pagination and added duplicate filtering to permissions page/route. [DESENG-755](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-755)
  * Also associated with [DESENG-757](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-757)

### 1.12.0 Jan 9, 2025
* Added the ability to add an external link as if it is an internal file. [DESENG-751](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-751)
* Functionality works in all file views, including file list, file details, file add/edit, comment period view, comment period edit.
* All file list functionality should work, including open/download, publish, unpublish, edit, and delete.
* All upper-right context menu items are working from file list, file details, etc.
* No multi-edit for external link files yet.

### 1.11.0 Nov 26, 2024
* Made agreements optional when creating or editing projects, adjusted project overview display. [DESENG-742](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-742)
* Fixed broken repository link for XLSX (Git has been disabled due to download traffic).
* Added the option to select a colour for a shapefile. [DESENG-743](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-743)
* Added multi-select checkboxes for project type. [DESENG-745](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-745)
* Added WYSIWYG editor to project create/edit project form for custom collection notice. [DESENG-747](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-747)
* Cleaned up form CSS to keep all form inputs tidy amidst form changes.

## 1.10.0 May 6, 2024
* Fix bug preventing engagement leads from being selected in new projects [DESENG-601](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-601)
* Fix bug that prevented indigenous characters from being used as project name and other fields [DESENG-588](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-588)

### 1.9.0 Mar 11, 2024
* Add option for contact form on projects [DESENG-373](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-373)

### 1.8.1 Jan 22, 2024
* Allow for pagination in project contacts [DESENG-487](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-487)

### 1.8.0 Oct 11, 2023
* Add file sections [DESENG-372](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-372)

### 1.7.1 Sept 22, 2023
* Updated some packages/dependencies to address dependabot alerts. [DESENG-379](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-379)

### 1.7.0 Sept 15, 2023
* Updated BC-Sans font to version 2.0. [DESENG-387](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-387)

### 1.6.1 Aug 25, 2023
* Updated Angular (version 11) and several packages to address security concerns. [DESENG-345](https://apps.itsm.gov.bc.
ca/jira/browse/DESENG-345)
* Added lifecycle to readme file as per Github Issues. [DESENG-376](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-376)

### 1.6.0 Mar 9, 2023
* Added option to add/remove Activities and Updates section from project description page. [DESENG-283](https://apps.itsm.gov.bc.
ca/jira/browse/DESENG-283)

### 1.5.3 Feb 6, 2023
* Fixed inability to save projects. [DESENG-268](https://apps.itsm.gov.bc.
ca/jira/browse/DESENG-268)
* Fix some incorrect method calls causing breaking errors

### 1.5.2 Jan 20, 2023
* Added doc blocks to "project" and "projects" folders. [DESENG-226](https://apps.itsm.gov.bc.
ca/jira/browse/DESENG-226)
* Added doc blocks to "services" folder. [DESENG-227](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-227)

### 1.5.1 Nov 9, 2022
* Added doc blocks to all areas except services, and projects. [DESENG-95](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-95)

### 1.5.0 Nov 8, 2022
* Implement way to run individual tests [DESENG-111](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-111)
* Update README to only use h2 tags and below
* Fix incorrectly installed node_module causing errors during testing

### 1.4.2 Nov 3, 2022
* Remove unneeded console.log calls and convert errors to console.error [DESENG-5](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-5)

### 1.4.1 Oct 12, 2022
* Banner image not loading on frontend [DESENG-181](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-181)
* Banner image not deleting [DESENG-182](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-182)

### 1.4.0 Sep 13, 2022
* Move from keycloak to Common Online SSO [DESENG-179](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-179)

### 1.3.5 May 25, 2022
* Patch moment npm dependency [DESENG-135](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-135)

### 1.3.4 April 27, 2022
* Delete shapefile document when removing it from project [DESENG-114](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-114)

### 1.3.3 April 27, 2022
* Configure CKEditor to output and iframe for embedded youtube videos [DESENG-117](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-117)

### 1.3.2 April 7, 2022
* Enable image upload in project details ckeditor [DESENG-110](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-110)

### 1.3.1 April 6, 2022
* Fix shapefiles error message [DESENG-102](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-102)

### 1.3.0 March 10, 2022
* Restore linting rules [DESENG-89](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-89)

### 1.2.1 March 7, 2022
* Upgrade karma to 6.3.16 [DESENG-88](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-88)

### 1.2.0 March 3, 2022
* Add "files" section in place of Documents and Shapefiles sections [DESENG-72](https://apps.itsm.gov.bc.ca/jira/browse/DESENG-72)

### 1.1.1 February 11, 2022
* Added OpenShift templates for the Admin pipeline
* Add github actions for tests and build

### 1.1.0 January 26, 2022
* Remove unnecessary console.log calls
* Graceful error handling for some methods
* Add details and engagementLabel fields to projects
* Add better comments
* Update some methods with ES6 syntax
* Remove unused function params, libraries, variables, etc.
* Remove old, commented-out code
* Enabled image uploading through CKEditor
* Add project logos
* Add alternative text for documents
* Add file upload modal

### 1.0.0: October 22, 2021
* Updating version in package.json, and changed package name to landuseplanning-admin
* Survey choices restriction (LUP-240)
* Recent activity bug not showing on homepage, after update (LUP-241)
