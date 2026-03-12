/// <reference types="mdast" />
import { h } from "hastscript";

export function rehypeChat(properties, children) {
  console.log("[rehypeChat] ===== CALLED =====");
  console.log("[rehypeChat] properties:", JSON.stringify(properties));
  console.log("[rehypeChat] children length:", children?.length);
  
  if (!Array.isArray(children) || children.length === 0) {
    return h("div", { class: "chat-container chat-empty" }, "No messages");
  }

  // 簡單測試：直接返回一個帶 class 的 div
  return h("div", { class: "chat-container chat-test" }, [
    h("div", { class: "chat-message" }, "TEST MESSAGE")
  ]);
}