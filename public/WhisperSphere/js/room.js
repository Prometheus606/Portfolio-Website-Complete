// Scroll messages down to latest message 
const messagesDiv = document.getElementById('messages-container');
messagesDiv.scrollTop = messagesDiv.scrollHeight;

// focus the input field
window.onload = function() {
    const inputField = document.getElementById('message');
    inputField.focus();
  };