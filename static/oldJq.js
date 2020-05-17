$(".sheet-link").click(function() {
  var searchTerm = $(this).attr("id")
  window.open("https://www.google.com/search?q=" + searchTerm + " sheet music", "_blank")
})
$(".sortable").sortable({
  connectWith: ".sortable",
  revert: true,
  placeholder: "list-highlight-placeholder"
});
$( "ul, li" ).disableSelection();

var changeTo
var song

$(".dropzone").droppable({
  greedy: true,
  activate: function(event, ui) {
    console.log(event.target)
    song = $(ui.draggable).attr("id")
    console.log(song)
  },
  over: function(event, ui) {
    changeTo = $(event.target).attr("id")
  },
  deactivate: function(event, ui) {
    console.log("moving " + song + " to " + changeTo)
  }
})

$(".trash-icon").click(function(){
  songToRemove = $(this).attr("id")
  list = $(this).parent().parent().parent().attr("class")
  console.log(songToRemove)
  $(this).parent().remove()
  $.ajax({
    url: "/process",
    type: "GET",
    data: {
      action: "delete",
      id: songToRemove,
      from: list
    },
    success:function(){
      console.log("ajax worked")
    }
  })
})
