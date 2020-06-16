
var aysModal = document.querySelector("#are-you-sure-modal")

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

function accountDropdown(dropdown) {
  console.log(dropdown)
  if (dropdown.style.display == "none" || !dropdown.style.display) {
    dropdown.style.display = "block"
  }
  else {
    dropdown.style.display = "none"
  }

  window.onclick = function(event) {
    //if user selects item from dropdown
    if (event.target.matches(".dropdown-item")) {
      dropdown.style.display = "none"
    }
    //handles user clicking off of dropdown while it is open
    else if (!event.target.matches(".dropdown-toggle")){
      dropdown.style.display = "none"
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
