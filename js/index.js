var md = window.markdownit();

//const urlPrefix = "http://localhost:8087";
const urlPrefix = "http://43.159.130.162:8087";


function initialize(){
    // 获取按钮元素
    let sendButton = document.getElementById("sendButton");
    let pauseButton = document.getElementById("pauseButton");
    let textarea = document.getElementById("inputText");
    let messageBox = document.getElementById("messageBox");
    //加载历史内容
    messageBox.innerHTML = getHTMLFromCookie();

    // 添加键盘事件监听器
    document.addEventListener("keydown", function(event) {
        // 检查按下的键是否是回车键（键码为13）
        if (event.keyCode === 13 && !event.ctrlKey && !event.shiftKey) {
            // 执行按钮的点击事件
            if (pauseButton.style.display === "inline"){
                pauseButton.click();
            }else{
                sendButton.click();
            }
        }
    });
    const menuButton = document.getElementById('menuButton');
    const menu = document.querySelector('.menu');

    menuButton.addEventListener('click', function() {

        menu.classList.toggle('active'); //在.active和非.active类之间切换
        let header = document.getElementById('headerBar');
        let content = document.getElementById('contentContainer');
        let bottomMessage = document.getElementById("bottomMessage");
        if (menu.classList.contains('active')){
            header.classList.add('header-container-shrink');
            content.classList.add('content-container-shrink');
            bottomMessage.classList.add('bottom-message-shrink');
        }else{
            header.classList.remove('header-container-shrink');
            content.classList.remove('content-container-shrink');
            bottomMessage.classList.remove('bottom-message-shrink');
        }

    });

    textarea.addEventListener("keydown", function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            if (event.ctrlKey || event.shiftKey) {
                if (!textarea.value.endsWith("\n") && textarea.value.trim() != "") {
                    textarea.value += "\n";
                    textarea.scrollTop = textarea.scrollHeight;
                }
            }
        }
    });

    if (!isMobileDevice()){
        menuButton.click();
    }

    /* 用户身份 */
    let userInfo = document.getElementById("userInfo");
    getIPAddress()
        .then(function(ipAddress) {
            userInfo.innerText = ipAddress;
        })
        .catch(function(error) {
            userInfo.innerText = "";
        });

    /* 上传文件 */
    document.getElementById('file-upload').addEventListener('change', uploadFile);

}

initialize();

function callBackendAPI() {
    /* 清空内容，禁用发送按钮 */
    let userMsg = document.getElementById('inputText').value.trim();
    document.getElementById('inputText').value = "";
    document.getElementById('inputText').scrollTop = 0;
    if (userMsg.trim().length == 0){
        return;
    }
    /* 截取一部分message list*/
    let messageList = getSubMessageList(userMsg);
    const data = {
        messageList
    };
    const url = urlPrefix + '/ai/chat_stream';

    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin':'*'
    };

    let source = new SSE(url, {
        headers,
        payload: JSON.stringify(data)
    })

    const messageBox = document.getElementById("messageBox");
    /* 用户bubble */
    let userMessage = addUserMessage(userMsg);
    /* 助手bubble */
    let botMessage = addBotMessage();

    scrollToBottomSmooth();

    let assistantResponse = "";

    /* 给按钮绑定事件 */
    let sendButton = document.getElementById("sendButton");
    let pauseButton = document.getElementById("pauseButton");
    let paused = false;
    sendButton.style.display = "none";
    pauseButton.style.display = "inline";
    pauseButton.addEventListener('click',function (){
        paused = true;
        pauseStream();
    });

    let loading = getLoading();
    botMessage.append(loading);


    source.addEventListener('message', function(e) {
        if (!paused) {
            /* 判断当前是否是底部 */
            let toBottom = false;
            if (isScrollbarAtBottom()){
                toBottom = true;
            }
            let content = getDecode(e.data);
            if (content != "[DONE]") {
                assistantResponse += content;
                let convert = md.render(assistantResponse);
                botMessage.innerHTML = convert;
            }else{
                sendButton.style.display = "inline";
                pauseButton.style.display = "none";
                addCodeCopyButton();
                saveHTMLToCookie(messageBox.innerHTML);
                /* delete */
                let deleteIcon = document.createElement("img");
                deleteIcon.src = "img/delete.png";
                deleteIcon.classList.add("bot-delete");
                botMessage.parentNode.appendChild(deleteIcon);
                deleteIcon.addEventListener('click',function (event){
                    botMessage.parentNode.remove();
                });
            }
            Prism.highlightAll();
            /* 滚动到底部 */
            if (toBottom === true){
                scrollToBottomQuick();
            }
        }
    });
    source.stream();

}

function addUserMessage(userMsg){
    const messageBox = document.getElementById("messageBox");
    /* 用户bubble */
    let bubbleContainer = document.createElement("div");
    bubbleContainer.classList.add("user-bubble-container");
    let userIcon = document.createElement("img");
    userIcon.src = "img/robot.png";
    userIcon.classList.add("avatar-icon");
    let userMessage = document.createElement("div");
    userMessage.innerHTML = md.render(userMsg);
    userMessage.classList.add("message");
    userMessage.classList.add("shadow");
    userMessage.classList.add("user-message");
    /* delete */
    let deleteIcon = document.createElement("img");
    deleteIcon.src = "img/delete.png";
    deleteIcon.classList.add("user-delete");
    bubbleContainer.appendChild(deleteIcon);
    deleteIcon.addEventListener('click',function (event){
        bubbleContainer.remove();
    });

    bubbleContainer.appendChild(userMessage);
    bubbleContainer.appendChild(userIcon);
    messageBox.appendChild(bubbleContainer);
    return userMessage;
}

function addBotMessage(){
    const messageBox = document.getElementById("messageBox");
    let bubbleContainer2 = document.createElement("div");
    bubbleContainer2.classList.add("bot-bubble-container");
    let botIcon = document.createElement("img");
    botIcon.src = "img/chatbot.png";
    botIcon.classList.add("avatar-icon");
    let botMessage = document.createElement("div");
    botMessage.innerHTML = "";
    botMessage.classList.add("message");
    botMessage.classList.add("shadow");
    botMessage.classList.add("bot-message");
    bubbleContainer2.appendChild(botIcon);

    bubbleContainer2.appendChild(botMessage);
    messageBox.appendChild(bubbleContainer2);
    return botMessage;
}

function uploadFile(event){
    let file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', urlPrefix + '/upload/png');

    let userMsg = addUserMessage('');
// 监听上传进度
    xhr.upload.addEventListener('progress', function(event) {
        if (event.lengthComputable) {
            const percent = Math.floor((event.loaded / event.total) * 100);
            // 更新进度条显示
            userMsg.innerText = percent + '%';
        }
    });

    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                const result = JSON.parse(xhr.responseText);
                if (result.success === true) {
                    userMsg.innerHTML = md.render("![Alt](" + result.content + ")");
                } else {
                    userMsg.innerText = result.content;
                }
                // 处理上传成功后的逻辑
            } else {
                console.error('Error:', xhr.status);
            }
        }
    };

    xhr.send(formData);
    document.getElementById('file-upload').value = '';
    // let file = event.target.files[0];
    // const formData = new FormData();
    // formData.append('file', file);
    //
    // fetch(urlPrefix + '/upload/png', {
    //     method: 'POST',
    //     body: formData
    // }).then(response => response.json())
    //     .then(result => {
    //         if (result.success === true){
    //             addUserMessage("![Alt]("+result.content + ")");
    //         }else{
    //             alert(result.content);
    //         }
    //         // 在这里处理上传成功后的逻辑
    //     })
    //     .catch(error => {
    //         console.error('Error:', error);
    //     });
    // document.getElementById('file-upload').value = '';
}

function pauseStream(){
    let sendButton = document.getElementById("sendButton");
    let pauseButton = document.getElementById("pauseButton");
    sendButton.classList.add()
    sendButton.style.display = "inline";
    pauseButton.style.display = "none";
}

function clearMessageBox(){
    document.getElementById("messageBox").innerHTML = "";
    let sendButton = document.getElementById("sendButton");
    let pauseButton = document.getElementById("pauseButton");
    sendButton.style.display = "inline";
    pauseButton.style.display = "none";
}

function addCodeCopyButton(){
    // 获取所有的<pre><code>元素
    var codeElements = document.querySelectorAll('pre code');
    codeElements.forEach(function(element) {
        if (element.previousElementSibling && element.previousElementSibling.tagName == 'BUTTON'){
            return;
        }
        // 生成随机ID
        var randomId = 'code'+generateUUID();
        // 添加ID属性
        element.setAttribute('id', randomId);
        // 创建按钮元素
        var button = document.createElement('button');
        button.classList.add('fas');
        button.classList.add('fa-copy');
        button.classList.add('copy-button');
        button.addEventListener('click', function (){
            let code = document.getElementById(randomId);
            let codeContent = concatenateText(code);
            navigator.clipboard.writeText(codeContent)
                .then(() => {
                    button.classList.remove('fa-copy');
                    button.classList.add('fa-check-circle');
                    setTimeout(function () {
                        button.classList.remove('fa-check-circle');
                        button.classList.add('fa-copy');
                    },3000)
                })
                .catch((error) => {
                    console.error('复制失败：', error);
                });
        });
        // 在<pre>标签前插入按钮
        element.parentNode.insertBefore(button, element);
    });
}

function getSubMessageList(userMsg){
    /* 上下文 */
    const messageBox = document.getElementById("messageBox");
    const children = messageBox.children;
    const startIndex = Math.max(children.length - 7, 0);
    let messageList = [];
    for (let i = startIndex; i < children.length; i++) {
        const child = children[i].querySelector("div");
        // 检查子元素的class和role
        const className = child.className;

        if (className.includes('bot-message')) {
            let text = combineTextAndHTML(child);
            messageList.push({
                role: 'assistant',
                content: text
            });
        } else if (className.includes('user-message')) {
            let text = combineTextAndHTML(child);
            messageList.push({
                role: 'user',
                content: text
            });
        }
    }

    messageList.push({
        role:'user',
        content:userMsg
    })
    return messageList;
}

function concatenateText(element) {
    let text = '';

    // 遍历所有子元素
    for (let i = 0; i < element.childNodes.length; i++) {
        const child = element.childNodes[i];

        // 如果子元素是文本节点，则将其内容添加到text变量中
        if (child.nodeType === Node.TEXT_NODE) {
            text += child.textContent;
        }

        // 如果子元素是元素节点，则递归调用concatenateText函数
        if (child.nodeType === Node.ELEMENT_NODE) {
            text += concatenateText(child);
        }
    }

    return text;
}

function getDecode(str){
    return decodeURIComponent(atob(str).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

function combineTextAndHTML(element) {
    let result = '';

    // 遍历子元素
    for (let i = 0; i < element.childNodes.length; i++) {
        const child = element.childNodes[i];

        // 如果是文本节点，则将文本内容添加到结果中
        if (child.nodeType === Node.TEXT_NODE) {
            result += child.textContent;
        }

        // 如果是图片节点，则将完整的 HTML 添加到结果中
        if (child.nodeType === Node.ELEMENT_NODE && child.tagName === 'IMG') {
            result += imageUrlToMarkdown(child.src);
        }

        // 如果是元素节点，则递归调用函数处理子元素
        if (child.nodeType === Node.ELEMENT_NODE) {
            result += combineTextAndHTML(child);
        }
    }

    return result;
}

function imageUrlToMarkdown(url) {
    return `![Alt](${url})`;
}

function getLoading(){
    let loading = document.createElement("i");
    loading.classList.add("fas");
    loading.classList.add("fa-spinner");
    loading.classList.add("fa-spin");
    return loading;
}