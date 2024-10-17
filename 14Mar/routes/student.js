var express = require('express');
var router = express.Router();
var studentModel = require('../model/student');
var ResHelper = require('../helper/ResponseHandle');
var Validator = require('../validators/user');
const { validationResult } = require('express-validator');

router.get('/', async function (req, res, next) {
    let students = await studentModel.find({}).exec();
    ResHelper.ResponseSend(res, true, 200, students)
  });

  // Add student - POST
router.post('/add', async function (req, res, next) {
    try {
        const { name, age, avatar } = req.body;
        let newStudent = new studentModel({ name, age, avatar });
        await newStudent.save();
        ResHelper.ResponseSend(res, true, 201, 'Student added successfully');
    } catch (error) {
        ResHelper.ResponseSend(res, false, 500, 'Failed to add student');
    }
});

// Edit student - PUT
router.put('/edit/:id', async function (req, res, next) {
    try {
        const studentId = req.params.id;
        const { name, age, avatar } = req.body;

        let updatedStudent = await studentModel.findByIdAndUpdate(studentId, {
            name, age, avatar
        }, { new: true });

        if (updatedStudent) {
            ResHelper.ResponseSend(res, true, 200, 'Student updated successfully');
        } else {
            ResHelper.ResponseSend(res, false, 404, 'Student not found');
        }
    } catch (error) {
        ResHelper.ResponseSend(res, false, 500, 'Failed to update student');
    }
});

// Delete student - DELETE
router.delete('/delete/:id', async function (req, res, next) {
    try {
        const studentId = req.params.id;

        let deletedStudent = await studentModel.findByIdAndDelete(studentId);

        if (deletedStudent) {
            ResHelper.ResponseSend(res, true, 200, 'Student deleted successfully');
        } else {
            ResHelper.ResponseSend(res, false, 404, 'Student not found');
        }
    } catch (error) {
        ResHelper.ResponseSend(res, false, 500, 'Failed to delete student');
    }
});



module.exports = router;
