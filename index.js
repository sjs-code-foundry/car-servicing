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
import { connectAuthEmulator } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js"
import { connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js"

/* === Firebase - Initialize Firebase === */

const isOffline = true

const appSettings = getAppConfig()
const app = initializeApp(appSettings)

const appCheck = getAppCheck()

const auth = getAuth(app)
const provider = new GoogleAuthProvider()

const database = getDatabase(app)
// const database = getFirestore(app)

if (isOffline && location.hostname === "localhost") {
    connectDatabaseEmulator(database, "127.0.0.1", 9000)
    connectAuthEmulator(auth, "http://127.0.0.1:9099")
    // connectFirestoreEmulator(database, '127.0.0.1', 8080)

}

function getAppConfig() {
    if (isOffline) {
        return {
                    projectId: "playground-62567",
                    apiKey: "test-api-key",
                    authDomain: "test",
                    appId: "test"
                }
    } else {
        return  {
                    databaseURL: "https://playground-62567-default-rtdb.europe-west1.firebasedatabase.app/", // Update when going online!
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

/* == Firebase - Database Location Refs == */

const serviceJobsInDB = ref(database, "weeklyCarChecks/serviceJobs") // Legacy for RTDB
const recordsInDB = ref(database, "weeklyCarChecks/checkRecords") // Legacy for RTDB

// const serviceJobsCollectionName = "serviceJobs"
// const recordsCollectionName = "weeklyChecks"

/* === DOM Elements === */

const tabMenuEl = document.getElementById("tab-menu")
const tabBtnServiceJobs = document.getElementById("tab-btn-service-jobs")
const tabBtnAccount = document.getElementById("tab-btn-account")
const tabBtnLogout = document.getElementById("tab-btn-logout")
const dateFieldEl = document.getElementById("date-field")
const odoFieldEl = document.getElementById("odo-field")
const serviceJobEl = document.getElementById("sj-field")
const serviceBtnEl = document.getElementById("sj-btn")
const serviceTasksEl = document.getElementById("jobs-list")
const weeklyCheckBtnEl = document.getElementById("submit-btn")
const historyEl = document.getElementById("history")
const modalAlertEl = document.getElementById("modal-alert")
const modalAccountEl = document.getElementById("modal-account")
const accountFormEl = document.getElementById("modal-account-form")
const signinBtnGoogle = document.getElementById("signin-btn-google")
const createAccountBtn = document.getElementById("create-account-btn")

/* === Firebase - Authentication === */

let createAccountMode = false

tabBtnLogout.addEventListener("click", function() {

    authSignOut()

})

signinBtnGoogle.addEventListener("click", function() {

    authSignInWithGoogle()

    modalClose(modalAccountEl)

})

accountFormEl.addEventListener("submit", function(e) {

    e.preventDefault()

    if (createAccountMode) {

        authCreateAccountWithEmail()
        
    } else {

        authSignInWithEmail()

    }

    accountFormEl.reset()

    modalClose(modalAccountEl)

})

createAccountBtn.addEventListener("click", function() {

    console.log(createAccountMode)
    
    accountBtnSwitch(createAccountMode)

})

function accountBtnSwitch(createAccountMode) {

    flipAccountMode()

    const modalHeader = document.getElementById("modal-account-header")
    const formButton = document.getElementById("modal-account-form-btn")

    let text = ""

    if (createAccountMode) {

        text = "Sign In"

        formButton.textContent = "Sign In with Email"

        signinBtnGoogle.style.display = "inline-block"

    } else {

        text = "Create an account"

        formButton.textContent = "Create Account with Email"

        signinBtnGoogle.style.display = "none"

    }

    console.log(`Switched to "${text}" mode.`)

    modalHeader.textContent = text
    tabBtnAccount.textContent = text
    createAccountBtn.textContent = text

}

function flipAccountMode() {

    createAccountMode = !createAccountMode

}

function authSignInWithGoogle() {

    signInWithPopup(auth, provider)
        .then((result) => {
            tabSwitch("tab-weekly-checks")
        })
        .catch((error) => {
            modalAlert( modalAlertEl,
                "Sign In with Google Failed!",
                `${error.message}`)
        })

}

function authSignInWithEmail() {

    const email = accountFormEl.email.value
    const password = accountFormEl.password.value

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            tabSwitch("tab-weekly-checks")
        })
        .catch((error) => {
            modalAlert( modalAlertEl,
                "Sign In Failed!",
                `${error.message}`)
        })

}

function authCreateAccountWithEmail() {

    const email = accountFormEl.email.value
    const password = accountFormEl.password.value

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            modalAlert( modalAlertEl,
                "Account Created!",
                `Account for "${email}" created!`)
        })
        .catch((error) => {
            modalAlert( modalAlertEl,
                "Create Account Failed!",
                `${error.message}`)
        })

}

function authSignOut() {

    signOut(auth)
        .then(() => {
            // Not Needed, tab switched by tabMenuEl Event Listener
        })
        .catch((error) => {
            modalAlert( modalAlertEl,
                "Sign Out Failed!",
                `${error.message}`)
        })

}

/* === Firebase - Retrieve snapshot from DB === */

onAuthStateChanged(auth, (user) => {

    const accountStatusHeader = document.getElementById("account-status-header")

    if (user) {

        accountStatusHeader.textContent = `Signed in as: ${user.email}.`
        tabBtnAccount.style.display = "none"
        tabBtnLogout.style.display = "block"

        /*
        
        

        */

    } else {

        accountStatusHeader.textContent = "Not Signed In.  Sign in to view records."
        tabBtnAccount.style.display = "block"
        tabBtnLogout.style.display = "none"

    }

})

/*

function fetchItemsInRealTimeFromDB(query, user) {

    onSnapshot(query, (querySnapshot) => {

        clearListEl(serviceTasksEl)

        querySnapshot.forEach((doc) => {

            // Insert doc as appropriate

        })

    })

}

function fetchServiceJobs(user) {

    const serviceJobsRef = collection(database, serviceJobsCollectionName)

    const q = query(serviceJobsRef, where("uid", "==", user.uid),
                                    orderBy(createdAt, body))

    fetchItemsInRealTimeFromDB(q, user)

}

*/

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

        historyEl.textContent = "No Records!"

    }

})

// Both above functions will be replaced by equivalents for Firestore

/* === Set Default Tab === */

tabSwitch("tab-blank")

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

