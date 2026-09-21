const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Doctor = require("./models/Doctor");
const Appointment = require("./models/Appointment");
const Prescription = require("./models/Prescription");
const connectDB = require("./config/db");

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log("Clearing existing sample data...");
    await User.deleteMany();
    await Doctor.deleteMany();
    await Appointment.deleteMany();
    await Prescription.deleteMany();

    console.log("Seeding Admin user...");
    const adminUser = await User.create({
      name: "MediCare Platform Admin",
      email: "admin@medicare.com",
      phone: "+1 800 555 0100",
      password: "adminpassword123",
      role: "admin",
    });

    console.log("Seeding Patients...");
    const patient1 = await User.create({
      name: "John Doe",
      email: "john.patient@gmail.com",
      phone: "+1 555 234 5678",
      password: "patientpassword123",
      role: "patient",
    });

    const patient2 = await User.create({
      name: "Alice Smith",
      email: "alice.patient@gmail.com",
      phone: "+1 555 876 5432",
      password: "patientpassword123",
      role: "patient",
    });

    console.log("Seeding Doctors...");
    const docUser1 = await User.create({
      name: "Dr. Sarah Johnson",
      email: "dr.sarah@medicare.com",
      phone: "+1 555 111 2222",
      password: "doctorpassword123",
      role: "doctor",
    });

    const docProfile1 = await Doctor.create({
      userId: docUser1._id,
      name: "Dr. Sarah Johnson",
      email: docUser1.email,
      phone: docUser1.phone,
      specialization: "General Physician",
      qualification: "MBBS, MD (Internal Medicine)",
      experience: "12+ Yrs Exp.",
      consultationFee: 45,
      about: "Senior General Physician specializing in preventive care and chronic disease management.",
      availability: ["Mon-Fri: 09:00 AM - 05:00 PM"],
      isVerified: true,
    });

    const docUser2 = await User.create({
      name: "Dr. Michael Thomas",
      email: "dr.michael@medicare.com",
      phone: "+1 555 333 4444",
      password: "doctorpassword123",
      role: "doctor",
    });

    const docProfile2 = await Doctor.create({
      userId: docUser2._id,
      name: "Dr. Michael Thomas",
      email: docUser2.email,
      phone: docUser2.phone,
      specialization: "Cardiologist",
      qualification: "MBBS, DM (Cardiology), FACC",
      experience: "15+ Yrs Exp.",
      consultationFee: 75,
      about: "Consultant Cardiologist with expertise in heart health, hypertension, and ECG diagnostics.",
      availability: ["Mon-Wed-Fri: 10:00 AM - 04:00 PM"],
      isVerified: true,
    });

    const docUser3 = await User.create({
      name: "Dr. Emily Wilson",
      email: "dr.emily@medicare.com",
      phone: "+1 555 666 7777",
      password: "doctorpassword123",
      role: "doctor",
    });

    const docProfile3 = await Doctor.create({
      userId: docUser3._id,
      name: "Dr. Emily Wilson",
      email: docUser3.email,
      phone: docUser3.phone,
      specialization: "Dermatologist",
      qualification: "MBBS, MD (Dermatology)",
      experience: "8+ Yrs Exp.",
      consultationFee: 55,
      about: "Specialist Dermatologist offering treatments for skin allergies, acne, and cosmetic dermatological advice.",
      availability: ["Tue-Thu-Sat: 11:00 AM - 06:00 PM"],
      isVerified: true,
    });

    // Unverified Doctor for testing Admin verification
    const docUserNew = await User.create({
      name: "Dr. Robert Vance",
      email: "dr.robert@medicare.com",
      phone: "+1 555 999 0000",
      password: "doctorpassword123",
      role: "doctor",
    });

    await Doctor.create({
      userId: docUserNew._id,
      name: "Dr. Robert Vance",
      email: docUserNew.email,
      phone: docUserNew.phone,
      specialization: "Neurologist",
      qualification: "MBBS, DM (Neurology)",
      experience: "6+ Yrs Exp.",
      consultationFee: 80,
      about: "Neurologist treating headaches, migraines, and neuro-functional disorders.",
      availability: ["Mon-Fri: 02:00 PM - 07:00 PM"],
      isVerified: false, // Pending verification
    });

    console.log("Seeding Appointments...");
    const appointment1 = await Appointment.create({
      patientId: patient1._id,
      doctorId: docProfile1._id,
      appointmentDate: "2026-09-25",
      appointmentTime: "10:30 AM",
      reason: "Seasonal flu symptoms and persistent cough",
      consultationType: "video",
      status: "confirmed",
      paymentStatus: "paid",
    });

    console.log("Seeding Prescriptions...");
    await Prescription.create({
      patientId: patient1._id,
      doctorId: docProfile1._id,
      appointmentId: appointment1._id,
      medicines: [
        {
          name: "Amoxicillin",
          dosage: "500mg",
          frequency: "Twice daily",
          duration: "5 days",
          instructions: "After breakfast and dinner",
        },
        {
          name: "Paracetamol",
          dosage: "650mg",
          frequency: "Thrice daily",
          duration: "3 days",
          instructions: "When fever exceeds 100 F",
        },
      ],
      instructions: "Drink plenty of warm fluids and maintain bed rest.",
      notes: "Follow up in 5 days if cough persists.",
    });

    console.log("==========================================");
    console.log("✅ Database Seeding Completed Successfully!");
    console.log("==========================================");
    console.log("Demo Credentials:");
    console.log("Admin:   admin@medicare.com / adminpassword123");
    console.log("Doctor:  dr.sarah@medicare.com / doctorpassword123");
    console.log("Patient: john.patient@gmail.com / patientpassword123");
    console.log("==========================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

seedData();
