const BASE_URL = 'http://localhost:3000/api';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log('--- Starting Auth & Users Module Integration Tests ---');
  let exitCode = 0;

  // Track tokens
  let tenantToken = '';
  let tenantRefresh = '';
  let ownerToken = '';
  let adminToken = '';
  let resetToken = '';

  const cleanupEmail = async (email) => {
    // We import Prisma here to clean up test users if they exist
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        // Delete refresh tokens first
        await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
        // Delete tenant profile if exists
        await prisma.tenantProfile.deleteMany({ where: { userId: user.id } });
        // Delete user
        await prisma.user.delete({ where: { id: user.id } });
      }
    } catch (e) {
      console.error(`Cleanup failed for ${email}:`, e.message);
    } finally {
      await prisma.$disconnect();
    }
  };

  try {
    // 0. Clean up any leftover test data
    console.log('Cleaning up old test users...');
    await cleanupEmail('test_tenant@test.com');
    await cleanupEmail('test_owner@test.com');
    await cleanupEmail('test_admin@test.com');

    // 1. Register Tenant
    console.log('\n1. Testing User Registration...');
    const regTenantRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Tenant',
        email: 'test_tenant@test.com',
        password: 'password123',
        role: 'TENANT',
        phone: '1111111111'
      })
    });
    const regTenantData = await regTenantRes.json();
    if (regTenantRes.status === 201) {
      console.log('✓ Tenant registered successfully');
    } else {
      throw new Error(`Failed to register Tenant: ${JSON.stringify(regTenantData)}`);
    }

    // 2. Register Owner
    const regOwnerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Owner',
        email: 'test_owner@test.com',
        password: 'password123',
        role: 'OWNER',
        phone: '2222222222'
      })
    });
    const regOwnerData = await regOwnerRes.json();
    if (regOwnerRes.status === 201) {
      console.log('✓ Owner registered successfully');
    } else {
      throw new Error(`Failed to register Owner: ${JSON.stringify(regOwnerData)}`);
    }

    // 3. Register Admin
    const regAdminRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Admin',
        email: 'test_admin@test.com',
        password: 'password123',
        role: 'ADMIN'
      })
    });
    const regAdminData = await regAdminRes.json();
    if (regAdminRes.status === 201) {
      console.log('✓ Admin registered successfully');
    } else {
      throw new Error(`Failed to register Admin: ${JSON.stringify(regAdminData)}`);
    }

    // 4. Test Duplicate Email Registration
    const regDupRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Duplicate',
        email: 'test_tenant@test.com',
        password: 'password123',
        role: 'TENANT'
      })
    });
    if (regDupRes.status === 400) {
      console.log('✓ Duplicate email registration rejected correctly (400)');
    } else {
      throw new Error('Duplicate email registration should have failed with 400');
    }

    // 5. Test Login
    console.log('\n2. Testing User Login...');
    const loginTenantRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test_tenant@test.com',
        password: 'password123'
      })
    });
    const loginTenantData = await loginTenantRes.json();
    if (loginTenantRes.status === 200) {
      tenantToken = loginTenantData.accessToken;
      tenantRefresh = loginTenantData.refreshToken;
      console.log('✓ Tenant logged in, JWT Access Token and Refresh Token received');
    } else {
      throw new Error(`Tenant login failed: ${JSON.stringify(loginTenantData)}`);
    }

    const loginOwnerRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test_owner@test.com',
        password: 'password123'
      })
    });
    const loginOwnerData = await loginOwnerRes.json();
    ownerToken = loginOwnerData.accessToken;

    const loginAdminRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test_admin@test.com',
        password: 'password123'
      })
    });
    const loginAdminData = await loginAdminRes.json();
    adminToken = loginAdminData.accessToken;

    // 6. Test Role Guards
    console.log('\n3. Testing Auth Middleware & Role Guards...');
    
    // Tenant accessing Tenant endpoint -> Success
    const testTenantOkRes = await fetch(`http://localhost:3000/api/test/tenant`, {
      headers: { 'Authorization': `Bearer ${tenantToken}` }
    });
    if (testTenantOkRes.status === 200) {
      console.log('✓ Tenant access to Tenant endpoint succeeded');
    } else {
      throw new Error(`Tenant access to Tenant endpoint failed with code ${testTenantOkRes.status}`);
    }

    // Tenant accessing Owner endpoint -> Forbidden (403)
    const testTenantForbiddenRes = await fetch(`http://localhost:3000/api/test/owner`, {
      headers: { 'Authorization': `Bearer ${tenantToken}` }
    });
    if (testTenantForbiddenRes.status === 403) {
      console.log('✓ Tenant access to Owner endpoint blocked with 403 Forbidden');
    } else {
      throw new Error(`Tenant access to Owner endpoint should have been 403, got ${testTenantForbiddenRes.status}`);
    }

    // Owner accessing Owner endpoint -> Success
    const testOwnerOkRes = await fetch(`http://localhost:3000/api/test/owner`, {
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    if (testOwnerOkRes.status === 200) {
      console.log('✓ Owner access to Owner endpoint succeeded');
    } else {
      throw new Error(`Owner access to Owner endpoint failed with code ${testOwnerOkRes.status}`);
    }

    // Owner accessing Admin endpoint -> Forbidden (403)
    const testOwnerForbiddenRes = await fetch(`http://localhost:3000/api/test/admin`, {
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    if (testOwnerForbiddenRes.status === 403) {
      console.log('✓ Owner access to Admin endpoint blocked with 403 Forbidden');
    } else {
      throw new Error(`Owner access to Admin endpoint should have been 403, got ${testOwnerForbiddenRes.status}`);
    }

    // Admin accessing Admin endpoint -> Success
    const testAdminOkRes = await fetch(`http://localhost:3000/api/test/admin`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (testAdminOkRes.status === 200) {
      console.log('✓ Admin access to Admin endpoint succeeded');
    } else {
      throw new Error(`Admin access to Admin endpoint failed with code ${testAdminOkRes.status}`);
    }

    // Test with missing token -> Unauthorized (401)
    const testNoTokenRes = await fetch(`http://localhost:3000/api/test/authenticated`);
    if (testNoTokenRes.status === 401) {
      console.log('✓ Access with missing token blocked with 401 Unauthorized');
    } else {
      throw new Error(`Access with missing token should have been 401, got ${testNoTokenRes.status}`);
    }

    // Test with invalid token format -> Unauthorized (401)
    const testInvalidFormatRes = await fetch(`http://localhost:3000/api/test/authenticated`, {
      headers: { 'Authorization': `InvalidFormatToken` }
    });
    if (testInvalidFormatRes.status === 401) {
      console.log('✓ Access with invalid authorization format blocked with 401 Unauthorized');
    } else {
      throw new Error(`Access with invalid authorization format should have been 401, got ${testInvalidFormatRes.status}`);
    }

    // 7. Test User Profiles (GET/PATCH)
    console.log('\n4. Testing User Profile Endpoints...');
    
    // GET Profile
    const profileRes = await fetch(`${BASE_URL}/users/profile`, {
      headers: { 'Authorization': `Bearer ${tenantToken}` }
    });
    const profileData = await profileRes.json();
    if (profileRes.status === 200 && profileData.user.tenantProfile) {
      console.log('✓ Profile retrieved. Tenant profile automatically initialized & retrieved');
    } else {
      throw new Error(`Failed to retrieve profile: ${JSON.stringify(profileData)}`);
    }

    // PATCH Profile (Tenant updates budget and location)
    const updateRes = await fetch(`${BASE_URL}/users/profile`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${tenantToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fullName: 'Test Tenant Updated Name',
        preferredLocation: 'Saket Metro',
        minBudget: 16000,
        maxBudget: 22000,
        bio: 'Updated bio information'
      })
    });
    const updateData = await updateRes.json();
    if (
      updateRes.status === 200 &&
      updateData.user.fullName === 'Test Tenant Updated Name' &&
      updateData.user.tenantProfile.preferredLocation === 'Saket Metro' &&
      updateData.user.tenantProfile.maxBudget === 22000
    ) {
      console.log('✓ Profile and nested TenantProfile updated successfully');
    } else {
      throw new Error(`Failed to update profile: ${JSON.stringify(updateData)}`);
    }

    // 8. Test Forgot Password
    console.log('\n5. Testing Password Reset Flow...');
    const forgotRes = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test_tenant@test.com' })
    });
    const forgotData = await forgotRes.json();
    if (forgotRes.status === 200 && forgotData.resetToken) {
      resetToken = forgotData.resetToken;
      console.log('✓ Reset token generated and returned successfully');
    } else {
      throw new Error(`Forgot password failed: ${JSON.stringify(forgotData)}`);
    }

    // Reset Password
    const resetRes = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: resetToken,
        newPassword: 'newpassword123'
      })
    });
    const resetData = await resetRes.json();
    if (resetRes.status === 200) {
      console.log('✓ Password reset succeeded');
    } else {
      throw new Error(`Password reset failed: ${JSON.stringify(resetData)}`);
    }

    // Login with new password
    const loginNewRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test_tenant@test.com',
        password: 'newpassword123'
      })
    });
    const loginNewData = await loginNewRes.json();
    if (loginNewRes.status === 200) {
      // update token to new one
      tenantToken = loginNewData.accessToken;
      tenantRefresh = loginNewData.refreshToken;
      console.log('✓ Logged in successfully with new password');
    } else {
      throw new Error(`Login with new password failed: ${JSON.stringify(loginNewData)}`);
    }

    // 9. Test Logout
    console.log('\n6. Testing Logout & Token Invalidation...');
    const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tenantRefresh })
    });
    const logoutData = await logoutRes.json();
    if (logoutRes.status === 200) {
      console.log('✓ Logged out successfully');
    } else {
      throw new Error(`Logout failed: ${JSON.stringify(logoutData)}`);
    }

    // Verify token invalidation on refresh endpoint
    const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tenantRefresh })
    });
    if (refreshRes.status === 401) {
      console.log('✓ Invalidated refresh token rejected correctly on refresh request (401)');
    } else {
      throw new Error(`Expired/Invalidated refresh token should have been 401, got ${refreshRes.status}`);
    }

  } catch (err) {
    console.error('\n✗ Test failed with error:', err.message);
    exitCode = 1;
  } finally {
    // Cleanup test users at the end
    console.log('\nCleaning up test users...');
    await cleanupEmail('test_tenant@test.com');
    await cleanupEmail('test_owner@test.com');
    await cleanupEmail('test_admin@test.com');
    console.log('--- Integration Tests Finished ---\n');
    process.exit(exitCode);
  }
}

runTests();
