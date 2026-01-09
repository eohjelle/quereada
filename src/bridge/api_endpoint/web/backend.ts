import { type Express } from 'express';
import express from 'express';
import { EndpointBackend } from '../backend';


export class WebEndpointBackend extends EndpointBackend {
    private app: Express; // A reference to the express app that handles requests on the web server
    
    constructor(app: Express) {
        super();
        this.app = app;

        this.app.use('/api/update_item', express.json());
        this.app.post('/api/update_item', async (req, res) => {
            try {
                await this.itemUpdate(req.body);
                res.status(200).json({ message: 'Item updated successfully' });
            } catch (error) {
                console.error('Error updating item:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        this.app.use('/api/get_summary', express.urlencoded({ extended: false }));
        this.app.get('/api/get_summary', async (req, res) => {
            try {
                console.log('Received request to get summary:', req.query);
                const itemId = Number(req.query.item_id);
                if (isNaN(itemId)) {
                    throw new Error('Invalid item_id');
                }
                const summaryStream = await this.getSummary(itemId);

                res.setHeader('Content-Type', 'text/event-stream');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Connection', 'keep-alive');

                summaryStream
                    .pipeThrough(new TextEncoderStream())
                    .pipeTo(new WritableStream({
                        write(chunk) {
                            res.write(chunk);
                        },
                        close() {
                            res.end();
                        }
                    }));
            } catch (error) {
                console.error('Error getting summary:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        this.app.get('/api/refresh_feeds', async (req, res) => {
            try {
                await this.refreshFeeds();
                res.status(200).json({ message: 'Feeds refreshed successfully' });
            } catch (error) {
                console.error('Error refreshing feeds:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        this.app.get('/api/get_feed_data', async (req, res) => {
            try {
                const feedData = await this.getFeedData();
                res.status(200).json(feedData);
            } catch (error) {
                console.error('Error getting feed data:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        this.app.get('/api/get_raw_config', async (req, res) => {
            try {
                const rawConfig = await this.getRawConfig();
                res.status(200).send(rawConfig);
            } catch (error) {
                console.error('Error getting raw config:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        this.app.use('/api/generate_digest', express.urlencoded({ extended: false }));
        this.app.get('/api/generate_digest', async (req, res) => {
            try {
                const blockTitle = req.query.block_title as string;
                if (!blockTitle) {
                    throw new Error('Missing block_title parameter');
                }
                const digestStream = await this.generateDigest(blockTitle);

                res.setHeader('Content-Type', 'text/event-stream');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Connection', 'keep-alive');

                digestStream
                    .pipeThrough(new TextEncoderStream())
                    .pipeTo(new WritableStream({
                        write(chunk) {
                            res.write(chunk);
                        },
                        close() {
                            res.end();
                        }
                    }));
            } catch (error) {
                console.error('Error generating digest:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        this.app.use('/api/get_digest_items', express.json());
        this.app.post('/api/get_digest_items', async (req, res) => {
            try {
                const itemIds = req.body.item_ids as number[];
                if (!Array.isArray(itemIds)) {
                    throw new Error('Invalid item_ids parameter');
                }
                const items = await this.getDigestItems(itemIds);
                res.status(200).json(items);
            } catch (error) {
                console.error('Error getting digest items:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // RSS feed validation
        this.app.use('/api/validate_rss_feed', express.json());
        this.app.post('/api/validate_rss_feed', async (req, res) => {
            try {
                const { url } = req.body;
                if (!url || typeof url !== 'string') {
                    throw new Error('Invalid url parameter');
                }
                const result = await this.validateRssFeed(url);
                res.status(200).json(result);
            } catch (error) {
                console.error('Error validating RSS feed:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // RSS feed discovery
        this.app.use('/api/discover_rss_feeds', express.json());
        this.app.post('/api/discover_rss_feeds', async (req, res) => {
            try {
                const { url } = req.body;
                if (!url || typeof url !== 'string') {
                    throw new Error('Invalid url parameter');
                }
                const result = await this.discoverRssFeeds(url);
                res.status(200).json(result);
            } catch (error) {
                console.error('Error discovering RSS feeds:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // Add RSS source
        this.app.use('/api/add_rss_source', express.json());
        this.app.post('/api/add_rss_source', async (req, res) => {
            try {
                const result = await this.addRssSource(req.body);
                res.status(result.success ? 200 : 400).json(result);
            } catch (error) {
                console.error('Error adding RSS source:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // Add query
        this.app.use('/api/add_query', express.json());
        this.app.post('/api/add_query', async (req, res) => {
            try {
                const { query, createFeed = true } = req.body;
                const result = await this.addQuery(query, createFeed);
                res.status(result.success ? 200 : 400).json(result);
            } catch (error) {
                console.error('Error adding query:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // Get available sources
        this.app.get('/api/get_available_sources', async (req, res) => {
            try {
                const sources = await this.getAvailableSources();
                res.status(200).json(sources);
            } catch (error) {
                console.error('Error getting available sources:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // Get available filters
        this.app.get('/api/get_available_filters', async (req, res) => {
            try {
                const filters = await this.getAvailableFilters();
                res.status(200).json(filters);
            } catch (error) {
                console.error('Error getting available filters:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // Get available blocks
        this.app.get('/api/get_available_blocks', async (req, res) => {
            try {
                const blocks = await this.getAvailableBlocks();
                res.status(200).json(blocks);
            } catch (error) {
                console.error('Error getting available blocks:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // Add digest block
        this.app.use('/api/add_digest', express.json());
        this.app.post('/api/add_digest', async (req, res) => {
            try {
                const result = await this.addDigest(req.body);
                res.status(result.success ? 200 : 400).json(result);
            } catch (error) {
                console.error('Error adding digest:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // Add feed
        this.app.use('/api/add_feed', express.json());
        this.app.post('/api/add_feed', async (req, res) => {
            try {
                const result = await this.addFeed(req.body);
                res.status(result.success ? 200 : 400).json(result);
            } catch (error) {
                console.error('Error adding feed:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
}