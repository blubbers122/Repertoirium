const draggables = document.querySelectorAll(".song-box");
const lists = document.querySelectorAll(".dropzone");

const tags = document.querySelectorAll(".song-tag");

var modal = document.querySelector("#modal")
var modalId
var modalList

const tempoSettings = document.querySelector("#tempo-track-container")

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
    console.log("hi")
    applyTag(e.target)
  }
}

function newDesiredTempo(tempoInput) {
  //make sure the value is valid
  var newTempo = tempoInput.value
  var songData = JSON.parse(document.querySelector("#_" + modalId).dataset.songdata.replace(/'/g, '"'))
  tempoInput.value = ""
  editTempoData(songData, "desired_tempo", newTempo)
  loadTempoData(songData)
}

function addNewTempo(tempoInput) {
  //make sure the value is valid
  var newTempo = tempoInput.value
  var songData = JSON.parse(document.querySelector("#_" + modalId).dataset.songdata.replace(/'/g, '"'))
  tempoInput.value = ""
  editTempoData(songData, "current_tempo", newTempo)
  loadTempoData(songData)
}

function editTempoData(songData, key, value) {
  songData["tempo_data"][key] = value
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
  var songData = JSON.parse(document.querySelector("#_" + modalId).dataset.songdata.replace(/'/g, '"'))
  trackTempoCheckBox.checked = songData["tempo_data"]["track_tempo"]
  if (trackTempoCheckBox.checked) {
    tempoSettings.hidden = false
    console.log("displaying tempo data")
    loadTempoData(songData)
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

function loadTempoData(songData) {
  console.log("loading tempo data")
  var currentTempo = songData["tempo_data"]["current_tempo"]
  var desiredTempo = songData["tempo_data"]["desired_tempo"]

  document.querySelector("#current-tempo").innerHTML = currentTempo
  document.querySelector("#desired-tempo").innerHTML = desiredTempo

  const progressBar = document.querySelector("#tempo-progress-bar")
  const tempoProgressFeedback = document.querySelector("#tempo-progress-feedback")
  const progressContainer = document.querySelector("#tempo-progress-container")
  const goalTempoContainer = document.querySelector("#update-desired-tempo-container")

  if (currentTempo == 1 || desiredTempo == 1) {
    progressContainer.hidden = true
  }
  else {
    goalTempoContainer.hidden = true
    progressContainer.hidden = false
    if (parseInt(currentTempo) >= parseInt(desiredTempo)) {
      var tempoProgress = "100%"
      tempoProgressFeedback.hidden = false
    }
    else {
      console.log("tempo is below 100")
      var tempoProgress = (Math.floor(currentTempo / desiredTempo * 100)).toString() + "%"
      tempoProgressFeedback.hidden = true
    }
  }
  progressBar.style.width = tempoProgress
  progressBar.innerHTML = tempoProgress

}

function showGoalTempoInput(element) {
  /*
  var temp = document.querySelector("#desired-tempo");
  var newInput = document.createElement("input");
  newInput.innerHTML = temp.innerHTML;
  newInput.className = temp.className;
  newInput.id = temp.id;
  temp.parentNode.replaceChild(newInput, temp);
  */
  document.querySelector("#update-desired-tempo-container").hidden = false;
}

function toggleTrackTempo(checkbox) {
  tempoSettings.hidden = !checkbox.checked
  var trackTempo = checkbox.checked ? 1 : 0;
  var songData = JSON.parse(document.querySelector("#_" + modalId).dataset.songdata.replace(/'/g, '"'))
  editTempoData(songData, "track_tempo", trackTempo)
  if (trackTempo) {
    loadTempoData(songData)
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
