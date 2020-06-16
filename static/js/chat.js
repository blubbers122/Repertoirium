var socket = io.connect(location.protocol + "//" + document.domain + ":" + location.port)
const user = document.querySelector("#chat-user").value
var connected = false

socket.on("connect", () => {
  connected = true
})

socket.on("new message", data => {
  const messageBox = document.createElement("div")
  const userHeading = document.createElement("h4")
  userHeading.innerHTML = data.user
  const messageContents = document.createElement("p")
  messageContents.className = "pl-3 m-0"
  messageContents.innerHTML = data.message
  messageBox.className = "message rounded m-1 bg-dark p-1 text-white"
  messageBox.appendChild(userHeading)
  messageBox.appendChild(messageContents)
  document.querySelector("#chat-box").appendChild(messageBox)
})

function checkSend(e) {
  if (e.keyCode == 13) {
    sendMessage(e.target)
  }
}

function sendMessage(input) {
  if (!connected || !input.value) return;
  socket.emit("add chat", {"message": input.value, "user": user})
  input.value = ""
}
