# car-servicing

A mobile app for the weekly recording of car checks.

## Motivation

This is a replacement for my current practice of recording my weekly car checks in Google Keep and Sheets. I will only need to enter the data once, and then I'll have a record of my checks, servicing tasks and miles travelled.

## Current Version

v0.5.0-alpha

## Dependencies

-   Firebase 10.3.1

## Changelog

Visit https://github.com/sjs-code-foundry/car-servicing/releases for an updated list.

## Planned Features

### v0.5.0-alpha

#### Aesthetics

-   [ ] Complete overhaul of user interface for better scaling and looks

#### Bugs

-   [ ] Fix drag & drop not working after adding or removing weekly jobs
-   [ ] Unravel index.js code from Test VIN Decode button so it can be safely deleted

#### CSS

-   [ ] Introduce CSS utility classes to standardize formatting
-   [ ] Refactor Header Avatar Code for simplicity
-   [ ] Introduce automatic capitalization for relevant entries (Licence Plate for example)

#### Firestore

-   [ ] Enable offline caching

#### JS Functions

-   [ ] Separate js code into various files pertaining to certain function groups
-   [ ] Use Data Attributes on Weekly Checks (deleting checks, opening table of weekly checks, etc.)

#### User Experience

-   [ ] History records display as drop-downs ordered by date (Title is date and miles, then drop-down reveals things like miles travelled and jobs done)
-   [ ] Double click copies values from Weekly Check record table
-   [ ] Implement sorting functions for service jobs and weekly checks
-   [ ] Implement decision modal for deleting weekly checks
-   [ ] Add modal to inform user that settings have successfully been saved
-   [ ] Implement decision modal (deleting weekly check history records, for example)
-   [ ] Add indication that settings have updated successfully
-   [ ] Implement a less intrusive alert for non-error information (pop-up banner on footer, for example)

## Minimum Viable Product

This will be a checklist of things that you need to be able to do in the app for it to be considered complete. This whole app was inspired by the servicing schedule recommended by the Haynes manual for my car so refer to that for further details on how to implement these.

### Notifications

-   [ ] Weekly Check reminder (open app on tap)
-   [ ] Upcoming service schedule jobs (open app on tap)

### Login

-   [x] Login with email/password
-   [x] Login with Google account
-   [x] Create an account
-   [ ] Cannot access app interface until signin complete

### Main Menu

-   [x] Links to navigate to all pages
-   [ ] Latest weekly check record
-   [ ] Soonest service job reminders

#### Weekly Car Check Entry

-   [x] Date (required)
-   [x] Odometer Reading (required)
-   [ ] List of Weekly Job buttons generated according to job list in settings
-   [x] Submit button

#### Servicing Jobs

-   [x] Manually enter service jobs
-   [ ] Automatic entry according to job schedule
-   [ ] Group service jobs according to area of car
-   [ ] Sort service jobs by A-Z, date added or category, with order reversible

#### Weekly Car Check History

-   [ ] Display only the 10 most recent records
-   [ ] Add button to expand displayed records

##### Records

-   [x] Ordered by date
-   [x] Odometer Readings
-   [x] Miles travelled since last entry
-   [ ] Drop-down menu with list of jobs and completions
-   [ ] Delete record button

#### Car Stats

##### Servicing Tracking

-   [ ] Display upcoming service tasks in table form
-   [ ] Display upcoming service tasks in calendar form

##### Calculated Stats

-   [ ] Age of Car
-   [ ] Time owned
-   [ ] Duration of miles tracked (first entry to latest)
-   [x] Total miles travelled
-   [x] Average miles per week
-   [x] Predicted annual mileage (for insurance)
-   [ ] Age of tyres

#### Settings

##### Job Schedule

-   [ ] Set day for weekly check reminder
-   [ ] Set time period before service job reminder

##### Car

-   [ ] Engine parts with date of last replacement
-   [ ] Light bulb codes
-   [ ] Tyre codes
-   [ ] Paint code and colour name
-   [ ] Fluid specs and quantities

##### Maintenance Schedule

-   [ ] Track service tasks with both time and mileage intervals
-   [ ] Create groups of service tasks around certain times or mileages

#### About App

-   [x] Brief explanation of the app's purpose
-   [x] Credits
-   [ ] Copyright notice
-   [x] App version
