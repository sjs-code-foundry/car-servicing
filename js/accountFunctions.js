/* ============
    Imports
   ============ */

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
    flipAccountMode,
    tabSwitch,
    userLicencePlateFormat,
    weeklyJobList,
    modalAlert,
} from "/index.js";

/* ============
    Functions
   ============ */

/* === Account Modal/Tab Functions === */

export function accountBtnSwitch(
    accMode,
    signinBtnGoogleEl,
    tabBtnEl,
    createAccBtnEl
) {
    flipAccountMode();
    accMode = !accMode; // Local mode flip

    const modalHeader = document.getElementById("modal-account-header");
    const formButton = document.getElementById("modal-account-form-btn");
    const switchText = document.getElementById("modal-account-switch-btn-text");

    let flipText = "";
    let flipBackText = "";

    if (accMode) {
        flipText = "Create an account";
        flipBackText = "Sign in";

        switchText.textContent = "Got an account?";
        formButton.textContent = "Create Account with Email";

        signinBtnGoogleEl.style.display = "none";
    } else {
        flipText = "Sign In";
        flipBackText = "Create an account";

        switchText.textContent = "No account?";
        formButton.textContent = "Sign In with Email";

        signinBtnGoogleEl.style.display = "inline-block";
    }

    modalHeader.textContent = flipText;
    tabBtnEl.textContent = flipText;
    createAccBtnEl.textContent = flipBackText;
}

export function authSignInWithGoogle(auth, provider) {
    signInWithPopup(auth, provider)
        .then((result) => {
            tabSwitch("tab-weekly-checks"); // Default tab when settings not created
        })
        .catch((error) => {
            modalAlert(
                document.getElementById("modal-alert"),
                "Sign In with Google Failed!",
                `${error.message}`
            );
        });
}

export function authSignInWithEmail(accountFormEl, auth) {
    const email = accountFormEl.email.value;
    const password = accountFormEl.password.value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            tabSwitch("tab-weekly-checks"); // Default tab when settings not created
        })
        .catch((error) => {
            modalAlert(
                document.getElementById("modal-alert"),
                "Sign In Failed!",
                `${error.message}`
            );
        });
}

export function authCreateAccountWithEmail(accountFormEl, auth) {
    const email = accountFormEl.email.value;
    const password = accountFormEl.password.value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            modalAlert(
                document.getElementById("modal-alert"),
                "Account Created!",
                `Account for "${email}" created!`
            );
        })
        .catch((error) => {
            modalAlert(
                document.getElementById("modal-alert"),
                "Create Account Failed!",
                `${error.message}`
            );
        });
}

function authSignOut(auth) {
    signOut(auth)
        .then(() => {
            // Not Needed, tab switched by tabMenuEl Event Listener
        })
        .catch((error) => {
            modalAlert(
                document.getElementById("modal-alert"),
                "Sign Out Failed!",
                `${error.message}`
            );
        });
}

/* === Retrieve snapshot from DB === */

// Uncomment when ready to use:

/*
onAuthStateChanged(auth, (user) => {
    const accountStatusHeader = document.getElementById(
        "account-status-header"
    );

    userAvatarSwitch(user);

    if (user) {
        accountStatusHeader.textContent = `Signed in as: ${user.email}.`;
        userAvatarEl.style.borderColor = "blue";

        tabBtnAccount.style.display = "none";
        tabBtnLogout.style.display = "block";

        localSettingsObj = fetchSettingsFromDB(
            user,
            database,
            settingsCollectionName,
            localSettingsObj,
            userAvatarEl,
            userAvatarPlateEl,
            weeklyJobs,
            document.getElementById("modal-alert")
        );

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

*/

function fetchServiceJobsInRealTimeFromDBs(query, user) {
    try {
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

        userAvatarEl.style.borderColor = "green";
    } catch (error) {
        userAvatarEl.style.borderColor = "red";

        modalAlert(
            document.getElementById("modal-alert"),
            "Failed to fetch Service Jobs!",
            `${error.message}`
        );
    }
}

// function fetchWeeklyCheckJobListInRealTimeFromDBs(query, user)

function fetchWeeklyChecksInRealTimeFromDBs(query, user) {
    try {
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

            document
                .getElementById("stats-area")
                .replaceWith(carStatsCalcs(recordList, localSettingsObj));

            weeklyJobList(weeklyJobs);
            renderWeeklyCheckJobListInSettings(settingWcJobList, weeklyJobs);
        });

        userAvatarEl.style.borderColor = "green";
    } catch (error) {
        userAvatarEl.style.borderColor = "red";

        modalAlert(
            document.getElementById("modal-alert"),
            "Failed to fetch Service Jobs!",
            `${error.message}`
        );
    }
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

/* === Internal Functions === */
