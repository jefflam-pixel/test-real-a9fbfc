CREATE TABLE IF NOT EXISTS p_a9fbfc9c_pipelines (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(255) NOT NULL,
  status varchar(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  current_stage varchar(50) DEFAULT 'dev_ai' CHECK (current_stage IN ('dev_ai', 'build_plan', 'build_deploy', 'completed')),
  dev_ai_status varchar(50) DEFAULT 'pending' CHECK (dev_ai_status IN ('pending', 'running', 'completed', 'failed', 'waiting')),
  build_plan_status varchar(50) DEFAULT 'waiting' CHECK (build_plan_status IN ('pending', 'running', 'completed', 'failed', 'waiting')),
  build_deploy_status varchar(50) DEFAULT 'waiting' CHECK (build_deploy_status IN ('pending', 'running', 'completed', 'failed', 'waiting')),
  repository_url varchar(500) NOT NULL,
  deployment_url varchar(500),
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE p_a9fbfc9c_pipelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON p_a9fbfc9c_pipelines FOR ALL USING (true) WITH CHECK (true);

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