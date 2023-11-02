chrome.runtime.onInstalled.addListener(() => {
    var localSettingObj = {
        // 每當我開啟瀏覽器時，程式於背景執行。
        background_runs: false,
        // 對於載入中網頁的「圖片」元素，先於背景掃描判斷。
        image_background_scanning: true,
        // 掃描完成後自動屏蔽網頁中含有惡意的「圖片」元素。
        image_blocking: true,
        // 對於載入中網頁的「連結」元素，先於背景掃描判斷。
        url_background_scanning: true,
        // 掃描完成後自動屏蔽網頁中含有惡意的「連結」元素。
        url_blocking: true,
        // 對於載入中網頁的內容文字，先於背景掃描判斷。
        context_background_scanning: true,
        // 願意參加使用者回報活動，使資料運算更加準確。
        user_report: true,
        // 同步資料
        sync_google_account: false,
        // 屏蔽所有的網頁分類。
        blocking_all_web_categories: true,
        // 各種清單分類
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
    
    chrome.storage.local.get(['local'], function (result) {
        isNull = result.local === undefined
        if (isNull) {
            chrome.storage.local.set({ local: localSettingObj, stopping: false }, function () {
                console.log('Data inital successfully.');
            });
        } else {
            console.log('Storage Already Exists.');
        }
    });
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // if (tab.url && !tab.url.includes("www.google.com/search") && !tab.url.includes("file://") && !tab.url.includes("chrome://newtab/")) {
    //     let obj = {
    //         type: "QUERY",
    //         web: tab.url,
    //         title: tab.title
    //     };
    //     chrome.tabs.sendMessage(tabId, obj, function (response) {
    //     });
    // }
});


chrome.runtime.onMessageExternal.addListener(function (request, sender, sendResponse) {
    // 使用 fetch 執行實際的 HTTP 請求
    fetch(request.url, {
        method: request.method || 'GET',
        headers: request.headers || {},
        body: request.body || null,
    })
        .then((response) => response.json())
        .then((data) => {
            // 將取得的數據回傳給 content.js
            sendResponse(data);
        })
        .catch((error) => {
            console.error(error);
            // 回傳錯誤給 content.js（如果有需要）
            sendResponse({ error: 'Something went wrong' });
        });

    // 請注意，在 sendResponse 之前回傳 true 以確保 sendResponse 可以異步執行
    return true;
});