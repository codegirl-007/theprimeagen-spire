import { bootstrap } from "./app/bootstrap.js";

bootstrap().catch((error) => {
    console.error("Error during game initialization:", error);
});
