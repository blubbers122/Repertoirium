var isPlaying = false
var audio
var dropdowns = document.querySelectorAll(".dropdown-menu")

function togglePlay(button, source) {
  if (button.classList[1] == "fa-play") {
    x = document.querySelector(".fa-pause")

    // handles if you press another play button without pausing the previous
    if (x) {
      audio.pause()
      buttonToPause(x)
    }
    audio = document.createElement('audio')
    audio.src = source

    //resets button after audio finishes
    audio.addEventListener("ended", function() {buttonToPause(button)})
    audio.play()
    button.classList.remove("fa-play");
    button.classList.add("fa-pause");

  }
  else {
    audio.pause()
    buttonToPause(button)
  }
}

function buttonToPause(button) {
  button.classList.remove("fa-pause");
  button.classList.add("fa-play");
}

function toggleDropdown(dropdown) {
  if (dropdown.style.display == "block") {
    dropdown.style.display = "none"
    dropdown.classList.remove("open-menu")
  }
  else {
    dropdowns.forEach(drop => {
      if (drop.style.display == "block") {
        drop.style.display = "none"
        dropdown.classList.remove("open-menu")
      }
    })
    closeOpenMenus()
    dropdown.style.display = "block"
    dropdown.classList.add("open-menu")
    window.onclick = function(event) {
      //if user selects item from dropdown
      if (event.target.matches(".dropdown-item")) {
        dropdown.style.display = "none"
        var button = dropdown.previousElementSibling
        button.remove()
        var messageElement = document.createElement("h5")
        messageElement.className = "text-dark mt-2 ml-2"
        messageElement.innerHTML = '<i class="fas fa-check"></i> in repertoir'
        dropdown.parentElement.insertBefore(messageElement, dropdown)
        dropdown.classList.remove("open-menu")
        dropdown.remove()
      }
      //handles user clicking off of dropdown while it is open
      else if (!event.target.matches(".dropdown-toggle")){
        dropdown.style.display = "none"
        dropdown.classList.remove("open-menu")
      }
    }
  }
}

function addToRep(list, element) {
  var data = element.parentElement.parentElement.nextElementSibling.value
  var url = "/update"
  var request = new XMLHttpRequest();
  request.open("POST", url, true);
  request.setRequestHeader("Content-Type", "application/json")
  request.setRequestHeader("X-CSRF-Token", document.querySelector("#csrf_token").value)
  request.send(JSON.stringify({
    "list": list,
    "data": data
  }))
}
