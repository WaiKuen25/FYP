This is a student final year project using react and node.js based website.

# To Start the project:
1. npm install both frontend and backend 
2. create a mysql database use name "vtcforum" and import file from backupSQL
3. npm run dev to start frontend
4. npm run start to start backend

# Some code may not be work due to these problem 
1. MongoDB configuration
check .env file about mongodbURL
This project use mongodb to do userfig configuration such as user preference like theme mode, follow category Id or ban users, etc.
2. Python summary function
Due to large size of the model i have deleted the library of summary model you may run the python file once.

3. Gmail verify problem
The project use email to send verify email to the register user ask them for verification.
You may have to register a email for the system and rewrite in .env file.

# Some Demo of the project
![Index](/demo/index.png)
![Index](/demo/post.png)
![Index](/demo/login.png)
![Index](/demo/userprofile.png)