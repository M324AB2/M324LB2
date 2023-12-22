(async () => {

  const myUser = await generateRandomUser();
  let activeUsers = [];

  const socket = new WebSocket(generateBackendUrl());

  // WebSocket open event
  socket.addEventListener('open', () => {
    console.log('WebSocket connected!');
    socket.send(JSON.stringify({ type: 'newUser', user: myUser }));
  });

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    console.log('WebSocket message:', message);
    switch (message.type) {
      case 'message':
        const messageElement = generateMessage(message, myUser);
        document.getElementById('messages').appendChild(messageElement);
        setTimeout(() => {
          messageElement.classList.add('opacity-100');
        }, 100);
        break;
      case 'activeUsers':
        activeUsers = message.users;
        updateActiveUsersList(activeUsers);
        break;
      case 'typing':
        typingUsers = message.users;
        break;
      default:
        break;
    }
  });


  socket.addEventListener('close', () => {
    console.log('WebSocket closed.');
    const usersList = document.getElementById('activeUsers');
    const parentElement = usersList.parentNode;
    parentElement.removeChild(usersList);

  socket.addEventListener('error', (event) => {
    console.error('WebSocket error:', event);
  });


  // Update active users list
  const updateActiveUsersList = (users) => {
    const usersList = document.getElementById('activeUsers');
    usersList.innerHTML = '';
    users.forEach(user => {
      const userElement = document.createElement('li');
      userElement.textContent = user.name;
      usersList.appendChild(userElement);

    });
  };

  // Event listeners
  document.addEventListener('DOMContentLoaded', () => {
    // Dark Mode Toggle
    document.getElementById('themeToggle').addEventListener('change', (event) => {
      document.body.classList.toggle('dark-mode', event.target.checked);
    });

    // Send message button
    document.getElementById('sendButton').addEventListener('click', sendMessage);

    // Enter key to send message
    document.getElementById('messageInput').addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        sendMessage();
      }
    });
  });

  // Send message function
  const sendMessage = () => {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    if (message) {
      socket.send(JSON.stringify({ type: 'message', message, user: myUser }));
      messageInput.value = '';
    }
  };
})();

