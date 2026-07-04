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
  const gym = await prisma.amenity.create({ data: { name: 'Gym' } });

  // 3. Create Users
  console.log('Creating users...');
  
  // 4 Owners
  const alice = await prisma.user.create({
    data: {
      fullName: 'Alice Sharma',
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
      fullName: 'Bob Fernandes',
      email: 'bob@owner.com',
      password: DUMMY_HASH,
      phone: '9876543211',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      role: 'OWNER',
      isVerified: true,
      isActive: true,
    },
  });

  const david = await prisma.user.create({
    data: {
      fullName: 'David Miller',
      email: 'david@owner.com',
      password: DUMMY_HASH,
      phone: '9876543215',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      role: 'OWNER',
      isVerified: true,
      isActive: true,
    },
  });

  const emily = await prisma.user.create({
    data: {
      fullName: 'Emily Watson',
      email: 'emily@owner.com',
      password: DUMMY_HASH,
      phone: '9876543216',
      profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
      role: 'OWNER',
      isVerified: true,
      isActive: true,
    },
  });

  // 2 Tenants
  const charlie = await prisma.user.create({
    data: {
      fullName: 'Charlie Kumar',
      email: 'charlie@tenant.com',
      password: DUMMY_HASH,
      phone: '9876543212',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      role: 'TENANT',
      isVerified: true,
      isActive: true,
    },
  });

  const diana = await prisma.user.create({
    data: {
      fullName: 'Diana Sen',
      email: 'diana@tenant.com',
      password: DUMMY_HASH,
      phone: '9876543213',
      profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
      role: 'TENANT',
      isVerified: true,
      isActive: true,
    },
  });

  // 1 Admin
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
      minBudget: 10000,
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
      preferredLocation: 'Bandra West, Mumbai',
      minBudget: 20000,
      maxBudget: 40000,
      moveInDate: new Date('2026-08-15'),
      roomType: 'Private',
      furnishingPreference: 'Semi-Furnished',
      occupation: 'Professional',
      gender: 'Female',
      bio: 'Software engineer moving to Mumbai. Prefers clean and modern flats.',
    },
  });

  // 5. Create 16 Room Listings (4 per owner)
  console.log('Creating 16 room listings...');

  // --- Alice's Listings ---
  const a1 = await prisma.listing.create({
    data: {
      ownerId: alice.id,
      title: 'Cozy Private Bedroom in Bandra West',
      description: 'A beautiful private bedroom in a renovated 3BHK apartment in Bandra. High-speed WiFi and friendly flatmates.',
      location: 'Bandra West, Mumbai, Maharashtra',
      latitude: 19.0607,
      longitude: 72.8258,
      rent: 28000,
      securityDeposit: 70000,
      availableFrom: new Date('2026-08-01'),
      roomType: 'Private',
      furnishingStatus: 'Furnished',
      occupancy: 1,
      status: 'ACTIVE',
    },
  });

  const a2 = await prisma.listing.create({
    data: {
      ownerId: alice.id,
      title: 'Chic Minimalist Studio near Juhu Beach',
      description: 'Stunning fully furnished studio apartment with sea view, modern kitchen, and full security. Ideal for working professionals.',
      location: 'Juhu, Mumbai, Maharashtra',
      latitude: 19.0988,
      longitude: 72.8264,
      rent: 32000,
      securityDeposit: 90000,
      availableFrom: new Date('2026-07-25'),
      roomType: 'Private',
      furnishingStatus: 'Furnished',
      occupancy: 1,
      status: 'ACTIVE',
    },
  });

  const a3 = await prisma.listing.create({
    data: {
      ownerId: alice.id,
      title: 'Spacious Shared Room in Andheri East',
      description: 'Double sharing room in a clean, spacious 2BHK flat. Close to metro station and business parks.',
      location: 'Andheri East, Mumbai, Maharashtra',
      latitude: 19.1158,
      longitude: 72.8727,
      rent: 15000,
      securityDeposit: 30000,
      availableFrom: new Date('2026-08-10'),
      roomType: 'Shared',
      furnishingStatus: 'Semi-Furnished',
      occupancy: 2,
      status: 'ACTIVE',
    },
  });

  const a4 = await prisma.listing.create({
    data: {
      ownerId: alice.id,
      title: 'Premium Master Bed in Powai Penthouse',
      description: 'Ensuite master bedroom in a luxurious penthouse. Beautiful lake view, AC, and daily cleaning included.',
      location: 'Powai, Mumbai, Maharashtra',
      latitude: 19.1176,
      longitude: 72.9060,
      rent: 38000,
      securityDeposit: 100000,
      availableFrom: new Date('2026-08-01'),
      roomType: 'Private',
      furnishingStatus: 'Furnished',
      occupancy: 1,
      status: 'ACTIVE',
    },
  });

  // --- Bob's Listings ---
  const b1 = await prisma.listing.create({
    data: {
      ownerId: bob.id,
      title: 'Elegant 1 BHK near Koramangala 5th Block',
      description: 'Charming standalone 1BHK apartment located in a quiet lane in Koramangala. Walking distance to popular cafes and gyms.',
      location: 'Koramangala, Bangalore, Karnataka',
      latitude: 12.9352,
      longitude: 77.6244,
      rent: 24000,
      securityDeposit: 60000,
      availableFrom: new Date('2026-07-20'),
      roomType: 'Private',
      furnishingStatus: 'Furnished',
      occupancy: 2,
      status: 'ACTIVE',
    },
  });

  const b2 = await prisma.listing.create({
    data: {
      ownerId: bob.id,
      title: 'Modern Single Room in Indiranagar',
      description: 'Private single room in a cozy independent house. Centrally located with easy access to metro, restaurants, and shopping.',
      location: 'Indiranagar, Bangalore, Karnataka',
      latitude: 12.9719,
      longitude: 77.6412,
      rent: 20000,
      securityDeposit: 50000,
      availableFrom: new Date('2026-08-01'),
      roomType: 'Single',
      furnishingStatus: 'Furnished',
      occupancy: 1,
      status: 'ACTIVE',
    },
  });

  const b3 = await prisma.listing.create({
    data: {
      ownerId: bob.id,
      title: 'Shared Flatmate Room near HSR Layout',
      description: 'Shared room in a modern 3BHK flat occupied by IT professionals. Looking for a neat and friendly roommate.',
      location: 'HSR Layout, Bangalore, Karnataka',
      latitude: 12.9141,
      longitude: 77.6411,
      rent: 13000,
      securityDeposit: 30000,
      availableFrom: new Date('2026-08-05'),
      roomType: 'Shared',
      furnishingStatus: 'Semi-Furnished',
      occupancy: 2,
      status: 'ACTIVE',
    },
  });

  const b4 = await prisma.listing.create({
    data: {
      ownerId: bob.id,
      title: 'Bright Studio near Whitefield Tech Park',
      description: 'Unfurnished studio room with large windows, attached bath, and kitchen counter. Best budget option for freshers.',
      location: 'Whitefield, Bangalore, Karnataka',
      latitude: 12.9698,
      longitude: 77.7500,
      rent: 18000,
      securityDeposit: 40000,
      availableFrom: new Date('2026-07-30'),
      roomType: 'Private',
      furnishingStatus: 'Unfurnished',
      occupancy: 1,
      status: 'ACTIVE',
    },
  });

  // --- David's Listings ---
  const d1 = await prisma.listing.create({
    data: {
      ownerId: david.id,
      title: 'Cozy Furnished Single Room in Saket',
      description: 'Private bedroom with single bed, desk, and wardrobe. Shared kitchen and bathroom. Located close to Saket Metro Station.',
      location: 'Saket, South Delhi, Delhi',
      latitude: 28.5244,
      longitude: 77.2066,
      rent: 18000,
      securityDeposit: 18000,
      availableFrom: new Date('2026-08-01'),
      roomType: 'Single',
      furnishingStatus: 'Furnished',
      occupancy: 1,
      status: 'ACTIVE',
    },
  });

  const d2 = await prisma.listing.create({
    data: {
      ownerId: david.id,
      title: 'Spacious 1 BHK with Balcony in GK-2',
      description: 'Spacious semi-furnished apartment in a safe gated block. Comes with large modular kitchen and balcony.',
      location: 'Greater Kailash, New Delhi, Delhi',
      latitude: 28.5282,
      longitude: 77.2478,
      rent: 30000,
      securityDeposit: 60000,
      availableFrom: new Date('2026-08-15'),
      roomType: 'Private',
      furnishingStatus: 'Semi-Furnished',
      occupancy: 2,
      status: 'ACTIVE',
    },
  });

  const d3 = await prisma.listing.create({
    data: {
      ownerId: david.id,
      title: 'Modern Room near DU North Campus',
      description: 'Ideal room for students. High speed internet, laundry facilities, and study area. Meals available on demand.',
      location: 'GTB Nagar, North Delhi, Delhi',
      latitude: 28.6942,
      longitude: 77.2084,
      rent: 12000,
      securityDeposit: 12000,
      availableFrom: new Date('2026-07-28'),
      roomType: 'Single',
      furnishingStatus: 'Furnished',
      occupancy: 1,
      status: 'ACTIVE',
    },
  });

  const d4 = await prisma.listing.create({
    data: {
      ownerId: david.id,
      title: 'Shared Flat Room in Karol Bagh',
      description: 'Sharing accommodation in a quiet residential building. Includes basic amenities like water filter and fridge.',
      location: 'Karol Bagh, New Delhi, Delhi',
      latitude: 28.6443,
      longitude: 77.1903,
      rent: 10000,
      securityDeposit: 10000,
      availableFrom: new Date('2026-08-01'),
      roomType: 'Shared',
      furnishingStatus: 'Semi-Furnished',
      occupancy: 2,
      status: 'ACTIVE',
    },
  });

  // --- Emily's Listings ---
  const e1 = await prisma.listing.create({
    data: {
      ownerId: emily.id,
      title: 'Beautiful Attic Room in Koregaon Park',
      description: 'Charming and artistic attic room in the heart of Koregaon Park. Wooden flooring, plenty of natural light, and green surroundings.',
      location: 'Koregaon Park, Pune, Maharashtra',
      latitude: 18.5362,
      longitude: 73.8940,
      rent: 22000,
      securityDeposit: 50000,
      availableFrom: new Date('2026-08-01'),
      roomType: 'Single',
      furnishingStatus: 'Furnished',
      occupancy: 1,
      status: 'ACTIVE',
    },
  });

  const e2 = await prisma.listing.create({
    data: {
      ownerId: emily.id,
      title: 'Vibrant Urban Studio in Viman Nagar',
      description: 'Cozy fully furnished studio flat. Perfect for working professionals in local IT hubs. 24x7 security and power backup.',
      location: 'Viman Nagar, Pune, Maharashtra',
      latitude: 18.5679,
      longitude: 73.9143,
      rent: 19000,
      securityDeposit: 40000,
      availableFrom: new Date('2026-08-10'),
      roomType: 'Private',
      furnishingStatus: 'Furnished',
      occupancy: 1,
      status: 'ACTIVE',
    },
  });

  const e3 = await prisma.listing.create({
    data: {
      ownerId: emily.id,
      title: 'Shared Apartment Room near Hinjewadi IT Phase 1',
      description: 'Double sharing bedroom in a spacious 3BHK flat. Looking for a neat flatmate to share rent and bills.',
      location: 'Hinjewadi, Pune, Maharashtra',
      latitude: 18.5913,
      longitude: 73.7386,
      rent: 11000,
      securityDeposit: 22000,
      availableFrom: new Date('2026-07-25'),
      roomType: 'Shared',
      furnishingStatus: 'Semi-Furnished',
      occupancy: 2,
      status: 'ACTIVE',
    },
  });

  const e4 = await prisma.listing.create({
    data: {
      ownerId: emily.id,
      title: 'Sunny Master Bedroom in Kalyani Nagar',
      description: 'Bright master bedroom with large private balcony. Attached bathroom with bathtub. Modern complex with swimming pool.',
      location: 'Kalyani Nagar, Pune, Maharashtra',
      latitude: 18.5463,
      longitude: 73.9038,
      rent: 26000,
      securityDeposit: 60000,
      availableFrom: new Date('2026-08-01'),
      roomType: 'Private',
      furnishingStatus: 'Furnished',
      occupancy: 1,
      status: 'ACTIVE',
    },
  });

  // 6. Create Listing Images using High-Quality interior photos
  console.log('Creating listing images...');
  await prisma.listingImage.createMany({
    data: [
      // Alice's Images
      { listingId: a1.id, imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af', isPrimary: true },
      { listingId: a2.id, imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', isPrimary: true },
      { listingId: a3.id, imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace', isPrimary: true },
      { listingId: a4.id, imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c', isPrimary: true },
      
      // Bob's Images
      { listingId: b1.id, imageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511', isPrimary: true },
      { listingId: b2.id, imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2', isPrimary: true },
      { listingId: b3.id, imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7', isPrimary: true },
      { listingId: b4.id, imageUrl: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0', isPrimary: true },
      
      // David's Images
      { listingId: d1.id, imageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0', isPrimary: true },
      { listingId: d2.id, imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0', isPrimary: true },
      { listingId: d3.id, imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c', isPrimary: true },
      { listingId: d4.id, imageUrl: 'https://images.unsplash.com/photo-1560448204-887f30f55556', isPrimary: true },
      
      // Emily's Images
      { listingId: e1.id, imageUrl: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea', isPrimary: true },
      { listingId: e2.id, imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f', isPrimary: true },
      { listingId: e3.id, imageUrl: 'https://images.unsplash.com/photo-1502672023488-70e25813eb80', isPrimary: true },
      { listingId: e4.id, imageUrl: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9', isPrimary: true }
    ],
  });

  // 7. Associate Amenities to Listings
  console.log('Associating amenities to listings...');
  const listingsList = [a1, a2, a3, a4, b1, b2, b3, b4, d1, d2, d3, d4, e1, e2, e3, e4];
  
  const listingAmenitiesData = [];
  listingsList.forEach((lst, index) => {
    // Add WiFi to all
    listingAmenitiesData.push({ listingId: lst.id, amenityId: wifi.id });
    
    // Mix and match other amenities
    if (index % 2 === 0) {
      listingAmenitiesData.push({ listingId: lst.id, amenityId: ac.id });
      listingAmenitiesData.push({ listingId: lst.id, amenityId: kitchen.id });
    } else {
      listingAmenitiesData.push({ listingId: lst.id, amenityId: parking.id });
      listingAmenitiesData.push({ listingId: lst.id, amenityId: washer.id });
    }
    
    if (index % 3 === 0) {
      listingAmenitiesData.push({ listingId: lst.id, amenityId: balcony.id });
    }
    if (index % 4 === 0) {
      listingAmenitiesData.push({ listingId: lst.id, amenityId: lift.id });
      listingAmenitiesData.push({ listingId: lst.id, amenityId: gym.id });
    }
  });

  await prisma.listingAmenity.createMany({
    data: listingAmenitiesData
  });

  // 8. Create Compatibility Scores
  console.log('Creating compatibility scores...');
  await prisma.compatibilityScore.create({
    data: {
      tenantId: charlie.id,
      listingId: d1.id,
      score: 88,
      explanation: 'Great budget fit for Saket preference, aligns with target single room preference and availability.',
      generatedBy: 'AI',
    },
  });

  await prisma.compatibilityScore.create({
    data: {
      tenantId: diana.id,
      listingId: a1.id,
      score: 94,
      explanation: 'Excellent location match for Bandra West, rent aligns well with professional tenant budget and move-in timeline.',
      generatedBy: 'RULE_ENGINE',
    },
  });

  // 9. Create Interest Requests
  console.log('Creating interest requests...');
  await prisma.interestRequest.create({
    data: {
      tenantId: charlie.id,
      ownerId: david.id,
      listingId: d1.id,
      status: 'PENDING',
    },
  });

  await prisma.interestRequest.create({
    data: {
      tenantId: diana.id,
      ownerId: alice.id,
      listingId: a1.id,
      status: 'ACCEPTED',
    },
  });

  // 10. Create Chats and Messages
  console.log('Creating chats and messages...');
  const chat1 = await prisma.chat.create({
    data: {
      listingId: a1.id,
      ownerId: alice.id,
      tenantId: diana.id,
    },
  });

  await prisma.message.create({
    data: {
      chatId: chat1.id,
      senderId: diana.id,
      message: 'Hello Alice, is this private room in Bandra still available for rent?',
      messageType: 'TEXT',
      isRead: true,
    },
  });

  await prisma.message.create({
    data: {
      chatId: chat1.id,
      senderId: alice.id,
      message: 'Hi Diana! Yes, it is still available. Feel free to ask any questions or schedule a visit.',
      messageType: 'TEXT',
      isRead: false,
    },
  });

  // 11. Create Notifications
  console.log('Creating notifications...');
  await prisma.notification.create({
    data: {
      userId: david.id,
      title: 'New Interest Request',
      message: 'Charlie Kumar has expressed interest in your listing "Cozy Furnished Single Room in Saket".',
      type: 'INTEREST',
    },
  });

  // 12. Create Saved Listings (Favorites)
  console.log('Creating saved listings...');
  await prisma.savedListing.create({
    data: {
      userId: charlie.id,
      listingId: d1.id,
    },
  });

  // 13. Create Reviews
  console.log('Creating reviews...');
  await prisma.review.create({
    data: {
      reviewerId: diana.id,
      revieweeId: alice.id,
      rating: 5,
      review: 'Alice is an amazing landlord. Super helpful and responsive!',
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
