export const TOOLS = {
  cursor: {
    id: 'cursor',
    name: 'Cursor',
    category: 'coding',
    plans: {
      hobby: { name: 'Hobby', price: 0, perSeat: false },
      pro: { name: 'Pro', price: 20, perSeat: false },
      'pro-plus': { name: 'Pro+', price: 60, perSeat: false },
      ultra: { name: 'Ultra', price: 200, perSeat: false },
      teams: { name: 'Teams', price: 40, perSeat: true },
      enterprise: { name: 'Enterprise', price: null, perSeat: true },
    },
    url: 'https://cursor.com/pricing',
  },
  copilot: {
    id: 'copilot',
    name: 'GitHub Copilot',
    category: 'coding',
    plans: {
      free: { name: 'Free', price: 0, perSeat: false },
      pro: { name: 'Pro', price: 10, perSeat: false },
      'pro-plus': { name: 'Pro+', price: 39, perSeat: false },
      business: { name: 'Business', price: 19, perSeat: true },
      enterprise: { name: 'Enterprise', price: 39, perSeat: true },
    },
    url: 'https://github.com/features/copilot/plans',
  },
  claude: {
    id: 'claude',
    name: 'Claude (claude.ai)',
    category: 'writing',
    plans: {
      free: { name: 'Free', price: 0, perSeat: false },
      pro: { name: 'Pro', price: 20, perSeat: false },
      'max-5x': { name: 'Max 5x', price: 100, perSeat: false },
      'max-20x': { name: 'Max 20x', price: 200, perSeat: false },
      'team-std': { name: 'Team Standard', price: 25, perSeat: true },
      'team-prem': { name: 'Team Premium', price: 125, perSeat: true },
      enterprise: { name: 'Enterprise', price: null, perSeat: true },
    },
    url: 'https://claude.com/pricing',
  },
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    category: 'writing',
    plans: {
      free: { name: 'Free', price: 0, perSeat: false },
      plus: { name: 'Plus', price: 20, perSeat: false },
      pro: { name: 'Pro', price: 200, perSeat: false },
      business: { name: 'Business', price: 25, perSeat: true },
      enterprise: { name: 'Enterprise', price: null, perSeat: true },
    },
    url: 'https://openai.com/chatgpt/pricing/',
  },
  anthropic_api: {
    id: 'anthropic_api',
    name: 'Anthropic API',
    category: 'api',
    plans: {
      payg: { name: 'Pay-as-you-go', price: null, perSeat: false },
    },
    url: 'https://platform.claude.com/docs/en/about-claude/pricing',
  },
  openai_api: {
    id: 'openai_api',
    name: 'OpenAI API',
    category: 'api',
    plans: {
      payg: { name: 'Pay-as-you-go', price: null, perSeat: false },
    },
    url: 'https://openai.com/api/pricing/',
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini (Google AI)',
    category: 'writing',
    plans: {
      free: { name: 'Free', price: 0, perSeat: false },
      pro: { name: 'Google AI Pro', price: 19.99, perSeat: false },
      ultra: { name: 'Google AI Ultra', price: 249.99, perSeat: false },
      api: { name: 'API (pay-as-you-go)', price: null, perSeat: false },
    },
    url: 'https://one.google.com/intl/en/about/google-ai-plans/',
  },
  windsurf: {
    id: 'windsurf',
    name: 'Windsurf',
    category: 'coding',
    plans: {
      free: { name: 'Free', price: 0, perSeat: false },
      pro: { name: 'Pro', price: 15, perSeat: false },
      teams: { name: 'Teams', price: 35, perSeat: true },
      enterprise: { name: 'Enterprise', price: null, perSeat: true },
    },
    url: 'https://windsurf.com/pricing',
  },
};

export const USE_CASES = [
  { id: 'coding', label: 'Coding / Engineering' },
  { id: 'writing', label: 'Writing / Content' },
  { id: 'data', label: 'Data / Analysis' },
  { id: 'research', label: 'Research' },
  { id: 'mixed', label: 'Mixed / General' },
];
