import { clsx } from "clsx";
import { Tutor } from "@/types/dashboard";

type TutorAvatarProps = {
  tutor: Tutor;
  size?: "md" | "lg";
};

export function TutorAvatar({ tutor, size = "md" }: TutorAvatarProps) {
  const dimension = size === "lg" ? "h-12 w-12" : "h-10 w-10";
  const initials = tutor.name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (tutor.avatarUrl) {
    return (
      <img
        src={tutor.avatarUrl}
        alt={tutor.name}
        className={clsx(
          "rounded-full border border-white/10 object-cover",
          dimension
        )}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={clsx(
        "flex items-center justify-center rounded-full border border-white/10 bg-white/10 text-sm font-semibold text-white",
        dimension
      )}
    >
      {initials}
    </div>
  );
}
