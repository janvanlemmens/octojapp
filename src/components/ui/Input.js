import React from "react";

export default function Input({ name, onChange, placeholder, value }) {
  return (
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
}
