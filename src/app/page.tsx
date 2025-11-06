'use client';

import { useMemo, useState } from "react";

type Interpretation = {
  id: string;
  label: string;
  snippet: string;
  explanation: string;
  view: string[];
};

type QuizQuestion = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

const reinterpretations: Interpretation[] = [
  {
    id: "char",
    label: "char*",
    snippet: `void *buffer = malloc(8);
char *text = (char*)buffer;
text[0] = 'A';`,
    explanation:
      "Treat the raw memory as characters. Great for byte-by-byte access, but you must ensure there is enough allocated space.",
    view: ["'A' (0x41)", "'\\0'", "?", "?", "?", "?", "?", "?"],
  },
  {
    id: "int",
    label: "int*",
    snippet: `void *buffer = malloc(sizeof(int));
int *value = static_cast<int*>(buffer);
*value = 1024;`,
    explanation:
      "Reinterpret the bytes as a 32-bit integer. Alignment matters: the buffer must be suitably aligned for the target type.",
    view: ["0x00", "0x04", "0x00", "0x00", "?", "?", "?", "?"],
  },
  {
    id: "double",
    label: "double*",
    snippet: `alignas(double) std::byte buffer[8];
void *raw = buffer;
double *pi = static_cast<double*>(raw);
*pi = 3.1415926535;`,
    explanation:
      "Large types demand careful alignment. Here the same bytes encode an IEEE-754 double. Misaligned access on some CPUs causes crashes.",
    view: ["0x18", "0x2D", "0x44", "0x54", "0xFB", "0x21", "0x09", "0x40"],
  },
  {
    id: "struct",
    label: "struct Example*",
    snippet: `struct Example { int id; float ratio; };
void *opaque = create();
Example *ex = reinterpret_cast<Example*>(opaque);
printf("%d %.2f\\n", ex->id, ex->ratio);`,
    explanation:
      "Opaque APIs often return void pointers to hide implementation details. The caller must cast back to the concrete type safely.",
    view: ["id: 7", "id bytes...", "ratio: 0.75f", "..."],
  },
];

const quizQuestions: QuizQuestion[] = [
  {
    question: "Why does C provide void pointers?",
    options: [
      "To automatically convert data to any type without casting.",
      "To store addresses generically when the pointed-to type is unknown.",
      "To let the compiler infer the correct type later.",
      "To prevent manual memory management.",
    ],
    answer: 1,
    explanation:
      "A void pointer represents an address without a declared pointed-to type, which is useful for generic containers and APIs.",
  },
  {
    question: "Which operation is illegal directly on a void pointer?",
    options: [
      "Comparing the address with another pointer.",
      "Assigning NULL.",
      "Incrementing with pointer arithmetic.",
      "Casting to a typed pointer.",
    ],
    answer: 2,
    explanation:
      "Pointer arithmetic needs the size of the pointed-to type. A void pointer lacks that info, so you must cast before arithmetic.",
  },
  {
    question: "What must you guarantee before casting a void* back to a struct*?",
    options: [
      "The struct has only primitive fields.",
      "The memory was aligned and originally allocated for that struct type.",
      "The struct is marked with typedef.",
      "The struct size is less than 16 bytes.",
    ],
    answer: 1,
    explanation:
      "You must cast only to the type that was originally stored there and respect alignment requirements.",
  },
];

const pointerBlocks = Array.from({ length: 8 }, (_, index) => ({
  index,
  address: `0x${(0x1000 + index).toString(16).toUpperCase()}`,
}));

const featureHighlights = [
  {
    title: "Generic APIs",
    description:
      "Libraries expose void* parameters so they can accept any buffer or user-defined structure without templates or function overloading.",
  },
  {
    title: "Interfacing Languages",
    description:
      "When bridging C with higher-level languages, void pointers carry foreign data without embedding compile-time types.",
  },
  {
    title: "Opaque Handles",
    description:
      "Operating systems return handles as void pointers to hide implementation details and maintain ABI stability.",
  },
  {
    title: "Low-Level Flexibility",
    description:
      "Drivers, allocators, and serializers treat memory as raw bytes, using void* to reinterpret data only when needed.",
  },
];

export default function Home() {
  const [selectedId, setSelectedId] = useState<string>(reinterpretations[0].id);
  const [quizAnswers, setQuizAnswers] = useState<number[]>(() =>
    Array.from({ length: quizQuestions.length }, () => -1),
  );
  const [submitted, setSubmitted] = useState(false);

  const selectedInterpretation = useMemo(
    () => reinterpretations.find((entry) => entry.id === selectedId) ?? reinterpretations[0],
    [selectedId],
  );

  const score = useMemo(
    () =>
      quizAnswers.reduce((total, answer, index) => {
        if (answer === quizQuestions[index]?.answer) {
          return total + 1;
        }
        return total;
      }, 0),
    [quizAnswers],
  );

  return (
    <div className="min-h-screen bg-slate-950 pb-24 text-slate-100">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 py-16 sm:px-10 lg:px-16">
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-px">
          <div className="relative h-full w-full rounded-[2.5rem] bg-slate-950">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.25),_transparent_55%)]" />
            <div className="relative flex flex-col gap-10 px-8 py-16 sm:px-12 lg:px-20">
              <div className="w-fit rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium uppercase tracking-[0.2em] text-emerald-200">
                Void Pointers, Demystified
              </div>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                Master the most flexible pointer in C and C++ without the footguns.
              </h1>
              <p className="max-w-2xl text-lg text-slate-300">
                Void pointers let you treat memory as a blank slate, but that power comes with rules.
                Explore why they exist, how to wield them safely, and the pitfalls that matter in modern systems code.
              </p>
              <div className="flex flex-wrap gap-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-slate-200">
                  🧠 Conceptual intuition
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-slate-200">
                  🧪 Interactive visualizations
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-slate-200">
                  ✅ Knowledge check
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">What exactly is a void pointer?</h2>
            <p className="text-lg text-slate-300">
              In C, <code className="rounded bg-white/10 px-1 py-0.5 text-emerald-200">void*</code> is the universal pointer
              type. It stores an address but intentionally forgets the pointed-to type. That makes it ideal for generic
              algorithms, memory allocators, and APIs that traffic in opaque handles.
            </p>
            <p className="text-lg text-slate-300">
              The compiler only allows a few operations directly: assign, compare, or set to <code className="rounded bg-white/10 px-1 py-0.5 text-emerald-200">NULL</code>.
              To do anything else—read, write, or perform pointer arithmetic—you must cast it to the correct concrete type.
            </p>
            <p className="text-lg text-slate-300">
              Because a void pointer carries no type information, the programmer must guarantee that the target type and
              alignment are correct. Breaking that contract causes undefined behavior—from silent corruption to crashes.
            </p>
          </div>
          <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
            {featureHighlights.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-emerald-300/60 hover:bg-black/30"
              >
                <h3 className="text-xl font-semibold text-white group-hover:text-emerald-200">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-slate-300 sm:text-base">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">reinterpret_cast in action</h2>
            <p className="text-lg text-slate-300">
              Click a type to see how the same raw bytes gain meaning once you cast the void pointer. Real systems hop between
              these views constantly.
            </p>
            <div className="flex flex-wrap gap-3">
              {reinterpretations.map((interpretation) => {
                const isActive = selectedId === interpretation.id;
                return (
                  <button
                    key={interpretation.id}
                    type="button"
                    onClick={() => setSelectedId(interpretation.id)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30"
                        : "border border-white/20 bg-white/5 text-slate-200 hover:border-emerald-300/60 hover:text-white"
                    }`}
                  >
                    {interpretation.label}
                  </button>
                );
              })}
            </div>
            <div className="rounded-3xl border border-emerald-300/40 bg-black/30 p-6 sm:p-8">
              <pre className="overflow-x-auto rounded-2xl bg-black/60 p-5 text-sm leading-6 text-emerald-200">
{selectedInterpretation.snippet}
              </pre>
              <p className="mt-4 text-base text-slate-300">{selectedInterpretation.explanation}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <h3 className="text-xl font-semibold text-white sm:text-2xl">Visualizing the bytes</h3>
            <p className="text-sm text-slate-300 sm:text-base">
              Imagine an 8-byte buffer located at <code className="rounded bg-white/10 px-1 py-0.5 text-emerald-200">0x1000</code>.
              The cast tells the compiler how wide each read should be.
            </p>
            <div className="grid gap-3">
              <div className="grid grid-cols-4 gap-3 text-xs sm:text-sm">
                {pointerBlocks.map((block) => (
                  <div
                    key={block.address}
                    className="flex flex-col items-center justify-center rounded-2xl border border-white/15 bg-black/40 px-3 py-4 text-center text-slate-200"
                  >
                    <span className="text-[10px] uppercase tracking-wide text-slate-400 sm:text-xs">
                      {block.address}
                    </span>
                    <span className="mt-2 text-sm font-semibold text-emerald-200">
                      {selectedInterpretation.view[block.index] ?? "—"}
                    </span>
                  </div>
                ))}
              </div>
              <span className="text-xs text-slate-400">
                Each cell shows what gets read when the void pointer is cast to {selectedInterpretation.label}.
              </span>
            </div>
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Safety checklist</h2>
            <p className="text-lg text-slate-300">
              Before casting that void pointer, confirm these invariants. They are the difference between robust systems code
              and elusive memory bugs.
            </p>
            <ul className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200 sm:text-base">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-xs font-bold text-slate-900">
                  1
                </span>
                The memory was allocated for (or is at least big enough for) the target type.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-xs font-bold text-slate-900">
                  2
                </span>
                The address obeys the alignment constraints of the target type. Use <code className="rounded bg-white/10 px-1 py-0.5 text-emerald-200">alignof</code> if unsure.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-xs font-bold text-slate-900">
                  3
                </span>
                The lifetime of the object extends beyond the cast and any subsequent use.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-xs font-bold text-slate-900">
                  4
                </span>
                The code documents the expected type clearly—future maintainers rely on that contract.
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-rose-300/40 bg-gradient-to-br from-rose-950/80 via-rose-900/30 to-transparent p-6 sm:p-8">
            <h3 className="text-xl font-semibold text-white sm:text-2xl">Common pitfalls</h3>
            <div className="mt-5 space-y-4 text-sm text-rose-100 sm:text-base">
              <div>
                <p className="font-semibold text-rose-200">Losing track of the original type.</p>
                <p className="text-rose-100/80">
                  Document helper functions that manufacture void pointers. Without a clear ownership story, later casts can go wrong.
                </p>
              </div>
              <div>
                <p className="font-semibold text-rose-200">Incorrect alignment.</p>
                <p className="text-rose-100/80">
                  Some architectures (ARM, SPARC) trap on misaligned access. Use <code className="rounded bg-white/10 px-1 py-0.5 text-emerald-200">std::aligned_alloc</code> or padding.
                </p>
              </div>
              <div>
                <p className="font-semibold text-rose-200">Double casting to incompatible types.</p>
                <p className="text-rose-100/80">
                  Casting a pointer to mismatched types violates strict aliasing rules, leading the optimizer to assume impossible things.
                </p>
              </div>
              <div>
                <p className="font-semibold text-rose-200">Manual memory management mistakes.</p>
                <p className="text-rose-100/80">
                  If a void pointer hides whether the memory came from <code className="rounded bg-white/10 px-1 py-0.5 text-emerald-200">new</code> or <code className="rounded bg-white/10 px-1 py-0.5 text-emerald-200">malloc</code>,
                  you can easily pair the wrong deallocator.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Void pointers in modern C++</h2>
            <p className="mt-3 max-w-3xl text-lg text-slate-300">
              Modern code prefers templates, smart pointers, and <code className="rounded bg-white/10 px-1 py-0.5 text-emerald-200">std::span</code>, yet void pointers still surface at ABI boundaries, FFI layers, and performance-critical paths.
              Use them deliberately and confine them to narrow interfaces.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
              <h3 className="text-xl font-semibold text-white sm:text-2xl">Bridging with C libraries</h3>
              <p className="mt-3 text-sm text-slate-300 sm:text-base">
                Many POSIX APIs, from <code className="rounded bg-white/10 px-1 py-0.5 text-emerald-200">pthread_create</code> to <code className="rounded bg-white/10 px-1 py-0.5 text-emerald-200">qsort</code>,
                accept void pointers to generic data. Wrapping them in RAII types keeps the unsafe operations isolated.
              </p>
              <pre className="mt-4 overflow-x-auto rounded-2xl bg-black/50 p-5 text-xs leading-6 text-emerald-200 sm:text-sm">
{`struct ThreadJob {
  std::vector<int> payload;
};

void* start_job(void* raw) {
  auto* job = static_cast<ThreadJob*>(raw);
  process(job->payload);
  return nullptr;
}

pthread_create(&thread, nullptr, start_job, static_cast<void*>(&job));`}
              </pre>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
              <h3 className="text-xl font-semibold text-white sm:text-2xl">Building type-erased containers</h3>
              <p className="mt-3 text-sm text-slate-300 sm:text-base">
                Before generics, containers stored elements as void pointers. Modern equivalents use templates or std::any, but the core idea—type erasure—is unchanged.
              </p>
              <pre className="mt-4 overflow-x-auto rounded-2xl bg-black/50 p-5 text-xs leading-6 text-emerald-200 sm:text-sm">
{`struct Box {
  void* data;
  void (*deleter)(void*);
};

template <typename T>
Box make_box(T* value) {
  return {
    static_cast<void*>(value),
    [](void* ptr) { delete static_cast<T*>(ptr); },
  };
}`}
              </pre>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-6 rounded-[2.5rem] border border-white/15 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-8 sm:p-10">
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Quick knowledge check</h2>
            <p className="text-lg text-slate-300">
              Lock in your understanding by answering the questions below. Submit to reveal explanations.
            </p>
          </div>
          <div className="space-y-8">
            {quizQuestions.map((question, index) => {
              const userAnswer = quizAnswers[index];
              const answerClassname =
                submitted && userAnswer !== -1
                  ? userAnswer === question.answer
                    ? "border-emerald-400/60 bg-emerald-500/10"
                    : "border-rose-400/60 bg-rose-500/10"
                  : "border-white/10 bg-white/5";

              return (
                <div key={question.question} className={`rounded-3xl border ${answerClassname} p-6 sm:p-8`}>
                  <h3 className="text-lg font-semibold text-white sm:text-xl">
                    {index + 1}. {question.question}
                  </h3>
                  <div className="mt-4 grid gap-3">
                    {question.options.map((option, optionIndex) => {
                      const chosen = userAnswer === optionIndex;
                      const optionIsAnswer = optionIndex === question.answer;
                      const highlight =
                        submitted && optionIsAnswer
                          ? "border-emerald-400/60 bg-emerald-500/20"
                          : chosen
                            ? "border-emerald-400/40 bg-emerald-500/10"
                            : "border-white/10 bg-black/20 hover:border-emerald-300/50 hover:text-white";

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            if (submitted) return;
                            setQuizAnswers((prev) => {
                              const next = [...prev];
                              next[index] = optionIndex;
                              return next;
                            });
                          }}
                          className={`rounded-2xl border px-4 py-3 text-left text-sm transition sm:text-base ${highlight}`}
                        >
                          <span className="text-slate-200">{option}</span>
                        </button>
                      );
                    })}
                  </div>
                  {submitted && (
                    <p className="mt-4 text-sm text-slate-300 sm:text-base">
                      Explanation: {question.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex flex-col gap-3 rounded-3xl border border-white/15 bg-white/5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <p className="text-sm text-slate-200 sm:text-base">
              {submitted
                ? `You scored ${score} / ${quizQuestions.length}. ${score === quizQuestions.length ? "Perfect!" : "Review the sections above and try again."}`
                : "Select one answer per question and submit when ready."}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                className="rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/20 sm:text-base"
                onClick={() => {
                  setSubmitted(false);
                  setQuizAnswers(Array.from({ length: quizQuestions.length }, () => -1));
                }}
              >
                Reset
              </button>
              <button
                type="button"
                className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-300 sm:text-base"
                onClick={() => setSubmitted(true)}
              >
                Submit
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 sm:p-10">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">Further exploration</h2>
          <div className="mt-6 grid gap-4 text-sm text-slate-300 sm:text-base">
            <p>
              • Dive into <code className="rounded bg-white/10 px-1 py-0.5 text-emerald-200">std::uintptr_t</code> when you need to perform arithmetic on addresses safely.
            </p>
            <p>
              • Prefer higher-level abstractions (templates, <code className="rounded bg-white/10 px-1 py-0.5 text-emerald-200">std::variant</code>, <code className="rounded bg-white/10 px-1 py-0.5 text-emerald-200">std::any</code>) inside your codebase and limit void pointers to API edges.
            </p>
            <p>
              • Audit legacy code by tracing the lifecycle of each void pointer: creation, cast sites, and deallocation. Document expectations inline.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
