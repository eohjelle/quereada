
import { subDays } from 'date-fns';

import type { ConfigSource, ConfigFilter, ConfigBlock, ConfigFeed } from './src/backend/load_config';


export const sources: ConfigSource[] = 
[
    { 
        name: 'The New York Times', 
        implementation: 'NYTimesAPI'
    },
    { 
        name: 'The Atlantic', 
        implementation: 'TheAtlantic', 
        args: {
            channels: [ 'bestof' ]
        }
    },
    { 
        name: "Dan Carlin's Substack", 
        implementation: 'RSS', 
        args: {
            urls: [ 'https://dancarlin.substack.com/feed' ]
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
        title: "US News Not Relevant To 2024 Presidential Election",
        query: {
            where: {
                source_name: {
                    in: ["The Atlantic", "The New York Times"]
                },
                filters_passed: {
                    none: {
                        title: "Relevant to 2024 US Politics"
                    }
                }
            },
            include: {
                authors: true
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
                    gte: 4000
                }
            },
            include: {
                authors: true
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
                    in: ["The Atlantic", "The New York Times"]
                },
                filters_passed: {
                    some: {
                        title: "Relevant to 2024 US Politics"
                    }
                },
            },
            include: {
                authors: true
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
                    in: ["The Atlantic", "The New York Times"]
                }
            },
            include: {
                authors: true
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
            include: {
                authors: true
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
            include: {
                authors: true
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
            include: {
                authors: true
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
            include: {
                authors: true
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
            include: 
            {
                authors: true
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
        title: "US News Excluding Presidential Election",
        blocks: [ "US News Not Relevant To 2024 Presidential Election" ]
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
        title: "Articles by specific authors",
        blocks: [ "Articles by Olga Khazan", "Articles by George Packer" ]
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