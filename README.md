# Revision Mat Builder

A browser-based visual editor for creating printable revision mats.

## Features

- A3 and A4 page sizes
- Portrait and landscape layouts
- Add, drag and resize question boxes
- Edit titles and questions live
- Adjustable font sizes
- Lined answer space
- Automatic box arrangement
- Save and reopen layouts as JSON
- Export the finished mat as a PDF

## Run it in VS Code

1. Install Node.js from https://nodejs.org if it is not already installed.
2. Open this folder in VS Code.
3. Open **Terminal > New Terminal**.
4. Run:

```bash
npm install
npm run dev
```

5. Open the local address shown in the terminal, normally:

```text
http://localhost:5173
```

## Build a production version

```bash
npm run build
```

The production files will be created in the `dist` folder.

## Main files

- `src/App.jsx` – app state, save/load and PDF export
- `src/components/RevisionCanvas.jsx` – draggable and resizable canvas boxes
- `src/components/Toolbar.jsx` – page and file controls
- `src/components/PropertiesPanel.jsx` – live editing controls
- `src/styles.css` – app design
