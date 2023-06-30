function scrollToBottomSmooth() {
    const element = document.documentElement;
    const bottom = element.scrollHeight - element.clientHeight;
    element.scrollTo({
        top: bottom,
        behavior: 'smooth'
    });
}

function scrollToBottomQuick() {
    const element = document.documentElement;
    const bottom = element.scrollHeight - element.clientHeight;
    element.scrollTo({
        top: bottom
    });
}

function isScrollbarAtBottom() {
    var element = document.documentElement;
    var scrollTop = element.scrollTop;
    var scrollHeight = element.scrollHeight;
    var clientHeight = element.clientHeight;

    return scrollTop + clientHeight >= scrollHeight;
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function saveHTMLToLocalStorage() {
    let messageBox = document.getElementById("messageBox");
    // 对HTML内容进行编码，确保特殊字符正确存储
    var encodedHTML = encodeURIComponent(messageBox.innerHTML);

    // 将编码后的HTML内容存储到localStorage中
    localStorage.setItem("html", encodedHTML);
}

// 从localStorage中获取存储的HTML内容
function getHTMLFromLocalStorage() {
    // 获取存储的HTML内容
    var encodedHTML = localStorage.getItem("html");

    // 判断是否存在存储的HTML内容
    if (encodedHTML) {
        // 解码HTML内容，并返回
        return decodeURIComponent(encodedHTML);
    }

    // 如果没有存储的HTML内容，则返回空字符串
    return "";
}

function setChatIdToCookie(chatId, username) {
    // 设置Cookie的过期时间为一个月
    alert(chatId + " : " + username);
    var expires = new Date();
    expires.setTime(expires.getTime() + (30 * 24 * 60 * 60 * 1000));
    // 构建Cookie字符串
    var cookieString = "chatId=" + encodeURIComponent(chatId) + ";";
    cookieString += "username=" + encodeURIComponent(username) + ";";
    cookieString += "expires=" + expires.toUTCString() + ";path=/";
    // 设置Cookie
    document.cookie = cookieString;
}

function getValueFromCookie(key) {
    var token = ""; // 默认设置为空字符串

    var cookies = document.cookie.split(";"); // 将Cookie字符串拆分为数组

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim(); // 去除空格

        // 检查是否以"token="开头
        if (cookie.indexOf(key + "=") === 0) {
            token = cookie.substring(key + "=".length, cookie.length); // 获取token值
            break;
        }
    }
    return token;
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

