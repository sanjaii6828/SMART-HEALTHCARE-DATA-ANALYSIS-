# Smart Healthcare Data Analysis using R Programming

A complete medium-level academic project delivered in two coupled parts:

1. **The R / R Shiny project** (`SmartHealthcare/`) – downloadable as a ZIP from the
   *R Source Code* or *Reports* page of the web app. It contains `app.R`, the
   `R/` modules (`data_cleaning.R`, `analysis.R`, `visualization.R`,
   `prediction.R`, `generate_dataset.R`), `run_analysis.R`, `www/style.css`,
   `README.md` and the dataset in `data/healthcare_data.csv`.
2. **This interactive web dashboard** (React + Vite + Tailwind) – a faithful,
   browser-based implementation of the same nine modules so every result can be
   explored and cross-checked without an R installation:

| Module | Page | What it does |
|-------|------|--------------|
| 1 Data Collection | Data Import | CSV upload / synthetic data, rows, columns, types, missing values, duplicates |
| 2 Preprocessing | Data Cleaning | 9-step pipeline: duplicates, text standardisation, types, unrealistic values, BMI recalculation, median/mode imputation, factors, derived categories |
| 3 EDA | Exploratory Analysis | mean / median / SD / min / max / quartiles, frequency tables, grouped summaries |
| 4 Visualization | Visualization | dynamic chart builder + the 11 required ggplot2 charts (with R code) |
| 5 Statistics | Statistical Analysis | Pearson `cor.test`, Welch `t.test`, `chisq.test` with plain-language interpretation |
| 6 Risk Analysis | Risk Analysis | rule-based Low / Moderate / High indicator (BMI, glucose, BP, cholesterol) |
| 7 Prediction | Prediction | CART decision tree (rpart-like), accuracy, kappa, confusion matrix, precision / recall / F1, tree view, random-forest comparison, single-patient prediction |
| 8 Dashboard | Dashboard Home | KPIs, risk summary, interactive charts, patient table, risk prediction |
| 9 Reports | Reports & Downloads | insight report, cleaned data, statistics, risk CSV, model evaluation, full R project ZIP |

> The risk indicator and prediction model are analytical / educational outputs.
> They are **not** a medical diagnosis.

## Development

```bash
npm install
npm run dev     # local development
npm run build   # production build (dist/index.html)
```
