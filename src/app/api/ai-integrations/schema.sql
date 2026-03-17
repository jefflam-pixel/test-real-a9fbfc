CREATE TABLE IF NOT EXISTS p_a9fbfc9c_ai_integrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(255) NOT NULL,
  workflow_type varchar(100) NOT NULL,
  ai_process varchar(100) NOT NULL,
  business_unit varchar(100) NOT NULL,
  status varchar(50) DEFAULT 'pending',
  description text,
  success_rate integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE p_a9fbfc9c_ai_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON p_a9fbfc9c_ai_integrations 
  FOR ALL USING (true) WITH CHECK (true);