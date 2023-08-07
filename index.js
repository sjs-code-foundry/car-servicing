// Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"
import { connectDatabaseEmulator } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

// Initialize firebase - 1st code block = DB emulator; 2nd code block = online DB

// const app = initializeApp({ projectId: "playground-62567" })
// const database = getDatabase(app)
// if (location.hostname === "localhost") {
//     connectDatabaseEmulator(database, "127.0.0.1", 9000)
// }

const appSettings = {
    databaseURL: "https://playground-62567-default-rtdb.europe-west1.firebasedatabase.app/"
}
const app = initializeApp(appSettings)
const database = getDatabase(app)

const serviceJobsInDB = ref(database, "weeklyCarChecks/serviceJobs")
const recordsInDB = ref(database, "weeklyCarChecks/checkRecords")

// Cross-platform scaling

let siteWidth = window.innerWidth
let scale = screen.width / siteWidth

document.querySelector('meta[name="viewport"]').setAttribute('content', `width=${siteWidth}, initial-scale=${scale}`)

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
    
        clearListEl(serviceTasksEl)

        for (let i = 0; i < serviceArray.length; i++) {
            let currentItem = serviceArray[i]

            serviceJobAppend(currentItem)
        }

        sortList(serviceTasksEl, false)

    } else {
        serviceTasksEl.innerHTML = "All tasks complete!"
    }
})

onValue(recordsInDB, function(snapshot) {
    if (snapshot.exists()) {
        let recordArray = Object.entries(snapshot.val())
    
        clearListEl(historyEl)

        for (let i = 0; i < recordArray.length; i++) {
            let currentRecord = recordArray[i]

            recordAdd(currentRecord)
        }

        sortList(historyEl, true)

    } else {
        historyEl.innerHTML = "No Records!"
    }
})


// Event Listeners

serviceBtnEl.addEventListener("click", function() {
    push(serviceJobsInDB, serviceJobEl.value)

    alert(`${serviceJobEl.value} added!`)

    clearFieldEl(serviceJobEl)
})

weeklyCheckBtnEl.addEventListener("click", function() {

    let weeklyArray = {
        date:fieldPlaceholder(dateFieldEl, "0000-00-00"),
        miles:fieldPlaceholder(odoFieldEl, "00000"),
        weeklies:weeklyJobsStatus
    }

    push(recordsInDB, weeklyArray)

    alert(`Weekly Check for ${weeklyArray.date} added!`)

    clearFieldEl(dateFieldEl)
    clearFieldEl(odoFieldEl)
})

historyEl.addEventListener("click", (event) => {
    const isButton = event.target.nodeName === "BUTTON"
    if (!isButton) {
        return
    }
    
    let recordToClear = `${event.target.id}`
    recordToClear = recordToClear.substring(4)
    clearRecord('checkRecords', true, recordToClear)
})

// Weekly Jobs List

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
        clearRecord('serviceJobs', false, itemID)
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
            if (weeklyJobsStatus[`${weeklyJobs[i]}`] === false) {
                document.getElementById(`wJ-${weeklyJobs[i]}`).style.backgroundColor = "green"
                document.getElementById(`wJ-${weeklyJobs[i]}`).style.color = "white"
                weeklyJobsStatus[`${weeklyJobs[i]}`] = true
            } else if (weeklyJobsStatus[`${weeklyJobs[i]}`] === true) {
                document.getElementById(`wJ-${weeklyJobs[i]}`).style.backgroundColor = "white"
                document.getElementById(`wJ-${weeklyJobs[i]}`).style.color = "black"
                weeklyJobsStatus[`${weeklyJobs[i]}`] = false
            }
        })

        weeklyJobListEl.append(newEl)
    }
}

function weeklyJobPercent(weeklies) {
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
        <button id="del-${recordID}">X</button>`

    historyEl.append(newEl)
}

function fieldPlaceholder(field, placeholder) {
    if (field.value != "") {
        return field.value
    } else {
        return placeholder
    }
}

function sortList(listEl, descOrd) {
    let shouldSwitch, i, listItems
    let switching = true
    

    while (switching) {
        switching = false
        listItems = listEl.getElementsByTagName("LI")

        for (i = 0; i < (listItems.length - 1); i++) {
            shouldSwitch = false

            let switchCond
            if (descOrd === true) {
                switchCond = (listItems[i].innerHTML < listItems[i+1].innerHTML)
            } else {
                switchCond = (listItems[i].innerHTML > listItems[i+1].innerHTML)
            }

            if (switchCond) {
                shouldSwitch = true
                break
            }
        }

        if (shouldSwitch) {
            listItems[i].parentNode.insertBefore(listItems[i+1], listItems[i])
            switching = true
        }
    }
}

function clearListEl(list) {
    list.innerHTML = ""
}

function clearFieldEl(field) {
    field.value = ""
}

function clearRecord(list, askDel, rec) {
    let listInDB = ref(database, `weeklyCarChecks/${list}`)
    let exactLocationInDB = ref(database, `weeklyCarChecks/${list}/${rec}`)
    let delAns

    let delVal = query(listInDB, orderByKey(rec))
    console.log(delVal)

    if (askDel) {
        delAns = confirm("Delete this record?")
    } else {
        delAns = true
    }

    if (delAns) {
        remove(exactLocationInDB)
    }
}

