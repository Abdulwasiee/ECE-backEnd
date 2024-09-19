const studentService = require("../Services/student.service");

const addStudent = async (req, res) => {
  const result = await studentService.addStudent(req.body);
  return res.json(result);
};

const getStudentsByBatch = async (req, res) => {
  let batch_id;
  if (req.user.role_id == 5) {
    batch_id = req.user.batch_ids[0];
  } else {
    batch_id = req.params.batch_id;
  }

  const result = await studentService.getStudentsByBatch(batch_id);
  return res.json(result);
};

const deleteStudent = async (req, res) => {
  const { student_id } = req.params;
  const result = await studentService.deleteStudent(student_id);
  return res.json(result);
};

module.exports = {
  addStudent,
  getStudentsByBatch,
  deleteStudent,
};
