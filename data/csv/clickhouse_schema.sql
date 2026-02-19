-- ClickHouse Time-Series Schema
-- Optimized for time-series queries

CREATE TABLE IF NOT EXISTS sales_timeseries (
    timestamp DateTime,
    date Date,
    employee_id UInt32,
    employee_name String,
    metric String,
    value Float64,
    unit String,
    month String,
    quarter String
) Engine = MergeTree()
ORDER BY (timestamp, employee_id)
PARTITION BY toYYYYMM(timestamp);

CREATE TABLE IF NOT EXISTS transactions_timeseries (
    timestamp DateTime,
    date Date,
    transaction_type String,
    amount Float64,
    account_id UInt32,
    account_name String,
    status String
) Engine = MergeTree()
ORDER BY (timestamp, account_id)
PARTITION BY toYYYYMM(timestamp);

CREATE TABLE IF NOT EXISTS employee_metrics_timeseries (
    timestamp DateTime,
    date Date,
    employee_id UInt32,
    employee_name String,
    department String,
    metric_type String,
    metric_value UInt8,
    unit String
) Engine = MergeTree()
ORDER BY (timestamp, employee_id)
PARTITION BY toYYYYMM(timestamp);
