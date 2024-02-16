import { connectToDB } from "@/lib/scraper/mongoose"
import { NextResponse } from "next/server";

export async function GET() {
    try {
        connectToDB();

        return NextResponse.json({
            message: 'Ok'
        });
    } catch (error) {
        throw new Error(`Error in GET: ${error}`)
    }
}