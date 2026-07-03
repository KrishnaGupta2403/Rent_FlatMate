exports.buildCompatibilityPrompt = (profile, listing) => {
  const tenantInfo = {
    preferredLocation: profile.preferredLocation || 'Any',
    minBudget: profile.minBudget || 'Not specified',
    maxBudget: profile.maxBudget || 'Not specified',
    moveInDate: profile.moveInDate ? new Date(profile.moveInDate).toISOString().split('T')[0] : 'Flexible',
    roomType: profile.roomType || 'Any',
    furnishingPreference: profile.furnishingPreference || 'Any',
    occupation: profile.occupation || 'Not specified',
    gender: profile.gender || 'Not specified',
    lifestyle: profile.lifestyle || 'Not specified',
    smoking: profile.smoking || 'Not specified',
    pets: profile.pets || 'Not specified',
    food: profile.food || 'Not specified',
    bio: profile.bio || 'None'
  };

  const listingInfo = {
    title: listing.title || 'Untitled',
    description: listing.description || 'No description',
    location: listing.location || 'Unknown location',
    rent: listing.rent,
    securityDeposit: listing.securityDeposit,
    availableFrom: listing.availableFrom ? new Date(listing.availableFrom).toISOString().split('T')[0] : 'Immediate',
    roomType: listing.roomType || 'Unknown',
    furnishingStatus: listing.furnishingStatus || 'Unknown',
    occupancy: listing.occupancy || 1,
    amenities: listing.listingAmenities ? listing.listingAmenities.map(la => la.amenity?.name).filter(Boolean).join(', ') : 'None listed'
  };

  return `You are an expert real estate and flatmate compatibility AI advisor.
Evaluate the compatibility between the following Tenant Profile and Rental Listing.

TENANT PROFILE:
${JSON.stringify(tenantInfo, null, 2)}

RENTAL LISTING:
${JSON.stringify(listingInfo, null, 2)}

Analyze how well this listing meets the tenant's budget, location, move-in date, room type, furnishing preference, lifestyle, and rules.
You MUST respond with ONLY a valid JSON object matching this exact schema (no markdown code blocks, no trailing comments, no extra text):
{
  "score": <an integer between 0 and 100 representing overall compatibility percentage>,
  "explanation": "<a concise, 2-3 sentence explanation summarizing key compatibility strengths or mismatches>"
}`;
};
