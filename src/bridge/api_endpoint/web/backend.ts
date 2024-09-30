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

        this.app.use('/api/get_summary', express.urlencoded());
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
    }
}