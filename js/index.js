var md = window.markdownit();
function initialize(){
    // 获取按钮元素
    let sendButton = document.getElementById("sendButton");
    let pauseButton = document.getElementById("pauseButton");
    let textarea = document.getElementById("inputText");
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
        let content = document.getElementById('contentContainer');
        let userInput = document.getElementById("inputText");
        if (menu.classList.contains('active')){
            content.classList.add('content-container');
            userInput.style.width = 'calc(100% - 410px)';
        }else{
            content.classList.remove('content-container');
            userInput.style.width = 'calc(100% - 150px)';
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

    const url = 'http://43.159.130.162:8087/ai/chat_stream';
    //const url = 'http://localhost:8087/ai/chat_stream';

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
    let bubbleContainer = document.createElement("div");
    bubbleContainer.classList.add("user-bubble-container");
    let userIcon = document.createElement("img");
    userIcon.src = "img/robot.png";
    userIcon.classList.add("avatar-icon");
    let userMessage = document.createElement("div");
    userMessage.innerHTML = userMsg;
    userMessage.classList.add("message");
    userMessage.classList.add("shadow");
    userMessage.classList.add("user-message");
    bubbleContainer.appendChild(userMessage);
    bubbleContainer.appendChild(userIcon);
    messageBox.appendChild(bubbleContainer);
    /* 助手bubble */
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
            messageList.push({
                role: 'user',
                content: child.innerText
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