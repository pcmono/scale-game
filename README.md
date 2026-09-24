# Concert B♭ Scale Quest

A browser-based beginning-band scale game for eight instruments. Students choose an instrument, identify eight written notes, and choose a playing picture for each note. Choose 3, 5, or 8 notes; each note has two questions (6, 10, or 16 questions total).

## Host with GitHub Pages

1. Extract this ZIP on your computer. GitHub does not unpack an uploaded ZIP.
2. Create a **public** repository on GitHub (on GitHub Free, Pages requires a public repository). Upload the extracted contents, including the hidden `.github` folder, to the repository's top level. GitHub's **Add file → Upload files** works, or commit and push with Git. Make sure the `dist`, `tests`, and `.github` folders appear beside this README, not inside an extra folder.
3. In your repository, select **Settings → Pages**. Under **Build and deployment → Source**, choose **GitHub Actions**. The included `.github/workflows/pages.yml` publishes `dist` whenever you push to `main`. If your default branch has another name, change `main` in that file.
4. Open the **Actions** tab and wait for the green **Deploy game to GitHub Pages** run. Then return to **Settings → Pages** and use **Visit site** to get the exact public link. Test it and post that link in Google Classroom.

A repository alone stores the code; Pages serves the website. The game needs no backend, bucket, database, API key, or student login. GitHub remains the hosting provider, so keep a copy of this repository. Your already-published game link can continue to work independently of GitHub Pages.

## Test locally

Run `python3 -m http.server 8000 --directory dist` and visit `http://localhost:8000/`. Open `/checks.html` for teacher-facing checks. Run `node --test tests/*.test.mjs` from the repository root for the code checks. The Pages workflow runs these checks before publishing.

Scores stay in the browser during a round and do not go to Google Classroom. `dist/BRAVURA-LICENSE.txt` covers the embedded music symbol outlines. Other code licensing has not been specified; choose a license before inviting public reuse or contributions.

## Link

https://pcmono.github.io/scale-game/
