const { PrismaClient } = require('@prisma/client');

const BASE_URL = 'http://localhost:3000/api';

async function runTests() {
  console.log('--- Starting AI Compatibility Engine Integration Tests ---');
  let exitCode = 0;
  let ownerToken = '';
  let tenantToken = '';
  let listing1Id = '';
  let listing2Id = '';
  let firstAIScore = 0;

  const cleanupUser = async (email) => {
    const prisma = new PrismaClient();
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        await prisma.compatibilityScore.deleteMany({ where: { tenantId: user.id } });
        await prisma.compatibilityScore.deleteMany({ where: { listing: { ownerId: user.id } } });
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
    // 0. Clean up old test data
    console.log('Cleaning up old test data...');
    await cleanupUser('test_ai_owner@test.com');
    await cleanupUser('test_ai_tenant@test.com');

    // 1. Setup Accounts
    console.log('\n1. Creating Owner and Tenant test accounts...');
    const regOwnerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'AI Owner', email: 'test_ai_owner@test.com', password: 'password123', role: 'OWNER', phone: '9876543210' })
    });
    if (!regOwnerRes.ok) throw new Error(`Owner register failed: ${await regOwnerRes.text()}`);

    const ownerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test_ai_owner@test.com', password: 'password123' })
    });
    const ownerLoginData = await ownerLoginRes.json();
    ownerToken = ownerLoginData.accessToken;

    const regTenantRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'AI Tenant', email: 'test_ai_tenant@test.com', password: 'password123', role: 'TENANT' })
    });
    if (!regTenantRes.ok) throw new Error(`Tenant register failed: ${await regTenantRes.text()}`);

    const tenantLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test_ai_tenant@test.com', password: 'password123' })
    });
    const tenantLoginData = await tenantLoginRes.json();
    tenantToken = tenantLoginData.accessToken;
    console.log('✓ Accounts ready');

    // 2. Create Two Listings as Owner
    console.log('\n2. Creating test listings...');
    const createRes1 = await fetch(`${BASE_URL}/owner/listings`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Luxury 2BHK in Bandra West',
        description: 'Spacious apartment with modern amenities and sea view.',
        location: 'Bandra West, Mumbai',
        rent: 45000,
        availableFrom: '2026-08-01',
        roomType: 'Private',
        furnishingStatus: 'Furnished'
      })
    });
    const createData1 = await createRes1.json();
    if (!createRes1.ok) throw new Error(`Create listing 1 failed: ${JSON.stringify(createData1)}`);
    listing1Id = createData1.listing.id;

    const createRes2 = await fetch(`${BASE_URL}/owner/listings`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Basic Shared Room in Saket',
        description: 'Small shared room near metro station.',
        location: 'Saket, Delhi',
        rent: 15000,
        availableFrom: '2026-09-01',
        roomType: 'Shared',
        furnishingStatus: 'Unfurnished'
      })
    });
    const createData2 = await createRes2.json();
    if (!createRes2.ok) throw new Error(`Create listing 2 failed: ${JSON.stringify(createData2)}`);
    listing2Id = createData2.listing.id;
    console.log('✓ Listings created');

    // 3. Setup Tenant Preferences
    console.log('\n3. Setting up Tenant Preferences...');
    const prefRes = await fetch(`${BASE_URL}/tenant/preferences`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${tenantToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        preferredLocation: 'Bandra',
        minBudget: 30000,
        maxBudget: 50000,
        moveInDate: '2026-08-01',
        roomType: 'Private',
        furnishingPreference: 'Furnished',
        lifestyle: 'Quiet professional looking for tidy flatmates.'
      })
    });
    if (!prefRes.ok) throw new Error(`Update preferences failed: ${await prefRes.text()}`);
    console.log('✓ Tenant preferences configured');

    // 4. Scenario (a): Normal AI Success
    console.log('\n4. Scenario (a): Testing Normal AI Success...');
    const aiRes1 = await fetch(`${BASE_URL}/ai/compatibility/${listing1Id}`, {
      headers: { 'Authorization': `Bearer ${tenantToken}` }
    });
    const aiData1 = await aiRes1.json();
    if (aiRes1.status === 200 && aiData1.compatibility && typeof aiData1.compatibility.score === 'number') {
      firstAIScore = aiData1.compatibility.score;
      console.log(`✓ AI compatibility evaluated successfully! Score: ${firstAIScore}/100`);
      console.log(`  Explanation: "${aiData1.compatibility.explanation}"`);
      console.log(`  Generated By: ${aiData1.compatibility.generatedBy}, Cached: ${aiData1.compatibility.cached}`);
      if (aiData1.compatibility.cached !== false) {
        throw new Error('First computation should NOT be cached!');
      }
    } else {
      throw new Error(`AI compatibility evaluation failed: ${JSON.stringify(aiData1)}`);
    }

    // 5. Scenario (c): Second Identical Request (Reads from Cache)
    console.log('\n5. Scenario (c): Testing Second Identical Request (Cache Verification)...');
    const aiRes2 = await fetch(`${BASE_URL}/ai/compatibility/${listing1Id}`, {
      headers: { 'Authorization': `Bearer ${tenantToken}` }
    });
    const aiData2 = await aiRes2.json();
    if (aiRes2.status === 200 && aiData2.compatibility && aiData2.compatibility.cached === true) {
      if (aiData2.compatibility.score !== firstAIScore) {
        throw new Error(`Cached score (${aiData2.compatibility.score}) did not match initial score (${firstAIScore})`);
      }
      console.log(`✓ Confirmed: Second identical request returned from CACHE! (Score: ${aiData2.compatibility.score}/100, Cached: true)`);
    } else {
      throw new Error(`Cache verification failed: ${JSON.stringify(aiData2)}`);
    }

    // 6. Scenario (b): Forced AI Failure (Triggering Rule-Based Fallback)
    console.log('\n6. Scenario (b): Testing Forced AI Failure (Rule-Based Fallback)...');
    await new Promise(r => setTimeout(r, 100)); // Ensure timestamp increments
    // Modify profile slightly to invalidate cache
    await fetch(`${BASE_URL}/tenant/preferences`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${tenantToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        preferredLocation: 'Bandra',
        minBudget: 30000,
        maxBudget: 50000,
        moveInDate: '2026-08-01',
        bio: 'Updated bio to invalidate cache and force new computation'
      })
    });

    // Toggle forced AI failure on server
    const toggleRes = await fetch(`${BASE_URL}/ai/compatibility/test-toggle-fail`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tenantToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fail: true })
    });
    if (!toggleRes.ok) throw new Error(`Failed to toggle AI fail: ${await toggleRes.text()}`);

    // Request compatibility -> should catch AI error and return rule fallback
    const aiRes3 = await fetch(`${BASE_URL}/ai/compatibility/${listing1Id}`, {
      headers: { 'Authorization': `Bearer ${tenantToken}` }
    });
    const aiData3 = await aiRes3.json();
    if (aiRes3.status === 200 && aiData3.compatibility && aiData3.compatibility.generatedBy === 'RULE_ENGINE') {
      console.log(`✓ Confirmed: Rule-based fallback triggered when AI failed! Score: ${aiData3.compatibility.score}/100`);
      console.log(`  Explanation: "${aiData3.compatibility.explanation}"`);
      console.log(`  Generated By: ${aiData3.compatibility.generatedBy}, Cached: ${aiData3.compatibility.cached}`);
      if (aiData3.compatibility.score !== 100) {
        throw new Error(`Expected rule score 100 (40 budget + 40 location + 20 availability), got ${aiData3.compatibility.score}`);
      }
    } else {
      throw new Error(`Rule fallback failed: ${JSON.stringify(aiData3)}`);
    }

    // Reset AI failure toggle
    await fetch(`${BASE_URL}/ai/compatibility/test-toggle-fail`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tenantToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fail: false })
    });

    // 7. Test Sorted Listings Endpoint
    console.log('\n7. Testing Sorted Listings Endpoint...');
    const sortRes = await fetch(`${BASE_URL}/ai/compatibility/listings`, {
      headers: { 'Authorization': `Bearer ${tenantToken}` }
    });
    const sortData = await sortRes.json();
    if (sortRes.status === 200 && sortData.listings && sortData.listings.length >= 2) {
      const topListing = sortData.listings[0];
      const bottomListing = sortData.listings[sortData.listings.length - 1];
      console.log(`✓ Sorted listings retrieved (${sortData.listings.length} listings found)`);
      console.log(`  Top match: "${topListing.title}" (Score: ${topListing.compatibility.score})`);
      console.log(`  Bottom match: "${bottomListing.title}" (Score: ${bottomListing.compatibility.score})`);
      if (topListing.compatibility.score < bottomListing.compatibility.score) {
        throw new Error('Listings are not sorted in descending order by compatibility score!');
      }
    } else {
      throw new Error(`Sorted listings test failed: ${JSON.stringify(sortData)}`);
    }

  } catch (err) {
    console.error('\n✗ Test failed with error:', err.message);
    exitCode = 1;
  } finally {
    console.log('\nCleaning up test accounts...');
    // Ensure AI failure toggle is reset
    try {
      await fetch(`${BASE_URL}/ai/compatibility/test-toggle-fail`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${tenantToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fail: false })
      });
    } catch (_) {}
    await cleanupUser('test_ai_owner@test.com');
    await cleanupUser('test_ai_tenant@test.com');
    console.log('--- AI Compatibility Engine Integration Tests Finished ---\n');
    process.exit(exitCode);
  }
}

runTests();
