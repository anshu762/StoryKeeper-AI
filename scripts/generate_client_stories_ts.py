# -*- coding: utf-8 -*-
"""
Generates prisma/data/client-stories.ts from the four parts.
"""
import json
import os
from scripts.build_client_stories import STORIES_RAW_PART1
from scripts.build_client_stories_part2 import STORIES_RAW_PART2
from scripts.build_client_stories_part3 import STORIES_RAW_PART3
from scripts.build_client_stories_part4 import STORIES_RAW_PART4

all_stories = (
    STORIES_RAW_PART1 +
    STORIES_RAW_PART2 +
    STORIES_RAW_PART3 +
    STORIES_RAW_PART4
)

os.makedirs("prisma/data", exist_ok=True)
output_path = "prisma/data/client-stories.ts"

content = """// Auto-generated 75 client oral history stories
export interface ClientStorySeed {
  id: number;
  speaker: string;
  age: number;
  location: string;
  region: string;
  language: string;
  title: string;
  slug: string;
  topic: string;
  decade: string;
  start: number;
  end: number;
  duration: number;
  collection: string;
  themes: string[];
  keywords: string[];
  summary: string;
  text: string;
  displayPreference?: "NAMED" | "ANONYMOUS";
}

export const CLIENT_STORIES: ClientStorySeed[] = """ + json.dumps(all_stories, indent=2, ensure_ascii=False) + ";\n"

with open(output_path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Successfully generated {output_path} with {len(all_stories)} stories!")
