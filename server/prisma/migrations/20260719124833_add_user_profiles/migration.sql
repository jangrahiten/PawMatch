-- CreateTable
CREATE TABLE "AdopterProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "housingType" TEXT,
    "hasChildren" BOOLEAN NOT NULL DEFAULT false,
    "hasOtherPets" BOOLEAN NOT NULL DEFAULT false,
    "preferredPet" TEXT,
    "preferredSize" TEXT,
    "preferredAge" TEXT,
    "petExperience" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdopterProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShelterProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shelterName" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShelterProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdopterProfile_userId_key" ON "AdopterProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ShelterProfile_userId_key" ON "ShelterProfile"("userId");

-- AddForeignKey
ALTER TABLE "AdopterProfile" ADD CONSTRAINT "AdopterProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShelterProfile" ADD CONSTRAINT "ShelterProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
