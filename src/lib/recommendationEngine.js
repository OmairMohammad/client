// ─── Model 1: Rules-Based Scoring Engine ────────────────────────────────────
function rulesBasedScore(asset) {
  let score = asset.efficiencyScore;

  // Fault penalty
  if (asset.recentFaults >= 4) score -= 22;
  else if (asset.recentFaults >= 2) score -= 12;
  else if (asset.recentFaults >= 1) score -= 6;

  // Overdue maintenance penalty
  if (asset.overdueDays > 30) score -= 20;
  else if (asset.overdueDays > 14) score -= 12;
  else if (asset.overdueDays > 7) score -= 7;
  else if (asset.overdueDays > 0) score -= 3;

  // Vibration penalty
  if (asset.vibration > 55) score -= 14;
  else if (asset.vibration > 35) score -= 8;
  else if (asset.vibration > 25) score -= 4;

  // Temperature penalty
  if (asset.temperature > 115) score -= 12;
  else if (asset.temperature > 105) score -= 7;
  else if (asset.temperature > 95) score -= 3;

  // Bearing temperature penalty
  if (asset.bearingTemp > 70) score -= 10;
  else if (asset.bearingTemp > 55) score -= 5;

  // Water hardness penalty
  if (asset.waterHardness > 200) score -= 8;
  else if (asset.waterHardness > 160) score -= 4;

  // Age penalty
  if (asset.assetAge > 10) score -= 8;
  else if (asset.assetAge > 7) score -= 4;

  // Workforce penalty
  if (!asset.workerCertified) score -= 6;
  if (asset.workerFatigue === 'High') score -= 5;
  else if (asset.workerFatigue === 'Medium') score -= 2;
  if (asset.workerExperience < 2) score -= 4;

  return Math.max(0, Math.min(100, Math.round(score)));
}

// ─── Model 2: Anomaly Detection Score ────────────────────────────────────────
function anomalyScore(asset) {
  let anomalyPoints = 0;
  const flags = [];

  if (asset.vibration > 50) { anomalyPoints += 30; flags.push('Critical vibration anomaly'); }
  else if (asset.vibration > 30) { anomalyPoints += 15; flags.push('Elevated vibration detected'); }

  if (asset.temperature > 115) { anomalyPoints += 25; flags.push('Temperature exceeds safe threshold'); }
  else if (asset.temperature > 100) { anomalyPoints += 12; flags.push('Temperature approaching limit'); }

  if (asset.bearingTemp > 70) { anomalyPoints += 20; flags.push('Bearing overheat anomaly'); }
  else if (asset.bearingTemp > 55) { anomalyPoints += 10; flags.push('Bearing temperature elevated'); }

  if (asset.waterHardness > 200) { anomalyPoints += 15; flags.push('Water hardness scale risk'); }

  if (asset.recentFaults > 3) { anomalyPoints += 20; flags.push('Multiple fault event pattern'); }
  else if (asset.recentFaults > 1) { anomalyPoints += 10; flags.push('Recurring fault events'); }

  if (asset.stackTemp > 190) { anomalyPoints += 18; flags.push('Stack temperature anomaly – possible fouling'); }

  const score = Math.min(100, anomalyPoints);
  const level = score >= 50 ? 'Critical' : score >= 25 ? 'Moderate' : 'Normal';
  return { score, level, flags: flags.length ? flags : ['No anomalies detected'] };
}

// ─── Model 3: Time-to-Failure Prediction ─────────────────────────────────────
function predictFailure(asset) {
  let daysToFailure = 365;

  const degradationRate = Math.max(0.5, (100 - asset.efficiencyScore) / 8);
  daysToFailure -= degradationRate * 12;

  if (asset.vibration > 50) daysToFailure -= 60;
  else if (asset.vibration > 30) daysToFailure -= 25;

  if (asset.bearingTemp > 70) daysToFailure -= 45;
  else if (asset.bearingTemp > 55) daysToFailure -= 20;

  if (asset.waterHardness > 200) daysToFailure -= 30;

  daysToFailure -= (asset.recentFaults * 18);
  daysToFailure -= (asset.overdueDays * 1.2);
  daysToFailure -= Math.max(0, asset.assetAge - 5) * 8;

  if (!asset.workerCertified) daysToFailure -= 15;
  if (asset.workerFatigue === 'High') daysToFailure -= 20;

  daysToFailure = Math.max(7, Math.round(daysToFailure));
  const confidence = Math.max(55, Math.min(94, 94 - (asset.recentFaults * 4)));

  return { daysToFailure, confidence };
}

// ─── Model 4: Maintenance Strategy Selector ──────────────────────────────────
function selectMaintenanceStrategy(asset) {
  const strategies = [
    { name: 'Reactive', score: 0 },
    { name: 'Preventative', score: 0 },
    { name: 'Condition-Based', score: 0 },
    { name: 'Predictive', score: 0 },
  ];

  // Asset age influences strategy
  if (asset.assetAge <= 3) strategies[3].score += 30;
  else if (asset.assetAge <= 6) strategies[2].score += 30;
  else if (asset.assetAge <= 9) strategies[1].score += 25;
  else strategies[0].score += 10;

  // Criticality
  if (asset.criticality === 'Critical') { strategies[3].score += 40; strategies[2].score += 20; }
  else if (asset.criticality === 'High') { strategies[2].score += 35; strategies[1].score += 20; }
  else { strategies[1].score += 30; strategies[0].score += 15; }

  // Fault history
  if (asset.recentFaults >= 4) strategies[3].score += 20;
  else if (asset.recentFaults >= 2) strategies[2].score += 20;
  else if (asset.recentFaults === 0) strategies[3].score += 15;

  // Worker capability
  if (asset.workerCertified && asset.workerExperience >= 5) strategies[3].score += 15;
  else if (!asset.workerCertified) { strategies[0].score += 10; strategies[1].score += 15; }

  strategies.sort((a, b) => b.score - a.score);
  return { recommended: strategies[0].name, ranked: strategies };
}

// ─── Main Assessment Function ─────────────────────────────────────────────────
export function assessAsset(asset) {
  const healthScore = rulesBasedScore(asset);
  const anomaly = anomalyScore(asset);
  const prediction = predictFailure(asset);
  const strategy = selectMaintenanceStrategy(asset);

  let riskLevel = 'Low';
  let recommendedAction = 'Continue Monitoring';
  let maintenanceStrategyRec = strategy.recommended;

  if (healthScore < 45 || asset.recentFaults >= 4 || asset.overdueDays > 28 || anomaly.score >= 50) {
    riskLevel = 'High';
    recommendedAction = asset.assetType === 'Pump' ? 'Inspect Bearing / Vibration Check'
      : asset.assetType === 'Boiler' ? 'Service / Scale Treatment / Escalate'
      : 'Service / Escalate';
  } else if (healthScore < 72 || asset.recentFaults >= 1 || asset.overdueDays > 7 || anomaly.score >= 25) {
    riskLevel = 'Medium';
    recommendedAction = asset.assetType === 'Burner' ? 'Combustion Tuning / Clean'
      : asset.assetType === 'Pump' ? 'Inspect / Lubricate / Check Seals'
      : 'Inspect / Tune / Clean';
  }

  // Maintenance strategy recommendation text
  const strategyRules = {
    'Reactive': 'Run-to-failure acceptable for low-criticality, redundant assets.',
    'Preventative': 'Schedule regular intervals based on operating hours and manufacturer specification.',
    'Condition-Based': 'Monitor key condition indicators and intervene when thresholds are crossed.',
    'Predictive': 'Use sensor trend data and predictive scoring to intervene before failure.',
  };

  const keyFactors = [
    asset.recentFaults > 0 ? `${asset.recentFaults} fault event(s) in last 30 days` : 'No recent fault events recorded',
    asset.overdueDays > 0 ? `Maintenance ${asset.overdueDays} day(s) overdue` : 'Maintenance schedule current',
    `Efficiency score: ${asset.efficiencyScore}%`,
    `Vibration: ${asset.vibration} mm/s ${asset.vibration > 30 ? '⚠ Above threshold' : '✓ Normal'}`,
    `Bearing temperature: ${asset.bearingTemp}°C ${asset.bearingTemp > 55 ? '⚠ Elevated' : '✓ Normal'}`,
    asset.waterHardness > 0 ? `Water hardness: ${asset.waterHardness} mg/L ${asset.waterHardness > 180 ? '⚠ Scale risk' : '✓ Acceptable'}` : null,
    `Asset age: ${asset.assetAge} years`,
    !asset.workerCertified ? '⚠ Assigned technician not certified for this asset type' : '✓ Certified technician assigned',
    asset.workerFatigue === 'High' ? '⚠ Operator fatigue risk flagged' : null,
  ].filter(Boolean);

  const supportingNotes = riskLevel === 'High'
    ? `Escalation recommended. Asset exhibits multiple high-risk indicators including overdue maintenance, repeated faults, and elevated sensor readings. Immediate inspection required to prevent unplanned failure.`
    : riskLevel === 'Medium'
    ? `Advisory action recommended. One or more condition indicators are outside the preferred operating range. Investigate and address before the next maintenance window to prevent degradation.`
    : `Asset remains within expected condition thresholds. Continue monitoring. Log any operational changes or observations in the audit record.`;

  return {
    ...asset,
    healthScore,
    riskLevel,
    recommendedAction,
    keyFactors,
    supportingNotes,
    reviewStatus: riskLevel === 'High' ? 'Pending Escalation' : riskLevel === 'Medium' ? 'Pending Review' : 'Ready for Approval',
    anomaly,
    prediction,
    strategyRecommendation: { name: maintenanceStrategyRec, rationale: strategyRules[maintenanceStrategyRec], ranked: strategy.ranked },
    confidenceScore: prediction.confidence,
  };
}

export function getDashboardMetrics(assessedAssets) {
  const total = assessedAssets.length;
  return [
    { label: 'Total Assets', value: total, helper: 'Tracked in selected fleet' },
    { label: 'Healthy Assets', value: assessedAssets.filter(a => a.riskLevel === 'Low').length, helper: 'Low-risk operating profile' },
    { label: 'Medium Risk', value: assessedAssets.filter(a => a.riskLevel === 'Medium').length, helper: 'Require inspection or tuning' },
    { label: 'High Risk', value: assessedAssets.filter(a => a.riskLevel === 'High').length, helper: 'Require service or escalation' },
    { label: 'Open Recommendations', value: assessedAssets.filter(a => a.riskLevel !== 'Low').length, helper: 'Action output generated' },
    { label: 'Pending Review', value: assessedAssets.filter(a => a.reviewStatus !== 'Ready for Approval').length, helper: 'Awaiting human decision' },
  ];
}
