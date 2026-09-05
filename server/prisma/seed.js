import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/config/prisma.js";

const DEMO_PASSWORD =
  process.env.DEMO_PASSWORD || "PawMatchDemo@123";

async function createPetIfMissing(ownerId, pet) {
  const existingPet = await prisma.pet.findFirst({
    where: {
      ownerId,
      name: pet.name,
      breed: pet.breed,
    },
  });

  if (existingPet) {
    console.log(`⚠️  ${pet.name} already exists`);
    return existingPet;
  }

  const createdPet = await prisma.pet.create({
    data: {
      ...pet,
      ownerId,
    },
  });

  console.log(`🐾 Created pet: ${createdPet.name}`);

  return createdPet;
}

async function main() {
  console.log("🌱 Starting PawMatch database seed...");

  // ---------------------------------------------------
  // HASH DEMO PASSWORD
  // ---------------------------------------------------

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  // ---------------------------------------------------
  // DEMO SHELTER
  // ---------------------------------------------------

  const shelter = await prisma.user.upsert({
    where: {
      email: "shelter@pawmatch.demo",
    },

    update: {
      name: "Happy Paws Shelter",
      password: hashedPassword,
      role: "SHELTER",
      city: "Delhi",
    },

    create: {
      name: "Happy Paws Shelter",
      email: "shelter@pawmatch.demo",
      password: hashedPassword,
      role: "SHELTER",
      city: "Delhi",
    },
  });

  console.log(`🏠 Demo shelter ready: ${shelter.email}`);

  // ---------------------------------------------------
  // SHELTER PROFILE
  // ---------------------------------------------------

  await prisma.shelterProfile.upsert({
    where: {
      userId: shelter.id,
    },

    update: {
      shelterName: "Happy Paws Shelter",
      description:
        "A Delhi-based rescue shelter helping abandoned and rescued animals find loving forever homes.",
      address: "New Delhi, Delhi",
      phone: "9876543210",
      website: "",
    },

    create: {
      userId: shelter.id,
      shelterName: "Happy Paws Shelter",
      description:
        "A Delhi-based rescue shelter helping abandoned and rescued animals find loving forever homes.",
      address: "New Delhi, Delhi",
      phone: "9876543210",
      website: "",
    },
  });

  // ---------------------------------------------------
  // DEMO ADOPTER
  // ---------------------------------------------------

  const adopter = await prisma.user.upsert({
    where: {
      email: "adopter@pawmatch.demo",
    },

    update: {
      name: "Demo Adopter",
      password: hashedPassword,
      role: "ADOPTER",
      city: "Delhi",
    },

    create: {
      name: "Demo Adopter",
      email: "adopter@pawmatch.demo",
      password: hashedPassword,
      role: "ADOPTER",
      city: "Delhi",
    },
  });

  console.log(`👤 Demo adopter ready: ${adopter.email}`);

  // ---------------------------------------------------
  // ADOPTER PROFILE
  // ---------------------------------------------------

  await prisma.adopterProfile.upsert({
    where: {
      userId: adopter.id,
    },

    update: {
      bio: "Animal lover looking to adopt a friendly companion.",
      housingType: "Apartment",
      hasChildren: false,
      hasOtherPets: false,
      preferredPet: "DOG",
      preferredSize: "MEDIUM",
      preferredAge: "1-5 years",
      petExperience:
        "Have previously taken care of dogs belonging to friends and family.",
    },

    create: {
      userId: adopter.id,
      bio: "Animal lover looking to adopt a friendly companion.",
      housingType: "Apartment",
      hasChildren: false,
      hasOtherPets: false,
      preferredPet: "DOG",
      preferredSize: "MEDIUM",
      preferredAge: "1-5 years",
      petExperience:
        "Have previously taken care of dogs belonging to friends and family.",
    },
  });

  // ---------------------------------------------------
  // DEMO PETS
  // ---------------------------------------------------

  const pets = [
    {
      name: "Bruno",
      animalType: "DOG",
      breed: "Labrador Retriever",
      age: 3,
      gender: "MALE",
      size: "LARGE",
      description:
        "Bruno is a friendly and energetic Labrador who loves people, walks, and playing outdoors. He would do well with an active family.",
      city: "Delhi",
      vaccinated: true,
      neutered: true,
      goodWithChildren: true,
      goodWithPets: true,
      status: "AVAILABLE",
    },

    {
      name: "Luna",
      animalType: "DOG",
      breed: "Golden Retriever",
      age: 2,
      gender: "FEMALE",
      size: "LARGE",
      description:
        "Luna is gentle, affectionate, and loves being around people. She enjoys long walks and is extremely friendly with children.",
      city: "Delhi",
      vaccinated: true,
      neutered: true,
      goodWithChildren: true,
      goodWithPets: true,
      status: "AVAILABLE",
    },

    {
      name: "Milo",
      animalType: "DOG",
      breed: "Indian Pariah",
      age: 1,
      gender: "MALE",
      size: "MEDIUM",
      description:
        "Milo is a smart and playful young Indie who was rescued from the streets. He is curious, affectionate, and quick to learn.",
      city: "Gurugram",
      vaccinated: true,
      neutered: false,
      goodWithChildren: true,
      goodWithPets: true,
      status: "AVAILABLE",
    },

    {
      name: "Coco",
      animalType: "DOG",
      breed: "Beagle",
      age: 4,
      gender: "FEMALE",
      size: "MEDIUM",
      description:
        "Coco is a sweet Beagle with a calm personality. She loves attention, treats, and relaxed evening walks.",
      city: "Noida",
      vaccinated: true,
      neutered: true,
      goodWithChildren: true,
      goodWithPets: false,
      status: "AVAILABLE",
    },

    {
      name: "Simba",
      animalType: "CAT",
      breed: "Domestic Shorthair",
      age: 2,
      gender: "MALE",
      size: "SMALL",
      description:
        "Simba is an independent but affectionate cat who enjoys sunny windows, naps, and gentle attention.",
      city: "Delhi",
      vaccinated: true,
      neutered: true,
      goodWithChildren: true,
      goodWithPets: false,
      status: "AVAILABLE",
    },

    {
      name: "Bella",
      animalType: "DOG",
      breed: "German Shepherd",
      age: 3,
      gender: "FEMALE",
      size: "LARGE",
      description:
        "Bella is intelligent, loyal, and active. She would be perfect for an experienced adopter who can provide regular exercise and training.",
      city: "Gurugram",
      vaccinated: true,
      neutered: true,
      goodWithChildren: true,
      goodWithPets: true,
      status: "AVAILABLE",
    },
  ];

  const createdPets = [];

  for (const pet of pets) {
    const createdPet = await createPetIfMissing(
      shelter.id,
      pet
    );

    createdPets.push(createdPet);
  }

  console.log("");
  console.log("✅ PawMatch seed completed successfully!");
  console.log("");
  console.log("----------------------------------------");
  console.log("DEMO ACCOUNTS");
  console.log("----------------------------------------");
  console.log("");
  console.log("Shelter:");
  console.log("Email: shelter@pawmatch.demo");
  console.log(`Password: ${DEMO_PASSWORD}`);
  console.log("");
  console.log("Adopter:");
  console.log("Email: adopter@pawmatch.demo");
  console.log(`Password: ${DEMO_PASSWORD}`);
  console.log("");
  console.log(`Created/verified ${createdPets.length} demo pets.`);
  console.log("----------------------------------------");
}

main()
  .catch((error) => {
    console.error("❌ Error while seeding database:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });