/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
	app(input) {
		return {
			name: "bocantino-erp",
			removal: input?.stage === "production" ? "retain" : "remove",
			protect: ["production"].includes(input?.stage),
			home: "aws",
			providers: {
				aws: {
					profile: "bruno_mollo",
				},
			},
		};
	},
	async run() {
		new sst.aws.SvelteKit("BociatinoERP", {
			buildCommand: "npm run build",
			nodejs: {
				install: ["sharp"],
				// Use Node.js 22 runtime
				version: "22",
			},
			runtime: "nodejs22.x",
			environment: {
				NEON_DATABASE_URL: process.env.NEON_DATABASE_URL || "",
				JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || "",
				JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "60",
				// Configure for Lambda optimizations
				NODE_OPTIONS: "--max-old-space-size=1024",
			},
			domain: {
				name: $app.stage === "production" ? "bocantino-erp.com" : undefined,
			},
		});
	},
});
