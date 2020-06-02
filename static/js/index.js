const draggables = document.querySelectorAll(".song-box");
const lists = document.querySelectorAll(".dropzone");
var modal = document.querySelector("#modal")

var action = {
  id: "",
  from: "",
  to: ""
}

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
      var url = "/update?action=move&id=" + songId + "&from=" + prevList + "&to=" + listName
      var request = new XMLHttpRequest();
      request.open("GET", url);
      request.setRequestHeader("X-CSRF-Token", document.querySelector("#csrf_token").getAttribute("value"))
      request.send()
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

var close = document.querySelector("#close-modal")
close.onclick = function() {
  modal.style.display = "none";
}

function applyTag() {
  var tag = document.querySelector("#tag-edit").value

  console.log(tag)
}

function editEntry(title, artist) {
  var songHead = document.querySelector("#modal-title")
  var artistHead = document.querySelector("#modal-artist")
  songHead.innerHTML = title;
  artistHead.innerHTML = artist;
  modal.style.display = "block";

  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}

function deleteSong(song, from) {
  document.querySelector("#_" + song).remove()
  var url = "/update?action=delete&id=" + song + "&from=" + from
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.send()
}
