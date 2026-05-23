const corsOptions = {
	origin: process.env.CLIENT_URL ?? "http://localhost:3000",
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
};

export default corsOptions;
