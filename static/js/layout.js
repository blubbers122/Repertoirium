var aysModal = document.querySelector("#are-you-sure-modal")

// forces retrieval of page from server
window.addEventListener( "pageshow", function ( event ) {
  var historyTraversal = event.persisted ||
                         ( typeof window.performance != "undefined" &&
                              window.performance.navigation.type === 2 );
  if ( historyTraversal ) {
    // Handle page restore.
    window.location.reload();
  }
});

function delete_flash(element){
  element.parentElement.remove()
}

function loadSpinner(element, inputs) {
  var leave = inputs.some(input => {
    return input.value < 1
  })
  if (leave) return;
  var spinner = document.createElement("DIV")
  spinner.classList.add("spinner-border", "spinner-border-sm")
  element.appendChild(spinner)
}

function closeOpenMenus() {
  console.log("closing")
  document.querySelectorAll(".open-menu").forEach(menu => {
    console.log(menu)
    menu.style.display = "none"
    menu.classList.remove("open-menu")
  })
}

function accountDropdown(dropdown) {
  closeOpenMenus()
  if (dropdown.style.display == "none" || !dropdown.style.display) {
    dropdown.style.display = "block"
    dropdown.classList.add("open-menu")
  }
  else {
    dropdown.style.display = "none"
    dropdown.classList.remove("open-menu")
  }

  window.onclick = function(event) {
    //if user selects item from dropdown
    if (event.target.matches(".dropdown-item") || !event.target.matches(".dropdown-toggle")) {
      dropdown.style.display = "none"
      dropdown.classList.remove("open-menu")
    }
    //handles user clicking off of dropdown while it is open
    else if (!event.target.matches(".dropdown-toggle")){
      dropdown.style.display = "none"
      dropdown.classList.remove("open-menu")
    }
  }
}

function areYouSureModal(action) {
  var aysTitle = document.querySelector("#ays-modal-title")
  var aysDescription = document.querySelector("#ays-modal-description")
  var continueButton = document.querySelector("#continue")
  var goBackButton = document.querySelector("#go-back")

  if (action == "delete") {
    aysTitle.innerHTML = "Delete your Account?"
    aysDescription.innerHTML = "Are you sure? Deleting your account is irreversable."
  }
  else {
    aysTitle.innerHTML = "Reset your Account?"
    aysDescription.innerHTML = "Are you sure? Reseting your account returns your account to the way it was when you first registered."
  }

  aysModal.style.display = "block";

  window.onclick = function(event) {
    if (event.target == modal) {
      aysModal.style.display = "none";
    }
  }

  continueButton.addEventListener("click", () => {
    var url = "/resetAccount"
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === 4) {
        location.reload()
      }
    }
    request.open("POST", url, true);
    request.setRequestHeader("X-CSRF-Token", document.querySelector("#csrf_token").getAttribute("value"))
    request.setRequestHeader("Content-Type", "application/json")
    request.send(JSON.stringify({"action": action}))
  })
  goBackButton.addEventListener("click", () => {
    aysModal.style.display = "none";
  })
}
