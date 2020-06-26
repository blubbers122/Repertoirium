var socket = io.connect(location.protocol + "//" + document.domain + ":" + location.port)
const user = document.querySelector("#chat-user").value
var connected = false
const messageLimit = 80

const chatBox = document.querySelector("#chat-box")

function formatTimeStamp() {
  var sendTime = Date().slice(16,21)
  var sendHour = sendTime.slice(0, 2)
  var pm = sendHour > 11 && sendHour < 24 ? true : false

  if (sendHour > 12) {
    sendHour = sendHour % 12
  }
  return sendHour + sendTime.slice(2) + (pm ? " PM" : " AM");
}

function prepareSocket() {
  socket.on("connect", () => {
    connected = true
  })

  socket.on("new message", data => {

    var sendTime = formatTimeStamp()

    const messageBox = document.createElement("div")
    const userHeading = document.createElement("h6")
    const sendTimestamp = document.createElement("span")
    const messageContents = document.createElement("p")

    if (data.user == user) {
      messageBox.className = "message rounded m-1 bg-dark p-1 text-white"
    }
    else {
      messageBox.className = "message rounded m-1 bg-secondary p-1 text-white"
    }

    userHeading.innerHTML = data.user

    sendTimestamp.innerHTML = sendTime
    sendTimestamp.className = "float-right text-secondary"

    messageContents.className = "pl-3 m-0"
    messageContents.innerHTML = data.message

    //assembles and adds message to chat box
    messageBox.appendChild(sendTimestamp)
    messageBox.appendChild(userHeading)
    messageBox.appendChild(messageContents)

    chatBox.appendChild(messageBox)

    //deletes messages after reaching upper limit
    if (chatBox.childElementCount >= messageLimit) chatBox.firstElementChild.remove();

    //scrolls to bottom when you receive a new message
    chatBox.scrollTop = chatBox.scrollHeight;
  })
}

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

prepareSocket()
