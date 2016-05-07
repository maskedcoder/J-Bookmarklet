/**
 *  J! Archive: the game
 *  Copyright (c) 2014, Andrew Myers. All rights reserved.
 */
(function (window, document) {
	var going = false,
		tg = function(element, stuck, string) {
		      if (document.getElementById(stuck).style.fontWeight != "bold")
			document.getElementById(element).innerHTML = string;
		},
		ts = function togglestick(stuck) {
		      document.getElementById(stuck).style.fontWeight != "bold" ? document.getElementById(stuck).style.fontWeight = "bold" : document.getElementById(stuck).style.fontWeight = "normal";
		},
		displayWindow,
		IN_PROCESS = "";
	
	var game = {
		teams: [
		],
		rounds: ['jeopardy_round', 'double_jeopardy_round', 'final_jeopardy_round'],
		round: 'jeopardy_round',
		round_index: 0,
		isRoundOver: function () {
			return document.querySelector("#"+this.round+" .clue:not(.finished)") == null;
		},
		nextRound: function () {
			this.round_index += 1;
			this.round = this.rounds[this.round_index];
		},
		start: function () {
			this.round_index = 0;
			this.round = this.rounds[0];
		}
	};
	
	var display = {
		win: undefined,
		created: function () {
			return this.win !== undefined;
		},
		showClueList: function (id) {
			var doc = this.win.document;
			if (doc.body.querySelector("#temp")) doc.body.removeChild(doc.body.querySelector("#temp"));
			var els = document.querySelectorAll("#"+id+" .category_name"),
				i,
				iRange = els.length + 1,
				headString = "<tr>",
				string = "", j = 1, jRange = (iRange > 2) ? 6 : 2,
				m = 1, // multiplier to make double jeopardy worth more
				st = ""; // Adds something to ids when in double jeopardy
			if (id == "double_jeopardy_round") {
				m = 2;
				st = "D";
			}
			for ( ;j < jRange;j++ ) {
				string += "<tr>";
				for (i = 1;i < iRange;i++ ) {
					string += "<td class=\"clue\" id=\"clue_"+st+"J_"+i+"_"+j+"\"><div class=\"clue_value\">$"+(j*200*m)+"</div></td>";
				}
				string += "</tr>";
			}
			for (i = 1;i < iRange;i++ ) {
				headString += "<th>"+els.item(i-1).innerHTML+"</th>";
			}
			headString += "</tr>";
			doc.body.querySelector("#table").innerHTML = "<table>"+headString+string+"</table>"
		},
		updateTable: function (id) {
			this.stopShowingClue();
			var doc = this.win.document;
			doc.querySelector("#"+id).innerHTML = "";
		},
		showClue: function (element) {
			var doc = this.win.document;
			var el = doc.querySelector("#clue .clueText");
			var text = element.dataset['clue'];
			element.querySelector(".clue_text").innerHTML = element.dataset["answer"];
			el.innerHTML = text;
			panel_text.innerHTML = text;
			panel_text.classList.remove("hidden");
			cluepanel.classList.remove("hidepanel");
			doc.querySelector("#clue").classList.remove("hidden");
			doc.querySelector("#table").classList.add("hidden");
		},
		stopShowingClue: function () {
			var doc = this.win.document;
			cluepanel.classList.add("hidepanel");
			panel_text.classList.add("hidden");
			doc.querySelector("#clue").classList.add("hidden");
			doc.querySelector("#table").classList.remove("hidden");
		},
		create: function () {
			var loc = window.location.pathname,
				index = loc.search(/\/[^\/]+$/),
				relativeURL = loc.substring(index),
				d = window.open(loc);
			if (d) {
				d.stop();
				d.document.body.innerHTML = "<section id=\"temp\">"+
						"<h2>Howdy</h2>"+
						"<p>Please drag this window around and size it to fit the screen.</p>"+
					"</section>"+
					"<section id=\"table\"></section>"+
					"<section id=\"clue\" class=\"hidden\"><div class=\"clueText\"></div></section>";
				d.document.head.innerHTML += "<style>"+
					"body {"+
							"font-family: sans-serif;"+
							"background: #00003a;"+
						"}"+
					".clue, th {"+
							"vertical-align: middle;"+
							"background-color: #0000AF;"+
							"border-width: 2px;"+
							"border-style: outset;"+
							"border-bottom-color: #000088;"+
							"border-left-color: #0000EE;"+
							"border-right-color: #000099;"+
							"border-top-color: #0000FF;"+
							"width: 152px;"+
							"color: white;"+
							"text-align: center;"+
							"padding: 1px;"+
						"}"+
					"th {"+
							"font-weight: bold;"+
							"height: 5%;"+
						"}"+
					"a:link, a:visited {"+
							"color: #E5A561;"+
							"text-decoration: none;"+
						"}"+
					"a:hover {"+
							"color: #FDF7D5;"+
							"text-decoration: underline;"+
						"}"+
					".clue {"+
							"height: 90px;"+
							"font-size: 12px;"+
							"display: table;"+
						"}"+
					".clue_value {"+
							"display: block;"+
							"vertical-align: middle;"+
							"text-align: center;"+
							"overflow: hidden;"+
							"color: #ffd700;"+
							"font-size: 5em;"+
						"}"+
					"#table table {"+
							"height: 100%;"+
							"width: 100%;"+
						"}"+
					"#clue {"+
							"height: 100%;"+
							"width: 100%;"+
							"background: #0000af;"+
							"color: white;"+
							"display: table;"+
						"}"+
					".clueText {"+
							"vertical-align: middle;"+
							"text-align: center;"+
							"font-size: 4em;"+
							"display: table-cell;"+
							"padding: 10%;"+
						"}"+
					".hidden {"+
							"display: none !important;"+
						"}"+
					"</style>";
				this.win = d;
			} else {
				var el = document.querySelector("#contestants h2");
				el.innerHTML = "Unblock pop-ups and try again, please."
			}
		}
	};
	
	var initialize = function () {
		if (!display.created()) {
			//displayWindow = createDisplayWindow();
			game.start();
			display.create();
			going = true;
			window.toggle = function () {};
			window.togglestick = function () {};
			eraseClues();
			//displayClueList(displayWindow.document, 'final_jeopardy_round');
			display.showClueList('jeopardy_round');
		} else {
			going = false;
			document.body.classList.remove("reset");
			window.toggle = tg;
			window.togglestick = ts;
		}
	};
	var snatchAnswer = function (el, stuck, string) {
		if (el) {
			var elem = document.querySelector("#"+el);
			var clue = elem.parentNode.parentNode.parentNode.parentNode;
			clue.dataset["answer"] = string;
		}
	};
	var eraseClues = function () {
		//document.body.classList.add("reset");
		var clues = document.querySelectorAll(".clue, .final_round"),
			number = clues.length,
			i = 0, clue;
		// rewrite the function the click handlers use
		window.toggle = snatchAnswer;
		for ( ;i < number;i++ ) {
			clue = clues[i];
			var header = clue.querySelector("div");
			
			// remove an uneeded <br>
			if (clue.querySelector(".clue_text br")) {
				var newEl = document.createElement("SPAN");
				newEl.innerHTML = " ";
				clue.querySelector(".clue_text").replaceChild(newEl, clue.querySelector(".clue_text br"));
			}
			
			if (header) {
				clue.dataset["clue"] = clue.querySelector(".clue_text").innerHTML;
				header.onmouseover();
				var value = header.querySelector(".clue_value, .clue_value_daily_double");
				if (value) {
					clue.dataset["value"] = value.innerHTML.replace(",","").match(/\$(\d+)/)[1];
				}
			} else {
				continue;
			}
			clue.addEventListener("click", function (e) {
				/*var clue_text = this.querySelector(".clue_text")
				if (clue_text.style.opacity != "1") {
					clue_text.style.opacity = "1";
					showClue(this);
				}*/
				var id = this.querySelector(".clue_text").id;
				if (IN_PROCESS && IN_PROCESS != id) return;
				
				if (this.classList.length == 1) {
					this.classList.add("active");
					IN_PROCESS = id;
					display.showClue(this);
				} else if (this.classList.contains("finished") && e.ctrlKey == true) {
					display.showClue(this);
				} else {
					display.updateTable(id);
					this.classList.remove("active");
					this.classList.add("finished");
					IN_PROCESS = "";
					if (game.isRoundOver()) {
						game.nextRound();
						display.showClueList(game.round);
					}
				}
			});
			if (clue.querySelector("#clue_FJ")) {
				clue.dataset["answer"] = clue.querySelector(".clue").dataset["answer"];
			}
			if (clue.querySelector(".clue_value_daily_double")) {
				var dd = clue.querySelector(".clue_value_daily_double");
				var txt = dd.innerHTML;
				dd.innerHTML = txt.slice(4, txt.length);
				var ct = clue.querySelector(".clue_text"),
					text = ct.innerHTML;
				ct.innerHTML = "<b>Daily Double" + "</b><br><br>" + text;
				clue.dataset["clue"] = text;
				dd.classList.remove("clue_value_daily_double");
				dd.classList.add("clue_value");
				
				// Find the correct value for the node
				var els = clue.parentNode.querySelectorAll(".clue_value");
				var least = 10000;
				Function.prototype.call.apply(Array.prototype.map, [els, function (el) {
					var value = +el.innerHTML.substring(1);
					if (value < least) {
						least = value;
					}
				}]);
				dd.innerHTML = "$"+least;
			}
		}
		window.toggle = function () {};
	};
	var getClueValue = function () {
		if (cluepanel.style.display == "none") {
			return false;
		} else {
			return +cluepanel.dataset["value"];
		}
	};
	var onUpPressed = function (e) {
		var team = this.dataset["team"],
			value = getClueValue();
		if (value) {
			var scoreEl = document.getElementById(team + "_score");
			scoreEl.innerHTML = value + (+scoreEl.innerHTML);
		}
	};
	var onDownPressed = function (e) {
		var team = this.dataset["team"],
			value = getClueValue();
		if (value) {
			console.log(value);
			var scoreEl = document.getElementById(team + "_score");
			scoreEl.innerHTML = +scoreEl.innerHTML - value;
		}
	};
	var sheet = document.createElement("style");
	sheet.innerHTML = "body.reset .clue_text {" +
		"opacity: 0;" +
		"display: inline-block;" +
		"overflow: hidden;" +
		"text-overflow: ellipsis;" +
		"height: 90px ;" +
	"}" +
	"body {" +
		"padding-top: 3em;" +
		"height: initial;" +
	"}" +
	".clue:hover {" +
	    "background: #4545ce;" +
	"}" +
	".clue.active {" +
		"background: #af4500;" +
	"}" +
	".clue.finished {" +
		"background: #af0000;" +
	"}" +
	"header {" +
		"box-sizing: border-box;" +
		"position: fixed;" +
		"width: 100%;" +
		"height: 3em;" +
		"top: 0;" +
		"left: 0;" +
		"padding: 2px;" +
		"background: blue;" +
		"z-index: 100;" +
		"border-bottom: 2px #008 solid;" +
	"}" +
	".team {" +
		"margin-left: 2em;" +
		"font-size: 1.6em;" +
	"}" +
	"button.up, button.down {" +
		"position: relative;" +
		"border:none;" +
		"background: transparent;" +
		"cursor: pointer;" +
	"}" +
	"button.up:active, button.down:active {" +
		"-webkit-transform: translateY(2px);" +
		"transform: translateY(2px);" +
	"}" +
	"button.up:after {" +
		"content: \"\";" +
		"width: 3px;" +
		"height: 6px;" +
		"border: solid #fff;" +
		"border-width: 0 2px 2px 0;" +
		"position: absolute;" +
		"-webkit-transform: rotate(45deg);" +
		"left: 7px;" +
		"top: 40%;" +
		"margin-top: -8px;" +
		"display: inline-block;" +
	"}" +
	"button.up:before {" +
		"content: \"\";" +
		"height: 0;" +
		"width: 0;" +
		"border: solid 9px #0d0;" +
		"border-radius: 9px;" +
		"position: absolute;" +
		"left: 0px;" +
		"top: -7px;" +
		"margin-top: -4px;" +
		"display: inline-block;" +
	"}" +
	"button.down:after {" +
		"content: \"x\";" +
		"font-family: arial;" +
		"font-weight: bold;" +
		"font-size: 12px;" +
		"color: white;" +
		"width: 3px;" +
		"height: 6px;" +
		"position: absolute;" +
		"left: 5px;" +
		"top: -2px;" +
		"margin-top: -8px;" +
		"display: inline-block;" +
	"}" +
	"button.down:before {" +
		"content: \"\";" +
		"height: 0;" +
		"width: 0;" +
		"border: solid 9px #d00;" +
		"border-radius: 9px;" +
		"position: absolute;" +
		"left: 0px;" +
		"top: -7px;" +
		"margin-top: -4px;" +
		"display: inline-block;" +
	"}" +
	"#cluepanel.hidepanel {" +
		"height: 0;" +
	"}" +
	"#cluepanel {" +
		"position: fixed;" +
		"display: table;" +
		"background: #007F00;" +
		"border-top: 3px solid #70FF70;" +
		"left: 0;" +
		"width: 100%;" +
		"bottom: 0;" +
		"height: 30%;" +
		"color: white;" +
		"font-size: 1.4em;" +
		"padding: 5px 10%;" +
		"-webkit-box-sizing: border-box;" +
		"transition: all 0.2s;" +
	"}" +
	".panel_text {" +
		"display: table-cell;" +
		"vertical-align: middle;" +
		"text-align: center;" +
	"}" +
	".panel_text.hidden {" +
		"display: none;" +
	"}";
	document.head.appendChild(sheet);
	var header = document.createElement("header");
	header.innerHTML = "<button id=\"startup\">toggle</button>" +
		"<span class=\"team\">Team 1:" +
			"$<span id=\"team1_score\">0</span> " +
			"<button class=\"up\" data-team=\"team1\"></button> " +
			"<button class=\"down\" data-team=\"team1\"></button> " +
		"</span>" +
		"<span class=\"team\">Team 2:" +
			"$<span id=\"team2_score\">0</span> " +
			"<button class=\"up\" data-team=\"team2\"></button> " +
			"<button class=\"down\" data-team=\"team2\"></button> " +
		"</span>" +
		"<span class=\"team\">Team 3:" +
			"$<span id=\"team3_score\">0</span> " +
			"<button class=\"up\" data-team=\"team3\"></button> " +
			"<button class=\"down\" data-team=\"team3\"></button> " +
		"</span>";
	var cluepanel = document.createElement("section");
	cluepanel.id = "cluepanel";
	cluepanel.className = "hidepanel";
	cluepanel.innerHTML = "<div class=\"panel_text\"></div>";
	var panel_text = cluepanel.querySelector("div");
	document.body.appendChild(header);
	document.body.appendChild(cluepanel);
	
	cluepanel.addEventListener("click", function (e) {
		if (this.textContent.substring(12, 0) == "Daily Double") {
			this.innerHTML = "<div class=\"clueText\">" + this.dataset['clue'] +"</div>";
		} else if (this.querySelector(".clueText")) {
			this.innerHTML = "<div class=\"answerText\">" + this.dataset['answer'] + "</div>";
		} else {
			cluepanel.style.display = "none";
		}
	});
	
	var up_btns = header.querySelectorAll(".up"),
		down_btns = header.querySelectorAll(".down");
		i = 0,
		num_btns = up_btns.length;
	for ( ;i < num_btns; i++ ) {
		down_btns[i].addEventListener("click", onDownPressed);
		up_btns[i].addEventListener("click", onUpPressed);
	}
	
	document.querySelector("#startup").addEventListener("click", initialize);
})(window, document);
// TO DO:
// (DONE) Convert backslashes in long strings into "" + format
// (DONE) Answers appear in main screen while clue is displayed to users
// Deal with Daily Doubles for users!!!
// Way of dealing with accidental clicks (mostly done)
// Remove unnecessary CSS
// Final jeopardy will be different
// Remove unnecessary functions/clean up.
// Way to sense context while pressing buttons in order to update the scoreEl
// BUG: There may be a way to add style="display: none;" to the cluepanel by clicking a clue header
// http://pastetool.com/generators/bookmarklet/ is a good tool

// After that...

// Way to edit teams (names, number of teams)
// Way to edit scores
// Allow users to see the answer afterwards?
// Timer? Several timers?
