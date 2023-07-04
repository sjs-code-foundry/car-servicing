// Imports
// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
// import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"


// Initialize firebase
// const appSettings = {
//     databaseURL: "https://playground-62567-default-rtdb.europe-west1.firebasedatabase.app/"
// }

// const app = initializeApp(appSettings)
// const database = getDatabase(app)
// const weeklyChecksInDB = ref(database, "weeklyCarChecks")

// DOM Elements
const dateFieldEl = document.getElementById("date-field")
const odoFieldEl = document.getElementById("odo-field")
const serviceJobEl = document.getElementById("sj-field")
const serviceBtnEl = document.getElementById("sj-btn")
const serviceTasksEl = document.getElementById("jobs-list")
const weeklyJobListEl = document.getElementById("weeklies")
const weeklyCheckBtnEl = document.getElementById("submit-btn")

// Retrieve snapshot from DB
// onValue(weeklyChecksInDB, function(snapshot) {
//     if (snapshot.exists()) {
//         let weeklyArray = Object.entries(snapshot.val())
//     }
// })

// Event Listeners

serviceBtnEl.addEventListener("click", function() {
    serviceJobAdd(serviceJobEl.value)
})

weeklyCheckBtnEl.addEventListener("click", function() {
    console.log(`Weekly Job Submitted on ${dateFieldEl.value} at ${odoFieldEl.value} miles.`)
})

// Example Arrays for Testing - to be refactored for Firebase DB

let serviceJobs = [
    "Fill Screenwash",
    "Wash Car",
    "Hoover Carpets"
]
for (let i = 0; i < serviceJobs.length; i++) {
    serviceJobAdd(serviceJobs[i])
}

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

function serviceJobAdd(job) {
    let newEl = document.createElement("li")

    newEl.setAttribute("class", "service-job")

    newEl.textContent = job

    newEl.addEventListener("click", function() {
        console.log(`"${job}" Deleted`)
    })

    serviceTasksEl.append(newEl)
}

function weeklyJobList() {
    for (let i = 0; i < weeklyJobs.length; i++) {
        let newEl = document.createElement("li")

        newEl.setAttribute("class", "weekly-job")

        newEl.textContent = weeklyJobs[i]

        newEl.addEventListener("click", function() {
            console.log(`"${weeklyJobs[i]}" Checked.`)
        })

        weeklyJobListEl.append(newEl)
    }
}

