import type { Curriculum } from "../types";
import { topic } from "../types";

export const golang: Curriculum = {
  slug: "golang",
  title: "Go Engineering",
  tagline: "Small language. Explicit systems. Serious concurrency.",
  description:
    "A guided path through Go's deliberately small language and the habits that make it dependable in production: values and composition, interfaces, concurrency and cancellation, errors, tests, the standard library, and the tools that ship a service. Every stage ends with code you can run and inspect.",
  level: "intermediate",
  icon: "code",
  estimatedHours: 72,
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
          "Exercise: 1) Add one small dependency and inspect the `go.mod`/`go.sum` diff. 2) Remove it and verify the build is still clean. 3) Explain what `go mod tidy` changed and why a deprecated indirect dependency may still appear.",
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
          "Exercise: 1) Find three nil-related bugs in a small program: a map, a slice and a pointer receiver. 2) Fix one by designing the zero value to be useful. 3) Write a test that constructs the type with `var x T` and proves it works without explicit initialization.",
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
          "Exercise: 1) Refactor a deeply nested function into guard clauses without changing behavior. 2) Add a table test that covers the original branches. 3) Compare the diff and explain which early return made the largest readability difference.",
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
          "Exercise: 1) Model a small domain with structs and JSON tags, including a field with a meaningful zero value. 2) Round-trip it through `encoding/json` and assert the zero-value field survives. 3) Explain which fields should be pointers and what that changes for API clients.",
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
          "Exercise: 1) Build a type that embeds a logger and call its methods. 2) Replace it with a named field and compare the call sites. 3) Decide which form you would keep for a public API and explain the method-set difference in one sentence.",
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
          "Exercise: 1) Fan out five jobs with a `sync.WaitGroup` and collect errors through a buffered channel. 2) Close the channel only after `Wait` returns and verify no send blocks. 3) Add a cancellation path and explain what happens to jobs already running.",
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
          "Exercise: 1) Make a function respect `ctx.Done()` during simulated work. 2) Add a deadline shorter than the work and test the early return. 3) Explain why you must not store `context.Context` in a struct field.",
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
          "Exercise: 1) Build a pool of four workers over a finite queue and collect results. 2) Fill the queue past capacity and observe where backpressure appears. 3) Add a bounded timeout for job submission and measure how many jobs are dropped.",
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
          "Exercise: 1) Write a function with three distinct failure modes and wrap each with context. 2) Test them with `errors.Is` and `errors.As` rather than string matching. 3) Add one sentinel error and explain when a custom type is better than a sentinel.",
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
          "Exercise: 1) Write a table of three cases for a small pure function, with subtests named by case. 2) Add `t.Cleanup` that closes a fake resource and assert it runs for every case. 3) Run `go test -run=... -v` and explain what the verbose output tells you about test isolation.",
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
          "Exercise: 1) Convert three copy-pasted tests into one table with named cases and expected errors. 2) Add `t.Parallel()` only where the case has no shared state and prove the choice with a race-detector run. 3) Report how the failure message changed when one case broke.",
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
          "Exercise: 1) Add two flags to a small CLI, one required and one optional with a default. 2) Validate the combination and print a useful usage message on failure. 3) Test valid and invalid invocations and explain why a non-zero exit matters for scripts.",
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
          "Exercise: 1) Parse an RFC3339 timestamp from two different zones. 2) Normalize to UTC for storage and render it back in the user's zone for display. 3) Write a test around a DST boundary and explain why storing local time would break it.",
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
          "Exercise: 1) Add a request ID to a handler logger with `slog.With`. 2) Log one sensitive field and verify a custom handler redacts it. 3) Write a test that captures the JSON output and assert the level, message and redacted value.",
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
          "Exercise: 1) Introduce a printf format mismatch and a copied mutex in a small program. 2) Run `go vet ./...` and read both diagnostics. 3) Fix them, then add a CI step that runs vet and explain why these bugs survive compilation.",
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
          "Exercise: 1) Build your service for `linux/amd64` from your development machine. 2) Inspect the binary with `file` and `ldd` and explain why it is static or dynamic. 3) Boot it in a minimal container, record one missing runtime dependency, and describe how you would bake it into the release.",
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
          "Exercise: 1) Define the command contract first: two commands, flags, exit codes and help text. 2) Implement it with a dry-run mode that prints but does not mutate. 3) Test a failure path and explain why errors belong on stderr and results on stdout.",
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
          "Exercise: 1) Build a Cobra tree with one persistent flag and one subcommand. 2) Execute the subcommand from a test with args and capture its output. 3) Replace package-level flag variables with a command-local config struct and explain what bug that prevents.",
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
          "Exercise: 1) Build a small Gin JSON API with a POST route that binds and validates a payload. 2) Test the 400 and 200 paths with `httptest`. 3) Replace one `gin.Context` value with a domain request type and explain why that boundary matters for testing.",
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
          "Exercise: 1) Write a parameterized query with pgx and scan the row into a struct. 2) Add a context with a short deadline and test the cancellation path. 3) Inspect the connection pool settings and explain how you would size them for ten concurrent requests.",
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
          "Exercise: 1) Build a small SSE endpoint that sends heartbeats and one event. 2) Connect with a client that disconnects and reconnects, then verify replay or gap handling. 3) Put a buffering proxy in front and record which header or behavior broke streaming.",
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
      slug: "frameworks-and-operations",
      title: "Frameworks, testing and operations",
      description:
        "Choose libraries deliberately, test at the right boundary, and make a Go service operable, secure and shippable.",
      topics: [
        topic(
          "chi",
          "Chi keeps routing explicit and middleware composable, so you keep control of HTTP behavior instead of inheriting a framework's opinions.",
          [
            "Router composition, route groups and middleware chains",
            "Request context, URL params and typed handlers",
            "Testing routes with httptest and middleware ordering",
          ],
          "Exercise: 1) Build a small Chi router with one grouped route and two middleware functions (request ID and logging). 2) Write an httptest that asserts middleware order and a 404 path. 3) Explain one trade-off of a small router versus a full framework and name the signal you would watch for middleware overhead.",
          {
            summary:
              "Chi is a small router for Go HTTP services. It composes handlers and middleware through the standard `http.Handler` interface, which keeps routing explicit and testable without owning the rest of your application.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Letting middleware mutate shared state across requests instead of using request context.",
              "Registering routes after middleware in the wrong order and losing headers on 404 paths.",
              "Assuming the router validates request bodies; Chi only routes, it does not bind payloads.",
            ],
            resources: [
              {
                title: "Chi repository and examples",
                url: "https://github.com/go-chi/chi",
                kind: "repo",
              },
              {
                title: "Chi package documentation",
                url: "https://pkg.go.dev/github.com/go-chi/chi/v5",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "echo",
          "Echo offers batteries-included HTTP handling; the gain is speed of construction, the cost is a framework-specific context you must keep out of domain code.",
          [
            "Echo instance, routes and middleware stack",
            "Binding, validators and centralized error handlers",
            "Testing handlers with the built-in request recorder",
          ],
          "Exercise: 1) Build an Echo service with one POST route that binds and validates a payload. 2) Add a centralized error handler and test both a 422 and a 200 response. 3) Show where you would convert `echo.Context` into a domain request so handlers do not leak the framework inward.",
          {
            summary:
              "Echo is a full-featured HTTP framework with routing, binding, validation and a large middleware set. It reduces boilerplate quickly, but its context type and error model become part of your handler signatures.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Passing `echo.Context` into service and repository layers instead of mapping it to domain types.",
              "Returning raw framework errors with internal details to clients.",
              "Forgetting to set request timeouts because the framework does not apply them for you.",
            ],
            resources: [
              { title: "Echo documentation", url: "https://echo.labstack.com/", kind: "docs" },
              {
                title: "Echo package documentation",
                url: "https://pkg.go.dev/github.com/labstack/echo/v4",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "fiber",
          "Fiber presents a familiar Express-like API on top of fasthttp; it is productive, but it diverges from `net/http` in ways that affect middleware and tooling.",
          [
            "Fiber app, routes and middleware",
            "Differences from `net/http` and adapter layers",
            "Request lifecycle, bodies and error handling",
          ],
          "Exercise: 1) Implement the same JSON endpoint with `net/http` and Fiber. 2) Add one middleware in each and document a behavior that differs between them. 3) Decide which one you would ship for a team that already relies on `net/http` tooling, and justify it with one concrete constraint.",
          {
            summary:
              "Fiber is an Express-inspired framework built on fasthttp. Its API is compact and fast to learn, but fasthttp is not `net/http`, so standard middleware, clients and test helpers may need adapters.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Assuming `http.Handler` middleware drops into Fiber without an adapter.",
              "Reusing `net/http` request-body assumptions when fasthttp reuses buffers.",
              "Choosing the framework for benchmark numbers instead of ecosystem fit.",
            ],
            resources: [
              { title: "Fiber documentation", url: "https://docs.gofiber.io/", kind: "docs" },
              { title: "Fiber repository", url: "https://github.com/gofiber/fiber", kind: "repo" },
            ],
          },
        ),
        topic(
          "sqlc",
          "sqlc turns SQL into typed Go code, so queries stay reviewable while the compiler catches column and argument mismatches before runtime.",
          [
            "Query annotations and generated types",
            "Schema changes and code regeneration",
            "Transactions, nullable columns and custom types",
          ],
          "Exercise: 1) Write a schema and two parameterized queries, then generate code with sqlc. 2) Call both queries from a small program and handle one nullable column. 3) Change a column type, regenerate, and explain which compile errors caught the change and which checks you still need at runtime.",
          {
            summary:
              "sqlc reads your SQL schema and queries and emits type-safe Go code. It keeps SQL visible and reviewable while removing hand-written scanning code, at the cost of a generation step in the build.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Editing generated files instead of changing the queries and regenerating.",
              "Forgetting to regenerate after a schema migration, leaving types out of sync.",
              "Treating generated types as validation of business rules; sqlc checks SQL shape, not meaning.",
            ],
            resources: [
              { title: "sqlc documentation", url: "https://docs.sqlc.dev/", kind: "docs" },
              { title: "sqlc repository", url: "https://github.com/sqlc-dev/sqlc", kind: "repo" },
            ],
          },
        ),
        topic(
          "ent",
          "Ent generates a typed entity graph and query builder; it works best when the schema is explicit and migrations stay under your control.",
          [
            "Schema definitions and code generation",
            "Typed queries, eager loading and predicates",
            "Migrations, transactions and generated hooks",
          ],
          "Exercise: 1) Define two related entities and generate the client. 2) Write one query that loads the relation with a predicate and a transaction that updates both entities. 3) Inspect the generated SQL and decide where you would drop to raw SQL for performance.",
          {
            summary:
              "Ent is a code-generated entity framework for Go. It provides typed queries, relationships and hooks from a schema definition, which improves safety but adds a generation step and an opinionated data model.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Letting automatic migration change production schema without a reviewed plan.",
              "Loading deep relation graphs into memory without measuring query cost.",
              "Fighting the generated model instead of modelling the domain explicitly.",
            ],
            resources: [
              {
                title: "Ent documentation",
                url: "https://entgo.io/docs/getting-started",
                kind: "docs",
              },
              { title: "Ent repository", url: "https://github.com/ent/ent", kind: "repo" },
            ],
          },
        ),
        topic(
          "configuration",
          "Configuration is part of the deployment contract: parse it once at startup, validate it, and keep secrets out of binaries and logs.",
          [
            "Environment variables, flags and config structs",
            "Validation and fail-fast startup",
            "Secret handling and per-environment defaults",
          ],
          "Exercise: 1) Define a typed config struct loaded from flags and environment variables. 2) Add validation that exits with a clear message on a missing required value. 3) Write a test that proves a secret is redacted from logs and explain how you would rotate it without a rebuild.",
          {
            summary:
              "Go services usually take configuration from flags and environment variables. Parsing into a validated struct once at startup makes behavior predictable and keeps configuration errors visible before traffic arrives.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Reading environment variables throughout the request path instead of once at startup.",
              "Logging the whole config struct, including credentials.",
              "Silently defaulting a required value in production.",
            ],
            resources: [
              {
                title: "The Twelve-Factor App: Config",
                url: "https://12factor.net/config",
                kind: "article",
              },
              {
                title: "os package documentation",
                url: "https://pkg.go.dev/os#LookupEnv",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "graceful-shutdown",
          "Shutdown is a protocol with your orchestrator: stop accepting work, drain in-flight requests, then exit before the platform kills the process.",
          [
            "Signal handling and `http.Server.Shutdown`",
            "Draining requests, workers and background jobs",
            "Shutdown deadlines and exit codes",
          ],
          "Exercise: 1) Add signal handling to an HTTP server and call `Shutdown` with a bounded context. 2) Write a test that holds one request open and asserts shutdown waits for it. 3) Describe what happens to a background job when the deadline expires and what you would measure to choose that deadline.",
          {
            summary:
              "Graceful shutdown stops new work, waits for in-flight requests and then exits. `http.Server.Shutdown`, signal handling and a deadline turn a process kill into a controlled handover.",
            difficulty: "advanced",
            minutes: 45,
            pitfalls: [
              "Calling `Close` instead of `Shutdown` and dropping active connections.",
              "Waiting forever for a stuck handler with no deadline.",
              "Forgetting to stop background workers before the process exits.",
            ],
            resources: [
              {
                title: "http.Server.Shutdown documentation",
                url: "https://pkg.go.dev/net/http#Server.Shutdown",
                kind: "docs",
              },
              {
                title: "os/signal documentation",
                url: "https://pkg.go.dev/os/signal",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "health-checks",
          "Health endpoints are for the orchestrator, not for humans: liveness, readiness and startup answer different questions and must not depend on each other.",
          [
            "Liveness, readiness and startup semantics",
            "Dependency checks and failure blast radius",
            "Timeouts, caching and safe response bodies",
          ],
          "Exercise: 1) Add separate `/livez` and `/readyz` handlers with different checks. 2) Make readiness fail when a required dependency is unavailable while liveness stays up. 3) Write a test for each state and explain why checking the database in liveness would make outages worse.",
          {
            summary:
              "Health endpoints tell an orchestrator whether to restart or route traffic to a service. Liveness, readiness and startup have different jobs, and coupling them turns a dependency hiccup into a restart storm.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Checking external dependencies in the liveness probe.",
              "Returning detailed internal errors that leak information to callers.",
              "Letting a health check hang because it has no timeout.",
            ],
            resources: [
              {
                title: "Kubernetes probe documentation",
                url: "https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/",
                kind: "docs",
              },
              { title: "net/http documentation", url: "https://pkg.go.dev/net/http", kind: "docs" },
            ],
          },
        ),
        topic(
          "prometheus-metrics",
          "Metrics answer what changed and when; instrument a small set of signals with stable labels before building dashboards around them.",
          [
            "Counters, gauges and histograms",
            "Label cardinality and naming",
            "Exposing an endpoint and querying it",
          ],
          "Exercise: 1) Instrument an HTTP handler with a request counter and a latency histogram. 2) Expose the metrics endpoint and scrape it once locally. 3) Write a PromQL query for the p95 latency and explain why an unbounded label such as user ID would make the series set explode.",
          {
            summary:
              "Prometheus collects numeric time series by scraping an HTTP endpoint. Counters, gauges and histograms cover most service signals, but stable names and bounded label values determine whether the data stays useful.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Using high-cardinality labels such as request IDs or user IDs.",
              "Counting errors without also counting total requests.",
              "Exposing metrics publicly without considering what they reveal.",
            ],
            resources: [
              {
                title: "Prometheus Go client guide",
                url: "https://prometheus.io/docs/guides/go-application/",
                kind: "docs",
              },
              {
                title: "client_golang documentation",
                url: "https://pkg.go.dev/github.com/prometheus/client_golang/prometheus",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "opentelemetry-tracing",
          "Traces connect one request across services; propagate context and sample deliberately or the trace breaks at the first boundary.",
          [
            "Traces, spans and context propagation",
            "Instrumenting HTTP and database calls",
            "Sampling, exporters and correlation with logs",
          ],
          "Exercise: 1) Instrument an HTTP service with one root span and a child span around a database call. 2) Propagate the trace context through an outgoing HTTP request. 3) Configure head sampling and explain the trade-off between cost and the chance of capturing a rare error.",
          {
            summary:
              "OpenTelemetry provides APIs and SDKs for traces, metrics and logs. For tracing, the important parts are span structure, context propagation and sampling; without them a trace is a collection of unrelated events.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Starting spans without passing context, losing the parent relationship.",
              "Sampling only successful requests and missing the errors you need.",
              "Adding sensitive attributes to spans without a redaction policy.",
            ],
            resources: [
              {
                title: "OpenTelemetry Go documentation",
                url: "https://opentelemetry.io/docs/languages/go/",
                kind: "docs",
              },
              {
                title: "OpenTelemetry Go API",
                url: "https://pkg.go.dev/go.opentelemetry.io/otel",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "fuzzing",
          "Fuzzing explores inputs your table tests never imagined, and Go's coverage-guided engine is built into `go test`.",
          [
            "A `FuzzXxx(*testing.F)` target with seed corpus entries from `f.Add`",
            "Coverage guidance grows the corpus; failures are minimized into `testdata/fuzz`",
            "Targets must be fast, deterministic and free of shared mutable state",
          ],
          "Exercise: 1) Write `FuzzParseConfig` with three seed inputs and a target that calls your parser. 2) Run `go test -fuzz=FuzzParseConfig -fuzztime=30s` and open the failing input written to `testdata/fuzz`. 3) Fix the bug, then confirm a plain `go test` now passes with that input as a permanent regression case.",
          {
            summary:
              "Go's fuzzing engine extends the test binary with coverage-guided random inputs. Seeds come from `f.Add`, failures are minimized to a file you commit, and the generated corpus stays out of source control.",
            difficulty: "advanced",
            minutes: 45,
            pitfalls: [
              "A slow or stateful fuzz target that times out or produces unreproducible failures.",
              "Fuzzing argument types outside the supported set of strings, bytes and numbers.",
              "Committing the cache corpus instead of the minimized `testdata/fuzz` case.",
            ],
            resources: [
              {
                title: "Go fuzzing documentation",
                url: "https://go.dev/doc/security/fuzz/",
                kind: "docs",
              },
              {
                title: "Tutorial: Fuzzing with Go",
                url: "https://go.dev/doc/tutorial/fuzz",
                kind: "docs",
              },
              {
                title: "testing package — fuzzing",
                url: "https://pkg.go.dev/testing#hdr-Fuzzing",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "httptest--for-http-tests",
          "HTTP handlers should be tested as handlers, without binding a port or booting the whole service.",
          [
            "`httptest.ResponseRecorder` captures status, headers and body from a handler",
            "`httptest.Server` stands in for an external dependency in client tests",
            "Tests exercise the real `http.Handler` contract, including middleware chains",
          ],
          "Exercise: 1) Wrap a JSON handler in two middleware and assert status, header and body with `ResponseRecorder`. 2) Stand up an `httptest.Server` that returns a fake upstream response and point your client at its URL. 3) Close the server with `t.Cleanup` and run the package with `-race`.",
          {
            summary:
              "The `net/http/httptest` package gives you a recorder for handler unit tests and a real in-memory server for client tests. Both keep HTTP tests fast and avoid fixed ports.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Starting a real listener on a fixed port in parallel tests.",
              "Forgetting to close an `httptest.Server` and leaking connections.",
              "Testing through a framework context instead of the `http.Handler` contract.",
            ],
            resources: [
              {
                title: "net/http/httptest",
                url: "https://pkg.go.dev/net/http/httptest",
                kind: "docs",
              },
              {
                title: "net/http Handler",
                url: "https://pkg.go.dev/net/http#Handler",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "errgroup",
          "Fan-out that must cancel its siblings on the first failure is a first-class pattern, not a hand-rolled WaitGroup wrapper.",
          [
            "`errgroup.Group` couples a WaitGroup with a first-error channel",
            "`WithContext` derives a context cancelled by the first error or by the caller",
            "`SetLimit` bounds concurrency without a separate semaphore",
          ],
          "Exercise: 1) Fetch three URLs concurrently with errgroup and make one return an error. 2) With `WithContext`, verify the other goroutines observe `ctx.Done()` and stop. 3) Add `SetLimit(2)` and measure peak in-flight requests to confirm the bound.",
          {
            summary:
              "golang.org/x/sync/errgroup runs a group of goroutines, returns the first error and can cancel the rest through a derived context. It replaces the common combination of WaitGroup, error channel and context plumbing.",
            difficulty: "advanced",
            minutes: 40,
            pitfalls: [
              "Returning the last error instead of the first and hiding the real cause.",
              "Forgetting to pass the derived context into I/O calls.",
              "Wrapping an unbounded number of goroutines in a plain Group.",
            ],
            resources: [
              {
                title: "x/sync/errgroup",
                url: "https://pkg.go.dev/golang.org/x/sync/errgroup",
                kind: "docs",
              },
              {
                title: "Go pipelines and cancellation",
                url: "https://go.dev/blog/pipelines",
                kind: "article",
              },
            ],
          },
        ),
        topic(
          "concurrency-patterns",
          "Fan-in, fan-out and pipelines turn ad-hoc goroutines into a design with bounded stages and explicit cancellation.",
          [
            "Fan-out distributes jobs; fan-in merges results without losing errors",
            "Pipelines chain stages with their own ownership and close rule",
            "Cancellation must reach every stage or the slowest one leaks",
          ],
          "Exercise: 1) Build a three-stage pipeline (generate, transform, collect) with two workers in the middle. 2) Cancel through context mid-run and prove every stage exits. 3) Replace your WaitGroup with errgroup and show the first error reaching `main`.",
          {
            summary:
              "Pipelines and fan-out/fan-in are the compositional patterns behind most concurrent Go services. Their correctness depends on who closes each channel and how cancellation reaches every stage.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "An unbounded fan-out that turns a traffic spike into an outage.",
              "A stage that never closes its output, leaving downstream `range` loops blocked.",
              "Cancelling only the first stage while later stages keep buffering.",
            ],
            resources: [
              {
                title: "Pipelines and cancellation",
                url: "https://go.dev/blog/pipelines",
                kind: "article",
              },
              {
                title: "Go concurrency patterns (talk)",
                url: "https://go.dev/talks/2012/concurrency.slide",
                kind: "docs",
              },
              {
                title: "x/sync/errgroup",
                url: "https://pkg.go.dev/golang.org/x/sync/errgroup",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "containers-and-images",
          "The binary is the deliverable; a reproducible, minimal image is how it reaches production unchanged.",
          [
            "Multi-stage builds separate the toolchain from the runtime image",
            "`CGO_ENABLED=0` with a distroless base yields a small static image",
            "Non-root user, read-only filesystem and a healthcheck are part of the contract",
          ],
          "Exercise: 1) Write a two-stage Dockerfile that builds with `CGO_ENABLED=0 go build -trimpath` and copies only the binary. 2) Build the image, run as a non-root user and check that `ldd` reports no dynamic executable. 3) Add a healthcheck hitting `/healthz` and verify a restart when it fails.",
          {
            summary:
              "A Go service ships best as a static binary inside a minimal runtime image. Multi-stage builds keep the compiler out of the final layer, and pinning the base image makes the artifact reproducible.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Shipping the build toolchain and source inside the final image.",
              "A cgo-enabled binary linked against glibc inside a `scratch` image.",
              "Running as root with a writable filesystem and no healthcheck.",
            ],
            resources: [
              {
                title: "Multi-stage builds",
                url: "https://docs.docker.com/build/building/multi-stage/",
                kind: "docs",
              },
              {
                title: "Distroless images",
                url: "https://github.com/GoogleContainerTools/distroless",
                kind: "repo",
              },
              { title: "Official Go image", url: "https://hub.docker.com/_/golang", kind: "docs" },
            ],
          },
        ),
        topic(
          "ci-for-go",
          "A Go CI pipeline should be short and deterministic: one toolchain, a dependency cache and the same checks developers run locally.",
          [
            "`setup-go` reads the version from `go.mod` and caches by `go.sum`",
            "Run `go build ./...`, `go test -race ./...`, `go vet` and optionally govulncheck",
            "Use a matrix only when you truly support multiple versions or platforms",
          ],
          "Exercise: 1) Add a workflow that checks out, sets up Go from `go.mod`, builds and runs `go test -race ./...`. 2) Add a govulncheck job and confirm the cache is reused on the second run. 3) Break a test deliberately and verify the pipeline fails before merge.",
          {
            summary:
              "CI for Go is mostly configuration discipline: derive the toolchain version from the module, cache downloads, and run every package with the race detector. Extra checks belong only when a human owns their output.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "A Go version pinned in YAML that drifts from `go.mod`.",
              "Running only the root package instead of `./...`.",
              "Enabling every linter at once until CI becomes noise nobody reads.",
            ],
            resources: [
              {
                title: "Building and testing Go with Actions",
                url: "https://docs.github.com/en/actions/use-cases-and-examples/building-and-testing/building-and-testing-go",
                kind: "docs",
              },
              {
                title: "actions/setup-go",
                url: "https://github.com/actions/setup-go",
                kind: "repo",
              },
            ],
          },
        ),
        topic(
          "database-migrations",
          "Schema changes are deployments: versioned, reviewable, reversible and applied exactly once.",
          [
            "Numbered up/down migrations with a table tracking applied versions",
            "Expand then contract for zero-downtime changes on large tables",
            "Migrations run as an explicit deploy step, never from application startup",
          ],
          "Exercise: 1) Add `001_create_users.up.sql` and `.down.sql` with goose and apply them locally. 2) Rename a column through expand, backfill and contract across three migrations and test each step. 3) Run the same migration set twice and prove the second run is a no-op.",
          {
            summary:
              "Tools such as goose and golang-migrate apply ordered SQL files and record which versions ran. Safe production changes separate additive expansion from later contraction so old and new code can coexist during a rollout.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Calling AutoMigrate from `main` on every service start.",
              "Editing an already-applied migration instead of adding a new one.",
              "Assuming a down migration exists and works against production data.",
            ],
            resources: [
              { title: "goose", url: "https://github.com/pressly/goose", kind: "repo" },
              {
                title: "golang-migrate",
                url: "https://github.com/golang-migrate/migrate",
                kind: "repo",
              },
            ],
          },
        ),
        topic(
          "openapi-and-codegen",
          "A machine-readable API contract lets servers, clients and docs be generated and checked instead of hand-maintained.",
          [
            "An OpenAPI document as the source of truth for paths, schemas and error responses",
            "Server interfaces and typed clients generated with `oapi-codegen`",
            "Contract tests catch drift between handler behavior and the spec",
          ],
          "Exercise: 1) Write an OpenAPI document for a create-user endpoint including a 400 schema. 2) Generate the server interface and client, implement the interface and serve the spec. 3) Change a required field, regenerate and show the build failure until the handler is updated.",
          {
            summary:
              "Contract-first APIs keep the specification in version control and generate code from it. The value is not the generated boilerplate but the build failure when implementation and contract diverge.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Hand-editing generated handlers so regeneration overwrites business logic.",
              "Letting the spec and implementation drift because nothing validates them.",
              "Modeling every field as optional and losing the contract's value.",
            ],
            resources: [
              {
                title: "OpenAPI Specification 3.1",
                url: "https://spec.openapis.org/oas/v3.1.0",
                kind: "docs",
              },
              {
                title: "oapi-codegen",
                url: "https://github.com/deepmap/oapi-codegen",
                kind: "repo",
              },
            ],
          },
        ),
        topic(
          "api-authentication",
          "Authentication code is security code: use vetted primitives, short-lived tokens and explicit boundaries.",
          [
            "Password hashing with bcrypt, never home-grown or reversible storage",
            "JWT verification checks signature, issuer, audience and expiry, not just decoding",
            "Rotation, revocation and least privilege at the handler boundary",
          ],
          "Exercise: 1) Hash and verify a password with `golang.org/x/crypto/bcrypt` and store only the hash. 2) Issue a short-lived JWT, then write middleware rejecting an expired token and a token with the wrong audience. 3) Add a refresh path that rotates the token and prove an old refresh token is rejected.",
          {
            summary:
              "Most authentication failures in services come from trusting decoded tokens, logging credentials or keeping tokens alive forever. Vetted libraries and explicit claim checks remove the common mistakes.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Accepting a JWT because it decodes, without verifying signature and claims.",
              "Logging tokens or placing them in URLs where access logs capture them.",
              "Long-lived access tokens with no rotation or revocation strategy.",
            ],
            resources: [
              {
                title: "x/crypto/bcrypt",
                url: "https://pkg.go.dev/golang.org/x/crypto/bcrypt",
                kind: "docs",
              },
              { title: "x/oauth2", url: "https://pkg.go.dev/golang.org/x/oauth2", kind: "docs" },
              {
                title: "RFC 7519 — JWT",
                url: "https://datatracker.ietf.org/doc/html/rfc7519",
                kind: "docs",
              },
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
          "Exercise: 1) Run `go build -gcflags=-m` on a small function and mark which values escape. 2) Change one signature so a value stays on the stack and verify the new compiler output. 3) Benchmark both versions and decide whether the change was worth it, naming the measurement you used.",
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
          "Exercise: 1) Run `govulncheck ./...` on a module and record one finding. 2) Trace whether your code reaches the vulnerable function and document the evidence. 3) Decide whether to upgrade, pin or accept the risk, and write the decision in a short note.",
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
          "Exercise: 1) Tag a small module `v1.0.0` and install it from a clean consumer module. 2) Make a backward-compatible change and tag `v1.1.0`. 3) Write a short compatibility policy and explain what would force a `v2` import path.",
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
    {
      slug: "runtime-and-escape-hatches",
      title: "Runtime and escape hatches",
      description:
        "The parts of Go closest to the machine: reflection, unsafe, cgo, build constraints, generated code, race detection, synchronization primitives and memory behavior. Use each one only when the simpler tool is not enough, and know exactly what you give up.",
      topics: [
        topic(
          "reflection",
          "Serializers, ORMs and dependency injection all use reflection; knowing its cost and failure modes keeps it out of hot paths.",
          [
            "reflect.Type versus reflect.Value",
            "Kind, settability and addressability",
            "Dynamic construction and the cost of losing static types",
          ],
          "Write a function that prints the field names and tags of an arbitrary struct, then compare its allocations with a generated implementation using `go test -benchmem`.",
          {
            summary:
              "Reflection inspects and constructs values at runtime through `reflect.Type` and `reflect.Value`. It makes generic serializers and dependency injection possible, but every access crosses a type boundary and loses compile-time guarantees.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Calling Interface() on an unexported field and panicking instead of checking CanInterface.",
              "Using reflection in a request hot path without an allocation and latency benchmark.",
              "Treating Kind and Type as interchangeable when embedded and named types differ.",
            ],
          },
        ),
        topic(
          "unsafe-package",
          "Unsafe is the boundary for zero-copy interop and runtime internals; one invalid pointer conversion is undefined behavior the race detector cannot catch.",
          [
            "unsafe.Pointer conversion rules",
            "uintptr versus unsafe.Pointer across garbage-collection points",
            "Struct layout, alignment and Sizeof/Offsetof",
          ],
          "Measure a struct's size and field offsets, use unsafe to read a field, then replace the unsafe access with a safe accessor and compare readability and cost.",
          {
            summary:
              "Package `unsafe` exposes `Pointer`, `Sizeof`, `Offsetof` and `Alignof`, plus the conversion rules that connect pointers and integers. It is legitimate for interop and layout-sensitive code, but the compiler stops protecting you from lifetime and aliasing mistakes.",
            difficulty: "advanced",
            minutes: 45,
            pitfalls: [
              "Storing a uintptr in a variable that survives a garbage-collection point.",
              "Assuming a struct layout is stable across architectures or Go versions.",
              "Reaching for unsafe to silence a type error that a small wrapper would solve.",
            ],
          },
        ),
        topic(
          "cgo-basics",
          "Most systems integrations eventually meet a C library; knowing the call boundary prevents latency, deployment and cross-compilation surprises.",
          [
            'import "C", the preamble and generated stubs',
            "Passing pointers and the cgo pointer rules",
            "CGO_ENABLED, static builds and cross-compilation",
          ],
          "Wrap one function from a small C library, measure calls per second with and without cgo, then build the same program with CGO_ENABLED=0 and document what breaks.",
          {
            summary:
              "Cgo lets Go call C and C call Go through generated stubs. Each call crosses a foreign-function boundary, complicates static builds and disables straightforward cross-compilation, so it belongs behind a narrow interface.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Passing a Go pointer to C and letting C retain it after the call returns.",
              "Forgetting runtime.KeepAlive when a Go object must outlive the final cgo call.",
              "Assuming a cgo binary cross-compiles as easily as a pure-Go binary.",
            ],
          },
        ),
        topic(
          "build-constraints--tags",
          "A build-tag mistake silently ships the wrong implementation or drops a file from the build.",
          [
            "//go:build expressions and the legacy +build form",
            "GOOS, GOARCH and custom tags",
            "go list, file naming and test-only tags",
          ],
          "Add Linux-only and Windows-only implementations behind build constraints, inspect both file sets with `go list -tags`, and build each target without changing imports.",
          {
            summary:
              "Build constraints select files by operating system, architecture, Go version or custom tags before compilation. They let one module ship platform-specific code and optional integrations without runtime branching.",
            difficulty: "advanced",
            minutes: 40,
            pitfalls: [
              "Keeping only the legacy +build line and breaking on a modern toolchain.",
              "Writing a constraint expression with the wrong boolean grouping.",
              "Assuming tests honor a custom tag without passing the same tag to go test.",
            ],
          },
        ),
        topic(
          "go-generate",
          "Generated code is part of the API surface; if the command is not reproducible, the repository and the binary diverge.",
          [
            "//go:generate directives and go generate ./...",
            "Generated file headers and review policy",
            "Tool dependencies and deterministic output",
          ],
          "Add a generator for mocks or string methods, run it twice, and verify the second run produces an identical file and a clean build.",
          {
            summary:
              "`go generate` runs commands named in source comments; it is a convention for producing code, not part of the build. Generated files must be committed, reviewed and reproducible from the command in the repository.",
            difficulty: "advanced",
            minutes: 40,
            pitfalls: [
              "Wiring generate into go build so every build mutates the tree.",
              "Committing generated output that does not match the current generator input.",
              "Hiding generator tools in go.mod without a pinned, documented version.",
            ],
          },
        ),
        topic(
          "race-detection",
          "Race bugs are silent in production and reproducible under the detector; it is the cheapest way to catch them before users do.",
          [
            "Happens-before and conflicting unsynchronized access",
            "go test -race and the runtime cost",
            "Data race versus race condition",
          ],
          "Reproduce a data race with two goroutines, run `go test -race`, fix it with a mutex or a channel, and confirm the report disappears without adding sleeps.",
          {
            summary:
              "The race detector instruments memory accesses and reports conflicting unsynchronized access at runtime. It only sees paths that execute, so a passing run narrows the search but never proves the absence of a race.",
            difficulty: "advanced",
            minutes: 45,
            pitfalls: [
              "Running the race detector in production and confusing its overhead with the service cost.",
              "Fixing a report with time.Sleep instead of establishing happens-before.",
              "Treating a green test run as proof that a concurrent design is race-free.",
            ],
          },
        ),
        topic(
          "sync-package",
          "Most concurrency bugs are synchronization bugs; knowing what each primitive guarantees is the difference between a lock and a guess.",
          [
            "Mutex, RWMutex and the invariant they protect",
            "Once, WaitGroup and Cond",
            "sync/atomic and lock copying",
          ],
          "Protect a counter with atomic.Int64, then with a mutex, benchmark both under contention, and run go vet to catch a copied lock.",
          {
            summary:
              "Package `sync` provides mutexes, read-write locks, wait groups, once and condition variables, while `sync/atomic` provides lock-free operations on simple values. Each primitive protects a specific invariant, and the wrong one creates contention or hides a race.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Copying a mutex after first use, which silently splits the lock.",
              "Choosing RWMutex for a write-heavy path and paying more coordination than a plain mutex.",
              "Using sync.Map for an ordinary map that would be clearer behind a mutex.",
            ],
          },
        ),
        topic(
          "memory-management",
          "Memory behavior explains latency spikes; tuning without a profile usually makes the service worse.",
          [
            "Stack growth, heap allocation and escape analysis",
            "GOGC, GOMEMLIMIT and the live heap",
            "Allocation rate, pointer density and finalizers",
          ],
          "Benchmark a handler with -benchmem, remove one allocation per request with a buffer or value type, and compare allocs/op and p99 latency.",
          {
            summary:
              "Go manages memory with a concurrent garbage collector, stack growth and escape analysis. Allocation rate, live heap and pointer density determine CPU and pause cost more than total heap size, so tuning starts with a profile.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Returning pointers to large values from a hot path without measuring escape.",
              "Copying a GOGC setting from a blog post instead of reading the allocation profile.",
              "Using finalizers for deterministic cleanup that a defer or explicit Close should own.",
            ],
          },
        ),
      ],
    },
    {
      slug: "ship-a-service",
      title: "Ship a service",
      description:
        "Four integrated exercises turn isolated techniques into one deliverable you can run, test, observe and release.",
      topics: [
        topic(
          "capstone-api",
          "An integrated API is where routing, typed SQL, configuration and logging stop being isolated exercises.",
          [
            "A Chi router with grouped routes, typed config and request-scoped slog fields",
            "sqlc-generated queries called through a small repository boundary",
            "Error translation at the HTTP edge without leaking implementation details",
          ],
          "Exercise: 1) Build a `/v1/items` service with Chi, sqlc queries and config loaded once at startup. 2) Add a request ID with `slog.With` and return a safe error body for a failed query. 3) Write a test that proves a missing required config value fails startup before the listener opens.",
          {
            summary:
              "The first capstone assembles a small service from parts already learned. The goal is not new syntax but a clear boundary between transport, data access and configuration.",
            difficulty: "advanced",
            minutes: 90,
            pitfalls: [
              "Letting framework or generated types spread into the domain layer.",
              "Parsing configuration on each request instead of once at startup.",
              "Returning raw database errors to clients with paths and SQL text.",
            ],
            resources: [
              {
                title: "Chi package documentation",
                url: "https://pkg.go.dev/github.com/go-chi/chi/v5",
                kind: "docs",
              },
              { title: "sqlc documentation", url: "https://docs.sqlc.dev/", kind: "docs" },
            ],
          },
        ),
        topic(
          "capstone-observability",
          "A service is not finished until you can tell whether it is healthy, where time goes and how it stops safely.",
          [
            "Readiness and liveness endpoints with explicit dependency checks",
            "A counter, a latency histogram and a traced request sharing the same IDs",
            "Signal handling and a bounded drain on shutdown",
          ],
          "Exercise: 1) Add `/livez` and `/readyz`, a request counter and a duration histogram. 2) Create a trace span in the handler and confirm the request ID appears in the log line. 3) Send SIGTERM during an in-flight request and verify the response completes before exit.",
          {
            summary:
              "Operability is a feature you build in, not a dashboard you add later. This capstone combines health, metrics, traces and graceful shutdown on the service from the previous exercise.",
            difficulty: "advanced",
            minutes: 90,
            pitfalls: [
              "Checking external dependencies in the liveness probe.",
              "Using unbounded labels that make metrics expensive and useless.",
              "Dropping in-flight requests because shutdown only calls `Close`.",
            ],
            resources: [
              {
                title: "Prometheus Go client guide",
                url: "https://prometheus.io/docs/guides/go-application/",
                kind: "docs",
              },
              {
                title: "http.Server.Shutdown",
                url: "https://pkg.go.dev/net/http#Server.Shutdown",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "capstone-tests",
          "Confidence comes from layers of tests that fail for different reasons, not from one large suite.",
          [
            "Table tests for logic, `httptest` for handlers and `t.Cleanup` for resources",
            "A fuzz target for the parser or input boundary",
            "Race detector and benchmarks on the paths that matter",
          ],
          "Exercise: 1) Add a table test for validation, a handler test with `ResponseRecorder` and one fuzz target for an input parser. 2) Run `go test -race ./...` and fix any data race you find. 3) Benchmark one hot path with `-benchmem` and decide whether its allocation count is acceptable.",
          {
            summary:
              "This capstone layers fast deterministic tests, HTTP-level tests, fuzzing and race detection over the service. Each layer catches a different class of bug and should be runnable locally.",
            difficulty: "advanced",
            minutes: 90,
            pitfalls: [
              "Testing only happy paths and relying on fuzzing to find basic mistakes.",
              "Starting real listeners on fixed ports in parallel tests.",
              "Reading benchmark results from a noisy machine without repeating them.",
            ],
            resources: [
              { title: "Go testing package", url: "https://pkg.go.dev/testing", kind: "docs" },
              {
                title: "Go fuzzing documentation",
                url: "https://go.dev/doc/security/fuzz/",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "capstone-release",
          "The last mile is reproducibility: a small image, a deterministic pipeline and a short runbook.",
          [
            "A multi-stage image with a static non-root binary and a healthcheck",
            "CI running build, race tests, vet and vulnerability checks from `go.mod`",
            "A runbook covering config, secrets, rollback and the first alert to investigate",
          ],
          "Exercise: 1) Build the multi-stage image and run it as a non-root user. 2) Add a CI workflow using the toolchain from `go.mod` and a cached module directory. 3) Write a one-page runbook with three commands: health check, log query and rollback, then deploy a trivial change and follow it.",
          {
            summary:
              "The final capstone treats the deploy as part of the exercise. A reproducible image, a deterministic pipeline and a short runbook are what make the earlier work usable by someone else.",
            difficulty: "advanced",
            minutes: 90,
            pitfalls: [
              "Building the image from a mutable `latest` base tag.",
              "A pipeline that passes locally but skips `./...` or the race detector in CI.",
              "A runbook that assumes the author is always available.",
            ],
            resources: [
              {
                title: "Multi-stage builds",
                url: "https://docs.docker.com/build/building/multi-stage/",
                kind: "docs",
              },
              {
                title: "Building and testing Go with Actions",
                url: "https://docs.github.com/en/actions/use-cases-and-examples/building-and-testing/building-and-testing-go",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
  ],
};
