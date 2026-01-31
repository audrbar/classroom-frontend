import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ALLOWED_TYPES,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  MAX_FILE_SIZE,
} from "@/constants";
import type { UploadWidgetProps } from "@/types";

const CLOUDINARY_WIDGET_SRC =
  "https://widget.cloudinary.com/v2.0/global/all.js";

const getAllowedFormats = (types: string[]) => {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpeg",
    "image/jpg": "jpg",
    "image/webp": "webp",
  };

  return types.map((type) => map[type]).filter(Boolean);
};

const UploadWidget = ({ value, onChange, disabled }: UploadWidgetProps) => {
  const widgetRef = useRef<CloudinaryWidget | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allowedFormats = useMemo(
    () => getAllowedFormats(ALLOWED_TYPES),
    []
  );

  const initWidget = useCallback(() => {
    if (!window.cloudinary) return;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      setError("Cloudinary configuration is missing.");
      return;
    }

    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET,
        sources: ["local", "url", "camera"],
        multiple: false,
        maxFileSize: MAX_FILE_SIZE,
        clientAllowedFormats: allowedFormats,
        cropping: false,
        showAdvancedOptions: false,
        showUploadMoreButton: false,
      },
      (widgetError, result) => {
        if (widgetError) {
          setError("Upload failed. Please try again.");
          return;
        }

        if (result?.event === "success") {
          const info = result.info;
          onChange?.({
            url: info.secure_url,
            publicId: info.public_id,
          });
          setError(null);
        }
      }
    );

    setIsReady(true);
  }, [allowedFormats, onChange]);

  useEffect(() => {
    if (window.cloudinary) {
      initWidget();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      "script[data-cloudinary-widget]"
    );

    if (existingScript) {
      existingScript.addEventListener("load", initWidget);
      return () => existingScript.removeEventListener("load", initWidget);
    }

    const script = document.createElement("script");
    script.src = CLOUDINARY_WIDGET_SRC;
    script.async = true;
    script.setAttribute("data-cloudinary-widget", "true");
    script.addEventListener("load", initWidget);
    script.addEventListener("error", () =>
      setError("Failed to load the upload widget.")
    );

    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", initWidget);
    };
  }, [initWidget]);

  const handleOpen = () => {
    if (disabled) return;
    if (!widgetRef.current) {
      setError("Upload widget is not ready yet.");
      return;
    }

    widgetRef.current.open();
  };

  const handleClear = () => {
    if (disabled) return;
    onChange?.(null);
  };

  return (
    <div className="flex flex-col gap-3">
      {value?.url ? (
        <div className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-md border">
            <img
              src={value.url}
              alt="Uploaded banner"
              className="h-44 w-full object-cover"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" onClick={handleOpen} disabled={!isReady || disabled}>
              Replace image
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              disabled={disabled}
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" onClick={handleOpen} disabled={!isReady || disabled}>
          Upload image
        </Button>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default UploadWidget;
