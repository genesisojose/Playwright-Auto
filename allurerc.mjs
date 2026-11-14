// Allure 3 configuration - used both locally and in CI (`bunx allure generate`).
// Docs: https://allurereport.org/docs/v3/configure/
import { defineConfig } from "allure";

export default defineConfig({
  name: "Practica-Auto",
  output: "./allure-report",

  // Trend data: one line per generated report is appended to this file.
  // CI points it to the copy stored in the gh-pages branch so trends survive between runs.
  historyPath: process.env.ALLURE_HISTORY_PATH ?? "./allure-history.jsonl",
  historyLimit: 20,

  plugins: {
    awesome: {
      options: {
        reportLanguage: "en",
        // One standalone HTML file (handy for the downloadable CI artifact)
        singleFile: process.env.ALLURE_SINGLE_FILE === "true",
      },
    },
  },
});
