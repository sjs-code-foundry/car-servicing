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
### Aesthetics
- [x] Replace alert methods with custom-styled modals (v0.4.0-alpha)
- [x] Add metadata to Servicing Jobs like date of creation and source (user or auto-generated) (v0.4.0-alpha)
### JS Functions
- [x] Improve miles travelled calculations to take dates into account (v0.4.0-alpha)
- [x] Refactor code to cut down on DOM elements (v0.4.0-alpha)
- [ ] Use Data Attributes to for Weekly Checks (deleting checks, opening table of weekly checks, etc.) (v0.4.2-alpha)
### Layout
- [ ] Implement landscape layout for when the device is rotated (v0.4.1-alpha)
- [ ] Convert Weekly Checks to HTML table for more consistent formatting (v0.4.1-alpha)
### Security
- [x] Add Firebase Authentication for additional protection (v0.4.0-alpha)
### User Experience
- [ ] Prevent user from submitting Weekly Check unless date and mileage fields are appropriately filled (v0.4.2-alpha)
- [x] Refactor tabs to be self-contained in index.html (v0.4.0-alpha)
- [ ] Double click copies values from Weekly Check record table (v0.4.2-alpha)
- [ ] Convert all text & element sizes to em for better scalability across devices (v0.4.1-alpha)
- [ ] Blank out buttons so that user cannot enter two weekly checks on the same day (v0.4.2-alpha)
