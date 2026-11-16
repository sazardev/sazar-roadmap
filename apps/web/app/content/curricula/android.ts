import type { Curriculum } from "../types";
import { topic } from "../types";

export const android: Curriculum = {
  slug: "android",
  title: "Android Engineering",
  tagline: "Kotlin, Compose and the Android lifecycle, end to end.",
  description:
    "A guided path through modern Android: Kotlin, the app model and lifecycle, Jetpack Compose, navigation, state, coroutines, persistence, networking, platform services and release quality. The target is a native app that survives configuration changes, process death and a real Play Store release.",
  level: "intermediate",
  icon: "smartphone",
  estimatedHours: 74,
  stages: [
    {
      slug: "kotlin-foundations",
      title: "Kotlin foundations",
      description:
        "Learn the language and toolchain before the framework. By the end you can write a small Kotlin program, explain null safety and build it with Gradle from the command line.",
      topics: [
        topic(
          "pick-a-language",
          "Starting in Java means fighting nullability and verbosity on every Compose screen, while skipping Java interop leaves platform types and annotation processors unexplained.",
          [
            "Kotlin/JVM compilation and Java bytecode interop",
            "Platform types from Java nullability annotations",
            "Google's Kotlin-first guidance since 2019",
            "Compose compiler requirements and Kotlin versions",
          ],
          "Add one Kotlin class and one Java class that call each other, run `./gradlew :app:compileDebugKotlin`, and paste the compiler output plus the platform type that forced an explicit null check.",
          {
            summary:
              "Kotlin compiles to JVM bytecode and is Google's preferred language for Android; Java remains fully supported and interops through the same runtime. The choice affects null-safety, coroutine support and access to Compose APIs, while shared libraries stay callable from both.",
            difficulty: "foundation",
            minutes: 30,
            pitfalls: [
              "Choosing Java because a tutorial uses it, then paying for boilerplate and missing Kotlin-only Compose APIs. Write new screens in Kotlin and keep Java at library boundaries.",
              "Assuming Java sources see Kotlin nullability; platform types erase it at the interop boundary. Annotate Java APIs with `@Nullable` and `@NonNull`.",
              "Adding Kotlin without the Compose compiler plugin, so `@Composable` functions fail to compile. Apply `org.jetbrains.kotlin.plugin.compose`.",
            ],
          },
        ),
        topic(
          "basics-of-kotlin",
          "Without Kotlin's declaration and expression forms, Compose code reads like Java translated line by line, and null-safety errors survive to runtime.",
          [
            "val versus var and read-only references",
            "Type inference and explicit types at API boundaries",
            "String templates and raw strings",
            "Data classes, destructuring and copy()",
            "when expressions and expression-bodied functions",
          ],
          "Write a data class, destructure it, copy it with one changed field, and assert the copied values in a JVM test; paste the `./gradlew testDebugUnitTest` output.",
          {
            summary:
              "Kotlin's syntax removes Java ceremony with `val`/`var`, type inference, string templates, data classes and expression bodies. Types are still static, and nullable types are tracked by the compiler rather than left to runtime checks.",
            difficulty: "foundation",
            minutes: 45,
            pitfalls: [
              "Using `var` everywhere because it compiles; prefer `val` and immutable data so Compose state has one writer.",
              "Putting a mutable property in a `data class` used as a Compose key; equality changes without a new instance and recomposition is skipped. Keep state properties read-only and emit copies.",
              "Relying on `toString()` from a data class as a stable identifier; its format is not a contract. Use an explicit ID field.",
            ],
          },
        ),
        topic(
          "kotlin",
          "Compose's DSL and sealed UI state depend on extension functions and exhaustive `when`; without them the API reads as arbitrary syntax.",
          [
            "Extension functions and receiver scopes",
            "Higher-order functions and trailing lambdas",
            "Sealed classes and exhaustive when branches",
            "Property delegation and lazy initialization",
            "Scope functions and their receiver semantics",
          ],
          "Write a sealed `UiState` with Loading, Content and Error, render it with an exhaustive `when`, then add a new case and paste the compiler error that names the missing branch.",
          {
            summary:
              "Kotlin adds extension functions, lambdas with receivers, sealed hierarchies and delegated properties on top of the JVM object model. These features underpin Compose's modifier DSL and let a sealed `UiState` be consumed by an exhaustive `when`.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Adding an extension function with the same signature as a member and expecting it to win; members always resolve first. Rename the extension or use a different receiver.",
              "Chaining `apply` and `also` until the receiver is ambiguous; name the value or use a local variable. Scope functions should shorten code, not hide it.",
              "Declaring a sealed hierarchy whose implementations live in another module; Kotlin rejects the hierarchy. Keep implementations in the same package and module.",
            ],
          },
        ),
        topic(
          "java",
          "Most Android libraries and annotation processors are Java, so ignoring interop leads to nullability crashes and SAM conversion surprises.",
          [
            "JVM bytecode and the Android runtime (ART)",
            "Platform types and nullability annotations",
            "Checked exceptions and Kotlin's lack of them",
            "SAM conversion for Java functional interfaces",
            "Java 8+ API desugaring on older API levels",
          ],
          "Call a Java method that returns an unannotated `String` from Kotlin, force a null return, and paste the resulting `NullPointerException` trace with the Kotlin call site.",
          {
            summary:
              "Android's build converts Java and Kotlin sources to JVM bytecode, then D8 or R8 dexes it for ART, so both languages share classes, annotations and runtime. Java's platform types, checked exceptions, static members and SAM interfaces define the interop boundary every Kotlin caller crosses.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Treating an unannotated Java `String` return as a non-null Kotlin type; it is a platform type. Add `@Nullable` or an explicit check at the boundary.",
              "Expecting a Kotlin companion object member to appear as a Java static; use `@JvmStatic` or `@JvmField` where Java callers need it.",
              "Calling a Java 11 API without checking desugaring and `minSdk`; the build fails or the app crashes on old devices. Enable core library desugaring or raise `minSdk`.",
            ],
          },
        ),
        topic(
          "the-fundamentals",
          "A missing manifest entry or resource qualifier looks like framework magic until you can trace it to a build input and an SDK level.",
          [
            "app/src/main source sets and resource directories",
            "AndroidManifest.xml component declarations",
            "compileSdk, targetSdk and minSdk boundaries",
            "Per-app sandbox and Linux UID isolation",
            "Resource qualifiers and configuration selection",
          ],
          "Build a debug APK with `./gradlew :app:assembleDebug`, then run `apkanalyzer manifest print app/build/outputs/apk/debug/app-debug.apk` and paste the merged manifest.",
          {
            summary:
              "An Android project is a Gradle build that compiles Kotlin sources, resources and a manifest against a chosen SDK. The installed app runs in a Linux sandbox with its own UID, and the manifest declares every component the system may start.",
            difficulty: "foundation",
            minutes: 35,
            pitfalls: [
              "Raising `compileSdk` without raising `targetSdk`; new compile APIs work but behavior changes such as notification permissions stay opt-in. Raise both deliberately and test.",
              "Editing the merged manifest in the build output; the next build overwrites it. Change the source manifest or add a manifest merge rule.",
              "Assuming `minSdk` is enforced by the compiler; APIs above it need `Build.VERSION` checks or `@RequiresApi`. Lint reports the unsafe calls.",
            ],
            resources: [
              {
                title: "Application fundamentals",
                url: "https://developer.android.com/guide/components/fundamentals",
                kind: "docs",
              },
              {
                title: "App manifest overview",
                url: "https://developer.android.com/guide/topics/manifest/manifest-intro",
                kind: "docs",
              },
              {
                title: "Configure your build",
                url: "https://developer.android.com/build",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "create-a-basic-hello-world-app",
          "If the first app does not install and launch, every later failure is ambiguous between code, Gradle and device state.",
          [
            "ComponentActivity and setContent",
            "Compose previews and @Preview parameters",
            "Emulator API levels and ABI selection",
            "adb install and logcat launch filtering",
            "Application ID versus Kotlin package name",
          ],
          "Run the app on an emulator with `./gradlew installDebug`, launch it with `adb shell am start -n com.example.app/.MainActivity` after replacing the ID, and paste the `ActivityTaskManager` start line from `adb logcat`.",
          {
            summary:
              "A first Compose app wires a `ComponentActivity`, `setContent` and a theme into one installable APK; an `@Preview` renders the same composable in Android Studio. Running it on an emulator verifies the build, install, launch and crash-reporting path before architecture arrives.",
            difficulty: "foundation",
            minutes: 40,
            pitfalls: [
              "Using an application ID that already exists on the device; install fails with `INSTALL_FAILED_UPDATE_INCOMPATIBLE`. Change the ID or uninstall the old app.",
              'Launching an activity with no exported launcher filter; the system cannot resolve the intent. Set `android:exported="true"` with the launcher filter.',
              "Running on an emulator image whose API level or ABI the APK does not support; create a matching AVD instead of guessing.",
            ],
            resources: [
              {
                title: "Build a simple app with Compose",
                url: "https://developer.android.com/codelabs/basic-android-kotlin-compose-first-app",
                kind: "docs",
              },
              {
                title: "Create a project in Android Studio",
                url: "https://developer.android.com/studio/projects/create-project",
                kind: "docs",
              },
              {
                title: "Run apps on the Android Emulator",
                url: "https://developer.android.com/studio/run/emulator",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "app-model",
      title: "The Android app model",
      description:
        "Understand how Android starts, stops and recreates your app. You will trace an activity through its lifecycle, hand off work to a service and explain what survives process death.",
      topics: [
        topic(
          "app-components",
          "Without the component model you cannot explain why Android starts a process, recreates a screen or delivers an event while the app is closed.",
          [
            "Activities, services, receivers and content providers",
            "Manifest declarations and intent filters",
            "Component activation and process creation",
            "Exported versus non-exported components",
            "Application class and process-wide initialization",
          ],
          "Declare a second activity, launch it with `adb shell am start -n`, then paste the output of `adb shell dumpsys activity activities` showing both activities in one process.",
          {
            summary:
              "Android defines four component types: activities, services, broadcast receivers and content providers. Each is a system entry point declared in the manifest or registered at runtime, in a process whose lifetime the app does not control, through an intent, content resolver or system event.",
            difficulty: "foundation",
            minutes: 35,
            pitfalls: [
              "Doing heavy work in `Application.onCreate`; it runs before every component and delays cold start. Move initialization behind lazily created dependencies.",
              'Leaving a component exported without a permission; any app can start it. Set `android:exported="false"` unless an external caller is required.',
              "Assuming a service runs in its own process; it does not unless `android:process` is set. Separate processes also split memory and static state.",
            ],
          },
        ),
        topic(
          "activity",
          "Back handling, deep links and process death all cross the activity boundary; treating them as Compose bugs hides the real owner.",
          [
            "Task affinity and launch modes",
            "Window, decor view and setContent",
            "Intent extras and ActivityResultContract",
            "Saved instance state versus ViewModel state",
            "Single-activity architecture and deep links",
          ],
          "Launch `com.example.app/.DetailActivity` with an extra via `adb shell am start -n com.example.app/.DetailActivity --es id 42` after replacing the ID, rotate, and paste the logcat lines showing the extra survives recreation.",
          {
            summary:
              "An `Activity` is a window-owning component with lifecycle callbacks, task affinity and an intent that started it. Compose apps usually keep one activity and swap composables, but the activity still owns the window, saved state and result contracts.",
            difficulty: "foundation",
            minutes: 45,
            pitfalls: [
              "Storing UI state in activity fields and assuming rotation preserves it; the instance is destroyed. Use `ViewModel` or `rememberSaveable`.",
              'Using `launchMode="singleInstance"` to stop duplicate screens; it breaks the back stack and task behavior. Use `singleTop` or navigation flags deliberately.',
              "Reading `intent` extras directly in composition on every recomposition; remember the parsed value or read it once in the ViewModel factory.",
            ],
          },
        ),
        topic(
          "activity-lifecycle",
          "Method memorization fails on rotation and process death; without the state model, `remember` values vanish and crashes appear only after backgrounding.",
          [
            "Created, started, resumed, paused, stopped and destroyed transitions",
            "Configuration change recreation and retained instances",
            "Process death and saved instance state",
            "lifecycleScope and repeatOnLifecycle",
            "LifecycleOwner and LifecycleObserver contracts",
          ],
          "Add lifecycle logging, rotate the device, background with `adb shell input keyevent KEYCODE_HOME`, kill with `adb shell am kill`, then restore and paste the callback sequence.",
          {
            summary:
              "The activity lifecycle moves through created, started, resumed, paused, stopped and destroyed states as visibility and focus change. Configuration changes destroy and recreate the instance while the task survives, and process death can skip callbacks entirely.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Registering a listener in `onStart` and removing it in `onDestroy`; it receives events while stopped and leaks. Pair start with stop.",
              "Assuming `onDestroy` runs on process death; it does not. Persist durable state by `onStop` and restore it from saved state or storage.",
              "Launching a `lifecycleScope` collector without `repeatOnLifecycle`; it keeps collecting behind the lock screen. Restart collection at STARTED.",
            ],
            resources: [
              {
                title: "The activity lifecycle",
                url: "https://developer.android.com/guide/components/activities/activity-lifecycle",
                kind: "docs",
              },
              {
                title: "Processes and app lifecycle",
                url: "https://developer.android.com/guide/components/activities/process-lifecycle",
                kind: "docs",
              },
              {
                title: "Handle configuration changes",
                url: "https://developer.android.com/guide/topics/resources/runtime-changes",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "fragments",
          "A fragment's view can be destroyed while the fragment object lives, and binding to the dead view crashes or leaks in legacy screens.",
          [
            "Fragment lifecycle versus view lifecycle",
            "FragmentManager and back-stack records",
            "View binding cleanup in onDestroyView",
            "ComposeView interop and ViewCompositionStrategy",
            "DialogFragment and fragment result APIs",
          ],
          "Host a `ComposeView` inside a fragment, navigate away, and paste the logcat sequence proving `onDestroyView` ran and released the binding.",
          {
            summary:
              "A fragment is a reusable UI controller with its own lifecycle nested inside an activity or another fragment. Compose replaces most fragment layout XML, but fragments still host navigation and legacy screens, so view lifecycle and back-stack behavior still matter.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Holding a view binding in a fragment field after `onDestroyView`; the destroyed view leaks. Null the binding in `onDestroyView`.",
              "Calling `requireContext()` after detach; it throws `IllegalStateException`. Use the view lifecycle or a null-safe access with a guard.",
              "Letting FragmentManager restore a fragment and adding a new instance on rotation; the UI duplicates. Restore by tag or trust the saved state.",
            ],
            resources: [
              {
                title: "Fragments guide",
                url: "https://developer.android.com/guide/fragments",
                kind: "docs",
              },
              {
                title: "Fragment lifecycle",
                url: "https://developer.android.com/guide/fragments/lifecycle",
                kind: "docs",
              },
              {
                title: "Create a fragment",
                url: "https://developer.android.com/guide/fragments/create",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "services",
          "Treating a service as a background thread produces ANRs and killed work, because component lifetime is not thread lifetime.",
          [
            "Started versus bound service lifetimes",
            "Foreground service types and notifications",
            "startForegroundService timing requirements",
            "Background execution limits since API 26",
            "ServiceConnection and IBinder binding",
          ],
          "Start a foreground service from a button, observe its notification, stop it, and paste `adb shell dumpsys activity services` before and after.",
          {
            summary:
              "A service is a UI-less component whose lifecycle callbacks run on the process's main thread until it is stopped or unbound. Started, bound and foreground services have different lifetime contracts, and background execution limits since API 26 restrict when a background service may run.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Calling `startForegroundService` without a prompt `startForeground`; the system throws `ForegroundServiceDidNotStartInTimeException`. Post the notification immediately.",
              "Running blocking work in `onStartCommand`; it executes on the main thread and triggers an ANR. Dispatch to a coroutine or WorkManager.",
              "Declaring the wrong foreground service type; Android 14 requires a type and matching permission. Match the type to the actual use case.",
            ],
            resources: [
              {
                title: "Services overview",
                url: "https://developer.android.com/guide/components/services",
                kind: "docs",
              },
              {
                title: "Bound services overview",
                url: "https://developer.android.com/guide/components/bound-services",
                kind: "docs",
              },
              {
                title: "Foreground services",
                url: "https://developer.android.com/develop/background-work/services/fgs",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "intent",
          "An implicit intent can resolve to nothing or to the wrong app, and unvalidated extras in an exported component are an attack surface.",
          [
            "Explicit versus implicit intents",
            "Intent filters, actions, categories and data",
            "ActivityResultContract and the result registry",
            "Exported components and permission checks",
            "Extras, ClipData and Binder transaction limits",
          ],
          "Send an implicit `ACTION_SEND` intent, log every package returned by `queryIntentActivities`, then add a chooser and paste the resolver list from logcat.",
          {
            summary:
              "An intent is a message object that names a component explicitly or describes an action for the system to resolve. Extras cross a process boundary, so payload size, type safety and exported components become part of the interface.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Sending a large bitmap in extras and crashing with `TransactionTooLargeException`; pass a content URI instead.",
              "Exporting an intent-filter activity without validating its input; any app can invoke it. Validate extras and require a signature permission.",
              "Assuming an implicit intent always resolves; `resolveActivity` can return null. Handle the no-handler case with a visible message.",
            ],
            resources: [
              {
                title: "Intent reference",
                url: "https://developer.android.com/reference/android/content/Intent",
                kind: "docs",
              },
              {
                title: "Intents and intent filters",
                url: "https://developer.android.com/guide/components/intents-filters",
                kind: "docs",
              },
              {
                title: "Common intents",
                url: "https://developer.android.com/guide/components/intents-common",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
    {
      slug: "compose-ui",
      title: "Compose UI",
      description:
        "Build UI as a function of state. You will compose layouts, handle input and recomposition, and inspect why a composable rebuilt or skipped.",
      topics: [
        topic(
          "jetpack-compose",
          "Without composition and recomposition, state hoisting and `remember` look like style choices instead of correctness requirements.",
          [
            "Composable functions and the Compose compiler",
            "Composition, recomposition and skipping",
            "Snapshot state reads and invalidation scopes",
            "Modifiers as ordered, immutable chains",
            "Compose UI versus the View system",
          ],
          "Build a counter, log recompositions in parent and child composables, then move the state read into a lambda and paste the before and after logcat counts.",
          {
            summary:
              "Compose executes composable functions to describe the current state, then reconciles the result against the previous composition. There is no mutable view tree; the runtime records state reads and recomposes only scopes whose inputs changed.",
            difficulty: "foundation",
            minutes: 40,
            pitfalls: [
              "Reading mutable state in a parent that does not render it, so every change recomposes the whole subtree. Pass lambdas that read state at the leaf.",
              "Assuming a composable runs once; it can run many times. Put side effects in `LaunchedEffect` or `DisposableEffect`.",
              "Chaining modifiers in arbitrary order; `padding` before `background` changes what is painted. Treat order as part of the layout.",
            ],
          },
        ),
        topic(
          "column--row",
          "Most Compose layout bugs are axis and constraint mistakes; a missing weight or an unbounded parent looks like a rendering bug.",
          [
            "Main-axis arrangement and cross-axis alignment",
            "RowScope and ColumnScope weight distribution",
            "Intrinsic measurement and unbounded constraints",
            "Arrangement.spacedBy and content padding",
            "Nested scroll containers and bounded height",
          ],
          "Build a row with three weighted children, log each width with `Modifier.onGloballyPositioned`, remove one weight, and paste both width distributions.",
          {
            summary:
              "`Column` and `Row` place children along one axis and expose arrangement, alignment and weight. Their measurement passes decide how remaining space is distributed, so unbounded parents and weighted children change the result.",
            difficulty: "foundation",
            minutes: 35,
            pitfalls: [
              "Putting a scrollable `Column` inside another scrollable column; infinite height constraints throw. Use one lazy container or a fixed height.",
              "Applying `weight` to a child that also fills the main axis; weight already assigns that size. Keep the weight and remove the redundant fill.",
              "Expecting `horizontalArrangement` to control vertical alignment; use `verticalAlignment` for the cross axis.",
            ],
          },
        ),
        topic(
          "box",
          "Stacking without z-order and hit-testing rules produces overlays that swallow clicks or collapse to the wrong size.",
          [
            "Declaration order as z-order",
            "contentAlignment versus child align modifiers",
            "matchParentSize and fillMaxSize constraints",
            "Pointer input and overlapping hit targets",
            "BoxWithConstraints and measurement queries",
          ],
          "Build a Box with an image, a clickable scrim and a badge; write a Compose UI test that clicks the badge, then move the badge below the scrim and paste the failing assertion.",
          {
            summary:
              "`Box` stacks children in declaration order along the z-axis and aligns them within the same constraints. It is the primitive behind overlays, badges and scrims, and pointer input goes to the topmost child that handles it.",
            difficulty: "foundation",
            minutes: 30,
            pitfalls: [
              "Placing a clickable overlay after the content and blocking the content's clicks; later children sit on top and consume input.",
              "Using `fillMaxSize` on a child inside a Box with unbounded height; use `matchParentSize` when the child should track the box.",
              "Expecting `contentAlignment` to override a child's explicit `align`; the child modifier wins.",
            ],
          },
        ),
        topic(
          "text",
          "Unbounded text is the common cause of clipped labels and broken rows, and font scaling exposes sizes that were fixed in dp.",
          [
            "TextStyle, typography and LocalTextStyle inheritance",
            "AnnotatedString and SpanStyle ranges",
            "maxLines, overflow and softWrap behavior",
            "Font scaling and sp units",
            "textAlign and layout direction",
          ],
          "Render a long label at font scale 2.0 with and without `maxLines` and `TextOverflow.Ellipsis`, then paste screenshots and the measured height from a UI test.",
          {
            summary:
              "`Text` renders a `String` or `AnnotatedString` through a resolved `TextStyle`, applying font, size, color and line layout. Measurement depends on constraints, so long content needs explicit line limits, overflow behavior and font-scale testing.",
            difficulty: "foundation",
            minutes: 30,
            pitfalls: [
              "Hard-coding text sizes in `dp`; they do not follow the user's font setting. Use `sp` or a theme `TextUnit`.",
              "Fixing a row height around a single-line label; at 200% font scale the label clips. Let the row wrap or set `maxLines` with a documented ellipsis.",
              "Building styled text by concatenating strings; span boundaries and accessibility semantics are lost. Use `AnnotatedString`.",
            ],
          },
        ),
        topic(
          "button",
          "Buttons that look disabled but stay clickable, or lack semantics, fail accessibility checks and user expectation.",
          [
            "Filled, tonal, outlined and text button emphasis",
            "enabled state and InteractionSource",
            "Button semantics versus Modifier.clickable",
            "Minimum touch target and content padding",
            "Accessibility roles and state descriptions",
          ],
          "Add three button variants, disable one, and run a Compose UI test that asserts the disabled button is not enabled; paste the `connectedDebugAndroidTest` result.",
          {
            summary:
              "A Compose button is a clickable surface with a content slot, an interaction source and a minimum touch target. Material variants express emphasis, while `enabled` and semantics determine how accessibility services announce the control.",
            difficulty: "foundation",
            minutes: 30,
            pitfalls: [
              "Using `Modifier.clickable` on a `Text` for a primary action; it has no button role or ripple. Use a `Button` or add role and indication.",
              "Disabling a button only by changing its color; the click handler still runs. Set `enabled = false` and guard the action.",
              "Forcing a fixed height smaller than 48dp; the touch target shrinks below the accessibility minimum. Keep the default minimum size.",
            ],
          },
        ),
        topic(
          "remember--state",
          "Mixing `remember` with recreation loses input on rotation, while saving derived state fills the bundle with values that can be recomputed.",
          [
            "remember versus rememberSaveable retention",
            "mutableStateOf and structural equality policy",
            "State hoisting and single source of truth",
            "derivedStateOf and snapshot reads",
            "Saver and custom state restoration",
          ],
          "Build a text field backed by `remember`, rotate the device, capture the lost value, then switch to `rememberSaveable` and paste both logcat results.",
          {
            summary:
              "`remember` keeps a value for the life of a composition, and `rememberSaveable` also writes it into the saved-instance-state bundle. State reads invalidate the nearest recomposition scope, so where state is created decides ownership and what survives recreation.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Creating state inside a composable that leaves composition; `remember` is discarded. Hoist it above the conditional or into a ViewModel.",
              "Mutating a list held in `mutableStateOf` and expecting recomposition; the list identity does not change. Use `mutableStateListOf` or assign a new list.",
              "Storing a complex object in `rememberSaveable` without a `Saver`; it fails at runtime. Provide a `listSaver` or make the type parcelable.",
            ],
          },
        ),
      ],
    },
    {
      slug: "navigation-and-lists",
      title: "Navigation and lists",
      description:
        "Build a multi-screen app that stays fast with large data sets. You will add a nav graph, a scaffold and a lazy list, then verify back-stack and state restoration behavior.",
      topics: [
        topic(
          "lazy-column--row",
          "Without keys and stable content types, scrolling moves state to the wrong row and data changes reset the viewport.",
          [
            "LazyListState and viewport composition",
            "Item keys and content type stability",
            "contentPadding versus Modifier.padding",
            "Nested scrolling and fixed-height constraints",
            "Paging and incremental data sources",
          ],
          "Build a 1,000-row LazyColumn with stateful rows, scroll to item 500, remove an item at the top, and paste the scroll offset and row state before and after adding keys.",
          {
            summary:
              "`LazyColumn` and `LazyRow` compose only the items visible in the viewport and dispose off-screen content as it scrolls. Item keys and stable content types decide whether row state moves with an item or is reused for the wrong one.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Using the list index as a key; inserting at the front moves every row's state. Use a stable server or database ID.",
              "Putting a LazyColumn inside a vertically scrolling Column; the inner list receives infinite height and crashes. Use one lazy container or a fixed height.",
              "Applying `Modifier.padding` to the list instead of `contentPadding`; the padding sits outside the scrollable area, so items clip at the edges and the first and last items lose their inset.",
            ],
          },
        ),
        topic(
          "scaffold",
          "Ignoring scaffold insets hides content under the status bar or keyboard and duplicates padding after edge-to-edge.",
          [
            "Scaffold slots and PaddingValues",
            "WindowInsets and edge-to-edge drawing",
            "SnackbarHostState and coroutine scope",
            "TopAppBar and scroll behavior",
            "Nested scaffolds and padding duplication",
          ],
          "Build a Scaffold with a top bar and FAB, enable edge-to-edge, and paste Layout Inspector bounds for the content with and without applying `innerPadding`.",
          {
            summary:
              "`Scaffold` reserves slots for a top bar, bottom bar, snackbar host and floating action button, and accounts for content insets. It passes `PaddingValues` to the body so system bars and app bars do not overlap the content.",
            difficulty: "core",
            minutes: 35,
            pitfalls: [
              "Applying `innerPadding` in both the scaffold and the screen; content shrinks twice. Apply it exactly where the content consumes insets.",
              "Nesting scaffolds and stacking two top bars; use one scaffold per screen and let navigation own the outer chrome.",
              "Calling `showSnackbar` outside a coroutine; launch it from `rememberCoroutineScope()` and cancel with the screen.",
            ],
          },
        ),
        topic(
          "drawer",
          "A drawer that tracks its own selection drifts from the destination after back or a deep link, and gestures can steal horizontal scrolls.",
          [
            "ModalNavigationDrawer and ModalDrawerSheet",
            "DrawerState and coroutine open/close",
            "gesturesEnabled and edge-drag conflicts",
            "Drawer content versus permanent navigation rail",
            "Selection derived from the back stack",
          ],
          "Add a drawer to a two-destination app, deep link to the second destination, and paste the highlighted item before and after deriving selection from the nav back stack.",
          {
            summary:
              "A modal navigation drawer is a `ModalNavigationDrawer` controlled by `DrawerState`, with destinations listed inside a sheet. It is a navigation surface, so the selected item must track the back stack rather than local click state.",
            difficulty: "core",
            minutes: 35,
            pitfalls: [
              "Keeping `selectedItem` in local state and updating it on click; back navigation leaves the wrong item highlighted. Derive it from the current back-stack entry.",
              "Leaving drawer gestures enabled on a screen with a horizontal pager; the drawer wins the drag. Disable gestures or scope the drawer.",
              "Listing destinations without navigation-bar insets; the last item sits under the system bar. Apply the drawer sheet's insets.",
            ],
          },
        ),
        topic(
          "navigation-components",
          "Manual screen switching loses deep links, back behavior and state restoration that the nav graph handles centrally.",
          [
            "NavGraph, destinations and route patterns",
            "NavController and back-stack entries",
            "Type-safe routes and argument encoding",
            "Deep links and argument parsing",
            "Nested graphs and scoped ViewModels",
          ],
          'Add a nested graph with one argument, open it with `adb shell am start -a android.intent.action.VIEW -d "myapp://detail/42"`, and paste the resolved argument plus the back stack.',
          {
            summary:
              "Navigation Compose models destinations as routes in a graph and owns a back stack inside the activity task. The graph resolves arguments, deep links and transitions, and the current entry drives selection, analytics and saved state.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Passing complex objects through route strings; type safety and size limits disappear. Pass IDs and reload from the repository.",
              "Calling `navigate` directly in composition; it runs on every recomposition. Trigger it from an event or `LaunchedEffect`.",
              "Treating the activity back stack and the nav back stack as the same thing; the NavController owns its own stack inside one activity.",
            ],
            resources: [
              {
                title: "Navigation overview",
                url: "https://developer.android.com/guide/navigation",
                kind: "docs",
              },
              {
                title: "Get started with the Navigation component",
                url: "https://developer.android.com/guide/navigation/navigation-getting-started",
                kind: "docs",
              },
              {
                title: "Back stack and multiple back stacks",
                url: "https://developer.android.com/guide/navigation/backstack",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "navhost",
          "Recreating a `NavController` during recomposition resets the back stack, and a route typo compiles but fails only at runtime.",
          [
            "NavHost and composable destination builders",
            "rememberNavController and state restoration",
            "Route constants and argument placeholders",
            "Enter and exit transition specifications",
            "TestNavHostController and navigation assertions",
          ],
          "Write a Compose UI test with `TestNavHostController` that starts on a list, clicks an item, and asserts the detail route and argument; paste the passing test output.",
          {
            summary:
              "`NavHost` is the composable that hosts a nav graph and swaps in the current destination's content. It is created once per `NavController`, and its route strings form the contract shared by screens, deep links and tests.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Creating a `NavController` without `remember`; each recomposition resets navigation. Use `rememberNavController()`.",
              "Duplicating route strings across files; a typo compiles and fails at runtime. Generate routes or keep them in one object.",
              "Calling `popBackStack` on a double tap and popping the start destination; guard the action or use `navigateUp`.",
            ],
          },
        ),
        topic(
          "animations",
          "Animating with delays instead of state desynchronizes from recomposition and breaks when the screen leaves composition.",
          [
            "animate*AsState and spring/tween specs",
            "AnimatedVisibility enter and exit transitions",
            "updateTransition for coordinated properties",
            "Frame clock and animation interruption",
            "Reduced-motion and duration policy",
          ],
          "Animate a panel with `AnimatedVisibility`, set `composeTestRule.mainClock.autoAdvance = false`, advance frames manually, and paste the mid-animation assertion.",
          {
            summary:
              "Compose animations interpolate state changes through `animate*AsState`, `AnimatedVisibility` and transitions on the frame clock. They describe state rather than own it, so an interrupted or recomposed animation continues from the current value.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Driving animation from `LaunchedEffect` with `delay`; it ignores interruption and recomposition. Use `animate*AsState` or `updateTransition`.",
              "Animating layout size without `Modifier.animateContentSize`; the content jumps between sizes. Animate the size or add the modifier.",
              "Using long durations on every screen transition; back navigation feels broken. Keep transitions short and respect reduced motion.",
            ],
          },
        ),
      ],
    },
    {
      slug: "architecture-and-state",
      title: "Architecture and state",
      description:
        "Separate UI, state and data without ceremony. You will implement one screen with MVVM and unidirectional data flow, expose state as a stream and test the state reducer outside Android.",
      topics: [
        topic(
          "mvvm",
          "Logic in composables makes every behavior depend on the Android runtime, and rotation recreates state you forgot to hoist.",
          [
            "View, ViewModel and Model responsibilities",
            "State hoisting and event callbacks",
            "ViewModel lifecycle and SavedStateHandle",
            "Immutable UI state data classes",
            "Dependency injection at the ViewModel boundary",
          ],
          "Move one screen's filtering logic into a ViewModel, then add a JVM test that drives the ViewModel and asserts the filtered list; paste the test output.",
          {
            summary:
              "MVVM puts screen state and decisions in a `ViewModel` and leaves composables to render state and forward events. The boundary is an immutable state object plus event methods, which makes the screen testable on the JVM.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Injecting an Activity or `Context` into a ViewModel; it outlives the screen and leaks. Pass application context or move platform work to the data layer.",
              "Returning Android resources or composables from the ViewModel; it becomes untestable. Expose state and resolve resources in the UI.",
              "Using one global ViewModel for unrelated screens; scope it to the nav entry or activity so state clears with the screen.",
            ],
          },
        ),
        topic(
          "viewmodel-state",
          "Assuming ViewModel state survives process death loses the screen after backgrounding, while stuffing everything into saved state hits binder limits.",
          [
            "ViewModelStore and viewModelScope",
            "SavedStateHandle and process death",
            "StateFlow versus mutableStateOf",
            "collectAsStateWithLifecycle semantics",
            "ViewModel factories and CreationExtras",
          ],
          "Put a query in a ViewModel, rotate, then kill the process with `adb shell am kill` and paste the state before and after adding `SavedStateHandle`.",
          {
            summary:
              "A `ViewModel` retains state across configuration changes because the activity or nav entry owns its store, not the composable. `SavedStateHandle` adds process-death coverage for small serializable values, while durable data belongs in a repository.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Collecting a StateFlow with `collectAsState` instead of `collectAsStateWithLifecycle`; collection continues while the UI is stopped.",
              "Exposing `MutableStateFlow` publicly; callers can write. Expose `StateFlow` and keep mutation private.",
              "Storing a large object in `SavedStateHandle`; it crosses a Binder transaction and can throw. Store IDs and reload.",
            ],
          },
        ),
        topic(
          "mvi",
          "Without a reducer, events race with state updates and the UI can render combinations that never existed as a valid state.",
          [
            "Intent, state and effect separation",
            "Pure reducer functions and transition tests",
            "StateFlow plus Channel for one-shot effects",
            "Unidirectional data flow at the screen boundary",
            "State restoration and process death",
          ],
          "Implement a reducer for a form with three actions, then write a JVM test asserting the full state sequence for submit followed by error; paste the test output.",
          {
            summary:
              "MVI treats every user action as an intent that a reducer turns into a new immutable state plus optional one-shot effects. A single state object makes invalid combinations visible and gives tests a deterministic sequence to assert.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Emitting navigation or snackbar events as state; they replay after rotation. Use a one-shot effect channel or consume them explicitly.",
              "Putting side effects inside the reducer; it stops being pure and tests need mocks. Return effects as data and execute them outside.",
              "Publishing every field as its own StateFlow; combine them into one state so the UI cannot observe a half-updated combination.",
            ],
            resources: [
              {
                title: "Guide to app architecture: UI layer",
                url: "https://developer.android.com/topic/architecture/ui-layer",
                kind: "docs",
              },
              {
                title: "UI state production",
                url: "https://developer.android.com/topic/architecture/ui-layer/state-production",
                kind: "docs",
              },
              {
                title: "StateFlow and SharedFlow",
                url: "https://developer.android.com/kotlin/flow/stateflow-and-sharedflow",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "repository-pattern",
          "Without a data boundary every screen reimplements caching and error mapping, and swapping a source becomes a screen-by-screen rewrite.",
          [
            "Repository as the data-layer boundary",
            "Local and remote data sources",
            "Single source of truth and cache policy",
            "Domain error and result mapping",
            "Dependency injection and test fakes",
          ],
          "Introduce a repository backed by an in-memory source, add a fake for tests, and paste the test proving the ViewModel does not know whether data came from network or cache.",
          {
            summary:
              "A repository hides databases, network clients and caches behind a domain-oriented API. It centralizes cache policy, conflict resolution and error mapping, and defines what the rest of the app means by a successful read.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Making the repository a pass-through with one method per DAO call; it adds layers without policy. Put cache and conflict rules there.",
              "Returning database entities directly; schema changes leak into the UI. Map to domain models at the boundary.",
              "Hiding failures behind an empty list; the UI cannot distinguish no data from a failed request. Model the result explicitly.",
            ],
            resources: [
              {
                title: "Guide to app architecture: Data layer",
                url: "https://developer.android.com/topic/architecture/data-layer",
                kind: "docs",
              },
              {
                title: "Offline-first app architecture",
                url: "https://developer.android.com/topic/architecture/data-layer/offline-first",
                kind: "docs",
              },
              {
                title: "Manual dependency injection",
                url: "https://developer.android.com/training/dependency-injection/manual",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "flow",
          "Treating Flow as a LiveData replacement ignores cold collection and cancellation, which appears as duplicate requests and leaked collectors.",
          [
            "Cold Flow versus hot StateFlow and SharedFlow",
            "Operators: map, debounce and flatMapLatest",
            "flowOn and dispatcher boundaries",
            "Exception handling with catch and retry",
            "Lifecycle-aware collection",
          ],
          "Debounce a search query Flow by 300 ms, log every upstream emission, and use `flatMapLatest` to cancel an in-flight request; paste the log proving cancellation.",
          {
            summary:
              "`Flow` is a cold stream whose operators run for each collector, while `StateFlow` and `SharedFlow` are hot and outlive individual collectors. Dispatchers, cancellation and operator choice determine where work runs and whether stale emissions reach the UI.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Using `flatMapMerge` for search and letting a stale response overwrite a newer one; use `flatMapLatest`.",
              "Placing `flowOn` after an operator and expecting that operator to move; `flowOn` changes only the upstream context.",
              "Collecting a cold Flow twice and issuing two network requests; share it or hoist collection into the ViewModel.",
            ],
            resources: [
              {
                title: "Kotlin Flow",
                url: "https://kotlinlang.org/docs/flow.html",
                kind: "docs",
              },
              {
                title: "Flow on Android",
                url: "https://developer.android.com/kotlin/flow",
                kind: "docs",
              },
              {
                title: "StateFlow and SharedFlow",
                url: "https://developer.android.com/kotlin/flow/stateflow-and-sharedflow",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "side-effects",
          "Effects in the composable body repeat on every recomposition, and missing cleanup leaks listeners and coroutines.",
          [
            "LaunchedEffect keys and coroutine lifetime",
            "DisposableEffect and cleanup ordering",
            "rememberCoroutineScope for event-scoped work",
            "rememberUpdatedState for captured lambdas",
            "SideEffect and snapshot state writes",
          ],
          "Register a location listener with `DisposableEffect`, navigate away, and paste the logcat lines proving registration and unregistration each happen once.",
          {
            summary:
              "A side effect is work that leaves composition: launching a coroutine, registering a listener or writing storage. Compose keys effects to the composition lifetime so the work starts, restarts and cleans up with its inputs.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Launching a network call in the composable body; it runs on every recomposition. Use `LaunchedEffect(key)` or an event callback.",
              "Passing a changing lambda into a long-lived `LaunchedEffect` without `rememberUpdatedState`; it captures the old value.",
              "Forgetting `onDispose` and leaking a listener or sensor; unregister in the disposal block.",
            ],
          },
        ),
      ],
    },
    {
      slug: "async-and-persistence",
      title: "Async and persistence",
      description:
        "Move work off the main thread and store data that outlives the process. You will use coroutines, choose Room or DataStore, schedule guaranteed work and prove the main thread is not blocked.",
      topics: [
        topic(
          "coroutines",
          "Unstructured `GlobalScope` launches outlive screens, cannot be cancelled, and hide failures that should reach the UI.",
          [
            "suspend functions and continuations",
            "CoroutineScope, Job and structured concurrency",
            "Dispatchers.Main, IO and Default",
            "Cancellation and cooperative checks",
            "Exception propagation and CoroutineExceptionHandler",
          ],
          "Launch two children in `viewModelScope`, cancel the parent, and paste the cancellation log proving both children stopped; then remove one `GlobalScope` launch.",
          {
            summary:
              "Coroutines suspend a function without blocking its thread, and structured concurrency ties children to a parent scope. On Android, `viewModelScope` and `lifecycleScope` cancel with their owner, while dispatchers select the thread that runs the work.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Catching `CancellationException` and swallowing it; cancellation stops propagating. Rethrow it or call `ensureActive`.",
              "Using `Dispatchers.IO` for CPU work; it is sized for blocking calls. Use `Dispatchers.Default` for computation.",
              "Launching from `GlobalScope` because it compiles; the work outlives the screen. Use a lifecycle or ViewModel scope.",
            ],
            resources: [
              {
                title: "Coroutines overview",
                url: "https://kotlinlang.org/docs/coroutines-overview.html",
                kind: "docs",
              },
              {
                title: "Coroutines on Android",
                url: "https://developer.android.com/kotlin/coroutines",
                kind: "docs",
              },
              {
                title: "Coroutine context and dispatchers",
                url: "https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "threads",
          "A database read on the main thread looks fine on a fast device and becomes an ANR under production data and load.",
          [
            "Main thread, RenderThread and binder threads",
            "Frame budget and Choreographer callbacks",
            "ANR traces and main-thread stacks",
            "Handler, Looper and thread confinement",
            "StrictMode disk and network detection",
          ],
          "Enable StrictMode with `detectDiskReads` and `detectNetwork`, perform a blocking read on the main thread, and paste the policy violation from logcat.",
          {
            summary:
              "Each app process has a main thread for input, layout and frame submission, a RenderThread for GPU work, a binder thread pool and any background threads the app creates. Blocking the main thread past the frame budget causes jank, and a long enough block causes an ANR.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Assuming a coroutine always runs off the main thread; `launch` inherits its dispatcher. Set `Dispatchers.IO` explicitly for blocking work.",
              "Writing Compose state from a background thread; snapshot writes belong on the main thread or behind a flow.",
              "Using `Thread.sleep` inside a coroutine; it blocks the dispatcher thread. Use `delay`.",
            ],
            resources: [
              {
                title: "Processes and threads overview",
                url: "https://developer.android.com/guide/components/processes-and-threads",
                kind: "docs",
              },
              {
                title: "Threading in Android",
                url: "https://developer.android.com/topic/performance/threads",
                kind: "docs",
              },
              {
                title: "StrictMode reference",
                url: "https://developer.android.com/reference/android/os/StrictMode",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "workmanager",
          "Sync in a service or bare coroutine dies with the process, and retry and constraint logic gets reinvented incorrectly.",
          [
            "Worker, CoroutineWorker and doWork",
            "Constraints, backoff and retry policy",
            "Unique work and ExistingWorkPolicy",
            "Work chains and input/output Data",
            "Expedited work and foreground info",
          ],
          "Schedule a one-time worker with a network constraint, inspect it with `adb shell dumpsys jobscheduler`, and paste the job entry plus the worker result.",
          {
            summary:
              "WorkManager schedules deferrable work that must survive process death and reboot, with constraints, backoff and unique work names. It is built for sync and upload, not for work the user is waiting on right now.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Returning `Result.retry()` for a permanent failure; it loops until the backoff budget is exhausted. Return `failure()` and surface the error.",
              "Doing more than ten minutes of work without `setForeground`; the worker is stopped. Promote it to a foreground worker.",
              "Calling `enqueue` repeatedly with the same work name; duplicate syncs stack up. Use `enqueueUniqueWork`.",
            ],
            resources: [
              {
                title: "WorkManager overview",
                url: "https://developer.android.com/topic/libraries/architecture/workmanager",
                kind: "docs",
              },
              {
                title: "WorkManager basics",
                url: "https://developer.android.com/topic/libraries/architecture/workmanager/basics",
                kind: "docs",
              },
              {
                title: "Define work with WorkRequest",
                url: "https://developer.android.com/topic/libraries/architecture/workmanager/how-to/define-work",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "room-database",
          "Raw SQLite hides schema drift and cursor errors until runtime, and an unindexed query turns slow only on real data.",
          [
            "Entities, DAOs and the RoomDatabase class",
            "Compile-time query verification",
            "Schema export and migration testing",
            "Flow queries and invalidation tracking",
            "Transactions, relations and indices",
          ],
          "Add an entity with an index, write a DAO query, export the schema, and paste the generated schema JSON plus an `EXPLAIN QUERY PLAN` for the query.",
          {
            summary:
              "Room maps Kotlin classes to SQLite tables and verifies DAO queries at compile time. It adds observable `Flow` queries, transactions and migrations, while schema design and indices remain explicit decisions.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Changing an entity without a migration and enabling destructive migration in production; user data is wiped. Write and test the migration.",
              "Querying on the main thread; Room throws or blocks frames. Expose a Flow and collect off the main thread.",
              "Storing a list as a comma-separated string; joins and indices cannot use it. Use a relation table or a documented converter.",
            ],
          },
        ),
        topic(
          "datastore",
          "SharedPreferences' synchronous writes and listener model cause main-thread stalls and reads that disagree across processes.",
          [
            "Preferences DataStore versus Proto DataStore",
            "DataStore<T> and updateData transactions",
            "Atomic reads and writes",
            "Flow observation and corruption handling",
            "Migration from SharedPreferences",
          ],
          "Migrate three preference keys to Preferences DataStore, then run a test that updates a value and asserts the emitted Flow; paste the test and migration output.",
          {
            summary:
              "DataStore writes typed data through a single transactional API, with Preferences and Proto variants. It replaces SharedPreferences with asynchronous reads, atomic updates and a `Flow` that emits after each committed change.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Creating multiple DataStore instances for the same file; it throws `IllegalStateException`. Declare one at the top level or in DI.",
              "Calling `first()` in a hot path instead of collecting the Flow; it re-reads on every call. Collect and cache in the ViewModel.",
              "Ignoring `IOException` from `data`; the default value hides corruption. Catch it and surface a recovery path.",
            ],
          },
        ),
        topic(
          "shared-preferences",
          "Using `commit()` on the main thread or trusting listeners across processes produces ANRs and stale UI that are hard to reproduce.",
          [
            "getSharedPreferences and MODE_PRIVATE",
            "apply versus commit write paths",
            "OnSharedPreferenceChangeListener lifetimes",
            "Multi-process cache inconsistency",
            "Migration path to DataStore",
          ],
          "Write a preference with `commit()` on the main thread, capture the StrictMode violation or skipped frames, then repeat with `apply()` and paste both traces.",
          {
            summary:
              "SharedPreferences stores key-value XML behind an in-memory map, with `apply()` writing asynchronously and `commit()` writing synchronously. Legacy code still uses it, but listener and multi-process behavior make it a poor default for new storage.",
            difficulty: "foundation",
            minutes: 30,
            pitfalls: [
              "Calling `commit()` on the main thread and blocking disk I/O; use `apply()` unless the result must be synchronous.",
              "Assuming preference changes propagate across processes immediately; each process caches its own copy. Use DataStore or a content provider.",
              "Storing large or structured data in preferences; the whole file loads into memory. Use a database or a file.",
            ],
          },
        ),
      ],
    },
    {
      slug: "networking-and-platform",
      title: "Networking and platform services",
      description:
        "Connect to remote services and the Android platform without leaking resources. You will add an HTTP client, parse errors, authenticate, and choose between FCM, Remote Config and Play Services.",
      topics: [
        topic(
          "okhttp",
          "A client per request exhausts sockets and loses the connection pool, while blind retries duplicate non-idempotent writes.",
          [
            "OkHttpClient, dispatcher and connection pool",
            "Application versus network interceptors",
            "Request and response body ownership",
            "Timeouts and retryOnConnectionFailure",
            "Cache control and EventListener timing",
          ],
          "Add an `EventListener` that logs `connectionAcquired` and `callEnd`, run three sequential requests, and paste the log proving the connection was reused.",
          {
            summary:
              "OkHttp is an HTTP client with connection pooling, interceptors, caching and a dispatcher that bounds concurrent calls. Interceptors handle headers, retries and logging on every request, so they must be thread-safe and cheap.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Building a new `OkHttpClient` for each call; it drops the pool and thread pools. Share one instance.",
              "Reading a response body twice or never closing it; connections leak. Use `use { }` and read once.",
              "Retrying a POST in an interceptor without an idempotency key; the server may create duplicates. Retry only idempotent calls.",
            ],
          },
        ),
        topic(
          "retro",
          "Without a declared API interface and error mapping, HTTP status handling and JSON parsing leak into ViewModels as string checks.",
          [
            "Retrofit interface annotations and path parameters",
            "Converter factories and kotlinx.serialization",
            "suspend functions versus Response<T>",
            "Non-2xx bodies and HttpException",
            "MockWebServer contract tests",
          ],
          "Define a Retrofit interface for two endpoints, test a 200 and a 404 with MockWebServer, and paste both assertions plus the parsed error body.",
          {
            summary:
              "Retrofit turns an annotated Kotlin interface into HTTP calls and delegates transport to OkHttp. Converter factories parse bodies, call adapters bridge suspend functions, and the interface becomes the API contract a fake can implement.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Returning the body directly and losing the status code; return `Response<T>` when errors need inspection.",
              "Using a base URL without a trailing slash; Retrofit throws `IllegalArgumentException`. End it with `/` and use relative paths.",
              "Ignoring `HttpException` and crashing on a 500; map non-2xx responses to a domain error at the data layer.",
            ],
          },
        ),
        topic(
          "authentication",
          "Tokens in plain preferences or logs leak credentials, and parallel refreshes race each other and can invalidate the session.",
          [
            "OAuth 2.0 authorization code with PKCE",
            "Credential Manager and Google Sign-In",
            "Access versus refresh token lifetimes",
            "Android Keystore and encrypted storage",
            "Single-flight token refresh",
          ],
          "Wire Credential Manager sign-in, log the token type and expiry without the token, then force a 401 and paste the refresh and retry trace.",
          {
            summary:
              "Android authentication combines an identity provider, a token exchange and local credential storage. Tokens belong in Keystore-backed storage or Credential Manager, never in plain preferences or logs, and refresh must be single-flight.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Logging the authorization header or token; it reaches logcat and crash reports. Redact headers in interceptors.",
              "Refreshing on every 401 concurrently; parallel refreshes race. Guard the refresh with a mutex or a single-flight.",
              "Storing tokens in plain `SharedPreferences`; a rooted device or backup exposes them. Use Credential Manager or Keystore encryption.",
            ],
          },
        ),
        topic(
          "cloud-messaging",
          "Assuming every message runs app code in the background leaves work undone; payload type and app state decide who handles it.",
          [
            "Registration tokens and token refresh",
            "Notification versus data message payloads",
            "Message priority and delivery policy",
            "Notification channels and POST_NOTIFICATIONS",
            "Topic messaging and condition subscriptions",
          ],
          "Send a data message from the Firebase console, log the `onMessageReceived` payload, then repeat in the background and paste the two logcat paths.",
          {
            summary:
              "Firebase Cloud Messaging delivers notification and data messages to a device token through Google Play services. Notification payloads are rendered by the system when the app is backgrounded, while data payloads reach app code only within delivery policy.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Sending a notification payload and expecting `onMessageReceived` in the background; the system handles it and skips the callback.",
              "Posting without a notification channel on API 26+; the notification is dropped. Create the channel before posting.",
              "Treating the FCM token as permanent; it rotates. Delete the old token on refresh and on logout.",
            ],
          },
        ),
        topic(
          "google-play-services",
          "Assuming Play services exists on every device breaks apps on AOSP builds, and version-gated APIs fail only at runtime.",
          [
            "GoogleApiAvailability and status codes",
            "Play services version and API availability checks",
            "Location permissions and resolution flow",
            "Play services APIs versus platform APIs",
            "AOSP and non-GMS device behavior",
          ],
          "Add a Play services availability check, run the app on an emulator without Play services, and paste the status code plus the degraded UI path.",
          {
            summary:
              "Google Play services is an updatable system layer that supplies location, maps, auth and FCM outside the app's APK. Availability depends on the device and service version, so each call needs a check and a degraded path.",
            difficulty: "foundation",
            minutes: 35,
            pitfalls: [
              "Calling a Play services API without `GoogleApiAvailability`; it throws or silently fails. Check availability and route to an error path.",
              "Depending on the full Play services library instead of granular artifacts; the APK grows for unused APIs. Depend only on what is used.",
              "Requesting location permission without handling denial; the app blocks on a dialog. Model denied and permanently denied states.",
            ],
          },
        ),
        topic(
          "remote-config",
          "Fetching without activating leaves rollouts and kill switches inactive, and console-only defaults fail on a first offline launch.",
          [
            "Parameters, defaults and in-app defaults",
            "fetchAndActivate and caching behavior",
            "Conditions, targeting and rollout percentage",
            "Activation boundaries and experiment assignment",
            "Kill switches and minimum-version gating",
          ],
          "Add a kill-switch parameter with an in-app default, fetch and activate it, then change the console value and paste logcat before and after activation.",
          {
            summary:
              "Firebase Remote Config fetches a parameter set and applies it only when activated, subject to caching and targeting rules. Parameters can change behavior without a release, but first launch and offline starts use defaults until a fetch succeeds.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Setting a default only in the console; a first launch without network gets no value. Call `setDefaultsAsync` before fetch.",
              "Fetching in `onCreate` and blocking startup; use a bounded timeout and activate asynchronously.",
              "Using Remote Config for secrets or access control; values are visible in the app. Keep authorization server-side.",
            ],
          },
        ),
      ],
    },
    {
      slug: "quality-and-release",
      title: "Quality and release",
      description:
        "Make the app testable, secure and shippable. You will write unit and UI tests, read a crash report, harden exported components and produce a signed release artifact.",
      topics: [
        topic(
          "testing",
          "Without a test split every check needs an emulator, so the suite gets slow, then skipped, and regressions ship.",
          [
            "Local unit versus instrumented tests",
            "Test doubles and dependency injection",
            "Robolectric and framework fakes",
            "Test source sets and Gradle tasks",
            "Coverage and flaky-test policy",
          ],
          "Classify five existing checks as unit, integration or UI tests, move one to the JVM, and paste the `testDebugUnitTest` and `connectedDebugAndroidTest` timing output.",
          {
            summary:
              "Android testing separates JVM unit tests from instrumented tests that run on a device or emulator. The split only pays off when logic sits behind boundaries a JVM test can drive without framework classes.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Testing implementation details instead of observable behavior; refactors break tests without changing behavior.",
              "Making every test instrumented; the suite takes minutes and flakes. Push logic into JVM tests.",
              "Letting tests share mutable singletons; order dependencies appear. Reset state in setup or inject a fresh instance.",
            ],
            resources: [
              {
                title: "Testing on Android",
                url: "https://developer.android.com/training/testing",
                kind: "docs",
              },
              {
                title: "Fundamentals of testing Android apps",
                url: "https://developer.android.com/training/testing/fundamentals",
                kind: "docs",
              },
              {
                title: "Local unit tests",
                url: "https://developer.android.com/training/testing/local-tests",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "junit",
          "ViewModel logic tested only through the emulator hides regressions behind slow feedback and device-specific failures.",
          [
            "JUnit 4 lifecycle annotations",
            "Assertions and readable failure messages",
            "Parameterized and table-driven cases",
            "Test rules and temporary folders",
            "runTest and coroutine test dispatchers",
          ],
          "Write a parameterized JUnit 4 test for a state reducer, run `./gradlew testDebugUnitTest --tests '*ReducerTest'`, and paste the failing case before the fix.",
          {
            summary:
              "JUnit runs JVM tests with lifecycle annotations, assertions and rules; JUnit 4 remains the Android default. Parameterized cases and readable assertion messages turn a state reducer into a table of checked transitions.",
            difficulty: "core",
            minutes: 40,
            pitfalls: [
              "Using `@BeforeClass` for mutable state shared across parallel tests; use per-test setup instead.",
              "Testing suspend functions with `runBlocking` and the main dispatcher; it deadlocks. Use `runTest` with a test dispatcher.",
              "Asserting with `assertEquals` and no message; failures are hard to diagnose. Add a case description.",
            ],
          },
        ),
        topic(
          "espresso",
          "UI tests that sleep instead of synchronizing are slow and flaky, which turns a signal into a coin flip.",
          [
            "onView, ViewMatchers and ViewActions",
            "IdlingResource and main-thread synchronization",
            "Espresso-Intents and intent verification",
            "Compose test rule and semantics matchers",
            "ActivityScenario and test isolation",
          ],
          "Write an Espresso test that clicks a list item and asserts the detail screen, run it twice, and paste the output plus the idling resource added for the async load.",
          {
            summary:
              "Espresso drives UI through instrumentation and synchronizes with the main looper, idle resources and animations. Compose screens use the Compose test APIs, while Espresso remains the tool for intents, WebViews and legacy views.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Using `Thread.sleep` for a network call; the test is slow and still flaky. Register an `IdlingResource` or use Compose idling.",
              "Matching text that changes with locale; use resource IDs or semantics tags.",
              "Running against shared device state; clear app data or launch a fresh `ActivityScenario` per test.",
            ],
            resources: [
              {
                title: "Espresso",
                url: "https://developer.android.com/training/testing/espresso",
                kind: "docs",
              },
              {
                title: "Espresso setup",
                url: "https://developer.android.com/training/testing/espresso/setup",
                kind: "docs",
              },
              {
                title: "Espresso basics",
                url: "https://developer.android.com/training/testing/espresso/basics",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "debugging",
          "Reading only the exception message misses the thread, cause chain and system state that explain a crash or freeze.",
          [
            "logcat filters, buffers and crash buffer",
            "Breakpoints, evaluate expression and thread states",
            "ANR traces and main-thread stacks",
            "Layout Inspector and recomposition counts",
            "Perfetto system traces",
          ],
          "Trigger a deliberate `NullPointerException` in a debug build, then paste the `adb logcat -b crash` trace with the exception chain and first app frame.",
          {
            summary:
              "Debugging Android spans logcat, breakpoints, thread inspection, layout inspection and system traces. The stack trace names the exception and thread, while the ANR trace names what blocked the main thread.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Filtering logcat by package only and missing system warnings such as `Choreographer` skipped frames; keep the system buffer visible.",
              "Setting a breakpoint on the main thread and concluding the app hangs; suspending threads changes timing. Use thread-specific breakpoints.",
              "Fixing the crash site without reading the cause chain; the real failure is often an earlier wrapped exception.",
            ],
            resources: [
              {
                title: "Debug your app",
                url: "https://developer.android.com/studio/debug",
                kind: "docs",
              },
              {
                title: "View logs with Logcat",
                url: "https://developer.android.com/studio/debug/logcat",
                kind: "docs",
              },
              {
                title: "Profile your app's CPU activity",
                url: "https://developer.android.com/studio/profile/cpu-profiler",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "security",
          "One exported component can bypass the sandbox, and one cleartext endpoint exposes user data without a rooted device.",
          [
            "App sandbox, UID and SELinux enforcement",
            "Exported components and signature permissions",
            "Network Security Config and cleartext policy",
            "Keystore-backed credential storage",
            "WebView hardening and intent redirection",
          ],
          "Run `./gradlew lintDebug`, fix every exported-component and cleartext finding, and paste the before and after lint report.",
          {
            summary:
              "Android security rests on the app sandbox, signature permissions and component export rules, with network and storage boundaries adding their own failure modes. Common weaknesses are exported components, unsafe WebView settings and secrets shipped in the APK.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Exporting a deep-link component and trusting its extras; validate input and require a signature permission. Keep it unexported when no external entry is needed.",
              "Allowing cleartext traffic globally for one legacy host; scope a `networkSecurityConfig` exception or remove the host.",
              "Embedding an API key in `BuildConfig` and assuming obfuscation hides it; restrict the key server-side and rotate it.",
            ],
          },
        ),
        topic(
          "signed-apk",
          "A debug-signed or under-targeted artifact is rejected by Play, and losing the signing key blocks every future update.",
          [
            "Keystore, upload key and app signing key",
            "R8 minification and resource shrinking",
            "AAB versus APK and Play App Signing",
            "Version code and target SDK requirements",
            "Signing configs and CI secret handling",
          ],
          "Configure release signing from environment variables, run `./gradlew bundleRelease`, and paste `jarsigner -verify` plus the bundle version code from `bundletool`.",
          {
            summary:
              "A release artifact is minified, shrunk, signed with a private key and packaged as an AAB or APK. Play App Signing separates the upload key from the app signing key, and the version code plus target SDK decide whether the store accepts it.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Committing the keystore and passwords to version control; anyone with the repo can sign updates. Keep them in CI secrets and back up the keystore.",
              "Building a release without testing R8 rules; reflection-based JSON or Room models break. Run the release build on a device and retain the mapping file.",
              "Uploading the same version code twice; Play rejects the upload. Derive the code from CI and increment it.",
            ],
            resources: [
              {
                title: "Sign your app",
                url: "https://developer.android.com/studio/publish/app-signing",
                kind: "docs",
              },
              {
                title: "Upload your app bundle",
                url: "https://developer.android.com/studio/publish/upload-bundle",
                kind: "docs",
              },
              {
                title: "Play App Signing",
                url: "https://support.google.com/googleplay/android-developer/answer/9842756?hl=en",
                kind: "docs",
              },
            ],
          },
        ),
      ],
    },
  ],
};
