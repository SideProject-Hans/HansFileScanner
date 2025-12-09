import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Tauri API for testing
vi.mock("@tauri-apps/api/core", () => ({
	invoke: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-dialog", () => ({
	open: vi.fn(),
	save: vi.fn(),
	message: vi.fn(),
	ask: vi.fn(),
	confirm: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-fs", () => ({
	readDir: vi.fn(),
	readFile: vi.fn(),
	writeFile: vi.fn(),
	exists: vi.fn(),
	remove: vi.fn(),
	rename: vi.fn(),
	copyFile: vi.fn(),
}));

// Reset all mocks before each test
beforeEach(() => {
	vi.clearAllMocks();
});
