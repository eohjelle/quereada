import { subDays } from 'date-fns';

// todo: In postgres, the following fields should be arrays of strings:
// - channels (in sources)
// - topics (in topic_groups)



export const sources = 
[
    { 
        name: 'The New York Times', 
        source_class: 'NYTimesAPI'
    },
    { 
        name: 'The Atlantic', 
        source_class: 'TheAtlantic', 
        channels: ['bestof']
    },
    { 
        name: 'Hacker News', 
        source_class: 'RSS', 
        url: 'https://news.ycombinator.com/rss' 
    },
    { 
        name: "Dan Carlin's Substack", 
        source_class: 'RSS', 
        url: 'https://dancarlin.substack.com/feed' 
    },
    { 
        name: 'NRK', 
        source_class: 'RSS', 
        url: 'https://www.nrk.no/toppsaker.rss' 
    },
];

export const topic_groups = 
[
    {
        title: "2024 US Politics",
        topics: [
            "The 2024 US Presidential Election" ,
            "Donald Trump",
            "J. D. Vance",
            "Kamala Harris",
            "Tim Walz"
        ]
    },
    {
        title: "My interests",
        topics: [
            "Development and launches of SpaceX's Starship rocket"
        ]
    }
];

export const blocks = 
[
    {
        header: "US News Minus 2024 Presidential Election",
        prisma_query: {
            where: {
                source_name: {
                    in: ["The Atlantic", "The New York Times"]
                },
                relevant_topic_groups: {
                    none: {
                        title: "2024 US Politics"
                    }
                }
            },
            include: {
                authors: true
            },
            orderBy: {
                date_published: "desc"
            }
        },
        contains_sources: { connect: [ { name: "The Atlantic" }, { name: "The New York Times" } ] }, // todo: move feeds to a config file. When importing, automatically detect all sources and topic groups.
        contains_topic_groups: { connect: [ { title: "2024 US Politics" } ] }
    },
    {
        header: "2024 Presidential Election",
        prisma_query: {
            where: {
                source_name: {
                    in: ["The Atlantic", "The New York Times"]
                },
                relevant_topic_groups: {
                    some: {
                        title: "2024 US Politics"
                    }
                },
            },
            include: {
                authors: true
            },
            orderBy: {
                date_published: "desc"
            }
        },
        contains_sources: { connect: [ { name: "The Atlantic" }, { name: "The New York Times" } ] }, // todo: move feeds to a config file. When importing, automatically detect all sources and topic groups.
        contains_topic_groups: { connect: [ { title: "2024 US Politics" } ] }
    },
    {
        header: "10 News about Norway",
        prisma_query: {
            take: 10,
            where: {
                source_name: "NRK",
                seen: false,
                date_published: {
                    gt: subDays(new Date(), 1) // only show articles from the last day
                }
            },
            include: {
                authors: true
            },
            orderBy: {
                date_published: "desc"
            }
        },
        contains_sources: { connect: [ { name: "NRK" } ] }
    },
    {
        header: "Hacker News",
        prisma_query: {
            where: {
                source_name: "Hacker News",
                date_published: {
                    gt: subDays(new Date(), 1) // only show articles from the last day
                }
            },
            orderBy: {
                date_published: "desc"
            }
        },
        contains_sources: { connect: [ { name: "Hacker News" } ] }
    },
    {
        header: "Unseen Items",
        prisma_query: {
            where: {
                seen: false
            },
            include: {
                authors: true
            },
            orderBy: {
                date_published: "desc"
            }
        },
        contains_sources: { connect: [ { name: "The New York Times" }, { name: "The Atlantic" }, { name: "Hacker News" }, { name: "Dan Carlin's Substack" }, { name: "NRK" } ] } // todo: better way to include all?
    },
    {
        header: "Read Later",
        prisma_query: {
            where: {
                read_later: true
            },
            include: {
                authors: true
            }
        },
        contains_sources: { connect: [ { name: "The New York Times" }, { name: "The Atlantic" }, { name: "Hacker News" }, { name: "Dan Carlin's Substack" }, { name: "NRK" } ] } // todo: better way to include all?
    },
    {
        header: "Saved items",
        prisma_query: {
            where: 
            {
                saved: true
            },
            include: 
            {
                authors: true
            }
        },
        contains_sources: { connect: [ { name: "The New York Times" }, { name: "The Atlantic" }, { name: "Hacker News" }, { name: "Dan Carlin's Substack" }, { name: "NRK" } ] } // todo: better way to include all?
    }
]

export const feeds = 
[
    {
        title: "Serious News",
        blocks: [ "US News Minus 2024 Presidential Election", "10 News about Norway" ]
    },
    {
        title: "2024 Presidential Election",
        blocks: [ "2024 Presidential Election" ]
    },
    {
        title: "Unseen Items",
        blocks: [ "Unseen Items" ]
    },
    {
        title: "Read Later",
        blocks: [ "Read Later" ]
    },
    {
        title: "Saved",
        blocks: [ "Saved items" ]
    }
];