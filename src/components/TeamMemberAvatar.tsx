function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function TeamMemberAvatar({
  name,
  photoUrl,
  className = "w-20 h-20",
}: {
  name: string;
  photoUrl?: string;
  className?: string;
}) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        className={`${className} rounded-full object-cover shrink-0`}
      />
    );
  }
  return (
    <div
      data-testid="team-member-initials"
      aria-hidden="true"
      className={`${className} rounded-full bg-primary-100 text-primary-700 font-semibold flex items-center justify-center shrink-0`}
    >
      {initials(name)}
    </div>
  );
}
