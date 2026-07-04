const aiRepo = require('./compatibility.repository');
const { buildCompatibilityPrompt } = require('./prompt');
const { callLLM } = require('./gemini');
const { parseAIResponse } = require('./parser');
const { calculateRuleScore } = require('./rules');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getCompatibilityScore = async (userId, listingId) => {
  let profile = await aiRepo.getTenantProfileByUserId(userId);
  if (!profile) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const error = new Error('User account not found');
      error.statusCode = 404;
      throw error;
    }
    if (user.role === 'TENANT') {
      profile = await prisma.tenantProfile.create({ data: { userId } });
    } else {
      profile = {
        preferredLocation: 'Mumbai',
        minBudget: 10000,
        maxBudget: 100000,
        moveInDate: new Date(),
        roomType: 'private_room',
        furnishingPreference: 'semi-furnished',
        occupation: 'Professional',
        gender: 'Any',
        genderPreference: 'Any',
        lifestyle: 'Clean, quiet',
        smoking: 'No',
        pets: 'No',
        food: 'Any',
        bio: 'Mock profile for non-tenant user testing',
        updatedAt: new Date()
      };
    }
  }

  const listing = await aiRepo.getListingById(listingId);
  if (!listing) {
    const error = new Error('Listing not found or is no longer active');
    error.statusCode = 404;
    throw error;
  }

  // Check Caching Logic
  const cached = await aiRepo.getCachedScore(userId, listing.id);
  if (cached) {
    const scoreTime = new Date(cached.generatedAt).getTime();
    const profileTime = profile.updatedAt ? new Date(profile.updatedAt).getTime() : 0;
    const listingTime = listing.updatedAt ? new Date(listing.updatedAt).getTime() : 0;

    // Only return cached if generated strictly AFTER both profile and listing last updates
    if (scoreTime > profileTime && scoreTime > listingTime) {
      return {
        listingId: listing.id,
        score: cached.score,
        explanation: cached.explanation,
        generatedBy: cached.generatedBy,
        cached: true,
        generatedAt: cached.generatedAt
      };
    }
  }

  // Calculate new score (try AI first, fallback to rule engine if anything fails)
  let result;
  try {
    const promptText = buildCompatibilityPrompt(profile, listing);
    const aiRawResponse = await callLLM(promptText);
    result = parseAIResponse(aiRawResponse, profile, listing);
  } catch (err) {
    console.warn(`AI computation failed (${err.message}), triggering rule-based fallback.`);
    result = calculateRuleScore(profile, listing);
  }

  // Save new score in DB
  const saved = await aiRepo.saveScore({
    tenantId: userId,
    listingId: listing.id,
    score: result.score,
    explanation: result.explanation,
    generatedBy: result.generatedBy
  });

  if (saved.score > 80 && listing.owner?.email) {
    try {
      const emailService = require('../notifications/email.service');
      await emailService.sendEmail({
        to: listing.owner.email,
        subject: 'High Compatibility Match Found!',
        html: `<p>Great news! A tenant profile has a ${saved.score}% compatibility match with your listing "${listing.title}".</p>`
      });
    } catch (e) {
      console.error('Email error on high compatibility score:', e.message);
    }
  }

  return {
    listingId: listing.id,
    score: saved.score,
    explanation: saved.explanation,
    generatedBy: saved.generatedBy,
    cached: false,
    generatedAt: saved.generatedAt
  };
};

exports.getSortedListingsForTenant = async (userId, filters = {}) => {
  const listings = await aiRepo.getAllActiveListings(filters);
  if (!listings || listings.length === 0) {
    return [];
  }

  // Compute or fetch compatibility score for all active listings in parallel
  const scoredListings = await Promise.all(
    listings.map(async (listing) => {
      try {
        const compatibility = await exports.getCompatibilityScore(userId, listing.id);
        return {
          ...listing,
          compatibility
        };
      } catch (err) {
        console.error(`Failed to score listing ${listing.id}:`, err.message);
        return {
          ...listing,
          compatibility: {
            score: 0,
            explanation: 'Could not compute score.',
            generatedBy: 'RULE_ENGINE',
            cached: false
          }
        };
      }
    })
  );

  // Sort descending by score
  scoredListings.sort((a, b) => b.compatibility.score - a.compatibility.score);

  return scoredListings;
};
