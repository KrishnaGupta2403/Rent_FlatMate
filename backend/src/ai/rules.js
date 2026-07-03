exports.calculateRuleScore = (profile, listing) => {
  let budgetScore = 0;
  let budgetNote = '';
  const rent = listing.rent;
  const { minBudget, maxBudget, preferredLocation, moveInDate } = profile;

  if (maxBudget === null && minBudget === null) {
    budgetScore = 30;
    budgetNote = 'No budget preference specified (+30)';
  } else if (maxBudget !== null && rent <= maxBudget) {
    budgetScore = 40;
    budgetNote = `Rent (₹${rent}) is within budget ceiling (₹${maxBudget}) (+40)`;
  } else if (maxBudget !== null && rent > maxBudget) {
    const excessPct = ((rent - maxBudget) / maxBudget) * 100;
    if (excessPct <= 10) {
      budgetScore = 20;
      budgetNote = `Rent is slightly over budget by ${Math.round(excessPct)}% (+20)`;
    } else if (excessPct <= 20) {
      budgetScore = 10;
      budgetNote = `Rent is over budget by ${Math.round(excessPct)}% (+10)`;
    } else {
      budgetScore = 0;
      budgetNote = `Rent exceeds max budget significantly (+0)`;
    }
  } else if (minBudget !== null && rent >= minBudget) {
    budgetScore = 40;
    budgetNote = `Rent (₹${rent}) meets minimum budget requirement (+40)`;
  } else {
    budgetScore = 25;
    budgetNote = `Budget criteria evaluated (+25)`;
  }

  let locationScore = 0;
  let locationNote = '';
  if (!preferredLocation || !listing.location) {
    locationScore = 20;
    locationNote = 'Location preference or listing location missing (+20)';
  } else {
    const prefLoc = preferredLocation.toLowerCase().trim();
    const listLoc = listing.location.toLowerCase().trim();
    if (prefLoc === listLoc || listLoc.includes(prefLoc) || prefLoc.includes(listLoc)) {
      locationScore = 40;
      locationNote = `Location matches preferred area '${preferredLocation}' (+40)`;
    } else {
      const prefWords = prefLoc.split(/[\s,]+/).filter(w => w.length >= 3);
      const listWords = listLoc.split(/[\s,]+/).filter(w => w.length >= 3);
      const hasWordMatch = prefWords.some(w => listWords.includes(w));
      if (hasWordMatch) {
        locationScore = 25;
        locationNote = `Partial location match with preferred area (+25)`;
      } else {
        locationScore = 10;
        locationNote = `Location differs from preferred area (+10)`;
      }
    }
  }

  let availabilityScore = 0;
  let availabilityNote = '';
  if (!moveInDate || !listing.availableFrom) {
    availabilityScore = 15;
    availabilityNote = 'Move-in date or availability date missing (+15)';
  } else {
    const listDate = new Date(listing.availableFrom).getTime();
    const moveDate = new Date(moveInDate).getTime();
    const diffDays = (listDate - moveDate) / (1000 * 60 * 60 * 24);

    if (diffDays <= 0) {
      availabilityScore = 20;
      availabilityNote = 'Available on or before desired move-in date (+20)';
    } else if (diffDays <= 14) {
      availabilityScore = 10;
      availabilityNote = `Available within 2 weeks of move-in date (+10)`;
    } else {
      availabilityScore = 5;
      availabilityNote = `Available more than 2 weeks after move-in date (+5)`;
    }
  }

  const totalScore = Math.min(100, Math.max(0, budgetScore + locationScore + availabilityScore));
  const explanation = `Rule-Based Evaluation: ${budgetNote}. ${locationNote}. ${availabilityNote}.`;

  return {
    score: totalScore,
    explanation,
    generatedBy: 'RULE_ENGINE'
  };
};
