import { getActiveTabURL } from "./utils.js";

const dangerSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#e74c3c"
    class="bi bi-x-circle-fill" viewBox="0 0 16 16">
    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z" />
</svg>`;

const warningSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="24" fill="#f1c40f" 
    class="bi bi-exclamation-circle-fill" viewBox="0 0 16 16">
    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
</svg>`;

const safeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="24" fill="#2ecc71"
    class="bi bi-check-circle-fill" viewBox="0 0 16 16">
    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
</svg>`;

const server = "http://127.0.0.1:5000/api/v1";

const safeLists = [
    "https://www.youtube.com/",
    "file://",
    "chrome-extension://",
    "https://www.google.com/search",
    "https://www.google.com",
    "chrome://newtab/",
    "https://chat.openai.com/"
]

/**
 * 頁面載入程式
 * @說明 當使用點選網頁插件圖示時，popup.html載入時執行
 * @工作1 檢查使用者是否停用功能
 * @工作2 檢查是否為安全清單
 * @工作3 定義檢測清單
 * @工作4 呼叫檢測API - 連結風險
 * @工作5 呼叫檢測API - 背景程式與內容
 * @工作6 呼叫檢測API - 圖片危險
 * @工作7 呼叫檢測API - 內容可信度
 * @工作8 呼叫檢測API - 內容標籤
 * @工作9 設定定時器檢測是否完成所有的清單
 * @工作10 網頁內按鈕部署
 */
document.addEventListener('DOMContentLoaded', async () => {
    const activeTab = await getActiveTabURL();
    let callSwitch = true;
    console.log("*", activeTab)

    let url = activeTab.url;
    safeLists.forEach(element => {
        if (url.startsWith(element)) {
            callSwitch = false;
            document.querySelector(".search").style.display = "none";
            document.getElementById("badge-title").style.display = 'none';
            document.getElementById("badge-waiting").style.display = 'none';
            document.querySelector('.successful').style.display = 'block';
            document.getElementById("success-text").innerText = "您目前的網頁很安全";
        }
    });

    chrome.storage.local.get(['stopping'], function (result) {
        if (result.stopping) {
            callSwitch = false;
            document.querySelector(".search").style.display = "none";
            document.getElementById("badge-title").style.display = 'none';
            document.getElementById("badge-waiting").style.display = 'none';
            document.getElementById("badge").style.display = 'none';
            document.querySelector('.successful').style.display = 'block';
            document.getElementById("success-text").innerText = "您已停用檢測功能";
        }
    });

    var searchObjs = {
        risk: {
            complete: false,
            feedback: `正在檢查「${processActiveWebTitle(activeTab.title, 20)}」...`
        },
        context: {
            complete: false,
            feedback: `正在檢查「${processActiveWebTitle(activeTab.title, 20)}」...`
        },
        images: {
            complete: true,
            feedback: `正在檢查「${processActiveWebTitle(activeTab.title, 20)}」...`
        },
        trust: {
            complete: false,
            feedback: `正在檢查「${processActiveWebTitle(activeTab.title, 20)}」...`
        },
        badge: {
            complete: false,
            feedback: `正在檢查「${processActiveWebTitle(activeTab.title, 20)}」...`
        }
    }

    var waitingCurrent = 0;
    var intervalId = setInterval(() => {
        waitingCurrent += .1;
        console.log(searchObjs.risk.complete, searchObjs.context.complete,
            searchObjs.images.complete, searchObjs.trust.complete, searchObjs.badge.complete)
        if (waitingCurrent >= 3 && searchObjs.risk.complete && searchObjs.context.complete && searchObjs.images.complete && searchObjs.trust.complete && searchObjs.badge.complete) {
            completeAPI()
            clearInterval(intervalId)
        }
    }, 100);

    if (callSwitch) {
        setTimeout(() => {
            document.getElementById("resultPoint3").innerHTML = `網頁圖片分析狀態: 安全`
            document.getElementById("resultBtn3").innerHTML = safeSvg;

            const riskURL = `${server}/ext/risk?url=${activeTab.url}`
            fetch(riskURL, {
                method: 'GET'
            }).then((response) => response.json())
                .then((data) => {
                    searchObjs.risk.complete = true
                    document.getElementById("resultPoint1").innerHTML = `網頁中連結存在${data.data.count}個風險`;
                    document.getElementById("resultBtn1").innerHTML = switchSvg(data.data.count);
                }).catch((error) => {
                    console.error(error);
                });

            chrome.storage.local.get(['local'], function (result) {
                const contextURL = `${server}/ext/context?url=${activeTab.url}${switchFilter(result.local)}`
                fetch(contextURL, {
                    method: 'GET'
                }).then((response) => response.json())
                    .then((data) => {
                        searchObjs.context.complete = true
                        document.getElementById("resultPoint2").innerHTML = `文本及潛在威脅分析: ${"安全"}`
                        document.getElementById("resultBtn2").innerHTML = switchSvg(data.data.lengths);
                    }).catch((error) => {
                        console.error(error);
                    });
            })

            const imageURL = `${server}/ext/image?url=${activeTab.url}`
            fetch(imageURL, {
                method: 'GET'
            }).then((response) => response.json())
                .then((data) => {
                    searchObjs.trust.complete = true
                    let detecting = ["adult", "spoof", "medical", "violence", "racy"];
                    let resString = [];
                    if (data.data.length == 0) {
                        document.getElementById("resultBtn4").innerHTML = safeSvg;
                        document.getElementById("resultPoint4").innerHTML = `AI分析: 安全`
                    } else {
                        let responseObj = data.data;
                        for (let i = 0; i < detecting.length; i++) {
                            for(let j = 0; j < responseObj.length; j++) {
                                if (detecting[i] == resString[j]) {
                                    resString.push(detecting[i])
                                }
                            }
                        }
                        let feedback = "";
                        for(let k = 0; k < resString.length; k++) {
                            switch (element) {
                                case "adult": feedback += "<span>色情</span>"; break;
                                case "spoof": feedback += "<span>非寫實</span>"; break;
                                case "medical": feedback += "<span>血腥</span>"; break;
                                case "violence": feedback += "<span>暴力</span>"; break;
                                case "racy": feedback += "<span>過激</span>"; break;
                            }
                            if ((resString.length-1) != k) {
                                feedback += "、";
                            }
                        }
                        document.getElementById("resultPoint4").innerHTML = `AI分析: 可能含有 ${ feedback }資訊`
                    }
                    
                }).catch((error) => {
                    console.error(error);
                });

            const trustURL = `${server}/ext/trust?url=${activeTab.url}`
            fetch(trustURL, {
                method: 'GET'
            }).then((response) => response.json())
                .then((data) => {
                    searchObjs.trust.complete = true
                    document.getElementById("resultPoint4").innerHTML = `AI分析可信度: <span>${data.data.feedback}</span>`
                    document.getElementById("resultBtn4").innerHTML = safeSvg;
                }).catch((error) => {
                    console.error(error);
                });

            const badgeURL = `${server}/ext/badge?url=${activeTab.url}`
            fetch(badgeURL, {
                method: 'GET'
            }).then((response) => response.json())
                .then((data) => {
                    searchObjs.badge.complete = true
                    let obj = data.data
                    let badges = ""
                    obj.forEach(element => {
                        badges += `<span class="badge-fade fade-in-point">${element}</span>`
                    });
                    document.getElementById("badge").innerHTML = badges
                    document.getElementById("badge-waiting").style.display = "none"
                    completebadgeAPI()
                }).catch((error) => {
                    console.error(error);
                });
        }, 1000);
    }

    DeployStatusEffect(searchObjs, activeTab.title)
    DeployResultTitle(activeTab.title, activeTab.url)
    DeployAllButton()
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    return true;
});

function DeployStatusEffect(searchObjs, title) {
    let searchObjsList = ["risk", "context", "images", "trust", "badge"];
    let serIndex = 0;
    var webTitleInterval = setInterval(() => {
        serIndex = (serIndex + 1) % 5;
        searchObjStatus(searchObjs, searchObjsList[serIndex], title)
        if (searchObjs.risk.complete && searchObjs.context.complete && searchObjs.images.complete && searchObjs.trust.complete && searchObjs.badge.complete) {
            clearInterval(webTitleInterval)
        }
    }, 1000);
}

function DeployResultTitle(title, url) {
    document.getElementById("resultTitle").innerText =
        `您搜尋「${processActiveWebTitle(title, 5)}」結果`;
    document.getElementById("resultTitle").title =
        `您搜尋「${title}」(${url})結果`
}

function DeployAllButton() {
    /* 功能按鍵 - 停用功能 */
    var disabledFunction = document.getElementById("disabledFunction");
    changeDisabledFunctionBtn();
    disabledFunction.addEventListener('click', () => {
        chrome.storage.local.get(['stopping'], function (result) {
            let toggle = !result.stopping
            chrome.storage.local.set({ stopping: toggle }, () => {
                changeDisabledFunctionBtn()
            });
        });
    });

    /* 功能按鍵 - 深度檢測 */
    var deepSearch = document.getElementById("deepSearch");
    changeDeepSearch();
    deepSearch.addEventListener('click', () => {
        chrome.tabs.create({ "url": "https://yuehfeng226.github.io/www/badge.html" });
    });

    /* 功能按鍵 - 回報問題 */
    var questProblem = document.getElementById("questProblem");
    changeQuestProblem();
    questProblem.addEventListener('click', () => {
        const url = `https://github.com/yuehfeng?url=${activeTab.url}`
        chrome.tabs.create({ "url": url });
    });

    /* 其他服務按鈕 - 前往官方網站 */
    var watchSite = document.getElementById("watchSite");
    watchSite.addEventListener('click', () => {
        chrome.tabs.create({ "url": "https://github.com/yuehfeng" });
    });

    /* 其他服務按鈕 - 前往LINE機器人 */
    var watchLineBot = document.getElementById("watchLineBot");
    watchLineBot.addEventListener('click', () => {
        chrome.tabs.create({ "url": "https://developers.line.biz/zh-hant/" });
    });

    /* 設定按鈕 */
    var Setting = document.getElementById("Setting");
    Setting.addEventListener('click', () => {
        chrome.tabs.create({ "url": "./setting.html" });
    });
}

function searchObjStatus(searchObjs, key, title) {
    if (!searchObjs[key].complete) {
        document.getElementById("webTitle").innerText = searchObjs[key].feedback;
        document.getElementById("webTitle").title = title;
    }
}

// 停用功能按鈕顯示
function changeDisabledFunctionBtn() {
    let disabledFunction = document.getElementById("disabledFunction");
    chrome.storage.local.get(['stopping'], function (result) {
        let code = `<svg xmlns="http://www.w3.org/2000/svg" width="30" 
        height="30" fill="${result.stopping ? "#00ae1d" : "#da1a1a"}"
        class="bi bi-sign-stop" viewBox="0 0 16 16">
        <path d="M3.16 10.08c-.931 0-1.447-.493-1.494-1.132h.653c.065.346.396.583.891.583.524 0 .83-.246.83-.62 0-.303-.203-.467-.637-.572l-.656-.164c-.61-.147-.978-.51-.978-1.078 0-.706.597-1.184 1.444-1.184.853 0 1.386.475 1.436 1.087h-.645c-.064-.32-.352-.542-.797-.542-.472 0-.77.246-.77.6 0 .261.196.437.553.522l.654.161c.673.164 1.06.487 1.06 1.11 0 .736-.574 1.228-1.544 1.228Zm3.427-3.51V10h-.665V6.57H4.753V6h3.006v.568H6.587Z" />
        <path fill-rule="evenodd" d="M11.045 7.73v.544c0 1.131-.636 1.805-1.661 1.805-1.026 0-1.664-.674-1.664-1.805V7.73c0-1.136.638-1.807 1.664-1.807 1.025 0 1.66.674 1.66 1.807Zm-.674.547v-.553c0-.827-.422-1.234-.987-1.234-.572 0-.99.407-.99 1.234v.553c0 .83.418 1.237.99 1.237.565 0 .987-.408.987-1.237Zm1.15-2.276h1.535c.82 0 1.316.55 1.316 1.292 0 .747-.501 1.289-1.321 1.289h-.865V10h-.665V6.001Zm1.436 2.036c.463 0 .735-.272.735-.744s-.272-.741-.735-.741h-.774v1.485h.774Z" />
        <path fill-rule="evenodd" d="M4.893 0a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353L11.46.146A.5.5 0 0 0 11.107 0H4.893ZM1 5.1 5.1 1h5.8L15 5.1v5.8L10.9 15H5.1L1 10.9V5.1Z" />
        </svg>
        <div class="${result.stopping ? "text-light-greenish-blue" : "text-chi-gong"} font-weight-bold">
        ${result.stopping ? "啟用功能" : "暫停功能"}</div>`;
        disabledFunction.innerHTML = code;
    });
}

// 深度檢測按鈕顯示
function changeDeepSearch() {
    let deepSearch = document.getElementById("deepSearch");
    let code = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="${"#4575e6"}" class="bi bi-search"
    viewBox="0 0 16 16">
    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
    </svg>
    <div class="font-weight-bold text-green-darner-tail">檢測資訊</div>`;
    deepSearch.innerHTML = code
}

// 回報問題按鈕顯示
function changeQuestProblem() {
    let questProblem = document.getElementById("questProblem");
    let code = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="${"#ffeaa7"}"
        class="bi bi-question-circle" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
        <path
            d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z" />
    </svg>
    <div class="font-weight-bold text-sour-lemon">回報問題</div>`;
    questProblem.innerHTML = code
}

// 切換安全圖示
function switchSvg(count) {
    if (count == 0) {
        return safeSvg
    } else if (count == 1) {
        return warningSvg
    }
    return dangerSvg
}

// 檢測清單撇除使用者設定資料
function switchFilter(lists) {
    let text = ""
    if (lists.blocking_all_web_categories) return text;
    if (!lists.web_categories.abuse) text += "&abuse=1"
    if (!lists.web_categories.ads) text += "&ads=1"
    if (!lists.web_categories.crypto) text += "&crypto=1"
    if (!lists.web_categories.drugs) text += "&drugs=1"
    if (!lists.web_categories.facebook) text += "&facebook=1"
    if (!lists.web_categories.fraud) text += "&fraud=1"
    if (!lists.web_categories.gambling) text += "&gambling=1"
    if (!lists.web_categories.malware) text += "&malware=1"
    if (!lists.web_categories.phishing) text += "&phishing=1"
    if (!lists.web_categories.piracy) text += "&piracy=1"
    if (!lists.web_categories.porn) text += "&porn=1"
    if (!lists.web_categories.ransomware) text += "&ransomware=1"
    if (!lists.web_categories.scam) text += "&scam=1"
    if (!lists.web_categories.tiktok) text += "&tiktok=1"
    if (!lists.web_categories.torrent) text += "&torrent=1"
    if (!lists.web_categories.tracking) text += "&tracking=1"
    return text
}

// 當所有分析完成呼叫後 放上漸入特效
function completeAPI() {
    document.querySelector(".search").style.display = "none";
    var pointElements = document.querySelectorAll('[class^="point"]');
    pointElements.forEach(function (element) {
        element.style.display = "block";
    });

    var elements = document.querySelectorAll('.fade-in-point');
    for (let i = 0; i < elements.length; i++) {
        setTimeout(function () {
            elements[i].classList.add('fade-in');
        }, (100 * (i + 1)));
    }
}

// 當網頁分類API完成呼叫 放上漸入特效
function completebadgeAPI() {
    var elements = document.querySelectorAll('[class^="badge-fade"]');
    for (let i = 0; i < elements.length; i++) {
        setTimeout(function () {
            elements[i].classList.add('fade-in');
        }, (100 * (i + 1)));
    }
}

// 處理webTitle的縮寫
function processActiveWebTitle(title, limit) {
    if (title.length > limit) {
        return title.slice(0, limit) + "..."
    }
    return title
}