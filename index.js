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
            let currentItemID = currentItem[0]
            let currentItemValue = currentItem[1]

            serviceJobAppend(currentItem)
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

function weeklyJobPercent() {
    console.log(weeklyJobsStatus)
    let wJTotal = 0
    for (let key in weeklyJobsStatus) {
        wJTotal++
    }

    let wJDone = 0
    for (let key in weeklyJobsStatus) {
        if (weeklyJobsStatus.hasOwnProperty(key) && weeklyJobsStatus[key] === true) {
            wJDone++
        }
    }

    let wJP = (wJDone / wJTotal) * 100

    return wJP
}

function recordAdd() {
    let newEl = document.createElement("li")

    newEl.setAttribute("class", "hist-list")

    newEl.innerHTML = `
        <p>${dateFieldEl.value}</p>
        <p>${odoFieldEl.value}</p>
        <p>Jobs Done: ${weeklyJobPercent()}%</p>
        <button>X</button>
        `

    historyEl.append(newEl)
}

function clearListEl(list) {
    list.innerHTML = ""
}

function clearFieldEl(field) {
    field.value = ""
}

