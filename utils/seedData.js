// utils/seedData.js
// Populates the database with realistic sample data so the app is usable
// immediately after setup: 3 stations, a connected navigation graph for
// each, facilities, and one bootstrap admin account.
//
// Run with: npm run seed
// Safe to re-run — it wipes and recreates only the collections it touches.

const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("../config/db");
const Station = require("../models/Station");
const Location = require("../models/Location");
const RouteEdge = require("../models/RouteEdge");
const Facility = require("../models/Facility");
const Admin = require("../models/Admin");

// Defines one station's locations, its walkable edges, and its facilities.
// Edge distances/instructions are illustrative, not real GPS measurements.
const stationBlueprints = [
  {
    name: "New Delhi",
    code: "NDLS",
    city: "New Delhi",
    locations: [
      { name: "Main Exit", type: "exit" },
      { name: "Booking Counter", type: "booking_counter" },
      { name: "Waiting Hall", type: "waiting_hall" },
      { name: "Escalator A", type: "escalator" },
      { name: "Foot Over Bridge", type: "foot_over_bridge" },
      { name: "Platform 1", type: "platform" },
      { name: "Platform 4", type: "platform" },
      { name: "Platform 6", type: "platform" },
      { name: "Food Court", type: "food_court" },
      { name: "Lift A", type: "lift" },
      { name: "VIP Lounge", type: "vip_lounge" },
      { name: "Parking", type: "parking" },
    ],
    edges: [
      ["Main Exit", "Booking Counter", 40, "Walk straight for 40 meters"],
      ["Booking Counter", "Waiting Hall", 60, "Continue straight past the booking counters"],
      ["Waiting Hall", "Escalator A", 30, "Turn right towards the escalators"],
      ["Escalator A", "Foot Over Bridge", 20, "Take Escalator A up to the foot over bridge"],
      ["Foot Over Bridge", "Platform 1", 80, "Cross the foot over bridge and descend to Platform 1"],
      ["Foot Over Bridge", "Platform 4", 150, "Cross the foot over bridge, continue to Platform 4"],
      ["Foot Over Bridge", "Platform 6", 220, "Cross the foot over bridge, continue further to Platform 6"],
      ["Waiting Hall", "Food Court", 50, "Turn left towards the Food Court"],
      ["Waiting Hall", "Lift A", 35, "Head to Lift A near the waiting hall"],
      ["Lift A", "Platform 1", 90, "Take Lift A down and walk to Platform 1"],
      ["Waiting Hall", "VIP Lounge", 45, "VIP Lounge is adjacent to the Waiting Hall"],
      ["Main Exit", "Parking", 60, "Parking is directly outside the Main Exit"],
    ],
    facilities: [
      ["Washroom", "hygiene", "Near Waiting Hall, opposite Food Court"],
      ["ATM", "finance", "Beside Booking Counter"],
      ["Medical Room", "medical", "Near Platform 1 entrance"],
      ["Book Stall", "shopping", "Inside Waiting Hall"],
      ["Retiring Room", "waiting", "Near VIP Lounge"],
      ["Police Help Desk", "security", "Near Main Exit"],
      ["Wheelchair Assistance", "assistance", "Available at Main Exit and Lift A"],
      ["Charging Point", "other", "Waiting Hall, near seating rows"],
    ],
  },
  {
    name: "Bengaluru",
    code: "SBC",
    city: "Bengaluru",
    locations: [
      { name: "Main Exit", type: "exit" },
      { name: "Metro Entrance", type: "metro" },
      { name: "Waiting Hall", type: "waiting_hall" },
      { name: "Escalator A", type: "escalator" },
      { name: "Escalator B", type: "escalator" },
      { name: "Foot Over Bridge", type: "foot_over_bridge" },
      { name: "Platform 2", type: "platform" },
      { name: "Platform 5", type: "platform" },
      { name: "Platform 8", type: "platform" },
      { name: "Food Court", type: "food_court" },
      { name: "Parcel Office", type: "parcel_office" },
      { name: "Taxi Stand", type: "taxi_stand" },
    ],
    edges: [
      ["Main Exit", "Metro Entrance", 25, "Metro Entrance is right beside the Main Exit"],
      ["Main Exit", "Waiting Hall", 55, "Walk straight into the Waiting Hall"],
      ["Waiting Hall", "Escalator A", 40, "Take a right turn to Escalator A"],
      ["Waiting Hall", "Escalator B", 65, "Escalator B is further ahead on the left"],
      ["Escalator A", "Foot Over Bridge", 15, "Escalator A leads directly to the Foot Over Bridge"],
      ["Foot Over Bridge", "Platform 2", 70, "Descend from the bridge to Platform 2"],
      ["Foot Over Bridge", "Platform 5", 160, "Continue along the bridge to Platform 5"],
      ["Escalator B", "Platform 8", 180, "Take Escalator B down towards Platform 8"],
      ["Waiting Hall", "Food Court", 45, "Food Court is opposite the main seating area"],
      ["Waiting Hall", "Parcel Office", 50, "Parcel Office is near the north wall"],
      ["Main Exit", "Taxi Stand", 30, "Taxi Stand is just outside Main Exit"],
    ],
    facilities: [
      ["Washroom", "hygiene", "Near Escalator A"],
      ["ATM", "finance", "Near Main Exit"],
      ["Restaurant", "food", "Upper level, above Food Court"],
      ["Lost and Found Office", "assistance", "Near Waiting Hall entrance"],
      ["Water Booth", "hygiene", "Platform 2 and Platform 5 entrances"],
      ["Ticket Counter", "finance", "Near Main Exit"],
      ["Bus Stand", "transport", "Adjacent to Taxi Stand"],
    ],
  },
  {
    name: "Kanpur Central",
    code: "CNB",
    city: "Kanpur",
    locations: [
      { name: "Main Exit", type: "exit" },
      { name: "North Exit", type: "exit" },
      { name: "South Exit", type: "exit" },
      { name: "Waiting Hall", type: "waiting_hall" },
      { name: "Army Waiting Room", type: "army_lounge" },
      { name: "Escalator A", type: "escalator" },
      { name: "Foot Over Bridge", type: "foot_over_bridge" },
      { name: "Platform 1", type: "platform" },
      { name: "Platform 3", type: "platform" },
      { name: "Platform 9", type: "platform" },
      { name: "Lift B", type: "lift" },
      { name: "Booking Counter", type: "booking_counter" },
    ],
    edges: [
      ["Main Exit", "Booking Counter", 35, "Walk straight for 35 meters to the Booking Counter"],
      ["Booking Counter", "Waiting Hall", 50, "Continue ahead into the Waiting Hall"],
      ["Waiting Hall", "Army Waiting Room", 30, "Army Waiting Room is on the immediate left"],
      ["Waiting Hall", "Escalator A", 45, "Turn right towards Escalator A"],
      ["Escalator A", "Foot Over Bridge", 20, "Take Escalator A up to the bridge"],
      ["Foot Over Bridge", "Platform 1", 60, "Descend to Platform 1 from the bridge"],
      ["Foot Over Bridge", "Platform 3", 140, "Continue on the bridge to reach Platform 3"],
      ["Foot Over Bridge", "Platform 9", 260, "Walk the full length of the bridge to Platform 9"],
      ["Waiting Hall", "Lift B", 40, "Lift B is near the north corridor"],
      ["Lift B", "Platform 3", 100, "Take Lift B down and walk to Platform 3"],
      ["Waiting Hall", "North Exit", 70, "North Exit is beyond the Army Waiting Room"],
      ["Waiting Hall", "South Exit", 75, "South Exit is on the opposite side"],
    ],
    facilities: [
      ["Washroom", "hygiene", "Near Waiting Hall"],
      ["Medical Room", "medical", "Near Platform 1"],
      ["Army Transit Room", "waiting", "Adjacent to Waiting Hall"],
      ["Charging Point", "other", "Foot Over Bridge entrance"],
      ["Ticket Counter", "finance", "Near Main Exit"],
      ["Police Help Desk", "security", "Near North Exit"],
    ],
  },
];

const ADMIN_NAME = "RailNav Admin";

const seed = async () => {
  await connectDB();

  console.log("Clearing existing station-related data...");
  await Promise.all([
    Station.deleteMany({}),
    Location.deleteMany({}),
    RouteEdge.deleteMany({}),
    Facility.deleteMany({}),
  ]);

  for (const blueprint of stationBlueprints) {
    console.log(`Seeding ${blueprint.name}...`);

    const station = await Station.create({
      name: blueprint.name,
      code: blueprint.code,
      city: blueprint.city,
    });

    // Insert locations and keep a name -> _id lookup for building edges
    const locationDocs = await Location.insertMany(
      blueprint.locations.map((loc) => ({ ...loc, station: station._id }))
    );
    const locByName = {};
    locationDocs.forEach((l) => (locByName[l.name] = l._id));

    // Insert edges
    const edgeDocs = blueprint.edges.map(([from, to, distanceMeters, instruction]) => ({
      station: station._id,
      from: locByName[from],
      to: locByName[to],
      distanceMeters,
      instruction,
      bidirectional: true,
    }));
    await RouteEdge.insertMany(edgeDocs);

    // Insert facilities
    const facilityDocs = blueprint.facilities.map(([name, category, locationDescription]) => ({
      station: station._id,
      name,
      category,
      locationDescription,
    }));
    await Facility.insertMany(facilityDocs);
  }

  // Bootstrap admin account (only if one doesn't already exist)
  const adminEmail = process.env.ADMIN_EMAIL || "admin@railnav.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";

  const existingAdmin = await Admin.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await Admin.create({ name: ADMIN_NAME, email: adminEmail, password: adminPassword });
    console.log(`Admin account created -> email: ${adminEmail} / password: ${adminPassword}`);
  } else {
    console.log("Admin account already exists, skipping.");
  }

  console.log("Seeding complete ✅");
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
