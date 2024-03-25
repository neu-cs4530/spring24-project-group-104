

## Local testing setup
To create postgres instance on docker, run this command: 

`docker run --name postgres-container -e POSTGRES_PASSWORD=password123 -e POSTGRES_DB=mydb -p 5432:5432 -d postgres `

To access the instance, set this are your DATABASE_URL: `"postgresql://postgres:password123@localhost:5432/mydb"`

*** When testing locally, be sure to remove / comment out the `DIRECT_URL` in the schema.prisma file. 

While the instance is running, you can use the command `npx prisma studio` to open up the GUI for your local database