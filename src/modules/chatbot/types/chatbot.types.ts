export type ChatbotAction = {
  id: string;
  label: string;
};

export type ChatbotResponseContent = {
  answerPrimary: string;
  answerSecondary?: string;
  prompt: string;
  actions: ChatbotAction[];
};
