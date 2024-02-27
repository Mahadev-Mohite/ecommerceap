# Prisma-orm trial

trying out basic functionalities of prisma orm.

## Installation

1. *Clone the repository:*

    bash
    git clone <repository_url>
    cd project-directory
    

2. *Install dependencies:*

    bash
    npm install
    

3. *Set up Environment Variables:*

    Create a .env file in the root directory of the project and add the following environment variables:

    plaintext
    DATABASE_URL="your_database_connection_url"
    

    Replace "your_database_connection_url" with the URL of your database connection.

## Database Migration

To apply database migrations, run the following command:

```bash
npx prisma migrate dev

## Routes

- GET /: Seeds the data to the database.
- GET /get-all: Get all data of the table specified.
- GET /statistics/:month: Get statistics of the month.
- GET /serach-month/:page/:month: search items with month and page for pagination.
- GET /search/:page/:month/:title/:description/:price: Search items with page,month,title,description and price.
- GET /barchart/:month: get barchart data for month.
- GET /piechart/:month: get piechart data for month.
- GET /fetch-all/:month: get statistics,barchart and piechart data for a month.
