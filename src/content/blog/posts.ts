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
import { post as wardrobeDesign } from "./wardrobe-design-india-sliding-hinged";
import { post as sofaBuyingGuide } from "./sofa-buying-guide-india-frame-fabric";
import { post as diningTableGuide } from "./dining-table-size-shape-india";
import { post as woodSpeciesComparison } from "./sheesham-vs-teak-vs-mango-wood-comparison";
import { post as customFurniturePatna } from "./custom-furniture-patna-made-to-order";
import { post as smallBedroom1BHK } from "./small-bedroom-1bhk-furniture-india";
import { post as homeOfficeStudyTable } from "./home-office-study-table-wfh-india";
import { post as woodFinishesGuide } from "./wood-finishes-pu-melamine-lacquer-wax";
import { post as poojaUnitMandir } from "./pooja-unit-mandir-design-wood";
import { post as bookshelvesHomeLibrary } from "./bookshelves-home-library-design-india";
import { post as vastuFurniturePlacement } from "./vastu-furniture-placement-india";
import { post as shoeRackEntryway } from "./shoe-rack-entryway-storage-india";
import { post as coffeeTableGuide } from "./coffee-table-center-table-india";
import { post as crockeryUnitGuide } from "./crockery-unit-display-cabinet-india";
import { post as sustainableFurniture } from "./sustainable-furniture-wood-sourcing-india";

export const POSTS: BlogPost[] = [
  welcome,
  woodVsMdfVsParticleBoard,
  identifyRealSolidWood,
  woodCareIndia,
  choosingBed,
  trueCostFurniture,
  wardrobeDesign,
  sofaBuyingGuide,
  diningTableGuide,
  woodSpeciesComparison,
  customFurniturePatna,
  smallBedroom1BHK,
  homeOfficeStudyTable,
  woodFinishesGuide,
  poojaUnitMandir,
  bookshelvesHomeLibrary,
  vastuFurniturePlacement,
  shoeRackEntryway,
  coffeeTableGuide,
  crockeryUnitGuide,
  sustainableFurniture,
];
