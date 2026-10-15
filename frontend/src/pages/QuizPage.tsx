import { useState } from 'react'
import { Notice, PageHeader } from '../components/ui'
import { QUESTIONS, TOPIC_LABEL, TOPIC_TIPS, type Topic } from '../data/quiz'

function scoreBand(pct: number) {
  if (pct >= 90) return { label: 'Cyber-aware champion', tone: 'text-emerald-300' }
  if (pct >= 70) return { label: 'Well informed', tone: 'text-teal-300' }
  if (pct >= 50) return { label: 'Getting there', tone: 'text-yellow-300' }
  return { label: 'Time to brush up', tone: 'text-orange-300' }
}

export default function QuizPage() {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(() => QUESTIONS.map(() => null))
  const [finished, setFinished] = useState(false)

  const q = QUESTIONS[index]
  const selected = answers[index]
  const answered = selected !== null

  function choose(option: number) {
    if (answered) return
    setAnswers((prev) => prev.map((a, i) => (i === index ? option : a)))
  }

  function restart() {
    setAnswers(QUESTIONS.map(() => null))
    setIndex(0)
    setFinished(false)
  }

  if (finished) {
    const correct = QUESTIONS.filter((qq, i) => answers[i] === qq.answer).length
    const pct = Math.round((100 * correct) / QUESTIONS.length)
    const band = scoreBand(pct)
    const topics = Object.keys(TOPIC_LABEL) as Topic[]
    const byTopic = topics.map((t) => {
      const qs = QUESTIONS.map((qq, i) => ({ qq, i })).filter(({ qq }) => qq.topic === t)
      const right = qs.filter(({ qq, i }) => answers[i] === qq.answer).length
      return { topic: t, right, total: qs.length }
    })
    const weak = byTopic.filter((t) => t.right < t.total)

    return (
      <div className="space-y-6">
        <PageHeader title="Your Cyber Awareness Results" subtitle="This personal awareness score is separate from the enterprise cryptographic risk assessment." />
        <section className="card text-center">
          <p className="text-sm uppercase tracking-wide text-slate-400">Your score</p>
          <p className="mt-2 text-5xl font-semibold text-white">
            {correct}<span className="text-2xl text-slate-500"> / {QUESTIONS.length}</span>
          </p>
          <p className={`mt-2 text-lg font-medium ${band.tone}`}>{band.label} ({pct}%)</p>
        </section>

        <section className="card">
          <h2 className="mb-3 font-medium text-white">Score by topic</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {byTopic.map((t) => (
              <li key={t.topic} className="rounded-lg border border-navy-700 bg-navy-850/50 p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-200">{TOPIC_LABEL[t.topic]}</span>
                  <span className={t.right === t.total ? 'text-emerald-300' : 'text-orange-300'}>{t.right}/{t.total}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-navy-700">
                  <div className="h-full bg-teal-400" style={{ width: `${(100 * t.right) / t.total}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2 className="mb-3 font-medium text-white">Personalised recommendations</h2>
          {weak.length === 0 ? (
            <Notice tone="success">Excellent - you answered every topic correctly. Share what you know with family and colleagues, especially those new to digital banking.</Notice>
          ) : (
            <ul className="space-y-3">
              {weak.map((t) => (
                <li key={t.topic} className="rounded-lg border border-navy-700 bg-navy-850/50 p-4">
                  <p className="font-medium text-teal-300">{TOPIC_LABEL[t.topic]}</p>
                  <p className="mt-1 text-sm text-slate-300">{TOPIC_TIPS[t.topic]}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2 className="mb-3 font-medium text-white">Review your answers</h2>
          <ol className="space-y-3">
            {QUESTIONS.map((qq, i) => {
              const ok = answers[i] === qq.answer
              return (
                <li key={qq.id} className="rounded-lg border border-navy-700 p-3 text-sm">
                  <p className="text-slate-200">
                    <span className={ok ? 'text-emerald-300' : 'text-red-300'}>{ok ? 'Correct' : 'Incorrect'}</span> &middot; {qq.prompt}
                  </p>
                  {!ok && <p className="mt-1 text-slate-400">Correct answer: {qq.options[qq.answer]}</p>}
                  <p className="mt-1 text-slate-500">{qq.explanation}</p>
                </li>
              )
            })}
          </ol>
        </section>

        <button type="button" className="btn btn-primary" onClick={restart}>Retake quiz</button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cybersecurity Awareness Quiz"
        subtitle="Twelve quick questions on everyday cyber safety and quantum-era cryptography. No sign-up, and your answers stay in your browser."
      />

      <section className="card mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between text-xs text-slate-400">
          <span>Question {index + 1} of {QUESTIONS.length}</span>
          <span className="rounded-full bg-navy-800 px-2 py-0.5 text-teal-300">{TOPIC_LABEL[q.topic]}</span>
        </div>
        <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-navy-700" aria-hidden="true">
          <div className="h-full bg-gradient-to-r from-sky-500 to-teal-400 transition-all" style={{ width: `${(100 * (index + (answered ? 1 : 0))) / QUESTIONS.length}%` }} />
        </div>

        <fieldset>
          <legend className="text-lg font-medium text-white">{q.prompt}</legend>
          <div className="mt-4 space-y-2">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.answer
              const isChosen = i === selected
              let style = 'border-navy-600 hover:border-sky-500/60 hover:bg-navy-850'
              if (answered && isCorrect) style = 'border-emerald-500/60 bg-emerald-500/10'
              else if (answered && isChosen) style = 'border-red-500/60 bg-red-500/10'
              else if (answered) style = 'border-navy-700 opacity-60'
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => choose(i)}
                  disabled={answered}
                  aria-pressed={isChosen}
                  className={`flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm text-slate-200 transition-colors disabled:cursor-default ${style}`}
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-xs">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              )
            })}
          </div>
        </fieldset>

        <div aria-live="polite">
          {answered && (
            <div className={`mt-4 rounded-lg border p-4 text-sm ${selected === q.answer ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-100' : 'border-amber-500/40 bg-amber-950/30 text-amber-100'}`}>
              <p className="font-medium">{selected === q.answer ? 'Correct!' : 'Not quite.'}</p>
              <p className="mt-1 opacity-90">{q.explanation}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-between">
          <button type="button" className="btn btn-secondary" onClick={() => setIndex((i) => i - 1)} disabled={index === 0}>
            Previous
          </button>
          {index < QUESTIONS.length - 1 ? (
            <button type="button" className="btn btn-primary" onClick={() => setIndex((i) => i + 1)} disabled={!answered}>
              Next question
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => setFinished(true)} disabled={!answered}>
              See results
            </button>
          )}
        </div>
      </section>
    </div>
  )
}
