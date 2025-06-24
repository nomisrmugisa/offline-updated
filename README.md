# DHIS2 MCCOD-Local (MCCoD React)

This is the frontend application for the offline first version of the DHIS2 Medical Certificate Cause of Death (MCCoD) system.

## Setup and Installation

1. **Clone the repository:**
  ```bash
   git clone git@github.com:nomisrmugisa/mccod-react.git
   cd mccod-react
  ```

2. **Ensure you're using Node.js version 18 or greater:**

   You can check your Node.js version by running:

  ```bash
   node -v
  ```

   If you don't have Node.js installed or need to upgrade, visit [Node.js download page](https://nodejs.org/) and follow the instructions.

3. **Install dependencies:**

  ```bash
   npm install
  ```

4. **Run the development server:**

  ```bash
   npm run dev
  ```

   This will start the Vite development server. Open your browser and visit `http://localhost:5173` to view the app.


## Vite Specifics

- **Start development server:**  
```bash
  npm run dev
``` 
will start the Vite development server and serve the app.

- **Build the project for production:**  
```bash
  npm run build
``` 
will create a production-ready version of the app.

- **Preview the build:**  
  After building, you can preview it by running:
```bash
  npm run preview
```

## Notes

- This project uses **Vite** for fast development and bundling.
- **Dexie.js** is used for client-side database management (event storage).
- Node V20   least 18
