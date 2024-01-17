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

if (isOffline) {
    const app = initializeApp({ projectId: "playground-62567" })
    const database = getDatabase(app)
    if (location.hostname === "localhost") {
        connectDatabaseEmulator(database, "127.0.0.1", 9000)
    }
} else {
    const appSettings = {
        databaseURL: "https://playground-62567-default-rtdb.europe-west1.firebasedatabase.app/",
        apiKey: "AIzaSyBF39RJz9HnX_gU2aUhe31IHJz8vp7qnEM",
        authDomain: "playground-62567.firebaseapp.com",
        projectId: "playground-62567",
        storageBucket: "playground-62567.appspot.com",
        messagingSenderId: "914430038851",
        appId: "1:914430038851:web:e4e714f50b17a2a2c715f6"
    }
    const app = initializeApp(appSettings)
    const appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider('6Lf50lYoAAAAACBj2HsksvAxrgO8D-GmHDqqhYgl'),
        isTokenAutoRefreshEnabled: true
    })
    const database = getDatabase(app)
}

/* == Database Location Refs == */

const serviceJobsInDB = ref(database, "weeklyCarChecks/serviceJobs")
const recordsInDB = ref(database, "weeklyCarChecks/checkRecords")

/* === Cross-platform scaling === */

// Determine whether the following code is necessary:
let siteWidth = window.innerWidth
let scale = screen.width / siteWidth

document.querySelector('meta[name="viewport"]').setAttribute('content', `width=${siteWidth}, initial-scale=${scale}`)

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
        serviceTasksEl.innerHTML = "All tasks complete!"

        tabBtnServiceJobs.textContent = "Servicing Jobs"
    }
})

onValue(recordsInDB, function(snapshot) {
    if (snapshot.exists()) {
        let recordArray = Object.entries(snapshot.val())
    
        clearListEl(historyEl)

        odoList = []

        for (let i = 0; i < recordArray.length; i++) {
            let currentRecord = recordArray[i]

            recordAdd(currentRecord, i)
        }

        sortList(historyEl, true)

    } else {
        historyEl.innerHTML = "No Records!"
    }
})

/* === Set Default Tab === */
tabSwitch("tab-weekly-checks")

/* === Event Listeners === */

tabMenuEl.addEventListener("click", function(e) {

    if (e.target.nodeName === "BUTTON") {
        const targetEl = document.getElementById(e.target.dataset.tab)

        if (targetEl.classList.contains("modal")) {
            modalDisplay(targetEl)

            targetEl.addEventListener("click", function(e) {
                if (e.target.nodeName === "BUTTON") {
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
    }

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
let odoList

/* ===  Function Declarations === */

function tabSwitch(tab) {
    let tabcontent

    tabcontent = document.getElementsByClassName("tabcontent")
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none"
    }

    let targetTab = document.getElementById(tab)
    targetTab.style.display = "block"
}

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
            weeklyJobBtnSwitch(weeklyJobs[i])
        })

        weeklyJobListEl.append(newEl)
    }
}

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

    odoList.push(recordMiles)

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

    // let delVal = query(listInDB, orderByKey(rec))
    // get(delVal).then((snapshot) => {
    //     console.log(snapshot.val)
    // })
    // console.log(delVal) // Returns object data, not actual value

    // console.log(exactLocationInDB)

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

