import Link from 'next/link';
import Room from './components/Room';


export default function Home() {
  return (
    <>
    <Room />
    <div className='flex flex-row justify-between'>

      {/* <Link href='/chess' className='w-[33vw] text-center'>CHESSBOARD</Link>
      <Link href='/about' className='w-[33vw] text-center'>ABOUT</Link>
      <Link href='/military' className='w-[33vw] text-center'>MILITARYEXPERIENCE</Link> 
       */}
    </div>
    </>
  );
}
