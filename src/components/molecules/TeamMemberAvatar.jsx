import { cn } from "@/utils/cn";

const TeamMemberAvatar = ({ member, size = "md", className }) => {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base"
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = [
      "bg-gradient-to-br from-red-400 to-red-600",
      "bg-gradient-to-br from-blue-400 to-blue-600",
      "bg-gradient-to-br from-green-400 to-green-600",
      "bg-gradient-to-br from-purple-400 to-purple-600",
      "bg-gradient-to-br from-yellow-400 to-yellow-600",
      "bg-gradient-to-br from-pink-400 to-pink-600",
      "bg-gradient-to-br from-indigo-400 to-indigo-600",
      "bg-gradient-to-br from-teal-400 to-teal-600"
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

if (member.avatar_c) {
    return (
      <img
        src={member.avatar_c}
        alt={member.Name}
        className={cn(
          "rounded-full border-2 border-white shadow-lg object-cover",
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-semibold",
sizes[size],
        getAvatarColor(member.Name),
        className
      )}
    >
{getInitials(member.Name)}
    </div>
  );
};

export default TeamMemberAvatar;