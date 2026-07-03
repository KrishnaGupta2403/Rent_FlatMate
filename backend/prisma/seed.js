const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Use standard mock bcrypt hashes for "password123"
const DUMMY_HASH = '$2b$10$EpJui0VBHxCqNs8p.w7j2eeJ2/yP2tF0CqFqK2W/lQ6kXv.O1jKOm';

async function main() {
  console.log('Start seeding...');

  // 1. Clean existing data in reverse order of relationships
  console.log('Cleaning existing data...');
  await prisma.refreshToken.deleteMany({});
  await prisma.emailLog.deleteMany({});
  await prisma.adminLog.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.savedListing.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.chat.deleteMany({});
  await prisma.interestRequest.deleteMany({});
  await prisma.compatibilityScore.deleteMany({});
  await prisma.listingAmenity.deleteMany({});
  await prisma.amenity.deleteMany({});
  await prisma.listingImage.deleteMany({});
  await prisma.listing.deleteMany({});
  await prisma.tenantProfile.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Amenities
  console.log('Creating amenities...');
  const wifi = await prisma.amenity.create({ data: { name: 'WiFi' } });
  const parking = await prisma.amenity.create({ data: { name: 'Parking' } });
  const ac = await prisma.amenity.create({ data: { name: 'AC' } });
  const kitchen = await prisma.amenity.create({ data: { name: 'Kitchen' } });
  const washer = await prisma.amenity.create({ data: { name: 'Washing Machine' } });
  const balcony = await prisma.amenity.create({ data: { name: 'Balcony' } });
  const lift = await prisma.amenity.create({ data: { name: 'Lift' } });

  // 3. Create Users
  console.log('Creating users...');
  // Owners
  const alice = await prisma.user.create({
    data: {
      fullName: 'Alice Owner',
      email: 'alice@owner.com',
      password: DUMMY_HASH,
      phone: '9876543210',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      role: 'OWNER',
      isVerified: true,
      isActive: true,
    },
  });

  const bob = await prisma.user.create({
    data: {
      fullName: 'Bob Owner',
      email: 'bob@owner.com',
      password: DUMMY_HASH,
      phone: '9876543211',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      role: 'OWNER',
      isVerified: true,
      isActive: true,
    },
  });

  // Tenants
  const charlie = await prisma.user.create({
    data: {
      fullName: 'Charlie Tenant',
      email: 'charlie@tenant.com',
      password: DUMMY_HASH,
      phone: '9876543212',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      role: 'TENANT',
      isVerified: true,
      isActive: true,
    },
  });

  const diana = await prisma.user.create({
    data: {
      fullName: 'Diana Tenant',
      email: 'diana@tenant.com',
      password: DUMMY_HASH,
      phone: '9876543213',
      profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
      role: 'TENANT',
      isVerified: true,
      isActive: true,
    },
  });

  // Admin
  const alex = await prisma.user.create({
    data: {
      fullName: 'Alex Admin',
      email: 'alex@admin.com',
      password: DUMMY_HASH,
      phone: '9876543214',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
      role: 'ADMIN',
      isVerified: true,
      isActive: true,
    },
  });

  // 4. Create Tenant Profiles
  console.log('Creating tenant profiles...');
  const charlieProfile = await prisma.tenantProfile.create({
    data: {
      userId: charlie.id,
      preferredLocation: 'Saket, South Delhi',
      minBudget: 15000,
      maxBudget: 25000,
      moveInDate: new Date('2026-08-01'),
      roomType: 'Single',
      furnishingPreference: 'Furnished',
      occupation: 'Student',
      gender: 'Male',
      bio: 'Looking for a quiet room near the university campus.',
    },
  });

  const dianaProfile = await prisma.tenantProfile.create({
    data: {
      userId: diana.id,
      preferredLocation: 'Andheri West, Mumbai',
      minBudget: 20000,
      maxBudget: 35000,
      moveInDate: new Date('2026-08-15'),
      roomType: 'Private',
      furnishingPreference: 'Semi-Furnished',
      occupation: 'Professional',
      gender: 'Female',
      bio: 'Software engineer moving to Mumbai for a new job. Prefers neat and tidy flats.',
    },
  });

  // 5. Create Listings
  console.log('Creating listings...');
  const listing1 = await prisma.listing.create({
    data: {
      ownerId: alice.id,
      title: 'Cozy Furnished Single Room in South Delhi',
      description: 'A private bedroom in a beautiful 3BHK flat. Close to metro and market.',
      location: 'Saket, South Delhi, Delhi',
      latitude: 28.5244,
      longitude: 77.2066,
      rent: 18000,
      securityDeposit: 18000,
      availableFrom: new Date('2026-07-15'),
      roomType: 'Single',
      furnishingStatus: 'Furnished',
      occupancy: 1,
      status: 'ACTIVE',
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      ownerId: bob.id,
      title: 'Spacious 1 BHK with Balcony',
      description: 'Stunning 1 BHK flat in a gated community with full amenities and parking space.',
      location: 'Andheri West, Mumbai, Maharashtra',
      latitude: 19.1136,
      longitude: 72.8697,
      rent: 30000,
      securityDeposit: 60000,
      availableFrom: new Date('2026-07-20'),
      roomType: 'Private',
      furnishingStatus: 'Semi-Furnished',
      occupancy: 2,
      status: 'ACTIVE',
    },
  });

  // 6. Create Listing Images
  console.log('Creating listing images...');
  await prisma.listingImage.createMany({
    data: [
      {
        listingId: listing1.id,
        imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af',
        isPrimary: true,
      },
      {
        listingId: listing1.id,
        imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c',
        isPrimary: false,
      },
      {
        listingId: listing2.id,
        imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
        isPrimary: true,
      },
    ],
  });

  // 7. Associate Amenities to Listings
  console.log('Associating amenities to listings...');
  await prisma.listingAmenity.createMany({
    data: [
      // Listing 1 has WiFi, AC, Kitchen
      { listingId: listing1.id, amenityId: wifi.id },
      { listingId: listing1.id, amenityId: ac.id },
      { listingId: listing1.id, amenityId: kitchen.id },
      // Listing 2 has WiFi, Parking, AC, Washing Machine, Balcony, Lift
      { listingId: listing2.id, amenityId: wifi.id },
      { listingId: listing2.id, amenityId: parking.id },
      { listingId: listing2.id, amenityId: ac.id },
      { listingId: listing2.id, amenityId: washer.id },
      { listingId: listing2.id, amenityId: balcony.id },
      { listingId: listing2.id, amenityId: lift.id },
    ],
  });

  // 8. Create Compatibility Scores
  console.log('Creating compatibility scores...');
  await prisma.compatibilityScore.create({
    data: {
      tenantId: charlie.id,
      listingId: listing1.id,
      score: 85,
      explanation: 'High match based on location preferences, student-friendly environment, and rent budget alignment.',
      generatedBy: 'AI',
    },
  });

  await prisma.compatibilityScore.create({
    data: {
      tenantId: diana.id,
      listingId: listing2.id,
      score: 92,
      explanation: 'Excellent match! Rent and security deposit align with user budget, location matches preference, and professional status matches owner criteria.',
      generatedBy: 'RULE_ENGINE',
    },
  });

  // 9. Create Interest Requests
  console.log('Creating interest requests...');
  await prisma.interestRequest.create({
    data: {
      tenantId: charlie.id,
      ownerId: alice.id,
      listingId: listing1.id,
      status: 'PENDING',
    },
  });

  await prisma.interestRequest.create({
    data: {
      tenantId: diana.id,
      ownerId: bob.id,
      listingId: listing2.id,
      status: 'ACCEPTED',
    },
  });

  // 10. Create Chats and Messages
  console.log('Creating chats and messages...');
  const chat1 = await prisma.chat.create({
    data: {
      listingId: listing1.id,
      ownerId: alice.id,
      tenantId: charlie.id,
    },
  });

  await prisma.message.create({
    data: {
      chatId: chat1.id,
      senderId: charlie.id,
      message: 'Hello Alice, is this single room still available for a visit next week?',
      messageType: 'TEXT',
      isRead: true,
    },
  });

  await prisma.message.create({
    data: {
      chatId: chat1.id,
      senderId: alice.id,
      message: 'Hi Charlie! Yes, it is. I can show you the room on Saturday afternoon. Does that work?',
      messageType: 'TEXT',
      isRead: false,
    },
  });

  // 11. Create Notifications
  console.log('Creating notifications...');
  await prisma.notification.create({
    data: {
      userId: alice.id,
      title: 'New Interest Request',
      message: 'Charlie Tenant has expressed interest in your listing "Cozy Furnished Single Room in South Delhi".',
      type: 'INTEREST',
    },
  });

  await prisma.notification.create({
    data: {
      userId: diana.id,
      title: 'Request Accepted',
      message: 'Bob Owner has accepted your request for the listing "Spacious 1 BHK with Balcony".',
      type: 'ACCEPTED',
    },
  });

  // 12. Create Saved Listings (Favorites)
  console.log('Creating saved listings...');
  await prisma.savedListing.create({
    data: {
      userId: charlie.id,
      listingId: listing1.id,
    },
  });

  await prisma.savedListing.create({
    data: {
      userId: diana.id,
      listingId: listing2.id,
    },
  });

  // 13. Create Reviews
  console.log('Creating reviews...');
  await prisma.review.create({
    data: {
      reviewerId: charlie.id,
      revieweeId: alice.id,
      rating: 5,
      review: 'Alice is incredibly friendly and welcoming! The apartment is clean and matches the pictures perfectly.',
    },
  });

  // 14. Create Admin Logs
  console.log('Creating admin logs...');
  await prisma.adminLog.create({
    data: {
      adminId: alex.id,
      action: 'APPROVED_LISTING',
      entity: 'listings',
      entityId: listing1.id,
    },
  });

  // 15. Create Email Logs
  console.log('Creating email logs...');
  await prisma.emailLog.create({
    data: {
      recipientEmail: 'charlie@tenant.com',
      subject: 'Your request is pending review',
      status: 'SENT',
    },
  });

  // 16. Create Refresh Tokens
  console.log('Creating refresh tokens...');
  await prisma.refreshToken.create({
    data: {
      userId: charlie.id,
      token: 'sample_refresh_token_charlie_12345',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
