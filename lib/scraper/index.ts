const cheerio = require('cheerio');
const axios = require('axios');
interface SectionData {
    instructor: string;
    sectionId: string;
    totalSeats: string;
    openSeats: string;
    waitlist: number;
    holdfile: number;
}

interface CourseData {
    name: string;
    title: string;
    sections: SectionData[];
}

export async function scrapeTestudoCourse(url: string): Promise<CourseData[]> {
    if (!url) return [];

    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const courses: CourseData[] = [];

        $('.course').each((_: any, course: any) => {
            const nameElement = $(course).find('.course-id');
            const name = nameElement.text().trim();

            const titleElement = $(course).find('.course-title');
            const title = titleElement.text().trim();

            const sections: SectionData[] = [];

            $(course).find('.section-info-container').each((_: any, section: any) => {
                const instructorElement = $(section).find('.section-instructor');
                const instructor = instructorElement.text().trim();

                const sectionElement = $(section).find('.section-id');
                const sectionId = sectionElement.text().trim();

                const totalSeatElement = $(section).find('.total-seats-count');
                const totalSeats = totalSeatElement.text().trim();

                const openSeatElement = $(section).find('.open-seats-count');
                const openSeats = openSeatElement.text().trim();

                const waitlistElements = $(section).find('.waitlist-count');
                const waitlistCounts: number[] = [];
                waitlistElements.each((_: any, waitlistElement: any) => {
                    const count = parseInt($(waitlistElement).text().trim());
                    waitlistCounts.push(isNaN(count) ? -1 : count);
                });

                const sectionData: SectionData = {
                    instructor: instructor,
                    sectionId: sectionId,
                    totalSeats: totalSeats,
                    openSeats: openSeats,
                    waitlist: waitlistCounts[0],
                    holdfile: waitlistCounts.length === 2 ? waitlistCounts[1] : -1
                };

                sections.push(sectionData);
            });

            const courseData: CourseData = {
                name: name,
                title: title,
                sections: sections
            };

            courses.push(courseData);
        });

        return courses;

    } catch (error) {
        console.error('Error scraping:', error);
        return [];
    }
}