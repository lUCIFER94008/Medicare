import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "MediCare – Quality Healthcare Anytime, Anywhere",
  description:
    "Connect with qualified doctors remotely through secure online consultations. Book appointments, receive digital prescriptions, and manage medical records.",
  keywords: "telemedicine, doctor consultation, online healthcare, digital prescription, medicare",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main style={{ minHeight: "calc(100vh - 76px - 400px)", flexGrow: 1 }}>
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
