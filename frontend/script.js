document.addEventListener('DOMContentLoaded', () => {
    const siteHeader   = document.getElementById('siteHeader');
    const heroSection  = document.getElementById('heroSection');
    const chatPage     = document.getElementById('chatPage');

    const heroInput    = document.getElementById('heroInput');
    const heroSendBtn  = document.getElementById('heroSendBtn');

    const chatMessages = document.getElementById('chatMessages');
    const chatEmpty     = document.getElementById('chatEmpty');
    const chatInput    = document.getElementById('chatInput');
    const chatSendBtn  = document.getElementById('chatSendBtn');
    const chatTitle    = document.getElementById('chatTitle');

    const sidebar        = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const openSidebarBtn  = document.getElementById('openSidebar');
    const closeSidebarBtn = document.getElementById('closeSidebar');

    const newChatBtn   = document.getElementById('newChatBtn');
    const searchInput  = document.getElementById('searchChats');
    const historyList  = document.getElementById('historyList');
    const historyEmpty = document.getElementById('historyEmpty');

    const clearChatsBtn = document.getElementById('clearChatsBtn');
    const settingsBtn   = document.getElementById('settingsBtn');


    let chats = [];        
    let activeChatId = null;

    /* ---------- helpers ---------- */
    const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

    function getActiveChat(){
        return chats.find(c => c.id === activeChatId);
    }

    function enterChatView(){
        siteHeader.style.display = 'none';
        heroSection.style.display = 'none';
        chatPage.style.display = 'flex';
    }

    function renderHistory(){
        const term = searchInput.value.trim().toLowerCase();
        const filtered = chats.filter(c => c.title.toLowerCase().includes(term));

        historyList.innerHTML = '';

        if (filtered.length === 0){
            historyEmpty.textContent = chats.length === 0 ? 'No conversations yet' : 'No matches found';
            historyList.appendChild(historyEmpty);
            return;
        }

        filtered.slice().reverse().forEach(chat => {
            const item = document.createElement('div');
            item.className = 'history-item' + (chat.id === activeChatId ? ' active' : '');
            item.dataset.id = chat.id;

            const title = document.createElement('span');
            title.className = 'history-title';
            title.textContent = chat.title;

            const del = document.createElement('button');
            del.className = 'delete-chat';
            del.title = 'Delete chat';
            del.textContent = '🗑';
            del.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteChat(chat.id);
            });

            item.appendChild(title);
            item.appendChild(del);
            item.addEventListener('click', () => switchChat(chat.id));

            historyList.appendChild(item);
        });
    }

    function renderMessages(){
        chatMessages.innerHTML = '';
        const chat = getActiveChat();

        if (!chat || chat.messages.length === 0){
            chatMessages.appendChild(chatEmpty);
            chatTitle.textContent = 'New Chat';
            return;
        }

        chatTitle.textContent = chat.title;

        chat.messages.forEach(msg => {
            const bubble = document.createElement('div');
            bubble.className = 'message ' + msg.role;
            bubble.textContent = msg.text;
            chatMessages.appendChild(bubble);
        });

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function createChat(firstMessage){
        const chat = {
            id: uid(),
            title: firstMessage.slice(0, 30) + (firstMessage.length > 30 ? '…' : ''),
            messages: []
        };
        chats.push(chat);
        activeChatId = chat.id;
        return chat;
    }

    function switchChat(id){
        activeChatId = id;
        renderHistory();
        renderMessages();
        closeMobileSidebar();
    }

    function deleteChat(id){
        chats = chats.filter(c => c.id !== id);
        if (activeChatId === id){
            activeChatId = chats.length ? chats[chats.length - 1].id : null;
        }
        renderHistory();
        renderMessages();
    }

    function startNewChat(){
        activeChatId = null;
        renderHistory();
        renderMessages();
        closeMobileSidebar();
        chatInput.focus();
    }

    function addMessage(chat, role, text){
        chat.messages.push({ role, text });
        renderMessages();
    }

 async function getAIReply(userText, chat) {

    addMessage(chat, "assistant", "Thinking...");

    try {

        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: userText
            })
        });

        const data = await response.json();

        chat.messages.pop();

        addMessage(chat, "assistant", data.reply);

    } catch (error) {

        chat.messages.pop();

        addMessage(
            chat,
            "assistant",
            "⚠️ Unable to connect to AI. Please try again."
        );

        console.error(error);
    }
}

    function handleSend(rawText){
        const text = rawText.trim();
        if (!text) return;

        enterChatView();

        let chat = getActiveChat();
        if (!chat) chat = createChat(text);

        addMessage(chat, 'user', text);
        renderHistory();

        getAIReply(text, chat);
    }
    function openMobileSidebar(){
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('show');
    }
    function closeMobileSidebar(){
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('show');
    }

    /* ---------- events ---------- */
    heroSendBtn.addEventListener('click', () => handleSend(heroInput.value));
    heroInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') handleSend(heroInput.value);
    });

    chatSendBtn.addEventListener('click', () => {
        handleSend(chatInput.value);
        chatInput.value = '';
    });
    chatInput.addEventListener('keydown', e => {
        if (e.key === 'Enter'){
            handleSend(chatInput.value);
            chatInput.value = '';
        }
    });

    newChatBtn.addEventListener('click', startNewChat);
    searchInput.addEventListener('input', renderHistory);

    openSidebarBtn.addEventListener('click', openMobileSidebar);
    closeSidebarBtn.addEventListener('click', closeMobileSidebar);
    sidebarOverlay.addEventListener('click', closeMobileSidebar);

    clearChatsBtn.addEventListener('click', () => {
        if (chats.length === 0) return;
        if (confirm('Clear all conversations? This cannot be undone.')){
            chats = [];
            activeChatId = null;
            renderHistory();
            renderMessages();
        }
    });

    settingsBtn.addEventListener('click', () => {
        // TODO: hook up your settings panel / account page here
        alert('Settings coming soon!');
    });

    /* ---------- init ---------- */
    renderHistory();
});