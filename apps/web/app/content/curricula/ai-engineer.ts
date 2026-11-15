import type { Curriculum } from "../types";
import { topic } from "../types";

export const aiEngineer: Curriculum = {
  slug: "ai-engineer",
  title: "AI Engineering",
  tagline: "Build useful systems around models you did not train.",
  description:
    "A practical path from model behavior to retrieval, agents, evaluation and production operations. The goal is not to collect model APIs; it is to design a system whose answers are grounded, measured and safe enough to ship.",
  level: "intermediate",
  icon: "sparkles",
  estimatedHours: 80,
  stages: [
    {
      slug: "llm-foundations",
      title: "LLM foundations",
      description:
        "What a model is, what it is not, and how to choose one for a real product constraint.",
      topics: [
        topic(
          "what-is-an-ai-engineer",
          "The role is systems engineering around models: data, retrieval, evaluation, product constraints and operations.",
          [
            "Application versus model responsibility",
            "Product discovery and failure modes",
            "The stack: model, context, tools and evaluation",
          ],
          "Write a one-page system sketch for an AI feature, naming the model's job and the system's job.",
          { difficulty: "foundation", minutes: 40 },
        ),
        topic(
          "how-llms-work",
          "You cannot debug output you do not understand at the token, context and sampling level.",
          [
            "Tokenization, embeddings and next-token prediction",
            "Context windows and attention limits",
            "Sampling, temperature and determinism",
          ],
          "Run the same prompt at three temperatures and explain the difference in outputs using tokens and probabilities.",
          { difficulty: "foundation", minutes: 60 },
        ),
        topic(
          "pre-trained-models",
          "Pretraining explains both the capability and the ceiling: the model learned a distribution, not your business rules.",
          [
            "Pretraining data and knowledge cutoffs",
            "Base versus instruction-tuned models",
            "Capability, bias and contamination",
          ],
          "Compare two model cards and list the claims you can verify with a small evaluation set.",
          { difficulty: "foundation", minutes: 40 },
        ),
        topic(
          "type-of-models",
          "Model families have different cost, latency, modality and tool-use profiles; pick by constraint, not leaderboard.",
          [
            "Dense, mixture-of-experts and distilled models",
            "Reasoning, coding and multimodal models",
            "Hosted versus self-hosted trade-offs",
          ],
          "Build a decision table for three product scenarios with latency, cost, privacy and quality columns.",
          { difficulty: "core", minutes: 45 },
        ),
        topic(
          "choosing-the-right-model",
          "The best model is the cheapest one that passes your evaluation at the latency your product can afford.",
          [
            "Quality, latency and cost budgets",
            "Context length and output limits",
            "Fallback and routing strategies",
          ],
          "Evaluate two models on ten representative tasks and record quality, p50/p95 latency and cost per answer.",
          { difficulty: "core", minutes: 55 },
        ),
        topic(
          "closed-vs-open-source-models",
          "Open weights buy control and portability; hosted models buy capability and operational simplicity.",
          [
            "Licensing and redistribution",
            "Data residency and privacy",
            "Fine-tuning and inference ownership",
          ],
          "Write a build-versus-buy memo for one workload, including the exit cost of each option.",
          { difficulty: "core", minutes: 40 },
        ),
        topic(
          "claude-messages-api",
          "Provider APIs differ in message shape, tool use, caching and streaming; the details become your abstraction boundary.",
          [
            "Messages, system prompts and roles",
            "Tool use and stop reasons",
            "Streaming, caching and token accounting",
          ],
          "Build a provider adapter that normalizes messages, tool calls and usage across two APIs.",
          { difficulty: "core", minutes: 60 },
        ),
      ],
    },
    {
      slug: "prompt-and-context",
      title: "Prompt and context engineering",
      description:
        "Design the information the model sees, constrain its output and debug context failures instead of prompt superstitions.",
      topics: [
        topic(
          "prompt-engineering",
          "A prompt is an interface specification for a probabilistic system; clarity and examples beat magic phrases.",
          [
            "Task, role, constraints and output contract",
            "Few-shot examples and counterexamples",
            "Iteration with a test set, not vibes",
          ],
          "Turn a vague request into a prompt with an explicit output contract and five regression cases.",
          { difficulty: "core", minutes: 55 },
        ),
        topic(
          "prompt-vs-context-engineering",
          "Most production failures are context failures: the model never had the information it needed.",
          [
            "Instructions versus retrieved context",
            "Context sources, freshness and authority",
            "Context budget and prioritization",
          ],
          "Trace one bad answer to a missing, stale or conflicting context source and fix the pipeline.",
          { difficulty: "core", minutes: 45 },
        ),
        topic(
          "system-prompting",
          "The system prompt sets durable behavior; putting transient policy there creates hidden coupling.",
          [
            "Behavior, safety and tone boundaries",
            "Policy versioning and ownership",
            "Prompt injection and instruction hierarchy",
          ],
          "Version a system prompt, attach an owner, and test it against injection and refusal cases.",
          { difficulty: "core", minutes: 45 },
        ),
        topic(
          "few-shot",
          "Examples are the cheapest way to communicate a format or a judgment boundary, but bad examples teach bad behavior.",
          [
            "Example selection and diversity",
            "Label leakage and overfitting to examples",
            "Dynamic example retrieval",
          ],
          "Compare zero-shot, static few-shot and retrieved examples on the same evaluation set.",
          { difficulty: "core", minutes: 50 },
        ),
        topic(
          "context-window",
          "A large window is not free: attention, cost and lost-in-the-middle behavior all change with length.",
          [
            "Token budgeting and truncation",
            "Position effects and ordering",
            "Summarization and compaction",
          ],
          "Fill a window with distractors and measure where answer quality starts to fall.",
          { difficulty: "core", minutes: 50 },
        ),
        topic(
          "context-engineering",
          "Context is a designed artifact: select, order, compress and cite it deliberately.",
          [
            "Selection, ranking and deduplication",
            "Compression and structured context",
            "Citations and traceability",
          ],
          "Build a context builder with a visible budget and a citation for every retrieved block.",
          { difficulty: "advanced", minutes: 65 },
        ),
        topic(
          "structured-output",
          "If a downstream program consumes the answer, the output is a schema, not a paragraph.",
          [
            "JSON schema and validation",
            "Repair loops and bounded retries",
            "Streaming partial structured output",
          ],
          "Generate a typed object, validate it, and implement one repair attempt with a clear failure path.",
          { difficulty: "core", minutes: 55 },
        ),
        topic(
          "prompt-injection-attacks",
          "Any retrieved or user-provided text is untrusted input; the model cannot reliably separate data from instructions.",
          [
            "Direct and indirect injection",
            "Tool permissions and least privilege",
            "Detection, isolation and output validation",
          ],
          "Attempt three indirect injections through retrieved documents and document the mitigations that hold.",
          { difficulty: "advanced", minutes: 65 },
        ),
      ],
    },
    {
      slug: "retrieval-and-rag",
      title: "Retrieval and RAG",
      description:
        "Ground answers in your own corpus: chunking, embeddings, vector search, ranking and citation.",
      topics: [
        topic(
          "what-are-rags",
          "Retrieval-augmented generation replaces model memory with a searchable, updatable evidence layer.",
          [
            "Index, retrieve, augment and generate",
            "Grounding versus fine-tuning",
            "Failure modes: retrieval, context and generation",
          ],
          "Build a minimal RAG pipeline over ten documents and label each failure by stage.",
          { difficulty: "core", minutes: 55 },
        ),
        topic(
          "what-are-embeddings",
          "Embeddings turn meaning into geometry; similarity is useful only when the embedding model matches the domain.",
          [
            "Vector spaces and cosine similarity",
            "Dimensions, normalization and distance metrics",
            "Semantic versus lexical matching",
          ],
          "Compare keyword search and embedding search on the same ten queries and record where each wins.",
          { difficulty: "core", minutes: 50 },
        ),
        topic(
          "embedding-models",
          "Embedding quality, dimensions and language coverage decide retrieval quality before any prompt is written.",
          [
            "Model families and multilingual coverage",
            "Dimensions, cost and storage",
            "Re-embedding and version migration",
          ],
          "Benchmark two embedding models on a labeled query set and calculate recall at k.",
          { difficulty: "core", minutes: 55 },
        ),
        topic(
          "chunking",
          "Chunking is the retrieval schema; arbitrary fixed windows destroy the boundaries that make evidence meaningful.",
          [
            "Semantic, structural and sliding windows",
            "Overlap and metadata",
            "Parent-child and late chunking",
          ],
          "Index one document with three chunking strategies and compare the retrieved passages for five queries.",
          { difficulty: "core", minutes: 60 },
        ),
        topic(
          "vector-databases",
          "A vector index is a latency and recall trade-off, not a magic database feature.",
          [
            "HNSW, IVF and exact search",
            "Metadata filters and hybrid search",
            "Updates, deletion and index rebuilds",
          ],
          "Measure recall and latency for exact versus approximate search on your own corpus.",
          { difficulty: "advanced", minutes: 60 },
        ),
        topic(
          "retrieval-process",
          "Retrieval quality is a pipeline: query understanding, candidate generation, reranking and context assembly.",
          [
            "Query rewriting and decomposition",
            "Hybrid retrieval and rerankers",
            "Diversity, deduplication and freshness",
          ],
          "Add a reranker to a retrieval pipeline and measure the change in answer quality and latency.",
          { difficulty: "advanced", minutes: 65 },
        ),
        topic(
          "rag-usecases",
          "RAG fits knowledge that changes, needs citations or must respect permissions; it is a poor fit for style imitation.",
          [
            "Support, research and internal knowledge",
            "Permissions and document-level access",
            "When to use tools or fine-tuning instead",
          ],
          "Write a fit memo for one use case with data freshness, permission and citation requirements.",
          { difficulty: "core", minutes: 45 },
        ),
        topic(
          "ragas",
          "Evaluation is what turns RAG from a demo into an engineering discipline.",
          [
            "Faithfulness, answer relevance and context precision",
            "Synthetic question generation",
            "Regression suites and human review",
          ],
          "Create a twenty-question evaluation set with expected sources and track faithfulness across changes.",
          { difficulty: "advanced", minutes: 65 },
        ),
      ],
    },
    {
      slug: "agents-and-tools",
      title: "Agents and tools",
      description:
        "Give models bounded actions, durable state and a protocol that other systems can implement.",
      topics: [
        topic(
          "ai-agents",
          "An agent is a loop with tools and state; without limits it is an expensive way to discover failure modes.",
          [
            "Observe, decide, act and reflect",
            "Tool permissions and stop conditions",
            "Deterministic orchestration versus autonomy",
          ],
          "Build a two-tool agent with a hard step limit and a trace of every decision.",
          { difficulty: "advanced", minutes: 65 },
        ),
        topic(
          "tools--function-calling",
          "Tools turn language into actions; the schema and authorization around them matter more than the prompt.",
          [
            "Tool schemas and argument validation",
            "Idempotency and side-effect safety",
            "Error results the model can recover from",
          ],
          "Implement one read tool and one write tool with validation, authorization and an audit log.",
          { difficulty: "core", minutes: 60 },
        ),
        topic(
          "mcp",
          "The Model Context Protocol standardizes how tools and context reach a model, reducing one-off integrations.",
          [
            "Hosts, clients and servers",
            "Resources, tools and prompts",
            "Transport and capability negotiation",
          ],
          "Expose one internal capability as an MCP server and call it from a host with least-privilege scopes.",
          { difficulty: "advanced", minutes: 65 },
        ),
        topic(
          "building-an-mcp-server",
          "A protocol server is an API with a model as one of its clients; treat it like any other production surface.",
          [
            "Tool definitions and validation",
            "Authentication, rate limits and logging",
            "Testing with a deterministic client",
          ],
          "Build a server with two tools, input validation and a test that exercises a denied permission.",
          { difficulty: "advanced", minutes: 70 },
        ),
        topic(
          "memory-systems",
          "Memory is a product decision about what to remember, for how long and who can delete it.",
          [
            "Short-term context versus long-term storage",
            "Retrieval, summarization and forgetting",
            "Privacy, consent and deletion",
          ],
          "Design a memory schema with retention rules and a user-visible delete path.",
          { difficulty: "advanced", minutes: 55 },
        ),
        topic(
          "multi-agents",
          "Multiple agents help when roles and context genuinely differ; otherwise they multiply cost and coordination failure.",
          [
            "Supervisor, handoff and debate patterns",
            "Shared state and context isolation",
            "Observability across agent boundaries",
          ],
          "Compare a single-agent and two-agent design on the same task, including cost and failure modes.",
          { difficulty: "advanced", minutes: 60 },
        ),
        topic(
          "react-prompting",
          "Interleaving reasoning and actions is powerful, but unconstrained traces leak information and inflate cost.",
          [
            "Thought, action and observation loops",
            "Trace privacy and redaction",
            "When to use a planner instead",
          ],
          "Instrument one reasoning loop and redact every internal thought from the user-facing trace.",
          { difficulty: "advanced", minutes: 50 },
        ),
      ],
    },
    {
      slug: "evaluation-and-production",
      title: "Evaluation and production",
      description:
        "Measure quality, watch cost and latency, and operate an AI feature without guessing.",
      topics: [
        topic(
          "llm-evaluations",
          "An AI feature without an evaluation set is an experiment that never ends.",
          [
            "Task-level metrics and rubrics",
            "Golden sets and stratified sampling",
            "Offline versus online evaluation",
          ],
          "Build a fifty-case evaluation set from real user requests and make it a CI gate.",
          { difficulty: "core", minutes: 65 },
        ),
        topic(
          "model-based-evals",
          "A judge model can scale qualitative review, but only after it is calibrated against humans.",
          [
            "Rubric design and pairwise comparison",
            "Judge bias and position effects",
            "Agreement and calibration",
          ],
          "Compare a judge model with human labels on thirty examples and report agreement.",
          { difficulty: "advanced", minutes: 60 },
        ),
        topic(
          "human-evals",
          "Human review remains the ground truth for usefulness, tone and domain correctness.",
          [
            "Sampling and reviewer guidelines",
            "Inter-annotator agreement",
            "Feedback loops into the product",
          ],
          "Write a review rubric and run a ten-item calibration session with a second reviewer.",
          { difficulty: "core", minutes: 45 },
        ),
        topic(
          "llm-observability",
          "Traces, token usage and retrieved context are the minimum evidence for debugging an AI system.",
          [
            "Spans, traces and correlation IDs",
            "Prompt and response logging with redaction",
            "Cost, latency and error dashboards",
          ],
          "Instrument one request path with a trace, token counts and a redacted prompt snapshot.",
          { difficulty: "advanced", minutes: 60 },
        ),
        topic(
          "costlatency-monitoring",
          "Cost and latency are product constraints; a quality win that doubles p95 may still be a regression.",
          [
            "Token accounting and cache hits",
            "p50 versus p95 latency",
            "Routing, truncation and streaming",
          ],
          "Build a dashboard for cost per request and p95 latency, then set a budget alert.",
          { difficulty: "core", minutes: 45 },
        ),
        topic(
          "conducting-adversarial-testing",
          "Red-teaming finds the failures your happy-path evaluation set never will.",
          [
            "Threat modeling and abuse cases",
            "Prompt injection and data exfiltration",
            "Severity, reproduction and fixes",
          ],
          "Run a structured red-team session and turn every finding into a regression test.",
          { difficulty: "advanced", minutes: 60 },
        ),
        topic(
          "ai-safety-and-ethics",
          "Safety is not a filter at the end; it is the set of decisions about what the system should refuse, escalate or explain.",
          [
            "Harm, bias and transparency",
            "Human escalation and refusal design",
            "Data provenance and consent",
          ],
          "Write a safety spec for one feature with refusal categories, escalation paths and measurable checks.",
          { difficulty: "core", minutes: 50 },
        ),
      ],
    },
  ],
};
