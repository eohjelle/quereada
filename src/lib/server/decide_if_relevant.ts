import { OPENAI_API_KEY} from '$env/static/private';
import OpenAI from 'openai';
import type { TopicGroup, Item } from '@prisma/client';

const openai = new OpenAI(OPENAI_API_KEY);

// todo: implement. See my jupyter notebook for inspiration.