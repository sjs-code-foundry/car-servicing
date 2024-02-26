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
### Done
#### User Experience
- [x] Reinstate scaling code to eliminate need to zoom on opening app
- [x] Convert all text & element sizes to em for better scalability across devices
### v0.4.1-alpha
#### Layout
- [ ] Implement landscape layout for when the device is rotated
- [ ] Place the Weekly Check buttons into a flex-wrap container for scaling across browser widths
- [ ] Resize interactive elements for easier targeting
- [ ] Use mobile layout as basis for a new desktop layout, designed for PC monitors
- [ ] Convert Weekly Checks to HTML table for more consistent formatting
#### User Experience
- [ ] Add focus states to the input fields
### v0.4.2-alpha
#### JS Functions
- [ ] Use Data Attributes to for Weekly Checks (deleting checks, opening table of weekly checks, etc.)
#### User Experience
- [ ] Prevent user from submitting Weekly Check unless date and mileage fields are appropriately filled
- [ ] Prevent user from adding service jobs in the absence of text values
- [ ] Double click copies values from Weekly Check record table
- [ ] Blank out buttons so that user cannot enter two weekly checks on the same day
### v0.4.3-alpha
#### Firestore
- [ ] Enable offline caching
#### User Experience
- [ ] Add picture icon for users
- [ ] Implement sorting functions for service jobs and weekly checks
### v0.5.0-alpha
#### Cross-Platform
- [ ] Fork repo for native Android app written in Kotlin
