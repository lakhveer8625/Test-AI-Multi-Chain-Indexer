-- Initialize database schema
-- This file is automatically executed when MySQL container starts

USE multi_chain_indexer;

-- Enable event scheduler for background jobs
SET GLOBAL event_scheduler = ON;

-- Create indexes for better query performance
-- (These will be created by TypeORM, but we can add additional optimizations here)

-- Add partitioning for large tables (example for raw_events)
-- ALTER TABLE raw_events PARTITION BY RANGE (YEAR(block_timestamp)) (
--     PARTITION p2024 VALUES LESS THAN (2025),
--     PARTITION p2025 VALUES LESS THAN (2026),
--     PARTITION p_future VALUES LESS THAN MAXVALUE
-- );

-- Log successful initialization
SELECT 'Database initialized successfully!' AS status;
