const draggables = document.querySelectorAll(".song-box");
const lists = document.querySelectorAll(".dropzone");

const tags = document.querySelectorAll(".song-tag");

var modal = document.querySelector("#modal")
var modalId
var modalList

var currentTempo = document.querySelector("#current-tempo")
var tempoRange = document.querySelector("#tempo-meter")

var action = {
  id: "",
  from: "",
  to: ""
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

    var url = "/update"
    var request = new XMLHttpRequest();
    request.open("PUT", url, true);
    request.setRequestHeader("Content-Type", "application/json")
    request.setRequestHeader("X-CSRF-Token", document.querySelector("#csrf_token").value)
    request.send(JSON.stringify({
      "action": "remove data",
      "list": list,
      "id": id,
      "key": "tags",
      "value": tagContent.slice(0, -1)
    }))
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
    action["id"] = songId
    action["from"] = prevList
    action["to"] = listName
    draggable.classList.remove("dragging")
    if (listName != prevList) {
      var url = "/update"
      var request = new XMLHttpRequest();
      request.open("PUT", url, true);
      request.setRequestHeader("Content-Type", "application/json")
      request.setRequestHeader("X-CSRF-Token", document.querySelector("#csrf_token").value)
      request.send(JSON.stringify({
        "action": "move",
        "list": prevList,
        "to": listName,
        "id": songId,
      }))
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
  var url = "/update"
  var request = new XMLHttpRequest();
  request.open("PUT", url, true);
  request.setRequestHeader("Content-Type", "application/json")
  request.setRequestHeader("X-CSRF-Token", document.querySelector("#csrf_token").value)
  request.send(JSON.stringify({
    "action": "change data",
    "list": modalList,
    "id": modalId,
    "key": "tags",
    "value": tagInput.value
  }))
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

function editEntry(title, artist, id, list) {
  modalId = id
  modalList = list
  closeOpenMenus()

  var nextBadge = document.querySelector("#_" + modalId).firstElementChild.firstElementChild.nextElementSibling
  var songHead = document.querySelector("#modal-title")
  var artistHead = document.querySelector("#modal-artist")
  songHead.innerHTML = title;
  artistHead.innerHTML = artist;
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

function toggleTrackTempo(checkbox) {
  console.log(checkbox.checked)
  var tempoSettings = document.querySelector("#tempo-track-container")

  if (checkbox.checked) {
    tempoSettings.hidden = false
  }
  else {
    tempoSettings.hidden = true
  }
}

function updateDesiredTempo(input) {
  tempoRange.max = input.value
}

function updateTempoMeter(range) {
  currentTempo.innerHTML = range.value
}

function deleteSong(song, from) {
  document.querySelector("#_" + song).remove()
  var url = "/update"
  var request = new XMLHttpRequest();
  request.open("PUT", url, true);
  request.setRequestHeader("Content-Type", "application/json")
  request.setRequestHeader("X-CSRF-Token", document.querySelector("#csrf_token").value)
  request.send(JSON.stringify({
    "action": "delete",
    "list": from,
    "id": song
  }))

}
