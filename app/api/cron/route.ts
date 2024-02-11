import Course from "@/lib/models/course.model";
import { scrapeTestudoCourse } from "@/lib/scraper";
import { connectToDB } from "@/lib/scraper/mongoose"
import { sendEmailForSections } from "@/lib/utils";
import { NextResponse } from "next/server";

export const maxDuration = 10; // 10 seconds
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        connectToDB();

        // Get all courses stored in database
        const courses = await Course.find({});
        
        if (!courses) throw new Error("No Courses Found!");

        // 1. Scrape and update course information
        const updatedCourses = await Promise.all(
            courses.map(async (currentCourse) => {
                const scrapedCourse = await scrapeTestudoCourse(currentCourse.link);

                if (!scrapedCourse) throw new Error("No Course Found when scraping");
                
                // ONLY WORKING WITH FIRST ELEMENT IN THE ARRAY
                let courseData = scrapedCourse[0];

                // Iterate through sections array
                let updatedSections = currentCourse.sections.map((section: any) => {

                    // Find matching section by sectionId
                    const matchingSection = courseData.sections.find(newSection => newSection.sectionId === section.sectionId);
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
                courseData.sections.forEach(newSection => {
                    const existingSection = currentCourse.sections.find((section: any) => section.sectionId === newSection.sectionId);
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

                // I have two objects updatedSections and currentCourse.sections
                // I need to compare what has changed (Getting status for email to send)
                sendEmailForSections(currentCourse, updatedSections, currentCourse.sections);

                // Update the course document with the updated sections
                currentCourse.sections = updatedSections;
                await currentCourse.save();
                
                // This is the updated information for current course
                return currentCourse;
            })
        )

        return NextResponse.json({
            message: 'Ok', data: updatedCourses
        })

    } catch (error) {
        throw new Error(`Error in GET: ${error}`)
    }
}