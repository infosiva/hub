// Ordered AI/ML curriculum for the Telegram daily digest — starts at zero, builds up.
// Each level is a fixed sequence; the cron steps through in order per-level, never repeats
// until the list is exhausted, then loops with a "revisited" framing (handled in route.ts).

export type DigestLevel = 'beginner' | 'intermediate' | 'advanced'

export const TOPICS: Record<DigestLevel, string[]> = {
  beginner: [
    'What is Artificial Intelligence?',
    'What is Machine Learning (and how is it different from AI)?',
    'What is a dataset?',
    'Supervised vs unsupervised learning',
    'What is a neural network, in plain terms?',
    'What is a "model" in AI?',
    'Training vs inference',
    'What is overfitting?',
    'What is a Large Language Model (LLM)?',
    'How does ChatGPT actually generate text?',
    'What is a token?',
    'What is a prompt?',
    'What is prompt engineering?',
    'What is a parameter (in "70B parameters")?',
    'What is fine-tuning?',
    'What is a transformer (architecture)?',
    'What is attention in transformers?',
    'What is embeddings / vector representation?',
    'What is RAG (Retrieval-Augmented Generation)?',
    'What is a vector database?',
    'What is hallucination in AI?',
    'What is temperature (in LLM sampling)?',
    'What is context window?',
    'What is fine-tuning vs prompting — when to use which?',
    'What is an AI agent?',
    'What is function calling / tool use in LLMs?',
    'What is multimodal AI (text + image + audio)?',
    'What is computer vision, basics?',
    'What is reinforcement learning, basics?',
    'What is open-source vs closed-source AI models?',
  ],
  intermediate: [
    'How does backpropagation work?',
    'Gradient descent explained with intuition',
    'What is a loss function and why it matters',
    'Convolutional Neural Networks (CNNs) explained',
    'Recurrent Neural Networks (RNNs) and why transformers replaced them',
    'Self-attention mechanism, step by step',
    'Positional encoding in transformers',
    'What is RLHF (Reinforcement Learning from Human Feedback)?',
    'LoRA and parameter-efficient fine-tuning',
    'Quantization — running big models on small hardware',
    'Mixture of Experts (MoE) architecture',
    'What makes GPT, Claude, Gemini architecturally different?',
    'Chain-of-thought prompting',
    'Agentic workflows — planning, memory, tool use',
    'Vector search algorithms (HNSW, cosine similarity)',
    'Evaluating LLMs — benchmarks and their limits',
    'AI safety and alignment, basics',
    'Diffusion models — how image generation works',
    'Speech-to-text and text-to-speech pipelines',
    'Model distillation — making small models from big ones',
    'What is a system prompt vs user prompt architecture?',
    'Multi-agent systems — how agents coordinate',
    'Context engineering vs prompt engineering',
    'AI model cost/latency tradeoffs in production',
    'Guardrails and content moderation in AI apps',
  ],
  advanced: [
    'Mechanistic interpretability — looking inside neural networks',
    'Scaling laws — why bigger models keep getting better',
    'Constitutional AI and RLAIF',
    'Sparse autoencoders and feature circuits',
    'Speculative decoding for faster inference',
    'Flash attention and memory-efficient transformers',
    'Test-time compute / inference-time scaling (o1-style reasoning)',
    'Model merging techniques',
    'Adversarial attacks on LLMs (jailbreaks, prompt injection)',
    'Synthetic data generation for training',
    'Distributed training — data vs model vs pipeline parallelism',
    'Emergent abilities in large models — real or measurement artifact?',
    'Long-context architectures beyond standard attention',
    'AI agent memory architectures (episodic, semantic, working)',
    'Formal verification and AI safety guarantees',
  ],
}

export function topicCount(level: DigestLevel): number {
  return TOPICS[level].length
}

export function getTopic(level: DigestLevel, index: number): string {
  const list = TOPICS[level]
  return list[index % list.length]
}
