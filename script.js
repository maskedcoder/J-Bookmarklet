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
		blanks: [],
		round_index: -1,
		clue_number: 1,
		isRoundOver: function () {
			return document.querySelector("#"+this.round+" .clue:not(.finished)") == null;
		},
		isCategoryEmpty: function (category) {
			return document.querySelector("#"+this.round+" .clue:not(.finished):nth-child(6n + "+(category+1)+")") == null;
		},
		nextRound: function () {
			this.round_index += 1;
			this.clue_number = 1;
			this.round = this.rounds[this.round_index];
			if (this.round != "final_jeopardy_round") {
				createStickyHeader(this.round);
			} else {
				document.querySelector("#sticky-header").remove();
			}
		},
		start: function () {
			//this.round_index = 0;
			//this.round = this.rounds[0];
			this.nextRound();
		},
		addTeam: function () {
			var name = window.prompt("Enter a name:"),
				num = this.teams.push({
					name: name,
					score: 0
				}) - 1;
			this.teams[num].index = num;
			var el = document.createElement("SPAN");
			el.className = "team";
			el.innerHTML = name+":" +
					"$<span id=\""+num+"_score\" class=\"score\" data-team=\""+num+"\">0</span> " +
					"<button class=\"up\" data-team=\""+num+"\"></button> " +
					"<button class=\"down\" data-team=\""+num+"\"></button> ";
			el.querySelector(".up").addEventListener("click", onUpPressed);
			el.querySelector(".down").addEventListener("click", onDownPressed);
			el.querySelector(".score").addEventListener("dblclick", onScoreEdit);
			header.appendChild(el);
		}
	};
	
	var display = {
		win: undefined,
		created: function () {
			return this.win !== undefined;
		},
		showClueList: function (id) {
			var doc = this.win.document;
			
			if (id == "final_jeopardy_round") {
				var sourceEl = document.querySelector("#"+id+" .category_name"),
					el = doc.querySelector("#clue .clueText");
				el.innerHTML = sourceEl.innerHTML;
				doc.querySelector("#clue").classList.remove("hidden");
				doc.querySelector("#table").classList.add("hidden");
			}
			
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
			doc.body.querySelector("#table").innerHTML = "<table>"+headString+string+"</table>";
			
			// Get rid of non-existant clues
			for (i=0,iRange=game.blanks.length;i < iRange;i++) {
				if (doc.querySelector("#"+game.blanks[i])) this.updateTable(game.blanks[i]);
			}
		},
		updateTable: function (id) {
			var doc = this.win.document;
			if (id == "clue_FJ") {
				doc.querySelector(".clueText").innerHTML = "GAME OVER";
				return;
			} 
			this.stopShowingClue();
			doc.querySelector("#"+id).innerHTML = "";
		},
		showClue: function (element) {
			var doc = this.win.document;
			var el = doc.querySelector("#clue .clueText");
			var text = element.dataset['clue'];
			element.querySelector(".clue_text").innerHTML = element.dataset["answer"];
			el.innerHTML = text;
			panel_text.innerHTML = text;
			cluepanel.dataset["value"] = element.dataset["value"];
			panel_text.classList.remove("hidden");
			cluepanel.classList.remove("hidepanel");
			el.classList.remove("daily_double");
			doc.querySelector("#clue").classList.remove("hidden");
			doc.querySelector("#table").classList.add("hidden");
		},
		showDailyDouble: function () {
			var doc = this.win.document;
			var el = doc.querySelector("#clue .clueText");
			var text = "Daily Double";
			el.innerHTML = text;
			el.classList.add("daily_double");
			doc.querySelector("#clue").classList.remove("hidden");
			doc.querySelector("#table").classList.add("hidden");
		},
		showCategory: function (element) {
			var doc = this.win.document;
			var el = doc.querySelector("#clue .clueText");
			el.innerHTML = element.innerHTML;
			element.style.background = "red";
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
		stopShowingCategory: function () {
			var doc = this.win.document;
			doc.querySelector("#clue").classList.add("hidden");
			doc.querySelector("#table").classList.remove("hidden");
		},
		removeCategoryHead: function (category) {
			var doc = this.win.document;
			doc.querySelector("th:nth-child(6n + "+(category+1)+")").innerHTML = "";
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
				d.document.head.innerHTML += "<title>Jeopardy!</title><style>"+
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
							"font-size: 1.7em;" +
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
					".daily_double {"+
							"-webkit-animation: spinningIntro 1s;"+
							"animation: spinningIntro 1s;"+
						"}"+
					"@-webkit-keyframes spinningIntro {"+
							"0% { transform: rotate(0deg) scale(0.1); }"+
							"100% { transform: rotate(1440deg) scale(2.0); }"+
						"}"+
					"@keyframes spinningIntro {"+
							"0% { transform: rotate(0deg) scale(0.1); }"+
							"100% { transform: rotate(1440deg) scale(2.0); }"+
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
			game.start();
			display.create();
			going = true;
			window.toggle = function () {};
			window.togglestick = function () {};
			eraseClues();
			display.showClueList('jeopardy_round');
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
				if (!clue.querySelector("table")) {
					clue.classList.add("finished");
					
					// Figure out what the id would have been
					var rowEl = clue.parentNode,
						tbody = rowEl.parentNode,
						tdArray = [].slice.call(rowEl.children),
						rowIdx = tdArray.indexOf(clue)+1,
						rowArray = [].slice.call(tbody.children),
						columnIdx = rowArray.indexOf(rowEl), // the headings at the top mean we don't have to add 1
						round = clue.parentNode.parentNode.parentNode.parentNode.id,
						id = "clue_" + ((round=='jeopardy_round')?'J':'DJ') + "_" + rowIdx + "_" + columnIdx;
					game.blanks.push(id);
				}
				continue;
			}
			clue.addEventListener("click", function (e) {
				var id = this.querySelector(".clue_text").id;
				if (IN_PROCESS && IN_PROCESS != id) return;
				
				if (this.classList.length == 1) {
					this.classList.add("active");
					IN_PROCESS = id;
					if (this.dataset["value"] == "dd") {
						display.showDailyDouble();
						var s = "";
						for (var i = 0,length = game.teams.length;i < length;i++ ) {
							s += game.teams[i].name+": "+game.teams[i].score+"\n";
						}
						this.dataset["value"] = window.prompt("How much will you bet?\n\nMaximum bets:\n"+s);
					}
					display.showClue(this);
					
					// Add a the clue number
					this.querySelector(".clue_order_number a").innerHTML = game.clue_number;
					game.clue_number += 1;
					
				} else if (this.classList.contains("finished") && e.ctrlKey == true) {
					display.showClue(this);
				} else {
					display.updateTable(id);
					this.classList.remove("active");
					this.classList.add("finished");
					IN_PROCESS = "";
					
					var nl = this.parentNode.querySelectorAll(".clue"),
						arr = [],
						category;
					for(var i = nl.length; i--; arr.unshift(nl[i]));
					category = arr.indexOf(this);
					if (game.isCategoryEmpty(category)) {
						display.removeCategoryHead(category);
					}
					
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
				dd.innerHTML = "Daily Double";
				clue.dataset["value"] = "dd";
			}
		}
		var clue_numbers = document.querySelectorAll(".clue_order_number a"),
			clue_number;
		i = 0;
		number = clue_numbers.length;
		
		for (;i < number;i++ ) {
			clue_number = clue_numbers[i];
			clue_number.innerHTML = "";
		}
		window.toggle = function () {};
	};
	var createStickyHeader = function (round) {
		var els = document.querySelectorAll("#"+round+" .category_name"),
			categories = els.length, // 6, always
			i = 0,
			header = document.querySelector("#sticky-header"),
			tr = document.createElement("tr"),
			td, tbody;
		var onclick = function (e) {
			var element = e.target;
			if (element.nodeName == "SPAN") {
				element = element.parentNode;
			}
			display.stopShowingCategory();
			if (element.style.background) {
				// We're done -- now, remove the styling
				var nodes = element.parentNode.children,
					i = 0,
					length = nodes.length;
				for (;i < length;i++ ) {
					nodes[i].style.background = "";
				}
				return;
			}
			display.showCategory(element);
		};
		if (!header) {
			header = document.createElement("table");
			header.id = "sticky-header";
			document.body.appendChild(header);
		}
		for (;i < categories;i++) {
			td = document.createElement("td");
			td.className = "category";
			td.innerHTML = "<span class=\"category_name\">" + els.item(i).innerHTML + "</span>";
			td.addEventListener("click", onclick);
			tr.appendChild(td);
		}
		header.innerHTML = "";
		tbody = document.createElement("tbody");
		tbody.appendChild(tr);
		header.appendChild(tbody);
	};
	var getClueValue = function () {
		if (cluepanel.style.display == "none") {
			return false;
		} else {
			return +cluepanel.dataset["value"];
		}
	};
	var onUpPressed = function (e) {
		var team_id = this.dataset["team"],
			value = getClueValue();
		if (value) {
			var team = game.teams[team_id];
			team.score += value;
			document.querySelector(".score[data-team=\""+team_id + "\"]").innerHTML = team.score;
			document.querySelector("#"+IN_PROCESS).click();
		}
	};
	var onDownPressed = function (e) {
		var team_id = this.dataset["team"],
			value = getClueValue();
		if (value) {
			var team = game.teams[team_id];
			team.score -= value;
			document.querySelector(".score[data-team=\""+team_id + "\"]").innerHTML = team.score;
		}
	};
	var onScoreEdit = function (e) {
		var currentValue = game.teams[e.target.dataset["team"]].score,
			newValue = window.prompt("Enter a new score value for "+name+", or leave blank to keep the current score ($"+currentValue+")");
			
		if (newValue !== null && newValue !== "" && Number(newValue).toString() !== "NaN") {
			// Not sure why the last check above has to be so weird
			newValue = Number(newValue);
			game.teams[e.target.dataset["team"]].score = newValue;
			e.target.innerHTML = newValue;
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
	"#sticky-header {" +
		"box-sizing: border-box;" +
		"position: fixed;" +
		"width: 100%;" +
		"max-width: 1200px;" +
		"min-width: 600px;" +
		"height: 3em;" +
		"top: 34px;" +
		"left: 0;" +
		"display: block;" +
		"text-align: center;" +
		"font-weight: bold;" +
		"font-size: 15px;" +
	"}" +
	"#sticky-header tbody {" +
		"display: block;" +
		"width: 986px;" +
		"margin: auto;" +
	"}" +
	"#sticky-header td {" +
		"padding: 3px;" +
		"margin: 0;" +
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
	header.innerHTML =  "<button id=\"startup\">Begin!</button>" +
		"<button id=\"add-team\">add team</button>";
	var cluepanel = document.createElement("section");
	cluepanel.id = "cluepanel";
	cluepanel.className = "hidepanel";
	cluepanel.innerHTML = "<div class=\"panel_text\"></div>";
	var panel_text = cluepanel.querySelector("div");
	document.body.appendChild(header);
	document.body.appendChild(cluepanel);
	
	document.querySelector("#startup").addEventListener("click", initialize);
	document.querySelector("#add-team").addEventListener("click", function () {
		game.addTeam();
	});
})(window, document);
// TO DO:
// (Kinda done) Make display screen more dynamically styled
// (Kinda done) Make daily double prompt allow host to see scores
// (Kinda done) Enable host to adjust scores
// Way to edit teams (names, number of teams)
// Way of sensing who chose a daily double + way to sense when one cannot be used.
//     This requires forcing all scoring to be done while the clue is displayed
//     If that happens, we need a way to adjust accidental scoring
// Way of dealing with accidental clicks (mostly done)
// Use "#" to deactivate any links in the clue lists that might get clicked accidentally
// Remove unnecessary CSS
// Remove unnecessary functions/clean up.
// Support browsers besides Chrome
// http://pastetool.com/generators/bookmarklet/ is a good tool

// After that...

// Allow users to see the answer afterwards?
// Timer? Several timers?

// (DONE) Add sticky headers for clue categories
// (DONE) Way to deal with non-existant clues
// (FIXED) BUG: There may be a way to add style="display: none;" to the cluepanel by clicking a clue header
// (DONE) Convert backslashes in long strings into "" + format
// (DONE) Answers appear in main screen while clue is displayed to users
// (DONE) Deal with Daily Doubles for users!!!
// (DONE) Final jeopardy will be different
// (DONE) Way to sense context while pressing buttons in order to update the scoreEl
// (FIXED) While adding category introductions, broke the sticky header styling
// (DONE) Way to edit scores
// (DONE) Introduction to clue categories at beginning of round