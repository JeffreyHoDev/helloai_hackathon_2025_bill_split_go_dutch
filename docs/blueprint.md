# **App Name**: Claim It!

## Core Features:

- User Login: User Authentication: Implement login functionality with username/password input fields and a 'Sign in with Google' OAuth option.
- Main Page Layout: Main Page: After login, display a top sidebar with the user's username/email, a 'Friend List' button, and a 'Logout' button.
- Friend List Management: Friend Management: Allow users to add/remove friends using a search and add feature or view their current friends list in a modal or separate page.
- Item Cards: Receipt Item Display: Display receipt items in a grid of cards, each showing an image, title, total payable amount, and remaining payable balance.
- Data Storage (No Database): User and Item Persistence: Maintain user data and receipt item details, potentially leveraging local storage, cookies or session storage to simulate user persistence without a database.
- Claiming Feature: Claim Feature: Let user to claim each items on the cards, will change the card status to claimed after click the claim button

## Style Guidelines:

- Primary color: Use a vibrant blue (#29ABE2) to convey trust and clarity in financial interactions.
- Background color: Light gray (#F5F5F5) to provide a clean and neutral backdrop, ensuring readability and focus on content.
- Accent color: A vivid green (#90EE90) is used for indicating available items or successful claims.
- Font choice: 'Inter' sans-serif for both headers and body text.
- Code font: 'Source Code Pro' monospaced for potential code snippets.
- Use simple, outline-style icons from a set like Material Icons for common actions (add friend, logout, claim, etc.) to maintain a clean and modern interface.
- Grid-based layout with clearly defined sections for the sidebar, item cards, and modals to create a structured and intuitive user experience.