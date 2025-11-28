-- Postgres schema for Membership Auto (starter)
-- Run: psql -d membership_auto -f db_schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT,
  membership_id TEXT,
  referral_code TEXT,
  rewards_balance INTEGER DEFAULT 0,
  role TEXT DEFAULT 'member',
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  price_monthly INTEGER NOT NULL,
  tier TEXT,
  features JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id),
  status TEXT,
  started_at TIMESTAMPTZ,
  next_billing_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vin TEXT,
  make TEXT,
  model TEXT,
  trim TEXT,
  year INTEGER,
  license_plate TEXT,
  odometer NUMERIC,
  dongle_id TEXT,
  dongle_connection_type TEXT,
  fuel_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE telematics_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ,
  odometer NUMERIC,
  fuel_used NUMERIC,
  speed_avg NUMERIC,
  dtc JSONB,
  raw JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE fuel_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ,
  odometer NUMERIC,
  gallons NUMERIC,
  price NUMERIC,
  mpg NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  vehicle_id UUID REFERENCES vehicles(id),
  location_id UUID,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  services JSONB,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  description TEXT,
  terms TEXT,
  expiry TIMESTAMPTZ,
  eligible_memberships JSONB,
  locations JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_user_id UUID REFERENCES users(id),
  referred_user_id UUID REFERENCES users(id),
  code TEXT,
  status TEXT,
  rewards_applied JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE chat_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  subject TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES chat_threads(id) ON DELETE CASCADE,
  sender TEXT,
  body TEXT,
  attachments JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  filename TEXT,
  url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_vehicles_user ON vehicles(user_id);
CREATE INDEX idx_telematics_vehicle ON telematics_snapshots(vehicle_id);
