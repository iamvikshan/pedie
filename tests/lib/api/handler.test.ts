import { describe, expect, mock, test } from "bun:test";
import { withApiHandler } from "@lib/api/handler";
import { NextResponse } from "next/server";

describe("withApiHandler", () => {
	test("passes through successful response", async () => {
		const handler = withApiHandler(async () => {
			return NextResponse.json({ ok: true });
		});

		const request = new Request("http://localhost/api/test");
		const result = await handler(request);
		const body = await result.json();

		expect(result.status).toBe(200);
		expect(body.ok).toBe(true);
	});

	test("catches errors and returns 500", async () => {
		// Suppress expected console.error during test
		const originalError = console.error;
		console.error = mock(() => {});

		const handler = withApiHandler(async () => {
			throw new Error("Something broke");
		});

		const request = new Request("http://localhost/api/test");
		const result = await handler(request);
		const body = await result.json();

		expect(result.status).toBe(500);
		expect(body.error).toBe("Internal server error");

		console.error = originalError;
	});

	test("uses custom label in error log", async () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const logs: any[][] = [];
		const originalError = console.error;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		console.error = mock((...args: any[]) => logs.push(args));

		const handler = withApiHandler(async () => {
			throw new Error("fail");
		}, "custom-label");

		const request = new Request("http://localhost/api/test");
		await handler(request);

		expect(logs[0][0]).toContain("custom-label");

		console.error = originalError;
	});

	test("passes request and context to handler", async () => {
		let receivedUrl = "";
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let receivedContext: any = null;

		const handler = withApiHandler(async (req, ctx) => {
			receivedUrl = req.url;
			receivedContext = ctx;
			return NextResponse.json({ ok: true });
		});

		const request = new Request("http://localhost/api/items");
		const context = { params: { id: "123" } };
		await handler(request, context);

		expect(receivedUrl).toBe("http://localhost/api/items");
		expect(receivedContext).toEqual({ params: { id: "123" } });
	});
});
