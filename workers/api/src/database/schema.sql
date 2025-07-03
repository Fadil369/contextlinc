-- ContextLinc Database Schema for Cloudflare D1

-- Users table for session management
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    email TEXT,
    name TEXT,
    preferences TEXT, -- JSON
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_active TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Messages table for conversation history
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    type TEXT NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    files TEXT, -- JSON array of file IDs
    metadata TEXT, -- JSON for additional data
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Files table for uploaded content
CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    r2_key TEXT NOT NULL, -- R2 storage key
    upload_timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    processing_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    processed_at TEXT,
    extracted_content TEXT, -- JSON
    embeddings_generated BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Context layers table for storing layer states
CREATE TABLE IF NOT EXISTS context_layers (
    id INTEGER PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    layer_id INTEGER NOT NULL,
    layer_name TEXT NOT NULL,
    status TEXT NOT NULL, -- 'active', 'inactive', 'processing'
    data TEXT, -- JSON
    token_count INTEGER DEFAULT 0,
    relevance_score REAL DEFAULT 0.0,
    last_update TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Memory table for three-tier memory system
CREATE TABLE IF NOT EXISTS memory (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_id TEXT,
    memory_type TEXT NOT NULL, -- 'short', 'medium', 'long'
    content TEXT NOT NULL,
    summary TEXT,
    embeddings TEXT, -- JSON array
    relevance_score REAL DEFAULT 0.0,
    access_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_accessed TEXT DEFAULT CURRENT_TIMESTAMP,
    expires_at TEXT, -- For short and medium-term memory
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Embeddings table for vector storage
CREATE TABLE IF NOT EXISTS embeddings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    content_id TEXT NOT NULL, -- Reference to file, message, or memory
    content_type TEXT NOT NULL, -- 'file', 'message', 'memory'
    embedding_vector TEXT NOT NULL, -- JSON array
    model_used TEXT NOT NULL,
    chunk_index INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tasks table for workflow management
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
    workflow_data TEXT, -- JSON
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Analytics table for context performance tracking
CREATE TABLE IF NOT EXISTS analytics (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'message', 'file_upload', 'context_build', etc.
    event_data TEXT, -- JSON
    processing_time_ms INTEGER,
    token_count INTEGER,
    confidence_score REAL,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id TEXT PRIMARY KEY,
    response_style TEXT DEFAULT 'balanced', -- 'concise', 'balanced', 'detailed'
    detail_level TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
    preferred_formats TEXT, -- JSON array
    context_settings TEXT, -- JSON
    privacy_settings TEXT, -- JSON
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_user_session ON messages(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_files_user_status ON files(user_id, processing_status);
CREATE INDEX IF NOT EXISTS idx_memory_user_type ON memory(user_id, memory_type);
CREATE INDEX IF NOT EXISTS idx_memory_relevance ON memory(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_embeddings_user_content ON embeddings(user_id, content_type);
CREATE INDEX IF NOT EXISTS idx_context_layers_user_session ON context_layers(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_timestamp ON analytics(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);

-- Triggers for automatic updates
CREATE TRIGGER IF NOT EXISTS update_user_last_active
    AFTER INSERT ON messages
    BEGIN
        UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = NEW.user_id;
    END;

CREATE TRIGGER IF NOT EXISTS update_task_timestamp
    AFTER UPDATE ON tasks
    BEGIN
        UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;