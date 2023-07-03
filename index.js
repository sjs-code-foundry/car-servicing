// Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"


// Initialize firebase
const appSettings = {
    databaseURL: "https://playground-62567-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const weeklyChecksInDB = ref(database, "weeklyCarChecks")

// DOM Elements
const dateFieldEl = document.getElementById("date-field")
const odoFieldEl = document.getElementById("odo-field")
const serviceJobEl = document.getElementById("sj-field")
const serviceBtnEl = document.getElementById("sj-btn")
const weeklyJobListEl = document.getElementById("weeklies")
const weeklyCheckBtnEl = document.getElementById("submit-btn")

// Retrieve snapshot from DB
onValue(weeklyChecksInDB, function(snapshot) {
    if (snapshot.exists()) {
        let weeklyArray = Object.entries(snapshot.val())
    }
})

// Event Listeners

serviceBtnEl.addEventListener("click", function() {
    console.log(`New Job Added: ${serviceJobEl.value}`)
})

weeklyCheckBtnEl.addEventListener("click", function() {
    console.log(`Weekly Job Submitted on ${dateFieldEl.value} at ${odoFieldEl.value} miles.`)
})

// Example Arrays for Testing

const weeklyJobs = [
    "Tyre Pressure",
    "Tyre Condition",
    "Engine Oil Level",
    "Coolant Level",
    "Brake Fluid Level",
    "Screenwash Level",
    "Power Steering Fluid Level",
    "Battery Contacts",
    "Wiper Blade Condition",
    "Electrical Systems"
]
weeklyJobList()

// Functions

function weeklyJobList() {
    for (let i = 0; i < weeklyJobs.length; i++) {
        console.log(weeklyJobs[i])
    }
}

