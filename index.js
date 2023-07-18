// Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"
import { connectDatabaseEmulator } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

// Initialize firebase - 1st code block = DB emulator; 2nd code block = online DB


const app = initializeApp({ projectId: "playground-62567" })
const database = getDatabase(app)
if (location.hostname === "localhost") {
    connectDatabaseEmulator(database, "127.0.0.1", 9000)
}

// const appSettings = {
//     databaseURL: "https://playground-62567-default-rtdb.europe-west1.firebasedatabase.app/"
// }
// const app = initializeApp(appSettings)
// const database = getDatabase(app)


const serviceJobsInDB = ref(database, "weeklyCarChecks/serviceJobs")
const recordsInDB = ref(database, "weeklyCarChecks/checkRecords")

// DOM Elements
const dateFieldEl = document.getElementById("date-field")
const odoFieldEl = document.getElementById("odo-field")
const serviceJobEl = document.getElementById("sj-field")
const serviceBtnEl = document.getElementById("sj-btn")
const serviceTasksEl = document.getElementById("jobs-list")
const weeklyJobListEl = document.getElementById("weeklies")
const weeklyCheckBtnEl = document.getElementById("submit-btn")
const historyEl = document.getElementById("history")

// Retrieve snapshot from DB
onValue(serviceJobsInDB, function(snapshot) {
    if (snapshot.exists()) {
        let serviceArray = Object.entries(snapshot.val())
    
        clearFieldEl(serviceJobEl)

        for (let i = 0; i < serviceArray.length; i++) {
            let currentItem = serviceArray[i]

            serviceJobAppend(currentItem)
        }
    } else {
        serviceTasksEl.innerHTML = "All tasks complete!"
    }
})

onValue(recordsInDB, function(snapshot) {
    if (snapshot.exists()) {
        let recordArray = Object.entries(snapshot.val())
    
        clearFieldEl(historyEl)

        for (let i = 0; i < recordArray.length; i++) {
            let currentRecord = recordArray[i]
            let currentRecordID = currentRecord[0]
            let currentRecordDate = currentRecord[1]
            let currentRecordMiles = currentRecord[2]
            let currentRecordWeeklies = currentRecord[3]


            recordAdd(currentRecord)
        }
    } else {
        serviceTasksEl.innerHTML = "All tasks complete!"
    }
})

// Event Listeners

serviceBtnEl.addEventListener("click", function() {
    push(serviceJobsInDB, serviceJobEl.value)

    clearFieldEl(serviceJobEl)
})

weeklyCheckBtnEl.addEventListener("click", function() {
    let weeklyArray = {
        date:dateFieldEl.value,
        miles:odoFieldEl.value,
        weeklies:weeklyJobsStatus
    }

    // Clear fields

    push(recordsInDB, weeklyArray)
    
    recordAdd()
})

// Example Arrays for Testing - to be refactored for Firebase DB

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
let weeklyJobsStatus = {}
weeklyJobList()

// Functions

function serviceJobAppend(job) {
    let itemID = job[0]
    let itemValue = job[1]

    let newEl = document.createElement("li")

    newEl.setAttribute("class", "service-job")

    newEl.textContent = itemValue

    newEl.addEventListener("click", function() {
        let exactLocationInDB = ref(database, `weeklyCarChecks/serviceJobs/${itemID}`)

        remove(exactLocationInDB)
    })

    serviceTasksEl.append(newEl)
}

function weeklyJobList() {
    for (let i = 0; i < weeklyJobs.length; i++) {
        let newEl = document.createElement("li")

        newEl.setAttribute("class", "weekly-job")
        newEl.setAttribute("id", `wJ-${weeklyJobs[i]}`)

        newEl.textContent = weeklyJobs[i]

        weeklyJobsStatus[`${weeklyJobs[i]}`] = false

        newEl.addEventListener("click", function() {
            document.getElementById(`wJ-${weeklyJobs[i]}`).style.backgroundColor = "green"
            document.getElementById(`wJ-${weeklyJobs[i]}`).style.color = "white"
            weeklyJobsStatus[`${weeklyJobs[i]}`] = true
        })

        weeklyJobListEl.append(newEl)
    }
}

function weeklyJobPercent(weeklies) {
    console.log(weeklies)
    let wJTotal = 0
    for (let key in weeklies) {
        wJTotal++
    }

    let wJDone = 0
    for (let key in weeklies) {
        if (weeklies.hasOwnProperty(key) && weeklies[key] === true) {
            wJDone++
        }
    }

    let wJP = (wJDone / wJTotal) * 100

    return wJP
}

function recordAdd(record) {
    let recordID = record[0]
    let recordDate = record[1].date
    let recordMiles = record[1].miles
    let recordWeeklies = record[1].weeklies

    let newEl = document.createElement("li")

    newEl.setAttribute("class", "hist-list")

    newEl.innerHTML = `
        <p>${recordDate}</p>
        <p>${recordMiles}</p>
        <p>Jobs Done: ${weeklyJobPercent(recordWeeklies)}%</p>
        <button id="${recordID}-del">X</button>
        `

    // Add event listener for button to delete record using clearRecord() function.

    historyEl.append(newEl)
}

function clearListEl(list) {
    list.innerHTML = ""
}

function clearFieldEl(field) {
    field.value = ""
}

function clearRecord() {
    console.log("Record Cleared.")
    //let exactLocationInDB = ref(database, `weeklyCarChecks/checkRecords/${ID}`)

    //remove(exactLocationInDB)
}

