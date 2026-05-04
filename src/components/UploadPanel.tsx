import { useCallback } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { usePaintDemoStore } from '@/stores/paintDemoStore'

const MAX_SIZE = Number(import.meta.env.VITE_MAX_IMAGE_SIZE_BYTES) || 10_485_760
const ACCEPT = { 'image/jpeg': [], 'image/png': [], 'image/webp': [] }

export default function UploadPanel() {
  const uploadedImageUrl = usePaintDemoStore((s) => s.uploadedImageUrl)
  const setUploadedFile = usePaintDemoStore((s) => s.setUploadedFile)
  const setError = usePaintDemoStore((s) => s.setError)

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) {
        const code = rejected[0].errors[0].code
        const msg =
          code === 'file-too-large'
            ? `File exceeds the ${MAX_SIZE / 1_048_576} MB limit.`
            : 'Unsupported format. Use JPEG, PNG, or WebP.'
        setError(msg)
        return
      }
      if (accepted[0]) {
        setError(null)
        setUploadedFile(accepted[0])
      }
    },
    [setUploadedFile, setError],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_SIZE,
    accept: ACCEPT,
    multiple: false,
  })

  return (
    <div className="space-y-2">
      <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Input Image</p>

      <div
        {...getRootProps()}
        className={[
          'relative flex h-52 cursor-pointer flex-col items-center justify-center',
          'rounded-lg border-2 border-dashed transition-colors duration-200',
          isDragActive
            ? 'border-amber-400 bg-amber-400/10'
            : 'border-zinc-600 bg-zinc-800 hover:border-zinc-400 hover:bg-zinc-800/80',
        ].join(' ')}
      >
        <input {...getInputProps()} aria-label="Upload gunpla image" />

        {uploadedImageUrl ? (
          <img
            src={uploadedImageUrl}
            alt="Uploaded gunpla preview"
            className="h-full w-full rounded-lg object-contain p-2"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-zinc-500 select-none">
            <UploadIcon className="h-8 w-8" />
            <p className="text-sm">
              {isDragActive ? 'Drop it here…' : 'Drag & drop or click to select'}
            </p>
            <p className="text-xs text-zinc-600">
              JPEG · PNG · WebP · max {MAX_SIZE / 1_048_576} MB
            </p>
          </div>
        )}
      </div>

      {uploadedImageUrl && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setUploadedFile(null)
          }}
          className="text-xs text-zinc-500 underline-offset-2 hover:text-zinc-300 underline"
        >
          Remove image
        </button>
      )}
    </div>
  )
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 7.5m0 0L7.5 12M12 7.5V18"
      />
    </svg>
  )
}
