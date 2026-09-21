const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI missing in .env.local");
  process.exit(1);
}

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    phone: String,
    password: { type: String, select: false },
    role: { type: String, enum: ["patient", "doctor", "admin"], default: "patient" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

const doctorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    name: String,
    email: String,
    phone: String,
    specialization: String,
    qualification: String,
    experience: String,
    consultationFee: Number,
    about: String,
    availability: [String],
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    appointmentDate: String,
    appointmentTime: String,
    reason: String,
    status: { type: String, default: "pending" },
    paymentStatus: { type: String, default: "paid" },
    consultationType: { type: String, default: "video" },
  },
  { timestamps: true }
);

const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);

const prescriptionSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    medicines: Array,
    instructions: String,
  },
  { timestamps: true }
);

const Prescription = mongoose.models.Prescription || mongoose.model("Prescription", prescriptionSchema);

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("[Seed] Connected to MongoDB Atlas");

    await User.deleteMany();
    await Doctor.deleteMany();
    await Appointment.deleteMany();
    await Prescription.deleteMany();

    console.log("Seeding Admin User...");
    await User.create({
      name: "MediCare Platform Admin",
      email: "admin@medicare.com",
      phone: "+1 800 555 0100",
      password: "adminpassword123",
      role: "admin",
    });

    console.log("Seeding Patient Users...");
    const patient1 = await User.create({
      name: "John Patient",
      email: "john.patient@gmail.com",
      phone: "+1 555 234 5678",
      password: "patientpassword123",
      role: "patient",
    });

    const patient2 = await User.create({
      name: "Jane Smith",
      email: "jane.patient@gmail.com",
      phone: "+1 555 876 5432",
      password: "patientpassword123",
      role: "patient",
    });

    console.log("Seeding Doctor Users...");
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
      about: "Senior General Physician specializing in preventive healthcare.",
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
      about: "Consultant Cardiologist with expertise in heart health and ECG diagnostics.",
      availability: ["Mon-Wed-Fri: 10:00 AM - 04:00 PM"],
      isVerified: true,
    });

    // Unverified Doctor for testing Admin Verification
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
      isVerified: false,
    });

    console.log("Seeding Appointments...");
    const appt1 = await Appointment.create({
      patientId: patient1._id,
      doctorId: docProfile1._id,
      appointmentDate: "2026-09-28",
      appointmentTime: "10:30 AM",
      reason: "Seasonal flu symptoms and persistent fever",
      consultationType: "video",
      status: "confirmed",
      paymentStatus: "paid",
    });

    const appt2 = await Appointment.create({
      patientId: patient2._id,
      doctorId: docProfile2._id,
      appointmentDate: "2026-10-02",
      appointmentTime: "02:00 PM",
      reason: "Routine cardiovascular checkup & blood pressure review",
      consultationType: "video",
      status: "confirmed",
      paymentStatus: "paid",
    });

    console.log("Seeding Digital Prescriptions...");
    await Prescription.create({
      patientId: patient1._id,
      doctorId: docProfile1._id,
      appointmentId: appt1._id,
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
      instructions: "Drink warm water and get plenty of rest.",
    });

    await Prescription.create({
      patientId: patient2._id,
      doctorId: docProfile2._id,
      appointmentId: appt2._id,
      medicines: [
        {
          name: "Atorvastatin",
          dosage: "10mg",
          frequency: "Once daily",
          duration: "30 days",
          instructions: "At bedtime with water",
        },
        {
          name: "Amlodipine",
          dosage: "5mg",
          frequency: "Once daily",
          duration: "30 days",
          instructions: "Morning after breakfast",
        },
      ],
      instructions: "Maintain low sodium diet and regular daily walking.",
    });

    console.log("==========================================");
    console.log("✅ Unified App Database Seeding Completed!");
    console.log("==========================================");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

seedData();
