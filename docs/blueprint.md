# **App Name**: CUSTECH DrugVerify

## Core Features:

- Secure Login: User Authentication: Secure access via Firebase Authentication with email/password registration and login. Fallback anonymous login for testing.
- Barcode Scan: Barcode Scanning: Utilizes webcam-based barcode scanning via QuaggaJS to quickly capture drug information.
- Drug Check: Drug Verification: Compares scanned data with OpenFDA/GS1 APIs and a fallback Google Sheets dataset to verify drug authenticity.
- Fake Flag: AI-Powered Fake Drug Flagging: Flags potentially counterfeit drugs. The tool will automatically and dynamically analyze scanned drug data against known indicators from OpenFDA, GS1 and our internal data set, cross-referencing attributes such as manufacturer details, production dates, and batch numbers to identify inconsistencies.
- Scan History: Scan History: Stores and displays paginated scan logs with date/status filters, including an option for JSON export, using Firebase Firestore.
- Offline Cache: Offline Caching: Implements Dexie.js for caching approximately 100 drug records to ensure functionality in areas with limited network access.
- React UI: Responsive UI: Four core routes (Home, Scan, Results, History) built with React and Tailwind CSS, optimized for both desktop and mobile WebView viewing.

## Style Guidelines:

- Primary color: Moderate blue (#5DADE2), chosen to evoke trust and reliability in pharmaceutical verification.
- Background color: Very light blue (#EBF5FB), providing a clean and calming backdrop that does not distract from the app’s critical functions.
- Accent color: Muted violet (#8E44AD) is used sparingly for highlighting actionable items and key interactive elements to guide the user effectively.
- Body and headline font: 'Inter', a sans-serif font known for its modern, neutral appearance, ensuring legibility and a clean aesthetic for all text elements.
- Minimalist icons to represent key actions and statuses (e.g., scan, verified, suspect) ensuring clarity.
- Clean and intuitive layout, prioritizing ease of navigation and quick access to the core functions of the application.
- Subtle transition effects during barcode scanning and result display to enhance user experience without being intrusive.