var md = window.markdownit();
const functionRegex = /function loading\.\.\. \[.*\]/;
function initialize(){
    // 获取按钮元素
    let sendButton = document.getElementById("sendButton");
    let pauseButton = document.getElementById("pauseButton");
    // 添加键盘事件监听器
    document.addEventListener("keydown", function(event) {
        // 检查按下的键是否是回车键（键码为13）
        if (event.keyCode === 13) {
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
            userInput.style.width = 'calc(100% - 360px)';
        }else{
            content.classList.remove('content-container');
            userInput.style.width = 'calc(100% - 150px)';
        }

    });
}

initialize();

function callBackendAPI() {
    /* 清空内容，禁用发送按钮 */
    let userMsg = document.getElementById('inputText').value;
    document.getElementById('inputText').value = "";
    if (userMsg.trim().length == 0){
        return;
    }
    /* 截取一部分message list*/
    let messageList = getSubMessageList(userMsg);

    const data = {
        messageList
    };

    //const url = 'http://43.159.130.162:8087/ai/chat_stream';
    const url = 'http://localhost:8087/ai/chat_stream';

    const headers = {
        'Content-Type': 'application/json'
    };

    let source = new SSE(url, {
        headers,
        payload: JSON.stringify(data)
    })

    const messageBox = document.getElementById("messageBox");
    let userMessage = document.createElement("div");
    userMessage.innerHTML = userMsg;
    userMessage.classList.add("message");
    userMessage.classList.add("shadow");
    userMessage.classList.add("user-message");
    messageBox.appendChild(userMessage);

    let botMessage = document.createElement("div");
    botMessage.innerHTML = "";
    botMessage.classList.add("message");
    botMessage.classList.add("shadow");
    botMessage.classList.add("bot-message");
    messageBox.appendChild(botMessage);

    scrollToBottom();

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

    source.addEventListener('message', function(e) {
        if (!paused) {
            let content = getDecode(e.data);
            if (functionRegex.test(botMessage.innerHTML)) {
                botMessage.innerHTML = '';
                assistantResponse = '';
            }
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
            let code = document.getElementById(randomId).innerHTML;
            navigator.clipboard.writeText(code)
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
        const child = children[i];
        // 检查子元素的class和role
        const className = child.className;

        if (className.includes('bot-message')) {
            messageList.push({
                role: 'assistant',
                content: child.innerText
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

function getDecode(str){
    return decodeURIComponent(atob(str).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}