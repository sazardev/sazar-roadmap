import type { Curriculum } from "../types";
import { topic } from "../types";

export const csharpDotnet: Curriculum = {
  slug: "aspnet-core",
  title: "C# and .NET Engineering",
  tagline: "A type-safe language, a serious runtime, a production web stack.",
  description:
    "A guided path through modern C# and the .NET runtime, then into ASP.NET Core: the type system, LINQ, async and memory, dependency injection, HTTP APIs, persistence, resilience and production hosting. The goal is code that is expressive at the language level and predictable at the operational level.",
  level: "intermediate",
  icon: "braces",
  estimatedHours: 78,
  stages: [
    {
      slug: "csharp-foundations",
      title: "C# foundations",
      description:
        "Set up the SDK, understand the runtime and write your first real C# program. By the end you can explain the difference between the language, the runtime and the frameworks, and build a project from the CLI.",
      topics: [
        topic(
          "c",
          "Without the IL and type-safety model, every later discussion of GC, async state machines or Span reads as framework trivia.",
          [
            "Roslyn syntax and semantic compilation stages",
            "Common Intermediate Language and assembly metadata",
            "Value types, reference types and the managed heap",
            "Target framework monikers and language versions",
          ],
          "Create a `dotnet new console` project, compile it, and open the produced assembly with `ilspycmd -il` to label the IL for a method call, a branch and a boxing conversion.",
          {
            summary:
              "C# is a statically typed language compiled by Roslyn into Common Intermediate Language and metadata, which the .NET runtime loads and executes. The language version is tied to the target framework through the compiler, so a project targeting `net10.0` can use syntax that will not compile on older runtimes. Type safety is enforced at compile time, while the runtime enforces memory safety through the GC and bounds checks.",
            difficulty: "foundation",
            minutes: 45,
            pitfalls: [
              "Assuming the C# version is independent of the target framework; the SDK selects a default and `LangVersion` can lower it.",
              "Assuming a call visible in IL always happens at run time; the JIT can inline or eliminate it, so verify with a profile or benchmark.",
              "Treating an `object` parameter as harmless; each value-type argument boxes, so use a generic or typed overload on hot paths.",
            ],
          },
        ),
        topic(
          "learn-the-basics-of-c",
          "Skipping the syntax pass makes later type-system topics read as exceptions to rules you never learned.",
          [
            "Top-level statements and the generated `Program` class",
            "Implicit typing with `var` versus explicit API types",
            "String immutability and interpolation lowering",
            "Checked arithmetic and `checked` contexts",
          ],
          "Rewrite a top-level-statements console program into an explicit `Program.Main` with a method that takes parameters, then run `dotnet build -warnaserror` and fix every warning.",
          {
            summary:
              "C# program structure is a namespace, a type and an entry point; top-level statements hide that shape but compile into a `Program` class and `Main` method. Expressions and statements are checked at compile time, and string interpolation lowers to `string.Format` or a handler type depending on the target framework.",
            difficulty: "foundation",
            minutes: 50,
            pitfalls: [
              "Using `var` at public boundaries and hiding the contract from callers; spell out the type in signatures.",
              "Assuming string concatenation in a loop is cheap; use `StringBuilder` or a single interpolation.",
              "Forgetting `checked` around arithmetic that must fail; wrap the operation in `checked` so overflow throws instead of wrapping.",
            ],
          },
        ),
        topic(
          "net",
          "Without a runtime model, deployment size, startup time and GC pauses look like framework bugs instead of configuration choices.",
          [
            "CoreCLR, JIT compilation tiers and ReadyToRun images",
            "Base Class Library and runtime-pack versioning",
            "Framework-dependent versus self-contained publishing",
            "Generational GC and the large object heap",
          ],
          "Publish the same console app framework-dependent and self-contained for `linux-x64`, compare artifact size and cold-start time over three runs, and record both numbers.",
          {
            summary:
              "The .NET platform pairs the CoreCLR execution engine with the Base Class Library; the SDK builds applications and the runtime executes them, and the two are versioned separately. Publishing framework-dependent ships IL only, while self-contained publishing includes the runtime and trades artifact size for host independence.",
            difficulty: "foundation",
            minutes: 50,
            pitfalls: [
              "Installing only an SDK on the server; production needs the matching runtime or a self-contained build.",
              "Blaming the GC for latency without checking allocation rate and gen2 collection frequency; measure both before tuning anything.",
              "Mixing runtime and SDK patch levels across build and host and then debugging assembly-load failures; pin both to the same support band.",
            ],
          },
        ),
        topic(
          "net-cli",
          "Hand-edited project files and ad hoc build commands produce builds that differ between a laptop and CI.",
          [
            "SDK-style project files and implicit item globs",
            "Project references versus NuGet package references",
            "Solution filters and the `dotnet build` graph",
            "`global.json` SDK pinning and restore lock files",
          ],
          "Create a solution with a class library and a console app, add the reference, pin the SDK in `global.json`, and run `dotnet build --no-restore` after a restore to show the split.",
          {
            summary:
              "`dotnet` drives restore, build, test, run and publish through MSBuild, with SDK-style project files declaring dependencies instead of listing every source file. The CLI resolves a solution graph and a NuGet graph, so pinning the SDK and committing lock state keeps local and CI builds identical.",
            difficulty: "foundation",
            minutes: 50,
            pitfalls: [
              "Editing `obj/project.assets.json` instead of the project file; restore owns generated state.",
              "Committing `bin` and `obj` and then debugging stale assemblies; ignore both directories and run `dotnet clean` before investigating.",
              "Letting CI float to the latest SDK while developers pin another; commit `global.json` and use it in CI.",
            ],
          },
        ),
        topic(
          "frameworks",
          "Picking a framework by reputation rather than host model produces an app that fights its own process lifetime.",
          [
            "ASP.NET Core request-hosted model",
            "Worker Service and `IHostedService` lifetime",
            ".NET MAUI and desktop UI stacks",
            "EF Core as a library, not an application host",
          ],
          "Scaffold `dotnet new web` and `dotnet new worker`, compare their `Program.cs` files and host lifetimes, and record which one fits a request-driven API versus a queue consumer.",
          {
            summary:
              "The .NET frameworks share a runtime but not a host model: ASP.NET Core owns an HTTP request loop, Worker Services own a long-running process, and MAUI owns a client UI dispatcher. Choosing among them is a decision about process lifetime and concurrency, not about which package is newest.",
            difficulty: "foundation",
            minutes: 40,
            pitfalls: [
              "Hosting background work inside a web app and assuming it survives scale-in; use a Worker Service or a queue.",
              "Adding EF Core to a client app and expecting a server-side `DbContext` lifetime; keep persistence behind an API.",
              "Choosing a UI framework before checking Linux or container support; confirm the deployment target before the prototype.",
            ],
            resources: [
              {
                title: ".NET architectural components",
                url: "https://learn.microsoft.com/dotnet/standard/components",
                kind: "docs",
              },
              {
                title: "Introduction to ASP.NET Core",
                url: "https://learn.microsoft.com/aspnet/core/introduction-to-aspnet-core",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "general-development-skills",
          "Framework knowledge without debugging, source control and HTTP literacy turns every defect into a guess.",
          [
            "Stack-trace reading and exception inner-chain traversal",
            "`git bisect` and a minimal reproduction commit",
            "HTTP status semantics and idempotent retries",
            "Conditional breakpoints and `dotnet test` filters",
          ],
          "Reproduce a failing test from a stack trace, use `git bisect` to find the introducing commit, and write a bug report with the command, expected result and actual output.",
          {
            summary:
              "The durable skills around .NET are evidence gathering: reading a stack trace from the innermost frame outward, reducing a defect to a command that fails, and bisecting history to the commit that changed behavior. These habits decide whether a framework feature is understood or merely copied.",
            difficulty: "foundation",
            minutes: 45,
            pitfalls: [
              "Reading only the top stack frame and missing the `InnerException`; walk the inner chain before changing code.",
              "Fixing a bug without a failing test, so the same regression returns unnoticed; write the test that fails first.",
              "Pasting a workaround from an issue thread without reproducing the failure locally; reproduce it with a command before applying the change.",
            ],
          },
        ),
      ],
    },
    {
      slug: "type-system-and-objects",
      title: "Type system and objects",
      description:
        "Use C#'s type system deliberately: classes, structs, interfaces, records, generics, nullable references and pattern matching. You will model a small domain and choose each construct for a reason.",
      topics: [
        topic(
          "classes-and-structs",
          "Copying a struct and expecting reference semantics, or sharing a class and expecting a snapshot, produces aliasing bugs that tests rarely catch.",
          [
            "Reference identity and heap allocation for classes",
            "Struct copy semantics and `readonly struct`",
            "Default struct values and parameterless constructors",
            "Boxing when a struct crosses an interface or `object` boundary",
          ],
          "Write a class and a struct with the same mutable field, pass each to a method that changes it, print the caller's value, then box the struct through an `object` parameter 100,000 times and report allocated bytes with `GC.GetAllocatedBytesForCurrentThread()`.",
          {
            title: "Classes and structs",
            summary:
              "A class instance lives on the managed heap and variables hold references to it; a struct is copied by value at every assignment and argument pass. The distinction controls aliasing, allocation and equality, and it becomes visible when a method mutates its parameter or a struct is boxed.",
            difficulty: "foundation",
            minutes: 55,
            pitfalls: [
              "Marking a mutable struct `readonly` and then expecting its mutating methods to update the original; remove `readonly` or return the updated copy.",
              "Using a struct as a dictionary key while it contains reference-typed fields; implement `IEquatable<T>` over the field values first.",
              "Letting a struct grow beyond 16 to 24 bytes and copying it through hot call paths; move the bulk into a class or split the value.",
            ],
            resources: [
              {
                title: "Classes",
                url: "https://learn.microsoft.com/dotnet/csharp/fundamentals/types/classes",
                kind: "docs",
              },
              {
                title: "Structure types",
                url: "https://learn.microsoft.com/dotnet/csharp/language-reference/builtin-types/struct",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "interfaces-and-abstractions",
          "An interface that mirrors a class instead of a consumer need makes every change a breaking change and every test a mock.",
          [
            "Interface dispatch through the interface map",
            "Explicit interface implementation and member hiding",
            "Default interface methods and runtime dispatch",
            "Consumer-owned abstractions versus implementation-owned contracts",
          ],
          "Define a one-method interface at the consumer, implement it twice, add an explicit implementation to resolve a member clash, and run the same test against both implementations.",
          {
            title: "Interfaces and abstractions",
            summary:
              "An interface is a contract of callable members that a type implements; calls dispatch through the runtime's interface map rather than a concrete method slot. Abstractions earn their cost when the consumer owns them and there is a second implementation or a test seam, not when they merely mirror a class.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Declaring an interface with eight members for a single caller; split it at the consumer boundary.",
              "Changing an interface member and breaking every implementer, including test doubles; add a default implementation only when the runtime target supports it.",
              "Using an abstract base class for pure behavior when an interface would keep the implementation free of inheritance; prefer the interface unless shared state is the point.",
            ],
            resources: [
              {
                title: "Interfaces",
                url: "https://learn.microsoft.com/dotnet/csharp/fundamentals/types/interfaces",
                kind: "docs",
              },
              {
                title: "Interfaces (C# programming guide)",
                url: "https://learn.microsoft.com/dotnet/csharp/programming-guide/interfaces/",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "records-and-value-equality",
          "Assuming a record compares nested collections by value lets equal-looking DTOs fail dictionary lookups and test assertions.",
          [
            "Synthesized `Equals`, `GetHashCode` and `ToString`",
            "`with` expressions and the copy constructor",
            "`record class` versus `record struct` equality",
            "`IEquatable<T>` and `EqualityComparer<T>.Default`",
          ],
          "Build a positional record with a `string[]` property, show that two instances with equal contents are unequal, then override `Equals` and `GetHashCode` with a sequence comparer and re-run the test.",
          {
            title: "Records and value equality",
            summary:
              "A record synthesizes `Equals`, `GetHashCode`, `ToString` and a copy constructor from its fields, and `with` uses that copy constructor. Field-wise equality still delegates to each field's own equality, so an array or `List<T>` field compares by reference and quietly breaks the value semantics the record promised.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Putting a `List<T>` in a record and expecting structural equality; add an explicit comparer or store a value object.",
              "Using a mutable record property as a dictionary key and then changing it, which corrupts the hash bucket; use an immutable key or a value object.",
              "Confusing `==` on a record with `ReferenceEquals`; use `ReferenceEquals` explicitly when identity is the question.",
            ],
            resources: [
              {
                title: "Record types",
                url: "https://learn.microsoft.com/dotnet/csharp/language-reference/builtin-types/record",
                kind: "docs",
              },
              {
                title: "Equality comparisons",
                url: "https://learn.microsoft.com/dotnet/csharp/programming-guide/statements-expressions-operators/equality-comparisons",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "generics-and-constraints",
          "Without constraints, generic code falls back to `object`, boxes every value type and loses the operations that made the abstraction useful.",
          [
            "Reified generics and per-value-type JIT specialization",
            "Constraint kinds: `class`, `struct`, `notnull`, `unmanaged`, `new()`",
            "Variance in `IEnumerable<out T>` and `Action<in T>`",
            "Static abstract members and generic math",
          ],
          "Write a generic `Max<T>` constrained to `IComparable<T>`, compare it with an `object`-based version, and print `GC.GetAllocatedBytesForCurrentThread()` around 100,000 calls to both.",
          {
            title: "Generics and constraints",
            summary:
              "Generic type arguments are reified: the runtime knows `List<int>` and `List<string>` are different types, and value-type instantiations receive specialized JIT code with no boxing. Constraints describe what the compiler may assume about a type parameter, and each constraint narrows the set of legal instantiations.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Adding `where T : class` by habit and excluding structs that would work without boxing; omit the constraint unless reference semantics are required.",
              "Assuming a constraint changes runtime behavior for existing types; use constraints for compile-time guarantees, not for validation or conversion.",
              "Building a generic repository before a second concrete use exists; start concrete and extract the abstraction after the second use.",
            ],
            resources: [
              {
                title: "Generic types",
                url: "https://learn.microsoft.com/dotnet/csharp/fundamentals/types/generics",
                kind: "docs",
              },
              {
                title: "Constraints on type parameters",
                url: "https://learn.microsoft.com/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "nullable-reference-types",
          "Nullable annotations are erased at run time, so treating them as validation lets a null from JSON, reflection or an older assembly crash deep in a request.",
          [
            "Nullable annotation context and `#nullable enable`",
            "Null-state flow analysis across branches",
            "`[NotNullWhen]`, `[MaybeNullWhen]` and `[MemberNotNull]`",
            "Null-forgiving `!` and runtime guard clauses",
          ],
          "Enable nullable annotations in a project, fix every warning with guards instead of `!`, then pass `null` through reflection to prove the annotation did not add a runtime check.",
          {
            title: "Nullable reference types",
            summary:
              "Nullable reference types are a compile-time annotation and flow-analysis feature: the compiler tracks whether a reference may be null and warns at dereference sites. The annotations are metadata that the runtime does not enforce, so public entry points still need guards against JSON, reflection and callers compiled without the feature.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Using `!` to silence a warning at a public boundary; add a guard or a `[NotNull]` contract instead.",
              "Turning on nullable in a legacy project and fixing warnings by annotating everything as nullable; annotate the real contract and guard only the uncertain edges.",
              "Assuming a non-nullable parameter is validated at run time; add `ArgumentNullException.ThrowIfNull` at the public boundary.",
            ],
            resources: [
              {
                title: "Nullable reference types",
                url: "https://learn.microsoft.com/dotnet/csharp/nullable-references",
                kind: "docs",
              },
              {
                title: "Nullable reference type specification",
                url: "https://learn.microsoft.com/dotnet/csharp/language-reference/builtin-types/nullable-reference-types",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "pattern-matching",
          "A switch expression without an exhaustive default turns a new case into a silent fallback instead of a compile error.",
          [
            "Recursive property and positional patterns",
            "List patterns with slice and length matching",
            "Relational and logical patterns",
            "Exhaustiveness on sealed hierarchies",
          ],
          "Model a result as a sealed record hierarchy, consume it with a switch expression, add a new case, and observe warning CS8509 before adding the missing arm.",
          {
            title: "Pattern matching",
            summary:
              "Pattern matching tests a value's shape and extracts its parts in one expression; switch expressions compile to ordered tests with type and property checks. On a sealed hierarchy the compiler can prove exhaustiveness, so adding a case becomes a build error instead of a runtime fallback.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Adding a catch-all `_` arm early and losing exhaustiveness checking for future cases; omit it until the hierarchy is stable.",
              "Assuming list patterns match any `IEnumerable<T>`; match an array, span or type with `Count` and an indexer instead.",
              "Writing a property pattern that silently fails because the property is nullable; add a null check or match a non-nullable projection.",
            ],
            resources: [
              {
                title: "Pattern matching",
                url: "https://learn.microsoft.com/dotnet/csharp/fundamentals/functional/pattern-matching",
                kind: "docs",
              },
              {
                title: "Patterns",
                url: "https://learn.microsoft.com/dotnet/csharp/language-reference/operators/patterns",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "functional-csharp",
      title: "Functional C# and async",
      description:
        "Write C# that composes: delegates, events, LINQ, iterators, disposal, async/await and span-based code. You will remove a loop-heavy method with a query and make an async path cancellation-safe.",
      topics: [
        topic(
          "delegates-and-events",
          "A static event that is never unsubscribed keeps every subscriber alive and turns a small leak into a growing heap.",
          [
            "Delegate types, invocation lists and multicast dispatch",
            "Delegate variance in `Action<in T>` and `Func<in T, out TResult>`",
            "Event accessors and encapsulation of subscription",
            "Closure capture and object lifetime",
          ],
          "Publish an event from a long-lived object, subscribe a short-lived handler, force a GC and show the handler is still alive through a `WeakReference`, then unsubscribe and show it is collected.",
          {
            title: "Delegates and events",
            summary:
              "A delegate is a typed reference to a method plus a target object, and a multicast delegate holds an invocation list that runs in subscription order. Events wrap a delegate field with add and remove accessors, so the publisher controls subscription but the subscriber must unsubscribe to release its target.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Subscribing a lambda and keeping no reference to it, so the publisher holds the closure forever; store the delegate and unsubscribe, or use a weak event pattern.",
              "Raising an event without a null check; use `EventName?.Invoke(...)` or an empty delegate initializer.",
              "Assuming multicast delegates isolate handlers when one throws; invoke each handler in its own `try/catch` if the rest must run.",
            ],
            resources: [
              {
                title: "Delegates overview",
                url: "https://learn.microsoft.com/dotnet/csharp/delegates-overview",
                kind: "docs",
              },
              {
                title: "Events overview",
                url: "https://learn.microsoft.com/dotnet/csharp/events-overview",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "linq",
          "Deferred execution means a query can run twice, run after its source changes, or run in memory when you expected SQL.",
          [
            "Deferred execution and iterator composition",
            "Streaming versus buffering operators",
            "Expression trees and `IQueryable` provider translation",
            "Multiple enumeration and `ToList` at the boundary",
          ],
          "Build a query with a logging `Select`, enumerate it twice, then force materialization with `ToList` and show the log changes from two executions to one.",
          {
            title: "LINQ",
            summary:
              "LINQ composes sequences with deferred operators: a query is a description that runs when enumerated, not a collection of results. Streaming operators pass elements through one at a time, buffering operators such as `OrderBy` and `GroupBy` must read the whole input, and `IQueryable` adds an expression tree that a provider translates.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Enumerating the same `IEnumerable` in two places and hitting the database twice; materialize once with `ToList` at the boundary.",
              "Calling `Count()` and then iterating to check emptiness; use `Any()` for a short-circuiting test.",
              "Assuming a method returning `IEnumerable<T>` is lazy and cheap; check the implementation and materialize deliberately at the boundary.",
            ],
            resources: [
              {
                title: "Language Integrated Query (LINQ)",
                url: "https://learn.microsoft.com/dotnet/csharp/linq/",
                kind: "docs",
              },
              {
                title: "LINQ in .NET",
                url: "https://learn.microsoft.com/dotnet/standard/linq/",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "async-await",
          "Sync-over-async or a missing ConfigureAwait decision can deadlock a request or exhaust the thread pool under load.",
          [
            "Compiler-generated async state machine and `MoveNext`",
            "`SynchronizationContext` capture and `ConfigureAwait(false)`",
            "`Task` exception aggregation and `await` unwrapping",
            "`ValueTask` single-consumption and pooling rules",
          ],
          "Build an endpoint that calls a delayed dependency synchronously and asynchronously, run 200 concurrent requests, and compare completed requests per second and thread-pool thread count.",
          {
            title: "Async and await",
            summary:
              "`async` and `await` compile into a state machine that suspends at an incomplete awaitable and resumes through a continuation; no thread is blocked while the I/O is outstanding. The continuation returns to the captured `SynchronizationContext` by default, which keeps UI code on the UI thread and is unnecessary in ASP.NET Core.",
            difficulty: "advanced",
            minutes: 70,
            pitfalls: [
              "Blocking on `.Result` or `.Wait()` in a request path; use `await` all the way up instead.",
              "Using `async void` for anything except an event handler; return `Task` and await it so exceptions reach the caller.",
              "Storing a `ValueTask` and awaiting it twice; convert to `Task` or await once.",
            ],
            resources: [
              {
                title: "Asynchronous programming with async and await",
                url: "https://learn.microsoft.com/dotnet/csharp/asynchronous-programming/",
                kind: "docs",
              },
              {
                title: "Task-based asynchronous pattern (TAP)",
                url: "https://learn.microsoft.com/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "iterators-and-yield",
          "An iterator that opens a resource without `finally` leaks it when the caller stops enumerating early.",
          [
            "Iterator state machine and `IEnumerator<T>` lowering",
            "Deferred execution and re-entrant enumeration",
            "`IAsyncEnumerable<T>` and `await foreach`",
            "Iterator disposal and `finally` in `yield` methods",
          ],
          "Write an iterator that opens a file or stream, break out of `foreach` after two items, and log the `finally` block to prove disposal runs; then port it to `IAsyncEnumerable<T>`.",
          {
            title: "Iterators and yield",
            summary:
              "A method containing `yield return` compiles into a state machine that implements `IEnumerable<T>` and `IEnumerator<T>`; each `MoveNext` resumes at the last suspension point. Iteration starts only when the consumer calls `MoveNext`, and disposing the enumerator runs the iterator's `finally` blocks.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Returning an iterator from a `using` block before it is enumerated; move the `using` inside the iterator or materialize before leaving the block.",
              "Capturing mutable state in an iterator and assuming a snapshot; copy the value into a local before yielding.",
              "Forgetting a `CancellationToken` in an `IAsyncEnumerable<T>` producer; accept a token and pass it to every await.",
            ],
            resources: [
              {
                title: "Iterators",
                url: "https://learn.microsoft.com/dotnet/csharp/iterators",
                kind: "docs",
              },
              {
                title: "yield statement",
                url: "https://learn.microsoft.com/dotnet/csharp/language-reference/statements/yield",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "disposal-and-using",
          "Relying on the finalizer for a file handle or connection keeps the resource occupied until a non-deterministic GC, which is too late under load.",
          [
            "`IDisposable` and `IAsyncDisposable` contracts",
            "`using` and `await using` lowering to `try/finally`",
            "Dispose pattern, finalizer and `GC.SuppressFinalize`",
            "Ownership transfer and double-dispose safety",
          ],
          "Implement a wrapper over a `FileStream` with the full dispose pattern, log finalizer and `Dispose` calls, and verify `GC.SuppressFinalize` prevents the finalizer after an explicit dispose.",
          {
            title: "Disposal and using",
            summary:
              "`IDisposable.Dispose` releases unmanaged, pooled or otherwise owned resources at a deterministic point; `using` compiles to `try/finally` so the call runs on every exit path. A finalizer is a fallback for unmanaged handles, and the full pattern suppresses it after a successful dispose to avoid a second cleanup.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Disposing a field you do not own; document ownership and let the creator dispose it.",
              "Throwing from `Dispose` during an exception unwind and masking the original failure; catch cleanup errors and log them, or let the original exception win.",
              "Forgetting `GC.SuppressFinalize(this)` in `Dispose`, so the finalizer runs again on a released handle; suppress it at the end of the method.",
            ],
            resources: [
              {
                title: "using statement",
                url: "https://learn.microsoft.com/dotnet/csharp/language-reference/statements/using",
                kind: "docs",
              },
              {
                title: "Implement a Dispose method",
                url: "https://learn.microsoft.com/dotnet/standard/garbage-collection/implementing-dispose",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "spans-and-memory",
          "A `Span<T>` captured across an `await` is a compile error for a reason: the stack frame it points into no longer exists.",
          [
            "`ref struct` stack-only restrictions",
            "Slicing and parsing without allocation",
            "`stackalloc` limits and process-terminating stack overflow",
            "`Memory<T>` for heap-backed asynchronous buffers",
            "`ArrayPool<T>` rental and return",
          ],
          "Parse a CSV line with `ReadOnlySpan<char>` and `int.Parse`, benchmark it against `Split` and `Substring`, and report allocated bytes per operation with `[MemoryDiagnoser]`.",
          {
            title: "Span and Memory",
            summary:
              "`Span<T>` and `ReadOnlySpan<T>` are `ref struct` views over contiguous memory that can point at the stack, the heap or unmanaged memory without allocating. The compiler forbids storing them on the heap or across an `await`, because the memory they reference is only guaranteed to live for the current stack frame.",
            difficulty: "advanced",
            minutes: 70,
            pitfalls: [
              "Trying to use `Span<T>` in an async method or as a class field; use `Memory<T>` for those lifetimes.",
              "Allocating a large buffer with `stackalloc` and overflowing the thread stack; bound the size or rent from `ArrayPool<T>`.",
              "Returning a span over a pooled array after returning the array to the pool; copy the data or finish using the span before the return.",
            ],
            resources: [
              {
                title: "Memory<T> and Span<T> usage guidelines",
                url: "https://learn.microsoft.com/dotnet/standard/memory-and-spans/memory-t-usage-guidelines",
                kind: "docs",
              },
              {
                title: "Span<T> API reference",
                url: "https://learn.microsoft.com/dotnet/api/system.span-1",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "testing-and-quality",
      title: "Testing and quality",
      description:
        "Build a test suite you can trust and a benchmark you can defend. You will write unit and integration tests, replace a dependency with a fake, validate input and measure a hot path.",
      topics: [
        topic(
          "testing",
          "Tests that depend on the clock, network or ordering fail for reasons unrelated to the change and get deleted instead of fixed.",
          [
            "Unit, integration and end-to-end boundaries",
            "Determinism through injected clocks and fakes",
            "Arrange-act-assert and failure-message quality",
            "`WebApplicationFactory<T>` for in-process HTTP tests",
          ],
          "Add a unit test with a fake clock for an expiry rule and an in-process HTTP test with `WebApplicationFactory<Program>` after exposing `public partial class Program { }`, then run both with `dotnet test`.",
          {
            summary:
              "A test is a controlled experiment around one boundary: unit tests isolate a decision, integration tests prove a real dependency contract, and end-to-end tests prove the wiring. The suite stays useful when time, randomness and I/O are injected, so failures point at the change rather than the environment.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Testing private methods through reflection instead of the public behavior that uses them; assert through the entry point the caller actually invokes.",
              "Sharing one database across parallel tests and deleting rows another test needs; give each test its own schema or transaction.",
              "Asserting on log text or exception messages that are not part of the contract; assert on the typed result, status code or error code.",
            ],
          },
        ),
        topic(
          "xunit",
          "xUnit creates a new test class instance per test, so mutable fields are not shared; code that relies on constructor state across tests fails nondeterministically.",
          [
            "`[Fact]`, `[Theory]` and data attributes",
            "Class fixtures versus collection fixtures",
            "Parallel collections and shared-state hazards",
            "`IAsyncLifetime` and `ITestOutputHelper`",
          ],
          "Convert three copy-pasted cases into a `[Theory]` with `[InlineData]`, add a collection fixture for a shared resource, and set `parallelizeTestCollections` in `xunit.runner.json` to expose a shared-state failure.",
          {
            summary:
              "xUnit instantiates the test class for every test and runs test collections in parallel by default. Fixtures move expensive setup to a controlled lifetime: a class fixture per test class, a collection fixture across classes in the same collection.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Using a static mutable field for shared setup and racing under parallel collections; use a fixture and mark the collection non-parallel.",
              "Doing asynchronous setup in the constructor; xUnit runs it synchronously, so the test starts before setup completes. Implement `IAsyncLifetime` instead.",
              "Using `[InlineData]` for values that cannot be compile-time constants; switch to `[MemberData]`.",
            ],
          },
        ),
        topic(
          "moq",
          "Mocking a concrete class or a sealed type forces a wrapper, and verifying every call turns refactoring into test maintenance.",
          [
            "Dynamic proxy generation and interface mocking",
            "Setup expression trees and argument matchers",
            "Loose versus strict mock behavior",
            "Interaction verification versus state assertions",
          ],
          "Replace one hand-written fake with a `Mock<T>`, set up a return value and a callback, verify one required interaction, then delete an over-specified verification that only restates the implementation.",
          {
            summary:
              "Moq generates a proxy for an interface or virtual member at run time and records calls made through it. Setups define return values or exceptions, and verifications assert interactions; both are useful when the interaction is the behavior, and both become brittle when they encode implementation details.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Mocking a concrete class with non-virtual members; the proxy cannot intercept them, so use an interface.",
              "Using `It.IsAny<T>()` everywhere and never asserting the argument that matters; match the important value with `It.Is<T>` or a predicate.",
              "Making every mock strict, so unrelated calls fail and the test breaks on harmless changes; keep mocks loose and be strict only where the contract requires it.",
            ],
          },
        ),
        topic(
          "fluentvalidation",
          "Validation scattered across controllers and domain methods produces inconsistent error shapes and duplicated rules.",
          [
            "`AbstractValidator<T>` and `RuleFor` chains",
            "Nested, collection and custom validators",
            "Rule severity and cascading modes",
            "ASP.NET Core integration and `ValidationProblemDetails`",
          ],
          "Write an `AbstractValidator<T>` with a required rule, a range rule and a cross-field rule, wire it into an endpoint, and test the 400 response body field by field.",
          {
            summary:
              "FluentValidation builds validators as classes with a fluent rule chain, separate from the model and from the controller. The ASP.NET Core integration runs the validator through a filter or an endpoint filter and converts failures into a `ValidationProblemDetails` response.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Duplicating the same rule in the validator and the domain constructor; keep one owner and make the other a guard.",
              "Using `CascadeMode.Stop` globally and hiding later field errors the client needs; keep the default cascade and stop only per rule.",
              "Returning raw `ValidationResult` objects and losing the problem-details contract; map the failures to `ValidationProblemDetails`.",
            ],
          },
        ),
        topic(
          "benchmarknet",
          "A stopwatch loop includes JIT warmup and dead-code elimination, so the winning implementation often depends on the measurement harness.",
          [
            "Warmup, pilot and iteration phases",
            "Tiered JIT and benchmark stability",
            "`[MemoryDiagnoser]` and allocation measurement",
            "`[Params]`, jobs and baseline comparison",
          ],
          "Benchmark `string.Join` against a `StringBuilder` loop over 1,000 items with `[MemoryDiagnoser]`, run with `dotnet run -c Release`, and report the ratio and allocated bytes per operation.",
          {
            summary:
              "BenchmarkDotNet generates a separate process per benchmark, runs warmup and measured iterations, and reports a distribution with error bars. `[MemoryDiagnoser]` adds allocated bytes and GC counts, which often matter more than elapsed time for server code.",
            difficulty: "advanced",
            minutes: 65,
            pitfalls: [
              "Running in Debug and reporting numbers dominated by unoptimized IL; always use `-c Release`.",
              "Benchmarking a method whose result is unused; consume it through a field or return it from the benchmark method.",
              "Comparing runs from different machines or noisy laptops without a baseline and error bars; benchmark on one host and compare jobs in the same run.",
            ],
          },
        ),
        topic(
          "stylecop-rules",
          "Formatting rules enforced only by review create churn in every pull request and hide the analyzer warnings that catch real defects.",
          [
            "Roslyn analyzers and `DiagnosticSeverity`",
            "`.editorconfig` precedence over rule sets",
            "`stylecop.json` and documentation rules",
            "`TreatWarningsAsErrors` and justified suppressions",
          ],
          "Add `StyleCop.Analyzers`, promote one documentation rule to error in `.editorconfig`, fix the build, and record one justified `SuppressMessage` with a reason.",
          {
            summary:
              "StyleCop.Analyzers ships Roslyn diagnostics for naming, layout and documentation, configured through `.editorconfig` and `stylecop.json`. Severity is a build policy: a rule set to warning is advice, and the same rule set to error blocks a merge.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Setting every rule to error on an existing codebase; introduce rules in small batches so the diff stays reviewable.",
              "Suppressing a rule file-wide instead of at the one justified call site; suppress at the narrowest scope and record the reason.",
              "Letting `.editorconfig` and a legacy ruleset disagree; delete the ruleset and keep one source of severity.",
            ],
          },
        ),
      ],
    },
    {
      slug: "dependency-injection",
      title: "Dependency injection and hosting",
      description:
        "Wire an application without hiding its dependencies. You will register services, choose lifetimes, avoid captive dependencies and explain what the built-in container does and does not do.",
      topics: [
        topic(
          "dependency-injection",
          "A class that constructs its own dependencies cannot be tested without the real database, clock or HTTP client.",
          [
            "Inversion of control and the composition root",
            "Constructor injection and explicit dependencies",
            "Service locator as an anti-pattern",
            "Registration versus resolution",
          ],
          "Refactor a class that calls `new SqlConnection()` into constructor injection, move the construction into `Program.cs`, and add a test that passes an in-memory fake.",
          {
            summary:
              "Dependency injection moves object construction to a composition root and passes dependencies through constructors, so a class declares what it needs instead of discovering it. The container resolves the graph at run time; the compiler no longer proves that the graph is complete, which is why startup validation matters.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Resolving services from `IServiceProvider` inside business code; pass the dependency through the constructor.",
              "Injecting a container into a class and calling `GetService` for everything, which hides the real dependency set; inject the services the class actually uses.",
              "Registering a dependency but forgetting to validate the graph, so the failure appears on the first request; call `ValidateOnBuild` at startup.",
            ],
          },
        ),
        topic(
          "microsoftextensions",
          "The built-in container resolves the last registration for a single service and all registrations for `IEnumerable<T>`, and guessing which one you get causes subtle bugs.",
          [
            "`IServiceCollection` descriptors and factory registrations",
            "Open generic registration and `ActivatorUtilities`",
            "Keyed services and `IEnumerable<T>` resolution",
            "`ValidateOnBuild` and `ValidateScopes`",
          ],
          "Register three `IHandler` implementations, resolve `IEnumerable<IHandler>` and a single `IHandler`, print which instances run, then enable `ValidateOnBuild` and provoke a missing registration.",
          {
            summary:
              "`Microsoft.Extensions.DependencyInjection` stores `ServiceDescriptor` entries and builds an `IServiceProvider` from them. A single resolution returns the last matching registration, while `IEnumerable<T>` returns all of them in registration order, and open generics are closed at resolution time.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Registering the same service twice and expecting the first registration to win; the last one does.",
              "Using `ActivatorUtilities.CreateInstance` to build disposable objects and never disposing them; the container does not track instances it did not create.",
              "Building a second `ServiceProvider` in a library instead of accepting the host's collection; take `IServiceCollection` and return it.",
            ],
          },
        ),
        topic(
          "life-cycles",
          "A singleton that captures a scoped service keeps one request's DbContext alive for the process lifetime and serializes every later request behind it.",
          [
            "Root container versus request scope",
            "Captive dependency and scope validation",
            "Disposal ownership per lifetime",
            "`IServiceScopeFactory` in background work",
          ],
          "Log constructor and dispose IDs for singleton, scoped and transient services across three requests, then inject a scoped service into a singleton, enable `ValidateScopes`, and capture the `InvalidOperationException` thrown when the singleton is resolved.",
          {
            summary:
              "A lifetime decides how often the container creates an instance and which scope disposes it: singleton for the root, scoped for the request or an explicit scope, transient per resolution. The container tracks disposable instances it creates, but only within the scope that owns them.",
            difficulty: "core",
            minutes: 65,
            pitfalls: [
              "Injecting a scoped service into a singleton; enable `ValidateScopes` and resolve the singleton at startup so the invalid graph fails before it serves traffic.",
              "Assuming transient services are never disposed; dispose the owning scope or avoid disposable transients in hot paths.",
              "Creating a scope and never disposing it, so its tracked disposables are not released until GC; wrap it in `using` or `await using`.",
            ],
          },
        ),
        topic(
          "singleton",
          "A singleton is shared by every request, so any mutable field needs synchronization and any request data stored there leaks across users.",
          [
            "Root-scope instance creation and thread safety",
            "Lazy initialization and publication safety",
            "Singleton versus static state",
            "Cache ownership and bounded growth",
          ],
          "Implement a singleton cache over `ConcurrentDictionary<string, string>` with a size bound, hit it from 100 parallel requests, and verify one instance and no lost updates.",
          {
            summary:
              "A singleton service is created once per root container and shared by every resolution, including all requests and the background services resolved by the host. It must be thread-safe, must not hold request-scoped state, and must bound anything it caches, because its lifetime is the process lifetime.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Caching per-user data in a singleton and serving it to another user; key by identity or use a scoped service.",
              "Using a plain `Dictionary` under concurrent requests and corrupting it; use `ConcurrentDictionary` or a lock.",
              "Storing a mutable `List<T>` in a singleton and assuming registration makes it thread-safe; synchronize access or publish an immutable snapshot.",
            ],
          },
        ),
        topic(
          "scoped",
          "Creating a scope per background iteration is required for scoped services, and forgetting it either throws or reuses one DbContext forever.",
          [
            "Request scope and `HttpContext.RequestServices`",
            "`IServiceScopeFactory.CreateScope` in workers",
            "`DbContext` scoped lifetime and change tracking",
            "Scope disposal and nested scopes",
          ],
          "Resolve a scoped service twice inside one request and once in a second request, print the instance hashes, then create an explicit scope in a `BackgroundService` and repeat the check.",
          {
            summary:
              "A scoped service has one instance per scope, which ASP.NET Core creates per HTTP request and disposes when the response completes. Background workers have no request scope, so they must create one explicitly for each unit of work or the container throws.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Resolving a scoped service from the root provider in a worker; inject `IServiceScopeFactory` and create a scope.",
              "Keeping a `DbContext` alive across multiple units of work, so the change tracker grows and stale entities return; create a scope per unit of work.",
              "Starting a fire-and-forget task that captures a request-scoped service after the response has disposed it; await the work or create a new scope.",
            ],
          },
        ),
        topic(
          "transient",
          "Transient looks harmless until a hot path allocates one per resolved dependency and the GC spends its time collecting short-lived objects.",
          [
            "Per-resolution instance creation",
            "Disposable transient tracking in the owning scope",
            "Statelessness and cheap construction",
            "Pooling and factory registration trade-offs",
          ],
          "Register a disposable transient, resolve it 1,000 times in one scope, log the dispose count and allocated bytes, then compare with a pooled or scoped registration.",
          {
            summary:
              "A transient registration creates a new instance for every resolution, including each dependency in the graph, and the owning scope tracks every disposable instance it creates. It fits small stateless services; it is a poor fit for expensive construction or high-frequency resolution.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Injecting a transient disposable into a singleton; make it singleton or scoped, or give the singleton an explicit shutdown path.",
              "Using transient for a service that holds a connection pool or cache and recreating it on every call; register the owner as a singleton.",
              "Assuming transient means no disposal; the container still disposes instances at the end of the owning scope, so dispose the scope or avoid disposable transients.",
            ],
          },
        ),
      ],
    },
    {
      slug: "aspnet-core",
      title: "ASP.NET Core",
      description:
        "Build an HTTP application with the framework's real pipeline. You will implement a minimal API and an MVC endpoint, add middleware and filters, and design a contract that returns consistent errors.",
      topics: [
        topic(
          "aspnet-core-basics",
          "Without the host and middleware model, configuration, logging and request behavior look like separate features instead of one pipeline.",
          [
            "`WebApplicationBuilder` and the generic host",
            "Kestrel and HTTP/1.1 versus HTTP/2 endpoints",
            "Middleware pipeline construction order",
            "`launchSettings.json` and environment variables",
          ],
          "Scaffold `dotnet new web`, add one endpoint and one terminal middleware, run under `Development` and `Production`, and compare the startup log and response behavior.",
          {
            summary:
              "An ASP.NET Core app is a generic host that builds configuration, logging and dependency injection, then starts Kestrel with a request pipeline. `WebApplicationBuilder` wires the defaults; the middleware added to `WebApplication` runs in the order it is registered.",
            difficulty: "foundation",
            minutes: 50,
            pitfalls: [
              "Assuming `ASPNETCORE_ENVIRONMENT` is set in production; set it explicitly and fail fast on an unknown value.",
              "Assuming `MapGet` runs the handler during startup; it only registers an endpoint, so put startup work in `Program.cs` and request work in the delegate.",
              "Enabling the developer exception page outside Development and leaking stack traces; guard it with `if (app.Environment.IsDevelopment())`.",
            ],
          },
        ),
        topic(
          "minimal-apis",
          "Minimal APIs bind from route, query, header and body by convention; a parameter type that looks like a service can be bound from the body instead.",
          [
            "Endpoint routing and `MapGet`/`MapPost`",
            "Parameter binding sources and `[AsParameters]`",
            "`Results<T1, T2>` and `TypedResults`",
            "Endpoint filters and OpenAPI metadata",
          ],
          "Build three endpoints that bind from route, query and JSON body, return `TypedResults` with distinct status codes, and verify each with a `WebApplicationFactory` test.",
          {
            summary:
              "Minimal APIs map a delegate to a route and let the framework bind parameters from the route, query string, headers, body or DI by type and attribute. They remove controller activation overhead and file ceremony, while keeping filters, OpenAPI metadata and typed results.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Assuming a complex parameter is a service when it is bound from the JSON body; annotate `[FromServices]` or restructure the signature.",
              "Returning anonymous objects and losing the response contract; return `TypedResults` so the compiler checks status and payload.",
              "Validating in a helper that some endpoints forget to call; use an endpoint filter or a shared route group.",
            ],
          },
        ),
        topic(
          "mvc",
          "MVC adds model binding, filters and content negotiation that minimal APIs do not give by default; without knowing the pipeline, attributes look like magic.",
          [
            "Controller activation and `ControllerBase`",
            "Model binding, validation and `ModelState`",
            "Action results and content negotiation",
            "`[ApiController]` conventions and problem details",
          ],
          "Reimplement one minimal API endpoint as a controller, compare the OpenAPI document and the 400 response shape, and write down which behavior changed.",
          {
            summary:
              "MVC maps a route to a controller action, binds arguments through model binders, validates `ModelState`, runs filters and executes an `IActionResult`. The controller is instantiated per request by the activator, with constructor dependencies resolved from the request scope.",
            difficulty: "core",
            minutes: 65,
            pitfalls: [
              "Returning `null` from an action and getting a 204 instead of a 404; use `NotFound()` explicitly.",
              "Relying on `[ApiController]` automatic 400 responses while a custom filter replaces the problem-details body; keep one error-shaping path.",
              "Putting business logic in the controller and making the action untestable without the MVC pipeline; move it into a service the controller calls.",
            ],
          },
        ),
        topic(
          "middlewares",
          "Middleware order is the security boundary: authentication before authorization, exception handling outside everything, and routing before endpoint execution.",
          [
            "`RequestDelegate` composition and `Use`/`Run`/`Map`",
            "Pipeline order and short-circuiting",
            "`UseExceptionHandler` and `UseDeveloperExceptionPage`",
            "`HttpContext.Items` and per-request state",
          ],
          "Add three middlewares that log a request ID on the way in and out, move `UseAuthorization` before `UseAuthentication` to reproduce a 401, then restore the documented order and paste both log timelines.",
          {
            summary:
              "Middleware are `RequestDelegate` components composed into a nested pipeline; each can act before and after calling the next delegate, or short-circuit by not calling it. Registration order is execution order, so exception handling, HTTPS redirection, routing, authentication and authorization must appear in a deliberate sequence.",
            difficulty: "core",
            minutes: 65,
            pitfalls: [
              "Registering `UseAuthorization` before `UseAuthentication`, so `HttpContext.User` is anonymous; call `UseAuthentication` first.",
              "Calling `next()` after starting the response body, which throws or corrupts the response; decide whether to short-circuit before writing.",
              "Adding terminal middleware with `Run` before the endpoint mapping and wondering why no endpoint runs; register `Run` last.",
            ],
          },
        ),
        topic(
          "filters-and-attributes",
          "Filters run inside the MVC action pipeline and middleware runs outside it; using the wrong one puts the logic at the wrong stage with the wrong state.",
          [
            "Authorization, resource, action, exception and result filters",
            "Filter ordering and `IOrderedFilter`",
            "`IFilterFactory` and DI-constructed filters",
            "Attribute metadata and reflection",
          ],
          "Implement an action filter attribute that logs before and after an action, apply it to two controllers with different orders, and compare the output with a middleware log for the same request.",
          {
            summary:
              "Filters are MVC components that run at defined stages around an action: authorization, resource, action, exception and result. Attributes attach filter metadata to controllers and actions, and the filter runner instantiates or resolves them in a fixed order.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Doing response post-processing in an action filter and missing exceptions; use a result filter or exception filter for that stage.",
              "Constructing a filter with `new` inside an attribute, so it cannot receive scoped dependencies; implement `IFilterFactory` or use `ServiceFilter`.",
              "Assuming filter order is source order; set `Order` explicitly and verify it with `IOrderedFilter`.",
            ],
            resources: [
              {
                title: "Filters in ASP.NET Core",
                url: "https://learn.microsoft.com/aspnet/core/mvc/controllers/filters",
                kind: "docs",
              },
              {
                title: "Attributes",
                url: "https://learn.microsoft.com/dotnet/csharp/advanced-topics/reflection-and-attributes/",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "rest",
          "RPC-shaped URLs and 200 responses for every outcome make caching, retries and client error handling guesswork.",
          [
            "Resource modeling and URI design",
            "Safe methods, idempotency and `Idempotency-Key`",
            "Conditional requests with `ETag` and `If-None-Match`",
            "Problem details and status code semantics",
          ],
          "Redesign two RPC endpoints as resources, add `ETag` and `If-None-Match` returning 304, and test create, update and conflict paths with `curl -i`.",
          {
            summary:
              "REST models a service as resources addressed by URIs and manipulated through the semantics of HTTP methods. GET is safe, PUT and DELETE are idempotent, POST is neither, and status codes plus cache headers carry the outcome to intermediaries.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Returning 200 with a body that says `success: false` and forcing every client to parse a second status channel; use the HTTP status code.",
              "Using POST for an idempotent update and retrying on timeout, which duplicates the write; use PUT or an idempotency key.",
              "Ignoring `If-Match` on updates, so two clients overwrite each other's changes; require the header and return 412 on a mismatch.",
            ],
          },
        ),
      ],
    },
    {
      slug: "data-and-persistence",
      title: "Data and persistence",
      description:
        "Persist a domain without letting the ORM own it. You will model with EF Core, write a migration, compare a Dapper query, control loading and add a cache with an invalidation rule.",
      topics: [
        topic(
          "entity-framework-core",
          "Treating `DbContext` as a long-lived service or ignoring the change tracker produces stale reads, unbounded memory and accidental writes.",
          [
            "`DbContext` scope and unit of work",
            "Change tracker states and `SaveChanges`",
            "LINQ translation and generated SQL",
            "Identity map and `AsNoTracking`",
          ],
          "Model two related entities, query with a projection, log the generated SQL with `LogTo`, and compare allocated entities and query time with and without `AsNoTracking`.",
          {
            summary:
              "EF Core maps LINQ queries to SQL, materializes entities into a `DbContext` that tracks their state, and writes changes on `SaveChanges`. The context is a unit of work, not a connection wrapper, and its identity map returns the same instance for a key within one scope.",
            difficulty: "core",
            minutes: 70,
            pitfalls: [
              "Keeping a `DbContext` alive for the process and accumulating tracked entities; create one per scope or unit of work.",
              "Using `AsNoTracking` for entities you intend to update, then wondering why `SaveChanges` writes nothing; track them or call `Update` explicitly.",
              "Calling `ToList()` before a `Where` and filtering in memory, so the database returns the whole table; compose the `Where` before materializing.",
            ],
          },
        ),
        topic(
          "code-first--migrations",
          "A migration that drops or renames a column in one step breaks the running version during a rolling deploy.",
          [
            "Model snapshot and migration operations",
            "`dotnet ef migrations add` and idempotent scripts",
            "Expand and contract schema changes",
            "Migration bundles and production rollout",
          ],
          "Add a required column with a default, generate the SQL with `dotnet ef migrations script --idempotent`, apply it to a copy, then write the expand-and-contract plan for a rename.",
          {
            summary:
              "Code-first migrations diff the current model against a snapshot and emit ordered schema operations. `dotnet ef migrations script --idempotent` produces SQL that can run repeatedly, and production changes need an expand phase that keeps the old and new code working at the same time.",
            difficulty: "core",
            minutes: 65,
            pitfalls: [
              "Editing a migration after it has been applied; add a new migration instead so environments stay consistent.",
              "Running `Database.Migrate()` at startup in every replica, so concurrent instances race on the same DDL; run migrations as a separate deployment step.",
              "Renaming a column in one migration while old app instances still read the old name; split into expand, migrate data, contract.",
            ],
          },
        ),
        topic(
          "dapper",
          "Dapper returns exactly what the SQL selects, so a query written for one row becomes an N+1 loop and an unparameterized predicate scans the table.",
          [
            "Parameterized SQL and `DynamicParameters`",
            "`Query`, `QueryMultiple` and multi-mapping",
            "Buffered versus unbuffered reads",
            "Connection and transaction ownership",
          ],
          "Rewrite one EF Core read query in Dapper, log both SQL statements, benchmark them on the same dataset, and add a multi-map for a parent with children.",
          {
            summary:
              "Dapper is a micro-ORM that maps `IDbConnection` query results to objects with almost no abstraction over ADO.NET. SQL stays explicit, parameters stay bound, and the cost is manual mapping, manual connection lifetime and no change tracking.",
            difficulty: "core",
            minutes: 65,
            pitfalls: [
              "Concatenating user input into SQL instead of using parameters, which creates an injection path; bind each value as a parameter.",
              "Leaving `buffered: false` on a query and enumerating after the connection closes; buffer the result or keep the connection open.",
              "Opening a connection per row inside a loop; open one connection and reuse it for the unit of work.",
            ],
          },
        ),
        topic(
          "object-relational-mapping",
          "An ORM cannot hide the relational model; without aggregate boundaries, every object graph becomes a query plan and a transaction you did not design.",
          [
            "Object-relational impedance mismatch",
            "Aggregate boundaries and unit of work",
            "Persistence ignorance and mapping cost",
            "Selection criteria across ORM, micro-ORM and SQL",
          ],
          "Write a one-page decision record comparing EF Core, Dapper and raw ADO.NET for one read-heavy query, naming the rejected option and the measured reason.",
          {
            summary:
              "An ORM maps objects to tables and tables back to objects, but the two models disagree about identity, inheritance, relationships and transaction scope. The mapping is valuable for aggregate-shaped writes and costly for set-based reads, which is why mixed persistence strategies are normal.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Modeling the database schema as an object graph and then fighting lazy loading and N+1 queries; model aggregates and project read shapes.",
              "Using an ORM for bulk set operations that SQL expresses in one statement; drop to SQL for set-based writes.",
              "Letting persistence attributes or `DbContext` types leak into domain logic; keep mappings in the persistence layer.",
            ],
          },
        ),
        topic(
          "lazy-eager-explicit-loading",
          "Lazy loading turns one query into one query per row, and eager loading several collections in one query multiplies rows into a cartesian product.",
          [
            "Eager loading with `Include` and `ThenInclude`",
            "Projection as the cheapest loading strategy",
            "Explicit `Load()` and lazy-loading proxies",
            "`AsSplitQuery` and cartesian explosion",
          ],
          "Load ten orders with their lines using lazy loading, eager `Include` and projection, count the SQL statements and rows for each, then switch the eager query to `AsSplitQuery` and compare.",
          {
            summary:
              "Loading strategy decides when related rows travel from the database: eager loads them with the parent query, lazy loads them on first access, explicit loads them on demand through the context, and projection selects only the columns the caller needs. Each choice changes the number of round trips and the size of the result set.",
            difficulty: "advanced",
            minutes: 65,
            pitfalls: [
              "Enabling lazy loading in a web request and serializing an entity graph, which triggers a query per relationship; disable it and project DTOs.",
              "Including two collections in one query without `AsSplitQuery`, multiplying rows; add `AsSplitQuery` or project the shape.",
              "Using eager loading for a list endpoint that needs three columns; project instead.",
            ],
          },
        ),
        topic(
          "caching",
          "A cache without an invalidation rule serves stale data after every write, and a cache without a size bound becomes the memory leak.",
          [
            "Cache-aside and read-through patterns",
            "TTL, absolute expiration and sliding expiration",
            "`IMemoryCache` size limits and eviction",
            "`IDistributedCache` consistency and stampede protection",
          ],
          "Add `IMemoryCache` to a read endpoint, measure p95 latency before and after, invalidate the key on write, and test the stale window with a concurrent update.",
          {
            summary:
              "A cache stores a copy closer to the reader than the source of truth, trading latency for staleness. `IMemoryCache` is process-local and fast; `IDistributedCache` shares entries across instances but adds serialization and network cost, and every entry needs an invalidation rule.",
            difficulty: "core",
            minutes: 65,
            pitfalls: [
              "Caching a negative lookup without a separate short TTL, so a later write stays invisible; give negative entries a short, separate TTL.",
              "Using `IMemoryCache` without a size limit and letting request-shaped keys grow unbounded; set `SizeLimit` and a size per entry.",
              "Invalidating the cache before the database commit succeeds, which repopulates the cache with the old value; invalidate after a successful commit.",
            ],
          },
        ),
      ],
    },
    {
      slug: "production-dotnet",
      title: "Production .NET",
      description:
        "Make the service operable: configuration, structured logs, background work, retries, health checks and traces. You will run the app under failure and prove that each control changes the outcome.",
      topics: [
        topic(
          "app-settings-and-configs",
          "Configuration precedence is last-provider-wins, so a stray environment variable or user secret can silently override the file you edited.",
          [
            "Configuration provider order and key normalization",
            "`IOptions<T>`, `IOptionsSnapshot<T>` and `IOptionsMonitor<T>`",
            "Options validation with `ValidateDataAnnotations` and `ValidateOnStart`",
            "User secrets and environment variable prefixes",
          ],
          "Define an options class with a range validation, set the value in `appsettings.json` and an environment variable, prove which wins, and make the app fail at startup on an invalid value.",
          {
            summary:
              "Configuration reads key-value pairs from providers added in order, and the last provider to supply a key wins; environment variables and command-line arguments therefore override JSON files. `IOptions<T>` binds once and never reloads, `IOptionsSnapshot<T>` re-binds per scope and `IOptionsMonitor<T>` reacts to reloads.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Reading `IConfiguration` directly throughout the code and losing validation and typing; bind an options class.",
              "Assuming `IOptions<T>` sees a reloaded file; use `IOptionsMonitor<T>` for change notifications.",
              "Committing secrets to `appsettings.json`; use user secrets locally and a managed secret store in production.",
            ],
          },
        ),
        topic(
          "serilog",
          "Formatted log strings cannot be queried by field, so an incident becomes a text search instead of a filter on `RequestId` and `StatusCode`.",
          [
            "Structured event properties and message templates",
            "Sinks, batching and backpressure",
            "Enrichers and request correlation",
            "`UseSerilogRequestLogging` and level overrides",
          ],
          "Configure Serilog with the JSON console sink and a correlation enricher, send one request, and show the `RequestId`, `StatusCode` and elapsed fields as separate JSON properties.",
          {
            summary:
              "Serilog records events with named properties instead of a finished string, and a sink decides where those events go. Message templates preserve property names, so the same event can be rendered as text in development and queried as JSON in production.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Interpolating values into the template string, which destroys the structured properties; pass them as arguments.",
              "Logging request bodies or tokens at Information level and leaking credentials; redact at the enricher or destructuring policy.",
              "Using a synchronous file sink in a high-throughput service; buffer or ship to a collector.",
            ],
          },
        ),
        topic(
          "native-background-service",
          "A background loop that ignores `stoppingToken` is killed mid-work on deploy, and an unhandled exception stops the host.",
          [
            "`BackgroundService` and `IHostedService` start/stop",
            "`ExecuteAsync` cancellation and graceful drain",
            "Scope creation per work item",
            "`BackgroundServiceExceptionBehavior` and `Channel<T>` queues",
          ],
          "Build a `BackgroundService` that drains a bounded `Channel<T>`, send `SIGTERM` during processing, and paste the log showing the current item completed and the loop exited cleanly.",
          {
            summary:
              "A hosted service starts with the host and receives a `CancellationToken` that fires on shutdown. `BackgroundService` runs `ExecuteAsync` once; the host waits for it to return during graceful shutdown, so the loop must observe cancellation and finish or abandon its current item deliberately.",
            difficulty: "advanced",
            minutes: 70,
            pitfalls: [
              "Ignoring the stopping token and blocking shutdown until the orchestrator sends `SIGKILL`; pass the token to every await and check it in loops.",
              "Resolving scoped services from the root provider inside the loop; create a scope per iteration.",
              "Letting an exception escape `ExecuteAsync` with the default behavior, which stops the entire host; catch and log inside the loop or set a deliberate exception behavior.",
            ],
          },
        ),
        topic(
          "polly",
          "A retry without jitter and a bound turns one dependency outage into a synchronized thundering herd against a recovering service.",
          [
            "Retry with exponential backoff and jitter",
            "Circuit breaker states and sampling window",
            "Timeout strategies and cancellation",
            "`AddResilienceHandler` and `HttpClient` pipelines",
          ],
          "Point an `HttpClient` at a stub that fails the first two calls and then succeeds, add retry and a circuit breaker, and log attempt count and breaker state transitions.",
          {
            summary:
              "Polly v8 composes resilience strategies into a pipeline around a delegate: retry repeats transient failures, a circuit breaker stops calls after a failure threshold, and a timeout bounds the call. The strategies are ordered, and the order decides whether a timeout counts as one failure or retries the whole budget.",
            difficulty: "advanced",
            minutes: 70,
            pitfalls: [
              "Retrying non-idempotent POSTs on timeout and duplicating the write; retry only safe operations or use an idempotency key.",
              "Setting retry count and timeout so the total exceeds the caller's deadline; budget the whole pipeline.",
              "Treating circuit-breaker `Open` as permanent; it transitions to `HalfOpen` after the break duration, and the caller still needs a fallback.",
            ],
          },
        ),
        topic(
          "health-checks",
          "A liveness probe that checks the database restarts every healthy pod during a database outage.",
          [
            "Liveness versus readiness semantics",
            "`AddHealthChecks` and tagged checks",
            "`MapHealthChecks` predicates and response writers",
            "Dependency timeouts and degraded status",
          ],
          "Add tagged liveness and readiness checks, stop the database, and show `/health/live` returning 200 while `/health/ready` returns 503 and the orchestrator stops routing traffic.",
          {
            title: "Health checks and probes",
            summary:
              "A health check reports whether the process should receive traffic or be restarted. Liveness answers whether the process is alive, readiness answers whether it can serve dependencies, and mixing them makes an orchestrator restart healthy instances during a downstream outage.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Putting a database check in liveness, which turns a dependency outage into a restart loop; keep liveness process-only and move the check to readiness.",
              "Running a slow dependency check on every probe without a timeout or cache; bound it with a timeout and reuse a short-lived result.",
              "Returning 200 for degraded dependencies, so the load balancer keeps sending traffic to an instance that cannot serve; return 503 from readiness.",
            ],
            resources: [
              {
                title: "Health checks in ASP.NET Core",
                url: "https://learn.microsoft.com/aspnet/core/host-and-deploy/health-checks",
                kind: "docs",
              },
              {
                title: ".NET diagnostics",
                url: "https://learn.microsoft.com/dotnet/core/diagnostics/",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "open-telemetry-dotnet",
          "Without a trace ID that crosses HTTP, database and queue calls, latency debugging stops at the edge of one log line.",
          [
            "`ActivitySource`, `Meter` and the OpenTelemetry SDK",
            "OTLP exporter and collector pipeline",
            "Resource attributes and service identity",
            "Sampling, span links and W3C `traceparent`",
          ],
          "Instrument an endpoint with a custom `ActivitySource`, export OTLP to a local collector, and show one trace containing the ASP.NET Core span, the `HttpClient` span and the SQL command.",
          {
            title: "OpenTelemetry in .NET",
            summary:
              "OpenTelemetry instruments .NET through `ActivitySource` for traces and `Meter` for metrics, then exports them through a provider configured at startup. The W3C `traceparent` header carries context across process boundaries, so one trace can join the API, its HTTP dependency and the database.",
            difficulty: "advanced",
            minutes: 70,
            pitfalls: [
              "Creating an `ActivitySource` per request without a stable name; create one static source per library so listeners can subscribe.",
              "Exporting every span from a high-volume service without sampling, which saturates the collector; configure head or tail sampling.",
              "Correlating by log message text instead of context; propagate `traceparent` and log the trace ID on every event.",
            ],
            resources: [
              {
                title: "OpenTelemetry .NET",
                url: "https://opentelemetry.io/docs/languages/dotnet/",
                kind: "docs",
              },
              {
                title: "Observability with OpenTelemetry",
                url: "https://learn.microsoft.com/dotnet/core/diagnostics/observability-with-otel",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
  ],
};
