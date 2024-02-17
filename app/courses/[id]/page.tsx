import Modal from '@/components/Modal';
import { getCourseByName } from '@/lib/actions';
import { redirect } from 'next/navigation';
import React from 'react';

// Can add search params here
type Props = {
    params: { id: string }
};

function convertToEST(date: any) {
    // EST
    const offset = -5.0;

    const clientDate = new Date(date);
    const utc = clientDate.getTime() + (clientDate.getTimezoneOffset() * 60000);

    const serverDate = new Date(utc + (3600000 * offset));

    return serverDate.toLocaleString();
}

const CourseDetails = async (url: Props) => {
    const name = url.params.id;
    // console.log(url); -- look for search params
    const course = await getCourseByName(name);

    if (!course) redirect('/');

    return (
        <div className="product-container">
            <div>
                <h1 className="text-[28px] text-secondary font-semibold">{course.name}</h1>
                <h1 className="text-[24px] text-secondary font-semibold italic">{course.title}</h1>
                <h1 className="text-[16px] text-secondary font italic">{course.sections.length > 0 && course.sections[0].waitlistHistory.length > 0 ? `(Last Updated: ${convertToEST(course.sections[0].waitlistHistory[course.sections[0].waitlistHistory.length - 1].date)})` : ''}</h1>
            </div>
            {course.sections.map((section: any, index: any) => (
                <div key={index} className="section-box">
                    <p className="text-[18px]">Instructor: {section.instructor}</p>
                    <p className="text-[18px]">Section Number: {section.sectionId}</p>
                    <div>
                        <p className="text-[18px]">Total Seats: {section.totalSeats}</p>
                        <p className="text-[18px]">Open Seats: {section.openSeatHistory[section.openSeatHistory.length - 1].openCount}</p>
                        <p className="text-[18px]">Waitlist Seats: {section.waitlistHistory[section.waitlistHistory.length - 1].waitlistCount}</p>
                        <p className="text-[18px]">Holdfile Seats: {section.holdFileHistory[section.holdFileHistory.length - 1].holdFileCount !== -1 ? section.holdFileHistory[section.holdFileHistory.length - 1].holdFileCount : "N/A"}</p>
                    </div>
                    <div className='pt-5'>
                        <Modal courseName={course.name} sectionNumber={section.sectionId} />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default CourseDetails
