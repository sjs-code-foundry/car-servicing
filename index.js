// Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"


// Initialize firebase
const appSettings = {
    databaseURL: "https://playground-62567-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const weeklyChecksInDB = ref(database, "weeklyCarChecks")

// DOM Elements
const dateField = document.getElementById("date-field")

console.log(dateField)

// Retrieve snapshot from DB
onValue(weeklyChecksInDB, function(snapshot) {
    if (snapshot.exists()) {
        let weeklyArray = Object.entries(snapshot.val())
    }
})

// Event Listeners

// Example Arrays for Testing

// Functions

