var MIRROR_COUNT = 0;
var MIRRORS = [];

var TOP_LIMIT = 10;
var STAGE1_TIMEOUT = 1000;
var STAGE2_TIMEOUT = 400;

var startedTimes = [];
var elapsedTimes = [];
var running = [];
var timedout = [];
var mirrors = [];
var timerIDs = [];
var testImages = [];

function prepare(links) {
    console.log("gleam.prepare");
    for (var i = 0; i < links.length; i++) {
        console.log("gleam.prepare link: " + links[i]);
    }

    MIRRORS = links;
    MIRROR_COUNT = MIRRORS.length;

    for (var i = 0; i < MIRROR_COUNT; i++) {
        running[i] = false;
        elapsedTimes[i] = 9999;
        testImages[i] = new Image();
        testImages[i].onload = testImages[i].onerror =
            function() {
                var endTime = new Date();
                var k;
                for (k = 0; k < MIRROR_COUNT; k++) {
                    if (this.src == mirrors[k]) {
                        mirrors[k] = "";
                        break;
                    }
                }
                clearTimeout(timerIDs[k]);
                if (!running[k] || timedout[k]) {
                    return;
                }
                var delay = (endTime - startedTimes[k]) / 2;
                if (delay < elapsedTimes[k] && delay >= 1) {
                    elapsedTimes[k] = delay;
                }
            }
    }

    start();
}

function start() {
    console.log("gleam.start");
    for (var i = 0; i < MIRROR_COUNT; i++) {
        mirrors[i] = MIRRORS[i] + "GLEAM/";
        running[i] = true;
        setTimeout(ping, i * 10, i, STAGE1_TIMEOUT);
    }
    for (var i = 0; i < MIRROR_COUNT; i++) {
        mirrors[i] = MIRRORS[i] + "GLEAM/";
        running[i] = true;
        setTimeout(ping, i * 20, i, STAGE1_TIMEOUT);
    }
    setTimeout(analyze, 2000);
}

function analyze() {
    console.log("gleam.analyze");
    var times = [];
    var index0 = [];
    for (var i = 0; i < MIRROR_COUNT; i++) {
        index0.push(i);
    }
    var sorted = index0.sort(function(a, b) {
        return elapsedTimes[a] - elapsedTimes[b]
    });
    report(elapsedTimes, sorted);
}

function report(times, sorted) {
    console.log("gleam.report");
    var table = document.getElementById("results");
    var row, cell, a;
    for (var i = 0; i < TOP_LIMIT && i < times.length; i++) {
        row = table.insertRow(-1);
        cell = row.insertCell(0);
        cell.style.textAlign = "center";
        cell.innerHTML = i + 1;
        cell = row.insertCell(1);
        a = document.createElement('a');
        a.appendChild(document.createTextNode(MIRRORS[sorted[i]]));
        a.href = MIRRORS[sorted[i]];
        a.target = "_blank";
        cell.appendChild(a);
        cell = row.insertCell(2);
        cell.style.textAlign = "right";
        cell.innerHTML = Math.round(times[sorted[i]]) + "ms";
    }
    document.getElementById("loading").style.display = "none";
    document.getElementById("wrapper").style.display = "block";
}

function ping(i, time) {
    startedTimes[i] = new Date();
    testImages[i].src = mirrors[i];
    timedout[i] = false;
    timerIDs[i] = setTimeout(timeout, time, i);
}

function timeout(i) {
    if (!running[i]) {
        return;
    }
    timedout[i] = true;
    testImages[i].src = ""; //cancel
}

chrome.extension.onMessage.addListener(function(request, sender) {
    console.log("gleam.addListener");
    if (request.action == "getLinks") {
        prepare(request.links);
    }
});

function onWindowLoad() {
    console.log("gleam.onWindowLoad");
    chrome.tabs.executeScript(null, {
        file: "links.js"
    }, function() {
        if (chrome.extension.lastError) {
            console.log(chrome.extension.lastError.message);
        }
    });

}

window.onload = onWindowLoad;
