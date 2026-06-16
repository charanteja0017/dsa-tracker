// App timezone that defines "a day" everywhere (streak, heatmap, header date).
// Client- and server-safe (no imports). The server (lib/db) lets APP_TZ env
// override this default; the client uses the default directly.
export const APP_TZ = "Asia/Kolkata";
