/* ========================
    Object Constructors
   ======================== */

/* ============
    Functions
   ============ */

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

            renderWeeklyCheckJobListInSettings(weeklyJobs);
        });
        divEl.append(deleteButtonEl);

        newEl.append(divEl);
        settingWcJobList.append(newEl);
    }
}

function getWeeklyCheckListFromSettings(listEl) {
    let newWeeklyJobs = [];

    for (let li in listEl.childNodes) {
        if (listEl.childNodes[li].nodeName === "LI") {
            newWeeklyJobs.push(
                listEl.childNodes[li].getAttribute("data-list-jobname")
            );
        }
    }

    return newWeeklyJobs;
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

            const settings = new SettingsObj(settingData);

            checkUpdateSettings(settings, user);
        }

        userAvatarEl.style.borderColor = "green";
    } catch (error) {
        userAvatarEl.style.borderColor = "red";

        modalAlert(
            modalAlertEl,
            "Failed to fetch Settings!",
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

async function checkUpdateSettings(settingsObj, user) {
    const settingsRef = collection(database, settingsCollectionName);

    const q = query(settingsRef, where("uid", "==", user.uid));

    const settingSnapshot = await getDocs(q);

    if (!settingSnapshot.empty) {
        // Find the appropriate settings file and update
        settingSnapshot.forEach((doc) => {
            updateSettingsInDB(doc, settingsObj);
            weeklyJobList(weeklyJobs);
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
