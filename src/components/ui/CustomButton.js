import React from "react";
import "./CustomButton.css";

export default function CustomButton({ children, onPress }) {
  return (
    <button onClick={onPress} className="custom-button">
      {children}
    </button>
  );
}
