function saveData() {
    NAME = document.getElementById('name').value;
    EMAIL = document.getElementById('email').value;
    MESSAGE = document.getElementById('message').value;
    localStorage["username"] = NAME;
    localStorage["email"] = EMAIL;
    localStorage["message"] = MESSAGE;
    localStorage.setItem('mail', `From: ${NAME}(${EMAIL})<br>To: exposedwealth@gmail.com<br>Subject: A mail from your contact form.<br>Message: ${MESSAGE}<br>`);
};