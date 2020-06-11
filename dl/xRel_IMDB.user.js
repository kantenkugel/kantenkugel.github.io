// ==UserScript==
// @name xRel - IMDB
// @author Kantenkugel
// @description Adds IMDB-rating to the xRel site
// @namespace kantenkugel
// @version 1.4
// @grant GM_xmlhttpRequest
// @grant GM_setValue
// @grant GM_getValue
// @connect www.omdbapi.com
// @include http://www.xrel.to/*
// @include https://www.xrel.to/*
// @updateURL https://www.kantenkugel.com/m/dl/xRel_IMDB.user.js
// @downloadURL https://www.kantenkugel.com/m/dl/xRel_IMDB.user.js
// ==/UserScript==
var renewalInterval = 3*24*60*60*1000; //3 days cache
var doLog = false;
var displayYear = true;

//DO NOT CHANGE CODE BELOW THIS LINE!

var cache;
var timeoutHandle = null;

function log(obj) {
	if(!doLog)
		return;
	if(typeof(obj) == "object")
		GM_log(obj);
	else
		GM_log("[IMDB] "+obj);
}

function getInfo(url) {
	var parts = url.split("/");
	return {
		type: parts[3],
		id: parts[4]
	}
}

function getIntInfo() {
	var tmp = document.getElementById("extinfo_title");
	var title = tmp.getElementsByTagName("h3")[0].innerText;
	tmp = tmp.getElementsByTagName("span");
	if(tmp.length > 0) {
		title = tmp[0].innerText
		title = title.substring(1, title.length-1);
	}
	var year;
	tmp = document.getElementsByClassName("l_left");
	for(var i=0; i<tmp.length; i++) {
		if(tmp[i].innerText == "Produktion:") {
			year = tmp[i].nextElementSibling.innerText.split(" ");
			year = year[year.length-1];
			break;
		}
	}
	return {
		title: title,
		year: year
	};
}

function extractInfo(elem) {
	var link = elem.getElementsByClassName("release_title")[0].getElementsByTagName("a")[0];
	var info = getInfo(link.href);
	info.title = link.innerText;
	return info;
}

function fetchRating(title, year, cb) {
	var url = "http://www.omdbapi.com/?t="+title;
	if(year != undefined)
		url = url+"&y="+year;
	GM_xmlhttpRequest({
		method: "GET",
		url: url,
		onload: function(response) {
			var obj = JSON.parse(response.responseText);
			if(obj.Response === 'True')
				cb({
					title: obj.Title,
					year: obj.Year,
					rating: obj.imdbRating,
					ratingCount: obj.imdbVotes,
					imdbId: obj.imdbID
				});
			else if(year == undefined)
				cb(null);
			else
				fetchRating(title, undefined, cb);
		}
	});
}

function getRatingLink(parent) {
	return parent.getElementsByClassName("release_comments")[0].getElementsByTagName("a")[0];
}

function removeElem(elem) {
	elem.parentNode.removeChild(elem);
}

function putRating(link, rating) {
	if(rating == null) {
		removeElem(link);
	} else {
		link.href="http://www.imdb.com/title/"+rating.imdbId;
		link.innerText = "IMDB: "+rating.rating;
		if(displayYear)
			link.innerText = link.innerText+" ("+rating.year+")";
		link.target = "_blank";
	}
}

function putRatingInt(rating) {
	var ratingBar = document.getElementById("rating_bar");
	if(rating != null) {
		var imdbLink = document.createElement("a");
		imdbLink.href = "http://www.imdb.com/title/"+rating.imdbId;
		imdbLink.innerText = "IMDB: "+rating.rating;
		imdbLink.target = "_blank";
		ratingBar.parentNode.insertBefore(imdbLink, ratingBar);
	}
	removeElem(ratingBar);
}

function saveCache() {
	if(timeoutHandle != null)
		clearTimeout(timeoutHandle);
	timeoutHandle = window.setTimeout(function() {
		log("Saving cache...");
		log(cache);
		GM_setValue('xrelimdb_cache', cache);
	}, 250);
}

function main() {
	cache = GM_getValue('xrelimdb_cache', {});
	if(window.location.href.indexOf("/movie/") != -1 || window.location.href.indexOf("/tv/") != -1) {
		log("Running in single-instance-window");
		var intInfo = getInfo(window.location.href);
		var intInfo2 = getIntInfo();
		var title = intInfo2.title;
		var year = intInfo2.year;
		log("Info from page:");
		log(intInfo2);
		if(intInfo.id in cache) {
			log("Info from cache:");
			log(cache[intInfo.id]);
			if(cache[intInfo.id].title == title && cache[intInfo.id].year == year && (new Date().getTime() - cache[intInfo.id].time) < renewalInterval) {
				log("Cache is valid!");
				putRatingInt(cache[intInfo.id]);
				return;
			}
		}
		log("Updating Cache");
		fetchRating(title, year, (function(id) { return function(obj) {
			putRatingInt(obj);
			if(obj != null) {
				cache[id] = obj;
				cache[id].time = new Date().getTime();
				log("New cache value:");
				log(cache[id]);
				saveCache();
			}
		};})(intInfo.id));
	} else {
		log("On multi-page");
		var releases = document.getElementsByClassName("release_item");
		for(var i=0; i<releases.length; i++) {
			var info = extractInfo(releases[i]);
			var link = getRatingLink(releases[i]);
			if(info.type != 'movie' && info.type != 'tv')
				removeElem(link);
			else {
				log("Checking title "+info.title);
				if(info.id in cache && (new Date().getTime() - cache[info.id].time) < renewalInterval) {
					log("Cache is valid!");
					putRating(link, cache[info.id]);
				} else {
					log("Updating cache");
					var title = info.title;
					var year;
					if(info.id in cache) {
						title = cache[info.id].title;
						year = cache[info.id].year;
					}
					fetchRating(title, year, (function(link, id) { return function(obj) {
						putRating(link, obj);
						if(obj != null) {
							cache[id] = obj;
							cache[id].time = new Date().getTime();
							log("New cache value:");
							log(cache[id]);
							saveCache();
						}
					};})(link, info.id));
				}	
			}
		}
	}
}

main();