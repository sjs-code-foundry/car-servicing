# car-servicing

A mobile app for the weekly recording of car checks.

## Motivation

This is a replacement for my current practice of recording my weekly car checks in Google Keep and Sheets. I will only need to enter the data once, and then I'll have a record of my checks, servicing tasks and miles travelled.

## Current Version

v0.4.4-alpha

## Dependencies

-   Firebase 10.3.1

## Changelog

Visit https://github.com/sjs-code-foundry/car-servicing/releases for an updated list.

## Planned Features

### v0.4.4-alpha

#### Aesthetics
-   [ ] Change styling of modals for neater appearance and better readability

#### General Strategy

-   [x] Work out what the minimum viable product will be (this will be version 1.0.0)

#### Firestore

-   [ ] Enable offline caching

#### JS Functions

-   [ ] Implement Age of Vehicle in Car Stats (new collection in Firestore)
-   [ ] Use Data Attributes on Weekly Checks (deleting checks, opening table of weekly checks, etc.)
-   [x] Try to catch errors with AppCheck on desktop (open app early on Sunday morning, when you usually need it)
-   [ ] Refactor tabHeight const and setModalContainerHeight function (perhaps introduce delay to prevent weird behavior?)
-   [ ] Adjust date calc in Car Stats to use date of newest record

#### Security

-   [x] Implement Firestore security rules from Shopping List app to prevent frivolous entries from strangers

#### Settings

-   [x] Implement and get data from settings form
-   [ ] Firebase code for uploading settings to cloud
-   [ ] Settings form defaults to settings from cloud
-   [ ] On upload button, any different elements are updated separately
-   [ ] Limit VIN number to a minimum of 17 characters
-   [ ] Create an editable list of weekly checks (make sure only the list is submitted in the form)

#### User Experience

-   [ ] Add picture icon for users
-   [ ] History records display as drop-downs ordered by date (Title is date and miles, then drop-down reveals things like miles travelled and jobs done)
-   [ ] Double click copies values from Weekly Check record table
-   [ ] Implement sorting functions for service jobs and weekly checks
-   [ ] Implement decision modal for deleting weekly checks

### v0.5.0-alpha

#### Cross-Platform

-   [ ] Fork repo for native Android app written in Kotlin (after refactoring JS Code!)

#### JS Functions

-   [ ] Separate js code into various files pertaining to certain function groups

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
