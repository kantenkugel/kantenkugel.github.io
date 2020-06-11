// ==UserScript==
// @name Cooksillustrated Paywall killer
// @namespace kantenkugel
// @include https://www.cooksillustrated.com/recipes/*
// @grant none
// ==/UserScript==

$(".paywall__overlay").remove();
$(".recipe").css("height", "");
$(".blurred").removeClass("blurred");