-- SiteBooks Database Schema
-- UK Tax Year: April 6 - April 5

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL,
    
    -- Job details
    property_address TEXT NOT NULL,
    job_type TEXT NOT NULL,
    custom_job_type TEXT,
    description TEXT,
    
    -- Customer info
    customer_name TEXT,
    customer_phone TEXT,
    customer_email TEXT,
    
    -- Financial
    amount_invoiced DECIMAL(10, 2) DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'invoiced', 'paid')),
    payment_date DATE,
    
    -- Dates
    job_date DATE NOT NULL,
    completion_date DATE,
    
    -- Tax year (format: "2024/2025")
    tax_year TEXT NOT NULL,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    
    -- Notes
    notes TEXT
);

-- Receipts table
CREATE TABLE receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    
    -- Receipt details
    date DATE NOT NULL,
    supplier TEXT NOT NULL,
    custom_supplier TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    vat_amount DECIMAL(10, 2) DEFAULT 0,
    
    -- Category
    category TEXT NOT NULL CHECK (category IN ('materials', 'subcontractor', 'tools', 'transport', 'other')),
    
    -- Items purchased
    items_description TEXT,
    
    -- Image
    image_url TEXT,
    image_path TEXT,
    
    -- OCR data
    ocr_text TEXT,
    ocr_confidence DECIMAL(5, 2),
    
    -- Notes
    notes TEXT
);

-- Mileage entries table
CREATE TABLE mileage_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    
    -- Trip details
    date DATE NOT NULL,
    from_location TEXT NOT NULL,
    to_location TEXT NOT NULL,
    miles DECIMAL(10, 2) NOT NULL,
    
    -- Rate (HMRC standard: 45p first 10k miles, 25p after)
    rate_per_mile DECIMAL(5, 2) NOT NULL,
    
    -- Calculated amount
    amount DECIMAL(10, 2) NOT NULL,
    
    -- Notes
    purpose TEXT,
    notes TEXT
);

-- Indexes for performance
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_tax_year ON jobs(tax_year);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_payment_status ON jobs(payment_status);
CREATE INDEX idx_jobs_job_date ON jobs(job_date);

CREATE INDEX idx_receipts_user_id ON receipts(user_id);
CREATE INDEX idx_receipts_job_id ON receipts(job_id);
CREATE INDEX idx_receipts_date ON receipts(date);

CREATE INDEX idx_mileage_user_id ON mileage_entries(user_id);
CREATE INDEX idx_mileage_job_id ON mileage_entries(job_id);
CREATE INDEX idx_mileage_date ON mileage_entries(date);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON receipts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mileage_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies (assuming auth.uid() returns the authenticated user's ID)
CREATE POLICY "Users can view their own jobs"
    ON jobs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own jobs"
    ON jobs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs"
    ON jobs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs"
    ON jobs FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own receipts"
    ON receipts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own receipts"
    ON receipts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own receipts"
    ON receipts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own receipts"
    ON receipts FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own mileage"
    ON mileage_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mileage"
    ON mileage_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mileage"
    ON mileage_entries FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mileage"
    ON mileage_entries FOR DELETE
    USING (auth.uid() = user_id);

-- View for tax year summaries
CREATE OR REPLACE VIEW tax_year_summaries AS
SELECT 
    user_id,
    tax_year,
    COUNT(*) as job_count,
    SUM(amount_invoiced) as total_income,
    COALESCE((
        SELECT SUM(r.amount)
        FROM receipts r
        WHERE r.job_id = jobs.id
    ), 0) as total_costs,
    SUM(amount_invoiced) - COALESCE((
        SELECT SUM(r.amount)
        FROM receipts r
        WHERE r.job_id = jobs.id
    ), 0) as total_profit,
    COALESCE((
        SELECT SUM(r.vat_amount)
        FROM receipts r
        WHERE r.job_id = jobs.id
    ), 0) as total_vat_paid
FROM jobs
GROUP BY user_id, tax_year;

-- Storage bucket for receipt images
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false);

-- Storage policies
CREATE POLICY "Users can upload their own receipts"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own receipts"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own receipts"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own receipts"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
