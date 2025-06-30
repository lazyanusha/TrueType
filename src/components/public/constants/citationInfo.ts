export const citationInfo = {
  Proper: {
    label: "Proper Citation",
    description: "Correctly cited with clear references.",
  },
  Partial: {
    label: "Partial Citation",
    description: "Some references are present but incomplete.",
  },
  False: {
    label: "False Citation",
    description: "References appear fabricated or invalid.",
  },
  Poor: {
    label: "Poor Citation",
    description: "Citations are vague or poorly formatted.",
  },
  None: {
    label: "No Citation",
    description: "No references found in the content.",
  },
} as const;
