var isPlaying = false
var audio

function togglePlay(button, source) {
  isPlaying = !isPlaying
  if (isPlaying) {
    audio = document.createElement('audio')
    audio.src = source
    audio.play()
    button.classList.remove("fa-play");
    button.classList.add("fa-pause");
  }
  else {
    audio.pause()
    button.classList.remove("fa-pause");
    button.classList.add("fa-play");
  }
}
