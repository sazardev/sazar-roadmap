import type { Curriculum } from "../types";
import { topic } from "../types";

export const softwareArchitecture: Curriculum = {
  slug: "software-design-architecture",
  title: "Software Architecture",
  tagline: "Design code that survives its own success.",
  description:
    "A guided path through the decisions that outlive a sprint: paradigms and principles, boundaries and dependency direction, domain modeling, tactical patterns, architectural styles, integration and the review habits that keep a design honest. You will produce decision records and refactorings, not vocabulary lists.",
  level: "advanced",
  icon: "blocks",
  estimatedHours: 72,
  stages: [
    {
      slug: "design-foundations",
      title: "Design foundations",
      description:
        "Start from the paradigms and mechanisms that every design decision borrows from. By the end you can explain a codebase's structure in terms of abstraction, encapsulation and the flow of control, not file names.",
      topics: [
        topic(
          "programming-paradigms",
          "Naming the dominant paradigm explains why some edits are local and others cut across the codebase; without it, style debates replace design review.",
          [
            "Imperative versus declarative evaluation",
            "Control-flow abstraction",
            "Mutable state and aliasing",
            "Paradigm boundaries inside one codebase",
          ],
          "Pick four modules from a codebase, label the dominant paradigm of each, then rewrite one function in a second paradigm and list the lines that became simpler or harder.",
          {
            summary:
              "A programming paradigm constrains how state and control flow may be expressed, not merely which syntax a language offers. Imperative code mutates state step by step, functional code composes pure transformations, and object-oriented code dispatches behavior through values; each makes some changes cheap and others awkward. Mixing paradigms without a boundary is the expensive case, because review comments become taste instead of policy.",
            difficulty: "foundation",
            minutes: 35,
            pitfalls: [
              "Enforcing a pure functional style in a language built for mutation, which adds wrappers without removing side effects. Isolate effects at the boundary instead.",
              "Mixing paradigms file by file with no written rule, so reviewers cannot tell a deliberate choice from drift. Record the rule per module.",
              "Adopting a paradigm because a conference talk praised it, without naming the change it makes cheaper. Tie the choice to a planned edit.",
            ],
            resources: [
              {
                title: "Wikipedia: Programming paradigm",
                url: "https://en.wikipedia.org/wiki/Programming_paradigm",
                kind: "docs",
              },
              {
                title: "Wikipedia: Imperative programming",
                url: "https://en.wikipedia.org/wiki/Imperative_programming",
                kind: "docs",
              },
              {
                title: "Wikipedia: Declarative programming",
                url: "https://en.wikipedia.org/wiki/Declarative_programming",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "structured-programming",
          "Without a rule that every block has one entry and one exit, error paths multiply and the control-flow graph becomes impossible to test.",
          [
            "Single-entry, single-exit blocks",
            "Sequence, selection and iteration",
            "Guard clauses versus nested conditions",
            "Control-flow graph and reachability",
          ],
          "Take a function with a goto or deeply nested conditionals, draw its control-flow graph, then rewrite it with guard clauses and confirm the path count dropped.",
          {
            summary:
              "Structured programming replaces arbitrary jumps with sequence, selection and iteration, so every block has one entry and one exit. The result is a control-flow graph you can reason about and test path by path, at the cost of occasionally writing an extra guard or helper to avoid goto. Early returns preserve the discipline; a web of flags usually does not.",
            difficulty: "foundation",
            minutes: 30,
            pitfalls: [
              "Treating single-exit as a ban on early returns, which produces nested conditionals and flag variables. Use guard clauses and keep one exit per error path.",
              "Replacing goto with exceptions that jump across layers, which hides the same unstructured transfer. Catch at a named boundary.",
              "Flattening control flow until error handling disappears. Keep the error path explicit.",
            ],
            resources: [
              {
                title: "Wikipedia: Structured programming",
                url: "https://en.wikipedia.org/wiki/Structured_programming",
                kind: "docs",
              },
              {
                title: "Dijkstra: Go To Statement Considered Harmful",
                url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
                kind: "paper",
              },
              {
                title: "Wikipedia: Control flow",
                url: "https://en.wikipedia.org/wiki/Control_flow",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "object-oriented-programming",
          "Without being explicit about dispatch and identity, classes become namespaces with getters and inheritance becomes the only reuse mechanism.",
          [
            "Dynamic dispatch and method resolution",
            "Object identity versus structural equality",
            "Encapsulated invariants",
            "Inheritance versus interface-based subtyping",
          ],
          "Model one polymorphic call site with a base class and again with an interface, then compare the number of files each change touches when a third implementation is added.",
          {
            summary:
              "Object-oriented programming bundles state with the operations that preserve its invariants, then selects an implementation through dynamic dispatch. The benefit is local reasoning about a polymorphic call site; the cost is hidden control flow, identity semantics and mutable graphs that are harder to serialize and test. It is a poor fit for pure data transforms where a function and a record are clearer.",
            difficulty: "foundation",
            minutes: 40,
            pitfalls: [
              "Using inheritance for code reuse rather than substitutability, which couples subclasses to a base class they cannot satisfy. Extract an interface instead.",
              "Exposing mutable fields so callers can break the invariant the class exists to protect. Route changes through methods.",
              "Conflating object identity with database identity; a detached object can equal another by value but not by identity. Decide which equality the domain needs.",
            ],
          },
        ),
        topic(
          "functional-programming",
          "Without pure functions and explicit effects, tests depend on order and hidden state, and refactoring becomes guesswork.",
          [
            "Referential transparency",
            "First-class and higher-order functions",
            "Immutable data and persistent structures",
            "Effect boundaries and IO monads",
          ],
          "Extract a pure pricing function from a method that reads the clock and database, then add a property test that runs the same inputs a thousand times without mocks.",
          {
            summary:
              "Functional programming treats computation as the evaluation of functions and pushes mutation to explicit boundaries. Pure functions make tests deterministic and enable substitution, but the cost appears at the edges: I/O, time and randomness still need an effect layer and a strategy for state. It is a bad fit when the domain is inherently a mutable state machine and the team has no discipline for containing effects.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Calling a function pure while it reads a global clock or logger. Pass those dependencies in or isolate them at the boundary.",
              "Rebuilding every list immutably in a hot loop and calling the result functional. Measure allocation before choosing a persistent structure.",
              "Using a monad-like wrapper as a status symbol; if the team cannot explain the effect it contains, a direct call is clearer.",
            ],
            resources: [
              {
                title: "Python documentation: Functional Programming HOWTO",
                url: "https://docs.python.org/3/howto/functional.html",
                kind: "docs",
              },
              {
                title: "Wikipedia: Functional programming",
                url: "https://en.wikipedia.org/wiki/Functional_programming",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "abstraction",
          "An abstraction that leaks forces every caller to know the implementation, which is worse than no abstraction at all.",
          [
            "Information hiding",
            "Interface contract versus implementation",
            "Leaky abstraction",
            "Abstraction cost and variation point",
          ],
          "Find an abstraction with two implementations, list the implementation details that still reach callers, then either remove the abstraction or rewrite its contract so those details disappear.",
          {
            summary:
              "Abstraction hides a decision behind a named interface so callers can depend on what, not how. A good abstraction reduces the number of facts a caller must hold, but it also adds a translation layer and a place where behavior can be lost; it pays only when the hidden decision actually varies. Leaky or speculative abstractions cost more than the duplication they replace.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Introducing an interface with one implementation and no planned second one, which adds indirection without a variation point. Wait for the second case or a test seam.",
              "Letting SQL, HTTP status codes or framework types cross the abstraction boundary, which makes every caller depend on the detail. Translate at the edge.",
              "Naming the abstraction after its implementation instead of the capability callers need. Name it for the decision it hides.",
            ],
            resources: [
              {
                title: "Wikipedia: Abstraction (computer science)",
                url: "https://en.wikipedia.org/wiki/Abstraction_(computer_science)",
                kind: "docs",
              },
              {
                title: "Martin Fowler: Dependency Injection in the Wild",
                url: "https://martinfowler.com/articles/dipInTheWild.html",
                kind: "article",
              },
            ],
          },
        ),
        topic(
          "encapsulation",
          "If callers can mutate internals directly, every invariant becomes advisory and every bug hunt starts at the data structure.",
          [
            "Invariant-preserving interfaces",
            "Representation hiding",
            "Tell, don't ask",
            "Getter and setter leakage",
          ],
          "Take a class with public fields, identify one invariant, then hide the fields behind methods and add a test that fails when the invariant is violated.",
          {
            summary:
              "Encapsulation makes an object's state reachable only through operations that preserve its invariants. The win is that a change to representation stops at the boundary; the cost is more code at the boundary and a temptation to expose getters that recreate the coupling. Encapsulation is a bad fit when the value is a passive record with no invariant to protect.",
            difficulty: "core",
            minutes: 35,
            pitfalls: [
              "Replacing public fields with public getters and setters, which hides syntax but not the coupling. Expose behavior instead.",
              "Encapsulating a value object so tightly that every read allocates a copy in a hot path. Measure before copying.",
              "Putting unrelated queries on the object until it knows about reporting and persistence. Keep those concerns outside the invariant boundary.",
            ],
          },
        ),
      ],
    },
    {
      slug: "design-principles",
      title: "Principles that change decisions",
      description:
        "Turn principles into trade-offs you can defend. You will apply SOLID, DRY, YAGNI and dependency direction to a small codebase and name the cost of each application.",
      topics: [
        topic(
          "solid",
          "Applying SOLID as five slogans produces interfaces nobody needs and subclasses that cannot substitute; the cost of each principle has to be paid deliberately.",
          [
            "Single responsibility as an axis of change",
            "Liskov substitutability contract",
            "Interface segregation at the consumer",
            "Dependency inversion and ownership of abstractions",
          ],
          "Take a class with three reasons to change, split one responsibility, and write a decision note that names the extra type and the change it makes cheaper.",
          {
            summary:
              "SOLID names five design pressures: single responsibility, open/closed extension, substitutability, interface segregation and dependency inversion. Each buys a specific kind of change at a cost: more types, more indirection and more wiring. The principles are a bad fit as a checklist; a small stable module with one caller is usually clearer without them.",
            difficulty: "foundation",
            minutes: 50,
            pitfalls: [
              "Creating an interface for every class to satisfy dependency inversion, which doubles the type count without a second implementation. Invert only at a seam you own.",
              "Splitting a cohesive class into five single-method classes and calling it SRP; the axis of change is still one. Split by the reason to change, not by method count.",
              "Substituting a subclass that throws on a base-class method, which breaks LSP at every polymorphic call. Fix the hierarchy or use composition.",
            ],
          },
        ),
        topic(
          "dry",
          "Deduplicating code that only looks similar couples unrelated changes and turns one edit into three regressions.",
          [
            "Knowledge duplication versus code duplication",
            "Single source of truth",
            "Incidental similarity",
            "Premature deduplication",
          ],
          "Find two similar functions, write down the axis on which each changes, then extract a shared helper only if the axes match and show the diff.",
          {
            summary:
              "DRY says every piece of knowledge should have one authoritative representation. The benefit is that a rule changes once, but the cost is coupling: two call sites that look alike may change for different reasons, and a shared abstraction then transmits every edit. Duplication is cheaper than the wrong abstraction, especially across bounded contexts.",
            difficulty: "foundation",
            minutes: 35,
            pitfalls: [
              "Extracting a utility because two blocks have the same shape, then adding flags for the differences. Wait for a third case or keep the duplication.",
              "Sharing a database schema or DTO across services to avoid duplication, which couples their release cycles. Duplicate the contract at the boundary.",
              "Treating repeated string literals as knowledge duplication; a constant is enough unless the value has a rule.",
            ],
          },
        ),
        topic(
          "yagni",
          "Speculative features add code paths, migrations and tests that must be maintained before anyone has proved the need.",
          [
            "Deferred decision",
            "Cost of carry",
            "Irreversible versus reversible choices",
            "Speculative generality",
          ],
          "List three unused extension points in a codebase, estimate their maintenance cost, then delete one and record the diff and test result.",
          {
            summary:
              "YAGNI defers a capability until a real requirement or measurement justifies it. The saving is optionality and less code to maintain; the cost is that some cheap, hard-to-add hooks, such as an ID format or a migration column, are worth placing early. It is a bad fit for irreversible or expensive-to-change decisions, where a small amount of foresight beats a rewrite.",
            difficulty: "foundation",
            minutes: 30,
            pitfalls: [
              "Using YAGNI to skip a migration column that will require a backfill later; distinguish cheap now from expensive later.",
              "Deleting a public API because no internal caller uses it, without checking external consumers. Measure usage first.",
              "Building an abstraction for a second use case that has not arrived, then carrying it through three releases. Add it with the second case.",
            ],
          },
        ),
        topic(
          "coupling-and-cohesion",
          "A module that is tightly coupled and weakly cohesive cannot be tested or changed without dragging half the system along.",
          [
            "Afferent and efferent coupling",
            "Functional versus coincidental cohesion",
            "Stable dependencies principle",
            "Change propagation",
          ],
          "Draw a module dependency graph, mark the edge with the highest change frequency, then move one responsibility to reduce that edge and rerun the build.",
          {
            summary:
              "Coupling counts the assumptions one module makes about another; cohesion counts how strongly a module's responsibilities belong together. Low coupling and high cohesion make change local, but pushing either to an extreme produces fragmented modules or a few enormous ones. The design question is which changes should travel together, not a score to maximize.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Minimizing coupling by splitting every dependency behind an interface, which adds indirection and leaves the runtime dependency intact. Measure the change that crosses the edge.",
              "Maximizing cohesion by putting everything related to a feature in one file, which creates a merge hotspot. Split by rate and reason of change.",
              "Treating package dependencies as the only coupling; shared database tables and global config couple modules just as tightly.",
            ],
            resources: [
              {
                title: "Wikipedia: Coupling (computer programming)",
                url: "https://en.wikipedia.org/wiki/Coupling_(computer_programming)",
                kind: "docs",
              },
              {
                title: "Wikipedia: Cohesion (computer science)",
                url: "https://en.wikipedia.org/wiki/Cohesion_(computer_science)",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "composition-over-inheritance",
          "Inheritance fixes behavior at compile time and exposes the base class; composition keeps the dependency replaceable and the surface small.",
          [
            "Delegation versus subclassing",
            "Fragile base class problem",
            "Interface-based composition",
            "Substitutability contract",
          ],
          "Replace one concrete base class with an injected interface plus a default implementation, then count the changed call sites and the methods no longer exposed.",
          {
            summary:
              "Composition builds behavior by holding collaborators and delegating to them; inheritance builds it by extending a base class. Composition keeps the implementation replaceable and avoids fragile base-class coupling, but it costs explicit forwarding code and more objects. Inherit only when the subtype is genuinely substitutable and the base class is designed for extension.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Composing by embedding a concrete type and calling it composition; the outer type still exposes the inner API. Depend on the interface and forward only what you need.",
              "Using inheritance to share two helper methods, which forces every subclass to accept the whole base contract. Extract a collaborator.",
              "Replacing a stable, small hierarchy with ten injected strategies; composition has a cost, and a closed hierarchy can be simpler.",
            ],
          },
        ),
        topic(
          "program-against-abstractions",
          "Depending on a concrete client or database type puts its release cycle, test setup and failure modes inside your domain logic.",
          [
            "Dependency inversion",
            "Consumer-owned interfaces",
            "Adapter at the boundary",
            "Stable contract versus implementation detail",
          ],
          "Find a direct dependency on a vendor SDK, define the one-method interface the domain needs, and wrap the SDK in an adapter with a contract test.",
          {
            summary:
              "Programming against an abstraction means the caller depends on a contract it owns, not on a concrete library or transport. The benefit is substitutability and a test seam; the cost is an extra translation and the risk of an abstraction that mirrors one implementation. It is a bad fit when there is one stable implementation and no boundary to protect.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Defining the interface from the vendor SDK's shape, which reproduces every method and leaks its types. Define it from the consumer's use case.",
              "Abstracting a pure value type that has no I/O, which adds a layer with no variation. Depend on the value directly.",
              "Letting the adapter throw vendor exceptions through the contract; translate failures into domain errors at the boundary.",
            ],
            resources: [
              {
                title: "Wikipedia: Abstraction principle (computer programming)",
                url: "https://en.wikipedia.org/wiki/Abstraction_principle_(computer_programming)",
                kind: "docs",
              },
              {
                title: "Martin Fowler: Dependency Injection in the Wild",
                url: "https://martinfowler.com/articles/dipInTheWild.html",
                kind: "article",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "code-and-boundaries",
      title: "Code and boundaries",
      description:
        "Make code readable and make boundaries explicit. You will refactor a tangled module, shrink its public surface and move framework details to the edge where they belong.",
      topics: [
        topic(
          "clean-code-principles",
          "Code that is correct but unreadable makes every later change slower and every review a reconstruction of intent.",
          [
            "Local readability versus diff size",
            "Intention-revealing structure",
            "Consistent formatting and vocabulary",
            "Boy scout refactoring",
          ],
          "Take a 100-line function, rename its variables and extract one intention-named helper, then measure the diff size and review time against the original.",
          {
            summary:
              "Clean code is code whose intent is visible without a narrator: names, control flow and boundaries carry the meaning. Readability lowers the cost of review and change, but it is not free: extracting every branch and renaming every symbol can produce a diff larger than the behavior change. Apply it to code you are already touching, not as a rewrite program.",
            difficulty: "foundation",
            minutes: 40,
            pitfalls: [
              "Running a whole-repository rename and reformat in the same commit as a behavior change, which makes the bug impossible to locate. Separate mechanical and semantic diffs.",
              "Extracting every conditional into a named method until the top-level flow disappears. Extract at the level of a concept, not every line.",
              "Treating clean code as a style guide only; formatting passes while the module still has hidden temporal coupling.",
            ],
            resources: [
              {
                title: "Martin Fowler: CodeSmell",
                url: "https://martinfowler.com/bliki/CodeSmell.html",
                kind: "article",
              },
              {
                title: "Refactoring.Guru: Code Smells",
                url: "https://refactoring.guru/refactoring/smells",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "meaningful-names-over-comments",
          "A comment that explains a bad name will drift from the code, while a good name stays true at every call site.",
          [
            "Domain vocabulary in identifiers",
            "Comment drift",
            "Name length versus scope",
            "Why-comments versus what-comments",
          ],
          "Find three comments that restate the code, rename the underlying symbols, delete the comments, and run the tests to prove behavior is unchanged.",
          {
            summary:
              "A name is the cheapest documentation because every use repeats it; a comment is a claim that can go stale. Renaming toward domain vocabulary removes the need for many explanatory comments, but the cost is churn at call sites and a learning curve for terms. Keep comments for intent, constraints and why the obvious alternative was rejected.",
            difficulty: "foundation",
            minutes: 30,
            pitfalls: [
              "Renaming a public API to a clearer domain term without a deprecation path, which breaks every consumer. Stage the rename and keep an alias.",
              "Using a short name because the line is long, then relying on a comment to say what it is. Let the name carry the meaning.",
              "Deleting a comment that records a regulatory or performance constraint because the code looks self-explanatory. Keep the why.",
            ],
            resources: [
              {
                title: "Microsoft: Naming guidelines",
                url: "https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/naming-guidelines",
                kind: "docs",
              },
              {
                title: "Martin Fowler: CodeSmell",
                url: "https://martinfowler.com/bliki/CodeSmell.html",
                kind: "article",
              },
            ],
          },
        ),
        topic(
          "keep-methods--classes--files-small",
          "A unit that does too much is hard to name, hard to test and a merge conflict waiting for the next change.",
          [
            "One level of abstraction per function",
            "Cohesion versus file count",
            "Extract method and extract class",
            "Navigation cost",
          ],
          "Take the largest file in a module, list its reasons to change, then split it along one reason and record the before and after file and test counts.",
          {
            summary:
              "Small methods, classes and files keep one level of abstraction visible at a time, which makes tests and reviews target a single behavior. The cost is more navigation and more files, and size alone is a weak proxy for cohesion: a 20-line method with three responsibilities is still too large. Split by responsibility and change rate, not by a line-count target.",
            difficulty: "core",
            minutes: 35,
            pitfalls: [
              "Splitting a class by line count, which produces many anemic fragments that always change together. Split by reason to change.",
              "Extracting one-line helpers that hide a guard or a calculation; a name should replace a concept, not a punctuation mark.",
              "Creating one file per class in a language where a module is the unit of cohesion, which adds imports and hides the relationship.",
            ],
            resources: [
              {
                title: "Martin Fowler: CodeSmell",
                url: "https://martinfowler.com/bliki/CodeSmell.html",
                kind: "article",
              },
              {
                title: "Refactoring.Guru: Code Smells",
                url: "https://refactoring.guru/refactoring/smells",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "minimize-cyclomatic-complexity",
          "Every independent path is another case to test and another place for a state combination to escape review.",
          [
            "Independent paths and branch coverage",
            "Guard clauses and early returns",
            "Decision tables and polymorphism",
            "Complexity moved versus removed",
          ],
          "Measure complexity for the five largest functions with a linter or radon cc, refactor the highest one, and compare the score with the test count.",
          {
            summary:
              "Cyclomatic complexity counts the independent paths through a function, so it approximates the number of test cases needed for branch coverage. Lowering it with guard clauses and extracted decisions makes the main path readable, but the cost is more functions and a risk of moving complexity rather than removing it. It is a bad fit as a single quality gate: a parser or state machine can be legitimately branch-heavy.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Chasing a score by replacing an if/else with a lookup table that no one can read. Optimize for the reader, not the metric.",
              "Extracting branches into a helper and leaving the same number of paths, which moves the score without reducing the cases. Measure the whole call graph.",
              "Setting one threshold for every module; a codec or parser needs a different budget from a request handler.",
            ],
            resources: [
              {
                title: "Wikipedia: Cyclomatic complexity",
                url: "https://en.wikipedia.org/wiki/Cyclomatic_complexity",
                kind: "docs",
              },
              {
                title: "Microsoft: CA1502 excessive complexity rule",
                url: "https://learn.microsoft.com/en-us/dotnet/fundamentals/code-analysis/quality-rules/ca1502",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "boundaries",
          "Without an explicit boundary, a change in the payment provider or persistence schema reaches into domain rules that should not know about either.",
          [
            "Bounded context",
            "Anti-corruption layer",
            "Contract and translation at the seam",
            "Boundary ownership",
          ],
          "Draw the boundary between a domain module and its payment provider, list every type that crosses it, then introduce a translation layer and remove the provider types from the domain.",
          {
            summary:
              "A boundary is a place where one model, language or failure mode ends and another begins; it needs an owner, a contract and a translation. Explicit boundaries keep domain rules independent of frameworks, but each one adds mapping code and a place where data can be lost. Do not draw a boundary where the two sides change together and no translation is needed.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Sharing a database table across a boundary to avoid mapping, which couples the schemas and defeats the separation. Give each side its own model.",
              "Drawing a boundary around every class, which turns method calls into protocols and adds failure modes without a model difference.",
              "Letting the boundary's DTO become the domain model, so vendor fields and nullability leak inward. Translate into domain terms.",
            ],
            resources: [
              {
                title: "Martin Fowler: BoundedContext",
                url: "https://martinfowler.com/bliki/BoundedContext.html",
                kind: "article",
              },
              {
                title: "Microsoft: Anti-corruption layer pattern",
                url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "keep-framework-code-distant",
          "Framework types in the domain make the framework's upgrade cycle, annotations and test harness part of your business rules.",
          [
            "Hexagonal architecture ports and adapters",
            "Framework annotations at the edge",
            "Composition root",
            "Mapping cost",
          ],
          "Move one framework-annotated class behind a plain domain interface and a thin adapter, then run the domain tests without starting the framework.",
          {
            summary:
              "Keeping framework code distant means the domain depends on its own types while adapters at the edge translate to and from the framework. The benefit is a testable core and a replaceable runtime; the cost is boilerplate mapping and a second model to keep in sync. It is a bad fit for a short-lived CRUD tool whose framework is the product and will never be replaced.",
            difficulty: "advanced",
            minutes: 45,
            pitfalls: [
              "Wrapping every framework call in an adapter, including logging and configuration, which creates a second framework. Isolate the domain, not the whole runtime.",
              "Putting ORM entities and domain entities in the same class, so a schema change mutates the domain. Separate persistence records from domain objects.",
              "Hiding the framework so completely that startup wiring becomes unreadable. Keep a single explicit composition root.",
            ],
            resources: [
              {
                title: "Alistair Cockburn: Hexagonal Architecture",
                url: "https://alistair.cockburn.us/hexagonal-architecture/",
                kind: "article",
              },
              {
                title: "Robert C. Martin: The Clean Architecture",
                url: "https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html",
                kind: "article",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "domain-modeling",
      title: "Domain modeling",
      description:
        "Model the business before modeling the database. You will build a ubiquitous language, separate entities from value objects, and turn a use case into a boundary with an explicit invariant.",
      topics: [
        topic(
          "domain-driven-design",
          "Without a domain model, business rules scatter across controllers and SQL, and no one can say which invariant the system actually enforces.",
          [
            "Bounded context",
            "Ubiquitous language",
            "Context map and integration patterns",
            "Core domain versus supporting subdomain",
          ],
          "Write a context map for one product with three bounded contexts, name the integration pattern on each edge, and mark the core domain with the team that owns it.",
          {
            summary:
              "Domain-driven design puts a model of the business at the center and uses bounded contexts to keep models from collapsing into one. The payoff is software whose structure matches the rules it enforces; the cost is access to domain experts and a modeling effort that is wasted if the domain is simple. It is a bad fit for CRUD tools whose rules are data entry.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Applying tactical patterns to every table and calling it DDD; entities and repositories without a model do not create a domain. Start with language and invariants.",
              "Drawing one bounded context for the whole company, which forces a single model across incompatible meanings. Split where the language changes.",
              "Ignoring the context map, so two teams share a database and silently diverge. Name the relationship and the translation.",
            ],
          },
        ),
        topic(
          "domain-language",
          "When code, tickets and conversations use different words for the same concept, every handoff introduces a translation bug.",
          [
            "Ubiquitous language",
            "Term-to-code traceability",
            "Synonyms and false friends",
            "Language boundary between contexts",
          ],
          "Build a glossary of ten terms from one context, map each to a type or method, and mark the terms that appear under two different names in code.",
          {
            summary:
              "Ubiquitous language is the shared, precise vocabulary that domain experts and developers use in conversation, tickets and code. It reduces translation loss at handoffs, but maintaining it costs time and exposes disagreements that were previously hidden in synonyms. It is a bad fit when the domain has no expert available and the vocabulary is being invented by the developers alone.",
            difficulty: "core",
            minutes: 35,
            pitfalls: [
              "Building a glossary document that no one updates, so code and language drift. Put the terms in type names and review the glossary with each model change.",
              "Using a technical synonym because the domain term is awkward in the language, then translating at every read. Adopt the domain term or record the exception.",
              "Sharing one glossary across bounded contexts, which hides conflicting meanings. Keep a glossary per context.",
            ],
          },
        ),
        topic(
          "entities",
          "Modeling an entity as a bag of fields makes identity and lifecycle implicit, so duplicate records and lost updates reach production.",
          [
            "Identity versus attribute equality",
            "Entity lifecycle and state transitions",
            "Surrogate versus natural keys",
            "Aggregate root",
          ],
          "Take a customer record with no identity rule, define its identifier and lifecycle states, then add a test that two instances with the same attributes but different IDs are not equal.",
          {
            summary:
              "An entity is a domain object defined by an identity that persists while its attributes change. The model needs an explicit identity rule and a lifecycle, which makes comparisons and persistence correct; the cost is that every entity must decide when two instances are the same. Use a value object when identity adds no meaning and only the attributes matter.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Using all business fields as the primary key, so a legal name change creates a new customer. Give the entity a stable surrogate identity.",
              "Implementing equality by comparing database rows, which breaks for unsaved or detached entities. Define equality in the domain.",
              "Treating every table row as an entity; lookup data that never changes identity is usually a value object.",
            ],
            resources: [
              {
                title: "Martin Fowler: EvansClassification",
                url: "https://martinfowler.com/bliki/EvansClassification.html",
                kind: "article",
              },
              {
                title: "Martin Fowler: Domain Model",
                url: "https://martinfowler.com/eaaCatalog/domainModel.html",
                kind: "article",
              },
            ],
          },
        ),
        topic(
          "value-objects",
          "Passing raw strings and numbers around lets invalid values reach the domain, where every caller has to re-check them.",
          [
            "Immutability and structural equality",
            "Self-validating construction",
            "Value object versus entity",
            "Primitive obsession",
          ],
          "Replace a raw string email and integer cents pair with two value objects, reject invalid input in their constructors, and update one boundary mapper.",
          {
            summary:
              "A value object is defined entirely by its attributes and is immutable, so two instances with the same values are interchangeable. It moves validation and formatting into one place, but it adds allocation and mapping at boundaries and can make ORM mapping more verbose. Do not use it for an object whose identity matters, such as an account that persists across attribute changes.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Making a value object mutable so an ORM can set its fields, which destroys the invariant and equality contract. Use a constructor or a mapper that builds a new instance.",
              "Creating a value object for every primitive, which turns arithmetic into method chains. Apply it where validation or meaning is shared.",
              "Comparing value objects by reference in tests, so equal values fail. Implement structural equality.",
            ],
          },
        ),
        topic(
          "usecases",
          "Without an explicit use case, transaction boundaries and authorization checks end up in controllers, where they are duplicated or skipped.",
          [
            "Actor and goal",
            "Transaction boundary",
            "Input and output ports",
            "Use case versus controller",
          ],
          "Turn a controller method into a use case class with an input record, a repository port and an explicit transaction boundary, then write one test that runs without HTTP.",
          {
            summary:
              "A use case is one application operation with a named actor, inputs, preconditions and a transaction boundary. It makes the success path and failure policy visible and testable without a web server, but it adds a layer of orchestration that can become a thin pass-through. Skip it for a trivial CRUD endpoint whose only rule is a table write.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Putting HTTP status codes and request objects in the use case, which couples the application layer to the transport. Accept a plain input record.",
              "Creating one use case per repository method, which produces pass-through classes with no policy. Group by an operation the actor recognizes.",
              "Letting a use case call another use case and opening nested transactions. Compose at the orchestration boundary or use a single transaction.",
            ],
            resources: [
              {
                title: "Martin Fowler: UseCase",
                url: "https://martinfowler.com/bliki/UseCase.html",
                kind: "article",
              },
              {
                title: "Robert C. Martin: The Clean Architecture",
                url: "https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html",
                kind: "article",
              },
            ],
          },
        ),
        topic(
          "anemic-models",
          "An anemic model lets every service reimplement the same rule, so invariants diverge and no single place can enforce them.",
          [
            "Behavior-rich domain model",
            "Invariant ownership",
            "Transaction script versus domain model",
            "Tell, don't ask",
          ],
          "Move one rule from a service into the entity that owns the data, delete the service method, and add a test that cannot construct an invalid entity.",
          {
            summary:
              "An anemic model is a set of data classes with getters and setters while business rules live in services. It is easy to generate and familiar to CRUD teams, but the cost is scattered invariants and a domain that cannot protect itself. It is a reasonable fit for a read-only projection or a simple form, not for a workflow with rules that must hold across fields.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Adding setters to every field so the service can assign them, which recreates the anemic model inside a rich class. Expose operations that change state.",
              "Moving all logic into entities until they depend on repositories and mailers. Keep orchestration in the use case and invariants in the model.",
              "Calling a data class with one validation method a rich model; the test is whether the rule is enforced at construction and mutation.",
            ],
            resources: [
              {
                title: "Martin Fowler: AnemicDomainModel",
                url: "https://martinfowler.com/bliki/AnemicDomainModel.html",
                kind: "article",
              },
              {
                title: "Microsoft: Microservice domain model",
                url: "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "tactical-patterns",
      title: "Tactical patterns",
      description:
        "Connect the domain to storage without letting storage define the domain. You will choose between repositories, mappers, DTOs and transaction scripts, and explain the query and transaction boundary each one hides.",
      topics: [
        topic(
          "repositories",
          "Without a repository boundary, query syntax and persistence types spread through use cases that should not know a database exists.",
          [
            "Aggregate-root repository",
            "Collection semantics",
            "Query specification",
            "Unit of work integration",
          ],
          "Extract three raw SQL calls behind a repository interface, keep one reporting query outside it, and measure the query count for the main use case.",
          {
            summary:
              "A repository presents collection-like access to aggregates and hides query construction behind a domain-facing interface. It keeps persistence replaceable and tests fast, but it costs a mapping layer and can hide expensive queries behind innocent method calls. It is a bad fit for reporting queries that need joins, projections and pagination the domain should not model.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Creating a repository per table, which makes every table an aggregate and breaks transaction boundaries. Use one repository per aggregate root.",
              "Returning ORM entities or query objects from the repository, so callers can compose queries and bypass the boundary. Return domain types or explicit specifications.",
              "Hiding a full table scan behind a find-all method; document or measure the query cost at the boundary.",
            ],
          },
        ),
        topic(
          "mappers",
          "Mapping code that lives in the domain or controller ties the model to the schema and makes every field rename a cross-layer edit.",
          [
            "Data mapper boundary",
            "Bidirectional mapping",
            "Mapping loss and nullability",
            "Assembler at the boundary",
          ],
          "Write a mapper from a persistence row to a domain entity, add a round-trip test, then change one column name and confirm only the mapper changes.",
          {
            summary:
              "A mapper translates between domain objects and persistence or transport representations in one direction per boundary. It keeps each model independent and makes schema changes explicit, but it adds code that must be kept in sync and can mask a missing domain concept. It is a bad fit when the persistence model and domain model are genuinely identical and unlikely to diverge.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Bidirectional mapping with different defaults in each direction, which silently changes data on a round trip. Test the round trip with nulls and empty values.",
              "Putting business logic in the mapper, so a save changes rules that a load does not. Keep the mapper mechanical.",
              "Mapping every field by hand and letting two models diverge unnoticed; add a compile-time check or a contract test.",
            ],
          },
        ),
        topic(
          "dtos",
          "Returning domain entities over the wire exposes internal fields, couples clients to schema changes and leaks lazy-loading behavior.",
          [
            "Wire contract versus domain model",
            "Serialization boundary",
            "Over-posting and mass assignment",
            "DTO assembly",
          ],
          "Replace an entity returned by an HTTP handler with a response DTO, add a test that an internal field is absent, and update the client contract.",
          {
            summary:
              "A data transfer object is a flat, serializable shape designed for one boundary; it carries data and no behavior. It decouples the wire contract from the domain and prevents accidental lazy loads, but it costs mapping code and can encourage an anemic API that mirrors tables. It is a bad fit when the transport is internal and the payload is already a small immutable value.",
            difficulty: "core",
            minutes: 35,
            pitfalls: [
              "Reusing the domain entity as the request DTO, which lets clients set fields the domain owns. Separate input DTOs and validate them.",
              "Creating a DTO for every layer, which produces five near-identical shapes. Use one at each real boundary, not each layer.",
              "Returning a DTO that leaks database nullability or enum ordinals; define the wire format explicitly.",
            ],
            resources: [
              {
                title: "Martin Fowler: Data Transfer Object",
                url: "https://martinfowler.com/eaaCatalog/dataTransferObject.html",
                kind: "article",
              },
              {
                title: "Martin Fowler: Remote Facade",
                url: "https://martinfowler.com/eaaCatalog/remoteFacade.html",
                kind: "article",
              },
            ],
          },
        ),
        topic(
          "orms",
          "An ORM hides SQL until the query plan matters, and a lazy load in a loop can turn a page render into hundreds of queries.",
          [
            "Identity map and change tracking",
            "Lazy versus eager loading",
            "N+1 query problem",
            "Persistence ignorance",
          ],
          "Enable SQL logging for one endpoint, count the statements, then fix an N+1 with a fetch strategy and record the before and after query count.",
          {
            summary:
              "An object-relational mapper translates rows to objects and generates SQL from a model. It speeds up CRUD and handles identity and change tracking, but it obscures query shape, fetch strategy and transaction scope, and its abstraction leaks at exactly the performance edge. It is a bad fit for bulk reporting or hand-tuned queries where SQL is the design.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Using lazy loading in a loop and calling it an ORM performance problem; fix the fetch strategy and assert the query count.",
              "Letting ORM entities define the domain model, so schema annotations and proxies leak into business rules. Map to a separate domain model where the rules matter.",
              "Assuming the ORM's cache is a transaction boundary; a change in flush timing can lose writes.",
            ],
            resources: [
              {
                title: "Microsoft: Entity Framework Core documentation",
                url: "https://learn.microsoft.com/en-us/ef/core/",
                kind: "docs",
              },
              {
                title: "Martin Fowler: Data Mapper",
                url: "https://martinfowler.com/eaaCatalog/dataMapper.html",
                kind: "article",
              },
            ],
          },
        ),
        topic(
          "identity-maps",
          "Without an identity map, the same row loaded twice becomes two objects, and changes to one silently overwrite the other.",
          ["Unit-of-work scope", "Object identity cache", "Change tracking", "Detached entities"],
          "Load the same row twice through a session, assert both references are the same object, then detach and reload to show when identity guarantees end.",
          {
            summary:
              "An identity map keeps one instance per database identity within a unit of work, so repeated loads return the same object. It preserves in-memory consistency and makes change tracking reliable, but it costs memory and requires a clear scope and flush policy. It is a bad fit for read-only reporting or very large batches where holding every entity is the problem.",
            difficulty: "advanced",
            minutes: 40,
            pitfalls: [
              "Using a process-wide identity map, which grows without bound and leaks stale state across requests. Scope it to the unit of work.",
              "Assuming identity equality means database equality after a detach; define equality for detached objects explicitly.",
              "Caching an entity after a bulk update that bypassed the ORM, so the map serves stale data. Clear or invalidate the scope.",
            ],
          },
        ),
        topic(
          "transaction-script",
          "A transaction script is clear for one workflow and becomes a copy-paste maze when five workflows share the same rules.",
          [
            "Procedure per request",
            "Transaction boundary",
            "Duplicated business rules",
            "Refactoring to a domain model",
          ],
          "Take two transaction scripts with a duplicated discount rule, extract the rule into a domain object, and show the diff that removes the second copy.",
          {
            summary:
              "A transaction script puts one request's logic in a single procedure that reads, computes and writes inside a transaction. It is direct and easy to trace, which suits simple workflows, but it duplicates rules as workflows multiply and has no object model to enforce invariants. It is a bad fit once the same rule appears in three scripts or the rules need independent tests, which is when a domain model starts to pay.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Letting transaction scripts grow to hundreds of lines with shared helpers, which is a domain model without encapsulation. Extract the invariants.",
              "Opening a transaction in each helper, so one request commits several times. Keep one transaction per request.",
              "Rewriting a simple script into entities and repositories before a second workflow exists; the model has no payoff yet.",
            ],
          },
        ),
      ],
    },
    {
      slug: "architectural-styles",
      title: "Architectural styles",
      description:
        "Compare whole-system shapes by their failure and change characteristics, not by fashion. You will sketch a monolith, a layered system, a service boundary and an event-driven flow for the same domain and defend one choice.",
      topics: [
        topic(
          "layered-architectures",
          "Without a dependency rule, the presentation layer reaches into SQL and the database schema becomes the application's model.",
          [
            "Dependency rule",
            "Application versus domain layer",
            "Ports and adapters",
            "Layer leakage",
          ],
          "Map one request through four layers, mark every type that crosses a layer boundary, then move one infrastructure type behind a port and rerun the tests.",
          {
            summary:
              "Layered architecture organizes code into presentation, application, domain and infrastructure layers with dependencies pointing inward. The separation makes each layer testable and replaceable, but it adds pass-through methods and can hide a domain that is only anemic data. It is a bad fit when the application is a thin CRUD surface over one database and the layers have nothing distinct to say.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Creating a service layer that only forwards calls to repositories, which adds classes without adding policy. Put use-case orchestration there or remove it.",
              "Letting entities depend on the ORM or the web framework because they sit in the domain folder; enforce the dependency direction in the build.",
              "Adding a layer for every technical concern until a simple query takes six files. Keep layers by responsibility, not by pattern name.",
            ],
          },
        ),
        topic(
          "monolithic",
          "A monolith is not a failure of ambition; deployed without internal boundaries it becomes a change bottleneck, and split too early it becomes a distributed mess.",
          [
            "Deployment unit versus module boundary",
            "In-process transaction",
            "Modular monolith",
            "Strangler fig migration",
          ],
          "Draw the module graph of a monolith, mark the two modules with the most cross-module writes, and propose one boundary or one extraction with its migration cost.",
          {
            summary:
              "A monolith ships one deployable unit with in-process calls and one database. It gives simple transactions, cheap refactoring and one place to observe, but coupling grows unless modules have explicit boundaries and owners. A monolith is a bad fit when independent teams need independent release cadence and the deployment unit is the bottleneck.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Calling any single deployment a monolith while its modules share mutable tables with no contracts. Measure coupling, not the binary count.",
              "Splitting into services before modularizing, which turns in-process coupling into network coupling. Define the module boundary first.",
              "Using a shared database to keep transactions easy, then wondering why services cannot deploy independently.",
            ],
          },
        ),
        topic(
          "microservices",
          "A service boundary turns a method call into a network call, so latency, partial failure and data consistency become design problems rather than implementation details.",
          [
            "Service autonomy",
            "Database per service",
            "Saga and eventual consistency",
            "Service mesh and observability",
          ],
          "Split one module into a service boundary on paper, list every cross-boundary call and consistency rule, then write a decision record rejecting or accepting the split.",
          {
            summary:
              "Microservices split a system into independently deployable services owned by small teams, each with its own data store and release cycle. The benefit is independent change and failure isolation; the cost is distributed transactions, operational surface and a much harder debugging story. It is a bad fit when one team owns the domain, the scale does not require independent deployment, or the data is highly relational.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Splitting by technical layer, such as a user service and a database service, rather than by business capability, which creates chatty services. Split by bounded context and ownership.",
              "Keeping a shared database to avoid sagas, which makes independent deployment impossible. Give each service its data and define the consistency contract.",
              "Ignoring operational cost: one service needs logs, metrics, traces, deploys and on-call. Count the runbooks before splitting.",
            ],
          },
        ),
        topic(
          "event-driven",
          "Events decouple producers from consumers, but without an ownership and replay policy, no one can explain the current state from the event log.",
          [
            "Event notification versus event-carried state",
            "Consumer idempotency",
            "Ordering and partitioning",
            "Event schema ownership",
          ],
          "Model one workflow as an event flow, mark where it is eventually consistent, then write the consumer's retry and duplicate-handling policy.",
          {
            summary:
              "Event-driven architecture publishes facts about what happened and lets consumers react without a direct call. The decoupling lets new consumers be added without changing producers, but it moves consistency, ordering and failure handling into the messaging layer. It is a bad fit when the caller needs an immediate answer or when the event schema has no owner.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Publishing an event before the transaction commits, so consumers see state that later rolls back. Use an outbox or publish after commit.",
              "Treating events as RPC with a reply topic, which recreates synchronous coupling with more moving parts. Use a command and response channel when an answer is required.",
              "Letting consumers depend on fields the producer considers internal; version the schema and document compatibility.",
            ],
          },
        ),
        topic(
          "serverless-architecture",
          "Serverless moves scaling and patching to the provider but replaces them with cold starts, execution limits and a per-invocation cost model.",
          [
            "Cold start and execution duration",
            "Event source mapping",
            "Stateless invocation",
            "Per-invocation cost model",
          ],
          "Estimate the monthly cost and p95 latency of one workload as a serverless function versus a small container, using measured invocation duration and request rate.",
          {
            summary:
              "Serverless runs code in provider-managed, event-triggered execution units that scale to zero and bill per invocation. It removes server operations and matches bursty workloads, but it constrains execution time, local state and connection pooling, and the bill can invert at sustained load. It is a bad fit for long-running jobs, steady high-throughput services or workloads needing persistent in-process caches.",
            difficulty: "advanced",
            minutes: 45,
            pitfalls: [
              "Opening a database connection per invocation and exhausting the pool; use a proxy or the provider's connection model.",
              "Assuming scale-to-zero means no capacity planning; concurrency limits and downstream quotas still bind.",
              "Putting a long-running batch in a function with a timeout, then retrying the partial work. Use a durable workflow or a queue.",
            ],
            resources: [
              {
                title: "Martin Fowler: Serverless Architectures",
                url: "https://martinfowler.com/articles/serverless.html",
                kind: "article",
              },
              {
                title: "Microsoft: Serverless on Azure",
                url: "https://learn.microsoft.com/en-us/azure/architecture/serverless/",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "soa",
          "SOA promises reuse across the enterprise, but shared services with shared contracts become a coordination tax on every team.",
          [
            "Service contract and registry",
            "Enterprise service bus",
            "Canonical data model",
            "Service granularity",
          ],
          "Map three existing services to their consumers and contracts, then mark the shared canonical model fields that force coordinated releases and propose one contract owned by a consumer.",
          {
            summary:
              "Service-oriented architecture structures capabilities as network-accessible services with explicit contracts, often with an enterprise service bus mediating integration. It enables cross-system reuse and centralized policy, but the bus and shared canonical models couple teams to a central release and a lowest-common-denominator contract. It is a bad fit for a single product team that can own its own services and does not need enterprise-wide mediation.",
            difficulty: "advanced",
            minutes: 45,
            pitfalls: [
              "Putting business logic in the service bus, which makes the bus a new monolith with a harder deploy. Keep mediation to routing and translation.",
              "Building a canonical model for the whole enterprise, which becomes a committee-owned bottleneck. Let each context own its model and translate.",
              "Calling every microservice an SOA success while services share a database and release together.",
            ],
          },
        ),
      ],
    },
    {
      slug: "integration-and-distribution",
      title: "Integration and distribution",
      description:
        "Design the seams between components: messages, events, commands, queries and the consistency model that connects them. You will model one workflow with a queue and one with an event stream, then name what each makes harder.",
      topics: [
        topic(
          "messaging",
          "A direct call fails when the receiver is down; a message survives, but only if the producer defines delivery, ordering and duplicate handling.",
          [
            "Message channel and endpoint",
            "At-most-once versus at-least-once delivery",
            "Idempotent receiver",
            "Dead-letter channel",
          ],
          "Take one synchronous call, redesign it as a message with a delivery guarantee, and write the consumer's idempotency key and dead-letter policy.",
          {
            summary:
              "Messaging moves data between components as discrete messages through a channel, decoupling the sender's lifecycle from the receiver's. It buys temporal decoupling and load leveling, but adds a broker, serialization and failure modes such as duplicates and reordering. It is a bad fit when the interaction needs an immediate, consistent answer and the overhead cannot be justified.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Choosing at-least-once delivery and writing a non-idempotent consumer, so retries double-charge. Add a deduplication key and a unique constraint.",
              "Using messaging for a request that needs an immediate response, then building a reply queue and a timeout state machine. Use a synchronous call.",
              "Putting large payloads on the bus; use a claim check and pass a reference.",
            ],
          },
        ),
        topic(
          "publish-subscribe",
          "Publish-subscribe hides the consumer list from the producer, which is exactly why an unowned subscription can silently change system behavior.",
          [
            "Topic and subscription",
            "Topic fan-out and subscriptions",
            "Consumer groups and competing consumers",
            "Event schema compatibility",
          ],
          "Add a second subscriber to one event stream, measure the fan-out and duplicate work, then write the subscription ownership and retention policy.",
          {
            summary:
              "Publish-subscribe sends each event to every interested subscriber through a topic, so the producer does not know the consumer list. It makes adding consumers cheap and keeps producers independent, but it also hides fan-out cost, ordering and the blast radius of a bad event. It is a bad fit when exactly one consumer must process each message or when the producer needs a reply.",
            difficulty: "advanced",
            minutes: 40,
            pitfalls: [
              "Using publish-subscribe for work distribution where every subscriber must not receive every message; use a queue with competing consumers.",
              "Letting subscribers depend on a producer's internal event fields without a versioned schema, so a producer change breaks consumers. Version and test compatibility.",
              "Ignoring retention and replay: a new subscriber cannot rebuild state if events expire.",
            ],
          },
        ),
        topic(
          "message-queues--streams",
          "A queue and a log look similar in a diagram but differ in retention, ordering and replay, and choosing the wrong one changes the failure model.",
          [
            "Competing consumers",
            "Log offset and retention",
            "Partition ordering",
            "Backpressure and dead-lettering",
          ],
          "Run one workload through a queue and a partitioned log, then record the ordering, replay and redelivery behavior you observe for a failed consumer.",
          {
            summary:
              "A message queue delivers each message to one consumer and usually removes it after acknowledgment; a stream appends records to an ordered log that consumers read at their own offset. A queue is a bad fit when several teams must replay the same history, and a stream is a bad fit when each job must be processed exactly once without consumer-group bookkeeping. Both add operational and ordering constraints, so choose by the consumption model, not by the broker's marketing.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Using a stream as a work queue without a consumer group, so every consumer processes every message. Choose the delivery model deliberately.",
              "Assuming global ordering in a partitioned log; order is per partition. Choose the partition key from the invariant.",
              "Setting retention shorter than the slowest consumer's recovery time, which loses the replay you designed for.",
            ],
          },
        ),
        topic(
          "cqrs",
          "Separating reads from writes can simplify each model, but the moment the read side lags, every screen must explain stale data.",
          [
            "Command versus query model",
            "Projection and read store",
            "Eventual consistency window",
            "Write model invariants",
          ],
          "Build a read projection for one aggregate, measure the lag between a write and its visibility, and document the UI behavior during that window.",
          {
            summary:
              "Command-query responsibility segregation uses separate models for writes and reads, often with a projection updated asynchronously. It lets each side be shaped for its job and scale independently, but it adds a projection pipeline, eventual consistency and duplicate data. It is a bad fit when the read and write models are the same shape or the UI cannot tolerate lag.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Applying CQRS to a simple CRUD screen, where one model already serves both sides. Start with the write model and split only when the read shape diverges.",
              "Forgetting to handle projection failures, so the read model silently stops updating. Add lag monitoring and a rebuild path.",
              "Putting business rules in the read side, where they cannot enforce writes. Keep invariants on the command side.",
            ],
          },
        ),
        topic(
          "event-sourcing",
          "Storing only current state loses how it got there; storing events without a schema and snapshot policy turns the log into a liability.",
          [
            "Event log as source of truth",
            "Aggregate replay and snapshots",
            "Projection rebuild",
            "Event schema evolution",
          ],
          "Implement one aggregate as an event stream, rebuild its state from events, then add a snapshot and measure replay time with and without it.",
          {
            summary:
              "Event sourcing persists every state change as an immutable event and rebuilds current state by replaying the log. It gives a complete audit trail and temporal queries, but it costs event schema evolution, snapshots, projections and a new operational model. It is a bad fit for simple CRUD, for data that must be deleted on request without a crypto-shredding plan, and for teams that cannot own schema versioning.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Treating the event log as an audit table beside a normal database, so the two diverge. Make one the source of truth and derive the other.",
              "Changing an event's meaning in place, which makes old events replay incorrectly. Version events and keep upcasters.",
              "Never compacting or snapshotting, so startup replay grows without bound. Set a snapshot and retention policy.",
            ],
          },
        ),
        topic(
          "distributed",
          "A distributed system trades a local call for a network call, and the network can delay, duplicate, reorder or lose it while the caller waits.",
          [
            "Partial failure and timeouts",
            "Idempotency and retries",
            "CAP and consistency trade-offs",
            "Distributed tracing",
          ],
          "Trace one cross-service request, inject a timeout and a retry, then record the latency distribution and the duplicate side effects you observe.",
          {
            summary:
              "A distributed architecture places components on separate machines that communicate over a network, so work can scale and fail independently. The benefit is isolation and capacity; the cost is partial failure, clock skew, retries and the impossibility of a single atomic transaction across nodes. Keep a problem local unless independent scaling or failure isolation justifies the network.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Retrying a non-idempotent write on timeout, which duplicates the effect. Use an idempotency key or a deduplicating store.",
              "Assuming clocks are synchronized enough for last-write-wins; use logical versions or a conflict policy.",
              "Adding a network hop to a local call without measuring latency and failure rates; the distribution must buy something.",
            ],
            resources: [
              {
                title: "Martin Fowler: Patterns of Distributed Systems",
                url: "https://martinfowler.com/articles/patterns-of-distributed-systems/",
                kind: "article",
              },
              {
                title: "Microsoft: Cloud design patterns",
                url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "architecture-in-practice",
      title: "Architecture in practice",
      description:
        "Make architecture a maintained artifact: principles, patterns, decision records and small refactorings. You will write a decision record, review a design against its constraints and remove one abstraction that does not pay for itself.",
      topics: [
        topic(
          "architectural-principles",
          "Without stated principles, each team resolves the same trade-off differently and the architecture becomes the sum of local compromises.",
          [
            "Principle as a decision rule",
            "Explicit exceptions",
            "Fitness function",
            "Architecture review",
          ],
          "Write five principles for a codebase, turn two into automated checks, and record one accepted exception with its expiry date.",
          {
            summary:
              "Architectural principles are short, testable rules that settle recurring trade-offs such as dependency direction, data ownership and deployment independence. They make reviews consistent and give new decisions a default, but each principle constrains a valid option and can become dogma when applied without context. Keep the list small and record the exception process.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Writing principles that cannot be checked, such as preferring simplicity, which produces agreement without behavior. Make each one testable.",
              "Treating a principle as absolute and rejecting a necessary exception; document the trade-off and the owner.",
              "Publishing principles that the architecture itself violates, which teaches the team to ignore them.",
            ],
          },
        ),
        topic(
          "architectural-patterns",
          "Patterns are shortcuts only when the forces match; copying a pattern without its constraints imports complexity the system did not need.",
          [
            "Pattern forces and context",
            "Quality attribute trade-offs",
            "Reference architecture",
            "Pattern erosion",
          ],
          "Pick one pattern, list the quality attributes it optimizes, then score two of your system's constraints against it and write the rejection or acceptance rationale.",
          {
            summary:
              "An architectural pattern is a named arrangement of components and responsibilities, such as layered, event-driven or microkernel. It gives a team a shared vocabulary and known failure modes, but the pattern also constrains deployment, data ownership and team structure, and it is a bad fit when the dominant force is different. Use the pattern as a hypothesis to test against the system's change and failure requirements.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Choosing a pattern by diagram shape without naming the force it resolves, which adds structure without solving the problem.",
              "Mixing three patterns in one system without a boundary, so each pattern's guarantees are lost.",
              "Letting the pattern name substitute for a design; the responsibilities and data ownership still have to be specified.",
            ],
          },
        ),
        topic(
          "gof-design-patterns",
          "A design pattern applied where the variation does not exist adds classes and indirection that every reader must decode.",
          [
            "Strategy and runtime selection",
            "Adapter and interface translation",
            "Observer and notification",
            "Factory Method and construction",
          ],
          "Replace one conditional with Strategy, then compare the diff against a table lookup; keep the version with fewer concepts and explain why.",
          {
            summary:
              "The GoF patterns describe reusable object collaborations such as Strategy, Adapter, Observer and Factory Method. They compress a known design conversation and expose its trade-offs, but each pattern adds indirection and is a bad fit when the language or a simpler function already solves the problem. Learn the forces and the refactoring that leads to the pattern, not the class diagram.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Creating a factory for a single constructor call, which adds a layer with no variation. Use the constructor until construction varies.",
              "Using Observer for a single listener, where a direct callback is clearer. Patterns are for variation, not ceremony.",
              "Applying a pattern from memory without checking whether the host language has a native construct that replaces it.",
            ],
          },
        ),
        topic(
          "design-patterns",
          "Pattern names let a team compress a design discussion, but a catalog entry is not evidence that the pattern fits this codebase.",
          [
            "Context, forces and consequences",
            "Pattern versus idiom",
            "Indirection cost",
            "Refactoring toward a pattern",
          ],
          "Take one pattern from a catalog, write its forces and consequences for your codebase, then implement the smallest version and measure the added types and call sites.",
          {
            summary:
              "A design pattern is a reusable solution to a recurring design problem within a context, described by its participants, forces and consequences. It gives reviewers a precise vocabulary and a checklist of trade-offs, but patterns become cargo cults when the context is dropped and the extra indirection is not measured. Use a pattern only after the simpler refactoring has been tried and the variation point is real.",
            difficulty: "core",
            minutes: 35,
            pitfalls: [
              "Naming a class Factory without an actual construction decision, which adds vocabulary but not a solution.",
              "Applying a pattern to a stable, single-implementation seam; the indirection outlives the problem it solved.",
              "Copying a pattern's structure but not its invariants, so the code has the shape and none of the guarantees.",
            ],
          },
        ),
        topic(
          "policy-vs-detail",
          "When policy depends on a framework or database detail, every infrastructure upgrade becomes a business-rule change.",
          [
            "Dependency inversion",
            "Composition root",
            "Stable policy, volatile detail",
            "Screaming architecture",
          ],
          "Take a business rule that imports a framework type, move the rule behind a plain interface, and add a test that runs without the framework on the classpath.",
          {
            summary:
              "Policy is the decision about what the system should do; detail is the mechanism that carries it out, such as a database, web framework or message broker. Keeping policy independent of detail makes the rules testable and the mechanism replaceable, but it costs a translation layer and can produce abstractions that mirror the detail. It is a bad fit when the detail is trivial and stable, and the extra boundary has no variation to absorb.",
            difficulty: "advanced",
            minutes: 45,
            pitfalls: [
              "Abstracting the database behind a generic repository with every SQL feature, which recreates the database API and leaks it. Model the operations the policy needs.",
              "Putting orchestration in the detail layer, so the policy cannot be tested without a server. Move the use case inward.",
              "Treating all details as equally volatile, which over-abstracts stable libraries and buries the important boundary.",
            ],
            resources: [
              {
                title: "Robert C. Martin: The Clean Architecture",
                url: "https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html",
                kind: "article",
              },
              {
                title: "Martin Fowler: Dependency Injection in the Wild",
                url: "https://martinfowler.com/articles/dipInTheWild.html",
                kind: "article",
              },
            ],
          },
        ),
        topic(
          "keep-it-simple-and-refactor-often",
          "A design that cannot be changed in small steps becomes a rewrite, and a rewrite loses the behavior the tests never captured.",
          [
            "Behavior-preserving refactoring",
            "Small reversible diffs",
            "Technical debt as a budget",
            "Preparatory refactoring",
          ],
          "Take one feature change, split it into a preparatory refactor and a behavior commit, then verify the first commit passes the full test suite unchanged.",
          {
            summary:
              "Keep it simple and refactor often means choosing the smallest design that passes the current tests and improving its structure in small, behavior-preserving steps. The benefit is a codebase that stays changeable without a big-bang rewrite; the cost is discipline, because every refactor needs tests and a reversible diff. It is a bad fit when a known, imminent requirement needs a deliberate design step now, and pretending otherwise creates a harder migration later.",
            difficulty: "advanced",
            minutes: 40,
            pitfalls: [
              "Refactoring without tests, which makes every step a possible behavior change. Add characterization tests first.",
              "Mixing a large rename with a feature commit, so reviewers cannot separate intent from behavior. Keep mechanical and semantic changes apart.",
              "Using simplicity as a reason to avoid a necessary design decision, then paying for a migration later. Name the reversible decision and its trigger.",
            ],
            resources: [
              {
                title: "Refactoring.Guru: What is Refactoring?",
                url: "https://refactoring.guru/refactoring/what-is-refactoring",
                kind: "docs",
              },
              {
                title: "Martin Fowler: Refactoring",
                url: "https://martinfowler.com/books/refactoring.html",
                kind: "book",
              },
            ],
          },
        ),
      ],
    },
  ],
};
