
import { subDays } from 'date-fns';

import type { ConfigSource, ConfigFilter, ConfigBlock, ConfigFeed } from './src/backend/load_config';


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
        name: 'NRK',
        implementation: 'RSS',
        args: {
            urls: [
                "https://www.nrk.no/norge/toppsaker.rss"
            ]
        },
        default_values: {
            item_type: 'Article',
            lang_id: 'no',
            summarizable: true
        }
    },
    {
        name: "Reddit Soccer",
        implementation: "RSS",
        args: {
            urls: [
                "https://www.reddit.com/r/soccer/.rss"
            ]
        },
        default_values: {
            item_type: 'Link',
            lang_id: 'en',
            summarizable: false
        }
    }
];

export const filters: ConfigFilter[] = 
[
    {
        title: "Relevant to 2024 US Politics",
        implementation: "RelevantToTopics",
        args: {
            topics: [
                "The 2024 US Presidential Election" ,
                "Donald Trump",
                "J. D. Vance",
                "Kamala Harris",
                "Tim Walz"
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
    }
];

export const blocks: ConfigBlock[] = 
[
    {
        title: "News Not Relevant To 2024 Presidential Election",
        query: {
            where: {
                OR: [
                    {
                        source_name: {
                            in: ["The Atlantic", "The New York Times"]
                        },
                        filters_passed: {
                            none: {
                                title: "Relevant to 2024 US Politics"
                            }
                        }
                    },
                    {
                        source_name: {
                            equals: "NRK"
                        },
                        title: {
                            not: {
                                contains: "nyheter"
                            }
                        }
                    }
                ]
            },
            orderBy: {
                date_published: "desc"
            }
        }
    },
    {
        title: "Long Reads in The Atlantic",
        query: {
            take: 15,
            where: {
                source_name: {
                    in: [ "The Atlantic" ]
                },
                number_of_words: {
                    gte: 3500
                }
            },
            orderBy: {
                date_added: "desc"
            }
        }
    },
    {
        title: "2024 Presidential Election",
        query: {
            where: {
                source_name: {
                    in: ["The Atlantic", "The New York Times", "NRK"]
                },
                filters_passed: {
                    some: {
                        title: "Relevant to 2024 US Politics"
                    }
                },
            },
            orderBy: {
                date_published: "desc"
            }
        }
    },
    {
        title: "Environmental News",
        query: {
            where: {
                filters_passed: {
                    some: {
                        title: "Relevant to Environmental Issues"
                    }
                },
                source_name: {
                    in: ["The Atlantic", "The New York Times", "NRK"]
                }
            },
            orderBy: {
                date_published: "desc"
            }
        }
    },
    {
        title: "Articles by George Packer",
        query: {
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
        }
    },
    {
        title: "Articles by Olga Khazan",
        query: {
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
        }
    },
    {
        title: "Dan Carlin",
        query: {
            where: {
                authors: {
                    some: { name: "Dan Carlin" }
                }
            },
            orderBy: {
                date_published: "desc"
            }
        }
    },
    {
        title: "Unseen Items",
        query: {
            where: {
                seen: {
                    equals: 0
                }
            },
            orderBy: {
                date_added: "desc"
            }
        }
    },
    {
        title: "Read Later",
        query: {
            where: {
                read_later: true
            },
            orderBy: {
                date_added: "desc"
            }
        }
    },
    {
        title: "Saved items",
        query: {
            where: 
            {
                saved: true
            },
            orderBy: {
                date_added: "desc"
            }
        }
    },
    {
        title: "All items",
        query: {
            orderBy: {
                id: "desc"
            }
        }
    }
]

export const feeds: ConfigFeed[] = 
[
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
        title: "News Excluding 2024 Presidential Election",
        blocks: [ "News Not Relevant To 2024 Presidential Election" ]
    },
    {
        title: "2024 Presidential Election",
        blocks: [ "2024 Presidential Election" ]
    },
    {
        title: "Long Reads",
        blocks: [ "Long Reads in The Atlantic" ]
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
];
