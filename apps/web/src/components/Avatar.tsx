type Sized = {
  size: '4xl' | 'xl' | 'lg' | 'md' | 's';
};

type IconProps = {
  imageUrl?: string | null;
  fallback: string;
  alt: string;
} & Sized;

export const Icon: React.FC<IconProps> = ({ imageUrl, alt, fallback, size }) => {
  const sizeStyles = {
    '4xl': 'h-[185px] w-[185px]',
    xl: 'h-14 w-14',
    lg: 'h-10 w-10',
    md: 'h-8 w-8',
    s: 'h-6 w-6',
  };
  return (
    <div className={`mask mask-circle h-12 w-12 ${sizeStyles[size]}`}>
      {imageUrl ? (
        <img src={imageUrl} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="bg-base-100 flex h-full w-full items-center justify-center text-lg font-normal text-gray-600">{fallback}</div>
      )}
    </div>
  );
};

type AvatarProps = {
  imageUrl?: string | null;
  userName: string;
} & Sized;

export const Avatar: React.FC<AvatarProps> = ({ imageUrl, userName, size }) => {
  const getInitials = (name: string): string => {
    const nameArray = name.split(' ');
    return nameArray
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  return <Icon imageUrl={imageUrl ?? null} alt={userName} fallback={getInitials(userName)} size={size} />;
};

type User = {
  image?: string | null;
  name?: string | null;
};

export const UserAvatar = ({ user, size }: { user: User } & Sized) => (
  <Avatar imageUrl={user.image ?? null} userName={user.name ?? 'Anon'} size={size} />
);
