# 🧠 Psychological Data Entry & Analysis Platform

This is a **web-based platform** designed to help a psychology researcher manually enter and analyze questionnaire data. It allows users to input **marks for different psychological labels**, applies specific scoring rules based on predefined conditions, and calculates **total scores with category classifications** (e.g., Low, Average, High). 

## 📌 Features
✅ **Manual Data Entry** – Users can enter marks for each label  
✅ **Automatic Score Adjustment** – Adjusts marks based on predefined ID conditions  
✅ **Categorized Total Scores** – Labels are classified into Low, Average, or High  
✅ **PostgreSQL Database Integration** – Stores all data centrally  
✅ **Live Deployment Support** – Can be hosted online for real-time data entry  

---

## 📂 Project Structure
/psychology-analysis-app
│── /views          # EJS templates for frontend (HTML)
│── index.js        # Main server file
│── .env            # Environment variables (DB credentials)
│── README.md       # Project documentation
│── package.json    # Dependencies



---

## 🚀 Getting Started

### **1️⃣ Install Dependencies**
Make sure you have **Node.js** installed, then run:
```sh
npm install
```
# 2️⃣ Setup PostgreSQL Database
✅ Install PostgreSQL and create a database.
✅ Run the following SQL script:
```sh
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    label TEXT NOT NULL,
    marks INT,
    sign TEXT CHECK (sign IN ('+ve', '-ve')) NOT NULL DEFAULT '+ve'
);
```
✅ Update the .env file with your database credentials:
```sh
DATABASE_URL=postgres://user:password@localhost:5432/yourdbname
```
# 3️⃣ Start the Server
Run the following command to start the server:
```sh
node index.js
```
Now open http://localhost:3000/ in your browser.

📩 Need help? Contact kavyamalhotra2903@gmail.com.
🚀 Built with Node.js, Express.js, and PostgreSQL.


---

This is a **clean and minimal README.md** with just the **setup instructions**. Let me know if you need any modifications! 🚀🔥

