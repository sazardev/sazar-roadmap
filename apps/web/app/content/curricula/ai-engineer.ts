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
          {
            summary:
              "An AI engineer owns the system around a model: context assembly, retrieval, tool permissions, evaluation sets, latency budgets and failure handling. The model sets a capability ceiling, but most user-visible defects trace to missing data plumbing, an unmeasured prompt change or an unhandled refusal.",
            difficulty: "foundation",
            minutes: 40,
            pitfalls: [
              "Treating the role as prompt writing alone; own retrieval, tool calls and evaluation as parts of one system.",
              "Shipping a demo without a fixed evaluation set; collect representative cases and a failure taxonomy before launch.",
              "Letting the model decide authorization or pricing; keep those rules in deterministic code with an audit log.",
            ],
          },
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
          {
            summary:
              "Text is split into tokens, each token becomes a vector, and the transformer predicts a probability distribution over the next token; decoding repeats until a stop sequence or token limit. Temperature and top-p modify that distribution, so identical prompts can diverge without any model-side memory of the previous run.",
            difficulty: "foundation",
            minutes: 60,
            pitfalls: [
              "Blaming prompt wording for a tokenizer mismatch; count tokens with the target model and inspect how words split.",
              "Setting temperature to zero and expecting identical output; provider batching and model updates can still change results.",
              "Assuming every prompt token receives equal attention; test the same fact at the start, middle and end of a long input.",
            ],
          },
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
          {
            summary:
              "Pretraining compresses a snapshot of public text into weights, so a model carries the cutoff, licensing and skew of that corpus rather than live facts. Instruction tuning then trains the model to follow requests and answer in a usable format, which makes it easier to steer but does not install knowledge the base model never saw.",
            difficulty: "foundation",
            minutes: 40,
            pitfalls: [
              "Reading benchmark scores as evidence about your domain; run a small labeled set drawn from your own traffic.",
              "Assuming a recent cutoff removes stale answers; test dated questions and keep volatile facts in retrieval.",
              "Fine-tuning a base model to add facts; use retrieval or continued pretraining for knowledge that changes.",
            ],
          },
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
          {
            summary:
              "Dense models run every parameter for each token, mixture-of-experts models route a token to a few experts, and distilled models train a smaller student on a larger teacher's outputs. The choice trades quality against memory, latency and serving complexity, so active parameters and batching behavior matter more than the headline parameter count.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Comparing parameter counts across dense and mixture-of-experts models; compare active parameters and memory at your batch size.",
              "Assuming a distilled model inherits the teacher's tool use or long-context behavior; re-run the evaluation on the student.",
              "Routing every request to a reasoning model; send simple calls to a cheaper model and reserve the expensive one for hard cases.",
            ],
            resources: [
              {
                title: "Mixture of Experts Explained",
                url: "https://huggingface.co/blog/moe",
                kind: "docs",
              },
              {
                title: "Distilling the Knowledge in a Neural Network",
                url: "https://arxiv.org/abs/1503.02531",
                kind: "docs",
              },
            ],
          },
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
          {
            summary:
              "Model selection is a constrained optimization over task quality, p50 and p95 latency, tokens per request and unit cost. A smaller model with better retrieval and a tighter output contract often wins, so every comparison must hold the rest of the pipeline fixed.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Benchmarking models with different prompts or retrieval settings; freeze the pipeline and change one variable at a time.",
              "Reporting mean latency from warm requests; measure p95 under concurrency and include time to first token.",
              "Ignoring output-token price and retry rates; compute cost per successful answer, not per first attempt.",
            ],
          },
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
          {
            summary:
              "Closed models are rented inference with vendor-controlled weights; open-weight models let you host, fine-tune and pin a version, while you take on GPUs, serving and patching. The decision turns on data residency, license terms, peak load and the migration cost of prompts, evals and tooling.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Reading open weights as open source; check the license for commercial use, redistribution and acceptable-use terms.",
              "Pricing self-hosting from GPU list price alone; include utilization, autoscaling, storage and on-call time.",
              "Skipping an exit plan; keep a provider adapter and an eval set that can run against a second model.",
            ],
          },
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
          {
            summary:
              "The Messages API accepts a system prompt plus ordered user and assistant turns and returns content blocks, a stop reason and token usage. Tool calls, streaming events and cache controls share that envelope, so an adapter that normalizes stop reasons and usage is what keeps a second provider replaceable.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Concatenating streamed text deltas and dropping tool-use blocks; accumulate content by block index.",
              "Treating a max-token stop reason as a complete answer; check stop_reason before parsing the output.",
              "Retrying a tool call without deduplicating the side effect; make write tools idempotent or key retries by request ID.",
            ],
          },
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
          {
            summary:
              "A prompt is a specification containing the task, constraints, output schema and examples, evaluated against a fixed case set. Moving rules into an explicit contract and changing one clause at a time turns prompt iteration into an attributable engineering loop.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Rewriting the entire prompt after one failure; change one clause and re-run the case set to attribute the effect.",
              "Adding examples that do not match the parser's schema; validate example outputs with the same parser as production.",
              "Tuning on one showcase input; keep hard, ambiguous and refusal cases in the regression set.",
            ],
          },
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
          {
            summary:
              "Prompt engineering changes how the task is stated; context engineering changes which evidence, history and tool output reach the model. When the needed fact was never retrieved or was truncated, no wording change recovers it, so the retrieval and assembly trace comes first.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Adding stricter instructions when the fact was never retrieved; inspect the retrieval trace before editing the prompt.",
              "Assuming a larger window removes selection work; measure quality as distractors are added.",
              "Mixing policy instructions into retrieved text; keep trusted rules in the system layer and mark retrieved content as data.",
            ],
          },
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
          {
            summary:
              "The system prompt carries durable role, policy and output rules that sit above each user turn, and providers weight it differently during instruction conflicts. Versioning it with an owner and running refusal plus injection cases prevents an unrecorded edit from changing product behavior.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Putting per-request data in the system prompt; pass it as delimited user or tool content so caching and auditing stay coherent.",
              "Editing system text without a version bump; record the hash and tie it to eval results and incident timelines.",
              "Treating the system prompt as a security boundary; enforce permissions in code, not in instructions.",
            ],
          },
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
          {
            summary:
              "Few-shot prompting places labeled input-output pairs in context so the model infers format and decision boundaries from demonstrations instead of descriptions. Example choice, order and label balance shift the output distribution, so retrieved examples need the same evaluation as prompt text.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Using near-duplicate examples that share one label; add boundary cases and a negative example.",
              "Retrieving examples that contain the current query's answer; filter by document ID before assembly.",
              "Assuming more examples always help; measure accuracy and token cost as the count grows.",
            ],
          },
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
          {
            summary:
              "The context window caps the tokens shared by system instructions, history, retrieved passages and the completion, and attention quality degrades before the hard limit. Budgeting each section and placing critical evidence near the edges avoids truncation and lost-in-the-middle failures.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Counting only input tokens; reserve the output budget and subtract it before sizing retrieval.",
              "Truncating history from the front and deleting the original task; summarize old turns or pin the task statement.",
              "Testing with short documents and shipping long ones; measure answer quality at the real chunk count.",
            ],
          },
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
          {
            summary:
              "Context engineering selects, ranks, compresses and orders evidence under an explicit token budget, keeping provenance for every block. Deduplication and citation metadata make answers traceable, while a visible budget stops one verbose source from crowding out the rest.",
            difficulty: "advanced",
            minutes: 65,
            pitfalls: [
              "Concatenating every retrieved chunk until the window is full; rank and cut by marginal value.",
              "Compressing away citation anchors; carry document and span IDs through summarization.",
              "Caching assembled context by query alone; include user permissions and document versions in the cache key.",
            ],
          },
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
          {
            summary:
              "Structured output constrains generation to a schema, either through provider-enforced JSON modes or through validation and a repair loop in application code. The parser remains the authority: reject invalid objects, retry with the validation error and cap attempts before returning a typed failure.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Parsing a JSON-looking string without schema validation; validate types, required fields and enums.",
              "Retrying the same prompt after a validation error; include the error and failed object in the repair turn.",
              "Letting the repair loop run unbounded; cap attempts and return a typed failure to the caller.",
            ],
          },
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
          {
            summary:
              "Prompt injection exploits the model's incomplete separation of instructions from data, letting a retrieved page or tool result redirect behavior. Defenses sit outside the prompt: least-privilege tools, allowlists, output validation and isolation of untrusted content from privileged actions.",
            difficulty: "advanced",
            minutes: 65,
            pitfalls: [
              "Relying on an instruction to ignore text inside documents; treat retrieved content as data and enforce policy in code.",
              "Giving an agent broad credentials because it is internal; scope tokens per user and per action.",
              "Testing only direct user attacks; inject payloads through documents, emails and tool outputs.",
            ],
          },
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
          {
            summary:
              "RAG retrieves passages from an index, inserts them into the prompt and asks the model to answer from that evidence. Grounding improves freshness and citation, but the pipeline adds three failure surfaces: retrieval can miss, assembly can truncate and generation can ignore the source.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Scoring only the final answer; log retrieved IDs and evaluate retrieval separately from generation.",
              "Indexing documents without access metadata; filter by permission before the prompt is assembled.",
              "Assuming RAG eliminates hallucination; require citations and test for unsupported claims.",
            ],
          },
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
          {
            summary:
              "An embedding model maps text to a fixed-length vector, and search ranks vectors by cosine similarity or dot product. The geometry follows the training objective, so domain jargon and short queries can sit far from the passages that answer them.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Mixing vectors from two embedding models in one index; re-embed the corpus when the model changes.",
              "Using cosine and dot product interchangeably on unnormalized vectors; use the metric the model was trained for.",
              "Replacing lexical search entirely; keep exact matching for SKUs, error codes and names.",
            ],
          },
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
          {
            summary:
              "Embedding models differ in dimension, context length, language coverage and the query-document objective they were trained on. Recall at k on a labeled query set is the selection metric, and switching models requires re-embedding the corpus and rebuilding the index.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Choosing a model by leaderboard rank without testing your language; measure recall@k on real queries.",
              "Storing vectors without the model version; tag every row so a mixed index is detectable.",
              "Ignoring the model's input limit; long chunks get truncated and lose their distinguishing content.",
            ],
          },
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
          {
            summary:
              "Chunking sets the unit of retrieval by splitting documents on structure, overlap and metadata such as section, source and permissions. A chunk must be small enough to rank precisely and large enough to answer alone, which is why fixed character windows often retrieve fragments without context.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Splitting mid-table or mid-code block; use structure-aware boundaries and keep headers with the rows.",
              "Making chunks so small that pronouns lose their referent; prepend the section path to each chunk.",
              "Re-indexing without deleting old chunks; version the chunker and remove stale IDs.",
            ],
          },
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
          {
            summary:
              "A vector index such as HNSW or IVF prunes the search space to trade recall for latency, while metadata filters decide which candidates are eligible. Approximate search can miss the passage that matters, so recall and p95 latency must be measured against exact search on the same corpus.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Tuning efSearch or nprobe without a recall baseline; compare against brute-force results.",
              "Filtering after top-k and returning too few rows; use filtered search or over-fetch with a cap.",
              "Forgetting that deletes leave tombstones; monitor index size and rebuild when fragmentation grows.",
            ],
          },
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
          {
            summary:
              "Retrieval is a chain: normalize the query, generate candidates with lexical and vector search, rerank with a cross-encoder, then assemble diverse passages under a token budget. Each stage carries its own recall and latency cost, so an improvement must target the stage that actually fails.",
            difficulty: "advanced",
            minutes: 65,
            pitfalls: [
              "Adding a reranker before fixing candidate recall; a reranker cannot recover a missing passage.",
              "Sending the raw conversational query to search; rewrite it with the prior turn's subject first.",
              "Returning near-duplicate chunks from one document; deduplicate by parent ID or apply MMR.",
            ],
          },
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
          {
            summary:
              "RAG fits answers that depend on changing, private or citable documents, especially when access control must follow the source. It fits poorly when the task needs a new style or behavior rather than a fact, which points to examples, fine-tuning or deterministic code instead.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Choosing RAG for a task that needs a new style; use examples or fine-tuning instead.",
              "Ignoring document-level permissions in the index; filter retrieval by the caller's entitlements.",
              "Indexing everything because storage is cheap; stale and low-authority sources add distractors.",
            ],
          },
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
          {
            summary:
              "RAGAS scores RAG components separately: context precision and recall for retrieval, faithfulness and answer relevance for generation. Reference-free metrics make iteration cheap, but a human-labeled sample is still needed to confirm the metric tracks what users consider correct.",
            difficulty: "advanced",
            minutes: 65,
            pitfalls: [
              "Reporting one aggregate score; break results down into retrieval and generation failures.",
              "Treating an LLM faithfulness score as ground truth; calibrate it against human labels.",
              "Generating synthetic questions from the same chunks used for retrieval; hold out documents to avoid leakage.",
            ],
          },
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
          {
            summary:
              "An agent is a control loop that observes state, selects a tool call, executes it and feeds the result back into the model until a stop condition. Autonomy widens the action space, so step limits, typed tool errors and a durable trace are what keep cost and side effects bounded.",
            difficulty: "advanced",
            minutes: 65,
            pitfalls: [
              "Letting the loop run without a step or token budget; set a hard cap and return partial state.",
              "Hiding tool errors from the model; return a structured failure it can act on.",
              "Granting write access before read-only behavior works; stage permissions by capability.",
            ],
          },
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
          {
            summary:
              "A tool schema declares the name, arguments and description the model may call, and the runtime validates arguments before executing anything. Authorization, idempotency keys and structured error results belong in the tool layer, because the model's choice of tool is a proposal rather than a permission.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Executing model-supplied arguments without validation; parse them into a typed schema and reject extra fields.",
              "Making a write tool retry-unsafe; require an idempotency key or a read-before-write check.",
              "Returning a stack trace as the tool result; return a short error code and a recoverable message.",
            ],
          },
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
          {
            summary:
              "MCP is a JSON-RPC protocol in which a host connects to servers that expose tools, resources and prompts, with capabilities negotiated at initialization. A standard transport and schema let one server serve many clients, but each server still needs authentication, scoping and an audit trail.",
            difficulty: "advanced",
            minutes: 65,
            pitfalls: [
              "Assuming MCP servers are trusted; a server can return malicious content, so validate outputs and scope credentials.",
              "Exposing every internal endpoint as a tool; publish the smallest useful capability set.",
              "Assuming negotiation removes version skew; pin protocol versions and test against the host you deploy.",
            ],
          },
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
          {
            summary:
              "An MCP server is a long-running API process that advertises tool schemas, validates arguments and returns structured content or errors over stdio or HTTP. Because a model is one client, the server still needs authentication, rate limits, redacted logging and tests for denied permissions.",
            difficulty: "advanced",
            minutes: 70,
            pitfalls: [
              "Logging full request payloads with secrets; redact arguments and keep correlation IDs.",
              "Testing only the happy path; add a denied-permission case and an invalid-argument case.",
              "Running a slow tool without a timeout; set deadlines and return a structured timeout error.",
            ],
          },
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
          {
            summary:
              "Memory splits into a short-term transcript that must fit the context window and a long-term store retrieved by embedding or key. Writing, retrieving and forgetting are separate policies, and retention plus deletion rules decide whether the memory is an asset or a liability.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Storing every turn without summarization; compact sessions and keep durable facts in typed records.",
              "Retrieving memory without user scoping; key every record by tenant and subject.",
              "Making deletion a soft flag only; propagate erasure to indexes, caches and backups.",
            ],
          },
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
          {
            summary:
              "Multi-agent designs split a task across roles with separate prompts, contexts and tools, coordinated by a supervisor or a handoff protocol. The split buys context isolation and specialization but adds token cost, latency and failure modes at every handoff, so it needs evidence against a single agent.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Adding agents to mirror an org chart; compare against a single agent with tools on the same evaluation.",
              "Passing the full transcript to every agent; send compact task state and only the relevant artifacts.",
              "Losing the trace at handoffs; propagate one correlation ID and log inputs and outputs per agent.",
            ],
          },
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
          {
            summary:
              "ReAct interleaves a reasoning trace with tool actions, feeding each observation into the next thought. The pattern helps multi-step tasks but exposes internal text and grows the transcript, so production use needs redaction, step limits and a planner for work that can be decomposed up front.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Streaming raw thoughts to users; separate internal traces from the user-facing answer.",
              "Letting the transcript grow until it truncates; summarize observations and cap iterations.",
              "Using ReAct for a fixed workflow; encode the known steps in code instead.",
            ],
          },
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
          {
            summary:
              "An evaluation set is a fixed collection of inputs with expected properties, re-run on every prompt, model or retrieval change. Task-level metrics, stratified sampling and a CI gate turn quality into a regression signal instead of a demo impression.",
            difficulty: "core",
            minutes: 65,
            pitfalls: [
              "Building cases only from easy examples; include ambiguous, adversarial and refusal cases.",
              "Changing the dataset and the prompt in one commit; version both so a score change is attributable.",
              "Reporting one average across mixed intents; stratify by task type and traffic share.",
            ],
          },
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
          {
            summary:
              "A judge model scores outputs against a rubric, often pairwise, which makes large-scale review affordable. Position bias, verbosity bias and version drift mean the rubric must be calibrated against human labels and re-checked when the judge model changes.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Trusting absolute one-to-ten scores without anchors; use pairwise comparison or a rubric with examples.",
              "Letting the judge see which system produced an answer; blind inputs and randomize order.",
              "Leaving the judge model unpinned; record its version and re-run calibration after upgrades.",
            ],
          },
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
          {
            summary:
              "Human evaluation samples real outputs and has reviewers score them against a written rubric, producing the labels that automated metrics are calibrated against. Sampling design, reviewer guidelines and inter-annotator agreement determine whether the labels measure quality or reviewer taste.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Using one reviewer per item with no overlap; run a shared calibration set and compute agreement.",
              "Writing rubric criteria that bundle several dimensions; score correctness, tone and safety separately.",
              "Ignoring the sampling frame; weight items by real traffic mix instead of convenience.",
            ],
          },
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
          {
            summary:
              "Observability records a trace per request: prompt version, retrieved document IDs, tool calls, token counts, latency and the final output. Correlation IDs and redaction make a bad answer reproducible without storing sensitive text in plain sight.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Logging full prompts with personal data; redact or hash before storage and restrict access.",
              "Tracing only the model call; include retrieval, tool and validation spans in the same trace.",
              "Sampling away all failures; keep error traces at full rate and sample successes.",
            ],
          },
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
          {
            summary:
              "Cost per request is input tokens plus output tokens plus retries, priced per model, while latency is queueing plus time to first token plus generation. Dashboards must split p50 from p95 and attribute spend by feature, or a quiet prompt change can double the bill.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Averaging latency and missing the tail; track p95 and time to first token separately.",
              "Ignoring cache hit rate; count cache reads and writes in the cost model.",
              "Alerting on total spend only; set per-feature budgets and per-request token caps.",
            ],
          },
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
          {
            summary:
              "Adversarial testing probes the system with deliberate misuse: indirect injection, jailbreaks, data exfiltration and malformed tool input. Findings are only useful when reproduced, severity-rated and converted into regression cases that run with the normal evaluation suite.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Running a one-off exercise with no ticket trail; file each finding with reproduction steps and severity.",
              "Testing the model alone and not the tools; exercise authorization and data boundaries end to end.",
              "Fixing a finding without a regression test; add the exact attack to CI.",
            ],
          },
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
          {
            summary:
              "Safety engineering defines which requests the system refuses, which it escalates to a human and which it answers with a caveat, then enforces those rules in code and evaluation. A filter alone is insufficient because harm depends on context, permissions and the consequences of the action the model can take.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Treating a moderation filter as the whole safety story; add action limits, escalation and audit.",
              "Writing refusal categories without test cases; encode each category as an evaluation example.",
              "Ignoring bias in retrieval sources; audit coverage and representation in the corpus.",
            ],
          },
        ),
      ],
    },
  ],
};
