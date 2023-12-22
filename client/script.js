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
          break;
        case 'typing':
          typingUsers = message.users;
          updateTypingIndicator(typingUsers);
          break;
        default:
          break;
      }
    });
    socket.addEventListener('close', (event) => {
      console.log('WebSocket closed.');
    });
    socket.addEventListener('error', (event) => {
      console.error('WebSocket error:', event);
    });
  
    // Wait until the DOM is loaded before adding event listeners
    document.addEventListener('DOMContentLoaded', (event) => {
      // Send a message when the send button is clicked
      document.getElementById('sendButton').addEventListener('click', sendChatMessage);
      document.getElementById('messageInput').addEventListener('keydown', handleKeyDown);
      document.getElementById('messageInput').addEventListener('input', handleTyping);
    });
  
    function sendChatMessage() {
      const message = document.getElementById('messageInput').value;
      if (message) {
        socket.send(JSON.stringify({ type: 'message', message, user: myUser }));
        document.getElementById('messageInput').value = '';
        updateTypingIndicator([]);
      }
    }
  
    function handleKeyDown(event) {
      // Send message on Enter key
      if (event.key === 'Enter') {
        event.preventDefault();
        sendChatMessage();
      }
    }
  
    function handleTyping() {
      const message = document.getElementById('messageInput').value;
      if (message.length > 0) {
        socket.send(JSON.stringify({ type: 'typing', user: myUser }));
      }
    }
  
    function updateTypingIndicator(users) {
      const typingDiv = document.getElementById('typingIndicator');
      if (users.length > 0) {
        const names = users.map(u => u.name).join(', ');
        typingDiv.textContent = `${names} is typing...`;
      } else {
        typingDiv.textContent = '';
      }
    }
  
  })();
  