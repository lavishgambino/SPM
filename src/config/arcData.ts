// Sample dataset modeled after Arc 6 demandIntakeData — slimmed for self-contained reporting pages.
export interface ArcInitiative {
  id: string;
  name: string;
  initiativeType: "change" | "grow" | "run";
  priority: "Critical" | "High" | "Medium" | "Low";
  riskLevel: "High" | "Medium" | "Low";
  department: string;
  estimatedTotalBudget: number; // $M
  estimatedFTEs: number;
  capexOpexSplit: "CapEx" | "OpEx" | "Mixed";
  projectSponsor: string;
  projectManager: string;
  estimatedStartDate: string;
  estimatedEndDate: string;
  criticalRolesRequired: string;
}

const dept = [
  "Clinical Informatics", "Information Technology", "Patient Experience", "Human Resources",
  "Supply Chain & Procurement", "Compliance & Privacy", "Finance", "Revenue Cycle",
  "Digital & AI", "Infrastructure",
];
const sponsors = ["Jane Morrison", "Tom Blake", "Lisa Park", "Dana Ross", "Robert Kim", "Carla Nguyen", "Greg Mason", "Helen Cho", "Victor Singh", "Megan Liu"];
const pms = ["Kevin Patel", "Sarah Chen", "Marcus Williams", "James Liu", "Angela Torres", "Derek Johnson", "Priya Sharma", "Nathan Brooks", "Michelle Carter", "Sophie Adams"];
const roles = ["Clinical Informaticist", "Data Engineer", "PM", "EHR Analyst", "Business Analyst", "Software Engineer", "QA Analyst", "Security Analyst", "UX Designer", "DevOps Engineer"];
const types: ArcInitiative["initiativeType"][] = ["change", "grow", "run"];
const priorities: ArcInitiative["priority"][] = ["Critical", "High", "Medium", "Low"];
const risks: ArcInitiative["riskLevel"][] = ["High", "Medium", "Low"];
const splits: ArcInitiative["capexOpexSplit"][] = ["CapEx", "OpEx", "Mixed"];

const projectNames = [
  "EHR Platform Core Infrastructure", "Cybersecurity & Zero Trust Program", "Patient Portal & Digital Front Door",
  "HR & Workforce Management Modernization", "Clinical Supply Chain Visibility", "Health Data Governance Program",
  "Physician Engagement & Referral CRM", "Accounts Payable Automation", "AI-Powered Deterioration Detection",
  "CMS Quality Reporting Automation", "Cloud Infrastructure Migration", "Telehealth Platform Expansion",
  "Bed Management & Discharge Predict", "Nursing Scheduling Optimization", "Revenue Cycle Denial Analytics",
  "Pharmacy Inventory Automation", "Identity & Access Modernization", "Endpoint & Ransomware Protection",
  "Disaster Recovery Automation", "Care Coordination Platform", "Ambient Documentation Pilot",
  "Clinical Pathway Standardization", "Medication Safety Automation", "ED Throughput Optimization",
  "Virtual Visit Expansion", "Self-Service Analytics Enablement", "Readmission Prediction Models",
  "App Rationalization Wave 1", "Vendor Consolidation Initiative", "Regulatory Tracking Automation",
  "Policy & Accreditation Management", "Patient Billing & Collections", "Contract Utilization Enforcement",
  "Clinical Command Center Expansion", "Internal Float Pool Platform",
];

function seededRand(seed: string, idx: number) {
  let h = 0;
  const s = seed + idx;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h % 1000) / 1000;
}

export const demandInitiatives: ArcInitiative[] = projectNames.map((name, i) => {
  const id = `PRJ-${String(i + 1).padStart(3, "0")}`;
  const r = (k: number) => seededRand(id, k);
  return {
    id,
    name,
    initiativeType: types[Math.floor(r(0) * types.length)],
    priority: priorities[Math.floor(r(1) * priorities.length)],
    riskLevel: risks[Math.floor(r(2) * risks.length)],
    department: dept[Math.floor(r(3) * dept.length)],
    estimatedTotalBudget: +(0.4 + r(4) * 5).toFixed(2),
    estimatedFTEs: 2 + Math.floor(r(5) * 12),
    capexOpexSplit: splits[Math.floor(r(6) * splits.length)],
    projectSponsor: sponsors[Math.floor(r(7) * sponsors.length)],
    projectManager: pms[Math.floor(r(8) * pms.length)],
    estimatedStartDate: `0${1 + Math.floor(r(9) * 9)}/01/27`,
    estimatedEndDate: `${10 + Math.floor(r(10) * 3)}/30/27`,
    criticalRolesRequired: roles[Math.floor(r(11) * roles.length)],
  };
});

export const BUDGET_GUARDRAILS = {
  totalBudget: 300,
  investmentMix: { run: 55, change: 30, grow: 15 },
  capexOpex: { capex: 35, opex: 65 },
  vendorSpend: 30,
  riskBuffer: { min: 8, max: 10 },
  concentration: 10,
};

export const CAPACITY_GUARDRAILS = {
  totalCapacity: 3000,
  utilization: { target: 82, max: 90 },
  laborMix: 25,
  throughput: 30,
};

export function arcSeed(seed: string, idx: number) {
  return seededRand(seed, idx);
}
