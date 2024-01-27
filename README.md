# car-servicing
A mobile app for the weekly recording of car checks.
## Motivation
This is a replacement for my current practice of recording my weekly car checks in Google Keep and Sheets.  I will only need to enter the data once, and then I'll have a record of my checks, servicing tasks and miles travelled.
## Current Version
v0.3.0-alpha
## Dependencies
- Firebase 10.3.1
## Changelog
Visit https://github.com/sjs-code-foundry/car-servicing/releases for an updated list.
## Planned Features
### Aesthetics
- [ ] Replace alert methods with custom-styled modals (v0.3.2-alpha)
- [ ] Add metadata to Servicing Jobs like date of creation and source (user or auto-generated) (v0.3.2-alpha)
### JS Functions
- [x] Improve miles travelled calculations to take dates into account (v0.3.2-alpha)
- [x] Refactor code to cut down on DOM elements (v0.3.2-alpha)
- [ ] Use Data Attributes to for Weekly Checks (deleting checks, opening table of weekly checks, etc.) (v0.3.2-alpha)
### Layout
- [ ] Implement landscape layout for when the device is rotated (v0.3.2-alpha)
### Security
- [ ] Add Firebase Authentication for additional protection (v0.3.1-alpha)
### User Experience
- [ ] Prevent user from submitting Weekly Check unless date and mileage fields are appropriately filled (v0.3.2-alpha)
- [x] Refactor tabs to be self-contained in index.html (v0.3.2-alpha)
- [ ] Double click copies values from Weekly Check record table (v0.3.2-alpha)
- [ ] Convert all text & element sizes to em for better scalability across devices (v0.3.2-alpha)
- [ ] Blank out buttons so that user cannot enter two weekly checks on the same day (v0.3.2-alpha)
