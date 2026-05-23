const defaultOrigins = ["http://localhost:3000"];

const configuredOrigins = [process.env.CLIENT_URL, process.env.CLIENT_URLS]
	.flatMap((value) => (value ? value.split(",") : []))
	.map((value) => value.trim())
	.filter(Boolean);

const allowedOrigins = [...new Set([...defaultOrigins, ...configuredOrigins])];

const corsOptions = {
	origin: (origin, callback) => {
		if (!origin) {
			callback(null, true);
			return;
		}

		if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
			callback(null, true);
			return;
		}

		callback(new Error(`CORS blocked for origin: ${origin}`));
	},
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
};

export default corsOptions;
