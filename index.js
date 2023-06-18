var md = window.markdownit();

function initialize(){
    // 获取按钮元素
    var button = document.getElementById("sendButton");

    // 添加键盘事件监听器
    document.addEventListener("keydown", function(event) {
        // 检查按下的键是否是回车键（键码为13）
        if (event.keyCode === 13) {
            // 执行按钮的点击事件
            button.click();
        }
    });
}

initialize();

function callBackendAPI() {
    /* 清空内容，禁用发送按钮 */
    // let sendButton = document.getElementById("sendButton");
    // sendButton.disabled = true;
    let userMsg = document.getElementById('inputText').value;
    document.getElementById('inputText').value = "";

    /* 截取一部分message list*/
    let messageList = getSubMessageList(userMsg);

    const data = {
        messageList,
        functionType: 'food'
    };

    const url = 'http://43.159.130.162:8087/ai/chat_stream';
    //const url = 'http://localhost:8087/ai/chat_stream';

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

    let isPaused = false;
    /* 给按钮绑定事件 */
    let sendButton = document.getElementById("sendButton");
    sendButton.disabled = true;
    let pauseButton = document.getElementById("pauseButton");
    pauseButton.addEventListener("click",function (){
        isPaused = true;
        sendButton.disabled = false;
    });


    source.addEventListener('message', function(e) {
        if (!isPaused) {
            let content = getDecode(e.data);
            if (content != "[DONE]") {
                assistantResponse += content;
                let convert = md.render(assistantResponse);
                botMessage.innerHTML = convert;
            }else{
                sendButton.disabled = false;
            }
            Prism.highlightAll();
        }
    });
    source.stream();


}

function clearMessageBox(){
    document.getElementById("messageBox").innerHTML = "";
    let sendButton = document.getElementById("sendButton");
    sendButton.disabled = false;
}

function getSubMessageList(userMsg){
    /* 上下文 */
    const messageBox = document.getElementById("messageBox");
    const children = messageBox.children;
    const startIndex = Math.max(children.length - 5, 0);
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