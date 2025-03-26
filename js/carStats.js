/* ==  Car Stats Functions == */

function carStatsCalcs(recordList) {
    const timeElapsed = getTotalTimeElapsed(recordList);
    const milesTravelled = getTotalMilesTravelled(recordList);
    const milesPerWeek = getAverageMilesPerWeek(
        milesTravelled,
        timeElapsed.durWeeks
    );
    const timeOfOwnership = getTimeOfOwnership(
        localSettingsObj.vehiclePurchaseDate,
        recordList
    );

    const table = [
        new CarStatTableRow(
            "Time since first entry",
            timeElapsed.durHumanTerms.report,
            false
        ),
        new CarStatTableRow("Total miles travelled", milesTravelled, true),
        new CarStatTableRow("Average miles per week", milesPerWeek, true),
        new CarStatTableRow("Expected Yearly Miles", milesPerWeek * 52, true),
        new CarStatTableRow(
            "Duration of Vehicle Ownership",
            timeOfOwnership.durHumanTerms.report,
            false
        ),
    ];

    renderCarStatTableContents(table);
}

function getTotalTimeElapsed(recordList) {
    // Get oldest date value and subtract from today's date

    let dateToday;
    let time;

    // Temporary fix for no when no weekly check records are present
    if (recordList.length === 0) {
        dateToday = new Date();

        time = new TimeElapsed(dateToday, dateToday);
    } else {
        const recordEnd = recordList.length - 1;
        const dateOldest = recordList[recordEnd].date;

        dateToday = recordList[0].date;

        time = new TimeElapsed(dateOldest, dateToday);
    }

    return time;
}

function getTotalMilesTravelled(recordList) {
    // Subtract oldest mile value from latest one

    // Temporary fix for no when no weekly check records are present
    if (recordList.length === 0) {
        return 0;
    }

    const recordEnd = recordList.length - 1;
    const milesOldest = recordList[recordEnd].miles;

    const milesNewest = recordList[0].miles;

    return milesNewest - milesOldest;
}

function getAverageMilesPerWeek(miles, weeks) {
    return miles / weeks;
}

function getTimeOfOwnership(purchaseDate, recordList) {
    let dateToday;
    let time;

    // Temporary fix for no when no weekly check records are present
    if (recordList.length === 0) {
        dateToday = new Date();

        time = new TimeElapsed(dateToday, dateToday);
    } else {
        dateToday = recordList[0].date;

        time = new TimeElapsed(purchaseDate, dateToday);
    }

    return time;
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
