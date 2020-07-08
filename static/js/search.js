var isPlaying = false
var audio
var dropdowns = document.querySelectorAll(".dropdown-menu")

// called when a play/pause button is pressed
function togglePlay(button, source) {
  if (button.classList[1] == "fa-play") {
    x = document.querySelector(".fa-pause")

    // handles if you press another play button without pausing the previous
    if (x) {
      audio.pause()
      x.classList = "fas fa-play audio-control"
    }
    audio = document.createElement('audio')
    audio.src = source

    //resets button after audio finishes
    audio.addEventListener("ended", function() {
      button.classList = "fas fa-play audio-control"
    })
    audio.play()
    button.classList = "fas fa-pause audio-control"

  }
  else {
    audio.pause()
    button.classList = "fas fa-play audio-control"
  }
}

// toggles the add to repertoir dropdown
function toggleDropdown(dropdown) {
  // closes dropdown
  if (dropdown.style.display == "block") {
    dropdown.style.display = "none"
    dropdown.classList.remove("open-menu")
  }

  // opens
  else {
    dropdowns.forEach(drop => {
      if (drop.style.display == "block") {
        drop.style.display = "none"
        dropdown.classList.remove("open-menu")
      }
    })

    // make sure its the only open menu
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

        addToRep(event.target.dataset.list, dropdown.dataset.songdata)

      }

      //handles user clicking off of dropdown while it is open
      else if (!event.target.matches(".dropdown-toggle")){
        dropdown.style.display = "none"
        dropdown.classList.remove("open-menu")
      }
    }
  }
}

// adds the selected song to the user's repertoir in the appropriate list
function addToRep(list, data) {
  sendAjax("/update",
    "POST",
    [["Content-Type", "application/json"], ["X-CSRF-Token", document.querySelector("#csrf_token").value]],
    {
      "list": list,
      "data": data
    })
}

// sets up event listeners
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
}

loadListeners()
