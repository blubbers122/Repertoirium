var pass = document.querySelector("#pass-input")
var confirm = document.querySelector("#confirm-pass-input")

var userValid = false
var passwordValid = false
var passwordMatch = false

function checkPasswordMatch() {

  console.log(pass.value, confirm.value)
  if (confirm.value == "") {
    return
  }
  if (pass.value != confirm.value) {
    document.querySelector("#confirmPasswordHelp").className = "text-danger"
    document.querySelector("#confirmPasswordHelp").innerHTML = "Passwords don't match"
    document.querySelector("#confirm-pass-input").className = "form-field form-control col-6 offset-3 is-invalid"

  }
  else {
    document.querySelector("#confirmPasswordHelp").innerHTML = ""
    document.querySelector("#confirm-pass-input").className = "form-field form-control col-6 offset-3 is-valid"

  }
}

var strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
var mediumRegex = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/
function checkPasswordStrength(input) {
  console.log(input)
  if (strongRegex.test(input)) {
    document.querySelector("#passwordHelp").className = "text-success"
    document.querySelector("#passwordHelp").innerHTML = "Strong!"
  }
  else if (mediumRegex.test(input)) {
    document.querySelector("#passwordHelp").className = "text-warning"
    document.querySelector("#passwordHelp").innerHTML = "Medium strength. You might want to add symbols and/or make it longer."
    document.querySelector("#pass-input").className = "form-field form-control col-6 offset-3 is-valid"
  }
  else {
    document.querySelector("#passwordHelp").className = "text-danger"
    document.querySelector("#passwordHelp").innerHTML = "Weak password"
    document.querySelector("#pass-input").className = "form-field form-control col-6 offset-3 is-invalid"
  }
}

let userRegex = /^[a-zA-Z0-9_\-]{5,30}$/
function checkUsername(input) {
  if (!userRegex.test(input)) {
    document.querySelector("#usernameHelp").className = "text-danger"
    document.querySelector("#usernameHelp").innerHTML = "Username must be 5-20 alphanumeric (also _ or -) characters"
    document.querySelector("#user-input").className = "form-field form-control col-6 offset-3 is-invalid"
  }
  else {
    document.querySelector("#usernameHelp").className = "text-success"
    document.querySelector("#usernameHelp").innerHTML = ""
    document.querySelector("#user-input").className = "form-field form-control col-6 offset-3 is-valid"
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
