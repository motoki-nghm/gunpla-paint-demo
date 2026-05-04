import { useCallback } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { usePaintDemoStore } from '@/stores/paintDemoStore'

const MAX_SIZE = Number(import.meta.env.VITE_MAX_IMAGE_SIZE_BYTES) || 10_485_760
const ACCEPT = { 'image/jpeg': [], 'image/png': [], 'image/webp': [] }

export default function UploadPanel() {
  const uploadedImageUrl = usePaintDemoStore((s) => s.uploadedImageUrl)
  const uploadedFile = usePaintDemoStore((s) => s.uploadedFile)
  const error = usePaintDemoStore((s) => s.error)
  const setUploadedFile = usePaintDemoStore((s) => s.setUploadedFile)
  const setError = usePaintDemoStore((s) => s.setError)

  const uploadError = !uploadedFile ? error : null

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) {
        const code = rejected[0].errors[0].code
        setError(
          code === 'file-too-large'
            ? `ファイルサイズが ${MAX_SIZE / 1_048_576}MB を超えています。`
            : '非対応の形式です。JPEG・PNG・WebP をご利用ください。',
        )
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
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={[
          'relative flex cursor-pointer flex-col items-center justify-center',
          'rounded-2xl border-2 border-dashed transition-all duration-300',
          uploadedImageUrl ? 'h-64' : 'h-52',
          isDragActive
            ? 'border-violet-400 bg-violet-500/10 scale-[1.01]'
            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8',
        ].join(' ')}
      >
        <input {...getInputProps()} aria-label="ガンプラ画像をアップロード" />

        {uploadedImageUrl ? (
          <img
            src={uploadedImageUrl}
            alt="アップロードしたガンプラ"
            className="h-full w-full rounded-2xl object-contain p-2"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-white/30 select-none">
            <div className="rounded-full bg-white/5 p-4">
              <UploadIcon className="h-7 w-7" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white/50">
                {isDragActive ? 'ここにドロップ…' : 'ドラッグ＆ドロップ'}
              </p>
              <p className="mt-0.5 text-xs text-white/25">またはクリックして選択</p>
              <p className="mt-2 text-xs text-white/20">
                JPEG・PNG・WebP・最大 {MAX_SIZE / 1_048_576}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {uploadedImageUrl && (
        <button
          onClick={(e) => { e.stopPropagation(); setUploadedFile(null) }}
          className="text-xs text-white/30 underline underline-offset-2 hover:text-white/60 transition-colors"
        >
          画像を削除
        </button>
      )}

      {uploadError && (
        <p className="text-xs text-red-400" role="alert" aria-live="polite">{uploadError}</p>
      )}
    </div>
  )
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none"
      viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 7.5m0 0L7.5 12M12 7.5V18" />
    </svg>
  )
}
