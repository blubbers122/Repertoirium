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
    button.classList = "fas fa-pause audio-control"

  }
  else {
    audio.pause()
    buttonToPause(button)
  }
}

function buttonToPause(button) {
  button.classList = "fas fa-play audio-control"
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
  sendAjax("/update",
    "POST",
    [["Content-Type", "application/json"], ["X-CSRF-Token", document.querySelector("#csrf_token").value]],
    {
      "list": list,
      "data": data
    })
}

function loadListeners() {
  var audioButtons = document.querySelectorAll(".audio-control")
  audioButtons.forEach(button => {
    button.addEventListener("click", function() {
      togglePlay(button, button.dataset.preview)
    })
  })
  var dropdowns = document.querySelectorAll(".add-to-rep-dropdown")
  dropdowns.forEach(dropdown => {
    dropdown.addEventListener("click", function() {
      toggleDropdown(dropdown.nextElementSibling)
    })
  })
  var dropItems = document.querySelectorAll(".rep-choice")
  dropItems.forEach(item => {
    item.addEventListener("click", function() {
      addToRep(item.dataset.list, item)
    })
  })
}

loadListeners()
