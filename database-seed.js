import { add, subDays } from 'date-fns';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// todo: create a "config file" containing constants sources, topic_groups, feeds. Use that to seed the database and also reload it when refreshing the feeds

async function add_languages() {
    const languages = [
        { id: 'en', name: 'English' },
        { id: 'no', name: 'Norwegian' }
    ];
    for (const language of languages) {
        await prisma.language.upsert({
            where: { id: language.id },
            update: language,
            create: language 
        });
    };
};

async function main() {
    await add_languages();
    await prisma.$disconnect();
};

main().catch((e) => {console.error(e); process.exit(1)});