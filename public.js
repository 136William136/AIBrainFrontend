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

// 将HTML内容存储到cookie中
function saveHTMLToCookie() {
    let messageBox = document.getElementById("messageBox")
    // 对HTML内容进行编码，确保特殊字符正确存储
    var encodedHTML = encodeURIComponent(messageBox.innerHTML);

    // 设置cookie，将编码后的HTML内容存储到cookie中
    document.cookie = "html=" + encodedHTML;
}

// 从cookie中获取存储的HTML内容
function getHTMLFromCookie() {
    // 获取所有的cookie
    var cookies = document.cookie.split(";");

    // 遍历cookie，找到存储HTML的cookie
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();

        // 判断cookie是否以"html="开头
        if (cookie.indexOf("html=") === 0) {
            // 获取编码后的HTML内容
            var encodedHTML = cookie.substring(5);

            // 解码HTML内容，并返回
            return decodeURIComponent(encodedHTML);
        }
    }

    // 如果没有找到存储HTML的cookie，则返回空字符串
    return "";
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function getIPAddress() {
    return new Promise(function(resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://api.ipify.org?format=json', true);
        xhr.onload = function() {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                resolve(response.ip);
            } else {
                reject('请求失败');
            }
        };
        xhr.onerror = function() {
            reject('请求失败');
        };
        xhr.send();
    });
}

function generateRandomId() {
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var id = '';
    for (var i = 0; i < 10; i++) {
        id += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return id;
}
