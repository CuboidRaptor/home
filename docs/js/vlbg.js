var regexThingy = /watch\?v\=(.+)/
var id = location.href.match(regexThingy)[1]

$(window).on("load", function() {
	if ($("#vlbgEmbed").length <= 0) {
		return;
	}
	$("#vlbgEmbed").attr("src", "https://www.youtube.com/embed/" + id);
});