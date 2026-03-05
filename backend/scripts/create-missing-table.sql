-- Create missing object_triggers table
-- Run from WSL: psql -U postgres -d ecg_digital_city -f backend/scripts/create-missing-table.sql

-- Create object_triggers table
CREATE TABLE IF NOT EXISTS object_triggers (
    id SERIAL PRIMARY KEY,
    object_id INTEGER NOT NULL REFERENCES interactive_objects(id) ON DELETE CASCADE,
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('state_change', 'grant_xp', 'unlock_achievement', 'teleport', 'custom')),
    trigger_data JSONB DEFAULT '{}',
    priority INTEGER DEFAULT 0,
    condition JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_object_triggers_object_id ON object_triggers(object_id);
CREATE INDEX IF NOT EXISTS idx_object_triggers_type ON object_triggers(trigger_type);
CREATE INDEX IF NOT EXISTS idx_object_triggers_priority ON object_triggers(priority DESC);
CREATE INDEX IF NOT EXISTS idx_object_triggers_active ON object_triggers(is_active) WHERE is_active = true;

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_object_triggers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_object_triggers_updated_at
    BEFORE UPDATE ON object_triggers
    FOR EACH ROW
    EXECUTE FUNCTION update_object_triggers_updated_at();

-- Verify table was created
\d object_triggers

SELECT 'object_triggers table created successfully!' AS status;
