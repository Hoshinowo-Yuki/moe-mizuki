/// <reference types="mdast" />
import { h } from "hastscript";

export function KeyboardComponent(properties, children) {
	console.log("KeyboardComponent called:", JSON.stringify({ properties, children }, null, 2));
	
	const keyText = properties.key || "?";

	return h("kbd", { class: "keyboard" }, keyText);
}