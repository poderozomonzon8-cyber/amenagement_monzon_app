-- BillingPanel enhancements - safe ADD IF NOT EXISTS
ALTER TABLE billing_documents 
ADD COLUMN IF NOT EXISTS logo text,
ADD COLUMN IF NOT EXISTS payments jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS recurring jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS payment_link text,
ADD COLUMN IF NOT EXISTS palette text DEFAULT 'default',
ADD COLUMN IF NOT EXISTS template text DEFAULT 'classic',
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'CAD',
ADD COLUMN IF NOT EXISTS layout text DEFAULT 'single',
ADD COLUMN IF NOT EXISTS font text DEFAULT 'roboto';

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_billing_status ON billing_documents(status);
CREATE INDEX IF NOT EXISTS idx_billing_due ON billing_documents(due_date);
CREATE INDEX IF NOT EXISTS idx_billing_client ON billing_documents(client_id);

-- Run in Supabase SQL Editor
