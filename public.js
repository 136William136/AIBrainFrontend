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

function saveHTMLToLocalStorage(currentSession) {
    let messageBox = document.getElementById("messageBox");
    // 对HTML内容进行编码，确保特殊字符正确存储
    let encodedHTML = encodeURIComponent(messageBox.innerHTML);

    // 将编码后的HTML内容存储到localStorage中
    localStorage.setItem(currentSession, encodedHTML);
}

function saveSessionToLocalStorage(key, content){
    let encodedContent = encodeURIComponent(content);
    // 将编码后的HTML内容存储到localStorage中
    localStorage.setItem(key, encodedContent);
}

// 从localStorage中获取存储的HTML内容
function getHTMLFromLocalStorage(session) {
    // 获取存储的HTML内容
    let encodedHTML = localStorage.getItem(session);

    // 判断是否存在存储的HTML内容
    if (encodedHTML) {
        // 解码HTML内容，并返回
        return decodeURIComponent(encodedHTML);
    }

    // 如果没有存储的HTML内容，则返回空字符串
    return "";
}

function updateSessionName(sessionId, sessionName){
    let sessionMap = getHTMLFromLocalStorage("sessionName");
    let jsonObject = {};
    if (sessionMap != ""){
        jsonObject = JSON.parse(sessionMap);
    }
    jsonObject[sessionId] = sessionName;
    saveSessionToLocalStorage("sessionName",JSON.stringify(jsonObject));
}

function deleteSessionName(sessionId){
    let sessionMap = getHTMLFromLocalStorage("sessionName");
    let jsonObject = {};
    if (sessionMap != ""){
        jsonObject = JSON.parse(sessionMap);
    }
    delete jsonObject[sessionId];
    saveSessionToLocalStorage("sessionName",JSON.stringify(jsonObject));
}

function changeTheme(){
    let theme = getValueFromCookie("theme");
    if (theme === '' || theme === 'light'){
        setCookie("theme","dark");
        document.getElementById("headerBar").classList.remove("light-theme");
        document.body.classList.remove("light-theme");
        document.getElementById("headerBar").classList.add("dark-theme");
        document.body.classList.add("dark-theme");
    }else{
        setCookie("theme","light");
        document.getElementById("headerBar").classList.remove("dark-theme");
        document.body.classList.remove("dark-theme");
        document.getElementById("headerBar").classList.add("light-theme");
        document.body.classList.add("light-theme");
    }
}

function checkTheme(){
    let theme = getValueFromCookie("theme");
    if (theme === '' || theme === 'light'){
        document.getElementById("headerBar").classList.remove("dark-theme");
        document.body.classList.remove("dark-theme");
    }else{
        document.getElementById("headerBar").classList.add("dark-theme");
        document.body.classList.add("dark-theme");
    }
}

function setCookie(cookieName, cookieValue, expirationDays) {
    localStorage.setItem(cookieName, cookieValue);
    // let d = new Date();
    // d.setTime(d.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
    // let expires = "expires=" + d.toUTCString();
    // document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/";
}

function getValueFromCookie(cookieName) {
    var encodedHTML = localStorage.getItem(cookieName);
    if (encodedHTML){
        return encodedHTML;
    }
    return "";
    // let name = cookieName + "=";
    // let decodedCookie = decodeURIComponent(document.cookie);
    // let cookieArray = decodedCookie.split(';');
    // for(let i = 0; i < cookieArray.length; i++) {
    //     let cookie = cookieArray[i];
    //     while (cookie.charAt(0) == ' ') {
    //         cookie = cookie.substring(1);
    //     }
    //     if (cookie.indexOf(name) == 0) {
    //         return cookie.substring(name.length, cookie.length);
    //     }
    // }
    // return "";
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function updateQuotaLevel(level){
    var quota = document.getElementById('quota-level');
    quota.classList.remove('alert');
    quota.classList.remove('warn');
    if (level <= 10){
        quota.classList.add('alert');
    }else if (level <= 30){
        quota.classList.add('warn');
    }
    quota.setAttribute('style','height:'+level+'%');
    var battery = document.getElementById('battery');
    if (battery) {
        battery.setAttribute('title',level+'%')
    }
}

function displayVideos(parentElement){
// 获取所有子元素
    var childElements = parentElement.querySelectorAll("*");

// 遍历子元素
    for (var i = 0; i < childElements.length; i++) {

        let element = childElements[i];
        displayYoutubeVideos(element);
        displayBilibiliVideos(element);
    }
}

function displayYoutubeVideos(element){
    // 检查元素的内容是否包含指定的URL
    let url = '';
    if (element.href && element.href.includes("https://www.youtube.com/embed/")){
        url = element.href;
    }else if (element.src && element.src.includes("https://www.youtube.com/embed/")) {
        url = element.src;
    }
    if (url != ''){
        const regex = /embed\/([^"]+)/;
        const match = url.match(regex);
        const videoId = match[1];
        if (videoId){
            let iframe = document.createElement("div");
            iframe.innerHTML = '<iframe width="800" height="600" src="https://www.youtube.com/embed/' + videoId + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe>';
            element.parentNode.appendChild(iframe);
            element.parentNode.removeChild(element);
        }
    }
}

function displayBilibiliVideos(element){
    // 检查元素的内容是否包含指定的URL
    let url = '';
    let bilibiliVideoPrefix = "https://player.bilibili.com/player.html?bvid=";
    if (element.href && element.href.includes(bilibiliVideoPrefix)){
        url = element.href;
    }else if (element.src && element.src.includes(bilibiliVideoPrefix)) {
        url = element.src;
    }
    if (url != ''){
        const videoId = url.replaceAll(bilibiliVideoPrefix,"");
        if (videoId){
            let iframe = document.createElement("div");
            iframe.innerHTML = '<iframe src="https://player.bilibili.com/player.html?bvid='+videoId+'" height="600" width="800"></iframe>';
            element.parentNode.appendChild(iframe);
            element.parentNode.removeChild(element);
        }
    }
}