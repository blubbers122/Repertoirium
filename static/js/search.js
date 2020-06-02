var isPlaying = false
var audio

function togglePlay(button, source) {
  console.log(button.classList)
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
