
var background_runs = document.getElementById("background_runs");
var image_background_scanning = document.getElementById("image_background_scanning");
var image_blocking = document.getElementById("image_blocking");
var url_background_scanning = document.getElementById("url_background_scanning");
var url_blocking = document.getElementById("url_blocking");
var context_background_scanning = document.getElementById("context_background_scanning");
var user_report = document.getElementById("user_report");
var sync_google_account = document.getElementById("sync_google_account");
var blocking_all_web_categories = document.getElementById("blocking_all_web_categories");
var abuse = document.getElementById("abuse");
var ads = document.getElementById("ads");
var cryptoChild = document.getElementById("crypto");
var drugs = document.getElementById("drugs");
var facebook = document.getElementById("facebook");
var fraud = document.getElementById("fraud");
var gambling = document.getElementById("gambling");
var malware = document.getElementById("malware");
var phishing = document.getElementById("phishing");
var piracy = document.getElementById("piracy");
var porn = document.getElementById("porn");
var ransomware = document.getElementById("ransomware");
var scam = document.getElementById("scam");
var tiktok = document.getElementById("tiktok");
var torrent = document.getElementById("torrent");
var tracking = document.getElementById("tracking");
var clearStorage = document.getElementById("clearStorage");

var current;

document.addEventListener("DOMContentLoaded", function () {
    chrome.storage.local.get(['local'], function (result) {
        current = result.local;
        background_runs.checked = current.background_runs;
        image_background_scanning.checked = current.image_background_scanning;
        image_blocking.checked = current.image_blocking;
        url_background_scanning.checked = current.url_background_scanning;
        url_blocking.checked = current.url_blocking;
        context_background_scanning.checked = current.context_background_scanning;
        user_report.checked = current.user_report;
        sync_google_account.checked = current.sync_google_account;
        blocking_all_web_categories.checked = current.blocking_all_web_categories;
        changeChildStyle(blocking_all_web_categories.checked);
        abuse.checked = current.web_categories.abuse;
        ads.checked = current.web_categories.ads;
        cryptoChild.checked = current.web_categories.crypto;
        drugs.checked = current.web_categories.drugs;
        facebook.checked = current.web_categories.facebook;
        fraud.checked = current.web_categories.fraud;
        gambling.checked = current.web_categories.gambling;
        malware.checked = current.web_categories.malware;
        phishing.checked = current.web_categories.phishing;
        piracy.checked = current.web_categories.piracy;
        porn.checked = current.web_categories.porn;
        ransomware.checked = current.web_categories.ransomware;
        scam.checked = current.web_categories.scam;
        tiktok.checked = current.web_categories.tiktok;
        torrent.checked = current.web_categories.torrent;
        tracking.checked = current.web_categories.tracking;
    })
});

function successChange() {
    console.log('Data saved successfully.');
}

function changeChildStyle(childToggle) {
    var elements = document.querySelectorAll(".child-categories")
    elements.forEach(element => {
        element.style.opacity = childToggle ? .6 : 1;
        element.style.pointerEvents = childToggle ? "none" : "auto";
    });
}

clearStorage.addEventListener('click', function (event) {
    chrome.storage.local.clear(function () {
        var localSettingObj = {
            background_runs: false,
            image_background_scanning: false,
            image_blocking: false,
            url_background_scanning: false,
            url_blocking: false,
            context_background_scanning: false,
            user_report: false,
            sync_google_account: false,
            blocking_all_web_categories: false,
            web_categories: {
                abuse: false,
                ads: false,
                crypto: false,
                drugs: false,
                facebook: false,
                fraud: false,
                gambling: false,
                malware: false,
                phishing: false,
                piracy: false,
                porn: false,
                ransomware: false,
                scam: false,
                tiktok: false,
                torrent: false,
                tracking: false,
                opendata_web: false,
                opendata_lineid: false
            }
        }
        current = localSettingObj
        chrome.storage.local.set({ local: localSettingObj }, function () {
            console.log('Data inital successfully.');
        });
    });
});

background_runs.addEventListener('change', function (event) {
    current.background_runs = event.target.checked;
    chrome.storage.local.set({ local: current }, function () {
        successChange();
    });
});

image_background_scanning.addEventListener('change', function (event) {
    current.image_background_scanning = event.target.checked;
    chrome.storage.local.set({ local: current }, function () {
        successChange();
    });
});

image_blocking.addEventListener('change', function (event) {
    current.image_blocking = event.target.checked;
    chrome.storage.local.set({ local: current }, function () {
        successChange();
    });
});

url_background_scanning.addEventListener('change', function (event) {
    current.url_background_scanning = event.target.checked;
    chrome.storage.local.set({ local: current }, function () {
        successChange();
    });
});

url_blocking.addEventListener('change', function (event) {
    current.url_blocking = event.target.checked;
    chrome.storage.local.set({ local: current }, function () {
        successChange();
    });
});

context_background_scanning.addEventListener('change', function (event) {
    current.context_background_scanning = event.target.checked;
    chrome.storage.local.set({ local: current }, function () {
        successChange();
    });
});

user_report.addEventListener('change', function (event) {
    current.user_report = event.target.checked;
    chrome.storage.local.set({ local: current }, function () {
        successChange();
    });
});

sync_google_account.addEventListener('change', function (event) {
    current.sync_google_account = event.target.checked;
    chrome.storage.local.set({ local: current }, function () {
        successChange();
    });
});

blocking_all_web_categories.addEventListener('change', function (event) {
    current.blocking_all_web_categories = event.target.checked;
    changeChildStyle(event.target.checked);
    chrome.storage.local.set({ local: current }, function () {
        successChange();
    });
});

// 子分類
abuse.addEventListener('change', function (event) {
    current.web_categories.abuse = event.target.checked;
    chrome.storage.local.set({ local: current }, function () {
        successChange();
    });
});

ads.addEventListener('change', function (event) {
    current.web_categories.ads = event.target.checked;
    chrome.storage.local.set({ local: current }, function () {
        successChange();
    });
});

cryptoChild.addEventListener('change', function (event) {
    current.web_categories.crypto = event.target.checked;
    chrome.storage.local.set({ local: current }, function () {
        successChange();
    });
});

drugs.addEventListener('change', function (event) {
    current.web_categories.drugs = event.target.checked;
    chrome.storage.local.set({ local: current }, function () {
        successChange();
    });
});

facebook.addEventListener('change', function (event) {
    current.web_categories.facebook = event.target.checked;
    chrome.storage.local.set({ local: current }, function () {
        successChange();
    });
});

fraud.addEventListener('change', function (event) {
    current.web_categories.fraud = event.target.checked;
    chrome.storage.local.set({ local: current }, function () {
        successChange();
    });
});

gambling.addEventListener('change', function (event) {
    current.web_categories.gambling = event.target.checked;
    chrome.storage.local.set({ local: current }, function () {
        successChange();
    });
});

malware.addEventListener('change', function (event) {
    current.web_categories.malware = event.target.checked;
    chrome.storage.local.set({ local: current }, function () {
        successChange();
    });
});

phishing.addEventListener('change', function (event) {
    current.web_categories.phishing = event.target.checked;
    chrome.storage.local.set({ local: current }, function () {
        successChange();
    });
});

piracy.addEventListener('change', function (event) {
    current.web_categories.piracy = event.target.checked;
    chrome.storage.local.set({ local: current }, function () {
        successChange();
    });
});

porn.addEventListener('change', function (event) {
    current.web_categories = event.target.checked;
    chrome.storage.local.set({ local: current }, function () {
        successChange();
    });
});

ransomware.addEventListener('change', function (event) {
    current.web_categories.ransomware = event.target.checked;
    chrome.storage.local.set({ local: current }, function () {
        successChange();
    });
});

scam.addEventListener('change', function (event) {
    current.web_categories.scam = event.target.checked;
    chrome.storage.local.set({ local: current }, function () {
        successChange();
    });
});

tiktok.addEventListener('change', function (event) {
    current.web_categories.tiktok = event.target.checked;
    chrome.storage.local.set({ local: current }, function () {
        successChange();
    });
});

torrent.addEventListener('change', function (event) {
    current.web_categories.torrent = event.target.checked;
    chrome.storage.local.set({ local: current }, function () {
        successChange();
    });
});

tracking.addEventListener('change', function (event) {
    current.web_categories.tracking = event.target.checked;
    chrome.storage.local.set({ local: current }, function () {
        successChange();
    });
});

opendata_web.addEventListener('change', function (event) {
    current.web_categories.opendata_web = event.target.checked;
    chrome.storage.local.set({ local: current }, function () {
        successChange();
    });
});

opendata_lineid.addEventListener('change', function (event) {
    current.web_categories.opendata_lineid = event.target.checked;
    chrome.storage.local.set({ local: current }, function () {
        successChange();
    });
});