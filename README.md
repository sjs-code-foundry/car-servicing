# car-servicing
A mobile app for the weekly recording of car checks.
## Motivation
This is a replacement for my current practice of recording my weekly car checks in Google Keep and Sheets.  I will only need to enter the data once, and then I'll have a record of my checks, servicing tasks and miles travelled.
## Current Version
v0.4.3-alpha
## Dependencies
- Firebase 10.3.1
## Changelog
Visit https://github.com/sjs-code-foundry/car-servicing/releases for an updated list.
## Planned Features
### v0.4.3-alpha
#### Aesthetics
- [ ] Implement more margin so that UI doesn't feel so cramped
- [ ] Fix hr length in landscape mode
- [ ] Get buttons to scale within app width properly
#### User Experience
- [x] Solve scaling issues by implementing fix from Shopping List app
- [ ] Fix side menu on small mobile phone (make it scale dynamically)
### v0.4.4-alpha
#### General Strategy
- [ ] Work out what the minimum viable product will be (this will be version 1.0.0)
#### Firestore
- [ ] Enable offline caching
#### JS Functions
- [ ] Implement Age of Vehicle in Car Stats (new collection in Firestore)
- [ ] Use Data Attributes on Weekly Checks (deleting checks, opening table of weekly checks, etc.)
- [ ] Try to catch errors with AppCheck on desktop (open app early on Sunday morning, when you usually need it)
#### User Experience
- [ ] Add picture icon for users
- [ ] Double click copies values from Weekly Check record table
- [ ] Implement sorting functions for service jobs and weekly checks
- [ ] Implement decision modal for deleting weekly checks
### v0.5.0-alpha
#### Cross-Platform
- [ ] Fork repo for native Android app written in Kotlin
