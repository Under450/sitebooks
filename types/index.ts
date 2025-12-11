// Database types
export interface Job {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  
  // Job details
  property_address: string;
  job_type: string;
  custom_job_type?: string;
  description?: string;
  
  // Customer info
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  
  // Financial
  amount_invoiced: number;
  payment_status: 'unpaid' | 'invoiced' | 'paid';
  payment_date?: string;
  
  // Dates
  job_date: string;
  completion_date?: string;
  
  // Tax year
  tax_year: string; // Format: "2024/2025"
  
  // Status
  status: 'active' | 'completed' | 'archived';
  
  // Notes
  notes?: string;
}

export interface Receipt {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  job_id: string;
  
  // Receipt details
  date: string;
  supplier: string;
  custom_supplier?: string;
  amount: number;
  vat_amount: number;
  
  // Category
  category: 'materials' | 'subcontractor' | 'tools' | 'transport' | 'other';
  
  // Items purchased
  items_description?: string;
  
  // Image
  image_url?: string;
  image_path?: string;
  
  // OCR data
  ocr_text?: string;
  ocr_confidence?: number;
  
  // Notes
  notes?: string;
}

export interface MileageEntry {
  id: string;
  created_at: string;
  user_id: string;
  job_id: string;
  
  // Trip details
  date: string;
  from_location: string;
  to_location: string;
  miles: number;
  
  // Rate (HMRC standard)
  rate_per_mile: number; // 0.45 for first 10k, 0.25 after
  
  // Calculated
  amount: number;
  
  // Notes
  purpose?: string;
  notes?: string;
}

export interface TaxYear {
  year_label: string; // "2024/2025"
  start_date: string; // "2024-04-06"
  end_date: string;   // "2025-04-05"
  total_income: number;
  total_costs: number;
  total_profit: number;
  total_vat_paid: number;
  job_count: number;
}

// UI types
export const JOB_TYPES = [
  'Kitchen Fitting',
  'Bathroom Installation',
  'Plumbing Repairs',
  'Electrical Work',
  'Heating & Boiler',
  'Plastering',
  'Painting & Decorating',
  'Flooring',
  'Carpentry',
  'Bricklaying',
  'Roofing',
  'General Building',
  'Extensions',
  'Renovations',
  'General Repairs',
  'Other'
] as const;

export const SUPPLIERS = [
  'Wickes',
  'Screwfix',
  'B&Q',
  'Toolstation',
  'Travis Perkins',
  'Jewson',
  'Homebase',
  'Selco',
  'City Plumbing',
  'Other'
] as const;

export const RECEIPT_CATEGORIES = [
  'materials',
  'subcontractor',
  'tools',
  'transport',
  'other'
] as const;

export type JobType = typeof JOB_TYPES[number];
export type Supplier = typeof SUPPLIERS[number];
export type ReceiptCategory = typeof RECEIPT_CATEGORIES[number];
