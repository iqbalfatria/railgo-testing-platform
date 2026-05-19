-- Migration 002: Add schedule_dates table
-- Enables per-date seat availability tracking for each train schedule

CREATE TABLE IF NOT EXISTS schedule_dates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  schedule_id INT NOT NULL,
  travel_date DATE NOT NULL,
  available_seats INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_schedule_date (schedule_id, travel_date),
  FOREIGN KEY (schedule_id) REFERENCES train_schedules(id) ON DELETE CASCADE
);
