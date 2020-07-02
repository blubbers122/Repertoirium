const draggables = document.querySelectorAll(".song-box");
const lists = document.querySelectorAll(".dropzone");

const tags = document.querySelectorAll(".song-tag");

var modal = document.querySelector("#modal")
var modalId
var modalList

const tempoSettings = document.querySelector("#tempo-track-container")

var songData

class SongModal {
  constructor(title, artist, id, list, tempoData, tags) {
    this.title = title;
    this.artist = artist;
    this.id = id;
    this.list = list;
    this.tempoData= tempoData;
    this.tags = tags
  }



}

function loadTempoData() {
  var startingTempo = songData["tempo_data"]["tempo_logs"][0] ? songData["tempo_data"]["tempo_logs"][0][0] : ""
  var currentTempo = songData["tempo_data"]["current_tempo"]
  var desiredTempo = songData["tempo_data"]["desired_tempo"]

  // makes the chevron rightside up again
  document.querySelector("#tempo-history-chevron").classList.remove("fa-rotate-180")

  document.querySelector("#starting-tempo").innerHTML = startingTempo
  document.querySelector("#current-tempo").innerHTML = currentTempo
  document.querySelector("#desired-tempo").innerHTML = desiredTempo

  document.querySelector("#tempo-logs").hidden = true

  const progressBar = document.querySelector("#tempo-progress-bar")
  const tempoProgressFeedback = document.querySelector("#tempo-progress-feedback")
  const progressContainer = document.querySelector("#tempo-progress-container")
  const goalTempoContainer = document.querySelector("#update-desired-tempo-container")
  const currentTempoContainer = document.querySelector("#update-tempo-container")
  const startingTempoContainer = document.querySelector("#update-starting-tempo-container")
  const startingTempoIcon = document.querySelector("#start-tempo-icon")
  const tempoLogsContainer = document.querySelector("#tempo-logs-container")
  const tempoTrackContainer = document.querySelector("#tempo-track-container")
  const initialCurrentTempoContainer = document.querySelector("#initial-update-tempo-container")
  const initialGoalTempoContainer = document.querySelector("#initial-update-desired-tempo-container")

  // if user hasn't entered any tempos yet
  if (!startingTempo) {
    console.log(songData["tempo_data"]["tempo_logs"])
    console.log("no starting tempo")
    tempoLogsContainer.hidden = true
    progressContainer.hidden = false

    startingTempoIcon.hidden = false
    startingTempoContainer.hidden = false
    currentTempoContainer.parentElement.hidden = true
    progressBar.parentElement.hidden = true
    progressBar.parentElement.previousElementSibling.hidden = true
    goalTempoContainer.hidden = false
  }
  else {
    progressBar.parentElement.previousElementSibling.hidden = false
    currentTempoContainer.parentElement.hidden = false
    progressBar.parentElement.hidden = false
    startingTempoIcon.hidden = true
    startingTempoContainer.hidden = true
    tempoLogsContainer.hidden = false
    goalTempoContainer.hidden = true
    currentTempoContainer.hidden = true
    progressContainer.hidden = false
    if (parseInt(currentTempo) >= parseInt(desiredTempo)) {
      var tempoProgress = "100%"
      tempoProgressFeedback.hidden = false
    }
    else {
      var tempoProgress = (Math.floor((currentTempo - startingTempo) / (desiredTempo - startingTempo) * 100)).toString() + "%"
      tempoProgressFeedback.hidden = true
    }
  }
  progressBar.style.width = tempoProgress == "0%" ? "1%" : tempoProgress
  progressBar.innerHTML = tempoProgress == "0%" ? "" : tempoProgress

}

tags.forEach(tag => {
  setUpTagEvents(tag)
});

draggables.forEach(draggable => {
  var listName = draggable.parentElement.id
  var prevList;
  var deleteIcon = draggable.children[2]
  var scrollIcon = draggable.children[4]
  var editIcon = draggable.children[6]

  draggable.addEventListener("mouseover", () => {
    deleteIcon.hidden = false
    scrollIcon.hidden = false
    editIcon.hidden = false
  });

  draggable.addEventListener("mouseout", () => {
    deleteIcon.hidden = true
    scrollIcon.hidden = true
    editIcon.hidden = true
  })

  draggable.addEventListener("dragstart", () => {
    prevList = draggable.parentElement.id
    draggable.classList.add('dragging')
  });

  draggable.addEventListener("dragend", e => {
    listName = draggable.parentElement.id
    songId = draggable.id.slice(1)
    draggable.classList.remove("dragging")
    if (listName != prevList) {
      sendAjax("/update",
        "PUT",
        [["Content-Type", "application/json"], ["X-CSRF-Token", document.querySelector("#csrf_token").value]],
        {
          "action": "move",
          "list": prevList,
          "to": listName,
          "id": songId,
        })
    }
  });
})

lists.forEach(list => {
  list.addEventListener("dragover", e => {
    e.preventDefault()
    const afterElement = getDragAfterElement(list, e.clientY)
    const draggable = document.querySelector(".dragging")
    if (afterElement == null) {
      list.appendChild(draggable)
    }
    else {
      list.insertBefore(draggable, afterElement)
    }
  })
})

function getDragAfterElement(list, y) {
  const draggableElements = [...list.querySelectorAll(".song-box:not(.dragging)")]
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect()
    const offset = y - box.top - box.height / 2
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child }
    }
    else {
      return closest
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element
}

function searchForSheets(searchTerm) {
  window.open("https://www.google.com/search?q=" + searchTerm + " sheet music", "_blank")
}

function setUpTagEvents(tag) {
  // adds 'x' to delete tag when hovered over
  tag.addEventListener("mouseover", () => {
    tag.innerHTML += " &times;"
  })
  // removes above 'x'
  tag.addEventListener("mouseout", () => {
    tag.innerHTML = tag.innerHTML.slice(0, -2)
  })
  // deletes tag if clicked
  tag.addEventListener("click", (event) => {
    var id = event.target.parentElement.parentElement.id.slice(1)
    var list = event.target.parentElement.parentElement.parentElement.id
    var tagContent = tag.innerHTML.slice(0, -1)

    sendAjax("/update",
      "PUT",
      [["Content-Type", "application/json"], ["X-CSRF-Token", document.querySelector("#csrf_token").value]],
      {
        "action": "remove data",
        "list": list,
        "id": id,
        "key": "tags",
        "value": tagContent.slice(0, -1)
      })
    tag.remove()
  })
}

function applyTag(tagInput) {
  if (!tagInput.value) return;
  //tell server of new tag
  sendAjax("/update",
    "PUT",
    [["Content-Type", "application/json"], ["X-CSRF-Token", document.querySelector("#csrf_token").value]],
    {
      "action": "change data",
      "list": modalList,
      "id": modalId,
      "key": "tags",
      "value": tagInput.value
    })
  //add badge (tag) to page
  var badge = document.createElement("span")
  badge.innerHTML = tagInput.value
  badge.className = "song-tag hover-pointer badge badge-primary mr-1"

  tagInput.value = ""

  var tagContainer = document.querySelector("#_" + modalId).firstElementChild
  tagContainer.appendChild(badge)
  setUpTagEvents(badge)

  var modalBadge = badge.cloneNode()
  modalBadge.innerHTML = badge.innerHTML
  modalBadge.classList = "song-tag hover-pointer badge badge-primary ml-1"
  document.querySelector("#modal-title").appendChild(modalBadge)
}

function checkSend(e) {
  if (e.keyCode == 13) {
    //handles enter press on tag editor
    if (e.target.id == "tag-edit") {
      applyTag(e.target)
    }
    else {
      //for current tempo edit
      if (e.target.id == "tempo-update-field"){
        addTempo(e.target)
      }
      //for desired tempo edit
      else {
        addTempo(e.target)
      }
    }
    e.target.value = ""
  }
}

function checkValidTempo(tempo) {
  intTempo = parseInt(tempo)
  var startingTempo = songData["tempo_data"]["tempo_logs"][0] ? songData["tempo_data"]["tempo_logs"][0][0] : ""
  if (intTempo > 30 && intTempo < 400) {
    return startingTempo != "" ? (intTempo >= startingTempo ? true : false) : true
  }
  return false

}

function addTempo(tempoInput) {
  var newTempo = Math.round(tempoInput.value)
  tempoInput.value = ""
  if (!checkValidTempo(newTempo)) return;
  var tempoDataKey = tempoInput.id == "desired-tempo-update-field" ? "desired_tempo" : "current_tempo";
  editTempoData(tempoDataKey, newTempo)
  loadTempoData()
}

function editTempoData(key, value) {
  songData = JSON.parse(document.querySelector("#_" + modalId).dataset.songdata.replace(/'/g, '"'))
  songData["tempo_data"][key] = value
  var today = new Date();
  var month = today.getMonth() + 1
  var day = today.getDate()
  var date = (month < 10 ? "0" + month : month) + "/" + (day < 10 ? "0" + day : day) + "/" + today.getFullYear()
  if (key == "current_tempo") {
    console.log("hi")
    songData["tempo_data"]["tempo_logs"].push([parseInt(value), date])
  }
  //updates the html elements dataset attribute
  document.querySelector("#_" + modalId).dataset.songdata = JSON.stringify(songData).replace(/"/g, "'")
  sendAjax("/update",
    "PUT",
    [["Content-Type", "application/json"], ["X-CSRF-Token", document.querySelector("#csrf_token").value]],
    {
      "action": "update tempo data",
      "list": modalList,
      "id": modalId,
      "key": key,
      "value": value
    })
}

function openSongModal(title, artist, id, list) {

  var trackTempoCheckBox = document.querySelector("#track-tempo")

  //var songModal = new SongModal(title, artist)

  modalId = id
  modalList = list
  closeOpenMenus()

  var nextBadge = document.querySelector("#_" + modalId).firstElementChild.firstElementChild.nextElementSibling
  var songHead = document.querySelector("#modal-title")
  var artistHead = document.querySelector("#modal-artist")
  songHead.innerHTML = title;
  artistHead.innerHTML = artist;

  //retrieves tempo data from current song

  console.log(document.querySelector("#_" + modalId).dataset.songdata)
  songData = JSON.parse(document.querySelector("#_" + modalId).dataset.songdata.replace(/'/g, '"'))
  trackTempoCheckBox.checked = songData["tempo_data"]["track_tempo"]
  if (trackTempoCheckBox.checked) {
    tempoSettings.hidden = false
    loadTempoData()
  }
  else {
    tempoSettings.hidden = true
  }

  //loads badges to modal when opened
  while (nextBadge) {
    var modalBadge = nextBadge.cloneNode()
    modalBadge.classList.add("ml-1")
    modalBadge.innerHTML = nextBadge.innerHTML
    songHead.appendChild(modalBadge)
    nextBadge = nextBadge.nextElementSibling
  }
  modal.style.display = "block";
  modal.classList.add("open-menu")

  window.onclick = function(event) {
    if (event.target == modal || document.querySelector("nav").contains(event.target)) {
      modal.style.display = "none";
      modal.classList.remove("open-menu")
    }
  }
}

function resetTempoData() {
  songData = JSON.parse(document.querySelector("#_" + modalId).dataset.songdata.replace(/'/g, '"'))
  songData["tempo_data"] = {
            "track_tempo": 0,
            "current_tempo": "",
            "desired_tempo": "",
            "tempo_logs": []
        }
  document.querySelector("#_" + modalId).dataset.songdata = JSON.stringify(songData).replace(/"/g, "'")
  loadTempoData()
  sendAjax("/update",
    "PUT",
    [["Content-Type", "application/json"], ["X-CSRF-Token", document.querySelector("#csrf_token").value]],
    {
      "action": "change data",
      "list": modalList,
      "id": modalId,
      "key": "tempo_data",
      "value": {
                "track_tempo": 0,
                "current_tempo": "",
                "desired_tempo": "",
                "tempo_logs": []
            }
    })
}



function toggleInput(input) {
  console.log("toggle input")
  input.focus()
  if (input.hidden) {
    input.hidden = false
    input.children[0].focus()
  }
  else {
    input.hidden = true
  }
}

function toggleTempoHistory() {
  const chevron = document.querySelector("#tempo-history-chevron")
  const tempoLogs = document.querySelector("#tempo-logs")
  tempoLogs.innerHTML = ""
  if (tempoLogs.hidden) {
    tempoLogs.hidden = false
    chevron.classList.add("fa-rotate-180")
    var tempoLogData = songData["tempo_data"]["tempo_logs"]
    //loads each tempo log
    tempoLogData.forEach(entry => {
      var log = document.createElement("li")
      log.className = "m-0"
      log.innerHTML = entry[1] + " - " + entry[0] + " bpm"
      tempoLogs.appendChild(log)
    })
  }
  else {
    chevron.classList.remove("fa-rotate-180")
    tempoLogs.hidden = true
  }
}

function toggleTrackTempo(checkbox) {
  tempoSettings.hidden = !checkbox.checked
  var trackTempo = checkbox.checked ? 1 : 0;
  editTempoData("track_tempo", trackTempo)
  if (trackTempo) {
    loadTempoData()
  }
}

function deleteSong(song, from) {
  console.log(song)
  document.querySelector("#_" + song).remove()
  sendAjax("/update",
    "PUT",
    [["Content-Type", "application/json"], ["X-CSRF-Token", document.querySelector("#csrf_token").value]],
    {
      "action": "delete",
      "list": from,
      "id": song
    })
}

function setupSongBoxTools() {
  const trashIcons = document.querySelectorAll(".trash-icon")
  const sheetIcons = document.querySelectorAll(".sheet-icon")
  const editIcons = document.querySelectorAll(".edit-icon")
  console.log(trashIcons)

  trashIcons.forEach(trashIcon => {
    trashIcon.addEventListener("click", function() {deleteSong(trashIcon.parentElement.id.slice(1), trashIcon.parentElement.parentElement.id)})
  })
  sheetIcons.forEach(sheetIcon => {
    sheetIcon.addEventListener("click", function() {
      var data = JSON.parse(sheetIcon.parentElement.dataset.songdata.replace(/'/g, '"'))
      window.open("https://www.google.com/search?q=" + String.raw`${data["artist"]["name"]} - ${data["title"]}` + " sheet music", "_blank")
    })
  })
  editIcons.forEach(editIcon => {
    editIcon.addEventListener("click", function() {
      console.log(editIcon.parentElement.dataset.songdata)
      var data = JSON.parse(editIcon.parentElement.dataset.songdata.replace(/'/g, '"'))
      openSongModal(data["title"], data["artist"]["name"], editIcon.parentElement.id.slice(1), editIcon.parentElement.parentElement.id)})
  })
}
/*
function setupCarousel() {
  const carouselSlide = document.querySelector(".carousel-slide")
  const carouselImages = document.querySelectorAll(".carousel-slide img")

  const prevBtn = document.querySelector("#carousel-prev")
  const nextBtn = document.querySelector("#carousel-next")

  let counter = 1;
  const size = carouselImages[0].clientWidth

  carouselSlide.style.transform = "translateX(" + (-size * counter) + "px)";

  nextBtn.addEventListener("click", () => {
    if (counter >= carouselImages.length - 1) return
    console.log('next')
    carouselSlide.style.transition = "transform 0.4s ease-in-out";
    counter++;
    carouselSlide.style.transform = "translateX(" + (-size * counter) + "px)";
  })

  prevBtn.addEventListener("click", () => {
    if (counter <= 0) return
    console.log('prev')
    carouselSlide.style.transition = "transform 0.4s ease-in-out";
    counter--;
    carouselSlide.style.transform = "translateX(" + (-size * counter) + "px)";
  })

  carouselSlide.addEventListener("transitionend", () => {
    if (carouselImages[counter].id == "last-clone") {
      carouselSlide.style.transition = "none"
      counter = carouselImages.length - 2
      carouselSlide.style.transform = "translateX(" + (-size * counter) + "px)";
    }
    if (carouselImages[counter].id == "first-clone") {
      carouselSlide.style.transition = "none"
      counter = carouselImages.length - counter
      carouselSlide.style.transform = "translateX(" + (-size * counter) + "px)";
    }
  })
}

setupCarousel()
*/

function setupModalEvents() {
  var closeModalButton = document.querySelector("#close-song-modal")
  closeModalButton.addEventListener("click", function() {
    closeModal(closeModalButton.parentElement.parentElement)
  })

  var startTempoButton = document.querySelector("#starting-tempo-button")
  startTempoButton.addEventListener("click", function() {
    addTempo(startTempoButton.parentElement.previousElementSibling)
  })

  var currentTempoButton = document.querySelector("#current-tempo-button")
  currentTempoButton.addEventListener("click", function() {
    addTempo(currentTempoButton.parentElement.previousElementSibling)
  })

  var goalTempoButton = document.querySelector("#goal-tempo-button")
  goalTempoButton.addEventListener("click", function() {
    addTempo(currentTempoButton.parentElement.previousElementSibling)
  })

  var inputToggles = document.querySelectorAll(".input-toggle")
  inputToggles.forEach(inputToggle => {
    inputToggle.addEventListener("click", function() {
      toggleInput(inputToggle.nextElementSibling.nextElementSibling)
    })
  })

  var tempoHistoryToggle = document.querySelector("#tempo-history-toggle")
  tempoHistoryToggle.addEventListener("click", function() {
    toggleTempoHistory()
  })

  var tempoHistoryChev = document.querySelector("#tempo-history-chevron")
  tempoHistoryChev.addEventListener("click", function() {
    toggleTempoHistory()
  })

  var resetTempoDataButton = document.querySelector("#reset-tempo-data-option")
  resetTempoDataButton.addEventListener("click", function() {
    resetTempoData()
  })

  var addTagButton = document.querySelector("#add-tag-button")
  addTagButton.addEventListener("click", function() {
    applyTag(addTagButton.parentElement.previousElementSibling)
  })

  var trackTempoCheckBox = document.querySelector("#track-tempo")
  trackTempoCheckBox.addEventListener("change", function() {
    toggleTrackTempo(trackTempoCheckBox)
  })

  var tempoInputs = document.querySelectorAll(".new-tempo-input")
  tempoInputs.forEach(tempoInput => {
    tempoInput.addEventListener("keypress", function() {
      checkSend(event)
    })
  })
}


setupModalEvents()
setupSongBoxTools()
