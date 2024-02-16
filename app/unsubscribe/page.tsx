"use client"
import { removeUserEmailFromCourse } from '@/lib/actions';
import React, { useState } from 'react'

type Props = {
    searchParams: { name: string, section: string, email: string }
};

const page = (url: Props) => {

    const { name: initialName, section: initialSection, email: initialEmail } = url.searchParams;

    const [name, setName] = useState(initialName);
    const [section, setSection] = useState(initialSection);
    const [email, setEmail] = useState(initialEmail);
    let [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await removeUserEmailFromCourse(name.toUpperCase(), email, section);
        setIsSubmitting(false);
    };

    return (
        <div className="flex flex-col justify-center items-center h-screen">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl border-grey border-2 px-8 pt-6 pb-8 mb-4 flex flex-col">
                <h2 className="text-2xl mb-4 font-bold">Unsubscribe</h2>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Email:
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-normal text-base" />
                </label>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Course:
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-normal text-base" />
                </label>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Section:
                    <input type="text" value={section} onChange={e => setSection(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-normal text-base" />
                </label>
                <button type="submit" className='dialog-btn'>{isSubmitting ? 'Submitting...' : 'Submit'}</button>
            </form>
        </div>
    );
}

export default page
