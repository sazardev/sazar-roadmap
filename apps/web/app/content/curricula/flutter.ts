import type { Curriculum } from "../types";
import { topic } from "../types";

export const flutter: Curriculum = {
  slug: "flutter",
  title: "Flutter and Dart",
  tagline: "One language, one renderer, every screen.",
  description:
    "A complete path through Dart and Flutter for mobile product work: the language and its type system, async and isolates, the widget and render tree, layout, state, navigation, animation, local data, APIs, testing and release. The goal is a shipped app whose behavior you can explain from the event loop to the frame.",
  level: "beginner",
  icon: "smartphone",
  estimatedHours: 84,
  stages: [
    {
      slug: "dart-foundations",
      title: "Dart foundations",
      description:
        "Learn the language syntax and semantics you will use in every file. By the end you can write, format and test a small Dart program without a framework hiding the language.",
      topics: [
        topic(
          "basics-of-dart",
          "Every Flutter file is Dart, so a shaky grasp of entry points, libraries and imports turns framework errors into guesswork.",
          [
            "Top-level `main()` entry point and program arguments",
            "Library-level privacy with underscore-prefixed identifiers",
            "JIT development builds versus AOT release compilation",
            "Imports, libraries and the package resolution boundary",
          ],
          "Create a console project with `dart create -t console`, split it into two library files with one private helper, run `dart format .` and `dart analyze`, then `dart run`; paste the output and the file tree.",
          {
            summary:
              "Dart is a class-based, garbage-collected language with C-style syntax, sound null safety and a single-threaded event loop per isolate. A program starts at a top-level `main()`, every file belongs to a library, and underscore-prefixed names are private to that library rather than to a class.",
            difficulty: "foundation",
            minutes: 35,
            pitfalls: [
              "Treating `main()` as a method that belongs to a class; declare it at the top level and return `void` or `Future<void>`.",
              "Expecting an underscore-prefixed name to be private across packages; it is private to the library, so split files only when that boundary is intended.",
              "Running a Flutter-only file with `dart run` and blaming the SDK; separate pure Dart logic from code that imports `dart:ui` or Flutter packages.",
            ],
            resources: [
              {
                title: "Dart overview",
                url: "https://dart.dev/overview",
                kind: "docs",
              },
              {
                title: "Dart language tour",
                url: "https://dart.dev/language",
                kind: "docs",
              },
              {
                title: "DartPad",
                url: "https://dartpad.dev/",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "built-in-types",
          "Choosing `double` for money or treating a string length as a character count produces bugs the analyzer cannot catch.",
          [
            "The `num` supertype of `int` and `double`",
            "UTF-16 code units, runes and grapheme clusters",
            "List, set and map literals with type inference",
            "Compile-time constants and `const` literals",
          ],
          "Write a Dart script that prints `'👍'.length`, `'👍'.runes.length` and the value and type of `1 / 2`, then lock each result with a `dart test` assertion.",
          {
            summary:
              "Dart's built-in types are objects rather than primitives: `int`, `double`, `String`, `bool`, `List`, `Set`, `Map`, `Runes` and `Symbol`. Numbers never narrow implicitly, strings are sequences of UTF-16 code units, and every literal carries a static type that the analyzer infers.",
            difficulty: "foundation",
            minutes: 40,
            pitfalls: [
              "Assuming `1 / 2` produces an `int`; division returns `double`, so use `~/` when truncating integer division is intended.",
              "Calling `String.length` a character count; emoji and combining marks span several UTF-16 code units, so use `characters` from `package:characters`.",
              "Comparing monetary `double` values with `==`; store cents as `int` or use a decimal package so rounding is explicit.",
            ],
            resources: [
              {
                title: "Dart built-in types",
                url: "https://dart.dev/language/built-in-types",
                kind: "docs",
              },
              {
                title: "String class",
                url: "https://api.dart.dev/stable/dart-core/String-class.html",
                kind: "docs",
              },
              {
                title: "characters package",
                url: "https://pub.dev/packages/characters",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "variables",
          "Reading `final` as deep immutability or `var` as dynamic hides an API's mutability and nullability from every caller.",
          [
            "Type inference from initializer expressions",
            "`final` binding versus `const` compile-time value",
            "Nullable types, `?` and flow analysis",
            "`late` initialization and `LateInitializationError`",
            "Definite assignment for non-nullable locals",
          ],
          "Write four declarations that look equivalent, mutate each where the analyzer allows it, and record which ones are rejected and which mutation still reaches the original object.",
          {
            summary:
              "Variables are declared with `var`, `final`, `const` or an explicit type; `var` adopts the static type of its initializer, `final` fixes the binding and `const` fixes the value at compile time. A nullable type is written with `?` and promoted by flow analysis after a null check, while a `late` variable defers initialization until first read and throws if that read comes too early.",
            difficulty: "foundation",
            minutes: 35,
            pitfalls: [
              "Expecting `final` to freeze a list's elements; it prevents reassignment only, so use `List.unmodifiable` or an immutable model when contents matter.",
              "Using `late` to silence a nullable field and reading it before assignment; initialize it in `initState` or make the field nullable and handle the absence.",
              "Declaring a public field with `var`; the inferred type becomes the contract and can expose an implementation type you cannot change later, so write the interface type explicitly.",
            ],
            resources: [
              {
                title: "Dart variables",
                url: "https://dart.dev/language/variables",
                kind: "docs",
              },
              {
                title: "Sound null safety",
                url: "https://dart.dev/null-safety",
                kind: "docs",
              },
              {
                title: "The Dart type system",
                url: "https://dart.dev/language/type-system",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "operators",
          "Null-aware and cascade operators hide control flow, so reading them as syntax sugar produces wrong fallbacks and surprising mutation order.",
          [
            "Null-aware `?.`, `??` and `??=`",
            "Cascade notation and its receiver return value",
            "Operator overloading with `operator` methods",
            "Bitwise, shift and short-circuit operators",
          ],
          "Rewrite a five-line null-check-and-mutate block with `?.`, `??=` and a cascade, then add a test proving which side of `&&` and `??` actually evaluated.",
          {
            summary:
              "Dart supplies arithmetic, relational, logical, bitwise, null-aware and cascade operators, and a class can overload a fixed set of them. `??` reacts only to null, `?.` short-circuits a member access and `..` returns the original receiver after a sequence of mutations.",
            difficulty: "foundation",
            minutes: 35,
            pitfalls: [
              "Using `??` when the left side is an empty string or zero; it checks only null, so validate emptiness with a separate condition.",
              "Chaining a cascade on a nullable target; the receiver must be non-null, so use the null-shorting cascade `?..` or a null check.",
              "Overloading `==` without overriding `hashCode`; equal objects then disappear from sets and map lookups, so update both together.",
            ],
            resources: [
              {
                title: "Dart operators",
                url: "https://dart.dev/language/operators",
                kind: "docs",
              },
              {
                title: "Effective Dart: design",
                url: "https://dart.dev/effective-dart/design",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "control-flow-statements",
          "A non-exhaustive switch is how a new sealed variant becomes a runtime gap instead of a compile error, so the switch shape decides whether the compiler can help.",
          [
            "`for`, `for-in`, `while` and `do-while` loops",
            "Switch statements and exhaustive switch expressions",
            "Pattern cases with `when` guards",
            "Labeled `break` and `continue`",
          ],
          "Model three order states with a sealed class and write a switch expression with no `default`; add a fourth state and paste the analyzer error that proves exhaustiveness.",
          {
            summary:
              "Dart's control flow covers `if`/`else`, `for`, `while`, `do-while`, `switch` and exceptions. A switch over an enum or sealed hierarchy is checked for exhaustiveness, supports pattern cases with guards, and falls through only when a case body is empty.",
            difficulty: "foundation",
            minutes: 45,
            pitfalls: [
              "Adding a `default` branch that swallows new enum values; omit it so the analyzer reports the missing case when a variant appears.",
              "Assuming every empty case falls through by accident; an empty case falls through deliberately, so write a comment or handle it explicitly.",
              "Using `break` inside a `switch` to leave an enclosing loop; use a label or restructure so the intent is visible.",
            ],
            resources: [
              {
                title: "Dart branches",
                url: "https://dart.dev/language/branches",
                kind: "docs",
              },
              {
                title: "Dart loops",
                url: "https://dart.dev/language/loops",
                kind: "docs",
              },
              {
                title: "Dart patterns",
                url: "https://dart.dev/language/patterns",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "functions",
          "Flutter APIs are built from callbacks, and a misdeclared optional or named parameter compiles while binding the wrong argument at the call site.",
          [
            "Required and optional named parameters",
            "First-class functions and typedefs",
            "Lexical closures and captured variables",
            "Tear-offs of methods and constructors",
          ],
          "Write two functions, one with an optional positional parameter and one with an optional named parameter, call both from a widget callback, and assert the bound values in a test.",
          {
            summary:
              "Functions are objects with a `Function` type, so they can be assigned, passed and returned like any other value. Parameters may be required positional, optional positional or named, and closures capture their lexical environment by reference rather than by value.",
            difficulty: "foundation",
            minutes: 45,
            pitfalls: [
              "Using optional positional parameters for flags; the call site reads as `f(true, false)`, so switch to required named parameters when a call needs labels.",
              "Trying to mix optional positional and named parameters; a function declares one optional group, so choose named parameters when call sites need more than one flag.",
              "Declaring a callback as `Function` without a typedef; the parameter and return types disappear, so name the signature and let the analyzer check it.",
            ],
            resources: [
              {
                title: "Dart functions",
                url: "https://dart.dev/language/functions",
                kind: "docs",
              },
              {
                title: "Effective Dart: usage",
                url: "https://dart.dev/effective-dart/usage",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "dart-type-system",
      title: "Dart type system and objects",
      description:
        "Model data with classes, collections, generics and immutability. You will build a small domain model, serialize it to JSON and explain why Dart's null safety changes API design.",
      topics: [
        topic(
          "oop",
          "A domain object with an invalid construction path pushes validation into the UI and reappears as null checks scattered across screens.",
          [
            "Generative, named and factory constructors",
            "Initializer lists and `required` fields",
            "Abstract classes versus implicit interfaces",
            "Mixins with `on` constraints",
          ],
          "Model a `Money` class with a private constructor, a validated factory and value equality, then add a test that rejects a negative amount.",
          {
            summary:
              "Dart classes combine fields, constructors, methods and getters, with single inheritance plus interfaces and mixins for composition. Constructors may be generative, named, factory or const, and every `final` field must be initialized before the instance becomes visible.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Validating in a factory while leaving the generative constructor public; make the unsafe constructor private so every path enforces the invariant.",
              "Extending a class for code reuse when the relationship is not substitutable; inheritance exposes the entire API, so use a mixin or composition.",
              "Omitting `@override` on an interface implementation; a renamed method then compiles as a new method instead of failing.",
            ],
            resources: [
              {
                title: "Dart classes",
                url: "https://dart.dev/language/classes",
                kind: "docs",
              },
              {
                title: "Dart constructors",
                url: "https://dart.dev/language/constructors",
                kind: "docs",
              },
              {
                title: "Dart methods",
                url: "https://dart.dev/language/methods",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "advanced-dart",
          "Without sealed hierarchies and patterns, a state machine drifts into maps of nullable fields that no compiler checks.",
          [
            "Records and structural equality",
            "Object, list and map patterns",
            "`sealed`, `final` and `base` class modifiers",
            "Extension methods and extension types",
            "Enhanced enums with fields and methods",
          ],
          "Replace a map-based event payload with a sealed class of records, switch over it exhaustively, and paste the analyzer error after adding an unhandled variant.",
          {
            summary:
              "Dart 3 adds records, patterns, sealed and final class modifiers, extension methods and enhanced enums. These features make data shapes explicit: a record carries positional and named fields, a pattern destructures it, and exhaustiveness checking proves that every sealed subtype is handled.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Returning an anonymous record from a public API when the fields need names and documentation; a small immutable class communicates more.",
              "Declaring a sealed class in one library and its subtypes in another file without `part`; sealed subtypes must live in the same library.",
              "Adding an extension method whose name collides with a member; members always win, so the extension silently never runs at that call site.",
            ],
            resources: [
              {
                title: "Dart records",
                url: "https://dart.dev/language/records",
                kind: "docs",
              },
              {
                title: "Dart patterns",
                url: "https://dart.dev/language/patterns",
                kind: "docs",
              },
              {
                title: "Dart class modifiers",
                url: "https://dart.dev/language/class-modifiers",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "collections",
          "A `List.contains` lookup inside a loop turns linear work into quadratic work that only becomes visible when the catalog grows.",
          [
            "`List`, `Set` and `Map` iteration order",
            "Lazy `Iterable` chains versus eager `toList`",
            "Hash and equality for set and map keys",
            "Collection-if, collection-for and spreads",
          ],
          "Build a 10,000-item catalog, time `List.contains` against a `Set` lookup with a `Stopwatch`, and paste both measurements with the input size.",
          {
            summary:
              "Dart collections are `List`, `Set` and `Map`, backed by growable arrays, hash sets and linked hash maps. `Iterable` supplies lazy transformations such as `map`, `where` and `expand`, while `List` adds indexed access and in-place mutation.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Calling `toList()` after every lazy operation; each call materializes an intermediate list, so keep the chain lazy until the final consumer.",
              "Mutating a collection while iterating over it; iterate over a copy or collect removals before applying them.",
              "Using a custom class as a map key without `==` and `hashCode`; lookups miss even when field values match, so make the key a value type.",
            ],
            resources: [
              {
                title: "Dart collections",
                url: "https://dart.dev/language/collections",
                kind: "docs",
              },
              {
                title: "List class",
                url: "https://api.dart.dev/stable/dart-core/List-class.html",
                kind: "docs",
              },
              {
                title: "Map class",
                url: "https://api.dart.dev/stable/dart-core/Map-class.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "json-serialize--deserialize",
          "Casting a decoded map straight to a model crashes on the first missing or mistyped field that a real server sends.",
          [
            "`jsonEncode` and `jsonDecode`",
            "`Map<String, dynamic>` at the wire boundary",
            "Manual `fromJson` with typed field parsing",
            "Code generation with `json_serializable`",
            "Unknown fields and schema evolution",
          ],
          "Write a `fromJson` that rejects a missing `id` with a typed exception, then test a payload with an unknown field and show that it still parses.",
          {
            summary:
              "`dart:convert` turns maps and lists into JSON text with `jsonEncode` and parses text back into dynamic maps with `jsonDecode`. Because decoded values are `Map<String, dynamic>`, production code needs an explicit mapping layer with type checks, defaults and errors at the network boundary.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Casting decoded output with `as Map<String, String>`; nested values remain dynamic, so read and validate each field explicitly.",
              "Assuming a JSON `1.0` arrives as an `int`; `as int` throws, so check with `is num` and convert deliberately.",
              "Letting a generated serializer own domain invariants; validate after decoding and keep the wire model separate from the domain model.",
            ],
            resources: [
              {
                title: "JSON serialization in Flutter",
                url: "https://docs.flutter.dev/data-and-backend/serialization/json",
                kind: "docs",
              },
              {
                title: "JsonEncoder class",
                url: "https://api.dart.dev/stable/dart-convert/JsonEncoder-class.html",
                kind: "docs",
              },
              {
                title: "JsonDecoder class",
                url: "https://api.dart.dev/stable/dart-convert/JsonDecoder-class.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "immutability",
          "A widget that claims immutability while holding a mutable list defeats identity comparisons and causes missed rebuilds.",
          [
            "`const` constructors and canonicalization",
            "Final fields versus deep immutability",
            "`copyWith` as an explicit state transition",
            "`@immutable` and analyzer hints",
          ],
          "Build an `InheritedWidget` with a `final List<String>`, mutate the list in place and call `updateShouldNotify`, then copy the list and record the different result.",
          {
            summary:
              "An immutable object cannot change after construction, which makes every state transition an explicit new value. `const` constructors, `final` fields and `@immutable` encode that promise, but the promise is shallow: a final field can still reference a growable list or map.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Annotating a class `@immutable` while exposing a mutable `List`; wrap it with `List.unmodifiable` or copy on construction so callers cannot mutate it.",
              "Using `const` with runtime values; the constructor call fails to compile, so keep `const` for compile-time literals only.",
              "Assuming `final` freezes elements; it fixes the reference, so deep immutability needs unmodifiable collections or immutable value types.",
            ],
            resources: [
              {
                title: "Effective Dart: design",
                url: "https://dart.dev/effective-dart/design",
                kind: "docs",
              },
              {
                title: "The immutable annotation",
                url: "https://api.flutter.dev/flutter/meta/immutable-constant.html",
                kind: "docs",
              },
              {
                title: "Dart class modifiers",
                url: "https://dart.dev/language/class-modifiers",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "functional-programming",
          "A lazy pipeline with side effects executes at an unpredictable time, which puts logging and error handling in the wrong frame.",
          [
            "Higher-order functions and composition",
            "Lazy evaluation in `Iterable` chains",
            "Pure functions and referential transparency",
            "`fold` and `reduce` as terminal operations",
          ],
          "Write the same filter-map-sum pipeline eagerly and lazily, add a print inside the mapper, and record how many times it runs in each version.",
          {
            summary:
              "Dart supports higher-order functions, closures and lazy `Iterable` pipelines, so a transformation can be composed from small functions. Purity is a discipline rather than an enforced property: closures can still capture mutable state, and nothing runs until a terminal operation asks for values.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Putting network calls or logging inside `map`; the callback runs only when a terminal operation iterates, so the timing is not where it appears.",
              "Calling `reduce` on an empty iterable; it throws, so use `fold` with an initial value when emptiness is possible.",
              "Assuming a lazy chain executes at assignment; add the terminal operation and test the observable side effect instead.",
            ],
            resources: [
              {
                title: "Dart functions",
                url: "https://dart.dev/language/functions",
                kind: "docs",
              },
              {
                title: "Dart collections",
                url: "https://dart.dev/language/collections",
                kind: "docs",
              },
              {
                title: "Iterable class",
                url: "https://api.dart.dev/stable/dart-core/Iterable-class.html",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "async-and-isolates",
      title: "Async and isolates",
      description:
        "Understand Dart's event loop and concurrency model. You will compose futures and streams, handle errors, and move CPU-heavy work to an isolate without sharing mutable state.",
      topics: [
        topic(
          "async--await",
          "Awaiting independent calls in a loop serializes them, turning a page that could load in 200 ms into a multi-second wait.",
          [
            "`async` functions and `Future` return types",
            "Await suspension, resumption and the event loop",
            "`try`/`catch` across await points",
            "Sequential versus concurrent awaits",
          ],
          "Fetch three endpoints sequentially and with `Future.wait`, measure both with a `Stopwatch`, and paste the two elapsed times with the number of requests.",
          {
            summary:
              "Marking a function `async` makes it return a `Future`, and `await` suspends that function until the future completes without blocking the isolate's event loop. Errors become thrown exceptions at the await point, so `try`/`catch` spans asynchronous boundaries.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Awaiting each item in a loop when the calls are independent; use `Future.wait` and decide how a partial failure should surface.",
              "Forgetting `await` and returning a `Future` where a value is expected; the analyzer catches some cases, so keep the return type explicit.",
              "Catching an error from an unawaited future outside its zone; attach the handler at creation or await it in the same error zone.",
            ],
            resources: [
              {
                title: "Asynchronous programming in Dart",
                url: "https://dart.dev/language/async",
                kind: "docs",
              },
              {
                title: "Future class",
                url: "https://api.dart.dev/stable/dart-async/Future-class.html",
                kind: "docs",
              },
              {
                title: "Asynchronous programming codelab",
                url: "https://dart.dev/codelabs/async-await",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "futures",
          "A future chain that drops an error or mixes `then` with `await` produces an unhandled exception that never reaches the UI error path.",
          [
            "Future states and completion",
            "`then`, `catchError` and `whenComplete`",
            "`Future.wait` with `eagerError`",
            "Microtask scheduling of completion callbacks",
          ],
          "Compose three futures where one fails, run them with `Future.wait(eagerError: true)`, and log which values and errors arrive and in what order.",
          {
            summary:
              "A `Future<T>` represents one value or error delivered later, with states of uncompleted, completed with a value and completed with an error. `then`, `catchError` and `whenComplete` register callbacks, while `Future.wait` combines several futures and `Future.any` takes the first to finish.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Calling `then` and discarding its returned future; an error then propagates to a future nobody listens to, so return or await the chain.",
              "Assuming `Future.wait(eagerError: true)` cancels the other futures; it completes early but the remaining work keeps running.",
              "Depending on the order of `then` and `whenComplete` callbacks; attach the cleanup at the end of the chain where its timing is unambiguous.",
            ],
            resources: [
              {
                title: "Future class",
                url: "https://api.dart.dev/stable/dart-async/Future-class.html",
                kind: "docs",
              },
              {
                title: "dart:async library",
                url: "https://dart.dev/libraries/dart-async",
                kind: "docs",
              },
              {
                title: "Asynchronous programming in Dart",
                url: "https://dart.dev/language/async",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "streams",
          "Subscribing twice to a single-subscription stream throws only when the second widget mounts, which is the hardest moment to debug.",
          [
            "Single-subscription versus broadcast streams",
            "`listen`, `onData`, `onError` and `onDone`",
            "`StreamController` and backpressure",
            "`await for` and subscription cancellation",
          ],
          "Create a `StreamController` that emits five integers, subscribe two listeners, then switch it to broadcast and paste the error that disappears.",
          {
            summary:
              "A `Stream<T>` delivers zero or more values and errors over time, then closes. Single-subscription streams accept one listener, broadcast streams accept many, and `await for` pauses the subscription while the loop body runs.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Building a broadcast controller before the first listener and losing early events; start the source only after subscription or keep a replay buffer.",
              "Calling `listen` in `build` without cancelling; every rebuild adds a subscription, so own the subscription in `State` and cancel it in `dispose`.",
              "Omitting `onError`; an unhandled stream error reaches the zone handler, so route it to visible state instead of a silent log.",
            ],
            resources: [
              {
                title: "Using streams",
                url: "https://dart.dev/libraries/async/using-streams",
                kind: "docs",
              },
              {
                title: "Stream class",
                url: "https://api.dart.dev/stable/dart-async/Stream-class.html",
                kind: "docs",
              },
              {
                title: "StreamController class",
                url: "https://api.dart.dev/stable/dart-async/StreamController-class.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "isolates",
          "Parsing JSON or decoding images on the UI isolate drops frames, and a faster phone does not fix a blocked event loop.",
          [
            "Isolate heaps and message passing",
            "`Isolate.run` and `Isolate.spawn`",
            "`SendPort` and `ReceivePort`",
            "Message copy cost and transferable typed data",
          ],
          "Parse a large JSON payload on the UI isolate and with `Isolate.run`, record both elapsed times in DevTools, and state the effect on the frame budget.",
          {
            summary:
              "An isolate is an independent Dart execution context with its own heap and event loop, so isolates share no mutable memory. Communication happens through `SendPort` and `ReceivePort` messages, and CPU-heavy work moved with `Isolate.run` leaves the UI isolate free to produce frames.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Capturing a closure that references UI objects inside `Isolate.run`; only sendable values cross the boundary, so pass plain data and return plain data.",
              "Spawning a new isolate for every small item; creation cost dominates, so batch work or keep a long-lived worker.",
              "Assuming a large message transfer is free; messages are copied unless transferred as typed data, so measure the boundary before optimizing inside it.",
            ],
            resources: [
              {
                title: "Dart isolates",
                url: "https://dart.dev/language/isolates",
                kind: "docs",
              },
              {
                title: "Dart concurrency",
                url: "https://dart.dev/language/concurrency",
                kind: "docs",
              },
              {
                title: "Isolate class",
                url: "https://api.dart.dev/stable/dart-isolate/Isolate-class.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "rxdart",
          "Hand-rolled debounce with timers leaves pending timers and stale responses after the widget that started them is gone.",
          [
            "`debounceTime` and `throttleTime`",
            "`switchMap` and stale request cancellation",
            "`combineLatest`, `merge` and `distinctUntilChanged`",
            "`BehaviorSubject` replay semantics",
          ],
          "Build a search field whose stream is debounced by 300 ms and switched on each query, log every request, and show that only the last response renders.",
          {
            summary:
              "RxDart adds operators such as `debounceTime`, `switchMap`, `combineLatest` and `distinctUntilChanged` on top of Dart streams. These operators encode timing and cancellation rules that a raw `Stream` does not provide, which is what search fields and live feeds need.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Using `flatMap` for search requests and letting a slow earlier response overwrite a newer one; use `switchMap` so the previous request is cancelled.",
              "Leaving a `BehaviorSubject` open after disposal; close it in `dispose` so listeners and buffers are released.",
              "Debouncing without a minimum query length; every keystroke still creates a timer, so validate before scheduling the request.",
            ],
            resources: [
              {
                title: "RxDart package",
                url: "https://pub.dev/packages/rxdart",
                kind: "docs",
              },
              {
                title: "RxDart API reference",
                url: "https://pub.dev/documentation/rxdart/latest/",
                kind: "docs",
              },
              {
                title: "Using streams",
                url: "https://dart.dev/libraries/async/using-streams",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "reactive-programming",
          "Without an explicit data flow, event handlers mutate widgets directly and the same state gets recomputed in three places.",
          [
            "State as a stream of values over time",
            "Declarative rendering and idempotent builds",
            "`StreamBuilder` connection states",
            "Cold versus hot sources",
          ],
          "Rebuild a counter with a `StreamBuilder` over a broadcast controller, then remove the subscription and show that the widget stops updating.",
          {
            summary:
              "Reactive programming models the interface as a function of state streams: inputs produce new state, and rendering subscribes to the latest value. Flutter already has this shape in `ValueListenable`, `StreamBuilder` and `ChangeNotifier`, even when no reactive package is installed.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Creating a new stream inside `build`; every rebuild resets the subscription and loses accumulated state.",
              "Reading `snapshot.data` before checking `hasData`; the first frame is `ConnectionState.waiting` and has no value.",
              "Subscribing to a hot source without replay; events emitted before the widget mounted are gone, so add a replay or ownership layer.",
            ],
            resources: [
              {
                title: "Using streams",
                url: "https://dart.dev/libraries/async/using-streams",
                kind: "docs",
              },
              {
                title: "StreamBuilder class",
                url: "https://api.flutter.dev/flutter/widgets/StreamBuilder-class.html",
                kind: "docs",
              },
              {
                title: "State management introduction",
                url: "https://docs.flutter.dev/data-and-backend/state-mgmt/intro",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "rendering-model",
      title: "The Flutter rendering model",
      description:
        "See what a widget actually is and how Flutter turns it into pixels. You will inspect the widget, element and render trees and explain why a rebuild is not the same as a repaint.",
      topics: [
        topic(
          "widgets",
          "Storing mutable state in a widget or assuming `build` runs once leads to state that resets and work that repeats on every frame.",
          [
            "Immutable widget configuration",
            "`build` methods and `BuildContext`",
            "Widget identity, runtime type and keys",
            "Composition over inheritance",
          ],
          "Add a `print` to a widget's `build`, trigger three rebuilds with `setState`, and record how many times it runs and which ancestor caused each call.",
          {
            summary:
              "A widget is an immutable configuration object that describes part of the interface; it is cheap and ephemeral, while the element and render object it describes persist across rebuilds. `build` returns a new widget fragment, and the framework reconciles it against the existing tree by runtime type and key.",
            difficulty: "foundation",
            minutes: 45,
            pitfalls: [
              "Mutating a widget field after construction; the next rebuild creates a new instance and the mutation disappears.",
              "Doing expensive work in `build`; it runs on every rebuild, so derive and cache values outside the build path.",
              "Reaching for a `GlobalKey` to move state when a `ValueKey` at the right tree level would preserve identity with less coupling.",
            ],
            resources: [
              {
                title: "Flutter widgets",
                url: "https://docs.flutter.dev/ui/widgets",
                kind: "docs",
              },
              {
                title: "Widget class",
                url: "https://api.flutter.dev/flutter/widgets/Widget-class.html",
                kind: "docs",
              },
              {
                title: "Flutter fundamentals: widgets",
                url: "https://docs.flutter.dev/get-started/fundamentals/widgets",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "3-trees",
          "Debugging with only the widget tree hides why state survived a rebuild or why a repaint happened at all.",
          [
            "Widget, element and render tree roles",
            "Element reconciliation and `updateChild`",
            "Dirty elements and build scheduling",
            "Keys and subtree reuse",
          ],
          "Open the Flutter inspector, enable the widget and render tree views, and map one `Padding` widget to its element and render object with their sizes.",
          {
            summary:
              "Flutter maintains three trees: the widget tree of immutable configuration, the element tree of mounted lifecycle objects and the render tree of layout and paint objects. Rebuilds replace widgets, elements are reused when runtime type and key match, and only dirty render objects are laid out or painted.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Assuming every rebuild recreates render objects; elements and render objects survive while the widget type and key stay the same.",
              "Changing a widget's runtime type at one position without a key; the element is replaced and all descendant state is discarded.",
              "Reading the widget tree as the layout tree; constraints, sizes and paint work belong to the render tree and the timeline.",
            ],
            resources: [
              {
                title: "Flutter architectural overview",
                url: "https://docs.flutter.dev/resources/architectural-overview",
                kind: "docs",
              },
              {
                title: "Element class",
                url: "https://api.flutter.dev/flutter/widgets/Element-class.html",
                kind: "docs",
              },
              {
                title: "RenderObject class",
                url: "https://api.flutter.dev/flutter/rendering/RenderObject-class.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "render-objects",
          "Overflow and unbounded-height errors are constraint violations in the render tree, and stacking wrappers rarely fixes the cause.",
          [
            "`BoxConstraints` and the layout contract",
            "`performLayout` and child positioning",
            "Paint, layers and repaint boundaries",
            "Intrinsic dimensions and their cost",
          ],
          "Write a `CustomPainter` that draws a labeled box, wrap it in a `RepaintBoundary`, and capture a DevTools frame showing paint time before and after.",
          {
            summary:
              "Render objects perform layout and painting: they receive `BoxConstraints` from a parent, choose a size, position their children and paint into a layer. `RenderBox` is the common two-dimensional case, and `CustomPaint` or a `RenderObjectWidget` exposes the protocol when composition is not enough.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Calling `setState` from `performLayout` or `paint`; layout and paint must not schedule another build, so move the state change to an event handler.",
              "Using `IntrinsicHeight` inside a long list; it measures children more than once and can double layout cost.",
              "Painting outside the allocated size without a clip or layer; hit testing and visible pixels then disagree.",
            ],
            resources: [
              {
                title: "RenderObject class",
                url: "https://api.flutter.dev/flutter/rendering/RenderObject-class.html",
                kind: "docs",
              },
              {
                title: "RenderBox class",
                url: "https://api.flutter.dev/flutter/rendering/RenderBox-class.html",
                kind: "docs",
              },
              {
                title: "Understanding constraints",
                url: "https://docs.flutter.dev/ui/layout/constraints",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "flutter-internals",
          "Knowing which frame phase owns a cost tells you whether to reduce rebuilds, layout passes or raster work instead of guessing.",
          [
            "UI thread, raster thread and platform thread",
            "Build, layout, paint and composite phases",
            "Scheduler binding and frame callbacks",
            "Impeller and shader compilation",
          ],
          "Profile one scroll frame in DevTools, label the build, layout and raster portions, and name the phase with the largest share of the frame budget.",
          {
            summary:
              "Flutter runs Dart framework work on the UI isolate, rasterizes layers on the raster thread and handles native events on the platform thread. Each frame moves through build, layout, paint and compositing before a `Scene` is submitted to the engine. A 60 Hz display allows 16.6 ms per frame and a 120 Hz display allows 8.3 ms, so any phase that exceeds the budget drops a frame.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Attributing jank to Dart when the raster thread is saturated; read the thread lanes in the timeline before changing widget code.",
              "Adding `RepaintBoundary` everywhere; extra layers cost memory and can slow compositing, so add them around measured repaint sources.",
              "Assuming the platform thread draws Flutter pixels; it handles native lifecycle and input while the raster thread submits frames.",
            ],
            resources: [
              {
                title: "Flutter architectural overview",
                url: "https://docs.flutter.dev/resources/architectural-overview",
                kind: "docs",
              },
              {
                title: "Inside Flutter",
                url: "https://docs.flutter.dev/resources/inside-flutter",
                kind: "docs",
              },
              {
                title: "Flutter performance best practices",
                url: "https://docs.flutter.dev/perf/best-practices",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "stateless-widgets",
          "Promoting presentation to a stateful widget adds lifecycle surface and makes the data flow harder to test.",
          [
            "Const constructors for stateless widgets",
            "Build purity and derived values",
            "`BuildContext` dependencies",
            "Composition through `child` parameters",
          ],
          "Convert a stateful row into a const stateless widget, add a widget test for both themes, and confirm the rendered text and colors are unchanged.",
          {
            summary:
              "A stateless widget derives its interface entirely from constructor arguments and inherited data, so it has no state object and no lifecycle beyond `build`. It is the correct default for presentation, and it still rebuilds when an ancestor changes or an inherited dependency it reads is updated.",
            difficulty: "foundation",
            minutes: 40,
            pitfalls: [
              "Storing a controller in a stateless widget field; the instance is recreated on rebuild and its listeners are never released.",
              "Calling `Theme.of(context)` outside `build`; inherited dependencies must be read from a context that is still mounted and part of the tree.",
              "Making only the leaf const while a parent passes a new closure; the non-const argument prevents the subtree from being canonicalized.",
            ],
            resources: [
              {
                title: "StatelessWidget class",
                url: "https://api.flutter.dev/flutter/widgets/StatelessWidget-class.html",
                kind: "docs",
              },
              {
                title: "Flutter fundamentals: widgets",
                url: "https://docs.flutter.dev/get-started/fundamentals/widgets",
                kind: "docs",
              },
              {
                title: "Widget class",
                url: "https://api.flutter.dev/flutter/widgets/Widget-class.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "stateful-widgets",
          "A controller or subscription created without a matching `dispose` leaks on every navigation and keeps the old route's state alive.",
          [
            "State object lifetime and `setState`",
            "`initState` and `didChangeDependencies`",
            "`didUpdateWidget` for changed inputs",
            "`dispose` and resource ownership",
          ],
          "Build a widget that starts a periodic timer, navigate away, and prove with logs that `dispose` cancels it before the next tick.",
          {
            summary:
              "A stateful widget pairs an immutable widget with a long-lived `State` object whose `setState` marks its element dirty. Lifecycle methods such as `initState`, `didUpdateWidget` and `dispose` define where subscriptions, controllers and timers are created and released.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Calling `setState` after an await when the widget may be gone; check `mounted` and return before touching state.",
              "Creating a controller in `build`; each rebuild replaces it and the previous controller is never disposed.",
              "Using `didChangeDependencies` for one-time setup; it can run again when an inherited dependency changes, so guard the work or move it to `initState`.",
            ],
            resources: [
              {
                title: "StatefulWidget class",
                url: "https://api.flutter.dev/flutter/widgets/StatefulWidget-class.html",
                kind: "docs",
              },
              {
                title: "State class",
                url: "https://api.flutter.dev/flutter/widgets/State-class.html",
                kind: "docs",
              },
              {
                title: "Flutter fundamentals: state management",
                url: "https://docs.flutter.dev/get-started/fundamentals/state-management",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "layout-and-ui",
      title: "Layout and UI",
      description:
        "Build responsive screens with the framework's layout model. You will use constraints, flex, slivers and adaptive widgets, then verify the result at three screen sizes and with text scaling.",
      topics: [
        topic(
          "lists",
          "A `Column` inside a `SingleChildScrollView` builds every child at once, which is why long feeds stutter and allocate.",
          [
            "Lazy builders and item extents",
            "`ListView`, `GridView` and `CustomScrollView`",
            "Slivers and `SliverList`",
            "Scroll controllers and pagination triggers",
          ],
          "Build a 10,000-row `ListView.builder` and the same data in a `Column`, then record build time and memory in DevTools for both.",
          {
            summary:
              "`ListView` and `GridView` are scrollable viewports that build children lazily through slivers, so a long feed costs roughly the visible rows plus a cache extent. `ListView.builder` supplies an index, while `ListView.separated` inserts dividers without materializing the whole data set.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Using a `Column` for a long list; switch to `ListView.builder` or a sliver so off-screen rows are never built.",
              "Omitting `itemExtent` for fixed-height rows; the viewport estimates extents and scroll position can jump as measurements arrive.",
              "Recreating a `ScrollController` in `build`; keep it in `State` and dispose it so listeners and positions survive rebuilds.",
            ],
            resources: [
              {
                title: "ListView class",
                url: "https://api.flutter.dev/flutter/widgets/ListView-class.html",
                kind: "docs",
              },
              {
                title: "Work with long lists",
                url: "https://docs.flutter.dev/cookbook/lists/long-lists",
                kind: "docs",
              },
              {
                title: "SliverList class",
                url: "https://api.flutter.dev/flutter/widgets/SliverList-class.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "responsive-widgets",
          "Branching on `Platform.isIOS` to choose a layout confuses device identity with available width and breaks tablets and split view.",
          [
            "`LayoutBuilder` constraints versus `MediaQuery` size",
            "Breakpoints and window size classes",
            "`Expanded`, `Flexible` and flex factors",
            "Text scaling and safe areas",
          ],
          "Build one screen with a 600 px breakpoint, run it at 320, 600 and 1024 logical pixels, and capture the layout at each size.",
          {
            summary:
              "Responsive layout chooses structure from the constraints a widget receives, not from the device model. `LayoutBuilder`, `MediaQuery` and breakpoints drive those decisions, while `Expanded`, `Flexible` and `Wrap` let one tree adapt across widths without duplicating screens.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Reading `MediaQuery.of(context).size` inside a pane; the pane can be narrower than the window, so use the constraints from `LayoutBuilder`.",
              "Hard-coding a two-column layout without a single-column fallback; narrow widths overflow instead of reflowing.",
              "Ignoring `MediaQuery.textScaler`; large accessibility text overlaps rows with fixed heights, so let rows size to their content.",
            ],
            resources: [
              {
                title: "Adaptive and responsive design",
                url: "https://docs.flutter.dev/ui/adaptive-responsive",
                kind: "docs",
              },
              {
                title: "LayoutBuilder class",
                url: "https://api.flutter.dev/flutter/widgets/LayoutBuilder-class.html",
                kind: "docs",
              },
              {
                title: "Understanding constraints",
                url: "https://docs.flutter.dev/ui/layout/constraints",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "material-widgets",
          "Per-widget styling drifts from the design system and turns dark mode or a brand update into a screen-by-screen edit.",
          [
            "`MaterialApp`, `Scaffold` and navigation surfaces",
            "`ColorScheme` and Material 3 roles",
            "`ThemeData` component themes",
            "Elevation, ink and surface tint",
          ],
          "Build a screen with `Scaffold`, `NavigationBar` and two button variants, switch `ThemeMode`, and capture both renders for comparison.",
          {
            summary:
              "Material widgets implement Google's Material 3 components: `Scaffold`, `AppBar`, `NavigationBar`, `FilledButton`, `Card` and the theme system that feeds them. `ThemeData` and `ColorScheme` centralize color roles, typography and component defaults so screens do not hard-code styles.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Hard-coding `Colors.blue` instead of `Theme.of(context).colorScheme.primary`; dark mode and brand changes then skip the widget.",
              "Nesting a second `MaterialApp` for a feature; it resets theme, navigator and localization, so use a nested navigator or router instead.",
              "Using a `Scaffold` inside a tab without a nested navigator; app bars and snack bars attach to the wrong navigation context.",
            ],
            resources: [
              {
                title: "Material design in Flutter",
                url: "https://docs.flutter.dev/ui/design/material",
                kind: "docs",
              },
              {
                title: "MaterialApp class",
                url: "https://api.flutter.dev/flutter/material/MaterialApp-class.html",
                kind: "docs",
              },
              {
                title: "Material 3 guidelines",
                url: "https://m3.material.io/",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "cupertino-widgets",
          "iOS users expect the edge-swipe back gesture and native typography, and a Material-only flow feels foreign even when the layout is correct.",
          [
            "`CupertinoApp` and `CupertinoPageScaffold`",
            "`CupertinoNavigationBar` and page transitions",
            "iOS edge-swipe back gesture",
            "Platform-adaptive widget selection",
          ],
          "Build a two-page flow with `CupertinoPageScaffold`, verify the edge-swipe back gesture on an iOS simulator, and record the route log for both pages.",
          {
            summary:
              "Cupertino widgets reproduce iOS navigation, controls and transitions through `CupertinoApp`, `CupertinoNavigationBar`, `CupertinoPageScaffold` and `CupertinoButton`. They are a separate design language rather than a skin, so mixing them with Material without a rule produces inconsistent gestures and typography.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Wrapping Cupertino pages in a Material `Scaffold`; the background, app bar and back gesture then conflict, so keep the Cupertino page hierarchy intact.",
              "Using Cupertino controls on Android and expecting Material ripples; Cupertino has no ink splash by design, so choose per platform.",
              "Branching on `Platform.isIOS` in every widget; centralize the choice in a small adaptive widget so the rule is testable and consistent.",
            ],
            resources: [
              {
                title: "Cupertino design in Flutter",
                url: "https://docs.flutter.dev/ui/design/cupertino",
                kind: "docs",
              },
              {
                title: "CupertinoApp class",
                url: "https://api.flutter.dev/flutter/cupertino/CupertinoApp-class.html",
                kind: "docs",
              },
              {
                title: "Navigation in Flutter",
                url: "https://docs.flutter.dev/ui/navigation",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "images",
          "Full-resolution network images decoded into memory evict the cache and jank long lists that look fine in the simulator.",
          [
            "`ImageProvider` and image resolution",
            "`ImageCache` size and eviction",
            "`BoxFit`, alignment and decode dimensions",
            "Placeholders and `errorBuilder`",
          ],
          "Display the same remote image in a 100 px and a 400 px box, log `ImageCache.currentSizeBytes`, and compare a `cacheWidth` request with the full-size decode.",
          {
            summary:
              "Flutter decodes image bytes into `ui.Image` objects and caches them in an `ImageCache` keyed by provider and decode size. `Image.asset`, `Image.network` and `Image.file` differ in where bytes come from, but all resolve to an `ImageProvider` that owns decoding and cache behavior.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Requesting a 4000 px image for a 100 px thumbnail; pass `cacheWidth` or use a resized URL so decode memory matches display size.",
              "Assuming `BoxFit.cover` crops the source; it scales the decoded image, which still allocates the full resolution unless you resize it.",
              "Skipping `errorBuilder`; a failed request leaves a blank box and an unhandled image error, so render a visible fallback.",
            ],
            resources: [
              {
                title: "Assets and images",
                url: "https://docs.flutter.dev/ui/assets/assets-and-images",
                kind: "docs",
              },
              {
                title: "Image class",
                url: "https://api.flutter.dev/flutter/widgets/Image-class.html",
                kind: "docs",
              },
              {
                title: "Cached images",
                url: "https://docs.flutter.dev/cookbook/images/cached-images",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "fonts",
          "A font declared only for regular weight synthesizes faux bold, which looks wrong and shifts layout metrics.",
          [
            "Font family declarations in `pubspec.yaml`",
            "`TextTheme` and Material typography",
            "Font weight, style and fallback",
            "Variable fonts and `FontVariation`",
          ],
          "Bundle one regular and one bold font file, render both, and capture a side-by-side layout comparison that shows the resolved family and weight.",
          {
            summary:
              "Flutter selects fonts through `TextStyle`, `TextTheme` and `FontWeight`, and custom fonts are declared in `pubspec.yaml` then bundled per weight and style. Variable fonts expose axes through `FontVariation`, while a missing family name falls back to the platform font without an error.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Declaring only the regular font file and relying on synthesized bold; add a weight-specific asset so metrics and strokes match the design.",
              "Using a font family name that does not match the pubspec declaration; the app silently falls back, so assert the resolved family in a golden test.",
              "Omitting the font license from app notices; store review or legal review can block the release.",
            ],
            resources: [
              {
                title: "Use a custom font",
                url: "https://docs.flutter.dev/cookbook/design/fonts",
                kind: "docs",
              },
              {
                title: "TextStyle class",
                url: "https://api.flutter.dev/flutter/painting/TextStyle-class.html",
                kind: "docs",
              },
              {
                title: "Assets and images",
                url: "https://docs.flutter.dev/ui/assets/assets-and-images",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "state-and-architecture",
      title: "State and architecture",
      description:
        "Choose where state lives and how it flows. You will implement the same feature with a simple notifier and a structured state library, then compare rebuild scope, testability and boilerplate.",
      topics: [
        topic(
          "state-management",
          "Two widgets that each own a copy of the same data diverge after one edit, and the bug looks like a rendering problem.",
          [
            "Ephemeral versus app state",
            "Single source of truth",
            "Unidirectional data flow",
            "Rebuild scope as a design cost",
          ],
          "Implement a cart with state in the screen, then lift it to an inherited notifier; record which widgets rebuild in each version with the inspector.",
          {
            summary:
              "State management decides which object owns mutable data, who may mutate it and which widgets rebuild when it changes. Ephemeral state stays in a `State` object, while app state belongs above the widgets that need it, with one source of truth and an explicit update path.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Lifting all state to a global singleton; tests then share mutable data and pass or fail based on order, so scope state to the feature.",
              "Passing callbacks through five layers instead of an inherited scope; every intermediate widget gains a dependency it does not use.",
              "Choosing a library before defining ownership and update rules; the library cannot repair an unclear data flow.",
            ],
            resources: [
              {
                title: "State management introduction",
                url: "https://docs.flutter.dev/data-and-backend/state-mgmt/intro",
                kind: "docs",
              },
              {
                title: "State management options",
                url: "https://docs.flutter.dev/data-and-backend/state-mgmt/options",
                kind: "docs",
              },
              {
                title: "Simple app state management",
                url: "https://docs.flutter.dev/data-and-backend/state-mgmt/simple",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "provider",
          "Reading a provider with `context.read` inside `build` skips the dependency and leaves the widget stale after updates.",
          [
            "`InheritedWidget` and dependency registration",
            "`context.watch`, `read` and `select`",
            "`ChangeNotifierProvider` lifecycle",
            "`ProxyProvider` and `Selector`",
          ],
          "Build a counter with `ChangeNotifierProvider`, then replace `watch` with `select` and count rebuilds in the inspector before and after.",
          {
            summary:
              "Provider wraps `InheritedWidget` so a value can be exposed through `BuildContext` and observed by dependents. `ChangeNotifierProvider` adds disposal and change notifications, while `Selector` narrows rebuilds to the value a widget actually reads. The cost is a context dependency: every consumer must sit below the provider and distinguish `watch` from `read`.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Calling `context.read` in `build` and expecting rebuilds; it reads without registering a dependency, so use `watch` for rendered values.",
              "Creating a provider below the widget that reads it; lookup walks up the tree and throws `ProviderNotFoundException`, so place it above the consumer.",
              "Forgetting `dispose` on a manually created `ChangeNotifier`; the provider disposes only what its `create` callback built.",
            ],
            resources: [
              {
                title: "provider package",
                url: "https://pub.dev/packages/provider",
                kind: "docs",
              },
              {
                title: "Simple app state management",
                url: "https://docs.flutter.dev/data-and-backend/state-mgmt/simple",
                kind: "docs",
              },
              {
                title: "InheritedWidget class",
                url: "https://api.flutter.dev/flutter/widgets/InheritedWidget-class.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "riverpod",
          "Provider dependencies that live only in widget code cannot be reused by background logic or tested without a widget tree.",
          [
            "Providers as top-level declarations",
            "`ref.watch`, `ref.read` and `ref.listen`",
            "`Notifier` and `AsyncNotifier` state classes",
            "Provider overrides and `autoDispose`",
          ],
          "Move a `ChangeNotifier` cart to a `NotifierProvider`, override it in a widget test, and show the test passing without a real network client.",
          {
            summary:
              "Riverpod replaces inherited-widget lookup with provider objects that can be read anywhere, combined and overridden in tests. It separates `Provider`, `NotifierProvider` and `AsyncNotifierProvider`, makes dependencies explicit at the provider boundary and disposes state when no listener remains. The cost is ceremony: every feature needs provider declarations and a second mental model for `ref` and lifecycle.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Using `ref.read` in `build` for reactive data; the widget misses later changes, so use `ref.watch` for values that affect rendering.",
              "Calling `ref.watch` inside a callback; watch is a build-time dependency, so use `read` for one-off actions.",
              "Keeping a user-scoped provider alive by default; use `autoDispose` so switching accounts does not retain the previous session.",
            ],
            resources: [
              {
                title: "Riverpod documentation",
                url: "https://riverpod.dev/",
                kind: "docs",
              },
              {
                title: "flutter_riverpod package",
                url: "https://pub.dev/packages/flutter_riverpod",
                kind: "docs",
              },
              {
                title: "State management options",
                url: "https://docs.flutter.dev/data-and-backend/state-mgmt/options",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "bloc",
          "Business rules inside a `BlocBuilder` recreate the state machine in the widget layer and make it impossible to test without a tree.",
          [
            "Events, states and `emit`",
            "`BlocProvider` and `BlocBuilder`",
            "`BlocListener` for side effects",
            "`Cubit` versus `Bloc` ceremony",
          ],
          "Implement a login flow as a Bloc with four states, write a `bloc_test` for the failure path, and paste the emitted state sequence.",
          {
            summary:
              "Bloc separates events from states: a `Bloc` receives events, runs asynchronous handlers and emits immutable states that widgets render through `BlocBuilder` or react to through `BlocListener`. `Cubit` keeps the same state contract without events, lowering ceremony for simple transitions. The cost is a class and state type per feature, which is heavy for a single boolean.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Emitting a state equal to the current one; Bloc compares with `==` and drops the emission, so include the changed field or use a new state class.",
              "Running navigation from `BlocBuilder`; the builder can run on every rebuild, so move one-off side effects to `BlocListener`.",
              "Creating a Bloc inside `build`; each rebuild creates a new state machine and loses in-flight progress, so provide it above the route.",
            ],
            resources: [
              {
                title: "Bloc documentation",
                url: "https://bloclibrary.dev/",
                kind: "docs",
              },
              {
                title: "flutter_bloc package",
                url: "https://pub.dev/packages/flutter_bloc",
                kind: "docs",
              },
              {
                title: "State management options",
                url: "https://docs.flutter.dev/data-and-backend/state-mgmt/options",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "getx",
          "GetX shortcuts are hard to remove later because a controller found by type or string has no visible dependency at the call site.",
          [
            "Reactive variables with `.obs` and `Obx`",
            "`Get.put` and `Get.find` service location",
            "`GetMaterialApp` routing and bindings",
            "Global state versus scoped state",
          ],
          "Build the same counter with `Obx` and with a `ValueNotifier`, then list which dependencies each version makes explicit at the call site.",
          {
            summary:
              "GetX bundles state, dependency injection and routing behind global calls such as `Get.put`, `Get.find` and `Obx`. The API is compact and quick to write, but it hides context and lifecycle, so tests and larger teams inherit implicit global state.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Calling `Get.find` in a widget without a binding that registered the controller; the failure appears only on a cold route entry.",
              "Assuming `Obx` tracks any object; only GetX reactive types and controller fields are observed, so wrap plain values in `.obs`.",
              "Adopting GetX routing without checking deep links and route observers; the global navigator can bypass analytics and guards.",
            ],
            resources: [
              {
                title: "GetX package",
                url: "https://pub.dev/packages/get",
                kind: "docs",
              },
              {
                title: "State management options",
                url: "https://docs.flutter.dev/data-and-backend/state-mgmt/options",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "valuenotifier",
          "A notifier disposed while a listener remains throws on the next notification, a failure that appears during route transitions.",
          [
            "`ValueNotifier` value equality",
            "`ValueListenableBuilder` rebuild scope",
            "`addListener` and `removeListener`",
            "Disposal and listener lifetime",
          ],
          "Replace `setState` in a form field with a `ValueNotifier<String>` and a `ValueListenableBuilder`, then count rebuilds in the inspector.",
          {
            summary:
              "`ValueNotifier<T>` holds a single value and notifies listeners when a new value is not equal to the old one. `ValueListenableBuilder` rebuilds only its builder for that notifier, which makes it the smallest state primitive Flutter provides for local state. The cost is one value with no history, async error channel or scoped lookup, so it does not replace an app-level store.",
            difficulty: "foundation",
            minutes: 40,
            pitfalls: [
              "Assuming a new list with equal elements notifies; `ValueNotifier` compares with `==` and lists use identity equality, so replace the value deliberately.",
              "Disposing a notifier that a child still listens to; remove the listener first or let the owning widget outlive the child.",
              "Using one notifier for unrelated fields; every listener rebuilds for every change, so split notifiers by update frequency.",
            ],
            resources: [
              {
                title: "ValueListenableBuilder class",
                url: "https://api.flutter.dev/flutter/widgets/ValueListenableBuilder-class.html",
                kind: "docs",
              },
              {
                title: "Flutter fundamentals: state management",
                url: "https://docs.flutter.dev/get-started/fundamentals/state-management",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "navigation-and-motion",
      title: "Navigation, animation and assets",
      description:
        "Make movement and content feel intentional. You will build a controlled animation, a shared-element route transition and an asset pipeline that works in release builds.",
      topics: [
        topic(
          "animations",
          "Choosing an implicit animation for a gesture-driven transition leaves no way to reverse or interrupt it mid-flight.",
          [
            "`Animation`, `Tween` and `AnimationController` roles",
            "Implicit versus explicit animations",
            "Ticker providers and frame callbacks",
            "60 Hz and 120 Hz frame budgets",
          ],
          "Run an `AnimatedContainer` and an `AnimationController` side by side, capture both in DevTools, and compare their build counts and frame times.",
          {
            summary:
              "Flutter animations are values driven over time: an `Animation` produces a sequence of numbers, a `Tween` maps them to a property range and the framework rebuilds or repaints when the value changes. Implicit animations package that machinery in widgets such as `AnimatedContainer`, while explicit animations expose the controller.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Animating layout properties such as width inside a large tree; layout runs each frame, so prefer transforms when the visual result allows it.",
              "Creating an `AnimationController` without a `TickerProvider`; mix in `SingleTickerProviderStateMixin` and dispose the controller.",
              "Ignoring `MediaQuery.disableAnimations`; users who request reduced motion still receive full transitions unless the widget checks it.",
            ],
            resources: [
              {
                title: "Animations in Flutter",
                url: "https://docs.flutter.dev/ui/animations",
                kind: "docs",
              },
              {
                title: "Animation tutorial",
                url: "https://docs.flutter.dev/ui/animations/tutorial",
                kind: "docs",
              },
              {
                title: "Animation class",
                url: "https://api.flutter.dev/flutter/animation/Animation-class.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "animation-controller",
          "A controller that is never disposed keeps its ticker alive, burns battery and trips the debug ticker leak assertion.",
          [
            "Duration, bounds and value range",
            "`forward`, `reverse` and `animateTo`",
            "`TickerProvider` and vsync",
            "`AnimationStatus` listeners",
          ],
          "Build a controller-driven progress ring, log every `AnimationStatus` transition, and verify in DevTools that no ticker runs after disposal.",
          {
            summary:
              "`AnimationController` produces values from 0.0 to 1.0 over a duration, with `forward`, `reverse`, `repeat` and `stop` controlling playback. It needs a `TickerProvider`, emits a new value on every frame and must be disposed with the widget that owns it.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Creating the controller in `build`; it restarts on every rebuild and the previous ticker leaks, so create it in `initState`.",
              "Calling `forward` without checking `isAnimating`; repeated taps restart or fight the current animation, so branch on status.",
              "Using `repeat` and forgetting to stop it on dispose; the ticker keeps scheduling frames after the route is gone.",
            ],
            resources: [
              {
                title: "AnimationController class",
                url: "https://api.flutter.dev/flutter/animation/AnimationController-class.html",
                kind: "docs",
              },
              {
                title: "Animation tutorial",
                url: "https://docs.flutter.dev/ui/animations/tutorial",
                kind: "docs",
              },
              {
                title: "Animations in Flutter",
                url: "https://docs.flutter.dev/ui/animations",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "curved-animation",
          "Linear motion reads as mechanical, and a curve is the difference between a transition that feels designed and one that feels unfinished.",
          [
            "`Curve.transform` and eased progress",
            "`Curves.easeInOut` and overshoot curves",
            "`Interval` and staggered timing",
            "`CurveTween` and animation composition",
          ],
          "Animate the same box with `Curves.linear` and `Curves.easeOutBack`, capture both, and compare the position at 300 ms.",
          {
            summary:
              "`CurvedAnimation` applies a `Curve` to another animation, remapping progress without changing the controller's duration. Curves shape acceleration and overshoot, and `Interval` composes sub-ranges so one controller can drive a staggered sequence.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Applying a curve only on the forward pass; the reverse motion snaps unless `reverseCurve` is set or the curve is symmetric.",
              "Using an overshoot curve for a value with hard bounds; clamp the mapped value or choose a curve that stays in range.",
              "Stacking several curves without checking the composition; keep one curve per property so the motion remains explainable.",
            ],
            resources: [
              {
                title: "CurvedAnimation class",
                url: "https://api.flutter.dev/flutter/animation/CurvedAnimation-class.html",
                kind: "docs",
              },
              {
                title: "Curve class",
                url: "https://api.flutter.dev/flutter/animation/Curve-class.html",
                kind: "docs",
              },
              {
                title: "Animations in Flutter",
                url: "https://docs.flutter.dev/ui/animations",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "hero",
          "A duplicate hero tag throws only when both routes are on screen, a state that single-route tests never exercise.",
          [
            "Hero tags and route transitions",
            "Flight shuttle and overlay",
            "`createRectTween` for custom paths",
            "Tag uniqueness per route",
          ],
          "Build a thumbnail-to-detail hero transition, add a widget test that pumps both routes, and paste the failure produced by a duplicate tag.",
          {
            summary:
              "`Hero` animates a widget from one route to another by matching tags and flying a copy through an overlay while the routes transition. The framework measures the source and destination boxes, so the shared widget must exist in both trees and cannot share its tag with another hero on the same route.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Reusing the same hero tag twice on one route; Flutter throws during the transition, so make tags unique per item.",
              "Wrapping a hero in a widget that changes size between routes; the flight interpolates between mismatched boxes and visibly jumps.",
              "Putting stateful content inside a hero; the shuttle builds a new copy, so the original state is not shared across the transition.",
            ],
            resources: [
              {
                title: "Hero animations",
                url: "https://docs.flutter.dev/ui/animations/hero-animations",
                kind: "docs",
              },
              {
                title: "Hero class",
                url: "https://api.flutter.dev/flutter/widgets/Hero-class.html",
                kind: "docs",
              },
              {
                title: "Animations in Flutter",
                url: "https://docs.flutter.dev/ui/animations",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "opacity",
          "Wrapping every row in an `Opacity` widget adds layers and raster work that a single fade above the list would avoid.",
          [
            "`Opacity` and alpha compositing",
            "`AnimatedOpacity` implicit timing",
            "`FadeTransition` with an `Animation<double>`",
            "Layer cost and repaint boundaries",
          ],
          "Fade a 200-row list in with `AnimatedOpacity`, profile the raster thread, then repeat with `FadeTransition` and compare the frame times.",
          {
            summary:
              "`Opacity` composites its child at a given alpha, `AnimatedOpacity` interpolates that alpha over time and `FadeTransition` drives it from an animation. Opacity changes are handled during compositing, but each semi-transparent subtree can require an intermediate buffer, so repeated fades still cost memory and GPU time.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Using `Opacity(opacity: 0)` to hide an interactive widget; it still occupies layout and can receive hit tests, so remove it or use `Visibility`.",
              "Animating opacity on every list row; group the fade above the list so the compositor handles one layer instead of hundreds.",
              "Assuming opacity is free on the raster thread; each composited layer consumes memory and GPU time, so measure before wrapping large subtrees.",
            ],
            resources: [
              {
                title: "Opacity class",
                url: "https://api.flutter.dev/flutter/widgets/Opacity-class.html",
                kind: "docs",
              },
              {
                title: "AnimatedOpacity class",
                url: "https://api.flutter.dev/flutter/widgets/AnimatedOpacity-class.html",
                kind: "docs",
              },
              {
                title: "Fade a widget in and out",
                url: "https://docs.flutter.dev/cookbook/animation/opacity-animation",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "working-with-assets",
          "An asset that loads in debug but not release usually means a stale bundle or a path outside the declared directory.",
          [
            "`pubspec.yaml` asset declarations",
            "Asset variants and resolution",
            "`rootBundle` and `AssetBundle`",
            "Release bundle contents and size",
          ],
          "Add one image and one JSON file to `assets/`, load both with `rootBundle`, then run `flutter build apk --analyze-size` and record their bytes in the bundle.",
          {
            summary:
              "Assets are files declared under `flutter.assets` in `pubspec.yaml`, bundled into the app and loaded through `AssetBundle` or `rootBundle`. Declarations can name directories or individual files, variants such as `2.0x` are resolved at runtime, and a missing path fails when the app runs rather than when it builds.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Declaring a path with a backslash or a leading slash; pubspec paths are relative and use forward slashes, so the bundle misses the file.",
              "Editing an asset and expecting hot reload to pick it up; the bundle is produced at build time, so perform a full restart or rebuild.",
              "Bundling a large asset used by one screen; every install pays the size, so ship it as a download or a deferred resource.",
            ],
            resources: [
              {
                title: "Assets and images",
                url: "https://docs.flutter.dev/ui/assets/assets-and-images",
                kind: "docs",
              },
              {
                title: "AssetBundle class",
                url: "https://api.flutter.dev/flutter/services/AssetBundle-class.html",
                kind: "docs",
              },
              {
                title: "DevTools app size tool",
                url: "https://docs.flutter.dev/tools/devtools/app-size",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "data-and-platform",
      title: "Data, APIs and the platform",
      description:
        "Connect the app to real data and real devices. You will call and cache an HTTP API, persist structured data, stream updates and explain the platform boundary for files, databases and network clients.",
      topics: [
        topic(
          "restful-apis",
          "Retrying a non-idempotent POST after a timeout can create duplicate orders, a failure mode invisible in the happy path.",
          [
            "Resources, methods and status codes",
            "Idempotency keys and safe retries",
            "`ETag`, `Cache-Control` and conditional requests",
            "Cursor pagination and problem details",
          ],
          "Call a public REST API, inspect status and caching headers with `curl -i`, then implement one retry that is allowed for a GET and refused for a POST.",
          {
            summary:
              "REST models resources with stable URLs and uses HTTP methods, status codes and representations to describe operations. Idempotency, caching headers and pagination are part of the contract, and a mobile client must handle partial failure and offline states that a browser rarely sees.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Retrying every failed request; only idempotent methods or requests with an idempotency key are safe to repeat.",
              "Parsing a 200 response without checking the content type; an HTML error page then decodes as a malformed map.",
              "Ignoring `Retry-After` and backing off on the client's own schedule; the server already named the earliest safe retry time.",
            ],
            resources: [
              {
                title: "Networking in Flutter",
                url: "https://docs.flutter.dev/data-and-backend/networking",
                kind: "docs",
              },
              {
                title:
                  "Architectural styles and the design of network-based software architectures",
                url: "https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm",
                kind: "paper",
              },
              {
                title: "Fetch data from the internet",
                url: "https://docs.flutter.dev/cookbook/networking/fetch-data",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "working-with-apis",
          "Without a typed API layer, every widget repeats status checks and JSON casts, and one malformed response crashes a screen.",
          [
            "`http.Client` and request lifecycle",
            "Timeouts and cancellation",
            "Status code to domain error mapping",
            "Typed repository boundaries",
          ],
          "Build a repository that fetches a list, maps 401 to a typed error and times out after five seconds; test all three paths with a mock client.",
          {
            summary:
              "A Flutter client turns HTTP responses into typed models at the boundary, with timeouts, status checks and error mapping before data reaches widgets. The `http` package provides a small client, while `dio` or a generated client adds interceptors, retries and cancellation.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Creating a new `http.Client` for every request; connection pools and TLS sessions are lost, so reuse one client and close it with the owner.",
              "Leaving out a timeout; a stalled connection keeps the loading state forever, so set a request timeout and map it to a retryable error.",
              "Parsing JSON inside a widget; keep decoding and validation in the repository so the UI receives typed data or a typed error.",
            ],
            resources: [
              {
                title: "Networking in Flutter",
                url: "https://docs.flutter.dev/data-and-backend/networking",
                kind: "docs",
              },
              {
                title: "http package",
                url: "https://pub.dev/packages/http",
                kind: "docs",
              },
              {
                title: "Fetch data from the internet",
                url: "https://docs.flutter.dev/cookbook/networking/fetch-data",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "web-sockets",
          "A socket without reconnect logic silently stops updating after a network change, and users see stale data with no error.",
          [
            "HTTP upgrade and RFC 6455 frames",
            "`WebSocketChannel` stream and sink",
            "Ping and pong heartbeats",
            "Reconnect with jittered backoff",
          ],
          "Connect to a public echo server, send one message, then disable the network and implement a reconnect that logs each attempt and delay.",
          {
            summary:
              "A WebSocket upgrades an HTTP connection into a full-duplex message stream, which suits chat, live prices and collaborative state. In Flutter, `WebSocketChannel` exposes a stream and a sink, so reconnect, heartbeat and backpressure policy remain the client's responsibility.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Relying on the TCP connection staying open; mobile networks change, so detect close and reconnect with jittered backoff.",
              "Buffering every outbound message during a disconnect without a bound; the queue grows until the process is killed, so cap or drop by policy.",
              "Assuming message boundaries survive an app restart; use sequence numbers or resume tokens when state must be recovered.",
            ],
            resources: [
              {
                title: "Work with WebSockets",
                url: "https://docs.flutter.dev/cookbook/networking/web-sockets",
                kind: "docs",
              },
              {
                title: "RFC 6455: The WebSocket Protocol",
                url: "https://datatracker.ietf.org/doc/html/rfc6455",
                kind: "spec",
              },
              {
                title: "web_socket_channel package",
                url: "https://pub.dev/packages/web_socket_channel",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "storage",
          "Storing structured records in a preferences file makes every query a full parse and every write a race.",
          [
            "Key-value, file and relational storage",
            "Documents versus cache directories",
            "Schema migrations and versioning",
            "Encryption and platform keychains",
          ],
          "Store the same 1,000 records in shared preferences and in a file, measure load time and size, and record which one supports random access without parsing the whole payload.",
          {
            summary:
              "Local storage ranges from key-value preferences to files and relational databases, each with different durability, query and migration behavior. The choice depends on data size, query shape and whether the data must survive an app update, not on which plugin is easiest to call.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Using shared preferences for large or structured data; it loads the whole map and has no query engine, so move to a file or SQLite.",
              "Writing user-created data to the cache directory; the OS can evict it, so use the documents directory and a backup policy.",
              "Shipping a schema change without a migration; existing installs crash or lose rows, so version the format and test an upgrade.",
            ],
            resources: [
              {
                title: "Data and backend persistence",
                url: "https://docs.flutter.dev/data-and-backend/persistence",
                kind: "docs",
              },
              {
                title: "path_provider package",
                url: "https://pub.dev/packages/path_provider",
                kind: "docs",
              },
              {
                title: "Read and write files",
                url: "https://docs.flutter.dev/cookbook/persistence/reading-writing-files",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "sqlite",
          "A missing index turns a local search into a full table scan, and a schema version bump without an upgrade path breaks existing installs.",
          [
            "Databases, tables and typed columns",
            "`sqflite` versioning and `onUpgrade`",
            "Transactions and batch inserts",
            "Indexes and query plans",
          ],
          "Create a two-table database with one index, insert 10,000 rows in a transaction, and compare query time with and without the index using `EXPLAIN QUERY PLAN`.",
          {
            summary:
              "SQLite is an embedded relational database: the `sqflite` plugin opens a file, runs SQL and returns rows as maps. Transactions, indexes and migrations make it suitable for offline-first data, but queries still need bounds and the schema needs an explicit upgrade path.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Running each insert as its own transaction; wrap bulk writes in a batch or transaction so the database does not fsync thousands of times.",
              "Bumping the schema version without an `onUpgrade` path; existing databases keep old columns and queries fail after an update.",
              "Concatenating user input into SQL; use positional parameters so values cannot change the statement.",
            ],
            resources: [
              {
                title: "SQLite in Flutter",
                url: "https://docs.flutter.dev/cookbook/persistence/sqlite",
                kind: "docs",
              },
              {
                title: "sqflite package",
                url: "https://pub.dev/packages/sqflite",
                kind: "docs",
              },
              {
                title: "SQLite SQL language",
                url: "https://www.sqlite.org/lang.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "shared-preferences",
          "A settings write that is not awaited can be lost when the process is killed immediately after the user toggles it.",
          [
            "Primitive values, keys and namespaces",
            "Asynchronous loading and caching",
            "`SharedPreferences.setMockInitialValues`",
            "Migration to `SharedPreferencesAsync`",
          ],
          "Persist a theme choice, restart the app, and verify the value survives; then write a test using `SharedPreferences.setMockInitialValues`.",
          {
            summary:
              "`SharedPreferences` stores a small map of primitive values in platform preferences and loads the map asynchronously on first access. It fits flags, onboarding state and last-selected tabs, not records that need queries, transactions or partial updates.",
            difficulty: "foundation",
            minutes: 35,
            pitfalls: [
              "Encoding a list of objects into one string; every update rewrites the whole value and concurrent writers lose changes.",
              "Reading preferences before `WidgetsFlutterBinding.ensureInitialized`; the platform channel is not ready, so initialize the binding first.",
              "Assuming a write is durable immediately; await the setter and handle a failed platform write instead of ignoring the future.",
            ],
            resources: [
              {
                title: "Store key-value data on disk",
                url: "https://docs.flutter.dev/cookbook/persistence/key-value",
                kind: "docs",
              },
              {
                title: "shared_preferences package",
                url: "https://pub.dev/packages/shared_preferences",
                kind: "docs",
              },
              {
                title: "Data and backend persistence",
                url: "https://docs.flutter.dev/data-and-backend/persistence",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "tooling-and-testing",
      title: "Tooling and testing",
      description:
        "Make the app observable and testable. You will use the Flutter CLI, DevTools and the inspector, then write unit and widget tests that fail for the right reason.",
      topics: [
        topic(
          "flutter-cli",
          "Most Flutter environment failures are a doctor mismatch or a stale build directory, and the CLI reports both before the IDE does.",
          [
            "`flutter create`, `run`, `test` and `analyze`",
            "Device selection with `flutter devices`",
            "`flutter pub` and dependency resolution",
            "`--dart-define` and build flavors",
          ],
          "Create a project, run `flutter doctor -v`, `flutter devices` and `flutter build apk --debug`, and paste the key output lines from each command.",
          {
            summary:
              "The `flutter` command drives project creation, device selection, running, testing, analysis, dependency resolution and release builds. Subcommands share flags such as `--verbose`, `--device-id` and `--dart-define`, and `flutter doctor` diagnoses the toolchain before a build fails inside Gradle or Xcode.",
            difficulty: "foundation",
            minutes: 45,
            pitfalls: [
              "Running `flutter clean` as the first response to every error; it deletes build caches and hides the failing step, so read the verbose log first.",
              "Editing generated platform files without checking the regeneration rules; the next build can overwrite the change.",
              "Using the IDE run button without reading the CLI command it wraps; flags such as `--dart-define` are then silently missing.",
            ],
            resources: [
              {
                title: "Flutter CLI reference",
                url: "https://docs.flutter.dev/reference/flutter-cli",
                kind: "docs",
              },
              {
                title: "Install Flutter",
                url: "https://docs.flutter.dev/get-started/install",
                kind: "docs",
              },
              {
                title: "dart pub commands",
                url: "https://dart.dev/tools/pub/cmd",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "dev-tools",
          "Without a timeline, performance work becomes guesswork about which phase or thread spent the frame budget.",
          [
            "VM service and DevTools connection",
            "Performance timeline and frame chart",
            "CPU profiler sampling",
            "Memory, network and logging views",
          ],
          "Run a profile build, open DevTools, record a five-second timeline while scrolling, and paste the slowest frame's UI and raster times.",
          {
            summary:
              "Flutter DevTools is a browser-based suite attached to a running app: inspector, performance timeline, CPU profiler, memory, network and logging views. It talks to the VM service, so it can inspect a debug build without changing application code.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Profiling a debug build and treating the numbers as release performance; debug adds assertions and disables optimizations, so measure a profile build.",
              "Recording a timeline without a repeatable interaction; compare runs only when the input and device state are identical.",
              "Leaving the DevTools port exposed on a shared network; the VM service grants code execution, so bind it to localhost.",
            ],
            resources: [
              {
                title: "Flutter DevTools",
                url: "https://docs.flutter.dev/tools/devtools",
                kind: "docs",
              },
              {
                title: "DevTools performance view",
                url: "https://docs.flutter.dev/tools/devtools/performance",
                kind: "docs",
              },
              {
                title: "DevTools CPU profiler",
                url: "https://docs.flutter.dev/tools/devtools/cpu-profiler",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "flutter-inspector",
          "Reading an overflow error without the constraints that caused it leads to stacking wrappers until the symptom disappears.",
          [
            "Widget tree versus render tree views",
            "Select widget mode and source links",
            "Constraints and size overlays",
            "Repaint rainbow and debug flags",
          ],
          "Trigger a `RenderFlex overflowed` error, open the inspector's constraints view, and name the exact row, width and child that exceeded the bound.",
          {
            summary:
              "The inspector shows the widget tree with source locations, render object sizes and layout constraints, and can select a widget directly on the device. It exposes the widget and render trees separately, which is how you tell a rebuild problem from a layout or paint problem.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Adding `Expanded` around every overflow; the wrapper hides an unbounded parent and can squeeze the wrong child, so fix the constraint at its source.",
              "Inspecting a release build; the inspector and debug paint flags require a debug build with the VM service available.",
              "Using the widget tree to diagnose paint cost; sizes and layers live in the render tree and the performance timeline.",
            ],
            resources: [
              {
                title: "Using the Flutter Inspector",
                url: "https://docs.flutter.dev/tools/devtools/inspector",
                kind: "docs",
              },
              {
                title: "WidgetInspector class",
                url: "https://api.flutter.dev/flutter/widgets/WidgetInspector-class.html",
                kind: "docs",
              },
              {
                title: "Flutter DevTools",
                url: "https://docs.flutter.dev/tools/devtools",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "testing",
          "A suite of only integration tests takes minutes to run and fails for environment reasons unrelated to the code change.",
          [
            "Unit, widget and integration test boundaries",
            "Test binding and fake async",
            "Test doubles at repository boundaries",
            "Golden tests and platform fonts",
          ],
          "Write a unit test and a widget test for the same counter feature, run both, and record each layer's wall-clock time; note what only an integration test could catch.",
          {
            summary:
              "Flutter testing has three layers: unit tests for pure Dart, widget tests for a single tree in a test binding, and integration tests on a device or emulator. Each layer trades speed for fidelity, and a healthy suite puts most assertions in the fastest layer that can still catch the failure.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Testing private implementation details; the test breaks on refactors that do not change behavior, so assert on observable outputs.",
              "Using `pumpAndSettle` with an infinite animation; it times out, so pump fixed durations until the expected frame.",
              "Relying on the host machine's fonts for goldens; CI renders different glyphs, so bundle test fonts and lock the surface size.",
            ],
            resources: [
              {
                title: "Testing overview",
                url: "https://docs.flutter.dev/testing/overview",
                kind: "docs",
              },
              {
                title: "Testing in Flutter",
                url: "https://docs.flutter.dev/testing",
                kind: "docs",
              },
              {
                title: "flutter_test library",
                url: "https://api.flutter.dev/flutter/flutter_test/flutter_test-library.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "unit-testing",
          "Business rules buried in widgets cannot be tested without building a tree, which makes edge cases expensive to cover.",
          [
            "Arrange-act-assert structure",
            "`test` and `group` functions",
            "Fakes at dependency boundaries",
            "Async tests and `expectLater`",
          ],
          "Test a price calculator with three cases, including a negative quantity and a rounding boundary, then run `flutter test --coverage` and inspect the report.",
          {
            summary:
              "A unit test exercises a function, class or repository in isolation under the Dart VM, using `test` and `expect` from `package:test`. Dependencies enter through constructor parameters or fakes, and `setUp` and `tearDown` keep per-test state from leaking.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Sharing a mutable fixture across tests; order-dependent failures appear only in the full suite, so build fresh state per test.",
              "Asserting on a `Future` without awaiting it; the test passes before the expectation runs, so use `await expectLater`.",
              "Mocking value objects; construct real values so the test checks behavior instead of interaction bookkeeping.",
            ],
            resources: [
              {
                title: "An introduction to unit testing",
                url: "https://docs.flutter.dev/cookbook/testing/unit/introduction",
                kind: "docs",
              },
              {
                title: "test package",
                url: "https://pub.dev/packages/test",
                kind: "docs",
              },
              {
                title: "Testing overview",
                url: "https://docs.flutter.dev/testing/overview",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "widget-testing",
          "Widget tests catch layout, semantics and state-transition bugs in milliseconds, long before a device build would.",
          [
            "`WidgetTester` and `pumpWidget`",
            "Finders by text, type and key",
            "`pump` versus `pumpAndSettle`",
            "Test surface size and pixel ratio",
          ],
          "Test a login form: enter invalid text, tap submit, assert the error text, then set a 320x640 surface and confirm no overflow.",
          {
            summary:
              "A widget test pumps a widget into a `WidgetTester`, drives it with taps and text entry, and asserts against the rendered tree. The test binding replaces the real clock and platform channels, so animations need explicit pumps and network calls need fakes.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Finding a widget by text that also appears in a tooltip or error; use a `Key` or a scoped finder so the assertion names one node.",
              "Calling `pumpAndSettle` on a screen with a looping animation; it times out, so pump fixed durations until the expected frame.",
              "Ignoring the default 800x600 test surface; layout can pass there and overflow on a phone, so set the size explicitly.",
            ],
            resources: [
              {
                title: "An introduction to widget testing",
                url: "https://docs.flutter.dev/cookbook/testing/widget/introduction",
                kind: "docs",
              },
              {
                title: "WidgetTester class",
                url: "https://api.flutter.dev/flutter/flutter_test/WidgetTester-class.html",
                kind: "docs",
              },
              {
                title: "flutter_test library",
                url: "https://api.flutter.dev/flutter/flutter_test/flutter_test-library.html",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "release-and-operations",
      title: "Release and operations",
      description:
        "Ship to stores without surprises. You will build signed artifacts, automate a pipeline, stage a release and walk both store submission paths from version number to review.",
      topics: [
        topic(
          "integration-testing",
          "A widget test cannot prove that a platform channel works, and that is exactly where release-only failures hide.",
          [
            "`IntegrationTestWidgetsFlutterBinding`",
            "Driver extension and `flutter drive`",
            "Real device versus emulator coverage",
            "Test seams for auth and network",
          ],
          "Write one integration test that completes onboarding and asserts the home screen, run it with `flutter test integration_test`, then relaunch the app and verify the persisted flag; paste the pass log and the relaunch observation.",
          {
            summary:
              "Integration tests run the real app on a device or emulator through `integration_test` and the Flutter driver extension, so they exercise platform channels, navigation and persistence together. They are slower and less stable than widget tests, which is why they cover a small number of end-to-end flows.",
            difficulty: "advanced",
            minutes: 65,
            pitfalls: [
              "Depending on a live backend in every run; stub the boundary or use a dedicated test account that resets its state.",
              "Using arbitrary `pump` durations for real network latency; wait on a finder with a timeout instead of guessing frames.",
              "Running the suite on one platform and calling it coverage; Android and iOS platform channels differ, so test the boundary on both.",
            ],
            resources: [
              {
                title: "Integration testing",
                url: "https://docs.flutter.dev/testing/integration-tests",
                kind: "docs",
              },
              {
                title: "integration_test package",
                url: "https://pub.dev/packages/integration_test",
                kind: "docs",
              },
              {
                title: "Testing overview",
                url: "https://docs.flutter.dev/testing/overview",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "ci--cd",
          "An unpinned Flutter version makes yesterday's green build fail today without a code change.",
          [
            "Pinned SDK versions and FVM",
            "Dependency and build caches",
            "Analyze and test gates",
            "Signed artifacts and secret injection",
          ],
          "Write a CI workflow that pins Flutter, runs `flutter analyze` and `flutter test`, and uploads an APK; introduce a lint error and confirm the job fails.",
          {
            summary:
              "A mobile CI pipeline restores a pinned Flutter version, resolves packages, analyzes, runs tests and produces signed artifacts in a reproducible order. Caching the pub store and Gradle caches cuts minutes, while signing secrets stay in the CI secret store and never enter the repository.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Following `flutter channel stable` without a version; pin a release tag or FVM version so the toolchain changes only when reviewed.",
              "Caching the entire build directory; stale artifacts and absolute paths produce nondeterministic failures, so cache dependency stores instead.",
              "Printing signing secrets in logs; mask them and inject them through the CI secret store for the release job only.",
            ],
            resources: [
              {
                title: "Continuous delivery with Flutter",
                url: "https://docs.flutter.dev/deployment/cd",
                kind: "docs",
              },
              {
                title: "GitHub Actions documentation",
                url: "https://docs.github.com/en/actions",
                kind: "docs",
              },
              {
                title: "Flutter CLI reference",
                url: "https://docs.flutter.dev/reference/flutter-cli",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "deployment",
          "A debug signing key or a missing architecture produces a build that installs locally and is rejected by the store.",
          [
            "Version name and build number",
            "Release signing and key custody",
            "App bundle versus universal APK",
            "Obfuscation and symbol files",
          ],
          "Build a signed release with `flutter build appbundle --release`, inspect it with `bundletool`, and record the version code and supported ABIs.",
          {
            summary:
              "Deployment prepares a release artifact with the right version, signing identity, obfuscation and target architecture, then distributes it to a store or test track. Android uses an app bundle or APK with a keystore; iOS uses an archive with provisioning profiles and an App Store Connect record.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Changing the application ID after the first release; stores treat it as a different app, so fix the identifier before uploading.",
              "Losing the Android keystore or iOS distribution certificate; back up keys and keep release custody in CI, not on one laptop.",
              "Shipping without uploading native debug symbols; crash reports arrive unsymbolized and cannot be triaged.",
            ],
            resources: [
              {
                title: "Build and release an Android app",
                url: "https://docs.flutter.dev/deployment/android",
                kind: "docs",
              },
              {
                title: "Build and release an iOS app",
                url: "https://docs.flutter.dev/deployment/ios",
                kind: "docs",
              },
              {
                title: "Continuous delivery with Flutter",
                url: "https://docs.flutter.dev/deployment/cd",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "fastlane",
          "Manual store uploads drift in metadata and screenshots, and the release step becomes a person instead of a repeatable command.",
          [
            "`Fastfile` lanes and actions",
            "`supply` and `deliver` upload actions",
            "`match` and code-signing storage",
            "Metadata and screenshot versioning",
          ],
          "Add a `beta` lane that uploads an AAB to the Play internal track, run it against a test app, and paste the lane output.",
          {
            title: "Fastlane",
            summary:
              "Fastlane automates store metadata, screenshots, code signing and uploads through lanes defined in a `Fastfile`. In Flutter projects it runs after `flutter build`, taking the artifact and driving `supply` for Google Play or `deliver` for App Store Connect.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Committing the `fastlane` report or credentials directory; secrets and transient reports belong outside version control.",
              "Hard-coding a version in the `Fastfile`; derive it from `pubspec.yaml` so the store, the artifact and the app agree.",
              "Running `supply` with a service account that lacks permission for the target track; the upload fails after the build has already spent its time.",
            ],
            resources: [
              {
                title: "Fastlane documentation",
                url: "https://docs.fastlane.tools/",
                kind: "docs",
              },
              {
                title: "Fastlane actions",
                url: "https://docs.fastlane.tools/actions/",
                kind: "docs",
              },
              {
                title: "Continuous delivery with Flutter",
                url: "https://docs.flutter.dev/deployment/cd",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "playstore",
          "A version code that does not increase is rejected at upload, wasting a release window after the build is already done.",
          [
            "Application ID and version code monotonicity",
            "Internal, closed and open testing tracks",
            "App bundle and Play App Signing",
            "Target API level and staged rollout",
          ],
          "Create a Play Console internal test release, upload a signed AAB, add one tester, and record the install link and release status.",
          {
            title: "Google Play",
            summary:
              "Google Play distributes Android releases through an app bundle, an internal or closed testing track and a staged production rollout. The console enforces a package name, a monotonically increasing version code, a target SDK level and policy declarations before an update can reach users.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Uploading a new AAB with the same version code; Play rejects it, so increment the build number in `pubspec.yaml` for every upload.",
              "Ignoring the target API level deadline; the console blocks updates until the target SDK is raised, so schedule it before the deadline.",
              "Using a personal keystore without Play App Signing; losing it can permanently block updates, so enroll in Play App Signing and back up the upload key.",
            ],
            resources: [
              {
                title: "Build and release an Android app",
                url: "https://docs.flutter.dev/deployment/android",
                kind: "docs",
              },
              {
                title: "Publish your app",
                url: "https://developer.android.com/studio/publish",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "appstore",
          "App Review rejects builds for missing privacy disclosures or a broken demo account, and each rejection costs a review cycle.",
          [
            "Bundle identifier and build number",
            "Certificates and provisioning profiles",
            "TestFlight internal and external testing",
            "Privacy manifest and data collection",
          ],
          "Archive a release with `flutter build ipa`, upload it to TestFlight, fill the privacy questionnaire, and record the build's processing status.",
          {
            title: "App Store",
            summary:
              "The App Store distributes iOS builds through App Store Connect, TestFlight and a review process that checks metadata, privacy and platform rules. A release needs a distribution certificate, a provisioning profile, an archive with an incremented build number and a privacy manifest that matches the app's data use.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Reusing a build number for a new upload; App Store Connect rejects duplicates, so increment it for every upload.",
              "Submitting without a working demo account; reviewers cannot pass the login screen and reject the build, so provide credentials and test them.",
              "Declaring no data collection while an analytics SDK collects identifiers; the privacy manifest and questionnaire must match actual behavior.",
            ],
            resources: [
              {
                title: "Build and release an iOS app",
                url: "https://docs.flutter.dev/deployment/ios",
                kind: "docs",
              },
              {
                title: "App Store Review Guidelines",
                url: "https://developer.apple.com/app-store/review/guidelines/",
                kind: "docs",
              },
              {
                title: "App Store Connect",
                url: "https://developer.apple.com/app-store-connect/",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
  ],
};
