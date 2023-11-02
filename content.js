console.log("內容腳本注入");

var toggleBg = true;

// 監聽來自background.js的訊息
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    // 在這裡處理來自background.js的訊息
    if (message.type === 'QUERY') {
        // 假設在這裡你可以處理收到的訊息並進行相應的操作
        // 例如，你可以在這裡使用收到的訊息中的web和title數據
        console.log('收到來自background.js的訊息:');
        console.log(message);

        // 假設你有回覆的數據，你可以將它回傳給background.js
        const responseMessage = '這是content.js回覆的訊息';
        sendResponse(responseMessage);

        // 使用chrome.runtime.sendMessage將資料發送給popup.js
        chrome.runtime.sendMessage(message);
    }
});
