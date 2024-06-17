/* === Imports === */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import {
    initializeAppCheck,
    ReCaptchaV3Provider,
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app-check.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
import {
    getDatabase,
    ref,
    push,
    onValue,
    remove,
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    serverTimestamp,
    onSnapshot,
    query,
    where,
    orderBy,
    doc,
    updateDoc, // Keep for editing entries later on
    deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";

import { connectDatabaseEmulator } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";
import { connectAuthEmulator } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
import { connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";

/* === Firebase - Initialize Firebase === */

const isOffline = false;

const appSettings = getAppConfig();
const app = initializeApp(appSettings);

const appCheck = getAppCheck();

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const database = getFirestore(app);

if (isOffline && location.hostname === "localhost") {
    // connectDatabaseEmulator(database, "127.0.0.1", 9000)
    connectAuthEmulator(auth, "http://127.0.0.1:9099");
    connectFirestoreEmulator(database, "127.0.0.1", 8080); // Does not function correctly - FIX!!!
}

function getAppConfig() {
    if (isOffline) {
        return {
            projectId: "playground-62567",
            apiKey: "test-api-key",
            authDomain: "test",
            appId: "test",
        };
    } else {
        return {
            databaseURL:
                "https://playground-62567-default-rtdb.europe-west1.firebasedatabase.app/",
            apiKey: "AIzaSyDfQw-0aghLyxvbgBSeVMqzvQav9NFj9fo",
            authDomain: "weekly-car-checks.firebaseapp.com",
            projectId: "weekly-car-checks",
            storageBucket: "weekly-car-checks.appspot.com",
            messagingSenderId: "1081763112489",
            appId: "1:1081763112489:web:00e68b7266894249211e38",
        };
    }
}

function getAppCheck() {
    if (isOffline) {
        // AppCheck not needed
    } else {
        return initializeAppCheck(app, {
            provider: new ReCaptchaV3Provider(
                "6Lf50lYoAAAAACBj2HsksvAxrgO8D-GmHDqqhYgl"
            ),
            isTokenAutoRefreshEnabled: true,
        });
    }
}

/* == Firebase - Database Location Refs == */

const serviceJobsCollectionName = "serviceJobs";
const weeklyChecksCollectionName = "weeklyChecks";
const settingsCollectionName = "settings";

/* === DOM Elements === */

const tabMenuEl = document.getElementById("tab-menu");
const tabBtnServiceJobs = document.getElementById("tab-btn-service-jobs");
const tabBtnAccount = document.getElementById("tab-btn-account");
const tabBtnLogout = document.getElementById("tab-btn-logout");

const weeklyCheckFormEl = document.getElementById("weekly-check-form");
const dateFieldEl = document.getElementById("date-field");
const odoFieldEl = document.getElementById("odo-field");
const weeklyCheckBtnEl = document.getElementById("submit-btn");

const serviceJobEl = document.getElementById("sj-field");
const serviceBtnEl = document.getElementById("sj-btn");
const serviceTasksEl = document.getElementById("jobs-list");

const historyEl = document.getElementById("hist-area");

const settingFormEl = document.getElementById("setting-form");
const settingBtnEl = document.getElementById("setting-btn");

const modalAlertEl = document.getElementById("modal-alert");

const modalConfirmEl = document.getElementById("modal-confirm"); // Keep for future implementation

const modalAccountEl = document.getElementById("modal-account");
const accountFormEl = document.getElementById("modal-account-form");
const signinBtnGoogle = document.getElementById("signin-btn-google");
const createAccountBtn = document.getElementById("create-account-btn");

/* === Firebase - Authentication === */

let createAccountMode = false;

tabBtnLogout.addEventListener("click", function () {
    authSignOut();
});

signinBtnGoogle.addEventListener("click", function () {
    authSignInWithGoogle();

    modalClose(modalAccountEl);
});

accountFormEl.addEventListener("submit", function (e) {
    e.preventDefault();

    if (createAccountMode) {
        authCreateAccountWithEmail();
    } else {
        authSignInWithEmail();
    }

    accountFormEl.reset();

    modalClose(modalAccountEl);
});

createAccountBtn.addEventListener("click", function () {
    console.log(createAccountMode);

    accountBtnSwitch(createAccountMode);
});

function accountBtnSwitch(createAccountMode) {
    flipAccountMode();

    const modalHeader = document.getElementById("modal-account-header");
    const formButton = document.getElementById("modal-account-form-btn");

    let text = "";

    if (createAccountMode) {
        text = "Sign In";

        formButton.textContent = "Sign In with Email";

        signinBtnGoogle.style.display = "inline-block";
    } else {
        text = "Create an account";

        formButton.textContent = "Create Account with Email";

        signinBtnGoogle.style.display = "none";
    }

    console.log(`Switched to "${text}" mode.`);

    modalHeader.textContent = text;
    tabBtnAccount.textContent = text;
    createAccountBtn.textContent = text;
}

function flipAccountMode() {
    createAccountMode = !createAccountMode;
}

function authSignInWithGoogle() {
    signInWithPopup(auth, provider)
        .then((result) => {
            tabSwitch("tab-weekly-checks");
        })
        .catch((error) => {
            modalAlert(
                modalAlertEl,
                "Sign In with Google Failed!",
                `${error.message}`
            );
        });
}

function authSignInWithEmail() {
    const email = accountFormEl.email.value;
    const password = accountFormEl.password.value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            tabSwitch("tab-weekly-checks");
        })
        .catch((error) => {
            modalAlert(modalAlertEl, "Sign In Failed!", `${error.message}`);
        });
}

function authCreateAccountWithEmail() {
    const email = accountFormEl.email.value;
    const password = accountFormEl.password.value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            modalAlert(
                modalAlertEl,
                "Account Created!",
                `Account for "${email}" created!`
            );
        })
        .catch((error) => {
            modalAlert(
                modalAlertEl,
                "Create Account Failed!",
                `${error.message}`
            );
        });
}

function authSignOut() {
    signOut(auth)
        .then(() => {
            // Not Needed, tab switched by tabMenuEl Event Listener
        })
        .catch((error) => {
            modalAlert(modalAlertEl, "Sign Out Failed!", `${error.message}`);
        });
}

/* === Firebase - Retrieve snapshot from DB === */

onAuthStateChanged(auth, (user) => {
    const accountStatusHeader = document.getElementById(
        "account-status-header"
    );

    if (user) {
        accountStatusHeader.textContent = `Signed in as: ${user.email}.`;
        tabBtnAccount.style.display = "none";
        tabBtnLogout.style.display = "block";

        fetchServiceJobs(user);
        fetchWeeklyChecks(user);
    } else {
        accountStatusHeader.textContent =
            "Not Signed In.  Sign in to view records.";
        tabBtnAccount.style.display = "block";
        tabBtnLogout.style.display = "none";

        clearServiceJobsOnLogout();
        clearWeeklyChecksOnLogout();
    }
});

function fetchServiceJobsInRealTimeFromDBs(query, user) {
    onSnapshot(query, (querySnapshot) => {
        clearListEl(serviceTasksEl);

        let jobCount = 0;

        querySnapshot.forEach((doc) => {
            renderServiceJob(doc);

            jobCount++;
        });

        if (jobCount > 0) {
            tabBtnServiceJobs.textContent = `Servicing Jobs (${jobCount})`;
        } else {
            tabBtnServiceJobs.textContent = "Servicing Jobs";
        }
    });
}

// function fetchWeeklyCheckJobListInRealTimeFromDBs(query, user)

function fetchWeeklyChecksInRealTimeFromDBs(query, user) {
    onSnapshot(query, (querySnapshot) => {
        clearListEl(historyEl);

        recordList = recordListClear(recordList);

        renderWeeklyCheckHeaders();

        querySnapshot.forEach((doc) => {
            recordList.push(new RecordListing(doc));
        });

        recordListCalcs(recordList);

        recordListReverse(recordList);

        for (let r in recordList) {
            renderWeeklyCheck(recordList[r]);
        }

        carStatsCalcs(recordList);

        renderWeeklyCheckJobListInSettings(weeklyJobs);
    });
}

// Refactor the above two at some point to use a common function?

function fetchServiceJobs(user) {
    const serviceJobsRef = collection(database, serviceJobsCollectionName);

    const q = query(
        serviceJobsRef,
        where("uid", "==", user.uid),
        orderBy("createdAt", "asc")
    );
    // Add this at a later date for user options: orderBy("body", "asc")

    fetchServiceJobsInRealTimeFromDBs(q, user);
}

function fetchWeeklyChecks(user) {
    const weeklyChecksRef = collection(database, weeklyChecksCollectionName);

    const q = query(
        weeklyChecksRef,
        where("uid", "==", user.uid),
        orderBy("date", "asc"),
        orderBy("miles", "asc")
    );

    fetchWeeklyChecksInRealTimeFromDBs(q, user);
}

function clearServiceJobsOnLogout() {
    clearListEl(serviceTasksEl);

    tabBtnServiceJobs.textContent = "Servicing Jobs";
}

function clearWeeklyChecksOnLogout() {
    clearListEl(historyEl);

    recordList = recordListClear(recordList);

    renderWeeklyCheckHeaders();
}

/* === Set Default Tab === */

tabSwitch("tab-weekly-checks");

/* === Event Listeners === */

document.addEventListener("click", function (e) {
    if (!e.target.closest(".header") || e.target.nodeName === "BUTTON") {
        document.getElementById("menu-btn").checked = false;
    }
});

tabMenuEl.addEventListener("click", function (e) {
    if (e.target.nodeName === "BUTTON") {
        const targetEl = document.getElementById(e.target.dataset.tab);

        if (targetEl.classList.contains("modal")) {
            modalDisplay(targetEl);

            targetEl.addEventListener("click", function (e) {
                // modalCloseBtnTest(e)
                const isButton = e.target.nodeName === "BUTTON"; //
                const isCloseButton = e.target.classList.contains("close-btn"); //

                if (isButton && isCloseButton) {
                    //
                    if (e.target.dataset.target) {
                        //
                        modalClose(targetEl); //
                    } //
                } //
            }); //
        } else {
            tabSwitch(e.target.dataset.tab);

            const tabHeight =
                document.getElementById("interactive-area").offsetHeight;

            setModalContainerHeight(tabHeight);
        }

        document.getElementById("menu-btn").checked = false;
    }
});

serviceJobEl.addEventListener("input", function () {
    if (serviceJobEl.value.length) {
        lockServiceJobButton(false);
    } else {
        lockServiceJobButton(true);
    }
});

serviceBtnEl.addEventListener("click", function () {
    const user = auth.currentUser;

    addServiceJobToDB(serviceJobEl.value, user);

    const tabHeight = document.getElementById("interactive-area").offsetHeight;

    setModalContainerHeight(tabHeight);

    modalAlert(
        modalAlertEl,
        "Success!",
        `Servicing Job "${serviceJobEl.value}" added!`
    );

    clearFieldEl(serviceJobEl);

    lockServiceJobButton(true);
});

weeklyCheckFormEl.addEventListener("submit", function (e) {
    e.preventDefault();

    const user = auth.currentUser;

    const date = weeklyCheckFormEl.date.value;
    const odometer = weeklyCheckFormEl.odometer.value;
    const currentArray = new WeeklyArray();

    addWeeklyCheckToDB(date, odometer, currentArray.weeklies, user);

    modalAlert(
        modalAlertEl,
        "Success!",
        `Weekly Check for ${currentArray.date} added!`
    );

    weeklyCheckFormEl.reset();
    weeklyJobBtnReset();
});

historyEl.addEventListener("click", (e) => {
    if (e.target.nodeName === "BUTTON") {
        let recordToClear = `${e.target.id}`;
        recordToClear = recordToClear.substring(4); // Remove 'del-' from beginning of record ID to target DB record
        clearRecord(weeklyChecksCollectionName, true, recordToClear);
    } else {
        return;
    }
});

settingBtnEl.addEventListener("click", (e) => {
    e.preventDefault();

    const settingData = new FormData(settingFormEl);

    const settings = new SettingsObj(settingData);

    checkUpdateSettings(settings, auth.currentUser);
});

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
    "Electrical Systems",
];
let weeklyJobsStatus = {};
weeklyJobList();

/* === Initial Variables === */

let recordList = [];
// let deleteVerdict = false // Deletion of Weekly Checks does not go ahead by default
lockServiceJobButton(true);

/* ===  Object Constructors === */

function WeeklyArray() {
    this.date = recordKeyPlaceholder(dateFieldEl, "0000-00-00");
    this.miles = recordKeyPlaceholder(odoFieldEl, "00000");
    this.weeklies = weeklyJobsStatus;
}

function RecordListing(wholeDoc) {
    const docData = wholeDoc.data();

    this.ID = wholeDoc.id;
    this.date = docData.date;
    this.miles = docData.miles;
    this.milesTravelled = 0;
    this.weeklies = docData.weeklies;
}

function TimeElapsed(then, now) {
    this.timeThen = moment(then);
    this.timeNow = moment(now);

    this.durMs = this.timeNow.diff(this.timeThen);
    this.durDays = this.timeNow.diff(this.timeThen, "days", true);
    this.durWeeks = this.timeNow.diff(this.timeThen, "weeks", true);
    this.durMonths = this.timeNow.diff(this.timeThen, "months", true);
    this.durYears = this.timeNow.diff(this.timeThen, "years", true);

    this.durHumanTerms = new TimeHumanTerms(this);

    // Moment.js homepage:  https://momentjs.com/
}

function TimeHumanTerms(elapsedObj) {
    this.durYears = Math.floor(elapsedObj.durYears);

    const dateToMonths = elapsedObj.timeThen.add(this.durYears, "years");
    this.durMonths = elapsedObj.timeNow.diff(dateToMonths, "months");

    const dateToDays = dateToMonths.add(this.durMonths, "months");
    this.durDays = elapsedObj.timeNow.diff(dateToDays, "days");

    if (this.durMonths === 0 && this.durYears === 0) {
        this.report = `${this.durDays} days`;
    } else if (this.durYears === 0) {
        this.report = `${this.durMonths} months and ${this.durDays} days`;
    } else {
        this.report = `${this.durYears} years, ${this.durMonths} months and ${this.durDays} days`;
    }
}

function CarStatTableRow(heading, data, roundBool) {
    this.heading = heading;

    const dataType = typeof data;

    if (dataType === "number" && roundBool === true) {
        this.data = Math.round(data);
    } else {
        this.data = data;
    }
}

function SettingsObj(settingData) {
    this.defaultTab = settingData.get("default-tab");
    this.wcDateTime = [
        settingData.get("setting-wc-day"),
        settingData.get("setting-wc-time"),
    ];
    this.sjNotifTime = [
        settingData.get("setting-sj-notif-time"),
        settingData.get("setting-sj-notif-period"),
    ];
    this.licencePlate = settingsMinLengthCheck(
        "Licence Plate",
        settingData.get("setting-licence-plate"),
        7
    );
    this.vinNumber = settingsMinLengthCheck(
        "VIN Number",
        settingData.get("setting-vin"),
        17
    );
    this.vehiclePurchaseDate = settingData.get("setting-vehicle-purchase-date");
    this.weeklyCheckArr = weeklyJobs;
}

/* ===  Function Declarations === */

/* ==  Tab Functions == */

function tabSwitch(tab) {
    const tabs = document.getElementsByClassName("tabcontent");

    allTabClose(tabs);

    document.getElementById(tab).style.display = "block";
}

function allTabClose(tabs) {
    for (let tab of tabs) {
        tab.style.display = "none";
    }
}

/* ==  Modal Functions == */

function modalDisplay(targetModal) {
    document.getElementById("modal-container").style.display = "block";

    targetModal.style.display = "flex";
}

function modalClose(targetModal) {
    document.getElementById("modal-container").style.display = "none";

    targetModal.style.display = "none";
}

function modalCloseBtnTest(e, targetEl) {
    const isButton = e.target.nodeName === "BUTTON";
    const isCloseButton = e.target.classList.contains("close-btn");

    if (isButton && isCloseButton) {
        if (e.target.dataset.target) {
            modalClose(targetEl);
        }
    }
}

// function modalConfirmVerdict(e, targetEl) {

//     const isButton = (e.target.nodeName === "BUTTON")
//     const isConfirmButton = (e.target.classList.contains("confirm-btn"))

//     if (isButton && isConfirmButton) {

//         if (e.target.dataset.verdict) {

//             let verdict = e.target.dataset.verdict

//             if (verdict === "yes") {

//                 modalClose(targetEl)

//                 return true

//             } else {

//                 modalClose(targetEl)

//                 return false

//             }

//         }

//     }

// }

function modalAlert(targetModal, modalHeading, modalBody) {
    modalDisplay(targetModal);

    document.getElementById("modal-alert-heading").textContent = modalHeading;

    document.getElementById("modal-alert-content").textContent = modalBody;

    targetModal.addEventListener("click", function (e) {
        modalCloseBtnTest(e, targetModal);
    });
}

// function modalConfirm(targetModal, modalHeading, modalBody) {

//     modalDisplay(targetModal)

//     document.getElementById("modal-confirm-heading").textContent = modalHeading

//     document.getElementById("modal-confirm-content").textContent = modalBody

//     targetModal.addEventListener("click", function(e) {

//         modalCloseBtnTest(e, targetModal)

//         return false

//     })

//     targetModal.addEventListener("click", function(e) {

//         return modalConfirmVerdict(e, targetModal)

//     })

// }

function setModalContainerHeight(tabHeight) {
    const modalContainer = document.getElementById("modal-container");

    modalContainer.setAttribute("style", `height:${tabHeight}`);
    modalContainer.style.height = `${tabHeight}px`;
}

/* ==  Job/Check List Functions == */

function renderServiceJob(wholeDoc) {
    const serviceJobData = wholeDoc.data();

    const jobAttr = [["class", "service-job"]];

    let newEl = addLiElToList(jobAttr, false, serviceJobData.body);

    newEl.addEventListener("click", function () {
        clearRecord(serviceJobsCollectionName, false, wholeDoc.id);

        const tabHeight =
            document.getElementById("interactive-area").offsetHeight;

        setModalContainerHeight(tabHeight);
    });

    serviceTasksEl.append(newEl);
}

function renderWeeklyCheckHeaders() {
    const headerData = [
        ["h4", "Date", "class", "hist-header"],
        ["h4", "Odometer Miles", "class", "hist-header"],
        ["h4", "Miles Travelled", "class", "hist-header"],
        ["h4", "Weekly Jobs", "class", "hist-header"],
        ["h4", "Delete?", "class", "hist-header"],
    ];

    for (let h in headerData) {
        let headerEl = constructWeeklyCheckEl(headerData[h]);

        historyEl.append(headerEl);
    }
}

function renderWeeklyCheck(record) {
    const checkData = [
        ["p", record.date, "id", `date-${record.ID}`],
        ["p", record.miles, "id", `miles-${record.ID}`],
        ["p", record.milesTravelled, "id", `dist-${record.ID}`],
        ["p", `Jobs Done: ${record.weeklies}%`, "id", `jobs-${record.ID}`],
        ["button", "X", "id", `del-${record.ID}`],
    ];
    // Element Type, cell content, attribute type, attribute data

    for (let d in checkData) {
        let dataEl = constructWeeklyCheckEl(checkData[d]);

        historyEl.append(dataEl);
    }
}

function constructWeeklyCheckEl(data) {
    let newEl = document.createElement(data[0]);

    newEl.textContent = data[1];

    newEl.setAttribute(data[2], data[3]);

    return newEl;
}

function lockServiceJobButton(state) {
    if (state) {
        serviceBtnEl.disabled = true;
        serviceBtnEl.style.backgroundColor = "var(--accent-light-color)";
        serviceBtnEl.style.cursor = "not-allowed";
    } else {
        serviceBtnEl.disabled = false;
        serviceBtnEl.style.backgroundColor = "var(--secondary-light-color)";
        serviceBtnEl.style.cursor = "pointer";
    }
}

async function addServiceJobToDB(jobBody, user) {
    try {
        const docRef = await addDoc(
            collection(database, serviceJobsCollectionName),
            {
                body: jobBody,
                uid: user.uid,
                createdAt: serverTimestamp(),
            }
        );
    } catch (error) {
        modalAlert(
            modalAlertEl,
            "Adding Service Job to DB Failed!",
            `${error.message}`
        );
    }
}

async function addWeeklyCheckToDB(checkDate, checkMiles, checkWeeklies, user) {
    try {
        const docRef = await addDoc(
            collection(database, weeklyChecksCollectionName),
            {
                date: checkDate,
                miles: checkMiles,
                weeklies: checkWeeklies,
                uid: user.uid,
                createdAt: serverTimestamp(),
            }
        );
    } catch (error) {
        modalAlert(
            modalAlertEl,
            "Adding Weekly Check to DB Failed!",
            `${error.message}`
        );
    }
}

function weeklyJobList() {
    for (let job in weeklyJobs) {
        const weeklyJobAttrs = [
            ["class", "weekly-job"],
            ["id", `wJ-${weeklyJobs[job]}`],
        ];

        let newEl = addLiElToList(weeklyJobAttrs, false, weeklyJobs[job]);

        weeklyJobsStatus[`${weeklyJobs[job]}`] = false;

        newEl.addEventListener("click", function () {
            weeklyJobBtnSwitch(weeklyJobs[job]);
        });

        document.getElementById("weeklies").append(newEl);
    }
}

function recordKeyPlaceholder(field, placeholder) {
    if (field.value != "") {
        return field.value;
    } else {
        return placeholder;
    }
}

function addLiElToList(attrList, isHTML, text) {
    let newEl = document.createElement("li");

    if (attrList) {
        for (let a in attrList) {
            newEl.setAttribute(attrList[a][0], attrList[a][1]);
        }
    }

    if (isHTML) {
        newEl.innerHTML = text;
    } else {
        newEl.textContent = text;
    }

    return newEl;
}

function clearListEl(list) {
    list.innerHTML = "";
}

function clearFieldEl(field) {
    field.value = "";
}

// function confirmClearRecord() {

//     const modalHeading = "Delete this record?"
//     const modalBody = "This is a permanent action and you will lose this record forever."

//     const verdict = modalConfirm(modalConfirmEl, modalHeading, modalBody)

//     console.log(`Modal Verdict: ${verdict}`)

//     return verdict

// }

async function promiseTest() {
    let promise = new Promise((resolve, reject) => {
        setTimeout(() => resolve("done!"), 2000);
    });

    let result = await promise;

    alert(result);

    return result;
}

// async function confirmClearRecordSequence() {

//     let promise = new Promise((resolve, reject) => {

//         const modalHeading = "Delete this record?"
// 		const modalBody = "This is a permanent action and you will lose this record forever."

// 		const verdict = modalConfirm(modalConfirmEl, modalHeading, modalBody)

//         console.log(`verdict: ${verdict}`)

// 		if (verdict) {

// 			resolve(true)

// 		} else {

// 			resolve(false)

// 		}

//         // resolve("This is the desired result")

//     })

//     // promise.then(confirmClearRecord())

//     let result = await promise

//     return result

// }

async function clearRecord(collection, askIfDelete, docID) {
    let deleteDecision;

    if (askIfDelete) {
        deleteDecision = confirm(`Clear this record?`);

        // deleteDecision = await promiseTest() // Timeout delays function!!!
    } else {
        deleteDecision = true;
    }

    if (deleteDecision) {
        await deleteDoc(doc(database, collection, docID));

        // deleteVerdict = false
    }
}

/* ==  Weekly Job Button Functions == */

function weeklyJobBtnSwitch(jobID) {
    if (weeklyJobsStatus[`${jobID}`] === false) {
        document.getElementById(`wJ-${jobID}`).style.backgroundColor =
            "var(--accent-light-color)";
        document.getElementById(`wJ-${jobID}`).style.color =
            "var(--background-light-color)";
        weeklyJobsStatus[`${jobID}`] = true;
    } else if (weeklyJobsStatus[`${jobID}`] === true) {
        document.getElementById(`wJ-${jobID}`).style.backgroundColor =
            "var(--background-light-color)";
        document.getElementById(`wJ-${jobID}`).style.color =
            "var(--text-light-color)";
        weeklyJobsStatus[`${jobID}`] = false;
    }
}

function weeklyJobBtnReset() {
    for (let i = 0; i < weeklyJobs.length; i++) {
        let jobStatus = weeklyJobsStatus[`${weeklyJobs[i]}`];

        if (jobStatus === true) {
            weeklyJobBtnSwitch(weeklyJobs[i]);
        }
    }
}

/* ==  Weekly Job Record List Functions == */

function recordListCalcs(recordList) {
    recordListCalculateMiles(recordList);

    recordListCalculateJobPercentage(recordList);

    return recordList;
}

function recordListCalculateMiles(recordList) {
    for (let record in recordList) {
        let currentMiles = recordList[record].miles;
        let previousMiles = 0;

        try {
            previousMiles = recordList[record - 1].miles;
        } catch {
            previousMiles = recordList[record].miles; // Perhaps set this to "recordList[record].miles"
            // Thinking of future calcs based on miles travelled, and how
            // having all the miles up to that point affects that
        }

        recordList[record].milesTravelled = currentMiles - previousMiles;
    }
}

function recordListCalculateJobPercentage(recordList) {
    for (let record in recordList) {
        recordList[record].weeklies = weeklyJobPercent(
            recordList[record].weeklies
        );
    }
}

function weeklyJobPercent(weeklies) {
    let wJTotal = 0;
    for (let key in weeklies) {
        wJTotal++;
    }

    let wJDone = 0;
    for (let key in weeklies) {
        if (weeklies.hasOwnProperty(key) && weeklies[key] === true) {
            wJDone++;
        }
    }

    let wJP = (wJDone / wJTotal) * 100;

    return wJP;
}

function recordListReverse(recordList) {
    recordList.reverse();
}

function recordListClear(recordList) {
    recordList = [];

    return recordList;
}

/* ==  Car Stats Functions == */

function carStatsCalcs(recordList) {
    const timeElapsed = getTotalTimeElapsed(recordList);
    // console.log(timeElapsed)

    const milesTravelled = getTotalMilesTravelled(recordList);
    // console.log(milesTravelled)

    const milesPerWeek = getAverageMilesPerWeek(
        milesTravelled,
        timeElapsed.durWeeks
    );
    // console.log(milesPerWeek)

    const table = [
        new CarStatTableRow(
            "Time since first entry",
            timeElapsed.durHumanTerms.report,
            false
        ),
        new CarStatTableRow("Total miles travelled", milesTravelled, true),
        new CarStatTableRow("Average miles per week", milesPerWeek, true),
        new CarStatTableRow("Expected Yearly Miles", milesPerWeek * 52, true),
    ];

    renderCarStatTableContents(table);
}

function getTotalTimeElapsed(recordList) {
    // Get oldest date value and subtract from today's date

    const recordEnd = recordList.length - 1;
    const dateOldest = recordList[recordEnd].date;

    const dateToday = recordList[0].date;

    const time = new TimeElapsed(dateOldest, dateToday);

    return time;
}

function getTotalMilesTravelled(recordList) {
    // Subtract oldest mile value from latest one

    const recordEnd = recordList.length - 1;
    const milesOldest = recordList[recordEnd].miles;

    const milesNewest = recordList[0].miles;

    return milesNewest - milesOldest;
}

function getAverageMilesPerWeek(miles, weeks) {
    return miles / weeks;
}

function renderCarStatTableContents(tableArr) {
    const statsArea = document.getElementById("stats-area");

    statsArea.innerHTML = "";

    for (let row in tableArr) {
        statsArea.append(renderCarStatRowEl("h4", tableArr[row].heading));
        statsArea.append(renderCarStatRowEl("p", tableArr[row].data));
    }
}

function renderCarStatRowEl(type, content) {
    let newEl = document.createElement(type);

    newEl.setAttribute("class", "stats-cell");

    newEl.textContent = content;

    return newEl;
}

/* ==  Settings Functions == */

function renderWeeklyCheckJobListInSettings(weeklyJobs) {
    /*
    For each list item in weeklyJobs:
        Containing Div
            Drag & Drop Handle

            List Item Name

            Delete Button
    
    Add Addition button which opens the following:
        Text Input for new job

        Add Button

        Cancel Button
    */

    const settingWcJobList = document.getElementById("setting-wc-job-list");

    settingWcJobList.innerHTML = "";

    for (let job in weeklyJobs) {
        let newEl = document.createElement("div");
        newEl.setAttribute("class", "setting-wc-job-item");

        let dragHandleEl = document.createElement("div");
        dragHandleEl.setAttribute("class", "drag-handle");
        newEl.append(dragHandleEl);

        let weeklyJobNameEl = document.createElement("p");
        weeklyJobNameEl.textContent = weeklyJobs[job];
        newEl.append(weeklyJobNameEl);

        let deleteButtonEl = document.createElement("button");
        deleteButtonEl.textContent = "X";
        deleteButtonEl.setAttribute("class", "setting-wc-job-list-delete");
        deleteButtonEl.addEventListener("click", function (e) {
            e.preventDefault();

            console.log(`Weekly Job #${job} Deleted.`);
        });
        newEl.append(deleteButtonEl);

        settingWcJobList.append(newEl);
    }
}

function settingsMinLengthCheck(inputName, input, min) {
    if (input.length && input.length < min) {
        modalAlert(
            modalAlertEl,
            "Setting input too short!",
            `The minimum characters for ${inputName} is ${min}, try again.`
        );

        return "";
    } else {
        return input;
    }
}

async function fetchSettingsFromDB(user) {
    const settingsRef = collection(database, settingsCollectionName);

    const q = query(settingsRef, where("uid", "==", user.uid));

    const settingSnapshot = await getDocs(q);

    if (!settingSnapshot.empty) {
        // Fetch settings and set settings fields to the contained data
        settingSnapshot.forEach((doc) => {
            // Run through the doc fields and update settings fields
        });
    } else {
        // Run checkUpdateSettings to create a blank settings file
    }
}

async function checkUpdateSettings(settingsObj, user) {
    const settingsRef = collection(database, settingsCollectionName);

    const q = query(settingsRef, where("uid", "==", user.uid));

    const settingSnapshot = await getDocs(q);

    if (!settingSnapshot.empty) {
        // Find the appropriate settings file and update
        settingSnapshot.forEach((doc) => {
            updateSettingsInDB(doc, settingsObj);
        });
    } else {
        // Create new settings file if one does not exist
        addSettingsToDB(settingsObj, user);
    }
}

async function updateSettingsInDB(wholeDoc, settingsObj) {
    const docRef = doc(database, settingsCollectionName, wholeDoc.id);

    await updateDoc(docRef, {
        defaultTab: settingsObj.defaultTab,
        wcDateTime: settingsObj.wcDateTime,
        sjNotifTime: settingsObj.sjNotifTime,
        licencePlate: settingsObj.licencePlate,
        vinNumber: settingsObj.vinNumber,
        vehiclePurchaseDate: settingsObj.vehiclePurchaseDate,
        weeklyCheckArr: settingsObj.weeklyCheckArr,
        lastUpdated: serverTimestamp(),
    });
}

async function addSettingsToDB(settingsObj, user) {
    try {
        const docRef = await addDoc(
            collection(database, settingsCollectionName),
            {
                defaultTab: settingsObj.defaultTab,
                wcDateTime: settingsObj.wcDateTime,
                sjNotifTime: settingsObj.sjNotifTime,
                licencePlate: settingsObj.licencePlate,
                vinNumber: settingsObj.vinNumber,
                vehiclePurchaseDate: settingsObj.vehiclePurchaseDate,
                weeklyCheckArr: settingsObj.weeklyCheckArr,
                uid: user.uid,
                createdAt: serverTimestamp(),
                lastUpdated: serverTimestamp(),
            }
        );
    } catch (error) {
        modalAlert(
            modalAlertEl,
            "Initializing Settings in DB Failed!",
            `${error.message}`
        );
    }
}
