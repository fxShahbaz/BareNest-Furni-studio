// BareNest blog posts. Hardcoded — to add a new post, create a new TS
// module in this folder exporting a `post: BlogPost`, then import and
// register it below. Posts are sorted by `date` (newest first) in the
// helpers, so the order here doesn't matter.

import type { BlogPost } from "@/lib/blog";

import { post as welcome } from "./welcome";
import { post as woodVsMdfVsParticleBoard } from "./solid-wood-vs-mdf-vs-particle-board";
import { post as identifyRealSolidWood } from "./identify-real-solid-wood-furniture";
import { post as woodCareIndia } from "./wood-furniture-care-india-monsoon";
import { post as choosingBed } from "./choosing-bed-india-storage-sizes";
import { post as trueCostFurniture } from "./true-cost-cheap-furniture-india";

export const POSTS: BlogPost[] = [
  welcome,
  woodVsMdfVsParticleBoard,
  identifyRealSolidWood,
  woodCareIndia,
  choosingBed,
  trueCostFurniture,
];
