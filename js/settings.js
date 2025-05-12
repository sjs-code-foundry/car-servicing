/* ============
    Imports
   ============ */

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
    updateDoc,
    deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";

import {
    tabSwitch,
    userLicencePlateFormat,
    weeklyJobList,
    modalAlert,
} from "/index.js";

/* ========================
    Object Constructors
   ======================== */

// Get settings from settings form:
export function SettingsFormObj(settingData, weeklyJobs) {
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

// Locally-stored settings object for calculations:
export function LocalSettingsObj(wholeDoc) {
    const docData = wholeDoc.data();

    this.defaultTab = docData.defaultTab;
    this.wcDateTime = [docData.wcDateTime[0], docData.wcDateTime[1]];
    this.sjNotifTime = [docData.sjNotifTime[0], docData.sjNotifTime[1]];
    this.licencePlate = docData.licencePlate;
    this.vinNumber = docData.vinNumber;
    this.vehiclePurchaseDate = docData.vehiclePurchaseDate;
    this.weeklyCheckArr = docData.weeklyCheckArr;
}

/* ============
    Functions
   ============ */

/* === Firestore === */

export async function fetchSettingsFromDB(
    user,
    db,
    collectionName,
    localSettingsObj,
    userAvatarEl,
    userAvatarPlateEl,
    weeklyJobs,
    modalAlertEl
) {
    const settingsRef = collection(db, collectionName);

    const q = query(settingsRef, where("uid", "==", user.uid));

    const settingSnapshot = await getDocs(q);

    try {
        if (!settingSnapshot.empty) {
            // Fetch settings and set settings fields to the contained data
            settingSnapshot.forEach((doc) => {
                // Create local settings object
                localSettingsObj = new LocalSettingsObj(doc);

                // Default Tab
                setRadioOption(
                    "default-tab-radio-button",
                    doc.data().defaultTab
                );
                tabSwitch(doc.data().defaultTab);

                // Weekly Check Date/Time
                setSelectOption("setting-wc-day", doc.data().wcDateTime[0]);
                setTextFieldOption("setting-wc-time", doc.data().wcDateTime[1]);

                // Service Job Notification Warning Time
                setTextFieldOption(
                    "setting-sj-notif-time",
                    doc.data().sjNotifTime[0]
                );
                setSelectOption(
                    "setting-sj-notif-period",
                    doc.data().sjNotifTime[1]
                );

                // Vehicle Licence Plate
                setTextFieldOption(
                    "setting-licence-plate",
                    doc.data().licencePlate
                );
                userAvatarPlateEl.textContent = userLicencePlateFormat(
                    doc.data().licencePlate
                );

                // VIN Number
                setTextFieldOption("setting-vin", doc.data().vinNumber);

                // Date of Vehicle Purchase
                setTextFieldOption(
                    "setting-vehicle-purchase-date",
                    doc.data().vehiclePurchaseDate
                );
                // Weekly Check Array of Jobs
                weeklyJobs = doc.data().weeklyCheckArr;
            });
        } else {
            // Run checkUpdateSettings to create a blank settings file
            const settingData = new FormData(settingFormEl);

            const settings = new SettingsFormObj(settingData, weeklyJobs);

            checkUpdateSettings(settings, user, weeklyJobs);
        }

        userAvatarEl.style.borderColor = "green";

        return localSettingsObj;
    } catch (error) {
        userAvatarEl.style.borderColor = "red";

        modalAlert(
            document.getElementById("modal-alert"),
            "Failed to fetch Settings!",
            `${error.message}`
        );
    }
}

export async function checkUpdateSettings(
    database,
    settingsCollectionName,
    SettingsFormObj,
    user,
    weeklyJobs
) {
    const settingsRef = collection(database, settingsCollectionName);

    const q = query(settingsRef, where("uid", "==", user.uid));

    const settingSnapshot = await getDocs(q);

    if (!settingSnapshot.empty) {
        // Find the appropriate settings file and update
        settingSnapshot.forEach((doc) => {
            updateSettingsInDB(
                database,
                settingsCollectionName,
                doc,
                SettingsFormObj
            );
            weeklyJobList(weeklyJobs);
        });
    } else {
        // Create new settings file if one does not exist
        addSettingsToDB(SettingsFormObj, user);
    }
}

/* === Export Functions === */

export function renderWeeklyCheckJobListInSettings(
    settingWcJobList,
    weeklyJobs
) {
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

    new Sortable(settingWcJobList, {
        handle: ".drag-handle",
        animation: 500,
    });

    settingWcJobList.innerHTML = "";

    for (let job in weeklyJobs) {
        let newEl = document.createElement("li");
        newEl.setAttribute("data-list-jobname", `${weeklyJobs[job]}`);

        let divEl = document.createElement("div");
        divEl.setAttribute("class", "setting-wc-job-item");

        let dragHandleEl = document.createElement("div");
        dragHandleEl.setAttribute("class", "drag-handle");
        // Implement drag handle from this:  https://jsfiddle.net/a6tgy9so/1/
        divEl.append(dragHandleEl);

        let weeklyJobNameEl = document.createElement("p");
        weeklyJobNameEl.textContent = weeklyJobs[job];
        divEl.append(weeklyJobNameEl);

        let deleteButtonEl = document.createElement("button");
        deleteButtonEl.textContent = "X";
        deleteButtonEl.setAttribute("class", "setting-wc-job-list-delete");
        deleteButtonEl.addEventListener("click", function (e) {
            e.preventDefault();

            weeklyJobs.splice(job, 1);

            renderWeeklyCheckJobListInSettings(settingWcJobList, weeklyJobs);
        });
        divEl.append(deleteButtonEl);

        newEl.append(divEl);
        settingWcJobList.append(newEl);
    }
}

export function settingsMinLengthCheck(inputName, input, min) {
    if (input.length && input.length < min) {
        modalAlert(
            document.getElementById("modal-alert"),
            "Setting input too short!",
            `The minimum characters for ${inputName} is ${min}, try again.`
        );

        return "";
    } else {
        return input;
    }
}

/* === Internal Functions === */

async function updateSettingsInDB(
    database,
    settingsCollectionName,
    wholeDoc,
    SettingsFormObj
) {
    const docRef = doc(database, settingsCollectionName, wholeDoc.id);

    await updateDoc(docRef, {
        defaultTab: SettingsFormObj.defaultTab,
        wcDateTime: SettingsFormObj.wcDateTime,
        sjNotifTime: SettingsFormObj.sjNotifTime,
        licencePlate: SettingsFormObj.licencePlate,
        vinNumber: SettingsFormObj.vinNumber,
        vehiclePurchaseDate: SettingsFormObj.vehiclePurchaseDate,
        weeklyCheckArr: SettingsFormObj.weeklyCheckArr,
        lastUpdated: serverTimestamp(),
    });
}

async function addSettingsToDB(SettingsFormObj, user) {
    try {
        const docRef = await addDoc(
            collection(database, settingsCollectionName),
            {
                defaultTab: SettingsFormObj.defaultTab,
                wcDateTime: SettingsFormObj.wcDateTime,
                sjNotifTime: SettingsFormObj.sjNotifTime,
                licencePlate: SettingsFormObj.licencePlate,
                vinNumber: SettingsFormObj.vinNumber,
                vehiclePurchaseDate: SettingsFormObj.vehiclePurchaseDate,
                weeklyCheckArr: SettingsFormObj.weeklyCheckArr,
                uid: user.uid,
                createdAt: serverTimestamp(),
                lastUpdated: serverTimestamp(),
            }
        );
    } catch (error) {
        modalAlert(
            document.getElementById("modal-alert"),
            "Initializing Settings in DB Failed!",
            `${error.message}`
        );
    }
}

function setRadioOption(radioBtnListId, docData) {
    const radioTabEls = document.getElementsByClassName(radioBtnListId);

    Array.from(radioTabEls).forEach(function (radio) {
        radio.checked = false;

        if (radio.value === docData) {
            radio.checked = true;
        }
    });
}

function setSelectOption(selectId, docData) {
    const selectEl = document.getElementById(selectId);

    for (let opt of selectEl) {
        opt.selected = false;

        if (opt.value === docData) {
            opt.selected = true;
        }
    }
}

function setTextFieldOption(fieldOptionId, docData) {
    // Also works for number & date fields

    const fieldEl = document.getElementById(fieldOptionId);

    if (fieldEl.value != docData) {
        fieldEl.value = docData;
    }
}
