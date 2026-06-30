import type { ProfileConfig } from "../types/config";

// 个人资料配置
export const profileConfig: ProfileConfig = {
	avatar: "https://r2.lolicon.io/blog/assets/avatar_512.webp", // 相对于 /src 目录。如果以 '/' 开头，则相对于 /public 目录
	name: "ホシノ ゆき",
	bio: "世界は大きい、君は行かなければならない",
	typewriter: {
		enable: true, // 启用个人简介打字机效果
		speed: 80, // 打字速度（毫秒）
	},
	links: [
		{
			name: "YouTube",
			icon: "mdi:youtube",
			url: "https://www.youtube.com/@KazenotomodachiUwU",
		},
		{
			name: "Threads",
			icon: "simple-icons:threads",
			url: "https://threads.com/@taroimomiruku",
		},
		{
			name: "GitHub",
			icon: "fa7-brands:github",
			url: "https://github.com/Hoshinowo-Yuki",
		},
		{
			name: "Discord",
			icon: "fa7-brands:discord",
			url: "https://discord.com/users/885756325798227988",
		},
		{
			name: "Telegram",
			icon: "fa7-brands:telegram-plane",
			url: "https://t.me/CodeCrafter404",
		}
	],
};
