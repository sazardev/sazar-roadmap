import type { Curriculum } from "../types";
import { topic } from "../types";

export const golang: Curriculum = {
  slug: "golang",
  title: "Go Engineering",
  tagline: "Small language. Explicit systems. Serious concurrency.",
  description:
    "A guided path through Go's deliberately small language and the habits that make it dependable in production: values and composition, interfaces, concurrency and cancellation, errors, tests, the standard library, and the tools that ship a service. Every stage ends with code you can run and inspect.",
  level: "beginner",
  icon: "code",
  estimatedHours: 64,
  stages: [
    {
      slug: "getting-started",
      title: "Getting started",
      description:
        "Why Go exists, how a program is organized, and how the toolchain turns packages into a reproducible binary.",
      topics: [
        topic(
          "history-of-go",
          "Go's constraints were deliberate responses to slow builds, dependency pain and complex concurrency at Google.",
          [
            "The 2007 context: multicore machines, networked systems and large codebases",
            "The design goals: simplicity, fast compilation and built-in concurrency",
            "What Go deliberately left out and the trade-offs behind those choices",
          ],
          "Write a short note comparing Go's design goals with a language you already know. Name one feature Go omits and the trade-off behind it.",
          {
            summary:
              "Go was created at Google in 2007 by Robert Griesemer, Rob Pike and Ken Thompson, open-sourced in 2009, and reached 1.0 in 2012. Its design targets fast builds, readable code and first-class concurrency for large, networked systems.",
            difficulty: "foundation",
            minutes: 30,
            pitfalls: [
              "Reading the timeline as trivia instead of connecting the design constraints to today's language.",
              "Assuming Go 1.0 looked like modern Go; modules and generics arrived years later.",
              "Treating “simple” as “easy” without noticing the deliberate trade-offs.",
            ],
          },
        ),
        topic(
          "why-use-go",
          "Choosing Go is choosing operability: small static binaries, a strong standard library, predictable concurrency and a toolchain the whole team can share.",
          [
            "Deployment, startup and memory characteristics",
            "The standard library and the net/http model",
            "Where Go fits well and where another language fits better",
          ],
          "Take a service you know and list three reasons Go would simplify it, plus one reason it would make it harder.",
          {
            summary:
              "Go favors operability: one static binary, a strong standard library, fast compilation and concurrency that is part of the language. It is strongest for services, CLIs, network tools and systems where predictable behavior matters more than language expressiveness.",
            difficulty: "foundation",
            minutes: 30,
            pitfalls: [
              "Choosing Go for a UI-heavy product whose ecosystem is stronger elsewhere.",
              "Expecting inheritance, exceptions or a large framework culture from other languages.",
              "Confusing a small language with a small system: the architecture still has to be designed.",
            ],
          },
        ),
        topic(
          "setting-up-the-environment",
          "A reproducible toolchain and module setup prevents the first day of debugging from being about installation.",
          [
            "Installing the official Go toolchain and checking GOROOT/GOPATH",
            "Modules, workspaces and the module cache",
            "Editor support: gopls, gofmt and vet on save",
          ],
          "Install Go from the official archive, create a module, run it, and verify gofmt changes one intentionally messy file.",
          {
            summary:
              "Install the official toolchain, verify it with `go version`, and let modules define the project boundary. A clean editor setup with gofmt, go vet and gopls removes most day-one friction.",
            difficulty: "foundation",
            minutes: 35,
            pitfalls: [
              "Installing an old distro package and then debugging behavior that changed years ago.",
              "Editing GOPATH or the module cache by hand instead of using modules.",
              "Skipping gofmt until the first review, which creates a large unrelated diff.",
            ],
          },
        ),
        topic(
          "hello-world-in-go",
          "The smallest program exposes the shape of every Go program: package, imports, entry point and a build step.",
          [
            "Package declaration and the main entry point",
            "Imports and the fmt package",
            "Building a binary versus running source",
          ],
          "Write hello world from memory, build it to a binary, and run the binary outside the source directory.",
          {
            summary:
              "A Go executable starts with `package main` and a `func main`. The first program is small enough to show the package, import and build model without hiding anything behind a framework.",
            difficulty: "foundation",
            minutes: 25,
            pitfalls: [
              "Assuming `go run` is a production deployment; it compiles to a temporary binary.",
              "Forgetting that an executable needs `package main` and `func main`.",
              "Adding a framework before understanding the package and build model.",
            ],
          },
        ),
        topic(
          "go-command",
          "`go` is the build system, test runner, formatter, dependency manager and documentation browser; learning its subcommands is learning the language's workflow.",
          [
            "go run, build, test and vet",
            "go mod, go get and go install",
            "go doc, go fmt and go list",
          ],
          "Use `go doc` to inspect a standard-library package, then use `go list` to find where it is imported in a small module.",
          {
            summary:
              "`go` is the single entry point for building, running, testing, formatting, documenting and managing dependencies. Learning its subcommands is learning how Go projects are expected to work.",
            difficulty: "foundation",
            minutes: 40,
            pitfalls: [
              "Using `go get` to install binaries in module-aware mode; use `go install`.",
              "Editing `go.sum` manually instead of letting the toolchain update it.",
              "Ignoring `go vet` because tests pass.",
            ],
          },
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
          {
            summary:
              "Packages are the unit of compilation and visibility. Exported names are the public API; everything else is private to the package. Good package boundaries keep dependencies flowing in one direction.",
            difficulty: "foundation",
            minutes: 45,
            pitfalls: [
              "Creating one package per file, which adds imports without adding boundaries.",
              "Letting package names expose implementation details or duplicate the type name.",
              "Importing concrete implementations into domain code and creating a cycle.",
            ],
          },
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
          {
            summary:
              "Modules define a versioned unit of source code and its dependency graph. `go.mod` records requirements, `go.sum` records checksums, and the module proxy makes builds reproducible.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Committing a dirty `go.sum` or a local `replace` directive to production.",
              "Ignoring semantic import versioning when moving to v2 or later.",
              "Adding a large dependency for a function the standard library already provides.",
            ],
          },
        ),
        topic(
          "go-doc",
          "Documentation is part of the public API; `go doc` and executable examples keep it close to the code.",
          [
            "Package comments and doc comment placement",
            "Reading documentation with `go doc`",
            "Executable examples that verify output",
          ],
          "Write a package comment and one Example function for a small package, then read them with `go doc` and run the example test.",
          {
            summary:
              "`go doc` prints the documentation for a package, type or symbol. Doc comments are the first thing consumers read; good ones explain intent and include a small executable example.",
            difficulty: "core",
            minutes: 30,
            pitfalls: [
              "Writing comments that only restate the function name.",
              "Letting examples drift from the actual API because they are not executed.",
              "Documenting internal implementation instead of the behavior consumers can rely on.",
            ],
          },
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
            "var, short declarations and type inference",
            "Constants, iota and typed versus untyped values",
            "Zero values and initialization order",
          ],
          "Rewrite a messy declaration block using constants, short declarations and explicit types where the boundary matters.",
          {
            summary:
              "Variables hold values and constants hold compile-time values. Go infers types when the value is clear, but explicit types at package and API boundaries keep the contract readable.",
            difficulty: "foundation",
            minutes: 40,
            pitfalls: [
              "Using `:=` outside a function or accidentally shadowing an existing variable.",
              "Assuming an untyped constant has a fixed type instead of adopting context.",
              "Declaring package-level mutable state when a local value or dependency would do.",
            ],
          },
        ),
        topic(
          "data-types",
          "Go's type system is small but strict: choosing the right numeric, string and composite type prevents silent conversions.",
          [
            "Sized integers, floats, booleans, strings and runes",
            "UTF-8, bytes and the difference between len and rune count",
            "Arrays, slices, maps and structs as composite types",
          ],
          "Write a program that converts between string, []byte and rune slices and prints the length of each representation.",
          {
            summary:
              "Go's built-in types are small and explicit: sized integers, floats, booleans, strings, runes, arrays, slices, maps and structs. The type system catches invalid combinations at compile time; conversions are always written out.",
            difficulty: "foundation",
            minutes: 45,
            pitfalls: [
              "Assuming `int` has the same width on every platform.",
              "Indexing a string by byte and calling the result a character.",
              "Using floating point for money or identifiers that must be exact.",
            ],
          },
        ),
        topic(
          "zero-values",
          "A zero value is always defined, which is a feature and a trap: nil maps, nil slices and zero structs behave differently.",
          [
            "Zero values for each type",
            "Nil slices, maps, pointers, channels and interfaces",
            "Designing types that are useful at zero",
          ],
          "Find three nil-related bugs in a small program, then fix one by making the zero value useful.",
          {
            summary:
              "Every Go type has a defined zero value. That removes uninitialized state, but nil maps, nil slices, nil interfaces and zero structs still require deliberate handling.",
            difficulty: "core",
            minutes: 35,
            pitfalls: [
              "Writing to a nil map instead of allocating it first.",
              "Assuming a nil slice and an empty slice are interchangeable in every context.",
              "Returning a typed nil pointer as an interface and then comparing it to nil.",
            ],
          },
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
          {
            summary:
              "`if` supports an initialization statement and requires braces. Guard clauses keep control flow flat; the interesting part is the condition, not the syntax.",
            difficulty: "foundation",
            minutes: 30,
            pitfalls: [
              "Nesting instead of returning early on invalid input.",
              "Shadowing `err` inside an `if` initializer and losing the outer value.",
              "Writing conditions with side effects that are hard to test.",
            ],
          },
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
          {
            summary:
              "`switch` compares against multiple cases without implicit fallthrough and supports expression and type switches. It is usually clearer than a long chain of `else if`.",
            difficulty: "core",
            minutes: 35,
            pitfalls: [
              "Expecting C-style fallthrough by default.",
              "Breaking out of a loop when you only meant to leave the switch.",
              "Using a type switch when a small interface method would be simpler.",
            ],
          },
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
          {
            summary:
              "`for` is Go's only loop keyword. It covers counted loops, while-style loops, infinite loops and range iteration over slices, maps, strings and channels.",
            difficulty: "foundation",
            minutes: 35,
            pitfalls: [
              "Capturing a loop variable in a goroutine under pre-Go 1.22 semantics.",
              "Appending to a slice while ranging over it and assuming the range sees the new elements.",
              "Using `break` inside a `select` or `switch` and expecting to leave the loop.",
            ],
          },
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
          {
            summary:
              "Functions are the main unit of behavior. Multiple return values make errors and results explicit, and functions are values that can be passed, returned and composed.",
            difficulty: "foundation",
            minutes: 45,
            pitfalls: [
              "Ignoring the error return because the happy path worked locally.",
              "Using named returns to hide a complicated control flow.",
              "Adding a variadic parameter when an options struct would keep the call site readable.",
            ],
          },
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
          {
            summary:
              "Go has package, function and block scope. `:=` declares a new variable in the current block, which makes accidental shadowing one of the easiest mistakes to write.",
            difficulty: "core",
            minutes: 35,
            pitfalls: [
              "Shadowing `err` inside an `if` block and then checking the outer nil.",
              "Relying on package initialization order for business behavior.",
              "Using the blank identifier to silence a variable that actually signals a missing check.",
            ],
            resources: [
              {
                title: "Go specification — Declarations and scope",
                url: "https://go.dev/ref/spec#Declarations_and_scope",
                kind: "docs",
              },
              {
                title: "Effective Go — Redeclaration and reassignment",
                url: "https://go.dev/doc/effective_go#redeclaration",
                kind: "docs",
              },
            ],
          },
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
          {
            summary:
              "A slice is a small header pointing at a backing array, with a length and capacity. Appending may reuse or copy the array, and subslices keep the original array alive.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Keeping a small subslice that retains a very large backing array.",
              "Assuming `append` always copies or always reuses the array.",
              "Mutating a slice while another goroutine ranges over it.",
            ],
          },
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
          {
            summary:
              "Maps are hash tables with typed keys and values. They offer fast lookup, but iteration order is unspecified and concurrent writes are a fatal race.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Writing to a nil map instead of allocating it.",
              "Depending on map iteration order in output or tests.",
              "Concurrent map writes without a mutex or a sharded design.",
            ],
          },
        ),
        topic(
          "structs",
          "Structs are Go's composition primitive; field layout and tags are part of the API and the wire format.",
          [
            "Field visibility and zero values",
            "Struct tags for JSON, validation and databases",
            "Constructors and invariants",
          ],
          "Model a small domain with structs, add JSON tags and test the round trip with a zero-value field.",
          {
            summary:
              "Structs group named fields into a value type. Field order, visibility and tags are part of the API, the memory layout and the wire format.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Exposing mutable fields and letting callers bypass invariants.",
              "Changing field order or tags without considering persistence and wire compatibility.",
              "Using a struct as a map key while it contains slices or maps.",
            ],
          },
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
          {
            summary:
              "A pointer holds an address. Go uses pointers for mutation and sharing, not arithmetic; nil is a valid pointer value and must be handled deliberately.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Returning a pointer to a loop variable under pre-Go 1.22 semantics.",
              "Using pointers for every field to avoid thinking about copying and ownership.",
              "Dereferencing without checking nil at a public boundary.",
            ],
          },
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
          {
            summary:
              "Methods are functions with a receiver. Value receivers operate on a copy; pointer receivers can mutate the value and participate in different method sets.",
            difficulty: "core",
            minutes: 35,
            pitfalls: [
              "Using a pointer receiver on a value that must remain copyable.",
              "Putting every dependency in a receiver and making tests require the whole object.",
              "Defining methods on a type you do not own.",
            ],
          },
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
          {
            summary:
              "An interface describes behavior. Types satisfy it implicitly, so the consumer can define a small contract without the implementation importing anything.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Declaring a large interface before a consumer actually needs it.",
              "Returning a typed nil pointer as an interface and then checking `== nil`.",
              "Using type assertions without the comma-ok form.",
            ],
          },
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
          {
            summary:
              "Embedding promotes fields and methods from another type. It is composition, not inheritance: the embedded type's API becomes part of the outer type's surface.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Embedding a concrete type just to reuse one method while exposing its entire API.",
              "Creating ambiguous promoted methods that require explicit selectors.",
              "Embedding a mutex and then copying the outer struct.",
            ],
          },
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
          {
            summary:
              "Generics let functions and types work over a set of types constrained by an interface. They remove duplication when the algorithm is genuinely type-independent, but add complexity when it is not.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Adding type parameters to code that has only one concrete use.",
              "Using a constraint so broad that the function cannot do anything useful.",
              "Replacing a clear interface with generics and making the API harder to read.",
            ],
          },
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
            "Leaks, ownership and error propagation",
          ],
          "Start ten goroutines, make one block forever, then detect and fix the leak with a cancellation signal.",
          {
            summary:
              "A goroutine is a lightweight function execution managed by the Go scheduler. Starting one is cheap; deciding when it stops, who owns it and how errors return is the real work.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Starting a goroutine with no stop condition or owner.",
              "Assuming `main` waits for background goroutines before exiting.",
              "Returning an error from a goroutine and silently dropping it.",
            ],
          },
        ),
        topic(
          "channels",
          "Channels communicate and synchronize, but unbuffered sends can deadlock without a receiver.",
          ["Send, receive and close", "Directional channels", "Range, close and the zero value"],
          "Build a producer/consumer pair with a closed channel and verify the consumer exits without a sentinel panic.",
          {
            summary:
              "Channels are typed conduits for communication and synchronization between goroutines. Closing a channel signals completion; it does not free the sender.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Closing a channel from the receiver or closing it twice.",
              "Sending on a closed channel and panicking.",
              "Using a channel as a queue without deciding who closes it.",
            ],
          },
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
          {
            summary:
              "An unbuffered channel synchronizes sender and receiver at the same instant. A buffered channel decouples them up to its capacity, changing blocking, latency and backpressure.",
            difficulty: "advanced",
            minutes: 45,
            pitfalls: [
              "Using a buffer to hide a missing consumer instead of fixing the design.",
              "Assuming a buffer guarantees delivery or ordering across producers.",
              "Choosing a capacity without measuring memory and latency.",
            ],
          },
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
          {
            summary:
              "`select` waits on multiple channel operations and runs the first one ready. With `context` and timeouts, it is the backbone of cancellable concurrent code.",
            difficulty: "advanced",
            minutes: 45,
            pitfalls: [
              "Using a `default` branch in a tight loop and burning CPU.",
              "Forgetting the cancellation case and leaving a goroutine stuck.",
              "Assuming `select` picks cases in source order.",
            ],
          },
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
          {
            summary:
              "A `sync.WaitGroup` waits for a known set of goroutines. Add before starting, Done when finishing, Wait to block; misuse usually means a race or a deadlock.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Calling Add inside the goroutine after Wait has started.",
              "Reusing a WaitGroup before all Wait calls have returned.",
              "Copying a WaitGroup by value into a function.",
            ],
          },
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
          {
            summary:
              "A mutex protects shared state by making a critical section exclusive. Lock the smallest invariant, not an entire request, and never copy a locked mutex.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Copying a struct that contains a mutex.",
              "Holding a lock while doing network or disk I/O.",
              "Taking multiple locks in different orders and deadlocking.",
            ],
          },
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
          {
            summary:
              "`context.Context` carries cancellation, deadlines and request-scoped values across API boundaries. It is the standard way to stop work when the caller goes away.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Storing a context in a struct instead of passing it as the first parameter.",
              "Using context values for required dependencies or configuration.",
              "Ignoring `ctx.Done()` in a blocking loop.",
            ],
          },
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
          {
            summary:
              "A worker pool bounds how many jobs run at once. It turns unbounded concurrency into a queue with explicit capacity, backpressure and shutdown.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Putting an unbounded queue in front of a bounded pool.",
              "Forgetting to close the jobs channel and leaving workers blocked.",
              "Returning results without a cancellation path when the caller gives up.",
            ],
          },
        ),
      ],
    },
    {
      slug: "errors-and-testing",
      title: "Errors and testing",
      description:
        "Errors are values, tests are part of the design, and the race detector is a tool, not a formality.",
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
          {
            summary:
              "Errors are values returned by functions, usually as the last result. The caller decides whether to handle, wrap, retry or return them; there are no exceptions for expected failures.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Comparing errors with `==` when wrapping or custom types may be involved.",
              "Logging an error and returning it, producing duplicate noise at two layers.",
              "Discarding the original cause and losing the ability to inspect it.",
            ],
          },
        ),
        topic(
          "wrappingunwrapping-errors",
          "Wrapping preserves the cause while adding context; unwrapping should be deliberate, not automatic.",
          ["fmt.Errorf with %w", "errors.Unwrap, Is and As", "When to expose a cause"],
          "Wrap an I/O error through two layers, then use errors.As to extract the original type at the boundary.",
          {
            summary:
              "`fmt.Errorf` with `%w` adds context while preserving the cause. `errors.Is` and `errors.As` inspect the chain without string matching.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Using `%v` instead of `%w` and breaking the error chain.",
              "Wrapping an error and then losing the type needed by `errors.As`.",
              "Exposing internal causes or SQL errors directly to users.",
            ],
          },
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
          {
            summary:
              "`panic` stops normal execution and unwinds the stack; `recover` can stop the unwind inside a deferred function. Use panic for programmer errors, not expected failures.",
            difficulty: "advanced",
            minutes: 40,
            pitfalls: [
              "Using panic for validation or missing user input.",
              "Recovering and then continuing in an unknown state.",
              "Hiding a panic without logging the stack and request context.",
            ],
          },
        ),
        topic(
          "testing-package-basics",
          "Go's testing package is deliberately small: table tests, subtests and `go test` cover most needs.",
          [
            "Test functions and *testing.T",
            "Subtests, t.Run and t.Cleanup",
            "Test helpers and failure messages",
          ],
          "Write a test with two subtests and a t.Cleanup, then run it with -run and -v.",
          {
            summary:
              "Go tests are ordinary functions named `TestXxx` in `_test.go` files. `go test` compiles and runs them; `*testing.T` reports failures and manages subtests and cleanup.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Testing implementation details instead of observable behavior.",
              "Forgetting `t.Helper()` in assertion helpers and reporting the wrong line.",
              "Sharing mutable state between tests that run in parallel.",
            ],
          },
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
          {
            summary:
              "Table-driven tests put inputs, expected outputs and errors in a slice of cases. Named subtests make failures readable and new cases cheap to add.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Sharing mutable fixtures across table cases.",
              "Using the loop variable in a parallel subtest without capturing it.",
              "Making one giant table that mixes unrelated behaviors.",
            ],
          },
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
          {
            summary:
              "Benchmarks run a function repeatedly with `*testing.B` to measure time and allocations. They are experiments: control setup, input size and noise before drawing conclusions.",
            difficulty: "advanced",
            minutes: 45,
            pitfalls: [
              "Including setup inside the timed loop.",
              "Trusting a single run instead of using benchstat or repeated samples.",
              "Benchmarking an input that does not resemble production traffic.",
            ],
          },
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
          {
            summary:
              "Fakes, stubs and mocks replace a dependency in a test. Small consumer-owned interfaces make fakes simple; mocks are only useful when the interaction itself is the behavior.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Mocking every dependency, including value objects that need no isolation.",
              "Asserting call order that is not part of the contract.",
              "Letting mocks encode the implementation instead of the behavior.",
            ],
          },
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
          {
            summary:
              "Coverage records which statements ran during tests. It finds untested paths, but it cannot tell whether the assertions are meaningful.",
            difficulty: "core",
            minutes: 35,
            pitfalls: [
              "Chasing 100% with assertions that cannot fail.",
              "Ignoring untested error paths because the happy path has coverage.",
              "Using a single coverage number as the quality gate for everything.",
            ],
          },
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
          {
            summary:
              "`io.Reader` and `io.Writer` are the shared vocabulary for files, sockets, buffers and compression. The interfaces encourage streaming instead of loading everything into memory.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Forgetting to close a file and leaking a descriptor.",
              "Assuming one Read call returns the entire stream.",
              "Ignoring io.EOF and treating a normal end as a failure.",
            ],
          },
        ),
        topic(
          "encodingjson",
          "JSON is the default wire format; struct tags, unknown fields and streaming decide how robust the boundary is.",
          [
            "Marshal, Unmarshal and struct tags",
            "omitempty, unknown fields and number precision",
            "Streaming with Encoder and Decoder",
          ],
          "Encode a nested struct, decode it into a different shape and handle an unknown field without failing.",
          {
            summary:
              "`encoding/json` marshals and unmarshals Go values. Struct tags control field names and omission; streaming encoders and decoders bound memory for large payloads.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Assuming `omitempty` omits zero structs or false values in every case.",
              "Decoding numbers into float64 and losing exact integer precision.",
              "Not deciding whether unknown fields should be rejected or ignored.",
            ],
          },
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
          {
            summary:
              "The standard library provides a production-grade HTTP server and client. Handlers are functions; middleware wraps them; `context` and timeouts control request lifetimes.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Running a server without read, write or idle timeouts.",
              "Not draining or closing response bodies in a client.",
              "Using the default mux for conflicting patterns in a large API.",
            ],
          },
        ),
        topic(
          "flag",
          "Command-line configuration should be explicit, typed and documented; flags are the smallest useful interface.",
          [
            "String, int, bool and duration flags",
            "Defaults, usage and validation",
            "Flags versus environment configuration",
          ],
          "Add two flags to a small CLI, validate them and print a useful usage message on failure.",
          {
            summary:
              "`flag` parses typed command-line options with defaults and generated usage text. It is enough for most internal tools; frameworks add subcommands and completion.",
            difficulty: "core",
            minutes: 30,
            pitfalls: [
              "Mixing flags and positional arguments without validating the order.",
              "Putting secrets in flags, where they appear in process listings and shell history.",
              "Using a flag for configuration that should come from the environment in production.",
            ],
          },
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
          {
            summary:
              "`time.Time` represents an instant, `time.Duration` a span, and `time.Location` a time zone. Store UTC, format at the edge and use monotonic time for elapsed measurements.",
            difficulty: "core",
            minutes: 35,
            pitfalls: [
              "Comparing times with `==` instead of `Equal`.",
              "Storing local time in the database and losing the zone.",
              "Assuming `time.Now()` keeps its monotonic component after serialization.",
            ],
          },
        ),
        topic(
          "slog",
          "Structured logs are searchable evidence; the standard library now provides a competent structured logger.",
          [
            "Logger, handler and attributes",
            "Levels and request context",
            "JSON output and redaction",
          ],
          "Add request-scoped structured logging with a request ID and one redacted field.",
          {
            summary:
              "`log/slog` provides structured, leveled logging with pluggable handlers. Log attributes, not formatted prose, so production logs stay searchable and machine-readable.",
            difficulty: "core",
            minutes: 35,
            pitfalls: [
              "Formatting a sentence into a single attribute instead of using typed fields.",
              "Putting secrets or personal data in logs.",
              "Creating a new logger per request without sharing a configured handler.",
            ],
          },
        ),
        topic(
          "go-vet",
          "Vet catches real mistakes the compiler allows, especially around printf verbs, locks and struct tags.",
          [
            "Running go vet and reading the output",
            "Common printf, lock and struct-tag findings",
            "Integrating vet into CI",
          ],
          "Introduce a printf mismatch and a copied lock, then fix both after running go vet.",
          {
            summary:
              "`go vet` reports suspicious constructs the compiler accepts: bad printf verbs, copied locks, malformed struct tags and unreachable code. It is a floor, not a full static analyzer.",
            difficulty: "core",
            minutes: 30,
            pitfalls: [
              "Ignoring vet because tests pass.",
              "Treating vet as a replacement for staticcheck or tests.",
              "Suppressing a finding without understanding the construct it protects.",
            ],
          },
        ),
        topic(
          "cross-compilation",
          "A single static binary is one of Go's operational advantages; cross-compiling makes releases reproducible.",
          [
            "GOOS, GOARCH and CGO",
            "Build tags and platform-specific files",
            "Reproducible release artifacts",
          ],
          "Build a Linux amd64 binary from your machine and inspect it with file and ldd.",
          {
            summary:
              "`GOOS` and `GOARCH` select the target platform at build time. A static Go binary can ship without a runtime, but CGO and platform-specific files change the result.",
            difficulty: "advanced",
            minutes: 35,
            pitfalls: [
              "Forgetting `CGO_ENABLED=0` when a static binary is required.",
              "Shipping a binary without testing it on the target OS.",
              "Assuming build tags and file suffixes behave the same way in every tool.",
            ],
          },
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
            "Configuration, secrets and dry runs",
          ],
          "Build a two-command CLI with a help screen, a non-zero exit on failure and a dry-run mode.",
          {
            summary:
              "A CLI is an interface for humans and scripts. Commands, flags, exit codes, stdout/stderr and help text are the contract; the implementation language is secondary.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Printing errors to stdout and breaking scripts that parse output.",
              "Exiting 0 after a failure.",
              "Choosing a framework before defining the command contract.",
            ],
          },
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
          {
            summary:
              "Cobra builds command trees with flags, help and shell completion. It is a good fit when a CLI grows beyond a single command and a handful of flags.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Using package-level mutable flag variables that leak between tests.",
              "Doing real work in `init()` instead of a command handler.",
              "Adding subcommands before the top-level workflow is clear.",
            ],
          },
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
          {
            summary:
              "Gin is a fast HTTP framework with routing groups, middleware and binding. It reduces boilerplate but introduces a framework-specific context and dependency.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Trusting all proxies by default when deriving client IPs.",
              "Using the Gin context outside the request handler or in a goroutine.",
              "Letting framework-specific types leak into domain code.",
            ],
          },
        ),
        topic(
          "gorm",
          "GORM speeds up CRUD but hides SQL; the query plan and transaction boundary remain your responsibility.",
          [
            "Models, migrations and associations",
            "Transactions, hooks and context",
            "When to drop to database/sql",
          ],
          "Implement one transaction with GORM, then inspect the SQL it generated and decide whether it is acceptable.",
          {
            summary:
              "GORM maps structs to database tables and builds queries from method chains. It speeds up CRUD but hides SQL, so query plans and transaction boundaries still need review.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Running AutoMigrate in production without reviewing the generated schema changes.",
              "Loading entire tables or associations into memory.",
              "Ignoring N+1 queries hidden behind relationship access.",
            ],
          },
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
          {
            summary:
              "pgx is a native PostgreSQL driver with connection pooling, typed scanning and PostgreSQL-specific features. It gives more control than a generic ORM at the cost of writing SQL.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Building SQL with string concatenation.",
              "Forgetting to close rows or return connections to the pool.",
              "Ignoring context cancellation on a long query.",
            ],
          },
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
          {
            summary:
              "`//go:embed` places files into the binary at build time. It simplifies deployment of templates and static assets, but embedded files are read-only and increase binary size.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Embedding a large directory by accident and inflating the binary.",
              "Assuming embedded files can be modified at runtime.",
              "Forgetting that build tags affect which files are embedded.",
            ],
          },
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
          {
            summary:
              "gRPC uses Protocol Buffers and HTTP/2 to provide typed RPC with streaming. It is strongest for internal services where both sides can share the schema and code generation.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Using gRPC for browser clients without a proxy or a compatible transport.",
              "Forgetting deadlines and letting failed calls hang.",
              "Changing field numbers in a published protobuf schema.",
            ],
          },
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
          {
            summary:
              "Real-time Go services keep many connections open and fan out updates. WebSockets, SSE and long polling have different lifecycle, proxy and backpressure behavior.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Fanning out without a bound on slow consumers.",
              "Having no reconnect or replay strategy.",
              "Authenticating only at connection time and never revalidating.",
            ],
          },
        ),
      ],
    },
    {
      slug: "production-go",
      title: "Production Go",
      description:
        "Make Go services observable, safe and shippable: profiles, traces, allocation, vulnerabilities and releases.",
      topics: [
        topic(
          "pprof",
          "Profiles answer where CPU and memory actually go; guessing from code shape is not an optimization strategy.",
          [
            "CPU, heap, goroutine and blocking profiles",
            "Collecting profiles from a representative workload",
            "Reading a flame graph and finding the top costs",
          ],
          "Profile a small HTTP service under load, capture CPU and heap profiles, and write down the top three costs.",
          {
            summary:
              "`net/http/pprof` and `runtime/pprof` expose CPU, heap, goroutine and blocking profiles. Profiles answer where time or memory goes, but only if collected from a representative workload.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Leaving `/debug/pprof` publicly reachable.",
              "Profiling an idle service and drawing conclusions from noise.",
              "Optimizing a profile hotspot that does not affect user-visible latency.",
            ],
          },
        ),
        topic(
          "trace",
          "The execution tracer explains scheduling, GC and blocking behavior that CPU profiles cannot show.",
          [
            "Execution traces and goroutine states",
            "Scheduler, GC and syscall events",
            "Correlating traces with latency",
          ],
          "Capture a trace for a concurrent program with a scheduling problem, then identify one blocking or GC event.",
          {
            summary:
              "The execution tracer records scheduler, GC, syscall and goroutine events. It explains latency and scheduling problems that CPU profiles cannot show.",
            difficulty: "advanced",
            minutes: 45,
            pitfalls: [
              "Using the trace to find CPU hotspots instead of pprof.",
              "Tracing without a hypothesis or a time window.",
              "Ignoring the overhead and distortion of tracing.",
            ],
          },
        ),
        topic(
          "escape-analysis",
          "Escape analysis decides whether a value stays on the stack or moves to the heap; allocation only matters when measured.",
          [
            "Stack versus heap allocation",
            "Reading `-gcflags=-m` output",
            "Pointers, interfaces and compiler limits",
          ],
          "Run `go build -gcflags=-m` on a small function and explain which values escape and why.",
          {
            summary:
              "Escape analysis decides whether a value can stay on the stack or must be allocated on the heap. `-gcflags=-m` explains the decision, but allocation is only a problem when measured.",
            difficulty: "advanced",
            minutes: 45,
            pitfalls: [
              "Assuming every heap allocation is a bug.",
              "Returning pointers everywhere to avoid copies.",
              "Treating compiler diagnostics as stable guarantees across versions.",
            ],
          },
        ),
        topic(
          "garbage-collection",
          "Go's concurrent GC trades CPU and memory for low pause times; tune it only after measuring allocation behavior.",
          [
            "Heap, live set and allocation rate",
            "GOGC, GOMEMLIMIT and pause behavior",
            "Reducing allocations in hot paths",
          ],
          "Measure allocation rate and GC pauses for a small service, then compare default settings with a memory limit.",
          {
            summary:
              "Go's concurrent garbage collector trades CPU and memory to keep pause times low. `GOGC`, `GOMEMLIMIT` and allocation rate determine its behavior; tune after measuring.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Tuning GOGC before understanding the allocation profile.",
              "Confusing heap size with live heap.",
              "Blaming the GC for allocations created in hot conversion loops.",
            ],
          },
        ),
        topic(
          "govulncheck",
          "Dependency scanning is only useful when it tells you which vulnerabilities your code can actually reach.",
          [
            "Module and standard-library vulnerabilities",
            "Call-graph reachability",
            "Triaging, upgrading and documenting decisions",
          ],
          "Run govulncheck on a module, triage one finding by reachability, and document the decision.",
          {
            summary:
              "`govulncheck` reports known vulnerabilities that your code can actually reach. It combines module scanning with call-graph analysis, reducing noise from unused dependencies.",
            difficulty: "advanced",
            minutes: 40,
            pitfalls: [
              "Treating every module advisory as exploitable.",
              "Ignoring standard-library vulnerabilities.",
              "Failing to re-run the scan after dependency updates.",
            ],
          },
        ),
        topic(
          "staticcheck",
          "Staticcheck catches correctness and simplification issues that the compiler and vet intentionally allow.",
          [
            "Correctness, style and simplification checks",
            "Suppressing findings with justification",
            "Running checks in CI",
          ],
          "Run staticcheck on a module, fix one real finding, and suppress one false positive with a justification.",
          {
            summary:
              "Staticcheck adds deeper correctness and simplification checks than `go vet`. It is fast enough for CI and catches mistakes that tests may never exercise.",
            difficulty: "advanced",
            minutes: 40,
            pitfalls: [
              "Enabling every check at once and drowning in low-value findings.",
              "Suppressing findings without an explanation.",
              "Treating static analysis as a substitute for tests.",
            ],
          },
        ),
        topic(
          "golangci-lint",
          "A small, explicit lint configuration shared by local development and CI is more useful than a pile of enabled checks.",
          [
            "Aggregating linters behind one config",
            "Fast local runs and CI parity",
            "Ownership and suppression policy",
          ],
          "Configure a small set of linters in CI, run it locally, and make the config the single source of truth.",
          {
            summary:
              "golangci-lint runs many Go linters behind one config and one output. It is useful when the set of checks is small, explicit and shared by local development and CI.",
            difficulty: "advanced",
            minutes: 40,
            pitfalls: [
              "Letting local and CI configurations diverge.",
              "Enabling contradictory linters and arguing about the output.",
              "Making CI fail on style-only findings without an owner.",
            ],
          },
        ),
        topic(
          "publishing-modules",
          "A published module is a compatibility contract, not a folder uploaded somewhere.",
          [
            "Semantic version tags and import paths",
            "go.mod hygiene and consumer testing",
            "Major-version strategy",
          ],
          "Tag a small module v1.0.0, install it from a clean module, and document its compatibility policy.",
          {
            summary:
              "Publishing a Go module means a semantic version tag, a clean `go.mod`, and an import path that consumers can resolve. Major versions and API compatibility are part of the contract.",
            difficulty: "advanced",
            minutes: 45,
            pitfalls: [
              "Breaking a v1 API without a major version.",
              "Publishing a tag without a clean go.mod and go.sum.",
              "Forgetting to test the module from a clean consumer module.",
            ],
          },
        ),
      ],
    },
  ],
};
