// Original IELTS-style Task 2 prompts written for Lexora Academy.
export type QuestionType =
  | "Opinion"
  | "Discussion"
  | "Advantages & Disadvantages"
  | "Problem & Solution"
  | "Two-part question";

export type Task2Prompt = {
  id: string;
  topic: string;
  type: QuestionType;
  text: string;
};

export const TASK2_PROMPTS: Task2Prompt[] = [
  {
    id: "tech-ai-homework",
    topic: "Technology",
    type: "Opinion",
    text: "Many schools now allow students to use AI tools to help with their homework. Is this a positive or a negative development?",
  },
  {
    id: "edu-languages-primary",
    topic: "Education",
    type: "Opinion",
    text: "Learning a foreign language should be compulsory for every child from the first year of primary school. To what extent do you agree or disagree?",
  },
  {
    id: "work-remote",
    topic: "Work",
    type: "Discussion",
    text: "Some people think employees should be free to work from home whenever they want. Others believe that working together in an office is essential for a successful company. Discuss both views and give your own opinion.",
  },
  {
    id: "env-plastic",
    topic: "Environment",
    type: "Problem & Solution",
    text: "Single-use plastic is still widely used in many countries despite the damage it causes to the environment. Why is this the case, and what can be done to reduce it?",
  },
  {
    id: "health-fast-food",
    topic: "Health",
    type: "Advantages & Disadvantages",
    text: "In many cities, fast-food restaurants are now more common than restaurants serving traditional dishes. Do the advantages of this outweigh the disadvantages?",
  },
  {
    id: "society-living-alone",
    topic: "Society",
    type: "Two-part question",
    text: "More and more young adults are choosing to live alone rather than with family or friends. Why is this happening? Is it a positive or a negative trend?",
  },
  {
    id: "cities-traffic",
    topic: "Cities",
    type: "Problem & Solution",
    text: "Traffic congestion is becoming a serious problem in many large cities. What are the main causes, and what measures could governments take to solve it?",
  },
  {
    id: "media-fact-checking",
    topic: "Media",
    type: "Opinion",
    text: "Social media companies should be responsible for checking that the information shared on their platforms is true. To what extent do you agree or disagree?",
  },
  {
    id: "tourism-local",
    topic: "Tourism",
    type: "Discussion",
    text: "Some people believe international tourism brings great benefits to local communities, while others argue that it causes more harm than good. Discuss both views and give your own opinion.",
  },
  {
    id: "sport-facilities",
    topic: "Government",
    type: "Opinion",
    text: "Governments should spend money on public sports facilities for local people rather than on hosting international sporting events. To what extent do you agree or disagree?",
  },
  {
    id: "family-grandparents",
    topic: "Family",
    type: "Advantages & Disadvantages",
    text: "In some countries, grandparents now look after young children while both parents work. What are the advantages and disadvantages of this arrangement?",
  },
  {
    id: "science-space",
    topic: "Science",
    type: "Opinion",
    text: "Some people say that the money spent on space exploration would be better used to solve problems here on Earth. To what extent do you agree or disagree?",
  },
];

export const CUSTOM_PROMPT_ID = "custom";

export function findPrompt(id: string | null | undefined) {
  return TASK2_PROMPTS.find((p) => p.id === id);
}
