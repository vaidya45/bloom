import React from 'react'
import Image from 'next/image'
import Searchbar from "@/components/Searchbar";

const Home = () => {
  return (
    <>
      {/* can add border as well */}
      <section className='px-6 md:px-20 py-24 '>
        {/* Display more like a tablet */}
        {/* flex max-xl:flex-col gap=16 */}
        <div className='flex flex-col gap=16'> 
          <div className='flex flex-col justify-center'>
            <p className='small-text'>
              Find courses here!
              <Image 
                src="/assets/icons/arrow-right.svg"
                alt="arrow-right"
                width={16}
                height={16}
              />
            </p>

            <p className='text-lg font-semibold'>
              Track Course Information from
              <span className='text-primary'> Testudo</span>
            </p>

            <p className='mt-6 italic'>
              Copy the course URL from Testudo and enter it below
            </p>

            <Searchbar />
          </div>
 
        </div>

      </section>
    </>
  )
}

export default Home
