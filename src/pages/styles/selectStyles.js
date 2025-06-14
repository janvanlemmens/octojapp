export const customStyles = {
  control: (provided) => ({
    ...provided,
    borderRadius: 4,
    borderColor: "#888",
    minHeight: 36,
    boxShadow: "none",
    "&:hover": {
      borderColor: "#555",
    },
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: 4,
  }),
};

export const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontWeight: "bold",
  fontSize: 14,
  color: "#333",
};

export const formStyle = {
  maxWidth: 400,
  margin: "30px auto",
  padding: 20,
  border: "1px solid #ccc",
  borderRadius: 8,
  fontFamily: "Arial, sans-serif",
  backgroundColor: "#f9f9f9",
};
