import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-plugin-prettier";

export default [
	{
		ignores: [
			"dist/**",
			"node_modules/**",
			"src-tauri/**",
			"*.config.js",
			"*.config.ts",
		],
	},
	js.configs.recommended,
	{
		files: ["**/*.{ts,tsx}"],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				window: "readonly",
				document: "readonly",
				console: "readonly",
				setTimeout: "readonly",
				clearTimeout: "readonly",
				setInterval: "readonly",
				clearInterval: "readonly",
				HTMLElement: "readonly",
				HTMLButtonElement: "readonly",
				HTMLDivElement: "readonly",
				HTMLInputElement: "readonly",
				HTMLSpanElement: "readonly",
				HTMLTableElement: "readonly",
				HTMLTableSectionElement: "readonly",
				HTMLTableRowElement: "readonly",
				HTMLTableCellElement: "readonly",
				CustomEvent: "readonly",
				React: "readonly",
			},
		},
		plugins: {
			"@typescript-eslint": tseslint,
			react,
			"react-hooks": reactHooks,
			prettier,
		},
		rules: {
			// TypeScript rules
			"@typescript-eslint/no-unused-vars": [
				"error",
				{ argsIgnorePattern: "^_" },
			],
			"@typescript-eslint/explicit-function-return-type": "off",
			"@typescript-eslint/no-explicit-any": "warn",

			// React rules
			"react/react-in-jsx-scope": "off",
			"react/prop-types": "off",
			"react-hooks/rules-of-hooks": "error",
			"react-hooks/exhaustive-deps": "warn",

			// Prettier
			"prettier/prettier": "error",

			// General
			"no-console": ["warn", { allow: ["warn", "error"] }],
			"no-unused-vars": "off", // Use TypeScript version
		},
		settings: {
			react: {
				version: "detect",
			},
		},
	},
];
