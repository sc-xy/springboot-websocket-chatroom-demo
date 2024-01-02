'use strict';

let usernameContainer = document.querySelector('#username-container');
let chatContainer = document.querySelector('#chat-container');
let usernameForm = document.querySelector('#username-form');
let chatItemList = document.querySelector('#chat-list-ul');
let chatRoomContainer = document.querySelector('#chat-container');
let publicChatForm = document.querySelector('#public-chat-send');
let publicMessageArea = document.querySelector('#public-content');

let username = null;
let stompClient = null;
let colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function connect(event) {
    event.preventDefault();
    username = document.querySelector('#username').value.trim();
    if (username) {
        usernameContainer.classList.add('hidden');
        chatContainer.classList.remove('hidden');
        stompClient = Stomp.over(new SockJS('/ws'));
        stompClient.connect({}, onConnected, onError);
    }
}


function onConnected() {
    stompClient.subscribe('/topic/public', onPublicMessageReceived);
    stompClient.subscribe('/user/' + username + '/private', onPrivateMessageReceived);
    stompClient.send("/app/chat.join",
        {},
        JSON.stringify({ sender: username, type: 'JOIN' })
    )
}


function onPublicMessageReceived(payload) {
    var message = JSON.parse(payload.body);
    var messageSender = message.sender;
    var messageContent = message.content;
    var messageType = message.type;
    var messageElement = null;
    if (messageType === 'JOIN' || messageType === 'LEAVE') {
        messageElement = createEventMessage(messageSender, messageType);
    } else if (messageType === 'PUBLIC_CHAT') {
        messageElement = createMessage(messageSender, messageContent);
    }
    publicMessageArea.appendChild(messageElement);
    publicMessageArea.scrollTop = publicMessageArea.scrollHeight;
}


function onPrivateMessageReceived(payload) {
    var message = JSON.parse(payload.body);
    var messageSender = message.sender;
    var MessageReceiver = message.receiver;
    var messageContent = message.content;
    var messageElement;
    var messageArea;
    if (messageSender === username) {
        // 如果是自己发的私聊，肯定已经创建好了，根据receiver找到对应的chat-room，添加信息即可
        messageElement = createMessage(messageSender, messageContent);
        messageArea = document.querySelector('#' + MessageReceiver + '-content');
    } else {
        // 如果是别人发的私聊，需要先判断有没有创建chat-room，如果没有，就创建一个
        var chatRooms = document.querySelectorAll('.chat-room');
        var flag = false;
        chatRooms.forEach(room => {
            if (room.getAttribute('id') === messageSender + '-chat') {
                flag = true;
            }
        });
        if (!flag) {
            addNewChat(messageSender);
        }
        messageElement = createMessage(messageSender, messageContent);
        messageArea = document.querySelector('#' + messageSender + '-content');
    }
    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}
function onError(error) {
    alert(error);
}


function bindEvent() {
    const chatItems = document.querySelectorAll('.chat-item');
    const chatRooms = document.querySelectorAll('.chat-room');
    chatItems.forEach(item => {
        item.addEventListener('click', () => {
            const chatId = item.getAttribute('data-chat');
            console.log(chatId);
            chatItems.forEach(item => {
                item.classList.remove('active');
            });
            chatRooms.forEach(room => {
                room.style.display = 'none';
            });
            item.classList.add('active');
            document.getElementById(chatId + '-chat').style.display = 'block';
        });
    });
}


function addNewChat(receiver) {
    addNewChatItem(receiver);
    addNewChatRoom(receiver);
}


function addNewChatItem(receiver) {
    var li = document.createElement('li');
    var chatItem = document.createElement('div');
    chatItem.classList.add('chat-item');
    chatItem.setAttribute('data-chat', receiver);
    var receiverSpan = document.createElement('span');
    receiverSpan.innerHTML = receiver;
    chatItem.appendChild(receiverSpan);
    li.appendChild(chatItem);
    chatItemList.appendChild(li);
}


function addNewChatRoom(receiver) {
    var chatRoom = document.createElement('div');
    chatRoom.classList.add('chat-room');
    chatRoom.setAttribute('id', receiver + '-chat');
    chatRoom.style.display = 'none';
    // 创建h1，显示聊天对象
    var h1 = document.createElement('h1');
    h1.innerHTML = receiver;
    chatRoom.appendChild(h1);
    // 创建chat-content，显示聊天内容
    var chatContent = document.createElement('div');
    chatContent.classList.add('chat-content');
    chatContent.setAttribute('id', receiver + '-content');
    chatRoom.appendChild(chatContent);
    // 创建form，发送消息
    var form = document.createElement('form');
    form.setAttribute('id', receiver + '-send');
    // 创建input-box，包含input和button
    var inputBox = document.createElement('div');
    inputBox.classList.add('input-box');
    // 创建input，隐藏接收者
    var input = document.createElement('input');
    input.setAttribute('type', 'hidden');
    input.setAttribute('value', receiver);
    input.setAttribute('id', receiver + '-receiver');
    // 创建input，输入消息
    var input2 = document.createElement('input');
    input2.setAttribute('type', 'text');
    input2.setAttribute('placeholder', '输入消息');
    input2.setAttribute('id', receiver + '-message');
    input2.setAttribute('autocomplete', 'off');
    input2.setAttribute('maxlength', '100');
    // 创建button，发送消息
    var button = document.createElement('button');
    button.setAttribute('type', 'submit');
    button.innerHTML = '发送';

    // 添加到inputBox
    inputBox.appendChild(input);
    inputBox.appendChild(input2);
    inputBox.appendChild(button);
    form.appendChild(inputBox);
    chatRoom.appendChild(form);

    chatRoomContainer.appendChild(chatRoom);
    // 新增的chat-room和chat-item都需要绑定事件
    bindEvent();
    // 添加发送事件
    document.querySelector('#' + receiver + '-send').addEventListener('submit', function (event) {
        event.preventDefault();
        // 获取表格数据
        var messageContent = document.querySelector('#' + receiver + '-message').value.trim();
        var receiverName = document.querySelector('#' + receiver + '-receiver').value.trim();
        if (messageContent && stompClient) {
            var chatMessage = {
                sender: username,
                content: messageContent,
                receiver: receiverName,
                type: 'PRIVATE_CHAT'
            };
            stompClient.send("/app/chat.sendPrivateMessage", {}, JSON.stringify(chatMessage));
            document.querySelector('#' + receiver + '-message').value = '';
        }
    }, true);
}


function sendPublicMessage(event) {
    event.preventDefault();
    // 获取表格数据
    var messageContent = document.querySelector('#public-chat-message').value.trim();
    var receiverId = document.querySelector('#public-receiver').value.trim();
    if (messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageContent,
            receiver: receiverId,
            type: 'PUBLIC_CHAT'
        };
        stompClient.send("/app/chat.sendPublicMessage", {}, JSON.stringify(chatMessage));
        document.querySelector('#public-chat-message').value = '';
    }
}


// 点击头像后进行私聊时，先判断有没有对应的chat-item，如果没有，就创建一个，然后跳转到对应的chat-room
function jumpItem(userToChat) {
    if (userToChat === username) {
        return;
    }
    var chatItems = document.querySelectorAll('.chat-item');
    var flag = false;
    chatItems.forEach(item => {
        if (item.getAttribute('data-chat') === userToChat) {
            flag = true;
        }
    });
    if (!flag) {
        addNewChat(userToChat);
    }
    chatItems.forEach(item => {
        item.classList.remove('active');
    });
    var chatRooms = document.querySelectorAll('.chat-room');
    chatRooms.forEach(room => {
        room.style.display = 'none';
    });
    document.querySelector('[data-chat="' + userToChat + '"]').classList.add('active');
    document.getElementById(userToChat + '-chat').style.display = 'block';
}


function createEventMessage(messageSender, messageType) {
    var messageElement = document.createElement('div');
    messageElement.classList.add('event-message');
    var textElement = document.createElement('span');
    var messageText = document.createTextNode("[" + messageSender + "] " + (messageType.toLowerCase() === 'join' ? 'joined!' : 'left!'));
    textElement.appendChild(messageText);
    messageElement.appendChild(textElement);
    return messageElement;
}


function createMessage(messageSender, messageContent) {
    var messageElement = document.createElement('div');
    messageElement.classList.add('message');
    var senderElement = document.createElement('span');
    senderElement.classList.add('sender');
    var senderAvatar = document.createElement('i');
    senderAvatar.style.backgroundColor = getAvatarColor(messageSender);
    // 只取前三个字符
    senderAvatar.innerHTML = messageSender.substring(0, 3);
    senderElement.appendChild(senderAvatar);
    // 添加点击事件
    senderElement.addEventListener('click', function () {
        jumpItem(messageSender);
    });
    messageElement.appendChild(senderElement);
    var textElement = document.createElement('span');
    var messageText = document.createTextNode(messageContent);
    textElement.appendChild(messageText);
    messageElement.appendChild(textElement);
    return messageElement;
}


function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
}

publicChatForm.addEventListener('submit', sendPublicMessage, true);
usernameForm.addEventListener('submit', connect, true);