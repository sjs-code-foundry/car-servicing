/* === Imports === */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js"
import { initializeAppCheck,
         ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app-check.js";
import { getDatabase,
         ref,
         push,
         onValue,
         remove,
         query,
         orderByKey,
         get } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js"
import { connectDatabaseEmulator } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js"

/* === Initialize Firebase === */

const isOffline = true

const appSettings = getAppConfig()
const app = initializeApp(appSettings)
const appCheck = getAppCheck()
const database = getDatabase(app)
if (isOffline && location.hostname === "localhost") {
    connectDatabaseEmulator(database, "127.0.0.1", 9000)
}

function getAppConfig() {
    if (isOffline) {
        return { projectId: "playground-62567" }
    } else {
        return  {
                    databaseURL: "https://playground-62567-default-rtdb.europe-west1.firebasedatabase.app/",
                    apiKey: "AIzaSyBF39RJz9HnX_gU2aUhe31IHJz8vp7qnEM",
                    authDomain: "playground-62567.firebaseapp.com",
                    projectId: "playground-62567",
                    storageBucket: "playground-62567.appspot.com",
                    messagingSenderId: "914430038851",
                    appId: "1:914430038851:web:e4e714f50b17a2a2c715f6"
                }
    }
}

function getAppCheck() {
    if (isOffline) {
        // AppCheck not needed
    } else {
        return initializeAppCheck(app, {
            provider: new ReCaptchaV3Provider('6Lf50lYoAAAAACBj2HsksvAxrgO8D-GmHDqqhYgl'),
            isTokenAutoRefreshEnabled: true
        })
    }
}

/* == Database Location Refs == */

const serviceJobsInDB = ref(database, "weeklyCarChecks/serviceJobs")
const recordsInDB = ref(database, "weeklyCarChecks/checkRecords")

/* === DOM Elements === */
const tabMenuEl = document.getElementById("tab-menu")
const tabBtnServiceJobs = document.getElementById("tab-btn-service-jobs")
const tabBtnAccount = document.getElementById("tab-btn-account") // Retain for displaying account statuses, or move into relevant functions
const dateFieldEl = document.getElementById("date-field")
const odoFieldEl = document.getElementById("odo-field")
const serviceJobEl = document.getElementById("sj-field")
const serviceBtnEl = document.getElementById("sj-btn")
const serviceTasksEl = document.getElementById("jobs-list")
const weeklyJobListEl = document.getElementById("weeklies")
const weeklyCheckBtnEl = document.getElementById("submit-btn")
const historyEl = document.getElementById("history")

// Check each of these to see if they can be called locally to relevant functions - will speed up the page

/* === Retrieve snapshot from DB === */
onValue(serviceJobsInDB, function(snapshot) {
    if (snapshot.exists()) {
        let serviceArray = Object.entries(snapshot.val())
    
        clearListEl(serviceTasksEl)

        for (let i = 0; i < serviceArray.length; i++) {
            let currentItem = serviceArray[i]

            serviceJobAppend(currentItem)
        }

        sortList(serviceTasksEl, false)

        tabBtnServiceJobs.textContent = `Servicing Jobs (${serviceArray.length})`

    } else {
        serviceTasksEl.innerHTML = "All tasks complete!" // replace with textContent

        tabBtnServiceJobs.textContent = "Servicing Jobs"
    }
})

onValue(recordsInDB, function(snapshot) {
    if (snapshot.exists()) {
        let recordArray = Object.entries(snapshot.val())
    
        clearListEl(historyEl)

        odoList = [] // This will be replaced by getting the actual data and calculating miles from previous entry

        for (let i = 0; i < recordArray.length; i++) {
            let currentRecord = recordArray[i]

            recordAdd(currentRecord, i)
        }

        sortList(historyEl, true)

    } else {
        historyEl.innerHTML = "No Records!" // replace with textContent
    }
})

// Both above functions will be replaced by equivalents for Firestore

/* === Set Default Tab === */
tabSwitch("tab-weekly-checks")

/* === Event Listeners === */

tabMenuEl.addEventListener("click", function(e) {

    if (e.target.nodeName === "BUTTON") {
        const targetEl = document.getElementById(e.target.dataset.tab)

        if (targetEl.classList.contains("modal")) {
            modalDisplay(targetEl)

            targetEl.addEventListener("click", function(e) {
                if (e.target.nodeName === "BUTTON") { // Add check for classlist item "close" or similar to ensure it's a close button
                    if (e.target.dataset.target) {
                        modalClose(targetEl)
                    } // Perhaps refactor at some point?
                }
            })
        } else {
            tabSwitch(e.target.dataset.tab)
        }

        document.getElementById("menu-btn").checked = false
    }

})

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
    } // Put this and the push command below into a dedicated function

    push(recordsInDB, weeklyArray)

    alert(`Weekly Check for ${weeklyArray.date} added!`)

    clearFieldEl(dateFieldEl)
    clearFieldEl(odoFieldEl)
    weeklyJobBtnReset()
})

historyEl.addEventListener("click", (event) => {
    const isButton = event.target.nodeName === "BUTTON"
    if (!isButton) {
        return
    }

    // if (event.target.nodeName === "BUTTON") {
        // Run code below
    //}
    // else {
        // return
    //}
    
    let recordToClear = `${event.target.id}`
    recordToClear = recordToClear.substring(4)
    clearRecord('checkRecords', true, recordToClear)
})

/* === Weekly Jobs List === */

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

/* === Initial Variables === */
let odoList // Will be made redundant with Firestore

/* ===  Function Declarations === */

function tabSwitch(tab) { // Have this one call two functions, one setting all tabs to display:none, the other setting the target tab to display:block
    let tabcontent
    // const tabcontent = document.getElementsByClassName("tabcontent")

    tabcontent = document.getElementsByClassName("tabcontent")
    for (let i = 0; i < tabcontent.length; i++) { // for (tab of tabcontent) {
        tabcontent[i].style.display = "none"
    }

    let targetTab = document.getElementById(tab)
    targetTab.style.display = "block"
}

function serviceJobAppend(job) {
    let itemID = job[0] // const
    let itemValue = job[1] // const

    // Code beyond this point should be it's own function, perhaps a function that deals with both WC and SJ lists
    let newEl = document.createElement("li")

    newEl.setAttribute("class", "service-job")

    newEl.textContent = itemValue

    newEl.addEventListener("click", function() {
        clearRecord('serviceJobs', false, itemID)
    })

    serviceTasksEl.append(newEl)
}

function weeklyJobList() {
    for (let i = 0; i < weeklyJobs.length; i++) { // for (job in weeklyJobs) {
        let newEl = document.createElement("li")

        newEl.setAttribute("class", "weekly-job") // In new function, set attributes with a for loop taking attributes as an array of [type, value]
        newEl.setAttribute("id", `wJ-${weeklyJobs[i]}`)

        newEl.textContent = weeklyJobs[i]
        
        weeklyJobsStatus[`${weeklyJobs[i]}`] = false

        newEl.addEventListener("click", function() {
            weeklyJobBtnSwitch(weeklyJobs[i])
        })

        weeklyJobListEl.append(newEl)
    }
}

/*
Example function for creating new elements:

function addLiElToList(attrList, isHTML, text, eventListenerFunc) {
    let newEl = document.createElement("li")

    if (attrList) {
        for (attr in attrList) {
            newEl.setAttribute(attr[0], attr[1])
        }
    }

    if (isHTML) {
        newEl.innerHTML = text
    } else {
        newEl.textContent = text
    }
    
    if (eventListenerFunc) {
        newEl.addEventListener("click", function() {
            eventListenerFunc
        })
    }
}
*/

function weeklyJobBtnSwitch(jobID) {
    if (weeklyJobsStatus[`${jobID}`] === false) {
        document.getElementById(`wJ-${jobID}`).style.backgroundColor = "var(--accent-light-color)"
        document.getElementById(`wJ-${jobID}`).style.color = "var(--background-light-color)"
        weeklyJobsStatus[`${jobID}`] = true
    } else if (weeklyJobsStatus[`${jobID}`] === true) {
        document.getElementById(`wJ-${jobID}`).style.backgroundColor = "var(--background-light-color)"
        document.getElementById(`wJ-${jobID}`).style.color = "var(--text-light-color)"
        weeklyJobsStatus[`${jobID}`] = false
    }
}

function weeklyJobBtnReset() {
    for (let i = 0; i < weeklyJobs.length; i++) {
        let jobStatus = weeklyJobsStatus[`${weeklyJobs[i]}`]

        if (jobStatus === true) {
            weeklyJobBtnSwitch(weeklyJobs[i])
        }
    }
}

function weeklyJobPercent(weeklies) {
    let wJTotal = 0
    for (let key in weeklies) {
        wJTotal++
    }
    // Previous code can be replaced with weeklies.length

    let wJDone = 0
    for (let key in weeklies) {
        if (weeklies.hasOwnProperty(key) && weeklies[key] === true) {
            wJDone++
        }
    }

    let wJP = (wJDone / wJTotal) * 100

    return wJP
}

function recordAdd(record, odoNum) {
    let recordID = record[0]
    let recordDate = record[1].date
    let recordMiles = record[1].miles
    let recordWeeklies = record[1].weeklies

    odoList.push(recordMiles) // Will be made redundant

    // Use the newEl function prototyped above ^^^
    let newEl = document.createElement("li")

    newEl.setAttribute("class", "hist-list")

    newEl.innerHTML = `
        <p>${recordDate}</p>
        <p>${recordMiles}</p>
        <p>${mileCalc(odoNum)}</p>
        <p>Jobs Done: ${weeklyJobPercent(recordWeeklies)}%</p>
        <button id="del-${recordID}">X</button>`

    historyEl.append(newEl)
}

function mileCalc(odoNum) {
    let mileVal = odoList[odoNum] - odoList[odoNum - 1]

    if (isNaN(mileVal)) {
        return 0
    }

    return mileVal

    /* 
    Current calculation uses the value from a table assembled from
    odoList, which isn't synced to dates of entry.

    We need a new function that will search through the DB for the
    mile value from the previous date, and use that in it's calculation.

    To preserve savings on mobile data, we should implement a search
    function that expands it's scope to previous week/month/year/all
    time, until it finds the next mile value.

    Otherwise, zero should be returned.
    */

}

function fieldPlaceholder(field, placeholder) { // Perhaps change name to make it clear that this inserts a placeholder into the record
    // It does not pertain to the placeholder in the HTML input field
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
        switching = false // Confusing, rewrite so that other devs don't think the while loop cancels immediately
        listItems = listEl.getElementsByTagName("LI")

        for (i = 0; i < (listItems.length - 1); i++) { // for (item in listItems) {
            shouldSwitch = false // Items should not be switched by default

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

function clearRecord(list, askDel, rec) { // Expand out the names used here to clarify to the user what is going on
    let listInDB = ref(database, `weeklyCarChecks/${list}`) // Delete - redundant
    let exactLocationInDB = ref(database, `weeklyCarChecks/${list}/${rec}`) // const
    let delAns

    if (askDel) {
        delAns = confirm("Delete this record?")
    } else {
        delAns = true
    }

    if (delAns) {
        remove(exactLocationInDB)
    }
}

function modalDisplay(targetModal) {
    targetModal.style.display = "flex"
}

function modalClose(targetModal) {
    targetModal.style.display = "none"
}

