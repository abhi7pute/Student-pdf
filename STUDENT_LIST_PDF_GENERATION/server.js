const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const pdf = require("pdf-creator-node");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://127.0.0.1:27017/studentDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Database is connected successfully");
}).catch(() => {
    console.log("Error connecting to database");
})

const studentSchema = mongoose.Schema({
    name: String,
    age: Number,
    phone: Number,
    address: String
});

const Student = mongoose.model("Student", studentSchema);
const templatePath = path.join(__dirname, "/views/studentList.ejs");

app.get("/generatepdf", async (req, res) => {
    try {
        const students = await Student.find();

        const templateHtml = fs.readFileSync(templatePath, "utf-8");

        const options = {
            format: "A3",
            orientation: "portrait",
            border: "10mm"
        };

        const templateData = {
            students: students.map(student => ({
                name: student.name,
                age: student.age,
                phone: student.phone,
                address: student.address
            }))
        };

        
        const content = ejs.render(templateHtml, templateData);

        const document = {
            html: content,
            path: "./output.pdf",
            type: ""
        };
        pdf.create(document, options)
            .then(() => {
                console.log("PDF generated successfully");
            })
            .catch((error) => {
                console.error("Error generating PDF:", error);
            });

        res.status(200).send("PDF generation initiated");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error generating PDF");
    }
});

app.get("/studentlist.pdf",(req,res)=>{
    res.sendFile(__dirname+"/output.pdf")
})

app.get("/", async (req, res) => {
    try {
        const students = await Student.find();
        res.render("studentList", { students });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching students from the backend");
    }
});

app.listen(3000, () => {
    console.log("Server is started on port 3000");
});