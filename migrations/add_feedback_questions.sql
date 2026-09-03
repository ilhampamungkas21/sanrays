-- Create feedback_questions table
CREATE TABLE IF NOT EXISTS feedback_questions (
  id VARCHAR(36) PRIMARY KEY,
  event_id VARCHAR(36) NOT NULL,
  question_text TEXT NOT NULL,
  question_type ENUM('rating', 'text', 'multiple_choice') DEFAULT 'text',
  options TEXT,
  is_required BOOLEAN DEFAULT TRUE,
  order_num INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  INDEX idx_event_id (event_id)
);

-- Create feedback_answers table for custom question answers
CREATE TABLE IF NOT EXISTS feedback_answers (
  id VARCHAR(36) PRIMARY KEY,
  feedback_id VARCHAR(36) NOT NULL,
  question_id VARCHAR(36) NOT NULL,
  answer_value TEXT,
  rating_value INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (feedback_id) REFERENCES feedback(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES feedback_questions(id) ON DELETE CASCADE,
  INDEX idx_feedback_id (feedback_id),
  INDEX idx_question_id (question_id)
);
