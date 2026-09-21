const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI missing in .env.local");
  process.exit(1);
}

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    role: String,
  },
  { timestamps: true }
);

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
    isVerified: Boolean,
  },
  { timestamps: true }
);

const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);

async function syncDoctorProfiles() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("[Migration] Connected to MongoDB Atlas");

    const doctorUsers = await User.find({ role: "doctor" });
    console.log(`Found doctor users: ${doctorUsers.length}`);

    let createdCount = 0;
    let existingCount = 0;

    for (const dUser of doctorUsers) {
      const existingProfile = await Doctor.findOne({ userId: dUser._id });
      if (existingProfile) {
        existingCount++;
      } else {
        await Doctor.create({
          userId: dUser._id,
          name: dUser.name,
          email: dUser.email,
          phone: dUser.phone || "",
          specialization: "General Physician",
          qualification: "MBBS",
          experience: "1+ Yrs Exp.",
          consultationFee: 50,
          about: "Dedicated healthcare professional providing compassionate patient care.",
          availability: ["Mon-Fri: 09:00 AM - 05:00 PM"],
          isVerified: false,
        });
        createdCount++;
        console.log(`Created profile for doctor: ${dUser.name} (${dUser.email})`);
      }
    }

    console.log("==========================================");
    console.log(`Summary: Total Doctor Users: ${doctorUsers.length} | Existing Profiles: ${existingCount} | Created Profiles: ${createdCount}`);
    console.log("==========================================");
    process.exit(0);
  } catch (error) {
    console.error("Migration Error:", error);
    process.exit(1);
  }
}

syncDoctorProfiles();
