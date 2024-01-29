/* === Imports === */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js"
import { initializeAppCheck,
         ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app-check.js";
import { getAuth,
         createUserWithEmailAndPassword,
         signInWithEmailAndPassword,
         signOut,
         onAuthStateChanged, 
         GoogleAuthProvider,
         signInWithPopup } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js"
import { getDatabase,
         ref,
         push,
         onValue,
         remove } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js"
import { getFirestore,
         collection,
         addDoc,
         serverTimestamp,
         onSnapshot,
         query,
         where,
         orderBy,
         doc,
         updateDoc,
         deleteDoc } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js"
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
const dateFieldEl = document.getElementById("date-field")
const odoFieldEl = document.getElementById("odo-field")
const serviceJobEl = document.getElementById("sj-field")
const serviceBtnEl = document.getElementById("sj-btn")
const serviceTasksEl = document.getElementById("jobs-list")
const weeklyCheckBtnEl = document.getElementById("submit-btn")
const historyEl = document.getElementById("history")
const modalAlertEl = document.getElementById("modal-alert")

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

        serviceTasksEl.textContent = "All tasks complete!"

        tabBtnServiceJobs.textContent = "Servicing Jobs"

    }

})

onValue(recordsInDB, function(snapshot) {

    if (snapshot.exists()) {

        let recordArray = Object.entries(snapshot.val())

        recordList = recordListClear(recordList)
    
        clearListEl(historyEl)

        for (let i = 0; i < recordArray.length; i++) {
            let currentRecord = recordArray[i]

            recordList.push(new RecordListing(currentRecord))

        }

        recordListCalcs(recordList)

        recordListReverse(recordList)

        for (let i = 0; i < recordList.length; i++) {
            recordAdd(recordList[i])
        }

    } else {

        historyEl.textContent = "No Records!" // replace with textContent

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

            targetEl.addEventListener("click", function(e) { // modalCloseBtnTest(e)
                const isButton = (e.target.nodeName === "BUTTON") //
                const isCloseButton = (e.target.classList.contains("close-btn")) //
                
                if (isButton && isCloseButton) { //
                    if (e.target.dataset.target) { //
                        modalClose(targetEl) //
                    } //
                } //
            }) //
        } else {
            tabSwitch(e.target.dataset.tab)
        }

        document.getElementById("menu-btn").checked = false
    }

})

serviceBtnEl.addEventListener("click", function() {

    push(serviceJobsInDB, serviceJobEl.value)

    modalAlert( modalAlertEl,
                "Success!",
                `Servicing Job "${serviceJobEl.value}" added!`)

    clearFieldEl(serviceJobEl)

})

weeklyCheckBtnEl.addEventListener("click", function() {

    let currentArray = new WeeklyArray()

    push(recordsInDB, currentArray)

    modalAlert( modalAlertEl,
                "Success!",
                `Weekly Check for ${currentArray.date} added!`)

    clearFieldEl(dateFieldEl)
    clearFieldEl(odoFieldEl)
    weeklyJobBtnReset()

})

historyEl.addEventListener("click", (e) => {

    if (e.target.nodeName === "BUTTON") {
        let recordToClear = `${e.target.id}`
        recordToClear = recordToClear.substring(4)
        clearRecord('checkRecords', true, recordToClear)
    }
    else {
        return
    }

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

let recordList = []

/* ===  Object Constructors === */

function WeeklyArray() {
    this.date = recordKeyPlaceholder(dateFieldEl, "0000-00-00")
    this.miles = recordKeyPlaceholder(odoFieldEl, "00000")
    this.weeklies = weeklyJobsStatus
}

function RecordListing(record) {
    this.ID = record[0]
    this.date = record[1].date
    this.miles = record[1].miles
    this.milesTravelled = 0
    this.weeklies = record[1].weeklies
}

/* ===  Function Declarations === */

/* ==  Tab Functions == */

function tabSwitch(tab) {

    const tabs = document.getElementsByClassName("tabcontent")

    allTabClose(tabs)

    document.getElementById(tab).style.display = "block"

}

function allTabClose(tabs) {

    for (let tab of tabs) {
        tab.style.display = "none"
    }

}

/* ==  Modal Functions == */

function modalDisplay(targetModal) {

    targetModal.style.display = "flex"

}

function modalClose(targetModal) {

    targetModal.style.display = "none"

}

function modalCloseBtnTest(e, targetEl) {

    const isButton = (e.target.nodeName === "BUTTON")
    const isCloseButton = (e.target.classList.contains("close-btn"))
    
    if (isButton && isCloseButton) {
        if (e.target.dataset.target) {
            modalClose(targetEl)
        }
    }
}

function modalAlert(targetModal, modalHeading, modalBody) {

    modalDisplay(targetModal)

    document.getElementById("modal-alert-heading").textContent = modalHeading

    document.getElementById("modal-alert-content").textContent = modalBody

    targetModal.addEventListener("click", function(e) {

        modalCloseBtnTest(e, targetModal)

    })

}

/* ==  Job/Check List Functions == */

function serviceJobAppend(job) {

    const jobID = job[0]
    const jobText = job[1]

    const jobAttr = [ ["class", "service-job"] ]

    let newEl = addLiElToList(jobAttr, false, jobText)

    newEl.addEventListener("click", function() {
        clearRecord('serviceJobs', false, jobID)
    })

    serviceTasksEl.append(newEl)

}

function weeklyJobList() {

    for (let job in weeklyJobs) {

        const weeklyJobAttrs = [ ["class", "weekly-job"], ["id", `wJ-${weeklyJobs[job]}`] ]

        let newEl = addLiElToList(weeklyJobAttrs, false, weeklyJobs[job])
        
        weeklyJobsStatus[`${weeklyJobs[job]}`] = false

        newEl.addEventListener("click", function() {
            weeklyJobBtnSwitch(weeklyJobs[job])
        })

        document.getElementById("weeklies").append(newEl)

    }

}

function recordAdd(record) {

    const recordHTML =  `
        <p>${record.date}</p>
        <p>${record.miles}</p>
        <p>${record.milesTravelled}</p>
        <p>Jobs Done: ${record.weeklies}%</p>
        <button id="del-${record.ID}">X</button>`

    const histAttr = [ ["class", "hist-list"] ]

    let newEl = addLiElToList(histAttr, true, recordHTML)

    historyEl.append(newEl)
    
}

function recordKeyPlaceholder(field, placeholder) {
    
    if (field.value != "") {
        return field.value
    } else {
        return placeholder
    }
}

function addLiElToList(attrList, isHTML, text) {

    let newEl = document.createElement("li")

    if (attrList) {
        for (let attr in attrList) {
            newEl.setAttribute(attrList[attr][0], attrList[attr][1])
        }
    }

    if (isHTML) {
        newEl.innerHTML = text
    } else {
        newEl.textContent = text
    }

    return newEl

}

function sortList(listEl, descOrd) {
    let shouldSwitch, i, listItems
    let switching = true
    
    while (switching) {
        switching = false // If switch conditions are not met, while loop should end by default
        listItems = listEl.getElementsByTagName("LI")

        for (i = 0; i < (listItems.length - 1); i++) {
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

function clearRecord(list, askIfDelete, recordID) {
    
    const exactLocationInDB = ref(database, `weeklyCarChecks/${list}/${recordID}`)
    let deleteDecision

    if (askIfDelete) {
        deleteDecision = confirm("Delete this record?")
    } else {
        deleteDecision = true
    }

    if (deleteDecision) {
        remove(exactLocationInDB)
    }
}

/* ==  Weekly Job Button Functions == */

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

/* ==  Weekly Job Record List Functions == */

function recordListCalcs(recordList) {
    
    recordListSortByDate(recordList)

    recordListCalculateMiles(recordList)

    recordListCalculateJobPercentage(recordList)

    return recordList

}

function recordListSortByDate(recordList) {

    recordList.sort(function(a, b) {

        let keyA = new String(a.date)
        let keyB = new String(b.date)
        // Compare the two dates
        if (keyA < keyB) {
            return -1
        } else if (keyA > keyB) {
            return 1
        } else { // Dates are equal
            return 0
        }

    })

}

function recordListCalculateMiles(recordList) {

    for (let record in recordList) {

        let currentMiles = recordList[record].miles
        let previousMiles = 0

        try {
            previousMiles = recordList[record-1].miles
        } catch {
            previousMiles = 0 // Perhaps set this to "recordList[record].miles"
            // Thinking of future calcs based on miles travelled, and how
            // having all the miles up to that point affects that
        }
        
        recordList[record].milesTravelled = currentMiles - previousMiles

    }

}

function recordListCalculateJobPercentage(recordList) {
    
    for (let record in recordList) {

        recordList[record].weeklies = weeklyJobPercent(recordList[record].weeklies)

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

function recordListReverse(recordList) {

    recordList.reverse()

}

function recordListClear(recordList) {

    recordList = []

    return recordList

}

