var pass = document.querySelector("#pass-input")
var confirm = document.querySelector("#confirm-pass-input")

var userValid = false
var passwordValid = false
var passwordMatch = false

const submitButton = document.querySelector("#register-submit")

function checkPasswordMatch() {
  if (confirm.value == "") {
    return
  }
  if (pass.value != confirm.value) {
    document.querySelector("#confirmPasswordHelp").className = "text-danger"
    document.querySelector("#confirmPasswordHelp").innerHTML = "Passwords don't match"
    document.querySelector("#confirm-pass-input").className = "form-field form-control col-6 offset-3 is-invalid"
    passwordMatch = false
  }
  else {
    document.querySelector("#confirmPasswordHelp").innerHTML = ""
    document.querySelector("#confirm-pass-input").className = "form-field form-control col-6 offset-3 is-valid"
    passwordMatch = true
  }
  checkSubmittable()
}

var strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
var mediumRegex = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/
function checkPasswordStrength(input) {
  console.log(input)
  if (strongRegex.test(input)) {
    document.querySelector("#passwordHelp").className = "text-success"
    document.querySelector("#passwordHelp").innerHTML = "Strong!"
    passwordValid = true
  }
  else if (mediumRegex.test(input)) {
    document.querySelector("#passwordHelp").className = "text-warning"
    document.querySelector("#passwordHelp").innerHTML = "Medium strength. Try adding some symbols."
    document.querySelector("#pass-input").className = "form-field form-control col-6 offset-3 is-valid"
    passwordValid = true
  }
  else {
    document.querySelector("#passwordHelp").className = "text-danger"
    document.querySelector("#passwordHelp").innerHTML = "Weak password"
    document.querySelector("#pass-input").className = "form-field form-control col-6 offset-3 is-invalid"
    passwordValid = false
  }
  checkSubmittable()
}

let userRegex = /^[a-zA-Z0-9_\-]{5,30}$/
function checkUsername(input) {
  if (!userRegex.test(input)) {
    document.querySelector("#usernameHelp").className = "text-danger"
    document.querySelector("#usernameHelp").innerHTML = "Username must be 5-20 alphanumeric (also _ or -) characters"
    document.querySelector("#user-input").className = "form-field form-control col-6 offset-3 is-invalid"
    userValid = false
  }
  else {
    document.querySelector("#usernameHelp").className = "text-success"
    document.querySelector("#usernameHelp").innerHTML = ""
    document.querySelector("#user-input").className = "form-field form-control col-6 offset-3 is-valid"
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

  // maybe apply animation to eye element

  passwordInput = document.querySelector("#pass-input")
  confirmPasswordInput = document.querySelector("#confirm-pass-input")
  if (passwordInput.type == "text") {
    element.classList.add("text-secondary")
    passwordInput.type = "password"
    confirmPasswordInput.type = "password"
  }
  else {
    element.classList.remove("text-secondary")
    passwordInput.type = "text"
    confirmPasswordInput.type = "text"
  }

}
