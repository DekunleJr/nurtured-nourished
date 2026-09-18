import Image from "next/image";

type FrameProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
};

/**
 * Signature media treatment: rounded image with hairline ring and layered
 * soft-peach/teal glow, plus an optional italic caption.
 */
export default function Frame({
  src,
  alt,
  width,
  height,
  caption,
  priority = false,
  className = "",
  imgClassName = "w-full object-cover",
}: FrameProps) {
  return (
    <figure className={`relative ${className}`.trim()}>
      <div
        className="absolute -left-6 -top-6 h-32 w-32 rounded-full bg-peach/40 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-8 right-2 h-40 w-40 rounded-full bg-primary-soft/70 blur-3xl"
        aria-hidden="true"
      />
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 50vw"
        className={`img-frame relative ${imgClassName}`.trim()}
      />
      {caption && (
        <figcaption className="mt-4 text-center font-serif text-sm italic text-charcoal/60">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
