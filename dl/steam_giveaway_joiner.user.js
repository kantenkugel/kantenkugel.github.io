// ==UserScript==
// @name SteamGiveaway Auto-Enter
// @author Kantenkugel
// @description Automatically enters giveaway when new giveaway was opened.
// @version 1.0.4
// @grant none
// @include http://www.steamgifts.com/giveaway/*
// @include https://www.steamgifts.com/giveaway/*
// @updateURL https://www.kantenkugel.com/m/dl/steam_giveaway_joiner.user.js
// @downloadURL https://www.kantenkugel.com/m/dl/steam_giveaway_joiner.user.js
// ==/UserScript==

//should tab be closed after successfull enter?
var close_after_enter = true;
//Time to wait between change checks (in ms)
var wait_time = 3*1000;
//total time to wait for completion (in ms)
var max_wait = 30*1000;

//should there be debug-messages on the web-console?
var debug = true;

/*
 * #####DO NOT CHANGE AFTER THIS LINE#####
 */

if(window.top != window.self)
	return;

var enter_btn;
var entered_btn;

function main() {
	if(document.querySelector(".sidebar__error")) {
		log("Error... can't join: "+document.querySelector(".sidebar__error").childNodes[1].nodeValue.substring(1));
		return;
	}
	enter_btn = document.querySelector(".sidebar__entry-insert");
	if(enter_btn) {
		if(enter_btn.className.indexOf("is-hidden") < 0) {
			log("Entering giveaway...");
			entered_btn = document.querySelector(".sidebar__entry-delete");
			enter_btn.click();
			setTimeout(wait_close, wait_time);
		} else {
			log("Already entered or error");
		}
		return;
	}
	log("Waiting for DOM...");
	setTimeout(main, 1000);
}

var wait_cycles = 0;

function wait_close() {
	if(enter_btn.className.indexOf("is-hidden") < 0) {
		log("Re-Entering Giveaway...");
		wait_cycles = 0;
		enter_btn.click();
	} else if(entered_btn.className.indexOf("is-hidden") < 0) {
		log("Successfully entered Giveaway...");
		if(close_after_enter)
			window.close();
		return;
	}
	if(wait_cycles * wait_time >= max_wait) {
		log("Completion takes to long... refreshing page...");
		location.reload();
		return;
	}
	log("Waiting for completion...");
	wait_cycles++;
	setTimeout(wait_close, wait_time);
}

function log(msg) {
	if(debug)
		console.log("[Auto-Enter] "+msg);
}

main();