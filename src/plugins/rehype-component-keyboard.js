/// <reference types="mdast" />
import { h } from "hastscript";

export function KeyboardComponent(properties, children) {
	const keyText =
		properties.key ||
		(Array.isArray(children) && children.length > 0
			? children.map((c) => c.value || "").join("")
			: "?");

	return h("kbd", {}, keyText);
}