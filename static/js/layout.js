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
  element.parentE lement.remove()
}

function closeModal(currentModal) {
  currentModal.style.display = "none"
}

function loadSpinner(element, inputs) {
  if (inputs) {
    var leave = inputs.some(input => {
      return input.value < 1
    })
    if (leave) return;
  }

  var spinner = document.createElement("DIV")
  spinner.classList.add("spinner-border", "spinner-border-sm", "ml-1")
  element.appendChild(spinner)
}

function closeOpenMenus() {
  document.querySelectorAll(".open-menu").forEach(menu => {
    menu.style.display = "none"
    menu.classList.remove("open-menu")
  })
}

function accountDropdown(dropdown) {
  if (dropdown.style.display == "none" || !dropdown.style.display) {
    closeOpenMenus()
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
  }
}

function areYouSureModal(action) {
  closeOpenMenus()
  aysModal.classList.add("open-menu")
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
    if (event.target.matches("#are-you-sure-modal") || (document.querySelector("nav").contains(event.target) && !event.target.matches("#reset-account-option")) ) {
      aysModal.style.display = "none";
      aysModal.classList.remove("open-menu")
    }
  }

  continueButton.addEventListener("click", () => {
    sendAjax("/resetAccount",
      "POST",
      [["Content-Type", "application/json"], ["X-CSRF-Token", document.querySelector("#csrf_token").value]],
      {"action": action},
      reloadPage)
  })

  goBackButton.addEventListener("click", () => {
    aysModal.style.display = "none";
    aysModal.classList.remove("open-menu")
  })
}

function reloadPage() {
  location.reload()
}

function sendAjax(url, method, headers, content, callback) {
  var request = new XMLHttpRequest();
  request.open(method, url, true);
  headers.forEach((header) => {
    request.setRequestHeader(header[0], header[1])
  });
  request.send(JSON.stringify(content))
  if (callback) {
    request.onreadystatechange = function() {
      if (request.readyState === 4) {
        callback()
      }
    }
  }
}

function navEvents() {
  searchButton = document.querySelector("#search-for")
  searchButton.addEventListener("click", function() {
    loadSpinner(searchButton, [document.querySelector('#song-search-input')])
  })

  accountDropdownToggle = document.querySelector("#account-dropdown-toggle")
  accountDropdownToggle.addEventListener("click", function() {
    accountDropdown(accountDropdownToggle.nextElementSibling)
  })

  resetAccountButton = document.querySelector("#reset-account-option")
  resetAccountButton.addEventListener("click", function() {
    areYouSureModal("reset")
  })
  resetAccountButton.nextElementSibling.addEventListener("click", function() {
    areYouSureModal("delete")
  })

  closeAYS = document.querySelector("#close-ays")
  closeAYS.addEventListener("click", function() {
    closeModal(closeAYS.parentElement.parentElement)
  })

  continueAYS = document.querySelector("#continue")
  continueAYS.addEventListener("click", function() {
    loadSpinner(continueAYS)
  })
}

function singleFunctionEvent() {

}

navEvents()
