import React from "react";
import "./CustomButton.css";

export default function CustomButton({ children, onPress, type }) {
  return (
    <button
      type={type ? type : "button"}
      onClick={onPress}
      className="custom-button"
    >
      {children}
    </button>
  );
}
