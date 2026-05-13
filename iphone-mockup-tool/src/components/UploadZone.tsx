import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, ImageIcon, AlertCircle } from 'lucide-react'
import { useEditorStore } from '@/store/useEditorStore'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const ACCEPTED_TYPES = { 'image/png': [], 'image/jpeg': [], 'image/webp': [] }
const MAX_SIZE = 10 * 1024 * 1024

// iPhone 16 Pro aspect ratio: 1179 × 2556 ≈ 0.461
const IDEAL_RATIO = 1179 / 2556
const RATIO_TOLERANCE = 0.15

export function UploadZone() {
  const { screenshot, setScreenshot } = useEditorStore()
  const [warning, setWarning] = useState<string | null>(null)
  const [ignoreWarning, setIgnoreWarning] = useState(false)
  const [pendingDataUrl, setPendingDataUrl] = useState<string | null>(null)

  const processFile = useCallback(
    (file: File, force = false) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string

        const img = new Image()
        img.onload = () => {
          const ratio = img.width / img.height
          const deviation = Math.abs(ratio - IDEAL_RATIO) / IDEAL_RATIO

          if (!force && deviation > RATIO_TOLERANCE) {
            setWarning(
              `Image ratio is ${img.width}×${img.height} (${(ratio * 100).toFixed(0)}:100). ` +
                `Expected ~${(IDEAL_RATIO * 100).toFixed(0)}:100 (iPhone screen). ` +
                `It may appear stretched.`
            )
            setPendingDataUrl(dataUrl)
            return
          }

          setWarning(null)
          setPendingDataUrl(null)
          setIgnoreWarning(false)
          setScreenshot(dataUrl)
        }
        img.src = dataUrl
      }
      reader.readAsDataURL(file)
    },
    [setScreenshot]
  )

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) processFile(accepted[0])
    },
    [processFile]
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    maxFiles: 1,
    noClick: !!screenshot,
  })

  const rejectionMsg = fileRejections[0]?.errors[0]?.message

  return (
    <div className="space-y-3">
      {screenshot ? (
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/40">
          <img
            src={screenshot}
            alt="Uploaded screenshot"
            className="w-12 h-12 rounded object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Screenshot uploaded</p>
            <p className="text-xs text-muted-foreground">Drag or click below to replace</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setScreenshot(null)
              setWarning(null)
            }}
          >
            Remove
          </Button>
        </div>
      ) : null}

      <div
        {...getRootProps()}
        className={cn(
          'flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30'
        )}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <ImageIcon className="w-10 h-10 text-primary" />
        ) : (
          <Upload className="w-10 h-10 text-muted-foreground" />
        )}
        <div className="text-center">
          <p className="text-sm font-medium">
            {isDragActive ? 'Drop screenshot here' : 'Drop screenshot or click to upload'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPEG, WebP · max 10 MB</p>
        </div>
      </div>

      {rejectionMsg && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="w-3.5 h-3.5" />
          {rejectionMsg}
        </p>
      )}

      {warning && !ignoreWarning && (
        <div className="flex flex-col gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200">
          <div className="flex gap-1.5 text-xs">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{warning}</span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7"
              onClick={() => {
                setIgnoreWarning(true)
                if (pendingDataUrl) {
                  setScreenshot(pendingDataUrl)
                  setWarning(null)
                  setPendingDataUrl(null)
                }
              }}
            >
              Use anyway
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-7"
              onClick={() => {
                setWarning(null)
                setPendingDataUrl(null)
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
