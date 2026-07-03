const { PrismaClient } = require('@prisma/client');
const BASE_URL = 'http://localhost:3000/api';

async function runTests() {
  console.log('--- Starting Admin Module Integration Tests ---');
  let exitCode = 0;
  let adminToken = '';
  let ownerToken = '';
  let tenantToken = '';
  let adminId = '';
  let ownerId = '';
  let tenantId = '';
  let listing1Id = '';
  let listing2Id = '';

  const cleanupUser = async (email) => {
    const prisma = new PrismaClient();
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        await prisma.adminLog.deleteMany({ where: { adminId: user.id } });
        await prisma.message.deleteMany({ where: { OR: [{ senderId: user.id }, { chat: { OR: [{ ownerId: user.id }, { tenantId: user.id }] } }] } });
        await prisma.chat.deleteMany({ where: { OR: [{ ownerId: user.id }, { tenantId: user.id }] } });
        await prisma.notification.deleteMany({ where: { userId: user.id } });
        await prisma.interestRequest.deleteMany({ where: { OR: [{ tenantId: user.id }, { ownerId: user.id }] } });
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
    const prisma = new PrismaClient();
    console.log('0. Cleaning up old test data...');
    await cleanupUser('admin_test_admin@test.com');
    await cleanupUser('admin_test_owner@test.com');
    await cleanupUser('admin_test_tenant@test.com');

    // 1. Setup Accounts
    console.log('\n1. Creating Admin, Owner, and Tenant test accounts...');
    const regAdminRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Super Admin', email: 'admin_test_admin@test.com', password: 'password123', role: 'ADMIN', phone: '9000000001' })
    });
    if (!regAdminRes.ok) throw new Error(`Admin register failed: ${await regAdminRes.text()}`);
    const adminData = await regAdminRes.json();
    adminToken = adminData.accessToken;
    adminId = adminData.user.id;

    const regOwnerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Admin Test Owner', email: 'admin_test_owner@test.com', password: 'password123', role: 'OWNER', phone: '9000000002' })
    });
    if (!regOwnerRes.ok) throw new Error(`Owner register failed: ${await regOwnerRes.text()}`);
    const ownerData = await regOwnerRes.json();
    ownerToken = ownerData.accessToken;
    ownerId = ownerData.user.id;

    const regTenantRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Admin Test Tenant', email: 'admin_test_tenant@test.com', password: 'password123', role: 'TENANT', phone: '9000000003' })
    });
    if (!regTenantRes.ok) throw new Error(`Tenant register failed: ${await regTenantRes.text()}`);
    const tenantData = await regTenantRes.json();
    tenantToken = tenantData.accessToken;
    tenantId = tenantData.user.id;
    console.log('✓ Accounts created and authenticated');

    // Setup Tenant Profile
    await fetch(`${BASE_URL}/tenant/preferences`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${tenantToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ minBudget: 10000, maxBudget: 40000, preferredLocation: 'Powai, Mumbai', moveInDate: '2026-08-01' })
    });

    // 2. Create Listings & Activity
    console.log('\n2. Creating test listings and user activity...');
    const createRes1 = await fetch(`${BASE_URL}/owner/listings`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Admin Test Listing 1',
        description: 'Nice flat.',
        location: 'Powai, Mumbai',
        rent: 30000,
        availableFrom: '2026-08-01',
        roomType: 'Private',
        furnishingStatus: 'Furnished'
      })
    });
    const createData1 = await createRes1.json();
    listing1Id = createData1.listing.id;

    const createRes2 = await fetch(`${BASE_URL}/owner/listings`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Admin Test Listing 2 - Spam',
        description: 'Fake spam listing.',
        location: 'Powai, Mumbai',
        rent: 15000,
        availableFrom: '2026-08-01',
        roomType: 'Shared',
        furnishingStatus: 'Unfurnished'
      })
    });
    const createData2 = await createRes2.json();
    listing2Id = createData2.listing.id;

    // Tenant sends interest on listing 1
    const interestRes = await fetch(`${BASE_URL}/interests/${listing1Id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tenantToken}`, 'Content-Type': 'application/json' }
    });
    const interestData = await interestRes.json();

    // Owner accepts interest
    await fetch(`${BASE_URL}/interests/${interestData.request.id}/accept`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });

    // Create chat
    await fetch(`${BASE_URL}/chats`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tenantToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId: listing1Id, tenantId, ownerId })
    });

    // Owner marks Listing 1 as FILLED
    await fetch(`${BASE_URL}/owner/listings/${listing1Id}/fill`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    console.log('✓ Test listings, interest, chat, and filled status generated');

    // 3. Test Dashboard Aggregation
    console.log('\n3. Testing Admin Dashboard Aggregation endpoint...');
    const dashRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const dashData = await dashRes.json();
    if (!dashRes.ok) throw new Error(`Dashboard failed: ${JSON.stringify(dashData)}`);

    console.log('  Dashboard Stats:', JSON.stringify(dashData.stats));
    if (dashData.stats.activeUsers >= 3 && dashData.stats.totalListings >= 2 && dashData.stats.filledListings >= 1 && dashData.stats.activeChats >= 1 && dashData.stats.totalInterests >= 1) {
      console.log('✓ Verified: Dashboard aggregation correctly counted users, total listings, filled listings, chats, and interests');
    } else {
      throw new Error(`Dashboard counts lower than expected: ${JSON.stringify(dashData.stats)}`);
    }

    // 4. Test User Management
    console.log('\n4. Testing User Management (list users)...');
    const usersRes = await fetch(`${BASE_URL}/admin/users?role=TENANT`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const usersData = await usersRes.json();
    if (usersRes.status === 200 && usersData.users.some(u => u.email === 'admin_test_tenant@test.com')) {
      console.log(`✓ Verified: Successfully listed users filtered by role TENANT`);
    } else {
      throw new Error(`User list verification failed: ${JSON.stringify(usersData)}`);
    }

    // 5. Test Listing Moderation & Spam Marking
    console.log('\n5. Testing Listing Moderation (Mark Spam)...');
    const spamRes = await fetch(`${BASE_URL}/admin/listings/${listing2Id}/spam`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const spamData = await spamRes.json();
    if (spamRes.status === 200 && spamData.listing.status === 'HIDDEN') {
      console.log('✓ Verified: Listing marked as spam and status updated to HIDDEN');
    } else {
      throw new Error(`Mark spam failed: ${JSON.stringify(spamData)}`);
    }

    // Verify AdminLog created
    const spamLog = await prisma.adminLog.findFirst({
      where: { adminId, action: 'MARK_SPAM', entityId: listing2Id }
    });
    if (spamLog) {
      console.log('✓ Verified: Audit log recorded in AdminLog table for MARK_SPAM action');
    } else {
      throw new Error('AdminLog not found for MARK_SPAM');
    }

    // 6. Test Blocking User & Instant JWT Revocation
    console.log('\n6. Testing Blocking User & Instant JWT Revocation...');
    const blockRes = await fetch(`${BASE_URL}/admin/users/${tenantId}/block`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const blockData = await blockRes.json();
    if (blockRes.status === 200 && blockData.user.isActive === false) {
      console.log(`✓ Verified: Tenant account blocked by admin (isActive: false)`);
    } else {
      throw new Error(`Block user failed: ${JSON.stringify(blockData)}`);
    }

    // Verify AdminLog created for block
    const blockLog = await prisma.adminLog.findFirst({
      where: { adminId, action: 'BLOCK_USER', entityId: tenantId }
    });
    if (!blockLog) throw new Error('AdminLog not found for BLOCK_USER');
    console.log('✓ Verified: Audit log recorded in AdminLog table for BLOCK_USER action');

    console.log('  Testing blocked tenant request with existing valid JWT...');
    const blockedReqRes = await fetch(`${BASE_URL}/tenant/preferences`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tenantToken}` }
    });
    const blockedReqData = await blockedReqRes.json();
    if (blockedReqRes.status === 403 && blockedReqData.error.includes('blocked')) {
      console.log(`✓ Verified: Existing JWT rejected instantly on next request with 403 Forbidden! ("${blockedReqData.error}")`);
    } else {
      throw new Error(`Expected 403 Forbidden for blocked JWT, got ${blockedReqRes.status}: ${JSON.stringify(blockedReqData)}`);
    }

    console.log('  Testing blocked tenant login attempt...');
    const blockedLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin_test_tenant@test.com', password: 'password123' })
    });
    const blockedLoginData = await blockedLoginRes.json();
    if (blockedLoginRes.status === 403 && blockedLoginData.error.includes('blocked')) {
      console.log(`✓ Verified: Login attempt by blocked tenant rejected with 403 Forbidden! ("${blockedLoginData.error}")`);
    } else {
      throw new Error(`Expected 403 Forbidden for blocked login, got ${blockedLoginRes.status}: ${JSON.stringify(blockedLoginData)}`);
    }

    // 7. Test Unblocking Tenant
    console.log('\n7. Testing Unblocking Tenant...');
    const unblockRes = await fetch(`${BASE_URL}/admin/users/${tenantId}/unblock`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (!unblockRes.ok) throw new Error(`Unblock failed: ${await unblockRes.text()}`);

    const unblockedReqRes = await fetch(`${BASE_URL}/tenant/preferences`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tenantToken}` }
    });
    if (unblockedReqRes.status === 200) {
      console.log('✓ Verified: Tenant can access protected endpoints again after unblocking');
    } else {
      throw new Error(`Expected 200 after unblock, got ${unblockedReqRes.status}`);
    }

    // 8. Test Role Guard
    console.log('\n8. Testing Role Guard on Admin routes...');
    const guardRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${tenantToken}` }
    });
    if (guardRes.status === 403) {
      console.log('✓ Verified: Non-admin users are blocked from admin routes with 403 Forbidden');
    } else {
      throw new Error(`Expected 403 on admin route by tenant, got ${guardRes.status}`);
    }

    await prisma.$disconnect();
  } catch (err) {
    console.error('\n✗ Test failed with error:', err.message);
    exitCode = 1;
  } finally {
    console.log('\nCleaning up test accounts...');
    await cleanupUser('admin_test_admin@test.com');
    await cleanupUser('admin_test_owner@test.com');
    await cleanupUser('admin_test_tenant@test.com');
    console.log('--- Admin Module Integration Tests Finished ---\n');
    process.exit(exitCode);
  }
}

runTests();
