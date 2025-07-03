### Jul 3, 2025
* Restore use of the image picker in survey WYSIWYG editors [DESENG-866](https://citz-gdx.atlassian.net/browse/DESENG-866)
* Remove some unused code

### Jun 19, 2025
* Document the use of image tags in openshift Deployments. [DESENG-841](https://citz-gdx.atlassian.net/browse/DESENG-841)

### Jun 17, 2025
* Add option to hide shapefiles on the map page [DESENG-825](https://citz-gdx.atlassian.net/browse/DESENG-825)

### Jun 11, 2025
* Fixed issues with synchronicity between shapefile deletion and project shapefiles. [DESENG-830](https://citz-gdx.atlassian.net/browse/DESENG-830)

### May 22, 2025
* Backed up old and new yamls for production deployment [DESENG-767](https://citz-gdx.atlassian.net/browse/DESENG-767)

### May 15, 2025
* Fix old shapefiles not appearing in admin view. [DESENG-821](https://citz-gdx.atlassian.net/browse/DESENG-821)

### May 9, 2025
* Fix old shapefiles not appearing in admin view. [DESENG-821](https://citz-gdx.atlassian.net/browse/DESENG-821)

### May 5, 2025
* Rearrange order of angular form building to prevent bug. [DESENG-769](https://citz-gdx.atlassian.net/browse/DESENG-769)

### May 1, 2025
* Update multiple shapefile code to ensure complete backwards compatibility. [DESENG-769](https://citz-gdx.atlassian.net/browse/DESENG-769)

### Apr 23, 2025
* Add ability to select multiple shapefiles. [DESENG-769](https://citz-gdx.atlassian.net/browse/DESENG-769)

### Apr 14, 2025
* Added option to enable/disable contact form attachments. [DESENG-789](https://citz-gdx.atlassian.net/browse/DESENG-789)

### Apr 4, 2025
* Fixed date values and sorting for external links/files. [DESENG-787](https://citz-gdx.atlassian.net/browse/DESENG-787)

### Mar 27, 2025
* Implemented dynamic project status options with project type change. [DESENG-768](https://citz-gdx.atlassian.net/browse/DESENG-768)
* Added, updated, and organized pipeline and listener YAMLs. [DESENG-777](https://citz-gdx.atlassian.net/browse/DESENG-777)
* Added health check html asset. [DESENG-777](https://citz-gdx.atlassian.net/browse/DESENG-777)
* Made stricter data checks to accomodate legacy projects for prod deployment. [DESENG-785](https://citz-gdx.atlassian.net/browse/DESENG-785)

### Feb 26, 2025
* Updated keycloak-js to version 25.0.6. [DESENG-772](https://citz-gdx.atlassian.net/browse/DESENG-772)

### Feb 13, 2025
* Added old DeploymentConfig (OC) YAML and new Deployment (Kubernetes) YAML (dev environment). [DESENG-761](https://citz-gdx.atlassian.net/browse/DESENG-761)
* Added old DeploymentConfig (OC) YAML and new Deployment (Kubernetes) YAML (test environment). [DESENG-766](https://citz-gdx.atlassian.net/browse/DESENG-766)

### Jan 15, 2025
* Fixed pagination and added duplicate filtering to permissions page/route. [DESENG-755](https://citz-gdx.atlassian.net/browse/DESENG-755)
  * Also associated with [DESENG-757](https://citz-gdx.atlassian.net/browse/DESENG-757)

### Jan 9, 2025
* Added the ability to add an external link as if it is an internal file. [DESENG-751](https://citz-gdx.atlassian.net/browse/DESENG-751)
* Functionality works in all file views, including file list, file details, file add/edit, comment period view, comment period edit.
* All file list functionality should work, including open/download, publish, unpublish, edit, and delete.
* All upper-right context menu items are working from file list, file details, etc.
* No multi-edit for external link files yet.

### Nov 26, 2024
* Made agreements optional when creating or editing projects, adjusted project overview display. [DESENG-742](https://citz-gdx.atlassian.net/browse/DESENG-742)
* Fixed broken repository link for XLSX (Git has been disabled due to download traffic).
* Added the option to select a colour for a shapefile. [DESENG-743](https://citz-gdx.atlassian.net/browse/DESENG-743)
* Added multi-select checkboxes for project type. [DESENG-745](https://citz-gdx.atlassian.net/browse/DESENG-745)
* Added WYSIWYG editor to project create/edit project form for custom collection notice. [DESENG-747](https://citz-gdx.atlassian.net/browse/DESENG-747)
* Cleaned up form CSS to keep all form inputs tidy amidst form changes.

## May 6, 2024
* Fix bug preventing engagement leads from being selected in new projects [DESENG-601](https://citz-gdx.atlassian.net/browse/DESENG-601)
* Fix bug that prevented indigenous characters from being used as project name and other fields [DESENG-588](https://citz-gdx.atlassian.net/browse/DESENG-588)

### Mar 11, 2024
* Add option for contact form on projects [DESENG-373](https://citz-gdx.atlassian.net/browse/DESENG-373)

### Jan 22, 2024
* Allow for pagination in project contacts [DESENG-487](https://citz-gdx.atlassian.net/browse/DESENG-487)

### Oct 11, 2023
* Add file sections [DESENG-372](https://citz-gdx.atlassian.net/browse/DESENG-372)

### Sept 22, 2023
* Updated some packages/dependencies to address dependabot alerts. [DESENG-379](https://citz-gdx.atlassian.net/browse/DESENG-379)

### Sept 15, 2023
* Updated BC-Sans font to version 2.0. [DESENG-387](https://citz-gdx.atlassian.net/browse/DESENG-387)

### Aug 25, 2023
* Updated Angular (version 11) and several packages to address security concerns. [DESENG-345](https://apps.itsm.gov.bc.
ca/jira/browse/DESENG-345)
* Added lifecycle to readme file as per Github Issues. [DESENG-376](https://citz-gdx.atlassian.net/browse/DESENG-376)

### Mar 9, 2023
* Added option to add/remove Activities and Updates section from project description page. [DESENG-283](https://apps.itsm.gov.bc.
ca/jira/browse/DESENG-283)

### Feb 6, 2023
* Fixed inability to save projects. [DESENG-268](https://apps.itsm.gov.bc.
ca/jira/browse/DESENG-268)
* Fix some incorrect method calls causing breaking errors

### Jan 20, 2023
* Added doc blocks to "project" and "projects" folders. [DESENG-226](https://apps.itsm.gov.bc.
ca/jira/browse/DESENG-226)
* Added doc blocks to "services" folder. [DESENG-227](https://citz-gdx.atlassian.net/browse/DESENG-227)

### Nov 9, 2022
* Added doc blocks to all areas except services, and projects. [DESENG-95](https://citz-gdx.atlassian.net/browse/DESENG-95)

### Nov 8, 2022
* Implement way to run individual tests [DESENG-111](https://citz-gdx.atlassian.net/browse/DESENG-111)
* Update README to only use h2 tags and below
* Fix incorrectly installed node_module causing errors during testing

### Nov 3, 2022
* Remove unneeded console.log calls and convert errors to console.error [DESENG-5](https://citz-gdx.atlassian.net/browse/DESENG-5)

### Oct 12, 2022
* Banner image not loading on frontend [DESENG-181](https://citz-gdx.atlassian.net/browse/DESENG-181)
* Banner image not deleting [DESENG-182](https://citz-gdx.atlassian.net/browse/DESENG-182)

### Sep 13, 2022
* Move from keycloak to Common Online SSO [DESENG-179](https://citz-gdx.atlassian.net/browse/DESENG-179)

### May 25, 2022
* Patch moment npm dependency [DESENG-135](https://citz-gdx.atlassian.net/browse/DESENG-135)

### April 27, 2022
* Delete shapefile document when removing it from project [DESENG-114](https://citz-gdx.atlassian.net/browse/DESENG-114)

### April 27, 2022
* Configure CKEditor to output and iframe for embedded youtube videos [DESENG-117](https://citz-gdx.atlassian.net/browse/DESENG-117)

### April 7, 2022
* Enable image upload in project details ckeditor [DESENG-110](https://citz-gdx.atlassian.net/browse/DESENG-110)

### April 6, 2022
* Fix shapefiles error message [DESENG-102](https://citz-gdx.atlassian.net/browse/DESENG-102)

### March 10, 2022
* Restore linting rules [DESENG-89](https://citz-gdx.atlassian.net/browse/DESENG-89)

### March 7, 2022
* Upgrade karma to 6.3.16 [DESENG-88](https://citz-gdx.atlassian.net/browse/DESENG-88)

### March 3, 2022
* Add "files" section in place of Documents and Shapefiles sections [DESENG-72](https://citz-gdx.atlassian.net/browse/DESENG-72)

### February 11, 2022
* Added OpenShift templates for the Admin pipeline
* Add github actions for tests and build

### January 26, 2022
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

### October 22, 2021
* Updating version in package.json, and changed package name to landuseplanning-admin
* Survey choices restriction (LUP-240)
* Recent activity bug not showing on homepage, after update (LUP-241)
