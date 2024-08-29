import { subDays } from 'date-fns';

const feeds = [
    {
        "feed_title": "Serious News",
        "blocks": [
            {
                "header": "Articles in The Atlantic",
                "prisma_function": "findMany",
                "prisma_args": {
                    "take": 10,
                    "where": {
                        "source_name": "The Atlantic",
                        "seen": false,
                    },
                    "include": {
                        "authors": true
                    },
                    "orderBy": {
                        "date_published": "desc"
                    }
                }
            },
            {
                "header": "More articles",
                "prisma_function": "findMany",
                "prisma_args": {
                    "where": {
                        "source_name": "The New York Times",
                        "seen": false,
                        "date_published": {
                            "gt": subDays(new Date(), 1) // only show articles from the last day
                        }
                    },
                    "include": {
                        "authors": true
                    },
                    "orderBy": {
                        "date_published": "desc"
                    }
                }
            },
        ]
    },
    {
        "feed_title": "Tech News",
        "blocks": [
            {
                "header": "Hacker News",
                "prisma_function": "findMany",
                "prisma_args": {
                    "where": {
                        "source_name": "Hacker News",
                        "date_published": {
                            "gt": subDays(new Date(), 1) // only show articles from the last day
                        }
                    },
                    "include": {
                        "authors": true
                    },
                    "orderBy": {
                        "date_published": "desc"
                    }
                }
            }
        ]
    },
    {
        "feed_title": "All Unseen Items",
        "blocks": [
            {
                "header": "Unseen Items",
                "prisma_function": "findMany",
                "prisma_args": {
                    "where": {
                        "seen": false
                    },
                    "include": {
                        "authors": true
                    },
                    "orderBy": {
                        "date_published": "desc"
                    }
                }
            }
        ]
    },
    {
        "feed_title": "Read Later",
        "blocks": [
            {
                "header": "Read Later",
                "prisma_function": "findMany",
                "prisma_args": {
                    "where": {
                        "read_later": true
                    },
                    "include": {
                        "authors": true
                    }
                }
            }
        ]
    },
    {
        "feed_title": "Favorites",
        "blocks": [
            {
                "header": "Favorites",
                "prisma_function": "findMany",
                "prisma_args": {
                    "where": {
                        "saved": true
                    },
                    "include": {
                        "authors": true
                    }
                }
            }
        ]
    }
]

export default feeds;