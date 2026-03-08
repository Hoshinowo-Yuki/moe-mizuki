import { execSync } from "child_process";

// Using Git
export function remarkModifiedTime() {
	return function (tree, file) {
		const filepath = file.history[0];
		const result = execSync(
			`git log -1 --pretty="format:%cI" "${filepath}"`,
		);
		file.data.astro.frontmatter.lastModified = result.toString();
	};
}

// Using filesystem
// import { statSync } from "fs";
//
// export function remarkModifiedTime() {
//   return function (tree, file) {
//     const filepath = file.history[0];
//     const result = statSync(filepath);
//     file.data.astro.frontmatter.lastModified = result.mtime.toISOString();
//   };
// }

