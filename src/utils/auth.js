import axios from "axios";
import { toast } from "react-toastify";

export async function logoutUser() {
  toast.success("lklk");
  try {
    const response = await axios.post("http://localhost:5001/clear-uploads", {
      folder: "bookings",
    });
    console.log(response);
  } catch (err) {
    console.log("Error deleting files", err);
  }

  // Clear tokens, redirect, etc.
}

export function autolink() {}
