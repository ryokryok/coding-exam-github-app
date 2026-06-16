import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// 各テスト後に DOM を破棄（happy-dom 以外の node テストでも無害）。
afterEach(cleanup);
