export type PriceHistoryItem = {
    price: number;
};

export type User = {
    email: string;
};

export type Product = {
    _id?: string;
    url: string;
    currency: string;
    image: string;
    title: string;
    currentPrice: number;
    originalPrice: number;
    priceHistory: PriceHistoryItem[] | [];
    highestPrice: number;
    lowestPrice: number;
    averagePrice: number;
    discountRate: number;
    description: string;
    category: string;
    reviewsCount: number;
    stars: number;
    isOutOfStock: Boolean;
    users?: User[];
};

export type NotificationType =
    | "WELCOME"
    | "CHANGE_OF_WAITLIST"
    | "CHANGE_OF_HOLDFILE"
    | "CHANGE_OF_OPEN_SEAT"
    | "WAITLIST_THRESHOLD_MET"
    | 'SECTION_DELETED';

export type EmailContent = {
    subject: string;
    body: string;
};

export type EmailCourseInfo = {
    name: string;
    title: string;
    sectionNumber: string;
    waitlistCount: Number,
    openCount: Number,
    holdFileCount: Number,
    prevWaitlistCount: Number,
    prevOpenCount: Number,
    prevHoldFileCount: Number
};