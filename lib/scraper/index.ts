import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export async function scrapeTestudoCourse(url: string) {
    if (!url) return;

    let browser;

    const chromium = require('@sparticuz/chromium')
    // Optional: If you'd like to disable webgl, true is the default.
    chromium.setGraphicsMode = false
    const puppeteer = require('puppeteer-core')
    browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
    });

    // FOR DEVELOPMENT -- UNCOMMENT!
    // const puppeteer = require('puppeteer')
    // browser = await puppeteer.launch({headless: 'new'})

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url);

    // Fetching data
    const courseData = await page.evaluate(() => {

        // Getting all courses in the link
        const courses = Array.from(document.querySelectorAll(".course"));

        // Looping through each course
        const data = courses.map((course) => {

            // Getting name
            const nameElement = course.querySelector(".course-id") as HTMLElement;
            const name = nameElement ? nameElement.innerText.trim() : null;

            // Getting title
            const titleElement = course.querySelector(".course-title") as HTMLElement;
            const title = titleElement ? titleElement.innerText.trim() : null;


            // Getting section information
            const sections = Array.from(document.querySelectorAll(".section-info-container"));



            // Getting array of JSON for each section
            const sectionData = sections.map((section) => {

                // Instructor name
                const instructorElement = section.querySelector(".section-instructor") as HTMLElement;
                const instructor = instructorElement ? instructorElement.innerText.trim() : null;

                // Section number
                const sectionElement = section.querySelector(".section-id") as HTMLElement;
                const sectionId = sectionElement ? sectionElement.innerText.trim() : null;

                // Total Seats count
                const totalSeatElement = section.querySelector(".total-seats-count") as HTMLElement;
                const totalSeats = totalSeatElement ? totalSeatElement.innerText.trim() : null;

                // Open Seats count
                const openSeatElement = section.querySelector(".open-seats-count") as HTMLElement;
                const openSeats = openSeatElement ? openSeatElement.innerText.trim() : null;

                //  Waitlist count (includes holdfile)
                const waitlistElements = Array.from(section.querySelectorAll(".waitlist-count"));
                // Getting values in an array
                const waitlistCounts = waitlistElements.map((element) => {
                    return element instanceof HTMLElement ? parseInt(element.innerText.trim()) : -1;
                });

                // Information for section
                return {
                    instructor: instructor,
                    sectionId: sectionId,
                    totalSeats: totalSeats,
                    openSeats: openSeats,
                    waitlist: waitlistCounts[0],
                    holdfile: ((waitlistCounts).length == 2) ? waitlistCounts[1] : -1
                }
            });

            // return json
            return {
                name: name,
                title: title,
                sections: sectionData
            };
        });

        return data;
    })

    // console.log(courseData);

    await browser.close();

    return courseData;
}