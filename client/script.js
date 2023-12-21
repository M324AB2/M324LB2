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

 
  document.addEventListener('DOMContentLoaded', (event) => {
      
      document.getElementById('sendButton').addEventListener('click', () => {
          sendMessage();
      });

      document.getElementById('messageInput').addEventListener('keydown', (event) => {
          handleTyping(event);
      });
  });

  function sendMessage() {
      const messageInput = document.getElementById('messageInput');
      const message = messageInput.value;
      socket.send(JSON.stringify({ type: 'message', message, user: myUser }));
      messageInput.value = '';
      hideTypingIndicator();
  }

  function handleTyping(event) {
      const typingIndicator = document.getElementById('typingIndicator');

      
      if (event.key.length === 1) {
          socket.send(JSON.stringify({ type: 'typing', user: myUser }));
          typingIndicator.style.display = 'block'; 
      }

     
      if (event.key === 'Enter') {
          sendMessage();
      }
  }

  function hideTypingIndicator() {
      const typingIndicator = document.getElementById('typingIndicator');
      typingIndicator.style.display = 'none'; 
  }
})();
