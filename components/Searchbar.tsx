"use client"

import { scrapeAndStoreCourse } from "@/lib/actions";
import { FormEvent, useState } from "react";
import { useRouter } from 'next/navigation';

// client side rendering - since we need to handle submit

const termMap = {
    SPRING_SEMESTER: "01",
    SUMMER_SEMESTER: "05",
    FALL_SEMESTER: "08",
    WINTER_SEMESTER: "12"
};

const CURRENT_TERM = termMap.SPRING_SEMESTER;
const CURRENT_YEAR = "2024";

function replaceCourseId(courseId: string): string {
    const REPLACE_VALUE = "REPLACE_VALUE";
    const urlTemplate = `https://app.testudo.umd.edu/soc/search?courseId=${REPLACE_VALUE}&sectionId=&termId=${CURRENT_YEAR + CURRENT_TERM}&_openSectionsOnly=on&creditCompare=&credits=&courseLevelFilter=ALL&instructor=&_facetoface=on&_blended=on&_online=on&courseStartCompare=&courseStartHour=&courseStartMin=&courseStartAM=&courseEndHour=&courseEndMin=&courseEndAM=&teachingCenter=ALL&_classDay1=on&_classDay2=on&_classDay3=on&_classDay4=on&_classDay5=on`;

    return urlTemplate.replace(REPLACE_VALUE, courseId);
}

function isValidCourseId(courseId: string): boolean {
    const courseIdPattern = /^[A-Za-z]{4}\d{3}[A-Za-z]?$/
    return courseIdPattern.test(courseId);
}

function removeWhitespaceAndLowerCase(input: string): string {
    return input.replace(/\s/g, '').toLowerCase();
}

const isValidTestudoLink = (url: string) => {
    try {
        const parsedURL = new URL(url);
        const hostname = parsedURL.hostname;

        // check if hostname is from testudo
        if (hostname.includes('app.testudo.umd.edu')) {
            return true;
        }

    } catch (error) {
        return false;
    }
    return false;
}

function checkTermId(url: string): boolean {
    try {
        const parsedURL = new URL(url);
        const termId = parsedURL.searchParams.get('termId');
        if (!termId) return false; // TermId not found in the URL

        // Extract year and term from termId
        const year = termId.slice(0, 4);
        const term = termId.slice(4, 6);

        // Check if extracted year and term match with CURRENT_YEAR and CURRENT_TERM
        return year === CURRENT_YEAR && term === CURRENT_TERM;
    } catch (error) {
        return false;
    }
}

const Searchbar = () => {

    const [searchPrompt, setSearchPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        // Prevent reload when form is submitted
        event.preventDefault();

        const isValidLink = isValidTestudoLink(searchPrompt);

        const removeSpacesAndLowercase = removeWhitespaceAndLowerCase(searchPrompt);
        const testCourseId = isValidCourseId(removeSpacesAndLowercase);

        if (!isValidLink && !testCourseId) {
            return alert("Please provide a valid Testudo link or Course Name");
        }

        // Link to scrape
        let link;

        if (isValidLink) {
            link = searchPrompt;

            // Not from the current term
            if (!checkTermId(link)) {
                return alert("Please provide a link for the current term");
            }

        } else {
            link = replaceCourseId(removeSpacesAndLowercase);
        }

        try {
            setIsLoading(true);
            // Scrape the course information
            const data = await scrapeAndStoreCourse(link);

            // Redirect to course details page if course is successfully scraped
            if (data) {
                router.push(`/courses/${data.name}?title=${data.title}`);
            } else {
                alert("Failed to scrape course information, verify input!");
            }


        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }

    };

    return (
        <form
            className='flex flex-wrap gap-4 mt-12'
            onSubmit={handleSubmit}
        >
            <input
                type="text"
                placeholder="Enter course name or link"
                className="searchbar-input"
                value={searchPrompt}
                onChange={(e) => setSearchPrompt(e.target.value)}
            />
            <button
                type="submit"
                className="searchbar-btn"
                disabled={searchPrompt === ''}
            >
                {isLoading ? "Searching..." : "Search"}
            </button>
        </form>
    )
}

export default Searchbar
