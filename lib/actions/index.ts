"use server"
// Only runs on the hosted server

import Course from "../models/course.model";
import { generateEmailBody, sendEmail } from "../nodemailer";
import { scrapeTestudoCourse } from "../scraper";
import { connectToDB } from "../scraper/mongoose";

export async function scrapeAndStoreCourse(courseUrl: string) {
    if (!courseUrl) return;

    try {

        connectToDB();

        // Get data from Testudo
        const scrapeCourse = await scrapeTestudoCourse(courseUrl);

        // Did not get any scraped data
        if (!scrapeCourse || scrapeCourse.length == 0) return;

        // ONLY WORKING WITH FIRST ELEMENT IN THE ARRAY
        let courseData = scrapeCourse[0];

        const existingCourseData = await Course.findOne({ name: courseData.name });

        // If data is already present
        if (existingCourseData) {
            // Iterate through sections array
            let updatedSections = existingCourseData.sections.map((section: any) => {
                // Find matching section by sectionId
                const matchingSection = courseData.sections.find((newSection: any) => newSection.sectionId === section.sectionId);
                if (matchingSection) {
                    // Section exists, update waitlist, holdfile
                    section.waitlistHistory.push({ waitlistCount: matchingSection.waitlist, date: new Date() });
                    section.openSeatHistory.push({ openCount: matchingSection.openSeats, date: new Date() });
                    section.holdFileHistory.push({ holdFileCount: matchingSection.holdfile, date: new Date() });
                    return section;
                } else {
                    // Section doesn't exist, return existing section
                    return section;
                }
            });

            // Add new sections to the existing course
            courseData.sections.forEach((newSection: any) => {
                const existingSection = existingCourseData.sections.find((section: any) => section.sectionId === newSection.sectionId);
                // Does not exist in the existing section
                if (!existingSection) {
                    updatedSections.push({
                        instructor: newSection.instructor,
                        sectionId: newSection.sectionId,
                        totalSeats: newSection.totalSeats,
                        waitlistHistory: [{ waitlistCount: newSection.waitlist, date: new Date() }],
                        openSeatHistory: [{ openCount: newSection.openSeats, date: new Date() }],
                        holdFileHistory: [{ holdFileCount: newSection.holdfile, date: new Date() }]
                    });
                }
            });

            // Remove sections not found in the updated scraped data
            updatedSections = updatedSections.filter((section: any) => {
                const matchingSection = courseData.sections.find((newSection: any) => newSection.sectionId === section.sectionId);
                return matchingSection !== undefined; // Keep existing section if it's found in the scraped data
            });

            // Update the course document with the updated sections
            existingCourseData.sections = updatedSections;
            await existingCourseData.save();
        } else {
            // If course data does not exist, create a new course
            let existingCourseData = new Course({
                link: courseUrl,
                name: courseData.name,
                title: courseData.title,
                sections: courseData.sections.map((section: any) => ({
                    instructor: section.instructor,
                    sectionId: section.sectionId,
                    totalSeats: section.totalSeats,
                    waitlistHistory: [{ waitlistCount: section.waitlist, date: new Date() }],
                    openSeatHistory: [{ openCount: section.openSeats, date: new Date() }],
                    holdFileHistory: [{ holdFileCount: section.holdfile, date: new Date() }]
                }))
            });

            // Save the new course data to the database
            await existingCourseData.save();
        }
        return {
            name: courseData.name,
            title: courseData.title
        }

    } catch (error: any) {
        throw new Error(`Failed to create/update course information: ${error.message}`)
    }
}


export async function getCourseByName(courseName: string) {
    try {
        connectToDB();

        const course = await Course.findOne({ name: courseName });

        if (!course) return null;

        return course;
    } catch (error) {
        console.log(error)
    }
}

export async function getAllCourses(courseName: string) {
    try {
        connectToDB();

        const courses = await Course.find();
        return courses;

    } catch (error) {
        console.log(error)
    }
}

export async function addUserEmailToCourse(courseName: string, userEmail: string, sectionNumber: string) {
    try {
        const course = await getCourseByName(courseName);

        if (!course) return;

        const sectionIndex = course.sections.findIndex((section: any) => section.sectionId === sectionNumber);

        // Checking if user is present
        const userExists = (course.sections[sectionIndex]).users.some((user: any) => user.email === userEmail);

        if (!userExists) {
            // Update the section with new user
            (course.sections[sectionIndex]).users.push({ email: userEmail });
            await course.save();

            const courseInfo = {
                name: course.name,
                title: course.title,
                sectionNumber: sectionNumber,
                waitlistCount: (course.sections[sectionIndex]).waitlistHistory[(course.sections[sectionIndex]).waitlistHistory.length - 1].waitlistCount,
                openCount: (course.sections[sectionIndex]).openSeatHistory[(course.sections[sectionIndex]).openSeatHistory.length - 1].openCount,
                holdFileCount: (course.sections[sectionIndex]).holdFileHistory[(course.sections[sectionIndex]).holdFileHistory.length - 1].holdFileCount,
                prevWaitlistCount: -1,
                prevOpenCount: -1,
                prevHoldFileCount: -1,
            }

            const emailContent = await generateEmailBody(courseInfo, "WELCOME");

            await sendEmail(emailContent, [userEmail]);
        }

    } catch (error) {
        console.log(error);
    }
}

export async function removeUserEmailToCourse(courseName: string, userEmail: string, sectionNumber: string) {
    try {
        const course = await getCourseByName(courseName);

        if (!course) return;

        const sectionIndex = course.sections.findIndex((section: any) => section.sectionId === sectionNumber);

        // Checking if user is present
        const userIndex = (course.sections[sectionIndex]).users.findIndex((user: any) => user.email === userEmail);

        if (userIndex !== -1) {
            // Remove user from the section
            // Splice removes starting at the first index
            // So we have removed the userIndex
            (course.sections[sectionIndex]).users.splice(userIndex, 1);
            await course.save();
        }

    } catch (error) {
        console.log(error);
    }
}

export async function isCoursePresent(courseName: string): Promise<boolean> {
    try {
        connectToDB();

        const courseExists = await Course.exists({ name: courseName });

        if (courseExists === null) {
            // Handle the case where courseExists is null
            return false;
        }

        return true;
    } catch (error) {
        return false; // Return false if an error occurs
    }
}
