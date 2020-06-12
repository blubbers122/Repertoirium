var socket = io.connect(location.protocol + "//" + document.domain + ":" + location.port)
const user = document.querySelector("#chat-user").value

socket.on("connect", () => {
  sendButton = document.querySelector("#send-chat")
  sendButton.onclick = () => {
    message = document.querySelector("#message-input").value
    socket.emit("add chat", {"message": message, "user": user})
  }
})

socket.on("new message", data => {
  console.log(data)
  var messageBox = document.createElement("div")
  messageBox.innerHTML = data.message + " - " + data.user
  document.querySelector("#chat-box").appendChild(messageBox)
})
