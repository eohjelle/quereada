CREATE TABLE IF NOT EXISTS sources (
    source_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    source_type VARCHAR(255) NOT NULL,
    date_added DATE,
    logo_link VARCHAR(510)
);

CREATE TABLE IF NOT EXISTS items (
    item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_type VARCHAR(255) NOT NULL,
    source VARCHAR(255) NOT NULL,
    language VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    link VARCHAR(510) NOT NULL,
    authors VARCHAR(510), -- Storing list of authors as a JSON string
    date_published DATE,
    date_added DATE,
    likes INTEGER,
    comments_link VARCHAR(510),
    comments_summary TEXT,
    content TEXT,
    number_of_words INTEGER,
    summary TEXT,
    image_link VARCHAR(510),
    image_caption TEXT,
    image_credit VARCHAR(510),
    relevant_to_topics_of_interest BOOLEAN,
    relevant_to_topics_of_avoidance BOOLEAN,
    seen BOOLEAN DEFAULT FALSE,
    read_later BOOLEAN DEFAULT FALSE,
    favorite BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (source) REFERENCES sources(name)
);

CREATE VIEW IF NOT EXISTS links AS 
    SELECT source, title, link, date_published, date_added FROM items WHERE item_type = 'Link'
    ORDER BY date_added DESC;

CREATE VIEW IF NOT EXISTS full_text_articles AS 
    SELECT source, language, title, description, link, authors, date_published, date_added, content, number_of_words, summary, image_link, image_caption, image_credit FROM items WHERE item_type = 'FullTextArticle'
    ORDER BY date_added DESC;