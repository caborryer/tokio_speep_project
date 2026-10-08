import Image from "next/image";
import { ICONS, type IconName } from "@/lib/sceneIcons";

type Props = { name: IconName; className?: string; priority?: boolean };

/** Icono pixel-art decorativo (ya viene optimizado, por eso `unoptimized`). */
export default function Icon({ name, className, priority }: Props) {
  const [w, h] = ICONS[name];
  return (
    <Image
      src={`/scene/icons/${name}.webp`}
      alt=""
      width={w}
      height={h}
      unoptimized
      priority={priority}
      draggable={false}
      className={className}
    />
  );
}
