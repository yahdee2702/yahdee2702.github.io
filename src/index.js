let expanded_view = document.getElementById("expanded-view");
let expanded_view_img = expanded_view.getElementsByTagName("img").item(0);
let expanded_view_p = expanded_view.getElementsByTagName("p").item(0);

function showExpandable(src, desc) {
	expanded_view_img.src = src;
	expanded_view_p.innerText = desc;
	expanded_view.classList.add("show");
}

function hideExpandable() {
	expanded_view.classList.remove("show");
	expanded_view_img.src = "";
	expanded_view_p.innerText = "";
}

function setupExpandable() {
	let expandables = document.querySelectorAll(
		"article > .corousels > figure.expandable"
	);
	for (const expandable of expandables) {
		let img = expandable.getElementsByTagName("img").item(0);
		let figcaption = expandable.getElementsByTagName("figcaption").item(0);
		let src = img.src ?? "";
		let desc = figcaption.innerText ?? "";

		expandable.addEventListener("click", () => {
			showExpandable(src, desc);
		});
	}
}

expanded_view.addEventListener("click", () => {
	hideExpandable();
});

setupExpandable();
