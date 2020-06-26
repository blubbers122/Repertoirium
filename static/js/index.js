const draggables = document.querySelectorAll(".song-box");
const lists = document.querySelectorAll(".dropzone");

const tags = document.querySelectorAll(".song-tag");

var modal = document.querySelector("#modal")
var modalId
var modalList

const tempoSettings = document.querySelector("#tempo-track-container")

var songData

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

function closeModal(currentModal) {
  currentModal.style.display = "none"
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
  badge.className = "song-tag badge badge-primary ml-1"

  tagInput.value = ""

  var tagContainer = document.querySelector("#_" + modalId).firstElementChild
  tagContainer.appendChild(badge)
  setUpTagEvents(badge)

  var modalBadge = badge.cloneNode()
  modalBadge.innerHTML = badge.innerHTML
  document.querySelector("#modal-title").appendChild(modalBadge)
}

function checkSend(e) {
  if (e.keyCode == 13) {
    //handles enter press on tag editor
    if (e.target.id == "tag-edit") {
      applyTag(e.target)
    }
    else {
      if (checkValidTempo(e.target.value)) {
        //for current tempo edit
        if (e.target.id == "tempo-update-field"){
          addNewTempo(e.target)
        }
        //for desired tempo edit
        else {
          newDesiredTempo(e.target)
        }
      }
      e.target.value = ""
    }
  }
}

function checkValidTempo(tempo) {
  intTempo = parseInt(tempo)
  console.log(intTempo)
  if (intTempo > 30 && intTempo < 400) {
    return true
  }
  return false

}

function newDesiredTempo(tempoInput) {
  //make sure the value is valid
  var newTempo = tempoInput.value
  tempoInput.value = ""
  editTempoData("desired_tempo", newTempo)
  loadTempoData()
}

function addNewTempo(tempoInput) {
  //make sure the value is valid
  var newTempo = tempoInput.value
  tempoInput.value = ""
  editTempoData("current_tempo", newTempo)
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

function editEntry(title, artist, id, list) {
  modalId = id
  modalList = list
  closeOpenMenus()

  var nextBadge = document.querySelector("#_" + modalId).firstElementChild.firstElementChild.nextElementSibling
  var songHead = document.querySelector("#modal-title")
  var artistHead = document.querySelector("#modal-artist")
  songHead.innerHTML = title;
  artistHead.innerHTML = artist;

  //retrieves tempo data from current song
  var trackTempoCheckBox = document.querySelector("#track-tempo")
  songData = JSON.parse(document.querySelector("#_" + modalId).dataset.songdata.replace(/'/g, '"'))
  trackTempoCheckBox.checked = songData["tempo_data"]["track_tempo"]
  if (trackTempoCheckBox.checked) {
    tempoSettings.hidden = false
    console.log("displaying tempo data")
    loadTempoData()
  }
  else {
    tempoSettings.hidden = true
  }

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
    console.log(event.target)
    if (event.target == modal) {
      modal.style.display = "none";
      modal.classList.remove("open-menu")
    }
  }
}

function loadTempoData() {
  console.log("loading tempo data")
  console.log(songData["tempo_data"]["tempo_logs"])
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
  const tempoLogsContainer = document.querySelector("#tempo-logs-container")
  const tempoTrackContainer = document.querySelector("#tempo-track-container")
  const initialCurrentTempoContainer = document.querySelector("#initial-update-tempo-container")
  const initialGoalTempoContainer = document.querySelector("#initial-update-desired-tempo-container")

  // if user hasn't entered any tempos yet
  if (currentTempo == 1 || desiredTempo == 1) {
    tempoLogsContainer.hidden = false
    progressContainer.hidden = false
    initialCurrentTempoContainer.hidden = true
    initialGoalTempoContainer.hidden = true
  }
  else {
    initialCurrentTempoContainer.hidden = true
    initialGoalTempoContainer.hidden = true
    console.log(tempoTrackContainer.children )
    tempoLogsContainer.hidden = false
    goalTempoContainer.hidden = true
    currentTempoContainer.hidden = true
    progressContainer.hidden = false
    if (parseInt(currentTempo) >= parseInt(desiredTempo)) {
      var tempoProgress = "100%"
      tempoProgressFeedback.hidden = false
    }
    else {
      console.log("tempo is below 100")
      var tempoProgress = (Math.floor((currentTempo - startingTempo) / (desiredTempo - startingTempo) * 100)).toString() + "%"
      tempoProgressFeedback.hidden = true
    }
  }
  progressBar.style.width = tempoProgress
  progressBar.innerHTML = tempoProgress

}

function toggleCurrentTempoInput() {
  const tempoInput = document.querySelector("#update-tempo-container")
  if (tempoInput.hidden) {
    tempoInput.hidden = false
  }
  else {
    tempoInput.hidden = true
  }

}

function toggleGoalTempoInput() {
  const tempoInput = document.querySelector("#update-desired-tempo-container")
  if (tempoInput.hidden) {
    tempoInput.hidden = false
  }
  else {
    tempoInput.hidden = true
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
