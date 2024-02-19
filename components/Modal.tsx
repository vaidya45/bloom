"use client"

import React, { FormEvent, Fragment } from 'react'
import { useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Image from 'next/image'
import { addUserEmailToCourse } from '@/lib/actions'
import { useRouter } from 'next/navigation'

interface Props {
    courseName: string,
    sectionNumber: string
}

const Modal = ({ courseName, sectionNumber }: Props) => {
    let [isOpen, setIsOpen] = useState(false);
    let [isSubmitting, setIsSubmitting] = useState(false);
    let [email, setEmail] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        // Don't want to reload the page
        e.preventDefault();
        setIsSubmitting(true);

        await addUserEmailToCourse(courseName, email, sectionNumber);

        setIsSubmitting(false);
        setEmail('');
        closeModal();
        router.refresh();
    };

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    return (
        <>
            <button type='button' className='btn' onClick={openModal}>
                Track
            </button>

            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" onClose={closeModal} className="dialog-container">
                    <div className='min-h-screen px-4 text-center'>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom='opacity-0'
                            enterTo='opacity-100'
                            leave='ease-in duration-200'
                            leaveFrom='opacity-100'
                            leaveTo='opacity-0'
                        >
                            <Dialog.Overlay className="fixed inset-0" />
                        </Transition.Child>

                        {/* Centering the modal on the screen */}
                        <span
                            className='inline-block h-screen align-middle'
                            aria-hidden='true'
                        />

                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom='opacity-0 scale-95'
                            enterTo='opacity-100 scale-100'
                            leave='ease-in duration-200'
                            leaveFrom='opacity-100 scale-100'
                            leaveTo='opacity-0 scale-95'
                        >
                            <div className='dialog-content'>
                                <div className='flex flex-col'>
                                    <div className='flex justify-between'>
                                        <div className='p-3 rounded-10'>
                                            <Image
                                                src="/assets/icons/bloom.svg"
                                                alt="logo"
                                                width={28}
                                                height={28}
                                            />
                                        </div>
                                        <Image
                                            src="/assets/icons/x-close.svg"
                                            alt="close"
                                            width={24}
                                            height={24}
                                            className='cursor-pointer'
                                            onClick={closeModal}
                                        />
                                    </div>

                                    <h4 className='dialog-head_text'>
                                        Track this course right in your inbox!
                                    </h4>

                                    <p className='text-sm text-gray-600 mt-2'>
                                        Information about waitlist, and much more..
                                    </p>

                                </div>

                                <form className='flex flex-col mt-5' onSubmit={handleSubmit}>
                                    <label htmlFor='email' className='text-sm font-medium text-gray-700'>
                                        Email Address
                                    </label>
                                    <div className='dialog-input_container'>
                                        <Image
                                            src="/assets/icons/mail.svg"
                                            alt="mail"
                                            width={18}
                                            height={18}
                                        />
                                        <input
                                            required
                                            type='email'
                                            id='email'
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder='Enter your email address'
                                            className='dialog-input'
                                        />
                                    </div>

                                    <button type='submit'
                                        className='dialog-btn'
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit'}
                                    </button>
                                </form>
                            </div>

                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}

export default Modal
