import React, { useState } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const PdfViewer = ({ file }) => {
  const [scale, setScale] = useState(1.0); // default zoom level
  const [numPages, setNumPages] = useState(null);

  const handleZoomIn = () => setScale((prev) => prev + 0.2);
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5)); // prevent too small

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <button onClick={handleZoomOut}>- Zoom Out</button>
        <button onClick={handleZoomIn}>+ Zoom In</button>
      </div>

      <Document
        file={file}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        onLoadError={console.error}
      >
        {Array.from(new Array(numPages), (_, index) => (
          <Page key={index} pageNumber={index + 1} scale={scale} />
        ))}
      </Document>
    </div>
  );
};

export default PdfViewer;
