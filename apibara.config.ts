import { defineConfig } from "apibara/config";

export default defineConfig({
  runtimeConfig: {
    syncpayLiquidity: {
      startingBlock: 2655020,
      streamUrl: "https://sepolia.starknet.a5a.ch",
      contractAddress:
        "0x079d34f36f135f787af3a0fc2556613b22f1bd4da15378ccf71b5dbb1cae5022",
      backendUrl: process.env["BACKEND_URL"] ?? "http://localhost:5000",
    },
  },
});
