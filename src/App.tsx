import ModeToggle from '@/components/ModeToggle'
import UploadPanel from '@/components/UploadPanel'
import PromptPanel from '@/components/PromptPanel'
import ResultPanel from '@/components/ResultPanel'

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <ModeToggle />

      <div className="mx-auto max-w-4xl px-4 py-12 space-y-8">
        {/* Header */}
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Gunpla Paint Demo
          </h1>
          <p className="text-sm text-zinc-500 font-mono">
            Upload a kit photo · describe your paint scheme · let Gemini repaint it
          </p>
        </header>

        {/* Main layout */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left column: input */}
          <div className="space-y-6">
            <UploadPanel />
            <PromptPanel />
          </div>

          {/* Right column: result */}
          <div>
            <ResultPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
