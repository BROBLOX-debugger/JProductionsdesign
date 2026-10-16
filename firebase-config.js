// =========================================================
// JPRODUCTIONS — Firebase Config + Smooth Booking Handler
// =========================================================

const firebaseConfig = {
  apiKey: "AIzaSyDYRfZGOhmdyjNRFlNAsL15iEhPXlbCwxU",
  authDomain: "justins-booking.firebaseapp.com",
  projectId: "justins-booking",
  storageBucket: "justins-booking.firebasestorage.app",
  messagingSenderId: "1025617742708",
  appId: "1:1025617742708:web:09d4fcc825a6f3513d7a21"
};

// Initialize only once
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// ---------- Helpers ----------
function setStatus(el, message, type) {
  if (!el) return;
  el.textContent = message;
  el.className = ""; // reset
  if (type === "success") {
    el.style.color = "#4ade80";
  } else if (type === "error") {
    el.style.color = "#f87171";
  } else if (type === "loading") {
    el.style.color = "var(--c1, #00f5ff)";
  } else {
    el.style.color = "var(--text-muted, #7a7490)";
  }
}

function setButtonState(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn.disabled = true;
    btn.dataset.originalText = btn.textContent;
    btn.textContent = "Sending...";
    btn.style.opacity = "0.65";
    btn.style.cursor = "not-allowed";
  } else {
    btn.disabled = false;
    btn.textContent = btn.dataset.originalText || "Send Booking Request";
    btn.style.opacity = "1";
    btn.style.cursor = "pointer";
  }
}

// ---------- Booking Form ----------
document.addEventListener("DOMContentLoaded", () => {
  const bookingForm = document.getElementById("booking-form");
  const statusMsg = document.getElementById("booking-status");

  if (!bookingForm) return; // page without booking form

  const submitBtn = bookingForm.querySelector('button[type="submit"]');

  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Prevent double-submit
    if (submitBtn && submitBtn.disabled) return;

    const name = document.getElementById("booking-name").value.trim();
    const song = document.getElementById("booking-song").value.trim();
    const date = document.getElementById("booking-date").value;

    // Validation
    if (!name || !song || !date) {
      setStatus(statusMsg, "Please fill out all fields.", "error");
      return;
    }

    // Date should not be in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(date);
    if (eventDate < today) {
      setStatus(statusMsg, "Please choose a future date.", "error");
      return;
    }

    // Start loading state
    setButtonState(submitBtn, true);
    setStatus(statusMsg, "Submitting your booking...", "loading");

    try {
      await db.collection("bookings").add({
        name: name,
        song: song,
        eventDate: date,
        bookedBy: sessionStorage.getItem("userName") || null,
        submittedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // Success
      setStatus(
        statusMsg,
        "Thank you! Your booking has been received. I'll get back to you soon.",
        "success"
      );
      bookingForm.reset();

      // Auto-clear success message after 6 seconds
      setTimeout(() => {
        if (statusMsg && statusMsg.textContent.includes("Thank you")) {
          setStatus(statusMsg, "", "");
        }
      }, 6000);

    } catch (error) {
      console.error("Booking error:", error);
      setStatus(statusMsg, "Something went wrong. Please try again later.", "error");
    } finally {
      // Always restore button
      setButtonState(submitBtn, false);
    }
  });
});
