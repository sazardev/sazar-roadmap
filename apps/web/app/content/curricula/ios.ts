import type { Curriculum } from "../types";
import { topic } from "../types";

export const ios: Curriculum = {
  slug: "ios",
  title: "iOS Engineering",
  tagline: "Swift, SwiftUI and the platform, from first view to App Store.",
  description:
    "A guided path through modern iOS: Swift and its concurrency model, Xcode and project structure, SwiftUI state and navigation, UIKit where it still matters, networking and persistence, accessibility and performance, then a signed App Store release. Every stage ends with a running app or a measured trace.",
  level: "intermediate",
  icon: "apple",
  estimatedHours: 78,
  stages: [
    {
      slug: "swift-foundations",
      title: "Swift foundations",
      description:
        "Learn the language and the platform it runs on. By the end you can write a small Swift program, explain value versus reference semantics and build it from the command line.",
      topics: [
        topic(
          "pick-a-language",
          "Choosing Swift for a new target while ignoring an Objective-C dependency's nullability annotations creates avoidable bridging defects.",
          [
            "Swift and Objective-C interop boundaries",
            "Bridging headers and module maps",
            "Nullability annotations and lightweight generics",
            "Swift 6 language mode availability",
          ],
          "Create a Swift package with a C target that exposes one function, call it from Swift, and run `swift test`; record the imported type signatures.",
          {
            summary:
              "Swift is the default language for new iOS apps. Objective-C remains in older codebases and in C and Objective-C APIs that Swift imports through a bridging header. The choice affects tooling, runtime behavior, interoperability cost and how much of the modern concurrency model is available.",
            difficulty: "foundation",
            minutes: 35,
            pitfalls: [
              "Assuming every Objective-C framework imports cleanly: missing nullability makes imported pointers implicitly unwrapped optionals; add `NS_ASSUME_NONNULL_BEGIN` or per-declaration annotations.",
              "Choosing Objective-C for a new app to reuse one library; wrap the library in a Swift package or target instead and keep new code in Swift.",
              "Mixing Swift and Objective-C in a target without a bridging header or generated interface; add the header in build settings and verify the generated Swift interface.",
            ],
          },
        ),
        topic(
          "swift-basics",
          "Skipping optionals and value semantics means the first real API response produces crashes at force unwraps or aliasing bugs.",
          [
            "Optionals and optional binding",
            "Value types versus reference types",
            "Enumerations with associated values",
            "Type inference and explicit annotations",
          ],
          "Write a Swift package that models an API response with an enum and an optional field, then run `swift test` with cases for nil, valid and malformed values.",
          {
            summary:
              "Swift declares constants with `let` and variables with `var`, and its type system distinguishes optionals from non-optional values at compile time. Structs, enums and classes compose the data model, while functions and closures carry behavior. A Swift package and `swift test` can exercise the syntax before an app target exists.",
            difficulty: "foundation",
            minutes: 55,
            pitfalls: [
              "Force-unwrapping a decoded optional because the sample JSON always had the field; use `guard let` or a default and add a test with the field missing.",
              "Using a class for a small model and then mutating it through two references; use a struct and pass copies, or make the shared mutation explicit.",
              "Assuming `String.count` equals UTF-8 byte count; use `utf8.count` when the boundary is bytes and `count` when it is characters.",
            ],
          },
        ),
        topic(
          "history-and-why-swift",
          "Treating Swift as a fixed language leads to code that compiles under an old mode and fails when the project adopts Swift 6 checks.",
          [
            "Swift Evolution proposals and language modes",
            "Objective-C runtime inheritance",
            "Source compatibility versus ABI stability",
            "Annual SDK and toolchain releases",
          ],
          "Create a Swift package with `swift-tools-version: 6.0`, run `swift test`, then switch the language mode to 5 and record the diagnostics that disappear.",
          {
            summary:
              "Swift was announced in 2014 to replace Objective-C while keeping the Cocoa runtime, adding optionals, value types and type inference. It has evolved through annual releases and opt-in language modes rather than a single stable dialect. Each Xcode release ships a compiler, SDK and migration story that projects adopt on their own schedule.",
            difficulty: "foundation",
            minutes: 30,
            pitfalls: [
              "Reading release notes as marketing and missing the language-mode switch; set `SWIFT_VERSION` explicitly per target and test the migration in a branch.",
              "Assuming ABI stability makes every future Swift runtime backward-compatible; check the deployment target and the shipped runtime.",
              "Copying an old tutorial's syntax without checking the proposal status; verify against the current Swift book or the accepted proposal.",
            ],
          },
        ),
        topic(
          "oop",
          "Modelling every entity as a class produces shared mutable state and retain cycles that a struct or protocol would avoid.",
          [
            "Class inheritance and `final`",
            "Protocol composition and extensions",
            "Designated and convenience initializers",
            "Access control and module boundaries",
          ],
          "Model a payment method as a protocol with two struct conformers, add a class only where identity matters, and run `swift test` against both conformers.",
          {
            summary:
              "Swift supports classes with inheritance, structs with value semantics, enums with associated values and protocols for shared behavior. Protocol extensions provide default implementations, while composition usually keeps coupling lower than a deep class hierarchy. Access control and initializer rules decide what a module can see and which invariants hold at construction.",
            difficulty: "foundation",
            minutes: 60,
            pitfalls: [
              "Subclassing a class that has no `required` initializer and then adding stored properties; mark the base initializer `required` or use composition.",
              "Putting behavior in a protocol extension when it needs overrides; declare the requirement in the protocol and implement it in each conformer.",
              "Using `open` for a type that only needs to be public; `open` permits subclassing outside the module and widens the contract.",
            ],
            resources: [
              {
                title: "The Swift Programming Language: Classes and structures",
                url: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/classesandstructures",
                kind: "docs",
              },
              {
                title: "The Swift Programming Language: Inheritance",
                url: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/inheritance",
                kind: "docs",
              },
              {
                title: "The Swift Programming Language: Protocols",
                url: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "core-programming-concepts",
          "Writing an app as a linear script that waits on network calls leads to frozen screens and missed lifecycle transitions.",
          [
            "Main run loop and main-queue serialization",
            "App and scene lifecycle states",
            "Responder chain and event dispatch",
            "Sandbox and process lifetime",
          ],
          "Build a one-view app that logs every `scenePhase` change, run it in the simulator, and capture the running view together with the ordered transitions.",
          {
            summary:
              "An iOS app is an event-driven program: `UIApplicationMain` creates the application object, installs the main run loop and delivers touch, timer and lifecycle events through the responder chain. Work that blocks the main thread stops that loop, so the interface freezes even though the process is alive. The sandbox, memory limits and process lifetime come from the platform rather than the Swift language.",
            difficulty: "foundation",
            minutes: 45,
            pitfalls: [
              "Doing synchronous file or network work in `body` or `viewDidLoad`; move it to a task and keep only state updates on the main actor.",
              "Assuming a backgrounded app keeps running indefinitely; request background time or finish the work before the scene leaves active.",
              "Storing user data in the app bundle; write to Documents, Application Support or Caches under the sandbox.",
            ],
          },
        ),
        topic(
          "latest-swift-version",
          "Leaving a target on Swift 5 mode hides sendability errors that surface only when the app updates its toolchain.",
          [
            "Swift language modes",
            "Strict concurrency checking",
            "Typed throws",
            "Availability and deployment targets",
          ],
          "Create a Swift 6 package, run `swift test`, and fix one strict-concurrency diagnostic; paste the compiler output before and after.",
          {
            summary:
              "Swift releases ship with Xcode each year, and a project selects a language mode independently of the SDK version. Swift 6 mode enables strict concurrency checking, turns many data-race warnings into errors and adds typed throws. Adoption is per target: the compiler, dependencies and deployment target can move at different speeds.",
            difficulty: "foundation",
            minutes: 30,
            pitfalls: [
              "Switching `SWIFT_VERSION` for the whole workspace at once; migrate one target, keep dependencies on their supported mode and measure the error count.",
              "Silencing a sendability error with `@unchecked Sendable`; remove the shared mutable state or isolate it in an actor.",
              "Assuming an SDK API is available at the deployment target; guard new APIs with `if #available` or raise the minimum OS.",
            ],
          },
        ),
      ],
    },
    {
      slug: "swift-language-depth",
      title: "Swift language depth",
      description:
        "Use closures, errors, concurrency and functional composition without fighting the type system. You will replace a callback chain with async/await and fix a retain cycle with a capture list.",
      topics: [
        topic(
          "closures",
          "Ignoring closure capture and escaping rules produces leaks, data races and callbacks that mutate views after they disappear.",
          [
            "Escaping and non-escaping closures",
            "Capture lists and capture semantics",
            "`@Sendable` closure isolation",
            "Trailing closures and shorthand arguments",
          ],
          "Write a Swift package test that stores an escaping closure, verifies it runs after the function returns, and fails when the capture list is removed.",
          {
            summary:
              "A closure is a function value that captures constants and variables from its defining scope. Escaping closures outlive the call that created them, and `@Sendable` closures may cross isolation domains, so the compiler checks what they capture. Trailing-closure syntax and shorthand argument names reduce ceremony but hide capture decisions.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Storing a closure that captures `self` strongly and never releasing it; use `[weak self]` and unwrap inside the closure.",
              "Marking a closure `@Sendable` while it mutates captured state; move the state into an actor or capture an immutable value.",
              "Forgetting `@escaping` on a stored closure parameter; the compiler rejects the assignment, and adding the attribute documents the lifetime.",
            ],
            resources: [
              {
                title: "The Swift Programming Language: Closures",
                url: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/closures",
                kind: "docs",
              },
              {
                title: "Swift documentation: Sendable",
                url: "https://developer.apple.com/documentation/swift/sendable",
                kind: "docs",
              },
              {
                title: "WWDC21: Swift concurrency: Behind the scenes",
                url: "https://developer.apple.com/videos/play/wwdc2021/10254/",
                kind: "video",
              },
            ],
          },
        ),
        topic(
          "capturing-values--memory-mgmt",
          "A retain cycle in a view model or delegate keeps the screen and its data alive after dismissal, so memory grows with every visit.",
          [
            "Strong, weak and unowned references",
            "ARC retain cycles",
            "Closure capture lists",
            "Deinitialization and lifetime",
          ],
          "Build a view model that leaks through a strong closure, record its growing instance count in an Allocations trace, then fix it with `[weak self]` and re-record.",
          {
            summary:
              "ARC inserts retain and release operations at compile time for class instances; structs and enums are copied instead. A closure or parent-child reference can create a cycle that keeps both objects alive after their owners disappear. Capture lists and `weak` or `unowned` references break the cycle, but each changes the lifetime guarantee.",
            difficulty: "core",
            minutes: 65,
            pitfalls: [
              "Using `unowned self` in an escaping closure whose owner may disappear; use `weak self` and guard, or prove the owner outlives the closure.",
              "Holding a delegate strongly; declare the delegate property `weak` and constrain the protocol to `AnyObject`.",
              "Assuming `deinit` runs at a predictable time; ARC releases when the last strong reference goes away, which may be later than the dismissal.",
            ],
          },
        ),
        topic(
          "error-handling",
          "Using optionals and force unwraps for failure loses the cause and makes retries, logging and user-facing recovery impossible.",
          [
            "Thrown errors and `do`/`catch`",
            "Typed throws and error domains",
            "`defer` and cleanup ordering",
            "`Result` at callback boundaries",
          ],
          "Write a Swift package with a function that throws two error cases, test both with `XCTAssertThrowsError`, and verify `defer` runs on each path.",
          {
            summary:
              "Swift models recoverable failures with `throws`, `try` and `do`/`catch`, and the compiler requires callers to handle or propagate them. Errors are values conforming to `Error`, and a typed throws clause declares the exact error type a function emits. `Result` and `defer` cover callback boundaries and cleanup.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Catching every error and returning `nil`; preserve the error or map it to a typed domain error with context.",
              "Using `try?` in a loop that must stop on failure; catch the error and decide whether to retry, skip or abort.",
              "Putting cleanup after a `throw` instead of in `defer`; move the release or file close into `defer` so every path runs it.",
            ],
          },
        ),
        topic(
          "concurrency",
          "Spawning unstructured tasks without cancellation or a lifetime owner leaves work running after the view disappears and hides failures.",
          [
            "Task groups and `async let`",
            "Cooperative cancellation",
            "Actor isolation and `Sendable`",
            "Task priority and inheritance",
          ],
          "Build a task group that downloads three fixtures, cancel the parent midway, and add a test that asserts every child observes cancellation.",
          {
            summary:
              "Swift's structured concurrency starts child tasks inside a scope that cannot outlive its parent: `async let` runs a fixed set of children and `withTaskGroup` runs a dynamic set. Cancellation is cooperative, so long operations must check `Task.isCancelled` or call cancellation-aware APIs. Actors isolate mutable state and `Sendable` marks values that may cross isolation boundaries.",
            difficulty: "advanced",
            minutes: 75,
            pitfalls: [
              "Starting a `Task {}` inside `body`; it restarts on every re-evaluation, so move the work to `.task` or a model method with an owner.",
              "Assuming `Task.cancel()` stops synchronous work instantly; check `Task.isCancelled` between chunks or use cancellable APIs.",
              "Passing a mutable class across actors because it looks immutable; conform it to `Sendable` or convert it to a value type.",
            ],
          },
        ),
        topic(
          "async--await",
          "Calling an async API from a synchronous context with a detached task loses ordering, cancellation and error propagation.",
          [
            "Suspension points and `await`",
            "`Task` versus `.task` lifetime",
            "`@MainActor` isolation",
            "Bridging completion handlers with continuations",
          ],
          "Replace a completion-handler fetch with an `async` function, add a `withCheckedThrowingContinuation` bridge, and run `swift test` for success and failure.",
          {
            summary:
              "An `async` function can suspend at each `await` without blocking its thread, which lets the runtime reuse that thread for other work. `Task` creates an unstructured asynchronous context, while SwiftUI's `.task` ties work to a view's lifetime. `MainActor` is the isolation domain that may touch UIKit and SwiftUI state.",
            difficulty: "core",
            minutes: 65,
            pitfalls: [
              "Using `Task.detached` to call a main-actor API; use `Task {}` or `@MainActor` so isolation is inherited.",
              "Forgetting that `await` can resume on a different thread; return to `@MainActor` before updating UI state.",
              "Wrapping a callback without resuming the continuation on every path; resume exactly once in success and failure branches.",
            ],
          },
        ),
        topic(
          "functional-programming",
          "Writing index-based loops for collection transforms adds off-by-one bugs and obscures whether a failure was dropped.",
          [
            "Map, compactMap, filter and reduce",
            "Function values and composition",
            "Immutability and pure functions",
            "Lazy sequences and cost",
          ],
          "Rewrite an index-based parser with `compactMap` and `reduce`, then run a test that proves the output matches and records peak memory with `XCTMemoryMetric`.",
          {
            summary:
              "Swift's standard library exposes functional transforms such as `map`, `compactMap`, `filter` and `reduce`, and functions are values that can be composed. Immutable structs and pure transforms make state changes easier to test because the output depends only on the input. The style rewards moderation: a long chain can hide cost and error handling.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Using `map` when the transform can fail and then force-unwrapping the result; use `compactMap` or `map` returning `Result`.",
              "Chaining `filter` and `map` over a large collection without measuring; use `lazy` or a single loop when the intermediate arrays dominate.",
              "Hiding side effects inside a `map` closure; keep transforms pure and perform effects in a separate loop or task.",
            ],
          },
        ),
      ],
    },
    {
      slug: "xcode-and-project",
      title: "Xcode and the project",
      description:
        "Understand the tool that turns source into an app. You will create a project, navigate the editor and inspectors, explain targets and schemes, and put it under version control.",
      topics: [
        topic(
          "installing",
          "A mismatched active developer directory makes `swift`, `xcodebuild` and simulator commands disagree about which SDK they target.",
          [
            "Xcode and Command Line Tools",
            "`xcode-select` developer directory",
            "Simulator runtimes and `simctl`",
            "Apple ID and signing team",
          ],
          "Install Xcode, run `xcode-select -p`, `swift --version` and `xcrun simctl list devices available`, then boot a simulator and capture the running app view.",
          {
            summary:
              "Xcode bundles the SDKs, compiler, simulators and Instruments; the Command Line Tools package supplies `swift` and `clang` for command-line builds without the IDE. `xcode-select` points the shell at the active developer directory, and `xcrun simctl` manages simulator runtimes once full Xcode is installed. A working setup also needs an Apple ID and a selected signing team.",
            difficulty: "foundation",
            minutes: 35,
            pitfalls: [
              "Installing only Command Line Tools and then looking for SwiftUI previews; install the full Xcode app for the SDK and simulator.",
              "Leaving `xcode-select` pointed at an old beta; switch it with `sudo xcode-select -s /Applications/Xcode.app` and verify `xcodebuild -version`.",
              "Downloading simulator runtimes ad hoc; manage them in Xcode Settings or with `xcodebuild -downloadPlatform iOS` for reproducible CI.",
            ],
          },
        ),
        topic(
          "xcode",
          "Editing a build setting at the wrong level creates a value that looks correct in the UI but is overridden for the scheme you actually run.",
          [
            "Workspace, project and target hierarchy",
            "Schemes and build configurations",
            "Build settings inheritance",
            "Derived data and build artifacts",
          ],
          "Create a project with Debug and Release configurations, add a label that renders the resolved flag, run the app with each configuration, and record the two values.",
          {
            summary:
              "Xcode owns the build system, debugger, Instruments integration, source control and Interface Builder. A workspace can contain multiple projects and Swift packages, while a scheme selects the target, configuration and launch action. Build settings resolve from defaults, project, target and configuration layers, with target values winning.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Changing a setting in the project when the target overrides it; inspect the resolved value with `xcodebuild -showBuildSettings`.",
              "Committing `xcuserdata` or DerivedData; add them to `.gitignore` and keep shared schemes in `xcshareddata`.",
              "Creating a new scheme per developer instead of sharing one; mark the scheme shared so CI and teammates resolve the same actions.",
            ],
          },
        ),
        topic(
          "interface-overview",
          "Not knowing where build settings, breakpoints and test reports live turns a two-minute inspection into a menu hunt.",
          [
            "Navigator sidebar modes",
            "Assistant editor and jump bar",
            "Inspectors and identity",
            "Debug area and console",
          ],
          "Open a project, use the Project, Issue, Test and Breakpoint navigators in turn, then capture a screenshot of the assistant editor showing a view and its preview.",
          {
            summary:
              "Xcode arranges navigators on the left, the editor in the center, inspectors on the right and the debug area at the bottom. The toolbar selects the scheme and run destination, while the jump bar and assistant editor move between related files. Each navigator filters the same project model rather than maintaining a separate copy.",
            difficulty: "foundation",
            minutes: 30,
            pitfalls: [
              "Closing the inspector or debug area and assuming the setting vanished; toggle them from the toolbar's editor controls.",
              "Editing a file in the assistant editor without noticing which pane has focus; check the jump bar's file name before typing.",
              "Filtering the Project navigator and concluding files are missing; clear the filter field at the bottom of the navigator.",
            ],
            resources: [
              {
                title: "Xcode documentation",
                url: "https://developer.apple.com/documentation/xcode",
                kind: "docs",
              },
              {
                title: "Xcode",
                url: "https://developer.apple.com/xcode/",
                kind: "docs",
              },
              {
                title: "Xcode overview (archive)",
                url: "https://developer.apple.com/library/archive/documentation/ToolsLanguages/Conceptual/Xcode_Overview/Introduction/Introduction.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "new-project",
          "A placeholder bundle identifier or missing team produces signing failures at archive time, long after the project seemed to work in the simulator.",
          [
            "iOS App template and lifecycle",
            "Bundle identifier and signing team",
            "Test targets and schemes",
            "Asset catalog and app icon slots",
          ],
          "Create a SwiftUI iOS app with a test target, set a reverse-DNS bundle identifier, run it on a simulator and run the generated test scheme.",
          {
            summary:
              "The iOS App template creates a target, an app entry point, an asset catalog and a test target, and the bundle identifier plus team determine signing. SwiftUI projects use an `App` struct with a `WindowGroup`, while UIKit projects use an app delegate and scene delegate. The bundle identifier is difficult to change after the first release, so choose it deliberately.",
            difficulty: "foundation",
            minutes: 45,
            pitfalls: [
              "Using a bundle identifier with uppercase or spaces; use reverse-DNS lowercase segments and keep it stable after release.",
              "Deleting the test target to simplify the project; keep it and add one smoke test before the first feature.",
              "Choosing a UIKit lifecycle and then adding SwiftUI views without an entry point; pick the lifecycle deliberately or add a `UIHostingController`.",
            ],
          },
        ),
        topic(
          "project-files",
          "Hand-editing `project.pbxproj` or ignoring merge conflicts creates a project that opens but builds a different target than the one reviewed.",
          [
            "`project.pbxproj` object graph",
            "Targets, build phases and build rules",
            "Info.plist and entitlements",
            "`Package.resolved` and dependency pins",
          ],
          "Build the app, run `plutil -p` on its Info.plist and `codesign -d --entitlements :-` on the binary, then add one capability and verify it appears.",
          {
            summary:
              "An `.xcodeproj` is a directory whose `project.pbxproj` records targets, build phases, file references and settings. Info.plist, entitlements and asset catalogs are separate resources with their own schemas. Swift Package dependencies resolve into the workspace and are pinned in `Package.resolved`.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Adding a file to the filesystem without adding it to a target; use File > Add Files or drag it into the target and check membership.",
              "Resolving a `project.pbxproj` conflict by choosing one side; regenerate the project or merge object IDs deliberately and build both targets.",
              "Editing Info.plist keys that Xcode now generates from build settings; set the build setting or use the generated plist consistently.",
            ],
          },
        ),
        topic(
          "version-control",
          "Committing `xcuserdata`, DerivedData or signing credentials leaks machine state and makes every clone differ.",
          [
            "`.gitignore` for Xcode artifacts",
            "Shared schemes and `xcshareddata`",
            "Project file merge conflicts",
            "Credential hygiene and commit signing",
          ],
          "Initialize a repository, add an Xcode `.gitignore`, commit a shared scheme, then clone into a temp directory, run `xcodebuild test` from the clone, and record the passing tests.",
          {
            summary:
              "Git tracks the project file, source, tests and shared schemes, but not DerivedData, user state or secrets. Xcode's source control integration stages and commits changes, while the command line remains necessary for rebases and conflict inspection. A `.gitignore` for Xcode and a shared scheme keep clones reproducible.",
            difficulty: "foundation",
            minutes: 40,
            pitfalls: [
              "Committing `*.xcuserstate` and `xcuserdata`; ignore them and commit `xcshareddata/xcschemes` instead.",
              "Storing certificates or API keys in the repository; use a secrets manager or CI keychain and ignore the files.",
              "Resolving a `.pbxproj` conflict by accepting one side wholesale; inspect target membership and build phases on both sides before building.",
            ],
          },
        ),
      ],
    },
    {
      slug: "swiftui-foundations",
      title: "SwiftUI foundations",
      description:
        "Build interfaces as a function of state. You will compose views and modifiers, extract reusable components and explain which state change caused which body to re-evaluate.",
      topics: [
        topic(
          "swiftui",
          "Treating a SwiftUI view as a long-lived object leads to state stored in the wrong place and bodies that never see updates.",
          [
            "`View` protocol and `body`",
            "Declarative diffing and identity",
            "Value-type view structs",
            "Cross-platform availability",
          ],
          "Build a single SwiftUI screen with a counter, add a `print` in `body`, and record how many times it re-evaluates as the counter changes.",
          {
            summary:
              "SwiftUI is a declarative framework in which a `View` describes the interface for a given state and the framework diffs the result to update the render tree. Views are value types with a `body` computed property, and the framework decides when to call it. The same code runs on iOS, macOS, watchOS and tvOS with platform-specific adaptations.",
            difficulty: "foundation",
            minutes: 40,
            pitfalls: [
              "Storing mutable state in a view property without `@State`; the struct is recreated and the value resets.",
              "Assuming `body` runs once per screen; it re-runs when observed state changes, so keep it cheap and free of side effects.",
              "Using UIKit layout assumptions for every container; SwiftUI sizes views from their content and the proposed size.",
            ],
          },
        ),
        topic(
          "declarative-syntax",
          "Updating views imperatively from a model event bypasses SwiftUI's diff and leaves the rendered tree inconsistent with state.",
          [
            "Declarative versus imperative updates",
            "Result builders and view trees",
            "View identity and lifetime",
            "State-driven rendering",
          ],
          "Build the same list screen twice, once with a `ForEach` keyed by stable IDs and once by array offsets, then delete the first row and record which version animates correctly.",
          {
            summary:
              "Declarative UI states what the interface should look like for the current data, while imperative UI issues commands to mutate views. SwiftUI result builders turn a sequence of view expressions into a tree, and view identity tells the framework which nodes to preserve across updates. Mixing imperative mutations into `body` breaks that model.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Using array indices as `ForEach` IDs; use a stable `Identifiable` identifier so deletion and reordering preserve identity.",
              "Calling `reloadData`-style imperative updates from a model callback; mutate state and let `body` re-evaluate.",
              "Conditionally applying a modifier inside `body` with `if` and expecting the same view identity; use a modifier argument or `Group` deliberately.",
            ],
          },
        ),
        topic(
          "views-and-modifiers",
          "Applying modifiers in an arbitrary order produces backgrounds, clips and padding that do not match the design and are hard to debug.",
          [
            "Modifier order and wrapper views",
            "`some View` opaque result types",
            "Custom `ViewModifier` composition",
            "Previews and size variants",
          ],
          "Recreate a card with padding, background, corner radius and shadow in two modifier orders, then run previews at light and dark appearance and record the visual difference.",
          {
            summary:
              "A modifier returns a new view that wraps the previous one, so order changes layout and rendering: `.padding().background()` paints behind the padding, while `.background().padding()` paints only the content. `some View` hides the concrete nested type, and custom modifiers package repeated combinations. View composition keeps each piece small enough to preview.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Putting `.background` before `.padding` and expecting the padding to be colored; reorder so the background wraps the padded frame.",
              "Building a 40-line `body` with no subviews; extract small `View` structs so previews and diffs stay local.",
              "Using `.frame(width:height:)` everywhere instead of letting content size itself; constrain only the dimensions the layout actually needs.",
            ],
          },
        ),
        topic(
          "simple-ui-building",
          "Reaching for fixed frames before understanding stack sizing produces clipped text and layouts that break at larger Dynamic Type sizes.",
          [
            "Stack layout and spacing",
            "Controls and action closures",
            "Images and SF Symbols",
            "Scrollable content and lists",
          ],
          "Build a settings-style screen with a `Form`, a toggle, a picker and a text field, run it on a small simulator, and fix one clipped label at the largest Dynamic Type size.",
          {
            summary:
              "A basic SwiftUI screen is a stack of text, images, controls and spacing, sized by the content and the space the parent proposes. `VStack`, `HStack` and `ZStack` cover most layouts, and `List` or `ScrollView` handle overflow. Buttons, toggles and text fields bind to state through action closures and `Binding`.",
            difficulty: "foundation",
            minutes: 60,
            pitfalls: [
              "Wrapping every row in a fixed-height frame; let `Form` and text size the row and use `lineLimit` only where truncation is intended.",
              "Binding a text field to a constant; use `@State` or `@Binding` so edits mutate the source of truth.",
              "Using a `Button` with an empty label for an icon; add an accessibility label and a visible text label where the design allows.",
            ],
            resources: [
              {
                title: "SwiftUI tutorials",
                url: "https://developer.apple.com/tutorials/swiftui",
                kind: "docs",
              },
              {
                title: "App Dev Training: Using stacks to arrange views",
                url: "https://developer.apple.com/tutorials/app-dev-training/using-stacks-to-arrange-views",
                kind: "docs",
              },
              {
                title: "SwiftUI documentation",
                url: "https://developer.apple.com/documentation/swiftui",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "building-interfaces",
          "A layout built from hard-coded offsets collapses on the first device with a different safe area or text size.",
          [
            "Container alignment and spacing",
            "Layout priorities and flexibility",
            "Safe areas and margins",
            "Size classes and adaptive layout",
          ],
          "Build a two-column detail screen that becomes a single column in a compact width, and run it in portrait and landscape to capture both layouts.",
          {
            summary:
              "Composing interfaces means choosing containers, alignment, spacing and priority so the layout adapts to available space. `ZStack` layers views, `VStack` and `HStack` distribute them, and `Spacer` or a custom `Layout` absorbs remaining space. Safe areas, margins and size classes decide how the composition changes across devices.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Hard-coding a horizontal stack that overflows in compact width; switch on horizontal size class and use a vertical arrangement.",
              "Adding `Spacer()` inside every stack row and pushing content off-screen; use one spacer where the remaining space belongs.",
              "Ignoring the safe area under a `NavigationStack` or tab bar; let the container inset content and opt out only for edge-to-edge media.",
            ],
          },
        ),
        topic(
          "state-management",
          "Creating an observable model inside `body` resets it on every re-evaluation and discards in-flight work and user input.",
          [
            "`@State` ownership and lifetime",
            "`@Binding` two-way projection",
            "`@Observable` and Observation tracking",
            "`@Environment` dependency injection",
          ],
          "Build a form with local `@State`, a child `@Binding` and an `@Observable` model created once with `@State`, then add a test that mutates the model and asserts the rendered value.",
          {
            summary:
              "SwiftUI state lives at the lowest common ancestor that needs it: `@State` owns local value state, `@Binding` shares a reference to it, and `@Observable` model objects publish changes through Observation. `@Environment` carries values down the tree, while `@StateObject` and `@ObservedObject` remain relevant in older code. Ownership decides lifetime, and lifetime decides whether the state survives a body update.",
            difficulty: "core",
            minutes: 70,
            pitfalls: [
              "Declaring an `@Observable` model as a plain property and recreating it in `body`; own it with `@State` or inject it from a parent.",
              "Using `@State` for data that a parent must read; lift the state and pass a `Binding` or model reference.",
              "Mixing `@ObservedObject` with a model that is already owned elsewhere; use `@Bindable` or a plain reference for read-only access.",
            ],
          },
        ),
      ],
    },
    {
      slug: "navigation-and-data-flow",
      title: "Navigation and data flow",
      description:
        "Move between screens and persist user state without losing the plot. You will build a NavigationStack, present a sheet, bind child state and restore a preference after relaunch.",
      topics: [
        topic(
          "navigation-stacks",
          "Using ad hoc booleans for every push produces a navigation state that cannot be restored, deep-linked or tested.",
          [
            "`NavigationStack` and `NavigationPath`",
            "Value-based `NavigationLink`",
            "`navigationDestination` mapping",
            "Deep links and path restoration",
          ],
          "Build a three-level stack driven by a `NavigationPath`, push two values programmatically, and add a test that restores the path from a URL.",
          {
            summary:
              "`NavigationStack` owns a path of values and maps each value to a destination with `navigationDestination`. Programmatic navigation mutates the path, which makes deep links and state restoration explicit. Value-based links decouple the source view from the destination and require stable `Hashable` values.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Placing `navigationDestination` inside a lazy container where it may not be registered; attach it to a stable ancestor outside the lazy content.",
              "Putting non-`Hashable` model objects in the path; store IDs or small route enums and resolve the model in the destination.",
              "Mixing `NavigationView` and `NavigationStack` in the same hierarchy; migrate the whole flow and set one minimum deployment target.",
            ],
            resources: [
              {
                title: "NavigationStack",
                url: "https://developer.apple.com/documentation/swiftui/navigationstack",
                kind: "docs",
              },
              {
                title: "NavigationPath",
                url: "https://developer.apple.com/documentation/swiftui/navigationpath",
                kind: "docs",
              },
              {
                title: "Migrating to new navigation types",
                url: "https://developer.apple.com/documentation/swiftui/migrating-to-new-navigation-types",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "presenting--dismissing-views",
          "Driving a sheet from a boolean plus a separate optional selection lets the two disagree and presents the wrong record.",
          [
            "`.sheet(item:)` and identity",
            "`@Environment(\\.dismiss)`",
            "`fullScreenCover` and `popover`",
            "Dismissal callbacks and state cleanup",
          ],
          "Build a list where tapping a row presents an item-based sheet, dismiss it from the child, and add a UI test that verifies the correct row title appears.",
          {
            summary:
              "SwiftUI presents sheets, full-screen covers and popovers with modifiers bound to optional state or a boolean. The presented view dismisses itself through `@Environment(\\.dismiss)`, and the presenter can react in `onDismiss`. Item-based presentation ties the sheet's identity to the selected value, which prevents stale content.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Using `.sheet(isPresented:)` with a separate selected item; use `.sheet(item:)` so the content and identity cannot diverge.",
              "Calling `dismiss()` before saving and expecting the presenter to keep the edit; save first or pass a binding and commit in `onDismiss`.",
              "Presenting a sheet from a view that is disappearing during navigation; attach presentation state to the stable parent.",
            ],
          },
        ),
        topic(
          "data-binding",
          "Passing a value copy into a form means edits never reach the source of truth, so the UI appears to save and then reverts.",
          [
            "`Binding` getter and setter",
            "Projected values with `$`",
            "`@Bindable` for observable models",
            "Derived bindings and validation",
          ],
          "Build a parent form and a child editor that share one `Binding`, then add a unit test for the setter that rejects invalid input.",
          {
            summary:
              "A `Binding` is a two-way reference to state owned elsewhere, created with `$` from a property wrapper or manually with a getter and a setter. Child views use bindings for controls that edit parent state, while read-only values stay plain properties. `@Bindable` exposes bindings from an `@Observable` model without taking ownership.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Creating a `Binding.constant` for an editable control; use real state or a custom binding with a setter.",
              "Deriving a binding by copying a value and mutating the copy; derive from the source with `Binding(get:set:)`.",
              "Using `@Bindable` on a value type that is not observable; apply it to an `@Observable` class or use `@State`.",
            ],
          },
        ),
        topic(
          "data-persistence",
          "Choosing a storage mechanism before defining the schema and migration path leaves user data stranded at the first model change.",
          [
            "Sandbox directories and file protection",
            "Codable file storage",
            "Core Data and SwiftData object graphs",
            "Schema migration and versioning",
          ],
          "Persist a `Codable` model to Application Support with atomic writes, relaunch the app, and add a test that decodes the file after a schema change.",
          {
            summary:
              "iOS persists data in the app sandbox: `UserDefaults` for small preferences, files in Documents, Application Support or Caches for documents, support data and disposable caches, and Core Data or SwiftData for object graphs. The container directory and file protection class determine where data lives, whether it is backed up and whether it remains readable after the device locks. A persistence choice is a schema commitment, not just an API call.",
            difficulty: "core",
            minutes: 65,
            pitfalls: [
              "Writing user documents to Caches; iOS may purge them, so use Documents or Application Support and set a backup exclusion where appropriate.",
              "Using `UserDefaults` for a growing list of records; move structured data to a file or database and keep defaults for preferences.",
              "Changing a `Codable` model without a migration plan; version the payload and decode old files explicitly.",
            ],
            resources: [
              {
                title: "Core Data",
                url: "https://developer.apple.com/documentation/coredata",
                kind: "docs",
              },
              {
                title: "App Dev Training: Persisting data",
                url: "https://developer.apple.com/tutorials/app-dev-training/persisting-data",
                kind: "docs",
              },
              {
                title: "FileManager",
                url: "https://developer.apple.com/documentation/foundation/filemanager",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "user-defaults",
          "Storing tokens or large blobs in UserDefaults leaves secrets in an unencrypted plist and slows launch.",
          [
            "`UserDefaults` keys and types",
            "`@AppStorage` in SwiftUI",
            "Default registration and suites",
            "App Group shared defaults",
          ],
          "Build a settings screen with `@AppStorage`, register a fallback value, relaunch the app, and add a test that reads the suite value after a write.",
          {
            summary:
              "`UserDefaults` is a key-value store for small preferences, backed by a property list in the app container. `@AppStorage` projects a default into SwiftUI and updates the view when the value changes. Suites isolate app groups, and `register(defaults:)` supplies values without writing them.",
            difficulty: "foundation",
            minutes: 35,
            pitfalls: [
              "Assuming a missing key returns your fallback; call `register(defaults:)` at launch or read with a typed default.",
              "Storing sensitive values such as tokens; use the Keychain and keep UserDefaults for non-sensitive preferences.",
              "Using a shared App Group suite before enabling the capability; add the App Group to both targets and verify entitlements.",
            ],
          },
        ),
        topic(
          "view-transitions",
          "Animating a state change that has already been applied without a value-scoped animation causes unrelated views to animate on every update.",
          [
            "`withAnimation` and value-scoped animation",
            "`.transition` and insertion/removal",
            "`matchedGeometryEffect` namespaces",
            "Interruptible state-driven animation",
          ],
          "Build a grid-to-detail transition with `matchedGeometryEffect`, then record a slow-motion simulator capture and verify the model state after an interrupted tap.",
          {
            summary:
              "SwiftUI animates a change when state changes inside `withAnimation` or a view has an `animation(_:value:)` modifier. Transitions describe insertion and removal, and `matchedGeometryEffect` carries a view between two hierarchies. Animations are driven by state, so an interrupted transition must still leave the model consistent.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Using the deprecated `.animation(_:)` without a value; scope animation to the property that changed.",
              "Applying a transition inside a conditional without a stable identity; give each branch a distinct identity or animate the container.",
              "Relying on animation completion to update state; update state first and let the animation follow.",
            ],
          },
        ),
      ],
    },
    {
      slug: "uikit-and-architecture",
      title: "UIKit and architecture",
      description:
        "Know the imperative layer under SwiftUI and the patterns that keep a screen testable. You will build a UIKit screen with Auto Layout, then extract a view model and test it without a simulator.",
      topics: [
        topic(
          "uikit",
          "Avoiding UIKit entirely leaves no path to the system controls and delegate APIs that SwiftUI does not wrap.",
          [
            "`UIView` hierarchy and responders",
            "`UIViewController` ownership",
            "SwiftUI and UIKit interop",
            "Main-thread UIKit mutation",
          ],
          "Wrap a `UIActivityIndicatorView` in `UIViewRepresentable`, show it from SwiftUI, and run the app to verify start and stop behavior.",
          {
            summary:
              "UIKit is the imperative framework beneath SwiftUI: `UIView` objects form a hierarchy, `UIViewController` owns a screen, and the responder chain routes events. SwiftUI hosts UIKit through `UIViewRepresentable` and `UIViewControllerRepresentable`, and UIKit hosts SwiftUI through `UIHostingController`. The framework still owns text input, collection views and many system presentations.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Mutating UIKit from a background thread; hop to `@MainActor` before touching any view.",
              "Creating a `UIViewRepresentable` that rebuilds the view on every update; implement `makeUIView` once and update state in `updateUIView`.",
              "Assuming SwiftUI and UIKit share layout coordinates; convert between view spaces with `convert(_:to:)`.",
            ],
          },
        ),
        topic(
          "views-view-controllers",
          "Putting model and networking code directly in a view controller makes the screen impossible to test without a simulator.",
          [
            "View hierarchy and `superview`/`subviews`",
            "View controller ownership",
            "Container view controllers",
            "Lazy view loading",
          ],
          "Build a UIKit screen with a child controller inside a container view, then add a unit test for the parent's child-management logic.",
          {
            summary:
              "A `UIView` draws and handles touches in a rectangle, while a `UIViewController` owns a view hierarchy and coordinates loading, appearance and rotation. Container controllers add child controllers and forward lifecycle events. The view controller's `view` is loaded lazily, so accessing it in `init` changes when the hierarchy is built.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Accessing `view` inside `init` and triggering a load before dependencies are set; inject dependencies first and touch `view` in `loadView` or later.",
              "Adding a child controller's view without calling `addChild`; pair `addChild`, `addSubview`, constraints and `didMove(toParent:)`.",
              "Holding a strong reference from a child back to its parent; use a weak or unowned parent reference to avoid a cycle.",
            ],
          },
        ),
        topic(
          "viewcontroller-lifecycle",
          "Starting a network request in `viewDidLoad` without cancelling it on disappearance leaves work running for a screen the user left.",
          [
            "`viewDidLoad` versus appearance callbacks",
            "Layout and trait collection changes",
            "Memory warnings and cleanup",
            "Cancellation on disappearance",
          ],
          "Add `os_signpost` calls to every lifecycle method, present and dismiss the controller twice, and export the trace with repeated appearance calls marked.",
          {
            summary:
              "A view controller moves through `loadView`, `viewDidLoad`, `viewWillAppear`, `viewDidAppear`, `viewWillDisappear` and `viewDidDisappear`, with `deinit` at the end. `viewDidLoad` runs once per load, while appearance callbacks can run many times as the controller is covered or revealed. Layout callbacks such as `viewDidLayoutSubviews` can run repeatedly and must tolerate that.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Doing one-time setup in `viewWillAppear`; move it to `viewDidLoad` and keep appearance callbacks idempotent.",
              "Assuming `viewDidLayoutSubviews` runs once; guard expensive work or compare the new bounds before recalculating.",
              "Forgetting to cancel timers or tasks in `deinit` or `viewDidDisappear`; tie them to the controller lifetime explicitly.",
            ],
          },
        ),
        topic(
          "auto-layout",
          "Mixing autoresizing masks with constraints produces duplicate constraints and layouts that shift after rotation.",
          [
            "Constraints, anchors and priorities",
            "Intrinsic content size and hugging",
            "Ambiguity and unsatisfiable constraints",
            "Safe area and layout margins",
          ],
          "Build a UIKit card with Auto Layout, rotate the simulator to trigger a conflict, then fix the priority and capture the resolved layout.",
          {
            summary:
              "Auto Layout solves a system of linear constraints for each layout pass, using anchors, priorities and intrinsic content size. `translatesAutoresizingMaskIntoConstraints` must be false for views laid out by constraints, and ambiguous or conflicting constraints appear in the debug log. Safe area guides and layout margins encode the platform's insets.",
            difficulty: "core",
            minutes: 65,
            pitfalls: [
              "Leaving `translatesAutoresizingMaskIntoConstraints` true on a constrained view; set it to false before activating anchors.",
              "Pinning both leading and trailing plus a fixed width; remove one constraint or lower the width priority.",
              "Reading a constraint conflict as a runtime crash; inspect the unsatisfiable constraint in the console and break the competing pair.",
            ],
            resources: [
              {
                title: "Auto Layout Guide (archive)",
                url: "https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/AutolayoutPG/",
                kind: "docs",
              },
              {
                title: "NSLayoutConstraint",
                url: "https://developer.apple.com/documentation/uikit/nslayoutconstraint",
                kind: "docs",
              },
              {
                title: "translatesAutoresizingMaskIntoConstraints",
                url: "https://developer.apple.com/documentation/uikit/uiview/translatesautoresizingmaskintoconstraints",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "mvvm",
          "A view model that imports SwiftUI or owns navigation duplicates the view's job and cannot be tested as plain Swift.",
          [
            "View model ownership and lifetime",
            "Observable state and commands",
            "Dependency injection for tests",
            "View-model boundary and navigation",
          ],
          "Extract a screen's validation and loading logic into an `@Observable` view model, then add XCTest cases for loading, success and failure without launching the simulator.",
          {
            summary:
              "MVVM separates a view's rendering from its state and behavior: the view observes a view model that exposes display-ready values and commands. In SwiftUI, an `@Observable` view model can be owned by `@State` and tested without a renderer. The pattern earns its cost when it isolates logic from UIKit and SwiftUI, not when it merely renames the view.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Putting `NavigationStack` or `View` types in the view model; return route values or callbacks and let the view own navigation.",
              "Creating the view model in `body`; own it with `@State` or inject it from a composition root.",
              "Making every property public and mutable; expose read-only state and explicit methods so tests cover transitions.",
            ],
          },
        ),
        topic(
          "architectural-patterns",
          "Adopting a pattern by name without defining module boundaries produces the same coupling with more files and indirection.",
          [
            "MVC, MVVM, MVP and VIPER trade-offs",
            "Coordinator and router boundaries",
            "Composition root and dependency injection",
            "Test seams and dependency direction",
          ],
          "Write a one-page decision record comparing MVVM and MVC for one screen, then implement the chosen seam and test it with a fake service.",
          {
            summary:
              "MVC, MVVM, MVP, VIPER and The Composable Architecture differ in where they put navigation, state and side effects. UIKit's MVC couples the controller to the view, while MVVM introduces an observable boundary and coordinators move navigation out of both. The useful comparison is dependency direction and test seam, not a ranking of patterns.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Adding a coordinator layer that only forwards calls; keep navigation in the view until a flow is reused or tested.",
              "Letting view models depend on concrete network clients; inject a protocol or closure so tests can replace it.",
              "Mixing MVC and MVVM in one feature; choose one boundary per screen and document the exception.",
            ],
            resources: [
              {
                title: "Managing model data in your app",
                url: "https://developer.apple.com/documentation/swiftui/model-data",
                kind: "docs",
              },
              {
                title: "Cocoa Core Competencies: Model-View-Controller (archive)",
                url: "https://developer.apple.com/library/archive/documentation/General/Conceptual/DevPedia-CocoaCore/MVC.html",
                kind: "docs",
              },
              {
                title: "Observation",
                url: "https://developer.apple.com/documentation/observation",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "networking-and-persistence",
      title: "Networking and persistence",
      description:
        "Connect the app to real data and secure it. You will make a URLSession request, decode the response, store it with Core Data and put a token in the Keychain instead of UserDefaults.",
      topics: [
        topic(
          "networking",
          "A request without a timeout or cancellation path hangs behind a slow network and keeps the user on a spinner after they leave the screen.",
          [
            "Idempotent methods and status classes",
            "App Transport Security and TLS",
            "Timeouts, retries and backoff",
            "Cancellation and request ownership",
          ],
          "Build a client that fetches a fixture over HTTPS, add a timeout and one retry, then run a test with a stubbed `URLProtocol` for 200, 500 and timeout.",
          {
            summary:
              "An iOS app talks to services over HTTP, usually through `URLSession` with HTTPS enforced by App Transport Security. Requests need explicit timeouts, cache policy, retry rules and cancellation, because the radio and the user's network change underneath the app. Authentication, pagination and error mapping belong at the client boundary, not in each view.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Treating any non-nil response as success; check `HTTPURLResponse.statusCode` and decode the error body.",
              "Retrying non-idempotent POSTs automatically; retry only idempotent requests or use an idempotency key.",
              "Disabling ATS for a production host; fix the TLS configuration or scope an exception to a development domain.",
            ],
            resources: [
              {
                title: "URL Loading System",
                url: "https://developer.apple.com/documentation/foundation/url_loading_system",
                kind: "docs",
              },
              {
                title: "URLSession",
                url: "https://developer.apple.com/documentation/foundation/urlsession",
                kind: "docs",
              },
              {
                title: "Preventing insecure network connections",
                url: "https://developer.apple.com/documentation/security/preventing-insecure-network-connections",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "urlsession",
          "Creating a new `URLSession` per request discards connection reuse and makes cookie, cache and authentication behavior inconsistent.",
          [
            "Session configurations and shared sessions",
            "Data, download and upload tasks",
            "Delegate callbacks and auth challenges",
            "Background sessions and concurrency",
          ],
          "Build a client with one configured session, fetch JSON with `data(for:)`, and add a `URLProtocol` test that asserts the request headers and cancellation path.",
          {
            summary:
              "`URLSession` creates tasks for data, uploads, downloads and streams, and a configuration controls caching, cookies, timeouts and background behavior. The async `data(for:)` API suspends instead of blocking, while delegate-based sessions handle authentication challenges and progress. A session is a long-lived object with its own queue and connection pool.",
            difficulty: "core",
            minutes: 65,
            pitfalls: [
              "Using `URLSession.shared` for everything and then trying to change cache policy per feature; create a configured session and inject it.",
              "Ignoring the response body on a download task; move or delete the temporary file before the delegate returns.",
              "Assuming a background session survives app termination without a delegate; reconnect the session by identifier at launch.",
            ],
          },
        ),
        topic(
          "parsing",
          "Letting decoder defaults handle dates and decimals produces silent timezone shifts and precision loss in production payloads.",
          [
            "`Codable`, `CodingKeys` and coding paths",
            "Date and data decoding strategies",
            "Optional versus required fields",
            "Schema evolution and custom decoding",
          ],
          "Decode a fixture with a nested object and an ISO 8601 date, then add a test for a missing required field and inspect the `DecodingError` path.",
          {
            summary:
              "Codable maps JSON keys to Swift properties through synthesized or explicit `CodingKeys`, and `JSONDecoder` turns `Data` into typed values. Dates, decimals and optional fields need explicit strategies because the defaults rarely match a real API. Decoding errors identify a coding path, which is the first place to look when a response shape changes.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Relying on the default date strategy for ISO 8601 strings; set `.iso8601` or a custom formatter and test fractional seconds.",
              "Making a new field non-optional and breaking old payloads; default it in `init(from:)` or keep it optional until the server guarantees it.",
              "Decoding money into `Double`; use `Decimal` or integer minor units and verify with a large value.",
            ],
          },
        ),
        topic(
          "json--xml",
          "Parsing XML with string searches breaks on namespaces, entities and attribute order that a real parser handles.",
          [
            "JSON objects, arrays and number precision",
            "XML elements, attributes and namespaces",
            "`JSONSerialization` versus `Codable`",
            "Streaming versus tree parsing",
          ],
          "Parse the same record from a JSON fixture and an XML fixture into one Swift struct, then add tests for a missing element and an escaped entity.",
          {
            summary:
              "JSON and XML are both text formats for structured data, but they differ in schema, ordering and parser behavior. JSON maps naturally to `Codable` and dictionaries, while XML needs a parser with delegate callbacks or a tree model. The service usually dictates the choice, and the client should isolate the format behind a decoding boundary.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Searching XML with `range(of:)`; use `XMLParser` or a proper tree parser that understands namespaces.",
              "Decoding JSON numbers into `Double` for identifiers; keep identifiers as strings or integers.",
              "Assuming dictionary key order matches the JSON text; JSON objects are unordered and must be keyed by name.",
            ],
            resources: [
              {
                title: "Encoding and decoding custom types",
                url: "https://developer.apple.com/documentation/foundation/archives_and_serialization/encoding_and_decoding_custom_types",
                kind: "docs",
              },
              {
                title: "JSONEncoder",
                url: "https://developer.apple.com/documentation/foundation/jsonencoder",
                kind: "docs",
              },
              {
                title: "XMLParser",
                url: "https://developer.apple.com/documentation/foundation/xmlparser",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "core-data",
          "Sharing one managed object context across threads causes crashes and corrupts the object graph under concurrent writes.",
          [
            "`NSPersistentContainer` and stores",
            "Managed object contexts and concurrency",
            "Fetch requests and faulting",
            "Lightweight and custom migrations",
          ],
          "Add a Core Data model with one entity, write from a background context, read on the view context, and run a test that verifies the merge after save.",
          {
            summary:
              "Core Data manages an object graph backed by SQLite, with managed objects, contexts and persistent stores. A view context runs on the main queue for UI, while background contexts perform writes and merge changes through notifications or `automaticallyMergesChangesFromParent`. Fetch requests, faulting and migration decide the memory and schema behavior.",
            difficulty: "advanced",
            minutes: 75,
            pitfalls: [
              "Passing `NSManagedObject` instances between queues; pass `NSManagedObjectID` and re-fetch in the destination context.",
              "Saving on every property change; batch changes and save at a meaningful boundary.",
              "Shipping a model change without a migration; add a model version and test the store against the previous schema.",
            ],
          },
        ),
        topic(
          "keychain",
          "Leaving an auth token in UserDefaults exposes it to backups and file inspection that the Keychain's access controls are designed to resist.",
          [
            "`SecItem` add, copy, update, delete",
            "Accessibility classes and device lock",
            "Access groups and app sharing",
            "Biometric access control",
          ],
          "Store a token with `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`, read it back in a test, then delete it and assert the not-found status.",
          {
            summary:
              "The Keychain stores small secrets encrypted by the system, keyed by service, account and access group. `SecItemAdd`, `SecItemCopyMatching`, `SecItemUpdate` and `SecItemDelete` form the API, and the accessibility class decides when the item is readable. Tokens belong here, not in `UserDefaults` or a plist in the bundle.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Using `kSecAttrAccessibleAlways`; choose an accessibility class that matches when the app needs the secret.",
              "Adding a duplicate item on every login; query first and update, or delete before adding.",
              "Ignoring `OSStatus` codes; map `errSecItemNotFound` and `errSecDuplicateItem` explicitly and surface the rest.",
            ],
          },
        ),
      ],
    },
    {
      slug: "quality-and-performance",
      title: "Quality and performance",
      description:
        "Prove the app works and find the work that makes it feel slow. You will write XCTest and XCUITest coverage, use the debugger and Instruments, and fix one measured hitch or memory growth.",
      topics: [
        topic(
          "unit--ui-testing",
          "Testing everything through the UI makes a slow, flaky suite that hides which layer actually broke.",
          [
            "Test pyramid and isolation",
            "Unit versus UI test targets",
            "Fixtures and launch arguments",
            "Determinism and flake control",
          ],
          "Add one unit test for a view model and one XCUITest for a navigation flow, then run both with `xcodebuild test` and record the split of passing tests.",
          {
            summary:
              "Unit tests exercise functions, view models and services in isolation, while UI tests drive the app through its accessibility tree in a simulator. The useful split puts logic under fast unit tests and reserves XCUITest for navigation, persistence and permission flows. Deterministic fixtures and launch arguments keep both layers from depending on network state.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Testing a view's private layout instead of observable behavior; assert rendered text or state transitions.",
              "Letting UI tests hit the real network; inject a fixture server or launch argument that selects canned data.",
              "Sharing one simulator state across tests; reset the app or use a unique launch argument per test.",
            ],
            resources: [
              {
                title: "XCTest",
                url: "https://developer.apple.com/documentation/xctest",
                kind: "docs",
              },
              {
                title: "XCUIAutomation",
                url: "https://developer.apple.com/documentation/xcuiautomation",
                kind: "docs",
              },
              {
                title: "WWDC19: Testing in Xcode",
                url: "https://developer.apple.com/videos/play/wwdc2019/413/",
                kind: "video",
              },
            ],
          },
        ),
        topic(
          "xctest",
          "Writing tests without assertions, or with expectations that never fulfill, produces a green suite that proves nothing.",
          [
            "`XCTestCase` lifecycle and assertions",
            "Async tests and expectations",
            "Test doubles and dependency injection",
            "Performance measurements",
          ],
          "Write an `XCTestCase` with one async test, one throwing test and one `measure` block, then run it with `xcodebuild test -only-testing`.",
          {
            summary:
              "XCTest runs test methods on `XCTestCase` subclasses, with assertions, expectations and performance measurements. Async tests can await directly, and `XCTExpectFailure` marks known failures without hiding them. Test plans and schemes decide which tests run, in what order and with which environment.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Calling `wait(for:timeout:)` on the main thread when the expectation depends on main-queue work; use `await` or fulfill from the correct queue.",
              "Putting setup in `testExample` instead of `setUpWithError`; use the lifecycle hooks and `addTeardownBlock`.",
              "Asserting on a mock's call count when the contract is the output; assert behavior first and interaction only when it matters.",
            ],
            resources: [
              {
                title: "XCTest",
                url: "https://developer.apple.com/documentation/xctest",
                kind: "docs",
              },
              {
                title: "XCTestCase",
                url: "https://developer.apple.com/documentation/xctest/xctestcase",
                kind: "docs",
              },
              {
                title: "WWDC19: Testing in Xcode",
                url: "https://developer.apple.com/videos/play/wwdc2019/413/",
                kind: "video",
              },
            ],
          },
        ),
        topic(
          "xcuitest",
          "A UI test that sleeps for two seconds and searches by label fails on a slower simulator and after the first localization pass.",
          [
            "`XCUIApplication` launch and state",
            "Element queries and accessibility identifiers",
            "Waits and expected conditions",
            "Launch arguments and test data",
          ],
          "Add accessibility identifiers to a login form, write an XCUITest that signs in with launch-argument credentials, and run it on two simulator sizes.",
          {
            summary:
              "XCUITest launches the app as a separate process and queries elements through the accessibility hierarchy. Queries by identifier are stable, while queries by visible text break under localization and Dynamic Type. Waits and launch arguments make the test independent of animation timing and persisted state.",
            difficulty: "advanced",
            minutes: 65,
            pitfalls: [
              "Using `sleep` instead of `waitForExistence`; wait on the specific element and a bounded timeout.",
              "Querying localized labels; set `.accessibilityIdentifier` and query by identifier.",
              "Depending on an existing simulator account; reset the app state or pass a fresh launch argument each run.",
            ],
          },
        ),
        topic(
          "debugging-techniques",
          "Adding print statements around a race or layout bug changes timing and hides the state the debugger would show.",
          [
            "Breakpoints, conditions and actions",
            "LLDB expressions and backtraces",
            "View hierarchy and memory graph",
            "Crash reports and termination reasons",
          ],
          "Set an exception breakpoint, reproduce a crash in the simulator, and record a Points of Interest trace while capturing the backtrace and view hierarchy.",
          {
            summary:
              "Xcode debugging combines breakpoints, LLDB expression evaluation, the view hierarchy debugger and the memory graph. A conditional breakpoint or an exception breakpoint stops execution at the failure instead of after it. Crash reports and device logs supply the stack and termination reason when the debugger is not attached.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Stopping at the line after the crash; add an exception breakpoint or enable `objc_exception_throw` so execution stops at the throw.",
              "Using `po` on an optimized Release build; debug with a Debug configuration or inspect registers and crash logs instead.",
              "Treating a memory graph as a leak detector without checking ownership; follow the reference paths before changing `weak`.",
            ],
            resources: [
              {
                title: "Debugging",
                url: "https://developer.apple.com/documentation/xcode/debugging",
                kind: "docs",
              },
              {
                title: "Diagnosing issues using crash reports and device logs",
                url: "https://developer.apple.com/documentation/xcode/diagnosing-issues-using-crash-reports-and-device-logs",
                kind: "docs",
              },
              {
                title: "LLDB",
                url: "https://lldb.llvm.org/",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "profiling-instruments",
          "Optimizing a function that looks expensive in source without a trace often moves work rather than removing it.",
          [
            "Time Profiler and call trees",
            "Allocations, Leaks and memory graph",
            "Hangs and signpost intervals",
            "Release-build profiling",
          ],
          "Profile a scrolling list in Release, record a Time Profiler trace, and fix one measured hitch caused by image decoding on the main thread.",
          {
            summary:
              "Instruments records time, allocations, leaks, energy and hangs against a running app, with call stacks and timelines. The Time Profiler samples running threads, while Allocations and Leaks show object growth and retained cycles. A trace is evidence only when the workload and build configuration are recorded alongside it.",
            difficulty: "advanced",
            minutes: 70,
            pitfalls: [
              "Profiling a Debug build with `-Onone`; profile the Release configuration and keep symbols for the trace.",
              "Sampling an idle app and calling the trace empty; reproduce the slow interaction while recording.",
              "Chasing a single hot frame; compare traces before and after and confirm the user-visible metric changed.",
            ],
          },
        ),
        topic(
          "test-plan--coverage",
          "A single local test configuration misses the locale, sanitizer and device combinations that fail in CI.",
          [
            "Test plan configurations and options",
            "Code coverage collection",
            "Schemes and CI destinations",
            "Sanitizers and diagnostics",
          ],
          "Create two test plans for unit and UI tests, enable coverage on the unit plan, and run both with `xcodebuild test -testPlan` in CI mode.",
          {
            summary:
              "A test plan names the test targets, configurations, environment variables and sanitizers for a run. Code coverage records which lines executed, but it cannot prove assertions are meaningful. Schemes can attach multiple test plans, so CI can run a fast unit plan and a slower UI plan separately.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Chasing a coverage percentage with assertion-free tests; review uncovered branches and write a failing assertion first.",
              "Enabling coverage on UI tests and slowing every run; collect it on the unit plan and keep UI plans focused on flows.",
              "Hard-coding a simulator name in CI; use a destination matrix and a shared scheme so the plan resolves.",
            ],
            resources: [
              {
                title: "Testing",
                url: "https://developer.apple.com/documentation/xcode/testing",
                kind: "docs",
              },
              {
                title: "WWDC19: Testing in Xcode",
                url: "https://developer.apple.com/videos/play/wwdc2019/413/",
                kind: "video",
              },
              {
                title: "WWDC20: Get the most out of Xcode test plans",
                url: "https://developer.apple.com/videos/play/wwdc2020/10041/",
                kind: "video",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "product-and-release",
      title: "Product quality and release",
      description:
        "Ship an app that respects the platform and its users. You will audit accessibility, follow the HIG, prepare a TestFlight build and walk a release through App Store review.",
      topics: [
        topic(
          "hig",
          "A custom control that ignores platform gestures and safe areas feels foreign and adds accessibility work the system control already did.",
          [
            "Platform conventions and system controls",
            "Layout, typography and color",
            "Navigation and modality",
            "Privacy and permission prompts",
          ],
          "Run a HIG review and an Accessibility Inspector audit on one screen, then file three concrete changes with before and after screenshots and the audit findings.",
          {
            summary:
              "The Human Interface Guidelines describe platform conventions for layout, navigation, controls, typography, color and privacy. Following them means using system components and patterns where those already solve the problem, and reserving custom UI for cases the platform does not cover. The guidelines are design constraints that map to concrete APIs and review criteria.",
            difficulty: "foundation",
            minutes: 45,
            pitfalls: [
              "Treating the HIG as a visual style guide; check the interaction and accessibility rules behind each recommendation.",
              "Replacing a system control to match a brand; subclass or configure the system control before building a custom one.",
              "Shipping a permission prompt without a purpose string; write the reason in the user's terms and test the denied path.",
            ],
            resources: [
              {
                title: "Human Interface Guidelines",
                url: "https://developer.apple.com/design/human-interface-guidelines",
                kind: "docs",
              },
              {
                title: "Designing for iOS",
                url: "https://developer.apple.com/design/human-interface-guidelines/designing-for-ios",
                kind: "docs",
              },
              {
                title: "HIG: Foundations",
                url: "https://developer.apple.com/design/human-interface-guidelines/foundations",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "accessibility",
          "A custom-drawn control with no accessibility label is invisible to VoiceOver even though it looks and taps correctly.",
          [
            "Accessibility labels, traits and values",
            "Accessibility elements and containers",
            "Custom actions and gesture alternatives",
            "Accessibility Inspector audits",
          ],
          "Run an Accessibility Inspector audit on one screen, fix every contrast and label issue it reports, and attach the before and after audit summary.",
          {
            summary:
              "Accessibility on iOS exposes a semantic tree of labels, traits, values and actions that assistive technologies can navigate. SwiftUI and UIKit generate parts of that tree from standard controls, but custom views and gesture recognizers need explicit semantics. Testing with VoiceOver, Switch Control and large text finds the gaps that a visual review misses.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Setting a label on a container and hiding its children; group related elements or expose each actionable child.",
              "Using color alone to convey state; add text, shape or an accessibility value.",
              "Adding an accessibility label that repeats the visible text without context; describe the action and the current value.",
            ],
            resources: [
              {
                title: "Accessibility",
                url: "https://developer.apple.com/accessibility/",
                kind: "docs",
              },
              {
                title: "Accessibility documentation",
                url: "https://developer.apple.com/documentation/accessibility",
                kind: "docs",
              },
              {
                title: "HIG: Accessibility",
                url: "https://developer.apple.com/design/human-interface-guidelines/accessibility",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "voice-over",
          "A gesture-only control such as a swipe-to-delete row has no VoiceOver equivalent unless the action is exposed in the rotor.",
          [
            "VoiceOver navigation order",
            "Rotor categories and custom actions",
            "Gesture conflict and accessibility actions",
            "Announcements and focus changes",
          ],
          "Enable VoiceOver, navigate a three-screen flow without looking at the screen, and record every element whose label or order blocks the task.",
          {
            summary:
              "VoiceOver reads the accessibility tree in navigation order and offers rotor actions for headings, links, form controls and custom actions. The order follows the element hierarchy rather than the visual z-order unless it is overridden. Gesture-based interfaces need alternative actions, because VoiceOver intercepts the standard touch gestures.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Relying on `accessibilityLabel` alone for a custom gesture; add `accessibilityAction` or a visible button alternative.",
              "Reordering subviews visually without updating accessibility order; set `accessibilityElementChildren` or reorder the semantic container.",
              "Posting an announcement for every state change; reserve announcements for results the user cannot otherwise perceive.",
            ],
          },
        ),
        topic(
          "dynamic-type",
          "Fixed font sizes and fixed-height rows clip text for users who rely on the largest accessibility sizes.",
          [
            "`DynamicTypeSize` and text styles",
            "`@ScaledMetric` and `UIFontMetrics`",
            "Reflow versus truncation",
            "Image and icon scaling",
          ],
          "Run a screen at the AX5 accessibility size, record clipped labels with the Accessibility Inspector, then reflow the layout and capture the fixed screen.",
          {
            summary:
              "Dynamic Type maps the user's preferred text size to a `DynamicTypeSize`, and SwiftUI's `.font(.body)` scales automatically while fixed sizes do not. `@ScaledMetric` scales spacing and icon sizes, and `UIFontMetrics` does the same in UIKit. Layouts must reflow, not truncate, at the largest accessibility sizes.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Using `.font(.system(size:))` for body text; use a text style so the size responds to Dynamic Type.",
              "Giving a row a fixed height; let content define height or switch to a vertical layout at accessibility sizes.",
              "Scaling an icon with `@ScaledMetric` but not its container; scale both or use a symbol that adapts to the font.",
            ],
          },
        ),
        topic(
          "testflight",
          "Skipping TestFlight and testing only local builds misses signing, provisioning and beta-review failures that appear at upload time.",
          [
            "Archives and build numbers",
            "Internal and external tester groups",
            "Beta app review and export compliance",
            "Crash feedback and build expiration",
            "Fastlane pilot upload lanes",
          ],
          "Archive a release build with `xcodebuild archive`, upload it with `fastlane pilot upload`, add one internal tester, and record the install plus the crash feedback screen.",
          {
            summary:
              "TestFlight distributes signed beta builds to internal and external testers through App Store Connect. An archive uploads to the service, goes through beta app review for external groups, and exposes crash feedback and expiration dates. Build numbers, export compliance and tester groups decide who can install which build.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Reusing a build number for a new upload; increment `CFBundleVersion` for every upload or use `agvtool` in CI.",
              "Sending an external build before beta review completes; add internal testers first and wait for the review status.",
              "Forgetting export compliance; answer the encryption question in App Store Connect or set `ITSAppUsesNonExemptEncryption`.",
            ],
          },
        ),
        topic(
          "app-store-distribution",
          "A build that installs from Xcode can still fail review because its privacy manifest, metadata or entitlements do not match the submitted app.",
          [
            "Certificates and provisioning profiles",
            "App Store Connect metadata and privacy",
            "App Review guidelines and rejection handling",
            "Phased release and versioning",
          ],
          "Create a distribution certificate and profile, archive and validate the app, submit it with a privacy manifest, and record the validation and review status.",
          {
            summary:
              "App Store distribution requires a signed archive, an App Store Connect record, privacy declarations and a review submission that matches the guidelines. Certificates and provisioning profiles establish the signing identity, while the archive's entitlements must match the capabilities enabled in the developer account. Release options such as phased rollout and manual release decide when the approved build reaches users.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Using a development provisioning profile for a distribution archive; select the App Store profile and verify with `codesign -dvvv`.",
              "Missing privacy manifest entries for required-reason APIs; declare the reasons and test with a distribution build.",
              "Submitting a build with placeholder metadata or broken demo credentials; complete every review field and test the review path.",
            ],
          },
        ),
      ],
    },
  ],
};
