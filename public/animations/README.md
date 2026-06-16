# Lottie animations

Drop `.lottie` (preferred, smaller) or `.json` Lottie files here. Anything in
`public/` is served at the site root, so a file here is reachable at
`/animations/<name>`.

## Expected filenames (so the integration can find them)

Use these names and I'll wire up the triggers. Any you skip are just ignored.

| File | When it plays |
|---|---|
| `week-complete.lottie` | you finish every problem in the current week (focus ring → 100%) |
| `milestone.lottie` | overall % crosses 25 / 50 / 75 / 100 |
| `streak.lottie` | a streak milestone (e.g. 7 / 30 / 100 days) |
| `empty.lottie` | the "This Week" panel has no problems mapped (empty state) |

## Tips
- Prefer `.lottie` over raw `.json` — usually 5–10× smaller.
- Keep each file lean (the player runtime is lazy-loaded; the art shouldn't be huge).
- Check the license on LottieFiles before shipping (this repo is public).
