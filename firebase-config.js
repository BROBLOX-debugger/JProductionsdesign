// =========================================================
// JPRODUCTIONS — Firebase Config
// Booking + Audition handlers
// =========================================================

const firebaseConfig = {
  apiKey: "AIzaSyDYRfZGOhmdyjNRFlNAsL15iEhPXlbCwxU",
  authDomain: "justins-booking.firebaseapp.com",
  projectId: "justins-booking",
  storageBucket: "justins-booking.firebasestorage.app",
  messagingSenderId: "1025617742708",
  appId: "1:1025617742708:web:09d4fcc825a6f3513d7a21"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

function setStatus(el, message, type) {
  if (!el) return;
  el.textContent = message;
  if (type === "success") el.style.color = "#4ade80";
  else if (type === "error") el.style.color = "#f87171";
  else if (type === "loading") el.style.color = "var(--c1, #00f5ff)";
  else el.style.color = "var(--text-muted, #7a7490)";
}

function setButtonState(btn, loading, loadingText, idleText) {
  if (!btn) return;
  if (loading) {
    btn.disabled = true;
    btn.dataset.originalText = btn.textContent;
    btn.textContent = loadingText || "Sending...";
    btn.style.opacity = "0.65";
    btn.style.cursor = "not-allowed";
  } else {
    btn.disabled = false;
    btn.textContent = idleText || btn.dataset.originalText || btn.textContent;
    btn.style.opacity = "1";
    btn.style.cursor = "pointer";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // ---------- BOOKING ----------
  const bookingForm = document.getElementById("booking-form");
  if (bookingForm) {
    const statusMsg = document.getElementById("booking-status");
    const submitBtn = bookingForm.querySelector('button[type="submit"]');

    bookingForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (submitBtn && submitBtn.disabled) return;

      const name = document.getElementById("booking-name").value.trim();
      const song = document.getElementById("booking-song").value.trim();
      const date = document.getElementById("booking-date").value;

      if (!name || !song || !date) {
        setStatus(statusMsg, "Please fill out all fields.", "error");
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(date) < today) {
        setStatus(statusMsg, "Please choose a future date.", "error");
        return;
      }

      setButtonState(submitBtn, true, "Sending...");
      setStatus(statusMsg, "Submitting your booking...", "loading");

      try {
        await db.collection("bookings").add({
          name,
          song,
          eventDate: date,
          bookedBy: sessionStorage.getItem("userName") || null,
          submittedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        setStatus(statusMsg, "Thank you! Your booking has been received. I'll get back to you soon.", "success");
        bookingForm.reset();
        setTimeout(() => {
          if (statusMsg && statusMsg.textContent.includes("Thank you")) setStatus(statusMsg, "", "");
        }, 6000);
      } catch (err) {
        console.error("Booking error:", err);
        setStatus(statusMsg, "Something went wrong. Please try again later.", "error");
      } finally {
        setButtonState(submitBtn, false, null, "Send Booking Request");
      }
    });
  }

  // ---------- AUDITION ----------
  const auditionForm = document.getElementById("audition-form");
  if (auditionForm) {
    const statusMsg = document.getElementById("audition-status");
    const submitBtn = document.getElementById("aud-btn");

    auditionForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (submitBtn && submitBtn.disabled) return;

      const fullName = document.getElementById("aud-name").value.trim();
      const birthday = document.getElementById("aud-birthday").value;
      const city = document.getElementById("aud-city").value.trim();
      const phone = document.getElementById("aud-phone").value.trim();
      const email = document.getElementById("aud-email").value.trim();
      const style = document.getElementById("aud-style").value;
      const experience = document.getElementById("aud-experience").value;
      const song = document.getElementById("aud-song").value.trim();
      const why = document.getElementById("aud-why").value.trim();
      const link = document.getElementById("aud-link").value.trim();
      const weekend = document.getElementById("aud-weekend").checked;

      if (!fullName || !birthday || !city || !phone || !email || !style || !experience || !song || !why) {
        setStatus(statusMsg, "Please complete all required fields.", "error");
        return;
      }

      if (why.length < 20) {
        setStatus(statusMsg, "Please write a bit more in “Why JPRODUCTIONS?” (at least a couple of sentences).", "error");
        return;
      }

      setButtonState(submitBtn, true, "Submitting...");
      setStatus(statusMsg, "Sending your audition...", "loading");

      try {
        await db.collection("auditions").add({
          fullName,
          birthday,
          city,
          phone,
          email,
          style,
          experience,
          song,
          why,
          mediaLink: link || null,
          availableWeekends: weekend,
          status: "pending",
          submittedBy: sessionStorage.getItem("userName") || null,
          submittedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        setStatus(
          statusMsg,
          "Audition received. We’ll review and reach out if you’re shortlisted.",
          "success"
        );
        auditionForm.reset();
        setTimeout(() => {
          if (statusMsg && statusMsg.textContent.includes("Audition received")) {
            setStatus(statusMsg, "", "");
          }
        }, 8000);
      } catch (err) {
        console.error("Audition error:", err);
        setStatus(statusMsg, "Something went wrong. Please try again later.", "error");
      } finally {
        setButtonState(submitBtn, false, null, "Submit Audition");
      }
    });
  }
});
