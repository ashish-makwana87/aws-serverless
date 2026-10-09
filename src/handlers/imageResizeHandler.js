import { imageResizeHandler} from "../config/container.js";

// For cleaner design to keep a very thin Lambda entrypoint and let that entrypoint obtain the fully composed handler from container.js. 

// Creating a separate imageResizeProcessor file to avoid circular dependency. When importing imageResizeHandler inside one common file, the function is being accessed before initialization and it is failing the profile API integration test. 

export const handler = imageResizeHandler;

