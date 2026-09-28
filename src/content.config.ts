import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    updated: z.string(),
    notice: z.string().optional(),
    calls: z.array(z.object({ label: z.string(), phone: z.string() })).default([]),
    links: z.array(z.object({
      label: z.string(), url: z.url(), description: z.string(),
    })).default([]),
  }),
});

const locations = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/locations' }),
  schema: z.object({
    title: z.string(),
    status: z.enum(['候选', '已电话确认', '不接受自带药']),
    address: z.string(),
    phone: z.string().optional(),
    source: z.url().optional(),
    confirmedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    conditions: z.string().min(1),
  }).superRefine((value, context) => {
    if (value.status === '已电话确认' && (!value.confirmedAt || !value.phone || !value.source)) {
      context.addIssue({
        code: 'custom',
        message: '已电话确认须填写核实日期、机构公开电话和公开来源',
      });
    }
  }),
});

export const collections = { guides, locations };
