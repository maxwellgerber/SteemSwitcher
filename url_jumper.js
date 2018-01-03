document.addEventListener('DOMContentLoaded', ()=>{
	var link = document.createElement('link'); 
	link.href = chrome.extension.getURL('url_jumper.css');
	link.type = 'text/css'; 
	link.rel = 'stylesheet'; 
	document.head.appendChild(link); 
});

function init() {
	chrome.runtime.sendMessage({
		msg: "request_generate_sister_urls",
		data: {
			host: window.location.host, 
			path: window.location.pathname,
			hash: window.location.hash
		}		
	}, function(response) {
		if ($('#contextmenu').length == 0) {
			$("body").append(`<div id="contextmenu"><ul></ul> </div>`)
		}
		$("#contextmenu ul").html("");
		if(response.sites.length == 0) {
			$("#contextmenu").addClass("hidden");
			$("#contextmenu ul").addClass("hidden");
		} else {
			$("#contextmenu").removeClass("hidden");
			$("#contextmenu ul").removeClass("hidden");
		}
		for(var i = 0; i < response.sites.length; i++){
			var it = (response.sites.length > 3) ? "user" : "";
			$("#contextmenu ul").append(`
				<li>
					View ${it} on <a href="${response.sites[i].url}">${response.sites[i].name}</a>
				</l>`)
		}
	});
}
setInterval(init, 1500);