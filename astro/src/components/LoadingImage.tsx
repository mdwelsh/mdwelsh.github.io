import { useEffect, useRef, useState } from "react";

export function LoadingImage({
  src,
  slices = 8,
  delay = 60,
}: {
  src: string;
  slices?: number;
  delay?: number;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const drawPartialImage = (progress: number) => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate how much of the image to show based on progress
    const sliceHeight = image.height / slices;
    const height = Math.floor(sliceHeight * (progress / 100));

    for (let i = 0; i < slices; i++) {
      const y = i * sliceHeight;
      ctx.drawImage(
        image,
        0, y, image.width, height, // Source rectangle
        0, y, canvas.width, height // Destination rectangle
      );
    }
  };

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      if (canvasRef.current) {
        canvasRef.current.width = img.width;
        canvasRef.current.height = img.height;
        imageRef.current = img;
        setImageLoaded(true);

        // Simulate slow loading
        let progress = 0;
        const interval = setInterval(() => {
          progress += 2;
          setLoadProgress(progress);
          drawPartialImage(progress);

          if (progress >= 100) {
            clearInterval(interval);
          }
        }, delay); // Adjust speed by changing interval time
      }
    };
    img.src = src;
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        maxWidth: "100%",
        height: "auto",
      }}
    />
  );
}
