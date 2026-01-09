import type { ConfigSource, ConfigFilter, ConfigQuery, ConfigBlock, ConfigFeed } from './src/backend/load_config';

// Date utilities (subDays, addDays, etc.) are available as globals - no import needed
declare const subDays: (date: Date, amount: number) => Date;


export const sources: ConfigSource[] =
[
    {
        name: 'The New York Times',
        implementation: 'RSS',
        args: {
            urls: [
                'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
                'https://rss.nytimes.com/services/xml/rss/nyt/MostShared.xml'
            ]
        },
        default_values: {
            item_type: 'Article',
            lang_id: 'en',
            summarizable: false
        }
    },
    {
        name: 'The Atlantic',
        implementation: 'RSS',
        args: {
            urls: [ 'https://www.theatlantic.com/feed/bestof/' ]
        },
        default_values: {
            item_type: 'Article',
            lang_id: 'en',
            summarizable: true
        }
    },
    {
        name: "Dan Carlin's Substack",
        implementation: 'RSS',
        args: {
            urls: [ 'https://dancarlin.substack.com/feed' ]
        },
        default_values: {
            item_type: 'Article',
            lang_id: 'en',
            summarizable: true
        }
    },
    {
        name: "Aeon",
        implementation: "Aeon"
    }
];

export const filters: ConfigFilter[] =
[
    {
        title: "Donald Trump",
        implementation: "RelevantToTopics",
        args: {
            topics: [
                "Donald Trump",
                "POTUS",
                "President of the United States"
            ]
        }
    },
    {
        title: "Relevant to Environmental Issues",
        implementation: "RelevantToTopics",
        args: {
            topics: [
                "The Environment",
                "Climate Change",
                "Global Warming",
                "Pollution",
                "Green Energy",
                "Waste Management"
            ]
        }
    },
    {
        title: "Wars",
        implementation: "RelevantToTopics",
        args: {
            topics: [
                "War",
                "Armed Conflict",
                "Israeli-Palestinian Conflict",
                "Russo-Ukrainian War"
            ]
        }
    }
];

export const queries: ConfigQuery[] =
[
    {
        title: "Trump & War Free News",
        where: {
            source_name: {
                in: [ "The Atlantic", "The New York Times" ]
            },
            filters_passed: {
                none: {
                    title: {
                        in: [ "Donald Trump", "Wars" ]
                    }
                }
            }
        },
        orderBy: {
            date_published: "desc"
        }
    },
    {
        title: "Food for Thought",
        where: {
            OR: [
                {
                    source_name: {
                        in: [ "The Atlantic" ]
                    },
                    number_of_words: {
                        gte: 3500
                    }
                },
                {
                    source_name: "Aeon"
                }
            ]
        },
        orderBy: {
            date_added: "desc"
        }
    },
    {
        title: "Trump News",
        where: {
            source_name: {
                in: [ "The Atlantic", "The New York Times" ]
            },
            filters_passed: {
                some: {
                    title: "Donald Trump"
                }
            },
        },
        orderBy: {
            date_published: "desc"
        }
    },
    {
        title: "Wars",
        where: {
            source_name: {
                in: [ "The Atlantic", "The New York Times" ]
            },
            filters_passed: {
                some: { title: "Wars" }
            }
        },
        orderBy: {
            date_published: "desc"
        }
    },
    {
        title: "Environmental News",
        where: {
            filters_passed: {
                some: {
                    title: "Relevant to Environmental Issues"
                }
            },
            source_name: {
                in: ["The Atlantic", "The New York Times"]
            }
        },
        orderBy: {
            date_published: "desc"
        }
    },
    {
        title: "Articles by George Packer",
        where: {
            authors: {
                some: {
                    name: "George Packer"
                }
            }
        },
        orderBy: {
            date_published: "desc"
        }
    },
    {
        title: "Articles by Olga Khazan",
        where: {
            authors: {
                some: {
                    name: "Olga Khazan"
                }
            }
        },
        orderBy: {
            date_published: "desc"
        }
    },
    {
        title: "Dan Carlin",
        where: {
            authors: {
                some: { name: "Dan Carlin" }
            }
        },
        orderBy: {
            date_published: "desc"
        }
    },
    {
        title: "Unseen Items",
        where: {
            seen: {
                equals: 0
            }
        },
        orderBy: {
            date_added: "desc"
        }
    },
    {
        title: "Read Later",
        where: {
            read_later: true
        },
        orderBy: {
            date_added: "desc"
        }
    },
    {
        title: "Saved items",
        where: {
            saved: true
        },
        orderBy: {
            date_added: "desc"
        }
    },
    {
        title: "All items",
        orderBy: {
            id: "desc"
        }
    },
    {
        title: "Daily Briefing Items",
        where: {
            source_name: {
                in: ["The Atlantic", "The New York Times"]
            },
            date_added: {
                gte: subDays(new Date(), 3)
            }
        },
        orderBy: {
            date_published: "desc"
        },
        take: 15
    }
];

export const blocks: ConfigBlock[] =
[
    {
        title: "Daily Briefing",
        implementation: "NewsBriefing",
        args: {
            focus_areas: ["politics", "technology", "culture"],
            input_blocks: ["Daily Briefing Items"]
        }
    }
,
    {
        title: 'Thoughts of the moment',
        implementation: 'NewsBriefing',
        args: {
            input_blocks: [ 'Articles by George Packer', 'Daily Briefing', 'Food for Thought' ],
            focus_areas: [ 'society', 'vibes' ]
        }
    }
];

export const feeds: ConfigFeed[] =
[
    {
        title: "Daily Digest",
        blocks: [ "Daily Briefing", "Trump & War Free News" ]
    },
    {
        title: "All items",
        blocks: [ "All items" ]
    },
    {
        title: "Saved",
        blocks: [ "Saved items" ]
    },
    {
        title: "Read Later",
        blocks: [ "Read Later" ]
    },
    {
        title: "Trump & War Free News",
        blocks: [ "Trump & War Free News" ]
    },
    {
        title: "Trump News",
        blocks: [ "Trump News" ]
    },
    {
        title: "Wars",
        blocks: [ "Wars" ]
    },
    {
        title: "Food for Thought",
        blocks: [ "Food for Thought" ]
    },
    {
        title: "Specific authors",
        blocks: [ "Articles by Olga Khazan", "Articles by George Packer", "Dan Carlin" ]
    },
    {
        title: "Environmental News",
        blocks: [ "Environmental News"]
    },
    {
        title: "Unseen Items",
        blocks: [ "Unseen Items" ]
    }
,
    {
        title: 'Test feed',
        blocks: [ 'Thoughts of the moment' ]
    }
];
