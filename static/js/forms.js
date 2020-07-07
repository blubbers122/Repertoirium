const userInput = document.querySelector("#user-input")
const passwordInput = document.querySelector("#pass-input")
const confirmPasswordInput = document.querySelector("#confirm-pass-input")

const usernameHelp = document.querySelector("#usernameHelp")
const passwordHelp = document.querySelector("#passwordHelp")
const confirmPasswordHelp = document.querySelector("#confirmPasswordHelp")

var userValid = false
var passwordValid = false
var passwordMatch = false

const submitButton = document.querySelector("#submit-btn")

function checkPasswordMatch() {
  if (confirmPasswordInput.value == "") {
    return
  }
  if (passwordInput.value != confirmPasswordInput.value) {
    confirmPasswordHelp.className = "text-danger"
    confirmPasswordHelp.innerHTML = "Passwords don't match"
    confirmPasswordInput.className = "form-field form-control col-6 offset-3 is-invalid"
    passwordMatch = false
  }
  else {
    confirmPasswordHelp.innerHTML = ""
    confirmPasswordInput.className = "form-field form-control col-6 offset-3 is-valid"
    passwordMatch = true
  }
  checkSubmittable()
}

var strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
var mediumRegex = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/
function checkPasswordStrength(input) {
  if (strongRegex.test(input)) {
    passwordHelp.className = "text-success"
    passwordHelp.innerHTML = "Strong!"
    passwordValid = true
  }
  else if (mediumRegex.test(input)) {
    passwordHelp.className = "text-warning"
    passwordHelp.innerHTML = "Medium strength. Try adding some symbols."
    passwordInput.className = "form-field form-control col-6 offset-3 is-valid"
    passwordValid = true
  }
  else {
    passwordHelp.className = "text-danger"
    passwordHelp.innerHTML = "Weak password"
    passwordInput.className = "form-field form-control col-6 offset-3 is-invalid"
    passwordValid = false
  }
  checkSubmittable()
}

let userRegex = /^[a-zA-Z0-9_\-]{5,30}$/
function checkUsername(input) {
  if (!userRegex.test(input)) {
    usernameHelp.className = "text-danger"
    usernameHelp.innerHTML = "Username must be 5-20 alphanumeric (also _ or -) characters"
    userInput.className = "form-field form-control col-6 offset-3 is-invalid"
    userValid = false
  }
  else {
    usernameHelp.className = "text-success"
    usernameHelp.innerHTML = ""
    userInput.className = "form-field form-control col-6 offset-3 is-valid"
    userValid = true
  }
  checkSubmittable()
}

function checkSubmittable() {
  if (userValid && passwordMatch && passwordValid) {
    submitButton.disabled = false
  }
  else {
    submitButton.disabled = true
  }
}

function togglePasswordReveal(element) {
  if (passwordInput.type == "text") {
    element.classList.add("text-secondary")
    passwordInput.type = "password"
    if (window.location.pathname == "/register") confirmPasswordInput.type = "password"
  }
  else {
    element.classList.remove("text-secondary")
    passwordInput.type = "text"
    if (window.location.pathname == "/register") confirmPasswordInput.type = "text"
  }

}

function loadListeners() {
  var revealToggle = document.querySelector("#password-reveal-toggle")
  revealToggle.addEventListener("click", function() {
    togglePasswordReveal(revealToggle)
  })
  submitButton.addEventListener("click", function() {
    loadSpinner(submitButton, [document.querySelector('#user-input'), document.querySelector('#pass-input')])
  })
  if (window.location.pathname == "/register") {
    userInput.addEventListener("input", function() {
      checkUsername(userInput.value)
    })
    passwordInput.addEventListener("input", function() {
      checkPasswordMatch()
      checkPasswordStrength(passwordInput.value)
    })
    confirmPasswordInput.addEventListener("input", function() {
      checkPasswordMatch()
    })
  }

}

loadListeners()
