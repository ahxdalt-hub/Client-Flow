import type { Article } from "./types";

import { coldEmailTemplatesForFreelancers } from "./cold-email-templates-for-freelancers";
import { freelanceLeadTrackingSpreadsheet } from "./freelance-lead-tracking-spreadsheet";
import { freelanceProposalTemplateGuide } from "./freelance-proposal-template-guide";
import { howToFindClientsAsAFreelancerInIndia } from "./how-to-find-clients-as-a-freelancer-in-india";
import { howToFollowUpWithPotentialClients } from "./how-to-follow-up-with-potential-clients";

/**
 * Published guides, newest-first.
 *
 * Deliberately a short list. Each entry is a full article written for one
 * specific search intent — no thin filler, no auto-generated batch. Add a new
 * guide only when it has something the others do not.
 */
export const ARTICLES: Article[] = [
  howToFindClientsAsAFreelancerInIndia,
  coldEmailTemplatesForFreelancers,
  howToFollowUpWithPotentialClients,
  freelanceLeadTrackingSpreadsheet,
  freelanceProposalTemplateGuide,
];

export const ARTICLE_SLUGS = ARTICLES.map((a) => a.slug);

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export type { Article, Block } from "./types";
