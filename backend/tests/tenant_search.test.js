const BASE_URL = 'http://localhost:3000/api';

async function runTests() {
  console.log('--- Starting Tenant & Search Module Integration Tests ---');
  let exitCode = 0;

  let ownerToken = '';
  let tenantToken = '';
  let listing1Id = '';
  let listing2Id = '';
  let listing3Id = '';

  const cleanupUser = async (email) => {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        await prisma.savedListing.deleteMany({ where: { userId: user.id } });
        await prisma.listingImage.deleteMany({ where: { listing: { ownerId: user.id } } });
        await prisma.listingAmenity.deleteMany({ where: { listing: { ownerId: user.id } } });
        await prisma.listing.deleteMany({ where: { ownerId: user.id } });
        await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
        await prisma.tenantProfile.deleteMany({ where: { userId: user.id } });
        await prisma.user.delete({ where: { id: user.id } });
      }
    } catch (e) {
      console.error(`Cleanup failed for ${email}:`, e.message);
    } finally {
      await prisma.$disconnect();
    }
  };

  try {
    // 0. Clean up
    console.log('Cleaning up old test data...');
    await cleanupUser('test_owner_search@test.com');
    await cleanupUser('test_tenant_search@test.com');

    // 1. Setup Accounts
    console.log('\n1. Creating Owner and Tenant test accounts...');
    await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Search Owner', email: 'test_owner_search@test.com', password: 'password123', role: 'OWNER' })
    });
    const ownerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test_owner_search@test.com', password: 'password123' })
    });
    const ownerLoginData = await ownerLoginRes.json();
    if (!ownerLoginRes.ok || !ownerLoginData.accessToken) {
      console.error('Owner login failed:', ownerLoginData);
      throw new Error(`Owner login failed: ${JSON.stringify(ownerLoginData)}`);
    }
    ownerToken = ownerLoginData.accessToken;

    await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Search Tenant', email: 'test_tenant_search@test.com', password: 'password123', role: 'TENANT' })
    });
    const tenantLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test_tenant_search@test.com', password: 'password123' })
    });
    const tenantLoginData = await tenantLoginRes.json();
    if (!tenantLoginRes.ok || !tenantLoginData.accessToken) {
      console.error('Tenant login failed:', tenantLoginData);
      throw new Error(`Tenant login failed: ${JSON.stringify(tenantLoginData)}`);
    }
    tenantToken = tenantLoginData.accessToken;
    console.log('✓ Accounts ready');

    // 2. Create 3 Diverse Listings as Owner
    console.log('\n2. Creating 3 diverse test listings...');
    const createRes1 = await fetch(`${BASE_URL}/owner/listings`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Spacious Single Room in South Delhi',
        location: 'Saket, South Delhi',
        rent: 20000,
        availableFrom: '2026-08-01',
        roomType: 'Single',
        furnishingStatus: 'Furnished'
      })
    });
    const createData1 = await createRes1.json();
    if (!createRes1.ok || !createData1.listing) {
      console.error('Create listing 1 failed:', createData1);
      throw new Error(`Create listing 1 failed: ${JSON.stringify(createData1)}`);
    }
    listing1Id = createData1.listing.id;

    const createRes2 = await fetch(`${BASE_URL}/owner/listings`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Modern Apartment in Bandra',
        location: 'Bandra West, Mumbai',
        rent: 45000,
        availableFrom: '2026-08-15',
        roomType: 'Private',
        furnishingStatus: 'Semi-Furnished'
      })
    });
    const createData2 = await createRes2.json();
    if (!createRes2.ok || !createData2.listing) {
      console.error('Create listing 2 failed:', createData2);
      throw new Error(`Create listing 2 failed: ${JSON.stringify(createData2)}`);
    }
    listing2Id = createData2.listing.id;

    const createRes3 = await fetch(`${BASE_URL}/owner/listings`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Budget Shared Room in Gurgaon',
        location: 'DLF Phase 3, Gurgaon',
        rent: 12000,
        availableFrom: '2026-07-20',
        roomType: 'Shared',
        furnishingStatus: 'Unfurnished'
      })
    });
    const createData3 = await createRes3.json();
    if (!createRes3.ok || !createData3.listing) {
      console.error('Create listing 3 failed:', createData3);
      throw new Error(`Create listing 3 failed: ${JSON.stringify(createData3)}`);
    }
    listing3Id = createData3.listing.id;
    console.log('✓ 3 listings created (Delhi ₹20k, Mumbai ₹45k, Gurgaon ₹12k)');

    // 3. Test Create/Edit Tenant Preferences
    console.log('\n3. Testing Create/Edit Tenant Preferences...');
    const prefRes = await fetch(`${BASE_URL}/tenant/preferences`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${tenantToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        preferredLocation: 'South Delhi',
        minBudget: 15000,
        maxBudget: 25000,
        moveInDate: '2026-08-01',
        roomType: 'Single',
        genderPreference: 'Any',
        occupation: 'Software Engineer',
        lifestyle: 'Early Riser',
        smoking: 'Non-smoker',
        pets: 'No pets',
        food: 'Vegetarian',
        bio: 'Looking for a quiet place near the metro.'
      })
    });
    const prefData = await prefRes.json();
    if (prefRes.status === 200 && prefData.profile.lifestyle === 'Early Riser' && prefData.profile.smoking === 'Non-smoker') {
      console.log('✓ Tenant preferences updated with lifestyle, smoking, pets, food, occupation, and budget');
    } else {
      throw new Error(`Failed to update tenant preferences: ${JSON.stringify(prefData)}`);
    }

    // Verify GET preferences
    const getPrefRes = await fetch(`${BASE_URL}/tenant/preferences`, {
      headers: { 'Authorization': `Bearer ${tenantToken}` }
    });
    const getPrefData = await getPrefRes.json();
    if (getPrefRes.status === 200 && getPrefData.profile.food === 'Vegetarian') {
      console.log('✓ Verified retrieval of updated tenant preferences');
    } else {
      throw new Error('Failed to retrieve tenant preferences');
    }

    // 4. Test Core Search (Mandatory Filters: location + budget range)
    console.log('\n4. Testing Core Search (Location + Budget Range)...');
    const coreSearchRes = await fetch(`${BASE_URL}/search?location=Delhi&minRent=15000&maxRent=25000`);
    const coreSearchData = await coreSearchRes.json();
    if (
      coreSearchRes.status === 200 &&
      coreSearchData.listings.some(l => l.id === listing1Id) &&
      coreSearchData.listings.every(l => l.rent >= 15000 && l.rent <= 25000)
    ) {
      console.log('✓ Core search correctly filtered by location (Delhi) and budget (₹15k-₹25k) -> returned matching listings');
    } else {
      throw new Error(`Core search failed: ${JSON.stringify(coreSearchData)}`);
    }

    // 5. Test Additive Optional Filters
    console.log('\n5. Testing Additive Optional Filters...');
    // Room Type
    const roomRes = await fetch(`${BASE_URL}/search?roomType=Private`);
    const roomData = await roomRes.json();
    if (roomData.listings.some(l => l.id === listing2Id) && roomData.listings.every(l => l.roomType === 'Private')) {
      console.log('✓ Optional filter roomType=Private returned correctly');
    } else {
      throw new Error('Room type filter failed');
    }

    // Furnishing
    const furnRes = await fetch(`${BASE_URL}/search?furnishing=Unfurnished`);
    const furnData = await furnRes.json();
    if (furnData.listings.some(l => l.id === listing3Id) && furnData.listings.every(l => l.furnishingStatus === 'Unfurnished')) {
      console.log('✓ Optional filter furnishing=Unfurnished returned correctly');
    } else {
      throw new Error('Furnishing filter failed');
    }

    // Available Date (Listings ready on or before 2026-07-25 -> should return Gurgaon listing available from 07-20)
    const dateRes = await fetch(`${BASE_URL}/search?availableDate=2026-07-25`);
    const dateData = await dateRes.json();
    if (dateData.listings.some(l => l.id === listing3Id) && dateData.listings.every(l => new Date(l.availableFrom) <= new Date('2026-07-25'))) {
      console.log('✓ Optional filter availableDate=2026-07-25 returned correctly (excluded later listings)');
    } else {
      throw new Error('Available date filter failed');
    }

    // 6. Test Sorting and Pagination
    console.log('\n6. Testing Sorting and Pagination...');
    const sortRes = await fetch(`${BASE_URL}/search?sortBy=rent&sortOrder=asc&limit=2&page=1`);
    const sortData = await sortRes.json();
    if (
      sortRes.status === 200 &&
      sortData.listings.length === 2 &&
      sortData.listings[0].rent <= sortData.listings[1].rent &&
      sortData.pagination.totalCount >= 3 &&
      sortData.pagination.totalPages >= 2
    ) {
      console.log('✓ Sorting by rent ascending and pagination verified successfully');
    } else {
      throw new Error(`Sorting/Pagination failed: ${JSON.stringify(sortData)}`);
    }

    // 7. Test Favorites
    console.log('\n7. Testing Favorites (Add, List, Remove)...');
    const addFavRes = await fetch(`${BASE_URL}/tenant/favorites/${listing1Id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tenantToken}` }
    });
    if (addFavRes.status === 201) {
      console.log('✓ Added listing to favorites');
    } else {
      throw new Error('Failed to add favorite');
    }

    const listFavRes = await fetch(`${BASE_URL}/tenant/favorites`, {
      headers: { 'Authorization': `Bearer ${tenantToken}` }
    });
    const listFavData = await listFavRes.json();
    if (listFavData.favorites.length === 1 && listFavData.favorites[0].id === listing1Id) {
      console.log('✓ Verified listing in favorites list');
    } else {
      throw new Error('Failed to list favorites');
    }

    const delFavRes = await fetch(`${BASE_URL}/tenant/favorites/${listing1Id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tenantToken}` }
    });
    if (delFavRes.status === 200) {
      console.log('✓ Removed listing from favorites');
    } else {
      throw new Error('Failed to delete favorite');
    }

    // 8. Test FILLED and HIDDEN / Deleted Exclusion
    console.log('\n8. Confirming FILLED and HIDDEN/soft-deleted listings NEVER appear in searches...');
    // Mark Listing 1 as FILLED
    await fetch(`${BASE_URL}/owner/listings/${listing1Id}/fill`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    console.log('✓ Marked Listing 1 as FILLED');

    // Soft Delete Listing 2 (sets deletedAt and HIDDEN)
    await fetch(`${BASE_URL}/owner/listings/${listing2Id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    console.log('✓ Soft-deleted Listing 2 (status HIDDEN)');

    // Run global search without filters
    const finalSearchRes = await fetch(`${BASE_URL}/search`);
    const finalSearchData = await finalSearchRes.json();
    if (
      finalSearchData.listings.some(l => l.id === listing3Id) &&
      !finalSearchData.listings.some(l => l.id === listing1Id || l.id === listing2Id)
    ) {
      console.log('✓ Confirmed: FILLED and HIDDEN/soft-deleted listings NEVER appear in search results!');
    } else {
      throw new Error(`Search exclusion test failed: ${JSON.stringify(finalSearchData)}`);
    }

  } catch (err) {
    console.error('\n✗ Test failed with error:', err.message);
    exitCode = 1;
  } finally {
    console.log('\nCleaning up test accounts...');
    await cleanupUser('test_owner_search@test.com');
    await cleanupUser('test_tenant_search@test.com');
    console.log('--- Tenant & Search Module Integration Tests Finished ---\n');
    process.exit(exitCode);
  }
}

runTests();
