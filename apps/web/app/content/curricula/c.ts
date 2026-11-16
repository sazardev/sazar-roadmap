import type { Curriculum } from "../types";
import { topic } from "../types";

export const cLanguage: Curriculum = {
  slug: "c",
  title: "C and Systems Programming",
  tagline: "Memory, undefined behavior and the machine underneath.",
  description:
    "A rigorous path through C as a systems language: types and expressions, control flow, pointers and the memory model, composite data structures, undefined behavior, the build and toolchain, dynamic analysis and POSIX systems programming. Every stage ends with code that compiles, runs and can be inspected with a debugger or sanitizer.",
  level: "intermediate",
  icon: "cpu",
  estimatedHours: 70,
  stages: [
    {
      slug: "getting-started",
      title: "Getting started",
      description:
        "Build and run a C program from source to binary and understand every step in between. By the end you can explain preprocessing, compilation, assembly and linking using the actual commands you ran.",
      topics: [
        topic(
          "introduction",
          "Without the standard and the implementation boundary, you cannot tell which behavior is guaranteed and which is a compiler choice.",
          [
            "ISO/IEC 9899:2018, the C17 revision",
            "hosted and freestanding implementations",
            "translation and execution environments",
            "the Bell Labs Unix lineage",
          ],
          "Compile a five-line program with `gcc -std=c17 -Wall -Wextra -Wpedantic -O2`, then run `file`, `size` and `objdump -d` on the binary and record which sections hold code, initialized data and zero-initialized data.",
          {
            summary:
              "C is a procedural language defined by ISO/IEC 9899, not by a vendor implementation. The 2018 revision, C17, fixes the language and library contract while leaving object sizes, signed right shift and other details to the implementation. That split is why the same source can compile on two ABIs with different results.",
            difficulty: "foundation",
            minutes: 30,
            pitfalls: [
              "Treating C as portable assembly: the standard fixes semantics, not instruction selection or stack layout, so verify each assumption against the relevant clause and the target ABI.",
              "Assuming every implementation is hosted: a freestanding target may omit `main`, `<stdio.h>` and the standard library.",
              "Reading C++ rules into C: references, overloading, `new` and exceptions are not part of ISO C.",
            ],
          },
        ),
        topic(
          "installing-c",
          "A compiler without headers, a linker and a debugger produces confusing failures that look like language errors.",
          [
            "compiler driver",
            "C standard library implementation (glibc, musl, MSVC CRT)",
            "target triple",
            "header and library search paths",
          ],
          "Run `cc --version`, `cc -dumpmachine` and `gcc -v -E -x c /dev/null`, compile a hello program, then paste the target triple, the include search path and the `ldd` output for the resulting binary.",
          {
            summary:
              "C has no installer: a working setup is a compiler driver, a C standard library with headers, a linker and a debugger. GCC and Clang are the usual choices on Unix, MSVC and MinGW cover Windows, and the Xcode command line tools cover macOS. Verify the target triple and include search path before writing code, because a second toolchain on `PATH` changes both.",
            difficulty: "foundation",
            minutes: 35,
            pitfalls: [
              "Installing only an IDE or editor: it may bundle an old compiler and headers, so install a current GCC or Clang and check `cc --version`.",
              "Putting a cross-compiler first on `PATH` and then linking against the host libc: set `CC` explicitly or use the target-prefixed driver.",
              "Mixing objects built against glibc and musl: the link fails or the binary crashes at startup, so rebuild every object against one libc.",
            ],
          },
        ),
        topic(
          "running-your-first-program",
          "The entry point, exit status and buffered stdout are the contract every later program and test relies on.",
          [
            "`int main(void)` entry point",
            "`#include` textual inclusion",
            "line-buffered stdout",
            "process exit status",
          ],
          "Write `hello.c` with `int main(void)` and `printf`, build it with `-std=c17 -Wall -Wextra -Wpedantic -Werror`, run it, print `$?`, then change the return type to `void` and capture the diagnostic.",
          {
            summary:
              "A hosted C program starts at `main`, which returns `int` to the operating system. `printf` is declared in `<stdio.h>` and writes through a buffered `FILE *` stream, so output may appear only when the buffer flushes or the process exits. The exit status is the only structured result the shell receives.",
            difficulty: "foundation",
            minutes: 30,
            pitfalls: [
              "Declaring `void main` instead of `int main(void)`: the startup code still reads the return register, so use the standard signature and return `EXIT_SUCCESS` or a nonzero code.",
              "Calling `printf` without `<stdio.h>`: C17 requires a declaration, so include the header instead of relying on an implicit declaration that newer compilers reject.",
              "Assuming output ordering across stdout and stderr: stdout is buffered, so flush it or write diagnostics to stderr before exiting.",
            ],
          },
        ),
        topic(
          "build--compilation",
          "If you cannot separate compiler errors from linker errors, every build failure becomes guesswork.",
          [
            "translation phases",
            "translation unit",
            "ELF sections `.text`, `.data` and `.bss`",
            "symbol table and relocations",
          ],
          "Run `gcc -E`, `-S`, `-c` and the final link on one file; keep the `.i`, `.s` and `.o` outputs, run `nm` and `objdump -d` on the object, and map each command to the phase it stops after.",
          {
            summary:
              "A C build has four observable phases: preprocessing expands directives, compilation lowers one translation unit to assembly, the assembler emits an object file, and the linker resolves symbols and relocations into an executable. Each phase has a distinct failure mode and a GCC flag that stops after it. Separating them turns a vague build failure into a specific diagnosis.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Treating an undefined reference as a syntax error: it is emitted by the linker, so inspect `nm` on the objects and fix the missing definition or library.",
              "Linking stale object files by hand: timestamp or dependency tracking is missing, so rebuild all objects after a header change.",
              "Assuming `-c` produces a runnable binary: it stops at the object file, so link the objects in a separate step.",
            ],
            resources: [
              {
                title: "ISO/IEC 9899:2018 draft (N2176)",
                url: "https://www.open-std.org/jtc1/sc22/wg14/www/docs/n2176.pdf",
                kind: "spec",
              },
              {
                title: "GCC — Overall Options (-E, -S, -c, -o)",
                url: "https://gcc.gnu.org/onlinedocs/gcc/Overall-Options.html",
                kind: "docs",
              },
              {
                title: "cppreference — Translation phases",
                url: "https://en.cppreference.com/w/c/language/translation_phases",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "compilers",
          "Diagnostics differ between GCC and Clang, so a warning policy tied to one compiler will miss defects in the other.",
          [
            "front end, middle end and back end",
            "target triple",
            "diagnostic severity and warning groups",
            "GNU and LLVM toolchains",
          ],
          "Compile the same file with `gcc -std=c17 -Wall -Wextra -Wpedantic` and `clang -std=c17 -Wall -Wextra -Wpedantic`; diff the diagnostics for a missing semicolon and an unused parameter, then diff the `-O2 -S` assembly.",
          {
            summary:
              "GCC and Clang are separate implementations of the same ISO C contract, with different front ends, optimizers and diagnostic wording. Both accept `-std=c17`, emit assembly and object files, and typically drive the system linker. Comparing their warnings on the same source exposes extensions and assumptions that one compiler accepts silently.",
            difficulty: "foundation",
            minutes: 45,
            pitfalls: [
              "Assuming both compilers warn about the same constructs: enable `-Wall -Wextra -Wpedantic` on both and treat a warning only one emits as a portability defect.",
              "Using `-std=gnu17` and calling it C17: GNU mode enables extensions such as `void *` arithmetic, so build the portable target with `-std=c17`.",
              "Blaming the compiler for a diagnostic that is a constraint violation: read the standard clause and fix the source instead of suppressing the warning.",
            ],
          },
        ),
        topic(
          "gcc--clang",
          "Default flags accept extensions and hide warnings, so code that builds locally can fail on another target or at `-O2`.",
          [
            "warning groups",
            "`-Werror` promotion",
            "DWARF debug information",
            "optimization levels",
            "sanitizer instrumentation",
          ],
          "Build one file with `-Wall`, then with `-Wall -Wextra -Wpedantic -Werror`, fix every diagnostic, and run `gcc -Q --help=warnings | grep enabled` to list the active groups.",
          {
            summary:
              "Compiler flags form a contract: `-std=c17` selects the language, `-Wall -Wextra -Wpedantic` selects diagnostics, `-Werror` makes them fatal, `-g` emits debug information and `-O2` changes code generation. Sanitizer flags add runtime checks to the same binary. A flag set copied between projects without understanding these groups hides warnings or makes optimization change behavior.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Assuming `-Wall` means all warnings: it omits `-Wconversion`, `-Wshadow` and `-Wcast-qual`, so choose the extra groups deliberately.",
              "Adding `-Werror` before fixing the warnings: the build breaks on messages you have not read, so clean the warning set first.",
              "Debugging an `-O2 -g` binary and expecting every variable: optimization merges and removes objects, so use `-O0 -g` for stepping and `-O2` for behavior tests.",
            ],
          },
        ),
      ],
    },
    {
      slug: "types-and-expressions",
      title: "Types and expressions",
      description:
        "Learn how C represents values and where implicit conversions change the answer. You will write expressions that print, overflow, truncate and compare correctly on a fixed-width machine model.",
      topics: [
        topic(
          "variables",
          "Reading an uninitialized object or confusing storage duration produces values that change with optimization and call order.",
          [
            "object, type and storage duration",
            "automatic, static, thread and allocated storage",
            "tentative definition",
            "indeterminate value",
          ],
          "Write a program with a global, a file-static, a function-static and a local variable; print their addresses, then run `nm` and `objdump -t` to show the global and static symbols in `.data` and `.bss`, and use the printed addresses to identify the stack range.",
          {
            summary:
              "A variable declaration gives an object a type and a name; its storage duration decides when the object is created and destroyed, and its scope decides where the name is visible. Automatic objects live in a block, static objects live for the whole program, and allocated objects live until `free`. An uninitialized automatic object holds an indeterminate value, and reading it is undefined behavior.",
            difficulty: "foundation",
            minutes: 40,
            pitfalls: [
              "Reading a local before assignment: the value is indeterminate, so initialize at declaration or prove the first write dominates every read.",
              "Treating `static` at file scope as storage only: it also gives internal linkage, so other translation units cannot see the name.",
              "Assuming a function-static object is reinitialized on each call: it is initialized once, and its mutations persist across calls.",
            ],
          },
        ),
        topic(
          "data-types",
          "The standard fixes minimum ranges, not exact widths, so assumptions about `int` or `long` break on another ABI.",
          [
            "integer conversion rank",
            "value bits and padding bits",
            "`size_t` and `ptrdiff_t`",
            "`<stdint.h>` exact-width types",
          ],
          "Print `sizeof` and the bounds from `<limits.h>` and `<float.h>` for every standard integer and floating type with `%zu`, then repeat the build with `-m32` if multilib is installed and diff the two tables.",
          {
            summary:
              "C's arithmetic types have minimum ranges, not fixed widths: `char` is one byte, `short` and `int` are at least 16 bits, `long` at least 32 and `long long` at least 64. `sizeof` reports bytes as `size_t`, and `CHAR_BIT` may exceed 8 on some targets. `<stdint.h>` supplies exact-width types only when the implementation has them.",
            difficulty: "foundation",
            minutes: 45,
            pitfalls: [
              "Printing `sizeof` with `%d`: the result is `size_t`, so use `%zu` or cast to `unsigned long` and match the conversion.",
              "Assuming `long` is 64 bits: Windows uses LLP64, where `long` is 32 bits, so use `int64_t` for a fixed width.",
              "Assuming `char` is signed or unsigned: the choice is implementation-defined, so use `signed char` or `unsigned char` when the distinction matters.",
            ],
          },
        ),
        topic(
          "integers",
          "Mixed signed and unsigned arithmetic silently converts negative values and turns a boundary check into a tautology.",
          [
            "modulo 2^N unsigned arithmetic",
            "usual arithmetic conversions",
            "integer promotion",
            "implementation-defined conversion",
            "signed overflow",
          ],
          "Compile a program that computes `INT_MAX + 1` with `-fsanitize=signed-integer-overflow -fno-sanitize-recover=all`, capture the UBSan report, then add a checked-add function with tests for `INT_MAX`, `INT_MIN` and zero.",
          {
            summary:
              "Unsigned integer arithmetic is defined modulo 2^N, while signed overflow is undefined behavior. The usual arithmetic conversions promote operands to a common type, and a negative signed operand converted to unsigned becomes a large positive value. Every mixed comparison and every narrow assignment depends on those rules.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Comparing a signed loop index with `strlen` or `size_t`: the signed value converts to unsigned, so `i >= 0` can be always true and the loop runs past the buffer.",
              "Relying on signed overflow to wrap: build with `-fwrapv` only as an explicit compatibility choice, and otherwise use unsigned or a checked operation.",
              "Negating `INT_MIN`: the result is not representable, so test for the minimum before negating or compute in a wider type.",
            ],
          },
        ),
        topic(
          "float",
          "Binary floating point cannot represent most decimal fractions, so equality tests and money arithmetic fail at the boundary.",
          [
            "IEEE-754 binary32 and binary64",
            "significand and exponent",
            "round to nearest, ties to even",
            "NaN comparison",
            "`FLT_EPSILON`",
          ],
          "Print `0.1 + 0.2`, its `%a` hexadecimal form and `0.1 + 0.2 == 0.3`, then use `nextafter` to print the next representable double and compare two computed values with a tolerance.",
          {
            summary:
              "`float` and `double` follow IEEE-754 on mainstream targets: a sign, a binary significand and an exponent, with results rounded to the nearest representable number by default. Most decimal fractions, including 0.1, have no exact binary representation, and `==` compares the rounded results. NaN compares unordered, so every ordered comparison with it is false.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Testing computed floating-point values with `==`: rounding error makes the equality false, so compare the absolute difference against a scaled epsilon.",
              "Storing money in `double`: repeated addition accumulates error, so use an integer number of cents or a decimal library.",
              "Printing a `float` with `%f` and assuming the value is exact: the variadic call promotes to `double`, but the stored value was already rounded to binary32.",
            ],
          },
        ),
        topic(
          "char",
          "`char` may be signed, and passing a negative byte to `<ctype.h>` is undefined behavior on many implementations.",
          [
            "`CHAR_BIT` and byte size",
            "signed and unsigned `char`",
            "object representation",
            "`<ctype.h>` argument domain",
          ],
          "Compile a program that prints `CHAR_BIT`, `CHAR_MIN`, `CHAR_MAX` and compares `(char)0xFF` with `(unsigned char)0xFF`; then pass `(char)0xFF` to `isalpha` and fix the argument with an `unsigned char` cast.",
          {
            summary:
              "`char` is the smallest addressable object, and `sizeof(char)` is 1 by definition, but `CHAR_BIT` can be greater than 8. Its signedness is implementation-defined, so on a signed-char target a byte value above `CHAR_MAX` becomes negative when stored in a plain `char`. The `<ctype.h>` functions accept `unsigned char` values or `EOF`; any other negative argument is undefined behavior.",
            difficulty: "foundation",
            minutes: 40,
            pitfalls: [
              "Passing a plain `char` from a UTF-8 byte sequence to `isalpha`: the negative value is outside the function's domain, so cast to `unsigned char` first.",
              "Using `char` to hold arbitrary bytes: the signedness changes comparisons, so use `unsigned char` or `uint8_t` for byte buffers.",
              "Assuming a byte is 8 bits or a character is one byte: use `CHAR_BIT` and treat UTF-8 as a multibyte encoding.",
            ],
          },
        ),
        topic(
          "operators",
          "Precedence and evaluation order decide whether an expression is merely unclear or undefined, and the compiler will not save you.",
          [
            "precedence and associativity",
            "sequence points",
            "short-circuit evaluation",
            "lvalue conversion",
            "compound assignment",
          ],
          "Write three expressions that mix `&` and `&&`, shift and increment; compile with `-Wall -Wextra -Wsequence-point -Wconversion`, capture each warning, and rewrite the expressions with explicit parentheses and sequencing.",
          {
            summary:
              "Operator precedence and associativity determine how an expression is grouped, but the evaluation order of most operands is unspecified. `&&` and `||` short-circuit and introduce sequence points; arithmetic operators generally do not. A side effect and an unsequenced read of the same object make the expression undefined, not merely surprising.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Writing `i = i++ + 1`: the read and write of `i` are unsequenced, so the behavior is undefined; split the statements.",
              "Using `&` where `&&` was intended: both operands are evaluated and the result is a bit mask, so use the logical operator for conditions.",
              "Left-shifting a negative or overflowing signed value: the result is undefined, so shift unsigned values or check the bound before shifting.",
            ],
          },
        ),
      ],
    },
    {
      slug: "control-flow-and-functions",
      title: "Control flow and functions",
      description:
        "Write the control flow and function boundaries that the rest of the language builds on. You will translate a state machine into C and prove each branch with a test or a debugger.",
      topics: [
        topic(
          "control-flow",
          "Missing `break` and misplaced `continue` change which statements run without producing a compiler error.",
          [
            "compound statement and block scope",
            "`goto` and labels",
            "state machine transition table",
            "`break` and `continue` targets",
          ],
          "Implement a four-state connection state machine with an `enum` and a `switch`; derive the expected transition table from the state diagram, write a driver that feeds every event from every state, and diff the program output against the table.",
          {
            summary:
              "C control flow is built from compound statements, selection, iteration and `goto`. A `switch` transfers to a matching integer case and then continues through later cases unless a `break` exits. `goto` is the standard way to break out of nested loops and to share a cleanup path, provided it does not jump into a scope past a variable-length array declaration.",
            difficulty: "foundation",
            minutes: 45,
            pitfalls: [
              "Falling through a case that was meant to end: add `break` or annotate the intentional fallthrough for `-Wimplicit-fallthrough`.",
              "Using `goto` to jump into a loop body or past a VLA declaration: labels must not bypass initialization, so restructure with a cleanup label at the end.",
              "Assuming `continue` leaves the loop: it starts the next iteration, so use `break` to exit and a flag or `goto` to leave nested loops.",
            ],
          },
        ),
        topic(
          "if-else--switch",
          "A forgotten `break` falls through into the next case, and a switch on an enum missing a case passes silently.",
          [
            "controlling expression",
            "integer constant expression",
            "implicit fallthrough",
            "`default` label",
            "`-Wswitch-enum`",
          ],
          "Compile a switch over an enum with `-Wswitch-enum -Wimplicit-fallthrough`, add the missing case, then add an intentional fallthrough with a comment and show the warning before the annotation and its absence after.",
          {
            summary:
              "`if` evaluates a scalar controlling expression, and `switch` evaluates an integer expression and compares it with integer constant case labels. Cases fall through by default, so every non-empty case needs a `break` or a documented fallthrough. `default` handles unmatched values, and `-Wswitch-enum` reports enum members that no case names.",
            difficulty: "foundation",
            minutes: 40,
            pitfalls: [
              "Omitting `break` after a case: execution continues into the next case, so add the break or write a fallthrough comment and enable the warning.",
              "Switching on a `float` or a pointer: case labels require an integer type, so convert the value to a tagged enum first.",
              "Handling only the enumerated values without `default`: a corrupted or out-of-range value skips every case, so add a default that reports or aborts.",
            ],
          },
        ),
        topic(
          "for--while--do-while-loops",
          "Off-by-one bounds and a `do-while` that always runs once turn a correct algorithm into an out-of-bounds access.",
          [
            "pre-test and post-test loops",
            "loop invariant",
            "iteration expression",
            "off-by-one boundary",
          ],
          "Implement the same array sum with `for`, `while` and `do-while`; add tests for an empty array and a one-element array, then run the suite under `-fsanitize=undefined` and compare the three results.",
          {
            summary:
              "`for` evaluates an initializer once, tests before each iteration and runs an iteration expression after each body. `while` tests before the body, and `do-while` tests after it, so a `do-while` always executes at least once. All three can express the same traversal, but the boundary condition and the first-iteration guarantee differ.",
            difficulty: "foundation",
            minutes: 45,
            pitfalls: [
              "Writing `for (i = 0; i <= n; ++i)` for an n-element array: the last iteration indexes element n, so use `i < n` and test the empty case.",
              "Using `do-while` for input that may be absent: the body runs once even when the condition is false, so use `while` when zero iterations are valid.",
              "Overflowing an unsigned loop counter at the bound: stop before `SIZE_MAX` with a `break` or iterate over a pointer range instead.",
            ],
          },
        ),
        topic(
          "functions",
          "Without a prototype the compiler cannot check argument types, and a mismatch becomes a wrong value or a crash at the call.",
          [
            "function prototype",
            "parameter passing by value",
            "external and internal linkage",
            "array-to-pointer decay",
            "`static` function",
          ],
          "Split a function into `stats.h` and `stats.c`, compile with `-Wmissing-prototypes -Wstrict-prototypes`, call it with the wrong argument type to capture the diagnostic, then fix the prototype and rerun.",
          {
            summary:
              "A function definition supplies a body and a type; a prototype supplies the parameter types so the compiler can check every call. Arguments pass by value, so a function receives copies unless a pointer is passed. Arrays decay to pointers in parameter declarations, which is why `sizeof` inside the callee is the pointer size.",
            difficulty: "foundation",
            minutes: 45,
            pitfalls: [
              "Calling a function before declaring it: C99 and later do not allow implicit declarations, so include the header or add a prototype before the call.",
              "Returning a pointer to an automatic array: the storage ends at return, so fill a caller-provided buffer or allocate and document ownership.",
              "Declaring `int f()` and assuming it takes no arguments: in C17 the empty list means unspecified parameters, so write `int f(void)` for zero arguments.",
            ],
          },
        ),
        topic(
          "recursive-functions",
          "A missing base case or a deep recursion exhausts the stack, and C does not promise tail-call elimination.",
          [
            "base case and recursive case",
            "activation record",
            "tail call",
            "stack depth",
            "`ulimit -s`",
          ],
          "Write a tail-recursive factorial with an accumulator, compile with `-O2 -S` and compare `call` and `jmp` in the assembly; then run a non-tail recursion to depth 100000 under `ulimit -s 1024` and capture the crash.",
          {
            summary:
              "A recursive function calls itself with a smaller input and stops at a base case. Each call creates an activation record on the stack, so depth costs memory and a missing base case ends in a stack overflow. C does not require tail-call optimization; GCC may turn a self-call in return position into a jump at `-O2`, but the source must not depend on it.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Omitting the base case or making it unreachable: the recursion never returns, so test the smallest input first and assert the depth bound.",
              "Computing Fibonacci naively: two recursive calls per level make the running time exponential, so add memoization or an iterative loop.",
              "Assuming the compiler eliminates tail calls: build flags and debug settings change the output, so rewrite deep recursion as a loop when stack depth is unbounded.",
            ],
          },
        ),
        topic(
          "variadic-functions",
          "`va_arg` trusts the caller's type, so a promoted `float` or a short argument read as `int` corrupts the argument walk.",
          [
            "`va_list` and `va_start`",
            "default argument promotions",
            "`va_arg` type match",
            "`va_copy`",
            "printf format attribute",
          ],
          "Implement `int sum(size_t n, ...)` and a `logf` wrapper with `__attribute__((format(printf, 1, 2)))`; call `logf` with a `%d` format and a `double` argument to capture the format warning, then fix the call.",
          {
            summary:
              "A variadic function declares at least one named parameter followed by `...`; `<stdarg.h>` provides `va_list`, `va_start`, `va_arg` and `va_end`. Arguments after the named ones undergo the default promotions: `char` and `short` to `int`, and `float` to `double`. `va_arg` must request the promoted type, because the macro trusts the caller and performs no conversion.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Reading a `float` with `va_arg(ap, float)`: the argument was promoted to `double`, so request `double` and cast afterwards if needed.",
              "Passing the wrong count or type to `printf`: the format string is the only contract, so enable `-Wformat` and the format attribute on wrappers.",
              "Copying a `va_list` by assignment and using both copies: the state is implementation-defined, so use `va_copy` and `va_end` on each copy.",
            ],
          },
        ),
      ],
    },
    {
      slug: "pointers-and-memory",
      title: "Pointers and memory",
      description:
        "Understand the address space and take responsibility for it. You will draw the stack and heap, pass by pointer, allocate and free, and explain the lifetime of every object you create.",
      topics: [
        topic(
          "pointer-basics--syntax",
          "An uninitialized or null pointer dereference is undefined behavior, and the failure may appear far from the assignment.",
          [
            "address-of and dereference operators",
            "null pointer constant",
            "pointer object representation",
            "lvalue and object designator",
          ],
          "Write `swap(int *a, int *b)`, print the addresses and values, inspect them in GDB with `p &x`, `p *p` and `x/2dw &x`, then add a null check and a test that passes `NULL`.",
          {
            summary:
              "A pointer object stores an address and a type; the type fixes the size of the pointed-to object and the step of pointer arithmetic. `&` takes the address of an lvalue, `*` designates the pointed-to object, and `NULL` is a null pointer constant that compares unequal to every object address. An uninitialized pointer holds an indeterminate address, and dereferencing it is undefined behavior.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Dereferencing a pointer before assigning it: `int *p; *p = 1;` writes through an indeterminate address, so initialize to `NULL` and check before use.",
              "Confusing `*p++` with `(*p)++`: the first increments the pointer and dereferences the old value, the second increments the pointed-to object, so parenthesize deliberately.",
              "Assuming a null pointer is all-bits-zero: the representation is implementation-defined, so compare against `NULL` instead of inspecting bytes.",
            ],
          },
        ),
        topic(
          "pointer-arithmetic",
          "Arithmetic outside the array object is undefined even when the address happens to be valid, and `void *` arithmetic is not C.",
          [
            "array-to-pointer decay",
            "one-past-the-end pointer",
            "`ptrdiff_t` difference",
            "element-size scaling",
            "`void *` arithmetic extension",
          ],
          "Walk an array with `for (int *p = a; p != a + n; ++p)` and print `p - a`, then compile `void *q; q + 1` with `-std=c17 -Wpedantic` and capture the extension warning.",
          {
            summary:
              "Pointer arithmetic scales by the pointed-to type: `p + 1` advances `sizeof *p` bytes. It is defined only within one array object, including the one-past-the-end address, and subtraction is defined only for two pointers into the same array. `void *` arithmetic is a GNU extension, not ISO C, and `-Wpedantic` diagnoses it.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Dereferencing `a + n`: the one-past-the-end address is valid to form and compare, not to read, so stop before it.",
              "Subtracting pointers into different arrays: the behavior is undefined, so compare only within one object or pass a length alongside each pointer.",
              "Doing arithmetic on `void *`: the standard gives `void` no size, so cast to `unsigned char *` for byte offsets or use the target's extension explicitly.",
            ],
          },
        ),
        topic(
          "stack-vs-heap",
          "Returning a stack address or overflowing the stack corrupts frames, while heap blocks outlive the pointer that owns them.",
          [
            "call stack and stack pointer",
            "activation record",
            "allocated storage duration",
            "fragmentation",
            "stack limit",
          ],
          "Print the addresses of a local, a static and two `malloc` blocks; run `ulimit -s`, overflow the stack with deep recursion, and run a loop that allocates 1 MiB blocks under `ulimit -v 262144` until `malloc` returns `NULL`.",
          {
            summary:
              "Automatic objects live in the call stack, in frames pushed and popped with each call; allocated objects live in the heap until `free`. The stack is fast and bounded, typically 8 MiB on Linux, while the heap grows through the allocator and fragments. Returning a stack address or mixing the two lifetimes produces dangling pointers and memory leaks.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Returning `&local` from a function: the frame is gone after return, so return a value, fill an output parameter or allocate with a clear owner.",
              "Declaring a multi-megabyte local array: the default stack is smaller than the heap, so allocate large buffers dynamically and check the result.",
              "Assuming `malloc` zeroes memory: it returns indeterminate bytes, so use `calloc` when zero initialization is part of the contract.",
            ],
          },
        ),
        topic(
          "dynamic-memory-allocation",
          "Multiplication overflow in a size argument allocates a small block that the program then writes as if it were large.",
          [
            "allocator contract",
            "fundamental alignment",
            "`realloc` move and preserve",
            "size multiplication overflow",
            "allocation failure",
          ],
          "Implement `int *grow(int *p, size_t n)` with `realloc`, a `SIZE_MAX / sizeof *p` overflow check and a temporary pointer; test 0, 1, 1000 and a failing size under AddressSanitizer.",
          {
            summary:
              "`malloc`, `calloc`, `realloc` and `free` manage storage whose lifetime the program controls. `calloc` zeroes the block, `realloc` preserves the first `min(old, new)` bytes but may move the block, and `malloc(0)` may return `NULL` or a unique pointer that must still be freed. A size computation must be checked against `SIZE_MAX`, because a wrapped product allocates less than the program assumes.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Assigning `p = realloc(p, n)`: on failure the original block is leaked, so store the result in a temporary and free `p` only after success.",
              "Computing `n * sizeof *p` without a bounds check: the multiplication wraps, so reject `n > SIZE_MAX / sizeof *p` before allocating.",
              "Treating a zero-size allocation as always `NULL`: the standard allows either result, so free a non-null result and handle both cases.",
            ],
          },
        ),
        topic(
          "malloc",
          "Assuming zeroed memory or ignoring a `NULL` return turns an allocation failure into a write through an invalid pointer.",
          [
            "uninitialized storage",
            "`max_align_t` alignment",
            "`ENOMEM`",
            "zero-size allocation",
            "effective type",
          ],
          "Allocate 0, 1 and 4096 bytes; print each pointer modulo `_Alignof(max_align_t)`, free them, then request `SIZE_MAX` and print `errno` after the failure.",
          {
            summary:
              "`malloc(size_t)` returns a pointer to uninitialized storage aligned for any type with fundamental alignment, or `NULL` when the request cannot be satisfied. The block has no declared type until a write establishes an effective type, and its lifetime ends at `free`. POSIX implementations set `errno` to `ENOMEM` on failure; the C standard itself only fixes the return value.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Casting the result of `malloc`: C converts `void *` implicitly, and the cast can hide a missing `<stdlib.h>` declaration, so omit it.",
              "Using the block before initializing it: `malloc` returns indeterminate bytes, so write or `memset` before the first read.",
              "Ignoring `NULL` because the test machine has memory: allocation can fail under a limit or fragmentation, so handle the failure at the call site.",
            ],
          },
        ),
        topic(
          "free",
          "Double free and use after free corrupt allocator metadata, and the crash usually surfaces in an unrelated allocation.",
          [
            "deallocation",
            "double free",
            "indeterminate pointer value",
            "ownership",
            "allocator metadata",
          ],
          "Write a program that frees a block twice, run it under AddressSanitizer, save the double-free report, then fix it with a single owner and `p = NULL` after `free`; rerun under Valgrind.",
          {
            summary:
              "`free` ends the lifetime of an allocated block and returns its storage to the allocator; `free(NULL)` does nothing. Passing a pointer that was not returned by an allocation function, or freeing the same block twice, is undefined behavior. After the call the pointer value becomes indeterminate, so every copy of the pointer must be treated as invalid, not just the variable passed to `free`.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Freeing a pointer into the middle of a block: only the original allocation address is valid, so keep the base pointer and free that.",
              "Freeing the same block through two aliases: the allocator detects or corrupts metadata, so define one owner and null out aliases after the free.",
              "Writing `free(p); p[0] = 1;`: the block's lifetime ended, so remove the access or restructure ownership before freeing.",
            ],
          },
        ),
      ],
    },
    {
      slug: "composite-data",
      title: "Composite data",
      description:
        "Model real data with arrays, strings, structs, unions and dynamic containers. You will inspect layout and padding, build a linked list, and explain why a C string is a buffer plus a terminator.",
      topics: [
        topic(
          "arrays",
          "An array parameter is a pointer, so `sizeof` inside the callee returns the pointer size and bounds checks disappear.",
          [
            "contiguous element storage",
            "array-to-pointer decay in expressions",
            "multidimensional row-major layout",
            "variable-length array",
            "bounds checking",
          ],
          "Pass a ten-element array to a function, print `sizeof` inside and outside the callee, add `-Wsizeof-array-argument`, then index element 10 under AddressSanitizer and capture the report.",
          {
            summary:
              "An array is a contiguous sequence of elements of one type, with a bound fixed at declaration except for variable-length arrays. In most expressions the array name converts to a pointer to its first element, and a function parameter declared as an array is adjusted to a pointer. `sizeof` sees the whole array only where the array type is still visible.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Computing `sizeof array / sizeof array[0]` inside a function: the parameter is a pointer, so pass the length explicitly or use a struct-wrapped array.",
              "Indexing past the last element: no bounds check exists, so assert the index or use a container that tracks length.",
              "Declaring a VLA with a zero or negative size: the behavior is undefined, so validate the size before the declaration.",
            ],
          },
        ),
        topic(
          "strings",
          'A missing terminator makes every `strlen` and `printf("%s")` read past the buffer until a zero byte appears.',
          [
            "null-terminated byte string",
            "buffer capacity and string length",
            "`snprintf` return value",
            "truncation",
            "embedded NUL byte",
          ],
          "Write `copy_name(char *dst, size_t cap, const char *src)` with `snprintf`, test exact fit, truncation and zero capacity; then reproduce a missing terminator with `strncpy` under Valgrind and fix it.",
          {
            summary:
              "A C string is a `char` buffer whose end is marked by a null byte; the length excludes that terminator. `<string.h>` functions scan until the terminator, so a buffer without one makes them read past the allocation. Buffer capacity, string length and the terminator are three separate quantities, and every copy must account for all three.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Allocating `strlen(src)` bytes: the terminator needs one more, so allocate `strlen(src) + 1` and check for overflow.",
              "Using `strncpy` and assuming termination: it writes no null when the source is at least `n` bytes, so set the last byte to zero or use `snprintf`.",
              "Calling `strlen` on a buffer that may lack a terminator: the scan is unbounded, so track the length or use `strnlen` where POSIX is available.",
            ],
          },
        ),
        topic(
          "structs",
          "Padding bytes make `sizeof` larger than the member sum, and copying the struct to a file or socket leaks indeterminate bytes.",
          [
            "member layout and declaration order",
            "alignment requirement",
            "padding bytes",
            "`offsetof`",
            "flexible array member",
          ],
          "Define three structs with the same `char`, `int` and `double` members in different orders, print `sizeof` and `offsetof` for each, compile with `-Wpadded`, and reorder the members to minimize the size.",
          {
            summary:
              "A struct lays out members in declaration order, inserting padding before a member whose alignment requires it and after the last member to satisfy the struct's alignment. `sizeof` therefore can exceed the sum of member sizes, and `offsetof` gives each member's byte offset. Reordering members can shrink the struct, but it also changes the layout consumed by files, network protocols and assembly.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Writing `sizeof(struct)` bytes to a file or hashing the object: padding holds indeterminate values, so serialize fields individually or zero the struct first.",
              "Assuming members are packed: the compiler inserts padding for alignment, so use an explicit serialization format instead of the in-memory layout.",
              "Comparing structs with `memcmp`: padding and indeterminate bytes can differ, so compare members or a documented canonical form.",
            ],
          },
        ),
        topic(
          "unions",
          "Reading a member that was not last written reinterprets the bytes and can produce a trap representation or a wrong value.",
          [
            "overlapping member storage",
            "active member",
            "common initial sequence",
            "tagged union",
            "type punning",
          ],
          "Build a tagged union over `int`, `double` and `const char *`, print `sizeof` and the active tag, then compare union type punning with `memcpy` at `-O2` and record whether the bytes match.",
          {
            summary:
              "Union members share one storage region, and the union's size is the largest member size rounded up to the strictest alignment. Only the member last stored is active; reading another member reinterprets its bytes, which C permits but whose result depends on the object representation and may be a trap. A tagged union stores an enum discriminant to make the active member explicit.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Reading a member that was not last written and treating the result as a conversion: the bytes are reinterpreted, so use `memcpy` or an explicit numeric conversion.",
              "Assuming the union size equals the largest member exactly: trailing padding aligns the union, so check `sizeof` before using it as a wire format.",
              "Forgetting the discriminant: nothing in the union records the active member, so add a tag enum and switch on it before every read.",
            ],
          },
        ),
        topic(
          "dynamic-arrays",
          "Growing by one element per append makes a loop quadratic, and a failed `realloc` that overwrites the old pointer leaks the block.",
          [
            "length, capacity and data pointer",
            "geometric growth",
            "amortized constant append",
            "pointer invalidation after `realloc`",
            "ownership invariant",
          ],
          "Implement `vec_push`, `vec_reserve` and `vec_free` with doubling growth; push 1,000,000 ints, count `realloc` calls, run under AddressSanitizer, and assert that `len == 1000000`.",
          {
            summary:
              "A dynamic array stores a data pointer, a length and a capacity; append ensures capacity, writes at `len`, and increments it. Doubling capacity gives amortized constant-time append, while growth by one element makes a sequence of appends quadratic. `realloc` may move the buffer, so pointers into the old storage become dangling after growth.",
            difficulty: "core",
            minutes: 70,
            pitfalls: [
              "Growing by one on every append: each realloc copies the whole buffer, so double the capacity and test the resulting allocation count.",
              "Overwriting the data pointer with a failed `realloc`: the old block leaks, so assign to a temporary and update only on success.",
              "Holding a pointer returned by `vec_push` across another push: growth may move the buffer, so store an index instead.",
            ],
          },
        ),
        topic(
          "linked-lists",
          "Losing the `next` pointer before freeing a node leaks the rest of the list, and a stale head breaks every later traversal.",
          [
            "node and next pointer",
            "head pointer",
            "pointer-to-pointer removal",
            "stable node addresses",
            "list destruction",
          ],
          "Implement `list_push`, `list_remove` with a pointer-to-pointer, and `list_free`; test removal of the head, middle and tail, then run the tests under Valgrind and show zero leaks.",
          {
            summary:
              "A linked list stores each element in a separately allocated node with a pointer to the next node, and the list itself is just a head pointer. Insertion at the head is constant time and node addresses stay stable, while search and indexed access are linear. Removal needs the previous node's link, which a pointer-to-pointer update handles without a special case for the head.",
            difficulty: "core",
            minutes: 65,
            pitfalls: [
              "Freeing a node before saving `node->next`: the rest of the list becomes unreachable, so copy the next pointer first.",
              "Updating the head only in the caller: removal changes the head when the first node matches, so pass `struct node **` and update through it.",
              "Returning a pointer to a freed node from a remove operation: the caller may still write to it, so return the removed value by copy and free the node.",
            ],
          },
        ),
      ],
    },
    {
      slug: "undefined-behavior",
      title: "Undefined behavior and safety",
      description:
        "Learn why undefined behavior is a contract, not a warning. You will reproduce a buffer overflow, a use-after-free and a signed overflow, then fix each one with a sanitizer and a boundary check.",
      topics: [
        topic(
          "memory-model",
          "Aliasing an object through an incompatible pointer type lets the optimizer reorder loads and return a value that never existed.",
          [
            "object and effective type",
            "strict aliasing",
            "character-type exception",
            "storage duration and lifetime",
            "alignment",
          ],
          "Compile a function that writes a `float` through an `int *` at `-O2 -Wstrict-aliasing=2`, record the warning or wrong result, then rewrite it with `memcpy` and compare the generated assembly.",
          {
            summary:
              "C's memory model gives every object a type, a storage duration and a lifetime, and the compiler may assume that an object is accessed only through an lvalue compatible with its effective type. Accessing a `float` through an `int *` violates that rule, and the optimizer can reorder the load or return a stale value. The character types may alias any object, and `memcpy` performs a defined byte copy.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Casting a `float *` to `int *` to inspect bits: the access violates effective type rules, so copy through `memcpy` into an `int`.",
              "Building with `-fno-strict-aliasing` and shipping the source to another compiler: the flag is not portable, so fix the aliasing in the code.",
              "Reading uninitialized padding through a character pointer: the bytes are indeterminate, so avoid hashing or comparing whole structs.",
            ],
          },
        ),
        topic(
          "lifetime-of-objects",
          "A pointer to an object whose lifetime ended still holds an address, but the standard gives its value no meaning.",
          [
            "begin and end of lifetime",
            "scope versus lifetime",
            "indeterminate pointer value",
            "storage reuse",
            "use-after-scope",
          ],
          "Keep a pointer to a block-local array after the block exits, dereference it under `-fsanitize=address -fsanitize-address-use-after-scope`, and save the report; then change the API to take an output buffer.",
          {
            summary:
              "An object's lifetime is the interval in which its storage holds a valid value: automatic objects from block entry to block exit, except variable-length arrays, whose lifetime starts at declaration, allocated objects from allocation to `free`, and static objects for the whole program. Scope and lifetime are independent, and a pointer can outlive the object it addresses. Once the lifetime ends, the pointer's value is indeterminate and any use of it is undefined behavior.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Returning a pointer to a local: the frame's lifetime ends at return, so copy the value out or allocate storage with a documented owner.",
              "Assuming a `static` local is destroyed at function exit: its lifetime is the whole program, so mutations persist between calls.",
              "Keeping a pointer to a block after `free` and testing it for `NULL`: `free` does not change the caller's pointer, so set it to `NULL` or remove the alias.",
            ],
            resources: [
              {
                title: "cppreference — Object lifetime",
                url: "https://en.cppreference.com/w/c/language/lifetime",
                kind: "docs",
              },
              {
                title: "ISO/IEC 9899:2018 draft (N2176)",
                url: "https://www.open-std.org/jtc1/sc22/wg14/www/docs/n2176.pdf",
                kind: "spec",
              },
              {
                title: "GCC — Warning Options (-Wdangling-pointer)",
                url: "https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html",
                kind: "docs",
              },
            ],
          },
        ),
        topic(
          "dangling-pointers",
          "Dereferencing freed or expired storage is undefined, and the program may pass tests until the allocator reuses the block.",
          [
            "use-after-free",
            "use-after-scope",
            "pointer invalidation",
            "quarantine",
            "ASan poisoning",
          ],
          "Write three failing cases: use after `free`, use after block exit, and a pointer into a buffer moved by `realloc`; run each under `-fsanitize=address -fsanitize-address-use-after-scope`, save the three stacks, and fix the ownership in each case.",
          {
            summary:
              "A dangling pointer holds an address whose object no longer exists, usually after `free`, block exit or a `realloc` that moved the block. The pointer still compares and may still read plausible bytes, which is why the bug survives casual testing. AddressSanitizer poisons freed and expired stack storage, turning the access into a report with the allocation and free stacks.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Setting one alias to `NULL` after `free` while copies remain: every alias is dangling, so centralize ownership and invalidate all references.",
              "Holding a pointer into a dynamic array across growth: `realloc` may move it, so store an index and recompute the address after growth.",
              "Assuming a freed block still contains the old value: the allocator may reuse it, so treat the memory as unavailable immediately.",
            ],
          },
        ),
        topic(
          "undefined-behavior",
          "The optimizer is allowed to assume undefined behavior never happens, so a test at `-O0` proves nothing about the release build.",
          [
            "undefined, unspecified and implementation-defined behavior",
            "optimizer assumptions",
            "UBSan",
            "`-fwrapv`",
            "trap representation",
          ],
          "Compile a loop that increments a signed `int` to `INT_MAX` at `-O0` and `-O2`, run both under `timeout 2` and compare the exit status; then rebuild with `-fsanitize=undefined -fno-sanitize-recover=all` and paste the runtime error.",
          {
            summary:
              "Undefined behavior is a construct for which ISO C imposes no requirements: signed overflow, out-of-bounds access, null dereference, misaligned access and data races are examples. The compiler may assume it never occurs, so the same loop can exit at `-O0` and run forever at `-O2`. `-fsanitize=undefined` instruments the operations the standard leaves undefined and reports them at runtime.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Treating a passing `-O0` run as proof: optimization exposes the assumption, so test at `-O2` and under UBSan.",
              "Confusing unspecified behavior with undefined behavior: evaluation order may vary but remains valid, while undefined behavior has no requirements at all.",
              "Using `-fwrapv` to make signed overflow defined: it changes one compiler's semantics, so rewrite the arithmetic with unsigned types or explicit checks.",
            ],
          },
        ),
        topic(
          "buffer-overflow",
          "One byte past an array can overwrite a return address or another object, and the corruption appears at a later return.",
          ["out-of-bounds write", "stack canary", "`_FORTIFY_SOURCE`", "redzone", "off-by-one"],
          "Copy a 16-byte string into `char buf[8]` with `strcpy`, capture the AddressSanitizer stack-buffer-overflow report, fix it with `snprintf` and a truncation test, then repeat with `-fstack-protector-all` to show the canary abort.",
          {
            summary:
              "A buffer overflow writes outside an array's bounds into adjacent storage, corrupting another object, a saved frame pointer or a return address. The write itself may not fault; the crash often appears later when the corrupted value is used. Stack canaries and `_FORTIFY_SOURCE` detect some cases, but the fix is a capacity check at the write.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Writing the terminator at `buf[strlen(src)]` into a full buffer: the index is one past the last writable byte, so check the capacity before copying.",
              "Using `strncpy(dst, src, sizeof dst)` and then printing `dst`: the result may lack a terminator, so reserve the last byte or use `snprintf`.",
              "Relying on a canary as the fix: it aborts some overwrites but does not prevent the corruption, so bound the write.",
            ],
          },
        ),
        topic(
          "memory-leakage",
          "A leak on an error path compounds in a long-running process until allocation fails and the service stops.",
          [
            "reachability",
            "definitely lost and still reachable",
            "LeakSanitizer",
            "ownership transfer",
            "error-path cleanup",
          ],
          "Leak a 4 KiB block on an error path, build with `-fsanitize=address -g`, run `valgrind --leak-check=full --show-leak-kinds=all` and `ASAN_OPTIONS=detect_leaks=1`, then add a single cleanup label and show both tools clean.",
          {
            summary:
              "A memory leak is allocated storage that is no longer reachable and was never freed, so the allocator cannot reuse it. Valgrind classifies blocks as definitely lost, indirectly lost, possibly lost or still reachable, and LeakSanitizer reports unreachable allocations at process exit. The leak matters in proportion to how often the path runs and how long the process lives.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Freeing only on the success path: an early return leaks, so route every exit through one cleanup block.",
              "Overwriting the only pointer with a new allocation: the old block becomes unreachable, so free or transfer it before reassigning.",
              "Treating every still-reachable block as a leak: global caches may be intentional, so check the stack and the ownership before changing the code.",
            ],
          },
        ),
      ],
    },
    {
      slug: "build-and-toolchain",
      title: "The build and toolchain",
      description:
        "Turn a pile of source files into a reproducible build. You will split a project into headers and translation units, resolve symbols, and write a Makefile and a CMake build that rebuild only what changed.",
      topics: [
        topic(
          "preprocessors",
          "A macro that evaluates its argument twice turns `SQUARE(i++)` into two increments, and missing include guards duplicate definitions.",
          [
            "translation phase 4",
            "object-like and function-like macros",
            "token pasting and stringizing",
            "include guard",
            "predefined macros",
          ],
          "Run `gcc -E` and `gcc -dM -E - < /dev/null` to capture predefined macros; then define `SQUARE(x) x*x`, call `SQUARE(i++)`, and replace it with a `static inline` function after showing the double evaluation.",
          {
            summary:
              "The preprocessor runs before semantic analysis and operates on tokens: it expands `#include`, substitutes `#define` macros, evaluates conditional directives and emits one translation unit. Macros are textual, untyped and evaluate their arguments at each use. A `do { statements } while (0)` wrapper keeps a multi-statement macro usable in an unbraced `if`, and `gcc -E` shows the exact expansion.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Defining `SQUARE(x) x*x`: `SQUARE(a + 1)` expands to `a + 1*a + 1`, so parenthesize every parameter and the whole body.",
              "Using a macro argument with a side effect: the argument is expanded at each occurrence, so evaluate it once in a function or a temporary.",
              "Forgetting an include guard: a header included twice redefines structs and macros, so wrap the body in `#ifndef` or use `#pragma once` where supported.",
            ],
          },
        ),
        topic(
          "header-files",
          "A function defined in a header produces a multiple-definition error at link time, and a missing declaration hides type mismatches.",
          [
            "declaration versus definition",
            "include guard",
            "internal and external linkage",
            "`static inline`",
            "incomplete type",
          ],
          "Split a stats module into `stats.h` and `stats.c`; compile two translation units with `-Wmissing-prototypes`, run `nm` on both objects, then add a non-static definition to the header and capture the linker error before fixing it.",
          {
            summary:
              "A header shares declarations across translation units while definitions live in exactly one `.c` file. Include guards prevent a header from being processed twice in one translation unit, and `static inline` gives each unit a private definition for small helpers. A declaration without a definition passes compilation and fails at link time, which is why `nm` is part of the debugging loop.",
            difficulty: "core",
            minutes: 50,
            pitfalls: [
              "Defining a function in a header without `static inline`: every including unit emits a definition, so keep the definition in one `.c` file or mark it `static inline`.",
              "Relying on include order: a header that uses `size_t` or `FILE` without including `<stddef.h>` or `<stdio.h>` breaks when the order changes, so make each header self-contained.",
              "Putting a full struct definition behind an opaque pointer: the definition must be visible where members are accessed, so move the definition to a private header.",
            ],
          },
        ),
        topic(
          "linking",
          "A library in the wrong order or a missing `-lm` produces an undefined reference that the source alone cannot explain.",
          ["symbol resolution", "relocation", "static archive", "shared object", "link order"],
          "Build `libstats.a` with `ar rcs`, link it after `main.o`, run `nm` and `ldd`; move `-lstats` before the object to capture the undefined-reference error, then build a shared version and set `LD_LIBRARY_PATH`.",
          {
            summary:
              "The linker combines object files, resolves external symbols and applies relocations to produce an executable or library. Static archives contribute only the members that satisfy unresolved symbols, while shared objects are recorded as dependencies and loaded at startup. An undefined reference means no object or library supplied the definition, and link order determines whether an archive member is considered.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Putting `-lfoo` before the object that uses it: the archive is scanned once, so place libraries after the objects and repeat them for circular dependencies.",
              "Forgetting `-lm` for `sqrt` or `sin`: the compiler may inline some calls but the link still needs the math library on many systems.",
              "Linking objects built with different ABIs or libc versions: the symbols resolve but the layout differs, so rebuild every object with one toolchain.",
            ],
          },
        ),
        topic(
          "gnu-make",
          "A Makefile that omits header dependencies leaves stale objects in the binary after a struct change.",
          [
            "target, prerequisite and recipe",
            "timestamp-based rebuild",
            "pattern rule",
            "automatic variables",
            "generated dependency files",
          ],
          "Write a Makefile with a pattern rule, `-MMD -MP` dependency files and a `clean` target; run `make -n`, touch `stats.h`, and show that `make` rebuilds only the objects that include it.",
          {
            summary:
              "GNU Make reads a Makefile of targets, prerequisites and recipes, then rebuilds a target when a prerequisite is newer. Pattern rules and automatic variables keep the recipe generic; `-MMD -MP` generates header dependency files so a struct change rebuilds every affected object. A missing dependency produces a stale binary that still passes tests until the layout changes.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Indenting a recipe with spaces: the recipe line must start with a tab, so use `.RECIPEPREFIX` or fix the whitespace.",
              "Omitting header dependencies: changing a struct does not rebuild its users, so add `-MMD -MP` and include the `.d` files.",
              "Marking `clean` without `.PHONY`: a file named `clean` makes the target up to date, so declare `.PHONY: clean`.",
            ],
          },
        ),
        topic(
          "cmake",
          "Global include paths and in-source builds make the project non-reproducible and hide missing target dependencies.",
          [
            "target-based build description",
            "generated build system",
            "build type",
            "usage requirements",
            "out-of-source build",
          ],
          "Convert the project to `CMakeLists.txt` with one library and one executable; configure with `-DCMAKE_EXPORT_COMPILE_COMMANDS=ON`, build, run `ctest`, and show the compiler command CMake used for one object.",
          {
            summary:
              "CMake reads `CMakeLists.txt` and generates a native build system, so the same description drives Make, Ninja or an IDE. Targets carry usage requirements: include directories, compile features, definitions and link libraries. An out-of-source build keeps generated files away from the source tree and makes configuration reproducible.",
            difficulty: "core",
            minutes: 55,
            pitfalls: [
              "Using global `include_directories` instead of `target_include_directories`: dependencies leak to every target, so attach usage requirements to the target that owns them.",
              "Building in the source directory: generated files mix with sources and break clean rebuilds, so configure a separate build directory.",
              "Leaving the C standard at the compiler default: set `CMAKE_C_STANDARD 17` and `CMAKE_C_STANDARD_REQUIRED ON` so another compiler does not choose C89.",
            ],
          },
        ),
        topic(
          "gdb",
          "Without a debugger you see a segfault address, not the frame, argument and pointer value that produced it.",
          [
            "breakpoint and watchpoint",
            "stack frame and backtrace",
            "DWARF line table",
            "core dump",
            "memory examination",
          ],
          "Compile a null-dereference crash with `-g -O0`, run it under `gdb`, and record `run`, `bt`, `frame 0`, `p p`, `frame 1` and `info locals`; set a breakpoint before the fault, fix the null check and rerun to a clean exit.",
          {
            summary:
              "GDB runs a program under its control, stops at breakpoints, steps by source line or instruction, and inspects variables, registers and memory. A backtrace names the call chain and each frame's arguments; a core dump preserves the process image for post-mortem analysis. Symbols come from `-g`; optimization can eliminate variables, so debug builds use `-O0`.",
            difficulty: "core",
            minutes: 60,
            pitfalls: [
              "Debugging a binary compiled without `-g`: GDB shows addresses and no source, so rebuild with `-g -O0` before the session.",
              "Expecting optimized-out variables to print: `-O2` merges and removes objects, so use a debug build or inspect registers and memory.",
              "Reading `p` when it is uninitialized or `NULL`: the command itself fails or shows garbage, so check the pointer before dereferencing.",
            ],
          },
        ),
      ],
    },
    {
      slug: "dynamic-analysis",
      title: "Dynamic analysis and testing",
      description:
        "Find the bugs that tests and compilers miss. You will run Valgrind, AddressSanitizer and strace on a failing program, and add a small unit test suite that catches a regression.",
      topics: [
        topic(
          "valgrind",
          "Memcheck catches uninitialized reads and invalid frees that produce no crash and no compiler warning.",
          [
            "dynamic binary instrumentation",
            "shadow memory",
            "uninitialized value",
            "definitely lost block",
            "suppression file",
          ],
          "Run a program with an uninitialized branch and a leaked block under `valgrind --leak-check=full --track-origins=yes`; paste the conditional-jump and definitely-lost reports, fix both, and show the clean summary.",
          {
            summary:
              "Valgrind's Memcheck runs the binary on a synthetic CPU and tracks every memory access, flagging invalid reads and writes, uninitialized uses and leaks. It needs symbols to attribute errors, so build with `-g -O0`, and it slows execution by roughly 10 to 50 times. `--track-origins=yes` follows an uninitialized value back to the allocation that produced it.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Reading the `still reachable` count as a leak: global caches remain reachable by design, so inspect the stack trace before changing ownership.",
              "Running a stripped or optimized binary: stack traces lose file and line information, so rebuild with `-g -O0`.",
              "Reading only the leak summary and skipping the error summary: invalid reads and uninitialized uses are reported separately, so check `ERROR SUMMARY` and every stack trace.",
            ],
          },
        ),
        topic(
          "asan--lsan",
          "ASan reports the exact overflowing access and allocation stack, which a core dump alone rarely identifies.",
          [
            "shadow memory and redzones",
            "quarantine",
            "stack symbolization",
            "LeakSanitizer",
            "`ASAN_OPTIONS`",
          ],
          "Build a heap overflow and a leak with `-fsanitize=address -fno-omit-frame-pointer -g`, capture both reports with symbolized frames, fix them, and rerun with `ASAN_OPTIONS=detect_leaks=1:abort_on_error=1`.",
          {
            summary:
              "AddressSanitizer instruments loads and stores at compile time and checks them against shadow memory, placing redzones around stack, heap and global objects. A violation reports the access, the allocation stack and the free stack, then aborts by default. LeakSanitizer runs at exit and reports allocations that are no longer reachable; it is enabled by default on Linux.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Mixing sanitized and unsanitized objects: the runtime sees incompatible layouts, so compile and link every object with the same sanitizer flags.",
              "Expecting ASan to catch uninitialized reads: it tracks addressability, not initialization, so use MemorySanitizer or Valgrind for that class.",
              "Assuming a redzone covers every overflow: accesses far past the object can land in another valid allocation, so keep bounds checks in the code.",
            ],
          },
        ),
        topic(
          "strace",
          "The failing call may be a syscall returning `ENOENT` or `EACCES`, and the C source does not show the errno.",
          [
            "system call boundary",
            "`ptrace`",
            "errno return convention",
            "file descriptor lifecycle",
            "syscall filter",
          ],
          "Run a file reader under `strace -f -e trace=openat,read,write,close -o trace.txt`; find the failed `openat` and its errno, fix the path, and diff the two traces to show the descriptor lifecycle.",
          {
            summary:
              "`strace` attaches with `ptrace` and records system calls, their arguments, return values and `errno`, plus signals delivered to the process. It shows the kernel boundary that libc hides: `openat`, `read`, `write`, `mmap`, `clone` and `wait4`. Filtering with `-e trace=` and following children with `-f` keeps the trace readable.",
            difficulty: "advanced",
            minutes: 50,
            pitfalls: [
              "Tracing a setuid binary: the kernel disables `ptrace` for privilege changes, so run the trace as the same user without setuid.",
              "Confusing a libc function with a syscall: `fopen` calls `openat`, but not every libc call appears, so filter for the calls you expect.",
              "Leaving `-f` off for a forked server: the child's syscalls disappear from the trace, so follow forks when diagnosing process behavior.",
            ],
          },
        ),
        topic(
          "testing",
          "Without a repeatable test, a fixed bug returns with the next refactor and no one notices until production.",
          [
            "test harness",
            "assertion",
            "fixture setup and teardown",
            "exit status",
            "regression test",
          ],
          "Write a test executable for a bounded ring buffer with `assert`, one failing case and a `make test` target; run it under `-fsanitize=address,undefined` and record the pass and fail exit statuses.",
          {
            summary:
              "C has no built-in test runner: a test is a program that calls the code, checks results and returns a nonzero exit status on failure. `assert` aborts with file and line information, while a framework adds named cases, fixtures and reporting. Tests must cover error paths and run under sanitizers, because a passing assertion says nothing about the memory that produced the value.",
            difficulty: "core",
            minutes: 45,
            pitfalls: [
              "Compiling tests with `-DNDEBUG`: `assert` expands to nothing, so keep the test build free of that define.",
              "Testing only the happy path: the error and boundary branches remain unexercised, so add cases for empty, full and invalid input.",
              "Depending on test execution order: shared global state makes one test change another's result, so reset fixtures in `setUp` or make each test self-contained.",
            ],
            resources: [
              {
                title: "cppreference — assert",
                url: "https://en.cppreference.com/w/c/error/assert",
                kind: "docs",
              },
              {
                title: "GNU C Library — Assertions",
                url: "https://www.gnu.org/software/libc/manual/html_node/Assertions.html",
                kind: "docs",
              },
              {
                title: "Unity — ThrowTheSwitch",
                url: "https://github.com/ThrowTheSwitch/Unity",
                kind: "code",
              },
            ],
          },
        ),
        topic(
          "unity",
          "A framework gives each assertion a file and line, so a failure identifies the case instead of only the exit status.",
          [
            "test runner",
            "assertion macro",
            "`setUp` and `tearDown`",
            "test case registry",
            "exit code",
          ],
          "Add Unity to a small project, write three tests for a ring buffer with `TEST_ASSERT_EQUAL_INT`, run `make test`, then break the implementation and paste the failing file and line from Unity's output.",
          {
            summary:
              "Unity is a small test framework distributed as a few C files: a test file defines `test_*` functions, `RUN_TEST` registers them, and `UNITY_BEGIN` and `UNITY_END` produce a summary and exit code. `TEST_ASSERT_EQUAL_INT` reports expected and actual values with the file and line. `setUp` and `tearDown` run around each test to reset fixtures.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Forgetting `UNITY_END`: the runner returns without a summary or a failing exit code, so end `main` with it.",
              "Passing actual first and expected second: the failure message reverses them, so keep the expected value as the first argument.",
              "Sharing a global fixture without `setUp`: one test's mutation leaks into the next, so reset the fixture before every case.",
            ],
          },
        ),
        topic(
          "cmocka",
          "Without link-time wrapping, a unit test of an error path needs the real sensor or a hand-edited source file.",
          ["link-time wrapping", "mock function", "expectation queue", "fixture", "group test"],
          "Wrap a `read_sensor` dependency with `-Wl,--wrap=read_sensor` and `__wrap_read_sensor`, queue two return values with `will_return`, assert the results with `assert_int_equal`, and run the group through `cmocka_run_group_tests`.",
          {
            summary:
              "CMocka provides assertions, fixtures and function mocking for C. A dependency is replaced at link time with `-Wl,--wrap=name`, and the test defines `__wrap_name` to call `mock()` for each queued value. `will_return` queues return values and `expect_*` asserts call counts, so the test controls the boundary without touching the real implementation.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Defining `__wrap_name` without `--wrap=name`: the linker still calls the real symbol, so add the flag to the test target.",
              "Queuing values in a different order than the calls: `mock()` consumes the queue in order, so match the sequence or split the tests.",
              "Leaking memory inside a mock: CMocka can check it, but only if the mock frees what it allocates, so mirror the real ownership contract.",
            ],
          },
        ),
      ],
    },
    {
      slug: "systems-programming",
      title: "Systems programming",
      description:
        "Use the operating system directly. You will read and write files with file descriptors, spawn and wait for a process, use a pipe, synchronize threads and explain the memory-ordering guarantee of an atomic.",
      topics: [
        topic(
          "file-io",
          "A single `read` or `write` may transfer fewer bytes than requested, and ignoring the count truncates data or loops forever.",
          [
            "file descriptor",
            "short read and short write",
            "`EINTR` retry",
            "`O_CLOEXEC`",
            "stdio buffering",
          ],
          "Write `copy_fd(int in, int out)` that retries `read` and `write` on `EINTR` and on short writes; copy a 100 MiB file, compare `sha256sum`, and use `strace -e trace=read,write` to show the buffer size.",
          {
            summary:
              "POSIX file I/O uses a small integer descriptor: `open` returns the lowest free descriptor, `read` and `write` transfer bytes, and `close` releases it. Both calls can return a short count, and a signal can interrupt them with `EINTR` before any data moves. The standard I/O streams buffer on top of descriptors, so mixing the two requires a seek or a single interface per descriptor.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Assuming one `read` fills the buffer: a short count is normal, so loop until EOF or the requested byte count is reached.",
              "Ignoring the return value of `write`: a partial write truncates the output, so advance the buffer and retry the remainder.",
              "Mixing `read` with `fread` on the same descriptor: the stdio buffer holds unread bytes, so use one interface per descriptor or flush and seek.",
            ],
          },
        ),
        topic(
          "process-management",
          "Skipping `waitpid` leaves zombies, and treating any nonzero status as an exit code misreads a signal death.",
          [
            "`fork` and copy-on-write",
            "`exec` image replacement",
            "`waitpid` status macros",
            "zombie process",
            "signal termination",
          ],
          "Fork, exec `/bin/sh -c 'exit 7'`, call `waitpid`, and print `WIFEXITED` and `WEXITSTATUS`; then remove the `waitpid` call, make the parent sleep for 30 seconds, and run `ps -o stat,comm` in another terminal to show the zombie before fixing it.",
          {
            summary:
              "`fork` creates a child with a copy-on-write duplicate of the address space; `exec` replaces that image with a new program; `waitpid` reaps the child and encodes its exit or signal status. `WIFEXITED` and `WEXITSTATUS` decode a normal exit, while `WIFSIGNALED` and `WTERMSIG` decode a signal death. A child that exits before being waited becomes a zombie until the parent reaps it.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Calling `exit` in the child after a failed `exec`: buffered stdio is flushed twice, so call `_exit(127)` on the error path.",
              "Reading the raw wait status as the exit code: the value is encoded, so use `WIFEXITED` and `WEXITSTATUS`.",
              "Ignoring `EINTR` from `waitpid`: a signal handler can interrupt the wait, so retry while `errno == EINTR`.",
            ],
          },
        ),
        topic(
          "ipc",
          "An unclosed pipe end prevents EOF, and a write larger than `PIPE_BUF` can interleave with another writer.",
          [
            "anonymous pipe",
            "EOF on last writer close",
            "`PIPE_BUF` atomic write",
            "descriptor inheritance",
            "`socketpair`",
          ],
          "Create a pipe, fork a child that writes 4096 bytes and closes, read until EOF in the parent, and use `strace -f -e trace=pipe2,read,write,close` to show descriptor inheritance; then leave the write end open and run the reader under `timeout 2` to show it never reaches EOF.",
          {
            summary:
              "A pipe is a unidirectional byte stream with a read end and a write end, created by `pipe` and shared across `fork`. Closing the last write end delivers EOF to the reader, and a write of at most `PIPE_BUF` bytes is atomic with respect to other writers. File descriptors inherit across `exec` unless marked close-on-exec, so unused ends must be closed deliberately.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Forgetting to close the unused write end in the reader: EOF never arrives, so close both unused ends in every process.",
              "Assuming a write larger than `PIPE_BUF` is atomic: another writer can interleave, so frame messages or serialize access.",
              "Writing to a pipe with no reader: the process receives `SIGPIPE` and dies by default, so ignore the signal or handle `EPIPE`.",
            ],
          },
        ),
        topic(
          "posix-threads",
          "Concurrent increments without synchronization lose updates, and the C memory model calls the resulting data race undefined behavior.",
          [
            "thread start routine",
            "shared address space",
            "`pthread_join`",
            "detached thread",
            "data race",
          ],
          "Start four threads that increment a shared `long` 1,000,000 times each; run under `-fsanitize=thread` to capture the race, add a mutex, and show the final count 4,000,000.",
          {
            summary:
              "POSIX threads share the address space, file descriptors and globals, while each thread has its own stack, registers and thread-local storage. `pthread_create` starts a routine that returns `void *`, and `pthread_join` waits for it and retrieves that pointer. Two threads accessing the same non-atomic object with at least one write and no synchronization form a data race, which C defines as undefined behavior.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Passing the address of a loop variable to every thread: all threads read the same changing value, so pass a per-thread struct or the value itself.",
              "Calling `exit` from a thread routine: it terminates the whole process, so return from the routine or call `pthread_exit`.",
              "Neither joining nor detaching: the thread's resources remain until the process exits, so join when the result matters and detach when it does not.",
            ],
          },
        ),
        topic(
          "mutexes",
          "Two locks taken in opposite orders deadlock, and a condition wait without a predicate loop wakes on a stale condition.",
          [
            "critical section",
            "mutual exclusion",
            "lock ordering",
            "condition variable predicate",
            "priority inversion",
          ],
          "Protect a shared counter with `pthread_mutex_t`, then write two threads that lock `m1` then `m2` and `m2` then `m1`; run the program under `gdb`, interrupt after the deadlock, capture `thread apply all bt`, and fix the order.",
          {
            summary:
              "A `pthread_mutex_t` makes a critical section exclusive: `pthread_mutex_lock` blocks until the lock is free, and `pthread_mutex_unlock` releases it. The mutex protects an invariant, so every access to the shared state must take the same lock, including reads that race with writes. Two locks acquired in opposite orders deadlock, and a condition variable must be waited on in a loop that rechecks its predicate.",
            difficulty: "advanced",
            minutes: 55,
            pitfalls: [
              "Unlocking a mutex from a different thread: only the owner may unlock a normal mutex, so pair lock and unlock in the same execution path.",
              "Holding the lock across `read` or `write`: the critical section grows and other threads block, so copy the data out and release before I/O.",
              "Waiting on a condition without a `while` predicate: spurious wakeups and lost signals break the invariant, so recheck the condition after every wake.",
            ],
          },
        ),
        topic(
          "_atomic",
          "Non-atomic access to a shared object is a data race, and `volatile` does not provide atomicity or ordering.",
          [
            "atomic object",
            "memory order",
            "happens-before",
            "compare-and-swap",
            "lock-free operation",
          ],
          "Implement a spinlock with `atomic_flag_test_and_set_explicit` using acquire and release orders, and a counter with `atomic_fetch_add_explicit`; run four threads to 4,000,000 under ThreadSanitizer, then print the counter with `atomic_load_explicit(&counter, memory_order_relaxed)` and explain why the count is correct while the spinlock still needs acquire and release.",
          {
            summary:
              "`_Atomic` marks an object whose loads and stores are indivisible, and `<stdatomic.h>` supplies operations such as `atomic_load`, `atomic_fetch_add` and `atomic_compare_exchange_strong`. Every atomic operation carries a memory order; the default `memory_order_seq_cst` gives a single total order, while weaker orders permit reordering. An atomic protects one object, not a multi-field invariant, which still needs a mutex or a lock-free protocol.",
            difficulty: "advanced",
            minutes: 60,
            pitfalls: [
              "Using `volatile` for synchronization: it prevents some optimizations but gives no atomicity or happens-before, so use `_Atomic`.",
              "Assuming every atomic type is lock-free: `atomic_is_lock_free` may be false for large types, so check when latency matters.",
              "Mixing atomic and non-atomic access to the same object: the non-atomic access is a data race, so make every access atomic or protect all of them with a lock.",
            ],
          },
        ),
      ],
    },
  ],
};
