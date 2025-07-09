# CUSTECH DrugVerify Application

This is a Next.js application built in Firebase Studio designed to help CUSTECH Clinic staff verify the authenticity of drugs by scanning their barcodes. It integrates with real-world databases and uses AI to analyze drug information.

## Core Capabilities

### 1. User Authentication
- **Login & Signup:** Provides simple, intuitive pages for user login and account creation.
- **Session Management:** A persistent user session on the dashboard with a user navigation menu for easy access to different parts of the app and a logout function.

### 2. Drug Scanning & Verification
- **Real-Time Camera Scanning:** Utilizes the browser's built-in `BarcodeDetector` API to scan drug barcodes directly through the device's camera. It is optimized to prefer the rear-facing camera on mobile devices.
- **Manual Barcode Entry:** A fallback option allows users to type in the barcode number manually, ensuring usability even if the camera is unavailable or fails to detect the code.
- **Live Database Integration:** After a barcode is captured, the application queries the **OpenFDA `drug/ndc.json` API** to retrieve official drug details, including manufacturer and drug name. This replaces mock data with real-world information.

### 3. AI-Powered Analysis
- **Counterfeit Detection Flow:** A Genkit AI flow (`flagSuspectDrugFlow`) receives the data fetched from OpenFDA.
- **Inconsistency Analysis:** The AI is prompted to act as a specialist, cross-referencing the provided details to identify inconsistencies that may indicate a counterfeit product.
- **Clear Verdict:** The AI returns a simple `isSuspect` boolean and a `reason` explaining its conclusion, which are then displayed to the user.

### 4. Results & Reporting
- **Immediate Feedback:** The results page instantly displays a clear "Verified" or "Suspect" status, highlighted with distinct colors and icons for quick comprehension.
- **Detailed Information:** Users can view the AI's reasoning, the drug details retrieved from the database, and the data sources that were consulted during the verification.
- **Actionable Steps:** If a drug is flagged as suspect, a "Flag for NAFDAC" button is presented, allowing staff to take the next step (note: this is a UI feature and does not yet trigger a real-world report).

### 5. Scan History & Auditing
- **Persistent Log:** The application maintains a history of all scanned drugs on a dedicated page. (Currently uses mock data, but is architected for a database).
- **Powerful Filtering & Search:** Staff can easily search the history log by drug name, manufacturer, or barcode. Scans can also be filtered by status (Verified, Suspect, Unknown).
- **Data Export:** The filtered scan history can be exported as a JSON file for record-keeping, reporting, or further analysis.

## Tech Stack
- **Frontend:** Next.js, React, TypeScript
- **Styling:** Tailwind CSS with ShadCN UI components
- **Generative AI:** Google Gemini via Genkit flows
- **APIs:** Live data from OpenFDA
