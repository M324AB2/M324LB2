(async () => {
  const myUser = await generateRandomUser();
  let activeUsers = [];
  let typingUsers = [];

  const socket = new WebSocket(generateBackendUrl());
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
        updateTypingUsers(typingUsers);
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
  });

  socket.addEventListener('error', (event) => {
    console.error('WebSocket error:', event);
  });

  const updateActiveUsersList = (users) => {
    const usersList = document.getElementById('activeUsers');
    usersList.innerHTML = ''; // Leere die Liste zuerst
    users.forEach(user => {
      const userElement = document.createElement('li');
      userElement.textContent = user.name;
      usersList.appendChild(userElement);
    });
  };


  const updateTypingUsers = (users) => {
    const typingElement = document.getElementById('typingUsers');
    typingElement.textContent = users.length > 0 
      ? `${users.map(u => u.name).join(', ')} is/are typing...` 
      : '';
  };

  // Wait until the DOM is loaded before adding event listeners
  document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('change', (event) => {
      document.body.classList.toggle('dark-mode', event.target.checked);
    });

    document.getElementById('sendButton').addEventListener('click', () => {
      const message = document.getElementById('messageInput').value;
      socket.send(JSON.stringify({ type: 'message', message, user: myUser }));
      document.getElementById('messageInput').value = '';
    });

    document.addEventListener('keydown', (event) => {
      if (event.key.length === 1) {
        socket.send(JSON.stringify({ type: 'typing', user: myUser }));
      }
      if (event.key === 'Enter') {
        const message = document.getElementById('messageInput').value;
        socket.send(JSON.stringify({ type: 'message', message, user: myUser }));
        document.getElementById('messageInput').value = '';
      }
    });
  });
})();

