// Vercel serverless function — receives form POST, logs row to Google Sheet via Apps Script webhook.
// Requires environment variables: SHEET_WEBHOOK_URL, SHEET_WEBHOOK_SECRET

export const config = {
  // Pitch file uploads arrive as base64 inside the JSON body, so we
  // need to allow larger bodies than the default 1MB. 4.5MB is the
  // Vercel free-tier ceiling; the frontend already enforces a 4MB
  // limit on the raw file before base64 encoding.
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    track,
    name,
    email,
    // cohort track
    age,
    experience,
    referral,
    goals,
    // founder track
    education,
    revenueStage,
    householdIncome,
    ideaStatus,
    pitchLink,
    pitchSummary,
    hoursPerWeek,
    projectGoals,
    // founder pitch attachment (link or uploaded file)
    pitchAttachType,
    pitchFileName,
    pitchFileSize,
    pitchFileType,
    pitchFileData
  } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  // Basic email shape check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  try {
    await logToSheet({
      track: track || 'cohort',
      name,
      email,
      age: age || '',
      experience: experience || '',
      referral: referral || '',
      goals: goals || '',
      education: education || '',
      revenueStage: revenueStage || '',
      householdIncome: householdIncome || '',
      ideaStatus: ideaStatus || '',
      pitchLink: pitchLink || '',
      pitchSummary: pitchSummary || '',
      hoursPerWeek: hoursPerWeek || '',
      projectGoals: projectGoals || '',
      pitchAttachType: pitchAttachType || '',
      pitchFileName: pitchFileName || '',
      pitchFileSize: pitchFileSize || '',
      pitchFileType: pitchFileType || '',
      pitchFileData: pitchFileData || ''
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Sheet logging error:', err);
    return res.status(500).json({ error: 'Could not record your registration. Please try again.' });
  }
}

async function logToSheet({
  track,
  name,
  email,
  age,
  experience,
  referral,
  goals,
  education,
  revenueStage,
  householdIncome,
  ideaStatus,
  pitchLink,
  pitchSummary,
  hoursPerWeek,
  projectGoals,
  pitchAttachType,
  pitchFileName,
  pitchFileSize,
  pitchFileType,
  pitchFileData
}) {
  const url = process.env.SHEET_WEBHOOK_URL;
  const secret = process.env.SHEET_WEBHOOK_SECRET;
  if (!url || !secret) {
    throw new Error('Missing SHEET_WEBHOOK_URL or SHEET_WEBHOOK_SECRET env vars.');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret,
      track,
      name,
      email,
      age,
      experience,
      referral,
      goals,
      education,
      revenueStage,
      householdIncome,
      ideaStatus,
      pitchLink,
      pitchSummary,
      hoursPerWeek,
      projectGoals,
      pitchAttachType,
      pitchFileName,
      pitchFileSize,
      pitchFileType,
      pitchFileData
    }),
    redirect: 'follow'
  });
  if (!response.ok) {
    throw new Error(`Sheet webhook returned ${response.status}`);
  }
}
