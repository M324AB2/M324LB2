(async () => {
  const myUser = await generateRandomUser();
  let activeUsers = [];
  let typingUsers = [];

  const socket = new WebSocket(generateBackendUrl());

  // WebSocket open event
  socket.addEventListener('open', () => {
    console.log('WebSocket connected!');
    socket.send(JSON.stringify({ type: 'newUser', user: myUser }));
  });

  // WebSocket message event
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
        updateTypingIndicator();
        break;
      default:
        break;
    }
  });

  // WebSocket close event
  socket.addEventListener('close', () => {
    console.log('WebSocket closed.');
    const usersList = document.getElementById('activeUsers');
    const parentElement = usersList.parentNode;
    parentElement.removeChild(usersList);
  });

  // WebSocket error event
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

  // Update typing indicator display
  const updateTypingIndicator = () => {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingUsers.length > 0) {
      const userNames = typingUsers.map(user => user.name).join(', ');
      typingIndicator.textContent = `${userNames} ${typingUsers.length > 1 ? 'are' : 'is'} typing...`;
    } else {
      typingIndicator.textContent = '';
    }
  };

  // Debounce function to limit the frequency of typing status messages
  const debounce = (func, delay) => {
    let debounceTimer;
    return function() {
      const context = this, args = arguments;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
  };

  // Function to send typing status
  const sendTypingStatus = debounce(() => {
    socket.send(JSON.stringify({ type: 'typing', user: myUser }));
  }, 500);

  // Event listeners
  document.addEventListener('DOMContentLoaded', () => {
    // Send message button
    document.getElementById('sendButton').addEventListener('click', sendMessage);

    // Enter key to send message and typing event listener
    document.getElementById('messageInput').addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        sendMessage();
      } else if (event.key.length === 1 || event.key === 'Backspace') {
        sendTypingStatus();
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
