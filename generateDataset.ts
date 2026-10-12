import { toCsv } from "../lib/csv";
import { ALL_COLS } from "../lib/types";

/* ------------------------------------------------------------------
 *  Synthetic (anonymised) healthcare dataset generator.
 *  This mirrors R/generate_dataset.R so the web demo and the R project
 *  produce statistically equivalent data (set.seed(42) in R).
 *  Realistic data-quality problems (missing values, duplicates,
 *  unrealistic entries, inconsistent text) are injected on purpose so the
 *  Data Cleaning module has real work to do.
 * ------------------------------------------------------------------ */

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;

function rnorm(rng: Rng, mean = 0, sd = 1) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
const clamp = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi);
const round = (x: number, d = 0) => Math.round(x * 10 ** d) / 10 ** d;
function sample<T>(rng: Rng, items: T[], probs?: number[]): T {
  if (!probs) return items[Math.floor(rng() * items.length)];
  const total = probs.reduce((a, b) => a + b, 0);
  let u = rng() * total;
  for (let i = 0; i < items.length; i++) {
    u -= probs[i];
    if (u <= 0) return items[i];
  }
  return items[items.length - 1];
}
function rpois(rng: Rng, lambda: number) {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rng();
  } while (p > L);
  return k - 1;
}
const pts = (x: number, lo: number, hi: number) => (x < lo ? 0 : x < hi ? 1 : 2);

export interface SyntheticOptions {
  n?: number;
  seed?: number;
  injectIssues?: boolean;
}

export function generateSyntheticRows({ n = 1000, seed = 42, injectIssues = true }: SyntheticOptions = {}) {
  const rng = mulberry32(seed);
  const rows: Record<string, string | number | null>[] = [];

  for (let i = 1; i <= n; i++) {
    const gender = rng() < 0.5 ? "Male" : "Female";
    const age = Math.round(clamp(rnorm(rng, 48, 16), 18, 85));
    const height = round(gender === "Male" ? rnorm(rng, 174, 7) : rnorm(rng, 161, 6.5), 1);
    const bmi = round(clamp(rnorm(rng, 26.5 + 0.03 * (age - 45), 4.8), 15, 48), 1);
    const weight = round(bmi * (height / 100) ** 2, 1);
    const smoking = sample(rng, ["Never", "Former", "Current"], [0.55, 0.25, 0.2]);
    const activity =
      bmi >= 30
        ? sample(rng, ["Low", "Moderate", "High"], [0.55, 0.35, 0.1])
        : sample(rng, ["Low", "Moderate", "High"], [0.3, 0.45, 0.25]);
    const systolic = Math.round(clamp(108 + 0.55 * (age - 18) + 1.3 * (bmi - 25) + rnorm(rng, 0, 12), 88, 200));
    const diastolic = Math.round(clamp(0.55 * systolic + 8 + rnorm(rng, 0, 6), 55, 120));
    const heart = Math.round(clamp(rnorm(rng, 74, 10) + (smoking === "Current" ? 5 : 0), 48, 120));
    const glucose = Math.round(
      clamp(88 + 0.4 * (age - 18) + 1.6 * (bmi - 25) + (activity === "Low" ? 6 : 0) + rnorm(rng, 0, 16), 65, 320),
    );
    const chol = Math.round(
      clamp(170 + 0.9 * (age - 18) + 2.2 * (bmi - 25) + (smoking === "Current" ? 10 : 0) + rnorm(rng, 0, 30), 110, 360),
    );
    const hb = round(clamp(gender === "Male" ? rnorm(rng, 14.8, 1.2) : rnorm(rng, 13.1, 1.2), 7, 19), 1);

    const pNone = age < 40 ? 0.75 : age < 60 ? 0.55 : 0.35;
    const prev = sample(
      rng,
      ["None", "Hypertension", "Diabetes", "Asthma", "Heart Disease", "Thyroid"],
      [pNone, (1 - pNone) * 0.3, (1 - pNone) * 0.25, (1 - pNone) * 0.15, (1 - pNone) * 0.15, (1 - pNone) * 0.15],
    );

    const u = rng();
    let diagnosis = "Healthy";
    if (hb < 11.5 && u < 0.7) diagnosis = "Anemia";
    else if (glucose >= 126 && u < 0.85) diagnosis = "Diabetes";
    else if (systolic >= 140 && u < 0.8) diagnosis = "Hypertension";
    else if (age > 50 && chol >= 240 && systolic >= 130 && u < 0.6) diagnosis = "Heart Disease";
    else if (bmi >= 30 && u < 0.75) diagnosis = "Obesity";
    else if (u < 0.06) diagnosis = "Asthma";

    let medication = "None";
    if (diagnosis === "Diabetes" || prev === "Diabetes") medication = "Metformin";
    else if (diagnosis === "Hypertension" || prev === "Hypertension") medication = "Amlodipine";
    else if (diagnosis === "Heart Disease" || prev === "Heart Disease") medication = "Atorvastatin";
    else if (diagnosis === "Asthma" || prev === "Asthma") medication = "Salbutamol";
    else if (prev === "Thyroid") medication = "Levothyroxine";
    else if (diagnosis === "Anemia") medication = "Iron Supplement";

    // label generation: clinical indicators + hidden lifestyle factors + noise
    const score =
      (bmi < 18.5 ? 1 : pts(bmi, 25, 30)) +
      pts(glucose, 100, 126) +
      pts(systolic, 120, 140) +
      pts(chol, 200, 240) +
      (age >= 60 ? 1 : 0) +
      (smoking === "Current" ? 1 : 0) +
      (prev !== "None" ? 1 : 0);
    const nHigh = (bmi >= 30 ? 1 : 0) + (glucose >= 126 ? 1 : 0) + (systolic >= 140 ? 1 : 0) + (chol >= 240 ? 1 : 0);
    let risk = score >= 6 || nHigh >= 2 ? "High" : score >= 3 || nHigh >= 1 ? "Moderate" : "Low";
    if (rng() < 0.07) risk = sample(rng, ["Low", "Moderate", "High"]);

    const visits = rpois(rng, risk === "High" ? 4 : risk === "Moderate" ? 2 : 0.8);

    rows.push({
      Patient_ID: `P${String(i).padStart(4, "0")}`,
      Age: age,
      Gender: gender,
      Height_cm: height,
      Weight_kg: weight,
      BMI: bmi,
      Systolic_BP: systolic,
      Diastolic_BP: diastolic,
      Heart_Rate: heart,
      Glucose_Level: glucose,
      Cholesterol: chol,
      Hemoglobin: hb,
      Smoking_Status: smoking,
      Physical_Activity: activity,
      Previous_Disease: prev,
      Medication: medication,
      Hospital_Visits: visits,
      Diagnosis: diagnosis,
      Health_Risk: risk,
    });
  }

  if (!injectIssues) return rows;

  // ---- inject realistic data-quality problems (fixed by the cleaning module) ----
  const idx = () => Math.floor(rng() * n);
  for (const col of ["Glucose_Level", "Cholesterol", "Hemoglobin", "Heart_Rate", "BMI", "Weight_kg"]) {
    for (let k = 0; k < 25; k++) rows[idx()][col] = null;
  }
  for (let k = 0; k < 10; k++) rows[idx()].Physical_Activity = null;
  for (let k = 0; k < 15; k++) {
    const r = rows[idx()];
    r.Gender = String(r.Gender).toLowerCase();
  }
  for (let k = 0; k < 10; k++) {
    const r = rows[idx()];
    r.Gender = String(r.Gender).toUpperCase();
  }
  for (let k = 0; k < 10; k++) {
    const r = rows[idx()];
    r.Smoking_Status = ` ${String(r.Smoking_Status).toLowerCase()} `;
  }
  rows[idx()].Age = 0;
  rows[idx()].Age = 0;
  rows[idx()].Age = 150;
  rows[idx()].Systolic_BP = 300;
  rows[idx()].Systolic_BP = 300;
  rows[idx()].Glucose_Level = 999;
  rows[idx()].Glucose_Level = 999;
  rows[idx()].BMI = 75;
  rows[idx()].Heart_Rate = 250;
  rows[idx()].Cholesterol = -1;
  rows[idx()].Hemoglobin = 45;

  // 20 duplicate records inserted at random positions
  for (let k = 0; k < 20; k++) {
    const src = rows[idx()];
    rows.splice(idx(), 0, { ...src });
  }
  return rows;
}

export function generateSyntheticCsv(opts: SyntheticOptions = {}): string {
  const rows = generateSyntheticRows(opts);
  return toCsv([...ALL_COLS], rows);
}
