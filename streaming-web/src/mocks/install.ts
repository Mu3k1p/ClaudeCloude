/** Routes all API calls to the in-process mock API. Development only. */
import { setTransport } from "@/lib/api/client";
import { config } from "@/lib/config";
import { mockTransport } from "./router";

if (config.useMocks) setTransport(mockTransport);
