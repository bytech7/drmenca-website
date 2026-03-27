const API_BASE = 'http://localhost:5000';

let token = null;
let currentUser = null;
let users = [];
let socket = null;

const statusEl = document.getElementById('status');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authCard = document.getElementById('auth-card');
const chatCard = document.getElementById('chat-card');
const userSelect = document.getElementById('user-select');
const messagesEl = document.getElementById('messages');
const messageForm = document.getElementById('message-form');

const showLoginBtn = document.getElementById('show-login');
const showRegisterBtn = document.getElementById('show-register');

const setStatus = (msg) => {
  statusEl.textContent = msg;
};

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

const renderMessage = (m) => {
  const item = document.createElement('div');
  item.className = 'message-item';

  item.innerHTML = `
    <div class="message-meta">
      ${m.sender_id?.email || m.sender_id} → ${m.receiver_id?.email || m.receiver_id}
      | detected: ${m.original_language} | target: ${m.target_language}
    </div>
    <div><strong>Original:</strong> ${m.original_text}</div>
    <div><strong>Translated:</strong> ${m.translated_text}</div>
  `;

  messagesEl.appendChild(item);
  messagesEl.scrollTop = messagesEl.scrollHeight;
};

const getConversationId = (a, b) => [a, b].sort().join('_');

showLoginBtn.addEventListener('click', () => {
  showLoginBtn.classList.add('active');
  showRegisterBtn.classList.remove('active');
  loginForm.classList.add('active');
  registerForm.classList.remove('active');
});

showRegisterBtn.addEventListener('click', () => {
  showRegisterBtn.classList.add('active');
  showLoginBtn.classList.remove('active');
  registerForm.classList.add('active');
  loginForm.classList.remove('active');
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const payload = {
      email: document.getElementById('register-email').value,
      password: document.getElementById('register-password').value,
      preferred_language: document.getElementById('register-language').value,
    };

    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to register');
    setStatus('Registration successful. Please login.');
  } catch (error) {
    setStatus(error.message);
  }
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const payload = {
      email: document.getElementById('login-email').value,
      password: document.getElementById('login-password').value,
    };

    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to login');

    token = data.token;
    currentUser = data.user;
    authCard.classList.add('hidden');
    chatCard.classList.remove('hidden');

    await loadUsers();
    connectSocket();
    setStatus(`Logged in as ${currentUser.email}`);
  } catch (error) {
    setStatus(error.message);
  }
});

const loadUsers = async () => {
  const res = await fetch(`${API_BASE}/users`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Unable to load users');

  users = data;
  userSelect.innerHTML = '';

  data.forEach((u) => {
    const option = document.createElement('option');
    option.value = u._id;
    option.textContent = `${u.email} (${u.preferred_language})`;
    userSelect.appendChild(option);
  });

  if (data[0]) {
    await loadConversation(data[0]._id);
  }
};

const loadConversation = async (otherUserId) => {
  messagesEl.innerHTML = '';
  const conversationId = getConversationId(currentUser.id, otherUserId);
  const res = await fetch(`${API_BASE}/messages/${conversationId}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load conversation');
  data.forEach(renderMessage);
};

userSelect.addEventListener('change', async () => {
  try {
    await loadConversation(userSelect.value);
  } catch (error) {
    setStatus(error.message);
  }
});

const connectSocket = () => {
  socket = io(API_BASE, { auth: { token } });

  socket.on('connect', () => {
    setStatus('Socket connected.');
  });

  socket.on('receive_message', (message) => {
    const selectedUser = userSelect.value;
    if (!selectedUser) return;

    const visibleConversation = getConversationId(currentUser.id, selectedUser);
    if (message.conversation_id === visibleConversation) {
      renderMessage(message);
    }
  });
};

messageForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const receiver_id = userSelect.value;
  const text = document.getElementById('message-input').value;
  if (!receiver_id || !text) return;

  if (socket?.connected) {
    socket.emit('send_message', { receiver_id, text }, (resp) => {
      if (!resp?.ok) setStatus(resp?.error || 'Message failed');
    });
  } else {
    // REST fallback if socket is not connected.
    try {
      const res = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ receiver_id, text }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');
      renderMessage(data);
    } catch (error) {
      setStatus(error.message);
    }
  }

  document.getElementById('message-input').value = '';
});
