import { User } from '@/state/api';
// import Image from 'next/image';
// import p3 from '../../../public/p3.jpeg';

type Props = {
  user: User;
};

const UserCard = ({ user }: Props) => {
  return (
    <div className='flex items-center rounded border p-4 shadow'>
      {/* {user.profilePictureUrl && (
        <Image
          src={p3}
          alt='profile picture'
          width={32}
          height={32}
          className='rounded-full'
        />
      )} */}
      <div>
        <h3>{user.username}</h3>
        <p>{user.email}</p>
      </div>
    </div>
  );
};

export default UserCard;
