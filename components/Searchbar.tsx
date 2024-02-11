"use client"

import { scrapeAndStoreCourse } from "@/lib/actions";
import { FormEvent, useState } from "react";
import { useRouter } from 'next/navigation';

// client side rendering - since we need to handle submit

const isValidTestudoLink = (url:string) => {
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

const Searchbar = () => {

  const [searchPrompt, setSearchPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    // Prevent reload when form is submitted
    event.preventDefault();

    const isValidLink = isValidTestudoLink(searchPrompt);

    if (!isValidLink) {
        return alert("Please provide a valid Testudo link");
    }

    try {
        setIsLoading(true);
        // Scrape the course information
        const data = await scrapeAndStoreCourse(searchPrompt);

       // Redirect to course details page if course is successfully scraped
       if (data) {
        router.push(`/courses/${data.name}?title=${data.title}`);
       } else {
            alert("Failed to scrape course information");
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
            placeholder="Enter link from Testudo"
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
