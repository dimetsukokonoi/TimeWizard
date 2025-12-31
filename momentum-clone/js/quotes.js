/**
 * Quotes Module
 * Daily motivational quotes with refresh
 */

const Quotes = {
    quotes: [
        { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
        { text: "It is not the mountain we conquer, but ourselves.", author: "Edmund Hillary" },
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
        { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
        { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
        { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
        { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
        { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
        { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
        { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
        { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
        { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
        { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
        { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
        { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
        { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
        { text: "Act as if what you do makes a difference. It does.", author: "William James" },
        { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
        { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
        { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
        { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
        { text: "If you want to lift yourself up, lift up someone else.", author: "Booker T. Washington" },
        { text: "A person who never made a mistake never tried anything new.", author: "Albert Einstein" },
        { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
        { text: "The mind is everything. What you think you become.", author: "Buddha" },
        { text: "Happiness is not something ready-made. It comes from your own actions.", author: "Dalai Lama" },
        { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
        { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
        { text: "Go confidently in the direction of your dreams. Live the life you have imagined.", author: "Henry David Thoreau" },
        { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
        { text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.", author: "Stephen Covey" },
        { text: "It's not about having time, it's about making time.", author: "Unknown" },
        { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
        { text: "Your focus determines your reality.", author: "Qui-Gon Jinn" },
        { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
        { text: "The difference between ordinary and extraordinary is that little extra.", author: "Jimmy Johnson" },
        { text: "Dream big. Start small. Act now.", author: "Robin Sharma" },
        { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
        { text: "One day or day one. You decide.", author: "Unknown" }
    ],
    textElement: null,
    authorElement: null,
    refreshBtn: null,
    currentIndex: 0,

    init() {
        this.textElement = document.getElementById('quoteText');
        this.authorElement = document.getElementById('quoteAuthor');
        this.refreshBtn = document.getElementById('quoteRefresh');

        this.currentIndex = this.getDayOfYear() % this.quotes.length;
        this.display();
        this.bindEvents();
    },

    bindEvents() {
        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', () => this.refresh());
        }
    },

    display() {
        const quote = this.quotes[this.currentIndex];
        this.textElement.textContent = `"${quote.text}"`;
        this.authorElement.textContent = `— ${quote.author}`;
    },

    refresh() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.quotes.length);
        } while (newIndex === this.currentIndex && this.quotes.length > 1);

        this.currentIndex = newIndex;
        this.display();

        // Add animation
        this.textElement.style.opacity = '0';
        this.authorElement.style.opacity = '0';

        setTimeout(() => {
            this.textElement.style.opacity = '1';
            this.authorElement.style.opacity = '1';
        }, 100);
    },

    getDayOfYear() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }
};
