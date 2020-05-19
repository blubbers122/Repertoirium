
const draggables = document.querySelectorAll(".song-box");
const lists = document.querySelectorAll(".dropzone");

rep = {
  want_to_learn: [],
  learning: [],
  learned: []
}

draggables.forEach(draggable => {
  draggable.addEventListener("dragstart", () => {
    draggable.classList.add('dragging')
  });
  draggable.addEventListener("dragend", () => {
    draggable.classList.remove("dragging")
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

function deleteSong(song, from) {
  url = "/process?action=delete&id=" + song + "&from=" + from
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.send()
  request.onload = function() {
    if (this.responseText == "done") {
      console.log("d")
      document.querySelector("#" + song).parentElement.remove()
    }
  }
}
