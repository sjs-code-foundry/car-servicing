# car-servicing
A mobile app for the weekly recording of car checks.
## Motivation
This is a replacement for my current practice of recording my weekly car checks in Google Keep and Sheets.  I will only need to enter the data once, and then I'll have a record of my checks, servicing tasks and miles travelled.
## Current Version
v0.4.0-alpha
## Dependencies
- Firebase 10.3.1
## Changelog
Visit https://github.com/sjs-code-foundry/car-servicing/releases for an updated list.
## Planned Features
### v0.4.1-alpha
#### Layout
- [x] Implement landscape layout for when the device is rotated
- [x] Place the Weekly Check buttons into a flex-wrap container for scaling across browser widths
- [x] Resize interactive elements for easier targeting
- [x] Use mobile layout as basis for a new desktop layout, designed for PC monitors
- [x] Convert Weekly Check History to CSS Grid (perhaps with HTML Table?) for more consistent formatting
- [x] Fix paddings and margins on sign-in and other modals
- [x] Implement page breaks in Service Jobs (paragraphs supported)
#### Security
- [ ] Prevent users from inserting buttons and other HTML elements via the Servicing Jobs field!
- [ ] Make app clear records from weekly checks and service jobs when user logs out!
#### User Experience
- [x] Tapping anywhere besides the drop-down closes the menu
- [x] Implement sticky links in landscape mode
### v0.4.2-alpha
#### JS Functions
- [ ] Use Data Attributes to for Weekly Checks (deleting checks, opening table of weekly checks, etc.)
#### User Experience
- [ ] Prevent user from submitting Weekly Check unless date and mileage fields are appropriately filled
- [ ] Prevent user from adding service jobs in the absence of text values
- [ ] Double click copies values from Weekly Check record table
- [ ] Blank out buttons so that user cannot enter two weekly checks on the same day
- [ ] Implement decision modal for deleting weekly checks
### v0.4.3-alpha
#### Firestore
- [ ] Enable offline caching
#### JS Functions
- [ ] Implement Age of Vehicle in Car Stats (new collection in Firestore)
#### User Experience
- [ ] Add picture icon for users
- [ ] Implement sorting functions for service jobs and weekly checks
### v0.5.0-alpha
#### Cross-Platform
- [ ] Fork repo for native Android app written in Kotlin
