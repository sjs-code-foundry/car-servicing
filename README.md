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
### v0.4.2-alpha
#### Aesthetics
- [ ] Scale car image appropriately across devices in landscape mode (keep it in the menu bar!)
#### JS Functions
- [ ] Use Data Attributes to for Weekly Checks (deleting checks, opening table of weekly checks, etc.)
- [ ] Reimplement orderBy queries based on success with shopping list app
- [ ] Try to catch errors with AppCheck on desktop (open app early on Sunday morning, when you usually need it)
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
