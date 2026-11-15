import type { Curriculum } from "../types";
import { topic } from "../types";

export const golang: Curriculum = {
  slug: "golang",
  title: "Go Engineering",
  tagline: "Small language, explicit systems, serious concurrency.",
  description:
    "A guided path through Go's deliberately small language and its production habits: values and composition, interfaces, concurrency and cancellation, errors, tests, the standard library and the tools that ship a service. Every stage ends with code you can run and inspect.",
  level: "beginner",
  icon: "code",
  estimatedHours: 55,
  stages: [
    {
      slug: "getting-started",
      title: "Getting started",
      description:
        "Why Go exists, how a program is organized and how the toolchain turns packages into a binary.",
      topics: [
        topic(
          "history-of-go",
          "Go's constraints were deliberate responses to real problems at Google: slow builds, dependency pain and complex concurrency.",
          [
            "The 2007 context: multicore, networked systems and large codebases",
            "The design goals: simplicity, fast compilation and built-in concurrency",
            "What Go deliberately left out and why",
          ],
          "Write a short note comparing Go's design goals with a language you already know. Name one feature Go omits and the trade-off behind it.",
          { difficulty: "foundation", minutes: 30 },
        ),
        topic(
          "why-use-go",
          "Choosing Go is choosing operability: small binaries, a strong standard library, predictable concurrency and a toolchain the whole team can share.",
          [
            "Deployment and startup characteristics",
            "The standard library and the net/http model",
            "Where Go fits and where it does not",
          ],
          "Take a service you know and list three reasons Go would simplify it, plus one reason it would make it harder.",
          { difficulty: "foundation", minutes: 30 },
        ),
        topic(
          "setting-up-the-environment",
          "A reproducible toolchain and module setup prevents the first day of debugging from being about installation.",
          [
            "Installing Go and checking GOROOT/GOPATH",
            "Modules, workspaces and the module cache",
            "Editor tooling and gofmt",
          ],
          "Install Go from the official archive, create a module, run it and verify gofmt changes one intentionally messy file.",
          { difficulty: "foundation", minutes: 35 },
        ),
        topic(
          "hello-world-in-go",
          "The smallest program exposes the shape of every Go program: package, imports and a main function.",
          [
            "Package declaration and the main entry point",
            "Imports and the fmt package",
            "Building versus running",
          ],
          "Write hello world from memory, build it to a binary and run the binary outside the source directory.",
          { difficulty: "foundation", minutes: 25 },
        ),
        topic(
          "go-command",
          "`go` is the build system, test runner, formatter, dependency manager and documentation browser; learning its subcommands is learning the language's workflow.",
          ["go run, build, test and vet", "go mod and go get", "go doc, go fmt and go list"],
          "Use go doc to inspect a standard-library package, then use go list to find where it is imported in a small module.",
          { difficulty: "foundation", minutes: 40 },
        ),
        topic(
          "packages",
          "Packages are Go's unit of compilation and visibility; a clean package boundary is the first architectural decision.",
          [
            "Package names, directories and import paths",
            "Exported versus unexported identifiers",
            "Avoiding cycles and keeping the public surface small",
          ],
          "Build a two-package module where one package exposes a small API and the other consumes it without reaching into internals.",
          { difficulty: "foundation", minutes: 45 },
        ),
        topic(
          "modules--dependencies",
          "Modules make dependency versions explicit and reproducible; hidden dependency drift is an operational bug.",
          [
            "go.mod, go.sum and semantic import versioning",
            "Adding, upgrading and removing dependencies",
            "Vendoring and the module proxy",
          ],
          "Add one dependency, inspect the go.mod/go.sum diff, then remove it and verify the build is clean.",
          { difficulty: "core", minutes: 40 },
        ),
      ],
    },
    {
      slug: "core-language",
      title: "Core language",
      description:
        "Variables, types, control flow and functions: the small set of rules you will use in every file.",
      topics: [
        topic(
          "variables--constants",
          "Go makes declaration and initialization explicit, which removes a class of ambiguity before it reaches runtime.",
          [
            "var, short declarations and inference",
            "Constants, iota and typed versus untyped values",
            "Zero values and initialization order",
          ],
          "Rewrite a messy declaration block using constants, short declarations and explicit types where the boundary matters.",
          { difficulty: "foundation", minutes: 40 },
        ),
        topic(
          "data-types",
          "Go's type system is small but strict: choosing the right numeric, string and composite type prevents silent conversions.",
          [
            "Integers, floats, complex numbers and runes",
            "Strings, bytes and Unicode",
            "Arrays, slices, maps and structs",
          ],
          "Write a program that converts between string, []byte and rune slices and prints the length of each representation.",
          { difficulty: "foundation", minutes: 45 },
        ),
        topic(
          "zero-values",
          "A zero value is always defined, which is a feature and a trap: nil maps, nil slices and zero structs behave differently.",
          [
            "Zero values for each type",
            "Nil slices, maps, pointers and interfaces",
            "Designing types that are useful at zero",
          ],
          "Find three nil-related bugs in a small program, then fix one by making the zero value useful.",
          { difficulty: "core", minutes: 35 },
        ),
        topic(
          "conditionals",
          "Control flow is intentionally boring in Go; the interesting decisions are in the conditions you write.",
          [
            "if, else and initialization statements",
            "Boolean expressions and short-circuiting",
            "Guard clauses and early returns",
          ],
          "Refactor a deeply nested function into guard clauses with the same behavior and a smaller diff.",
          { difficulty: "foundation", minutes: 30 },
        ),
        topic(
          "switch",
          "Switch is Go's clearest multi-branch tool, with no implicit fallthrough and a useful type-switch form.",
          [
            "Expression switches and multiple values per case",
            "Type switches on interfaces",
            "Fallthrough and the empty switch",
          ],
          "Replace a long if/else chain with a switch and add a type switch for two concrete implementations.",
          { difficulty: "core", minutes: 35 },
        ),
        topic(
          "for-loop",
          "Go has one loop keyword, which makes iteration easy to read and easy to get wrong when closures capture variables.",
          [
            "The three forms of for",
            "Range over slices, maps, strings and channels",
            "Loop variable capture and early exits",
          ],
          "Write a range loop that captures a variable correctly, then reproduce the old bug and explain the difference.",
          { difficulty: "foundation", minutes: 35 },
        ),
        topic(
          "functions-basics",
          "Functions are the main unit of behavior; multiple returns make errors and results explicit.",
          [
            "Parameters, return values and named results",
            "Multiple returns and the error convention",
            "Variadic functions and function types",
          ],
          "Write a function with two results and a caller that handles both explicitly; then add a variadic option without breaking callers.",
          { difficulty: "foundation", minutes: 45 },
        ),
        topic(
          "scope-and-shadowing",
          "Shadowing is one of Go's most common subtle bugs, especially with `:=` inside a block.",
          [
            "Block scope and package scope",
            "Short declaration shadowing",
            "The blank identifier and unused variables",
          ],
          "Create a shadowing bug, find it with the compiler or a vet-like check, and rewrite the declaration.",
          { difficulty: "core", minutes: 35 },
        ),
      ],
    },
    {
      slug: "data-and-composition",
      title: "Data and composition",
      description:
        "Slices, maps, structs, pointers and interfaces: how Go models data and behavior without inheritance.",
      topics: [
        topic(
          "slices",
          "Slices are the default sequence type, and their length/capacity distinction explains many aliasing surprises.",
          [
            "Length, capacity and backing arrays",
            "append, copy and slice expressions",
            "Aliasing and defensive copies",
          ],
          "Build a function that appends to a slice and show when the caller's backing array changes; add a test for the boundary.",
          { difficulty: "core", minutes: 50 },
        ),
        topic(
          "maps",
          "Maps give average O(1) lookup but are not safe for concurrent writes and have important zero-value behavior.",
          [
            "Creation, lookup and the comma-ok idiom",
            "Iteration order and deletion",
            "Concurrent access and synchronization",
          ],
          "Implement a word counter with a map, then protect it for concurrent use and measure the difference.",
          { difficulty: "core", minutes: 45 },
        ),
        topic(
          "structs",
          "Structs are Go's composition primitive; field layout and tags are part of the API and the wire format.",
          [
            "Field visibility and embedding",
            "Struct tags for JSON and validation",
            "Zero values and constructors",
          ],
          "Model a small domain with structs, add JSON tags and test the round trip with a zero-value field.",
          { difficulty: "core", minutes: 45 },
        ),
        topic(
          "pointers",
          "Pointers express sharing and mutation explicitly; Go has no pointer arithmetic, but nil still matters.",
          [
            "Address-of, dereference and nil",
            "Pointers versus values in APIs",
            "Escape analysis and allocation",
          ],
          "Write the same mutating method with a value and a pointer receiver, then explain which callers observe the change.",
          { difficulty: "core", minutes: 45 },
        ),
        topic(
          "methods-vs-functions",
          "Methods attach behavior to a type, but a function is often the simpler and more testable choice.",
          [
            "Method sets and receivers",
            "Value versus pointer receivers",
            "Functions as dependencies",
          ],
          "Refactor a method into a function that takes the type explicitly, then decide which version makes the dependency clearer.",
          { difficulty: "core", minutes: 35 },
        ),
        topic(
          "interfaces-basics",
          "Interfaces are satisfied implicitly, which enables small consumer-owned contracts and easy test doubles.",
          [
            "Interface definitions and implicit satisfaction",
            "Small interfaces and the io.Reader model",
            "Nil interfaces and type assertions",
          ],
          "Define a one-method interface at the consumer, implement it with a real client and a fake, and test both paths.",
          { difficulty: "core", minutes: 50 },
        ),
        topic(
          "embedding-structs",
          "Embedding composes behavior without inheritance; it is powerful and easy to overuse.",
          [
            "Embedding versus named fields",
            "Method promotion and ambiguity",
            "Composition at the API boundary",
          ],
          "Build a type that embeds a logger, then replace it with a named field and compare the call sites.",
          { difficulty: "core", minutes: 40 },
        ),
        topic(
          "generics",
          "Generics remove duplication when the algorithm is truly type-independent, but they are not a substitute for interfaces.",
          [
            "Type parameters and constraints",
            "Generic functions versus generic types",
            "When a concrete type or interface is clearer",
          ],
          "Write a generic filter and a concrete version, then decide which one earns its complexity in a real call site.",
          { difficulty: "advanced", minutes: 50 },
        ),
      ],
    },
    {
      slug: "concurrency",
      title: "Concurrency and cancellation",
      description:
        "Goroutines and channels are cheap; correctness comes from ownership, cancellation and bounded work.",
      topics: [
        topic(
          "goroutines",
          "A goroutine is cheap enough to start casually, which is exactly why you need a rule for when it ends.",
          [
            "Starting and scheduling goroutines",
            "The main goroutine and program exit",
            "Leaks and ownership",
          ],
          "Start ten goroutines, make one block forever, then detect and fix the leak with a cancellation signal.",
          { difficulty: "core", minutes: 45 },
        ),
        topic(
          "channels",
          "Channels communicate and synchronize, but unbuffered sends can deadlock without a receiver.",
          ["Send, receive and close", "Directional channels", "Range, close and the zero value"],
          "Build a producer/consumer pair with a closed channel and verify the consumer exits without a sentinel panic.",
          { difficulty: "core", minutes: 50 },
        ),
        topic(
          "buffered-vs-unbuffered",
          "Buffer size changes the synchronization and backpressure behavior of a pipeline.",
          [
            "Unbuffered rendezvous semantics",
            "Buffered queues and backpressure",
            "Capacity, drops and shutdown",
          ],
          "Run the same producer/consumer with zero and five buffer slots, then measure blocking and throughput.",
          { difficulty: "advanced", minutes: 45 },
        ),
        topic(
          "select-statement",
          "Select is how a goroutine waits on multiple events and how cancellation becomes composable.",
          [
            "Multiple cases and the default branch",
            "Timeouts and context cancellation",
            "Fairness and starvation",
          ],
          "Implement a worker that selects between work, a done channel and a timeout, then test each branch.",
          { difficulty: "advanced", minutes: 45 },
        ),
        topic(
          "waitgroups",
          "WaitGroup is the simplest way to wait for a known set of goroutines, provided Add happens before Wait.",
          [
            "Add, Done and Wait",
            "Passing a WaitGroup safely",
            "Combining WaitGroup with error collection",
          ],
          "Fan out five jobs with a WaitGroup, collect errors through a channel and wait for all of them.",
          { difficulty: "core", minutes: 40 },
        ),
        topic(
          "mutexes",
          "A mutex protects shared state, but the lock should protect an invariant, not individual lines.",
          [
            "sync.Mutex and sync.RWMutex",
            "Lock scope and defer Unlock",
            "Deadlocks and lock ordering",
          ],
          "Protect a shared counter with a mutex, then remove the lock and reproduce the race with `go test -race`.",
          { difficulty: "core", minutes: 40 },
        ),
        topic(
          "context-package",
          "Context carries cancellation, deadlines and request-scoped values across API boundaries.",
          [
            "Context creation and propagation",
            "Deadlines, cancellation and Done",
            "Values versus explicit parameters",
          ],
          "Make a function respect context cancellation, then add a deadline and test the early-return path.",
          { difficulty: "advanced", minutes: 50 },
        ),
        topic(
          "worker-pools",
          "A worker pool bounds concurrency and makes backpressure explicit; unbounded goroutines are an outage waiting to happen.",
          [
            "Fixed workers and a job channel",
            "Result collection and shutdown",
            "Limits, queue size and cancellation",
          ],
          "Build a pool of four workers over a finite queue, then measure behavior when the queue is full.",
          { difficulty: "advanced", minutes: 55 },
        ),
      ],
    },
    {
      slug: "errors-and-testing",
      title: "Errors and testing",
      description:
        "Errors are values, tests are part of the design and the race detector is a tool, not a formality.",
      topics: [
        topic(
          "error-handling-basics",
          "Go treats errors as ordinary values, which forces the caller to decide what happens next.",
          [
            "Returning and checking errors",
            "Wrapping with %w and errors.Is/As",
            "Sentinels, custom types and context",
          ],
          "Write a function with three failure modes, wrap each with context and test them with errors.Is.",
          { difficulty: "core", minutes: 45 },
        ),
        topic(
          "wrappingunwrapping-errors",
          "Wrapping preserves the cause while adding context; unwrapping should be deliberate, not automatic.",
          ["fmt.Errorf with %w", "errors.Unwrap, Is and As", "When to expose a cause"],
          "Wrap an I/O error through two layers, then use errors.As to extract the original type at the boundary.",
          { difficulty: "core", minutes: 40 },
        ),
        topic(
          "panic-and-recover",
          "Panics are for programmer errors, not expected failures; recover belongs at process or request boundaries.",
          [
            "Panic semantics and stack unwinding",
            "Recover in deferred functions",
            "Converting panics to HTTP 500s",
          ],
          "Add a recover boundary to an HTTP handler and prove that one bad request does not kill the server.",
          { difficulty: "advanced", minutes: 40 },
        ),
        topic(
          "testing-package-basics",
          "Go's testing package is deliberately small: table tests, subtests and `go test` cover most needs.",
          [
            "Test functions and *testing.T",
            "Subtests and parallel tests",
            "Test helpers and cleanup",
          ],
          "Write a test with two subtests and a t.Cleanup, then run it with -run and -v.",
          { difficulty: "core", minutes: 45 },
        ),
        topic(
          "table-driven-tests",
          "A table test makes the cases visible and the failure messages specific.",
          [
            "Case structs and named subtests",
            "Expected errors and zero values",
            "Avoiding shared mutable state",
          ],
          "Convert three copy-pasted tests into a table with named cases and one assertion block.",
          { difficulty: "core", minutes: 40 },
        ),
        topic(
          "benchmarks",
          "A benchmark is an experiment: control allocation, input size and setup before trusting the number.",
          [
            "Benchmark functions and b.N",
            "Allocs per operation and memory",
            "Benchmarking a realistic input",
          ],
          "Benchmark two implementations of the same function, add a memory profile and keep the faster one with evidence.",
          { difficulty: "advanced", minutes: 45 },
        ),
        topic(
          "mocks-and-stubs",
          "Small interfaces make fakes natural; mock only the interactions that are part of the behavior.",
          [
            "Fakes versus stubs versus mocks",
            "Interface boundaries owned by the consumer",
            "Testing without network or clock",
          ],
          "Replace a network client with an in-memory fake and assert both the result and the request it received.",
          { difficulty: "core", minutes: 45 },
        ),
        topic(
          "coverage",
          "Coverage shows which lines ran, not which behaviors are correct; use it to find gaps, not to chase a number.",
          [
            "go test -cover and coverage profiles",
            "Branch coverage and critical paths",
            "Coverage in CI without theater",
          ],
          "Generate a coverage profile, find an untested error branch and add a test that fails if it is removed.",
          { difficulty: "core", minutes: 35 },
        ),
      ],
    },
    {
      slug: "standard-library-and-shipping",
      title: "Standard library and shipping",
      description:
        "The library you already have: files, JSON, HTTP, time, logging and the release tools.",
      topics: [
        topic(
          "io--file-handling",
          "File and stream handling is where resource leaks and partial reads appear; io.Reader/Writer are the shared vocabulary.",
          [
            "os.Open, io.ReadAll and streaming",
            "defer Close and error handling",
            "Paths, permissions and temp files",
          ],
          "Write a function that copies a file with a buffer and handles partial reads, then test it with a missing file.",
          { difficulty: "core", minutes: 45 },
        ),
        topic(
          "encodingjson",
          "JSON is the default wire format; struct tags, unknown fields and streaming decide how robust the boundary is.",
          [
            "Marshal, Unmarshal and struct tags",
            "omitempty, unknown fields and numbers",
            "Streaming with Encoder/Decoder",
          ],
          "Encode a nested struct, decode it into a different shape and handle an unknown field without failing.",
          { difficulty: "core", minutes: 45 },
        ),
        topic(
          "nethttp-standard",
          "The standard library HTTP stack is production-grade and makes the handler contract explicit.",
          [
            "Handlers, ServeMux and middleware",
            "Request context, timeouts and headers",
            "Graceful shutdown",
          ],
          "Build a two-route server with a timeout, a middleware and graceful shutdown, then test it with httptest.",
          { difficulty: "core", minutes: 60 },
        ),
        topic(
          "flag",
          "Command-line configuration should be explicit, typed and documented; flags are the smallest useful interface.",
          [
            "String, int and bool flags",
            "Defaults, usage and validation",
            "Flags versus environment configuration",
          ],
          "Add two flags to a small CLI, validate them and print a useful usage message on failure.",
          { difficulty: "core", minutes: 30 },
        ),
        topic(
          "time",
          "Time zones, monotonic clocks and formatting are easy to get subtly wrong in logs and APIs.",
          [
            "time.Time, Duration and Location",
            "Formatting, parsing and UTC",
            "Timers, tickers and timeouts",
          ],
          "Parse an RFC3339 timestamp in two zones, store UTC and render it back in the user's zone.",
          { difficulty: "core", minutes: 35 },
        ),
        topic(
          "slog",
          "Structured logs are searchable evidence; the standard library now provides a competent structured logger.",
          ["Logger, handler and attributes", "Levels and context", "JSON output and redaction"],
          "Add request-scoped structured logging with a request ID and one redacted field.",
          { difficulty: "core", minutes: 35 },
        ),
        topic(
          "go-vet",
          "Vet catches real mistakes the compiler allows, especially around printf verbs, locks and struct tags.",
          [
            "Running go vet and reading the output",
            "Common printf, lock and build-tag findings",
            "Integrating vet into CI",
          ],
          "Introduce a printf mismatch and a copied lock, then fix both after running go vet.",
          { difficulty: "core", minutes: 30 },
        ),
        topic(
          "cross-compilation",
          "A single static binary is one of Go's operational advantages; cross-compiling makes releases reproducible.",
          [
            "GOOS, GOARCH and CGO",
            "Build tags and platform files",
            "Reproducible release artifacts",
          ],
          "Build a Linux amd64 binary from your machine and inspect it with file and ldd.",
          { difficulty: "advanced", minutes: 35 },
        ),
      ],
    },
    {
      slug: "web-cli-and-data",
      title: "Web, CLI and data",
      description:
        "Apply the language to the interfaces you actually ship: commands, HTTP APIs and databases.",
      topics: [
        topic(
          "building-clis",
          "A CLI is an API for humans: commands, flags, exit codes and help text are part of the contract.",
          [
            "Command structure and subcommands",
            "Exit codes, stdout and stderr",
            "Configuration and secrets",
          ],
          "Build a two-command CLI with a help screen, a non-zero exit on failure and a dry-run mode.",
          { difficulty: "core", minutes: 50 },
        ),
        topic(
          "cobra",
          "Cobra is the common Go CLI framework; its value is the command tree and completion, not magic.",
          [
            "Commands, flags and arguments",
            "Persistent flags and configuration",
            "Help, completion and testing",
          ],
          "Build a Cobra command tree with one persistent flag and a test that executes a subcommand.",
          { difficulty: "core", minutes: 45 },
        ),
        topic(
          "gin",
          "Gin is a fast HTTP framework with a familiar middleware model; the trade-off is framework-specific context.",
          [
            "Routing, groups and middleware",
            "Binding, validation and error responses",
            "Testing handlers without a live server",
          ],
          "Build a small JSON API with Gin, validate one payload and test the 400 and 200 paths.",
          { difficulty: "core", minutes: 45 },
        ),
        topic(
          "gorm",
          "GORM speeds up CRUD but hides SQL; the query plan and transaction boundary remain your responsibility.",
          [
            "Models, migrations and associations",
            "Transactions and hooks",
            "When to drop to database/sql",
          ],
          "Implement one transaction with GORM, then inspect the SQL it generated and decide whether it is acceptable.",
          { difficulty: "advanced", minutes: 50 },
        ),
        topic(
          "pgx",
          "pgx is a PostgreSQL driver with native features and better control than a generic ORM.",
          [
            "Connections, pools and context",
            "Queries, scanning and types",
            "Transactions and PostgreSQL-specific features",
          ],
          "Write a parameterized query with pgx, scan into a struct and test the context cancellation path.",
          { difficulty: "advanced", minutes: 50 },
        ),
        topic(
          "goembed-for-embedding",
          "embed puts static assets into the binary, simplifying deployment without hiding the asset pipeline.",
          [
            "The embed directive and file patterns",
            "Serving embedded assets",
            "Development versus production assets",
          ],
          "Embed one HTML template and one static file, serve them from a handler and verify the binary works without the source tree.",
          { difficulty: "core", minutes: 40 },
        ),
        topic(
          "grpc--protocol-buffers",
          "Typed RPC with streaming is a strong internal-service contract when both sides can share the schema.",
          [
            "Protobuf messages and service definitions",
            "Unary and streaming calls",
            "Deadlines, errors and code generation",
          ],
          "Define a unary RPC, generate the code and test a deadline that expires before the handler finishes.",
          { difficulty: "advanced", minutes: 55 },
        ),
        topic(
          "realtime-communication",
          "Real-time features need a transport, a lifecycle and a backpressure story; the protocol is only the beginning.",
          [
            "WebSockets, SSE and long polling",
            "Connection lifecycle and fan-out",
            "Reconnect, auth and rate limits",
          ],
          "Build a small SSE endpoint with heartbeats and test reconnect behavior behind a buffering proxy.",
          { difficulty: "advanced", minutes: 50 },
        ),
      ],
    },
  ],
};
